import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getEnabledSources, type PermitSource } from '@/lib/permit-sources';
import {
  fetchLatestPdfUrl,
  extractLeadsFromPdf,
  EXTRACTION_MODEL,
  type ExtractedLead,
} from '@/lib/permit-extractor';

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

async function runScrape() {
  const sources = getEnabledSources();
  const summary: Record<string, JurisdictionSummary> = {};

  for (const source of sources) {
    summary[source.jurisdiction] = await scrapeOne(source);
  }

  return {
    ok: true,
    ranAt: new Date().toISOString(),
    model: EXTRACTION_MODEL,
    summary,
  };
}

export async function GET(request: NextRequest) {
  // Dual auth: Vercel Cron uses Bearer CRON_SECRET; /hq UI uses Supabase cookie.
  const auth = request.headers.get('authorization');
  if (auth && auth === `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(await runScrape());
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(await runScrape());
}

export async function POST(request: NextRequest) {
  return GET(request);
}

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
