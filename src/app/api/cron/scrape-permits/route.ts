import type { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cronRoute, type CronContext, type CronResult } from '@/lib/cron';
import { getEnabledSources, type PermitSource } from '@/lib/permit-sources';
import {
  pdfToText,
  extractLeadsFromRows,
  EXTRACTION_MODEL,
  type ExtractedLead,
} from '@/lib/permit-extractor';
import {
  listReports,
  pickUnseen,
  clampMaxReports,
  splitPermitRows,
  preFilter,
  leadClassHint,
  stallPushDue,
  digestBody,
  emptyClassCounts,
  STALL_DAYS,
  type ReportLink,
  type ClassCounts,
  type LeadClass,
} from '@/lib/jobs/scrape-permits';
import { sendPush } from '@/lib/push';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min — PDF parsing + Claude calls on Vercel Pro

/**
 * Permit scraper.
 *
 * Per enabled source: fetch the index page → list the report PDFs (newest
 * first, by the publisher's upload stamp) → skip the ones already recorded in
 * `permit_reports` → for each new one: fetch, extract text, split into permit
 * rows, drop the trades by job-type code, send the rest to Claude, upsert into
 * `permit_leads` keyed on (jurisdiction, permit_number), record the report.
 *
 * A permit that shows up again in a later report (its status advanced) updates
 * only `job_status`, `source_url`, `source_report_date` and `updated_at`. The
 * owner's own columns — `status`, `notes`, `called_*` — are never touched.
 *
 * `yield` is rows INSERTED. A run that finds no new report is `ok: true,
 * yield: 0` and that is the normal outcome six days in seven; the stall
 * alarm keys on the newest upload's age, not on the yield streak.
 */

const USER_AGENT = 'Mozilla/5.0 (compatible; TripleJLeadBot/1.0; +https://triplejmetaltx.com)';
const HOT_SCORE = 8;

type ReportSummary = {
  label: string;
  url: string;
  uploadedAt: string | null;
  /** Rows in the PDF, rows sent to Claude, rows stored (either way), rows skipped. */
  permits: number;
  kept: number;
  leads: number;
  skipped: number;
  inserted: number;
  updated: number;
  classes: ClassCounts;
  errors: string[];
};

type JurisdictionSummary = {
  inserted: number;
  updated: number;
  skipped: number;
  notified: number;
  errors: string[];
  reportsListed: number;
  reportsProcessed: number;
  newestUploadedAt: string | null;
  reports: ReportSummary[];
  // First ~15 report hrefs seen on the index page. Lets the /hq panel explain
  // "we looked at these" without DevTools; the panel already reads this name.
  candidatesConsidered?: string[];
};

async function readMaxReports(request?: NextRequest): Promise<number> {
  if (!request || request.method !== 'POST') return clampMaxReports(undefined);
  const body = (await request.json().catch(() => null)) as { maxReports?: unknown } | null;
  return clampMaxReports(body?.maxReports);
}

async function runScrape(ctx: CronContext, request?: NextRequest): Promise<CronResult> {
  const maxReports = await readMaxReports(request);
  const now = new Date();
  const summary: Record<string, JurisdictionSummary> = {};

  for (const source of getEnabledSources()) {
    summary[source.jurisdiction] = await scrapeOne(source, ctx.db, maxReports, now);
  }

  const jurisdictions = Object.values(summary);
  const inserted = jurisdictions.reduce((n, s) => n + s.inserted, 0);
  const notified = jurisdictions.reduce((n, s) => n + s.notified, 0);
  const errors = jurisdictions.flatMap((s) => s.errors);

  return {
    // Every jurisdiction failing is a real failure; some failing is normal.
    ok: errors.length < jurisdictions.length || jurisdictions.length === 0,
    yield: inserted,
    notified,
    error: errors.length > 0 ? errors.join('; ') : undefined,
    detail: { model: EXTRACTION_MODEL, maxReports, summary },
  };
}

export const GET = cronRoute('scrape-permits', runScrape);
// The /hq "Run Scrape Now" button POSTs; same handler, same auth. A POST body
// may carry `{ maxReports }` to drain the backlog faster than the cron default.
export const POST = GET;

function shortName(source: PermitSource): string {
  return source.label.split(' — ')[0];
}

async function scrapeOne(
  source: PermitSource,
  db: SupabaseClient,
  maxReports: number,
  now: Date,
): Promise<JurisdictionSummary> {
  const s: JurisdictionSummary = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    notified: 0,
    errors: [],
    reportsListed: 0,
    reportsProcessed: 0,
    newestUploadedAt: null,
    reports: [],
  };

  try {
    const res = await fetch(source.indexUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) {
      throw new Error(`Index fetch failed for ${source.jurisdiction}: ${res.status} ${res.statusText}`);
    }
    const html = await res.text();

    const reports = listReports(html, source);
    s.reportsListed = reports.length;
    s.candidatesConsidered = reports.slice(0, 15).map((r) => r.href);
    if (reports.length === 0) {
      s.errors.push('No report PDFs linked on index page');
      return s;
    }
    const newest = reports.find((r) => r.uploadedAt)?.uploadedAt ?? null;
    s.newestUploadedAt = newest?.toISOString() ?? null;

    const { data: seenRows, error: seenError } = await db
      .from('permit_reports')
      .select('source_url')
      .eq('jurisdiction', source.jurisdiction);
    if (seenError) throw new Error(`permit_reports read: ${seenError.message}`);

    const unseen = pickUnseen(
      reports,
      ((seenRows ?? []) as { source_url: string }[]).map((r) => r.source_url),
      maxReports,
    );

    const hot: ExtractedLead[] = [];
    for (const report of unseen) {
      const r = await processReport(report, source, db, hot);
      s.reports.push(r);
      s.inserted += r.inserted;
      s.updated += r.updated;
      s.skipped += r.skipped;
      s.errors.push(...r.errors);
    }
    s.reportsProcessed = s.reports.filter((r) => r.errors.length === 0).length;

    s.notified += await notify(source, s, hot, newest, now);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    s.errors.push(msg);
    console.error(`[scrape-permits] ${source.jurisdiction}:`, err);
  }

  return s;
}

async function processReport(
  report: ReportLink,
  source: PermitSource,
  db: SupabaseClient,
  hot: ExtractedLead[],
): Promise<ReportSummary> {
  const out: ReportSummary = {
    label: report.label,
    url: report.url,
    uploadedAt: report.uploadedAt?.toISOString() ?? null,
    permits: 0,
    kept: 0,
    leads: 0,
    skipped: 0,
    inserted: 0,
    updated: 0,
    classes: emptyClassCounts(),
    errors: [],
  };

  try {
    const pdfRes = await fetch(report.url, { headers: { 'User-Agent': USER_AGENT } });
    if (!pdfRes.ok) {
      out.errors.push(`PDF fetch failed: ${pdfRes.status} (${report.label})`);
      return out;
    }
    const text = await pdfToText(await pdfRes.arrayBuffer());

    const rows = splitPermitRows(text);
    out.permits = rows.length;
    if (rows.length === 0) {
      // A scanned PDF or a changed layout. Not recorded in permit_reports, so
      // it is retried next run and stays visible until someone looks.
      out.errors.push(
        `No permit rows recognised in "${report.label}" (${text.trim().length} chars of text)`,
      );
      return out;
    }

    const kept = preFilter(rows);
    out.kept = kept.length;
    const leads = kept.length > 0 ? await extractLeadsFromRows(kept, source) : [];

    const reportDate = report.uploadedAt?.toISOString().slice(0, 10) ?? null;
    const fullRows: PermitLeadRow[] = [];
    for (const lead of leads) {
      const cls = lead.lead_class ?? leadClassHint(lead.job_type_code);
      if (!cls || !lead.permit_number) {
        out.skipped += 1;
        continue;
      }
      out.classes[cls] += 1;
      fullRows.push(toRow(lead, cls, source, report.url, reportDate));
    }
    out.leads = fullRows.length;

    if (fullRows.length > 0) {
      const { data: existing, error: existingError } = await db
        .from('permit_leads')
        .select('permit_number, source_report_date')
        .eq('jurisdiction', source.jurisdiction)
        .in('permit_number', fullRows.map((r) => r.permit_number));
      if (existingError) throw new Error(`permit_leads read: ${existingError.message}`);

      const known = new Map(
        ((existing ?? []) as { permit_number: string; source_report_date: string | null }[]).map(
          (e) => [e.permit_number, e.source_report_date],
        ),
      );

      const inserts = fullRows.filter((r) => !known.has(r.permit_number));
      // Re-sightings: update the municipal status only when this report is at
      // least as new as the one the row came from, so backfilling an older
      // week never rolls a permit's status backwards.
      const resights = fullRows
        .filter((r) => known.has(r.permit_number))
        .filter((r) => {
          const prev = known.get(r.permit_number) ?? null;
          return !prev || !reportDate || reportDate >= prev;
        })
        .map((r) => ({
          jurisdiction: r.jurisdiction,
          permit_number: r.permit_number,
          job_status: r.job_status,
          source_url: r.source_url,
          source_report_date: r.source_report_date,
          updated_at: new Date().toISOString(),
        }));

      if (inserts.length > 0) {
        const { error, count } = await db
          .from('permit_leads')
          .upsert(inserts, { onConflict: 'jurisdiction,permit_number', ignoreDuplicates: true, count: 'exact' });
        if (error) throw new Error(`permit_leads insert: ${error.message}`);
        out.inserted = count ?? inserts.length;

        const insertedNumbers = new Set(inserts.map((r) => r.permit_number));
        for (const lead of leads) {
          if (
            lead.permit_number &&
            insertedNumbers.has(lead.permit_number) &&
            (lead.wheelhouse_score ?? 0) >= HOT_SCORE
          ) {
            hot.push(lead);
          }
        }
      }

      if (resights.length > 0) {
        const { error } = await db
          .from('permit_leads')
          .upsert(resights, { onConflict: 'jurisdiction,permit_number' });
        if (error) throw new Error(`permit_leads update: ${error.message}`);
        out.updated = resights.length;
      }
    }

    const { error: reportError } = await db.from('permit_reports').upsert(
      {
        source_url: report.url,
        jurisdiction: source.jurisdiction,
        label: report.label,
        uploaded_at: out.uploadedAt,
        permit_count: rows.length,
        kept_count: kept.length,
        lead_count: fullRows.length,
      },
      { onConflict: 'source_url' },
    );
    if (reportError) out.errors.push(`permit_reports write: ${reportError.message}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    out.errors.push(`${report.label}: ${msg}`);
    console.error(`[scrape-permits] ${source.jurisdiction} ${report.label}:`, err);
  }

  return out;
}

/** Digest for the reports processed, one hot-permit push, and the weekly stall nag. */
async function notify(
  source: PermitSource,
  s: JurisdictionSummary,
  hot: ExtractedLead[],
  newestUploadedAt: Date | null,
  now: Date,
): Promise<number> {
  let sent = 0;
  const name = shortName(source);

  const processed = s.reports.filter((r) => r.errors.length === 0 && r.leads > 0);
  if (processed.length > 0) {
    const totals = processed.reduce<ClassCounts>((acc, r) => {
      for (const k of Object.keys(acc) as LeadClass[]) acc[k] += r.classes[k];
      return acc;
    }, emptyClassCounts());
    const res = await sendPush({
      title: `${name} permits: ${processed.map((r) => r.label).join(', ')}`,
      body: digestBody(totals),
      url: '/hq/permit-leads',
      tag: `permits-digest-${source.jurisdiction}`,
    });
    sent += res.sent;
  }

  if (hot.length > 0) {
    const top = hot[0];
    const more = hot.length - 1;
    const res = await sendPush({
      title: `🔥 ${hot.length} hot permit${hot.length === 1 ? '' : 's'}: ${name}`,
      body:
        `${top.permit_type ?? 'permit'} · ${top.address ?? top.city ?? ''}` +
        (more > 0 ? ` + ${more} more` : ''),
      url: '/hq/permit-leads?class=accessory',
      tag: `permits-hot-${source.jurisdiction}`,
    });
    sent += res.sent;
  }

  if (stallPushDue(newestUploadedAt, now) && newestUploadedAt) {
    const days = Math.floor((now.getTime() - newestUploadedAt.getTime()) / 86_400_000);
    const res = await sendPush({
      title: `${name} permit reports have gone quiet`,
      body: `Newest report was uploaded ${days} days ago (alarm after ${STALL_DAYS}). Check the City page, then the scraper.`,
      url: '/hq/permit-leads',
      tag: `permits-stall-${source.jurisdiction}`,
    });
    sent += res.sent;
  }

  return sent;
}

type PermitLeadRow = ReturnType<typeof toRow>;

function toRow(
  lead: ExtractedLead,
  leadClass: LeadClass,
  source: PermitSource,
  sourceUrl: string,
  reportDate: string | null,
) {
  return {
    jurisdiction: source.jurisdiction,
    source_url: sourceUrl,
    source_report_date: reportDate,
    permit_number: lead.permit_number as string,
    permit_type: lead.permit_type,
    job_type_code: lead.job_type_code,
    job_status: lead.job_status,
    owner_name: lead.owner_name,
    applicant_name: lead.applicant_name,
    contractor_name: lead.contractor_name,
    address: lead.address,
    city: lead.city,
    state: 'TX',
    zip: lead.zip,
    description: lead.description,
    valuation: lead.valuation,
    lead_class: leadClass,
    wheelhouse_score: lead.wheelhouse_score,
    wheelhouse_reasons: lead.wheelhouse_reasons,
    raw_source_text: lead.raw_source_text,
    extraction_model: EXTRACTION_MODEL,
  };
}
