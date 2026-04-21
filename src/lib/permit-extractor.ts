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
  // null when no PDF qualified after filtering (candidates may still be non-empty).
  pdfUrl: string | null;
  // Best-effort parse of a date from the filename (e.g. Weekly-Permit-Report-04-15-2026.pdf)
  reportDate: Date | null;
  // All PDF hrefs found on the index page (pre-filter), capped at 15.
  // Surfaced in the UI so Julian can see what the scraper considered.
  candidatesConsidered: string[];
};

export async function fetchLatestPdfUrl(
  source: PermitSource
): Promise<LatestPdf> {
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

  const candidatesConsidered = [...hrefs].slice(0, 15);
  if (hrefs.size === 0) {
    return { pdfUrl: null, reportDate: null, candidatesConsidered };
  }

  // Filter to report-like PDFs by FILENAME (not full href — directory segments like
  // `commissioners_court/` can falsely match "court" filter otherwise).
  const candidates = [...hrefs]
    .map(h => ({
      href: h,
      resolved: resolveUrl(h, source.indexUrl),
      date: inferDateFromPath(h),
    }))
    .filter(c => looksLikeReport(c.href, source))
    .filter(c => !isNoiseFilename(c.href))
    .filter(c => {
      // Weekly permit reports and court agendas should always have a date in
      // the filename. Undated PDFs in these contexts are forms, packets, or
      // stale policy docs.
      if (source.reportType === 'weekly_permits') return c.date !== null;
      if (source.reportType === 'commissioners_court') return c.date !== null;
      return true;
    });

  if (candidates.length === 0) {
    return { pdfUrl: null, reportDate: null, candidatesConsidered };
  }

  // Sort: most recent filename-date first, fall back to order-on-page (first wins).
  candidates.sort((a, b) => {
    if (a.date && b.date) return b.date.getTime() - a.date.getTime();
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });

  const best = candidates[0];
  return { pdfUrl: best.resolved, reportDate: best.date, candidatesConsidered };
}

function resolveUrl(href: string, indexUrl: string): string {
  try {
    return new URL(href, indexUrl).toString();
  } catch {
    return href;
  }
}

const MONTH_INDEX: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

function inferDateFromPath(href: string): Date | null {
  const name = filenameOf(href);

  // 04-15-2026, 04_15_2026
  const numeric = name.match(/(\d{1,2})[-_\/](\d{1,2})[-_\/](\d{4})/);
  if (numeric) {
    const [, m, d, y] = numeric;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    if (!Number.isNaN(date.getTime())) return date;
  }
  // 2026-04-15
  const iso = name.match(/(\d{4})[-_\/](\d{1,2})[-_\/](\d{1,2})/);
  if (iso) {
    const [, y, m, d] = iso;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    if (!Number.isNaN(date.getTime())) return date;
  }
  // July_2025, April-2024 (Harker Heights EDR pattern)
  const monthYear = name.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept?|oct|nov|dec)[-_ ]?(\d{4})\b/i);
  if (monthYear) {
    const [, monthName, y] = monthYear;
    const m = MONTH_INDEX[monthName.toLowerCase()];
    if (m !== undefined) return new Date(Number(y), m, 1);
  }
  // 180730agenda.pdf / 260415agenda.pdf — 6-digit YYMMDD prefix (Bell County)
  const yymmdd = name.match(/^(\d{2})(\d{2})(\d{2})/);
  if (yymmdd) {
    const [, yy, mm, dd] = yymmdd;
    const y = 2000 + Number(yy);
    const date = new Date(y, Number(mm) - 1, Number(dd));
    if (!Number.isNaN(date.getTime()) && Number(mm) >= 1 && Number(mm) <= 12 && Number(dd) >= 1 && Number(dd) <= 31) {
      return date;
    }
  }
  return null;
}

function filenameOf(href: string): string {
  const clean = href.split('?')[0].split('#')[0];
  const slash = clean.lastIndexOf('/');
  return (slash >= 0 ? clean.slice(slash + 1) : clean).toLowerCase();
}

function looksLikeReport(href: string, source: PermitSource): boolean {
  const name = filenameOf(href);
  if (source.reportType === 'weekly_permits') {
    return /permit|weekly|monthly|report/.test(name);
  }
  if (source.reportType === 'commissioners_court') {
    // "packet" is intentionally NOT here — many municipalities use it for
    // board-packet bundles that are rarely the current agenda.
    return /commissioner|court|agenda/.test(name);
  }
  if (source.reportType === 'edr') {
    return /economic|edr|development|report/.test(name);
  }
  return true;
}

// Filenames that match the positive filters but are almost always noise on
// municipal CMSes: blank forms, application packets, fee schedules, etc.
function isNoiseFilename(href: string): boolean {
  const name = filenameOf(href);
  return /\b(packet|application|form|policy|sop|checklist|fee[_-]?schedule|schedule|template|blank|sample|guide|faq|instructions?|handbook|manual|ordinance|code)\b/.test(
    name
  );
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
