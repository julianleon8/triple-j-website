import { getAdminClient } from '@/lib/supabase/admin';
import { cronRoute, type CronResult } from '@/lib/cron';
import { getEnabledSources, type PermitSource } from '@/lib/permit-sources';
import {
  fetchLatestPdfUrl,
  extractLeadsFromPdf,
  EXTRACTION_MODEL,
  type ExtractedLead,
} from '@/lib/permit-extractor';
import { sendPushBackground } from '@/lib/push';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min — Claude calls + PDF parsing on Vercel Pro

type JurisdictionSummary = {
  inserted: number;
  skipped: number;
  errors: string[];
  pdfUrl?: string;
  reportDate?: string | null;
  // First ~15 PDF hrefs seen on the index page before filtering. Lets the UI
  // explain "we looked at these, none qualified" without needing DevTools.
  candidatesConsidered?: string[];
};

async function runScrape(): Promise<CronResult> {
  const sources = getEnabledSources();
  const summary: Record<string, JurisdictionSummary> = {};

  for (const source of sources) {
    summary[source.jurisdiction] = await scrapeOne(source);
  }

  const jurisdictions = Object.values(summary);
  const inserted = jurisdictions.reduce((n, s) => n + s.inserted, 0);
  const errors = jurisdictions.flatMap((s) => s.errors);

  // yield is the permit count, which is what the scrape-watch alarm reads: a
  // run that reaches every index page cleanly but extracts nothing is exactly
  // the silent rot we care about, so it must record yield 0 with ok: true.
  return {
    // Every jurisdiction failing is a real failure; some failing is normal.
    ok: errors.length < jurisdictions.length || jurisdictions.length === 0,
    yield: inserted,
    error: errors.length > 0 ? errors.join('; ') : undefined,
    detail: { model: EXTRACTION_MODEL, summary },
  };
}

export const GET = cronRoute('scrape-permits', runScrape);
// The /hq "Run Scrape Now" button POSTs; same handler, same auth.
export const POST = GET;

async function scrapeOne(source: PermitSource): Promise<JurisdictionSummary> {
  const s: JurisdictionSummary = { inserted: 0, skipped: 0, errors: [] };

  try {
    const latest = await fetchLatestPdfUrl(source);
    s.candidatesConsidered = latest.candidatesConsidered;
    if (!latest.pdfUrl) {
      s.errors.push(
        latest.candidatesConsidered.length === 0
          ? 'No PDFs linked on index page'
          : 'No candidate PDFs passed filter (see candidatesConsidered)'
      );
      return s;
    }
    s.pdfUrl = latest.pdfUrl;
    s.reportDate = latest.reportDate?.toISOString() ?? null;

    const pdfRes = await fetch(latest.pdfUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; TripleJLeadBot/1.0; +https://triplejmetaltx.com)',
      },
    });
    if (!pdfRes.ok) {
      s.errors.push(`PDF fetch failed: ${pdfRes.status}`);
      return s;
    }
    const buf = await pdfRes.arrayBuffer();

    const leads = await extractLeadsFromPdf(buf, source);
    if (leads.length === 0) {
      s.errors.push('Claude returned zero permits from this PDF');
      return s;
    }

    const rows = leads.map(l => toRow(l, source, { pdfUrl: latest.pdfUrl!, reportDate: latest.reportDate }));
    // Skip rows without a permit number — unique dedup index requires one.
    // These are usually garbage (headers, footers Claude mis-categorized).
    const withKeys = rows.filter(r => r.permit_number);
    s.skipped += rows.length - withKeys.length;

    if (withKeys.length > 0) {
      const { error, count } = await getAdminClient()
        .from('permit_leads')
        .upsert(withKeys, {
          onConflict: 'jurisdiction,source_url,permit_number',
          ignoreDuplicates: true,
          count: 'exact',
        });

      if (error) {
        s.errors.push(`Supabase upsert: ${error.message}`);
      } else {
        s.inserted = count ?? withKeys.length;

        // Notify owner device(s) about high-value new permits (score ≥ 8).
        // Summed across this jurisdiction so we don't blast 1 push per row.
        const hotHits = leads.filter(l => (l.wheelhouse_score ?? 0) >= 8)
        if (hotHits.length > 0 && s.inserted > 0) {
          const top = hotHits[0]
          const moreCount = hotHits.length - 1
          sendPushBackground({
            title: `🔥 ${hotHits.length} hot permit${hotHits.length === 1 ? '' : 's'}: ${source.jurisdiction.replace(/_/g, ' ')}`,
            body: moreCount > 0
              ? `${top.permit_type ?? 'permit'} · $${Math.round(Number(top.valuation ?? 0)).toLocaleString()} + ${moreCount} more`
              : `${top.permit_type ?? 'permit'} · ${top.address ?? top.city ?? ''}`,
            url: '/hq/permit-leads',
            tag: `permits-${source.jurisdiction}-${Date.now()}`,
          })
        }
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    s.errors.push(msg);
    console.error(`[scrape-permits] ${source.jurisdiction}:`, err);
  }

  return s;
}

function toRow(
  lead: ExtractedLead,
  source: PermitSource,
  latest: { pdfUrl: string; reportDate: Date | null }
) {
  return {
    jurisdiction: source.jurisdiction,
    source_url: latest.pdfUrl,
    source_report_date: latest.reportDate?.toISOString().slice(0, 10) ?? null,
    permit_number: lead.permit_number,
    permit_type: lead.permit_type,
    address: lead.address,
    city: lead.city,
    state: 'TX',
    zip: lead.zip,
    description: lead.description,
    valuation: lead.valuation,
    wheelhouse_score: lead.wheelhouse_score,
    wheelhouse_reasons: lead.wheelhouse_reasons,
    raw_source_text: lead.raw_source_text,
    extraction_model: EXTRACTION_MODEL,
  };
}
