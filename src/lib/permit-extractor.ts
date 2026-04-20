/**
 * Permit extractor — fetches the latest PDF from a jurisdiction's index page,
 * extracts text via `unpdf`, asks Claude Sonnet 4.6 to parse + score every permit
 * against Triple J's wheelhouse (Filter B: <$500K, pole barn / ag / small commercial
 * accessory / auto-storage / carport / garage — NOT large industrial PEMB).
 */

import Anthropic from '@anthropic-ai/sdk';
import { extractText, getDocumentProxy } from 'unpdf';
import { z } from 'zod';
import type { PermitSource } from './permit-sources';

// ── Fetch latest PDF URL from a Revize/Joomla index page ──────────────────────

export type LatestPdf = {
  pdfUrl: string;
  // Best-effort parse of a date from the filename (e.g. Weekly-Permit-Report-04-15-2026.pdf)
  reportDate: Date | null;
};

export async function fetchLatestPdfUrl(
  source: PermitSource
): Promise<LatestPdf | null> {
  const res = await fetch(source.indexUrl, {
    headers: {
      // Some municipal CMSes 403 default fetch UAs.
      'User-Agent':
        'Mozilla/5.0 (compatible; TripleJLeadBot/1.0; +https://triplejmetaltx.com)',
    },
  });

  if (!res.ok) {
    throw new Error(
      `Index fetch failed for ${source.jurisdiction}: ${res.status} ${res.statusText}`
    );
  }

  const html = await res.text();

  const hrefs = new Set<string>();
  for (const match of html.matchAll(source.pdfHrefPattern)) {
    hrefs.add(match[1]);
  }

  if (hrefs.size === 0) return null;

  const baseUrl = source.baseUrl ?? new URL(source.indexUrl).origin;
  const indexDir = source.indexUrl.substring(
    0,
    source.indexUrl.lastIndexOf('/') + 1
  );

  // Filter to report-like PDFs (reduces noise: ignore forms, policies, etc.)
  const candidates = [...hrefs]
    .map(h => ({
      href: h,
      resolved: resolveUrl(h, baseUrl, indexDir),
      date: inferDateFromPath(h),
    }))
    .filter(c => looksLikeReport(c.href, source));

  if (candidates.length === 0) return null;

  // Sort: most recent filename-date first, fall back to order-on-page (first wins).
  candidates.sort((a, b) => {
    if (a.date && b.date) return b.date.getTime() - a.date.getTime();
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });

  const best = candidates[0];
  return { pdfUrl: best.resolved, reportDate: best.date };
}

function resolveUrl(href: string, origin: string, dir: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/')) return origin + href;
  return dir + href;
}

function inferDateFromPath(href: string): Date | null {
  // Matches 04-15-2026, 04_15_2026, 2026-04-15, April-15-2026
  const numeric = href.match(/(\d{1,2})[-_\/](\d{1,2})[-_\/](\d{4})/);
  if (numeric) {
    const [, m, d, y] = numeric;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    if (!Number.isNaN(date.getTime())) return date;
  }
  const iso = href.match(/(\d{4})[-_\/](\d{1,2})[-_\/](\d{1,2})/);
  if (iso) {
    const [, y, m, d] = iso;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

function looksLikeReport(href: string, source: PermitSource): boolean {
  const lower = href.toLowerCase();
  if (source.reportType === 'weekly_permits') {
    return /permit|weekly|monthly|report/.test(lower);
  }
  if (source.reportType === 'commissioners_court') {
    return /commissioner|court|agenda|packet/.test(lower);
  }
  if (source.reportType === 'edr') {
    return /economic|edr|development|permit/.test(lower);
  }
  return true;
}

// ── Claude extraction ─────────────────────────────────────────────────────────

export const extractedLeadSchema = z.object({
  permit_number: z.string().nullable(),
  permit_type: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  zip: z.string().nullable(),
  description: z.string().nullable(),
  valuation: z.number().nullable(),
  wheelhouse_score: z.number().int().min(1).max(10),
  wheelhouse_reasons: z.array(z.string()),
  raw_source_text: z.string(),
});

export type ExtractedLead = z.infer<typeof extractedLeadSchema>;

const EXTRACTION_MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You are a lead-extraction specialist for Triple J Metal Buildings, a family-owned Central Texas contractor that builds welded OR bolted red-iron metal structures: carports, garages, barns, RV/boat covers, equipment covers, metal porches, lean-to patios, house additions, small commercial accessory buildings, pole barns, and auto/storage shops.

Your job: read a municipal permit report or commissioners-court agenda and return a JSON array of EVERY construction permit or plat you find. For each, score it 1-10 against Triple J's wheelhouse (Filter B).

## Wheelhouse (high score — 7-10)
- Carports, metal garages, barns, RV/boat covers, equipment covers
- Pole barns, ag buildings, loafing sheds, arena covers
- Small commercial accessory structures (<$500K): auto shops, detail bays, small warehouse/storage <5,000 sqft
- Metal porches, lean-to patios, house additions (attached metal structures)
- Anything explicitly PEMB / pre-engineered metal building under $500K valuation
- New construction of residential/commercial accessory structures

## Weak fit (4-6)
- Medium commercial PEMB $500K-$1M (Triple J can subcontract slab/erection only)
- Barndominiums (hybrid residential; marginal fit)
- Unclear descriptions that might be metal

## NOT a fit (1-3)
- Single-family residential houses (stick-frame/masonry)
- Large industrial warehouses >$500K
- Roads, utilities, infrastructure
- Demolition, electrical-only, plumbing-only, HVAC-only, roof-replacement-only
- Non-metal construction (brick, wood-frame, concrete-only)

## Output contract

Return ONLY a valid JSON array. No prose, no markdown fences. Schema per element:

{
  "permit_number": string | null,
  "permit_type": string | null,
  "address": string | null,
  "city": string | null,
  "zip": string | null,
  "description": string | null,
  "valuation": number | null,       // USD, numeric only
  "wheelhouse_score": number,        // integer 1-10
  "wheelhouse_reasons": string[],    // 1-3 terse bullets explaining the score
  "raw_source_text": string          // exact text chunk this record came from (for audit)
}

If the PDF contains zero construction permits (e.g. an agenda cover page, a policy document), return [].

Be aggressive about parsing — Texas municipal PDFs are messy. Infer city from context when not explicit. Strip "$" and commas from valuation.`;

export async function extractLeadsFromPdf(
  pdfBuffer: ArrayBuffer,
  source: PermitSource
): Promise<ExtractedLead[]> {
  // Step 1 — extract text from the PDF
  const pdf = await getDocumentProxy(new Uint8Array(pdfBuffer));
  const { text } = await extractText(pdf, { mergePages: true });

  const pdfText = Array.isArray(text) ? text.join('\n') : text;
  if (!pdfText || pdfText.trim().length < 100) return [];

  // Truncate extremely long PDFs to keep token cost bounded.
  // 200k chars ≈ 50k tokens — well under Sonnet 4.6's context window.
  const MAX_CHARS = 200_000;
  const truncated =
    pdfText.length > MAX_CHARS
      ? pdfText.slice(0, MAX_CHARS) + '\n\n[TRUNCATED]'
      : pdfText;

  // Step 2 — Claude
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userPrompt = `Source: ${source.label}
Report type: ${source.reportType}
Jurisdiction: ${source.jurisdiction}

--- BEGIN PDF TEXT ---
${truncated}
--- END PDF TEXT ---

Return the JSON array now.`;

  const response = await anthropic.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: 8_000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  // Step 3 — parse + validate
  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') return [];

  const raw = stripCodeFence(textBlock.text.trim());

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(
      `[permit-extractor] JSON parse failed for ${source.jurisdiction}:`,
      err,
      '\nRaw:',
      raw.slice(0, 500)
    );
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const validated: ExtractedLead[] = [];
  for (const item of parsed) {
    const result = extractedLeadSchema.safeParse(item);
    if (result.success) {
      validated.push(result.data);
    } else {
      console.warn(
        `[permit-extractor] Dropped invalid record for ${source.jurisdiction}:`,
        result.error.issues
      );
    }
  }

  return validated;
}

function stripCodeFence(text: string): string {
  // Claude occasionally wraps output in ```json ... ``` despite instructions.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return fenced ? fenced[1].trim() : text;
}

export { EXTRACTION_MODEL };
