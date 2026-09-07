/**
 * Pure decision logic for the permit scraper: which PDFs on an index page are
 * reports, which of them are new, which rows inside a report are worth a
 * Claude call, and when the source has gone quiet.
 *
 * No I/O, no clock, no `unpdf`, no Anthropic SDK — so it runs under vitest on
 * any Node version and the route stays a thin sequence of fetch → parse →
 * upsert. Separate from the route because Next 16 rejects any export from a
 * route.ts that is not a route field.
 */

import type { PermitSource } from '@/lib/permit-sources'

// ── Index page → report links ────────────────────────────────────────────────

export type ReportLink = {
  /** The href as written on the page (entities decoded, query stripped). */
  href: string
  /** Absolute URL, resolved against the page's <base href>. */
  url: string
  /** Publisher upload time from the ?t= cache-buster; null when absent. */
  uploadedAt: Date | null
  /** Short human label from the filename, e.g. "Aug 21-27". */
  label: string
}

/**
 * The `<base href>` a page declares, if any.
 *
 * Both Revize sites (Temple, Bell County) declare one and then emit
 * root-relative hrefs with no leading slash. Resolving those against the
 * index URL doubles the path (`…/commissioners_court/county_government/…`)
 * and 404s — that was the live failure on 2026-09-07 after the regex fix.
 */
export function baseHrefOf(html: string): string | null {
  const m = html.match(/<base\b[^>]*\bhref\s*=\s*["']([^"']+)["']/i)
  return m ? m[1] : null
}

export function resolvePdfUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString()
  } catch {
    return href
  }
}

/** The only entity that shows up in these hrefs in practice. */
function decodeEntities(s: string): string {
  return s.replace(/&amp;/gi, '&').replace(/&#38;/g, '&')
}

/**
 * Revize's `?t=YYYYMMDDhhmmss<tenth>` cache-buster is the upload timestamp.
 * It is the only trustworthy recency signal on Temple's page: the filenames
 * ("Aug 21-27.pdf", "Weekly Report - March 13-19, 2026.pdf") have no year and
 * no consistently parseable date.
 *
 * Read as UTC. Only ordering and "how many days old" are ever derived from it,
 * so the five-hour Central offset is immaterial.
 */
export function uploadStampOf(query: string | null | undefined): Date | null {
  if (!query) return null
  const m = query.match(/[?&]t=(\d{14})\d*/)
  if (!m) return null
  const s = m[1]
  const y = Number(s.slice(0, 4))
  const mo = Number(s.slice(4, 6))
  const d = Number(s.slice(6, 8))
  const h = Number(s.slice(8, 10))
  const mi = Number(s.slice(10, 12))
  const se = Number(s.slice(12, 14))
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || se > 59) return null
  const date = new Date(Date.UTC(y, mo - 1, d, h, mi, se))
  return Number.isNaN(date.getTime()) ? null : date
}

function filenameOf(href: string): string {
  const clean = href.split('?')[0].split('#')[0]
  const slash = clean.lastIndexOf('/')
  return slash >= 0 ? clean.slice(slash + 1) : clean
}

/** "Weekly Report - March 13-19, 2026.pdf" → "March 13-19, 2026". */
export function reportLabel(href: string): string {
  return filenameOf(href)
    .replace(/\.pdf$/i, '')
    .replace(/^weekly report\s*-\s*/i, '')
    .replace(/^city of temple weekly building permit(?: report)?\s*/i, '')
    .trim()
}

/**
 * Every report-like PDF linked from an index page, newest first.
 *
 * Newest = latest upload stamp. Links without a stamp keep their page order
 * and sort after the stamped ones (Revize lists newest first, so this is the
 * right fallback). Duplicated links collapse to one.
 */
export function listReports(html: string, source: PermitSource): ReportLink[] {
  const base = baseHrefOf(html) ?? source.indexUrl
  const seen = new Set<string>()
  const found: ReportLink[] = []

  for (const m of html.matchAll(source.pdfHrefPattern)) {
    const href = decodeEntities(m[1])
    if (!source.pathFilter.test(href)) continue
    if (source.exclude?.test(href)) continue
    const url = resolvePdfUrl(href, base)
    if (seen.has(url)) continue
    seen.add(url)
    found.push({ href, url, uploadedAt: uploadStampOf(m[2]), label: reportLabel(href) })
  }

  return found
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      const ta = a.r.uploadedAt?.getTime()
      const tb = b.r.uploadedAt?.getTime()
      if (ta !== undefined && tb !== undefined && ta !== tb) return tb - ta
      if (ta !== undefined && tb === undefined) return -1
      if (ta === undefined && tb !== undefined) return 1
      return a.i - b.i
    })
    .map((x) => x.r)
}

// ── Which reports to process this run ───────────────────────────────────────

/** Per run, per source. Bounds Claude spend while the ~110-report backlog drains. */
export const DEFAULT_MAX_REPORTS = 3
export const MAX_REPORTS_CEILING = 20

/** Reports not yet in permit_reports, newest first, capped. */
export function pickUnseen(
  reports: ReportLink[],
  seenUrls: Iterable<string>,
  max: number = DEFAULT_MAX_REPORTS,
): ReportLink[] {
  const seen = new Set(seenUrls)
  return reports.filter((r) => !seen.has(r.url)).slice(0, Math.max(0, max))
}

/** Parses the optional `maxReports` a manual POST may carry. */
export function clampMaxReports(input: unknown): number {
  const n = typeof input === 'string' ? Number(input) : input
  if (typeof n !== 'number' || !Number.isFinite(n)) return DEFAULT_MAX_REPORTS
  return Math.min(MAX_REPORTS_CEILING, Math.max(1, Math.floor(n)))
}

// ── Report text → permit rows ────────────────────────────────────────────────

export type PermitRow = {
  /** Normalised job id, e.g. "FY-26-132-ACRS". The type code is part of the identity: Temple reuses the number across codes (FY-26-150-MERR and FY-26-150-WT). */
  permitNumber: string
  /** Job-type code, e.g. ACRS, SFR, BCRR, RES-FENCE. */
  code: string
  /** The whole row as one line of text. */
  text: string
}

/**
 * Temple's PDF is a table; `unpdf` flattens it to prose with each row starting
 * at its Job ID. The header row ("Job ID Property Owner Job Type Description…")
 * precedes the first id and is dropped. Row order is preserved.
 */
export function splitPermitRows(text: string): PermitRow[] {
  const flat = text.replace(/\s+/g, ' ').trim()
  const rows: PermitRow[] = []
  for (const chunk of flat.split(/(?=FY-\d{2}-\d+-)/)) {
    const m = chunk.match(/^FY-(\d{2})-(\d+)-\s*([A-Z]{2,}(?:-[A-Z]+)?)/)
    if (!m) continue
    rows.push({
      permitNumber: `FY-${m[1]}-${m[2]}-${m[3]}`,
      code: m[3],
      text: chunk.trim(),
    })
  }
  return rows
}

/** "FY-26-132- ACRS" and "fy-26-132-acrs" both become "FY-26-132-ACRS". */
export function normalizePermitNumber(s: string | null | undefined): string | null {
  if (!s) return null
  const n = s.replace(/\s+/g, '').toUpperCase()
  return n.length > 0 ? n : null
}

// ── Pre-filter: which rows earn a Claude call ────────────────────────────────

export const LEAD_CLASSES = ['accessory', 'new_home', 'commercial'] as const
export type LeadClass = (typeof LEAD_CLASSES)[number]

/**
 * Temple job-type codes, from reading the Aug 21-27, 2026 report.
 *
 * KEEP: always sent to Claude.
 *   ACRS / ACRL  Residential Accessory Bldg Small / Large (sheds, shops, covers)
 *   BAR          Res Building — Residential Addition
 *   FLAT         Flatwork (driveways, slabs)
 *   PW           Public-works permit — seen on "new shop building with concrete flatwork"
 *   SFR / DUPX   New single-family / duplex — the builder and the future backyard
 *   MFG          Manufactured setup — usually on a new slab
 *   BC*          Building, commercial (BCRR remodel, and whatever new-construction code appears)
 *
 * DROP: never sent, whatever the description says. Water heaters "in garage"
 * and gas tests are the bulk of the report.
 *
 * Anything else falls through to a text test, so an unknown code carrying
 * "metal building 30x40 on new slab" is still kept.
 */
export const KEEP_CODES: ReadonlySet<string> = new Set([
  'ACRS', 'ACRL', 'BAR', 'FLAT', 'PW', 'SFR', 'DUPX', 'MFG',
])
const KEEP_CODE_PREFIXES = ['BC']

export const DROP_CODES: ReadonlySet<string> = new Set([
  'GT', 'PBIR', 'PBWH', 'PBRR', 'ROOF', 'ELSC', 'ELRP', 'MERR', 'RWIN', 'SIGN',
  'FA', 'FSS', 'WT', 'POOL', 'BDSP', 'CHNG', 'BDRR', 'RES-FENCE',
])

export const WHEELHOUSE_TEXT =
  /\b(metal (?:building|bldg|structure)|carport|garage|barn|shop|patio cover|patio|awning|pergola|slab|flatwork|storage (?:building|bldg|shed|unit)|shed|pole barn|pemb|pre-?engineered|steel building|rv cover|boat cover|lean-?to|porch|accessory)\b/i

export function keepsRow(row: PermitRow): boolean {
  if (KEEP_CODES.has(row.code)) return true
  if (KEEP_CODE_PREFIXES.some((p) => row.code.startsWith(p))) return true
  if (DROP_CODES.has(row.code)) return false
  return WHEELHOUSE_TEXT.test(row.text)
}

export function preFilter(rows: PermitRow[]): PermitRow[] {
  return rows.filter(keepsRow)
}

/**
 * What the code alone says about the class. Claude decides from the full row;
 * this fills in when it returns null, and is the fallback that keeps a row
 * from being dropped for a formatting slip.
 */
export function leadClassHint(code: string | null | undefined): LeadClass | null {
  if (!code) return null
  if (code === 'SFR' || code === 'DUPX') return 'new_home'
  if (code.startsWith('BC')) return 'commercial'
  if (KEEP_CODES.has(code)) return 'accessory'
  return null
}

/**
 * Rows per Claude call.
 *
 * The first live run (2026-09-07) sent 40 rows against an 8k output cap and
 * every batch truncated mid-array — a row is ~250 output tokens, not 150 — so
 * both reports were recorded with zero leads. 15 rows is ~4k tokens against a
 * 16k cap, and the extractor still halves any batch that reports
 * stop_reason max_tokens.
 */
export const ROWS_PER_CALL = 15

export function chunk<T>(items: T[], size: number): T[][] {
  if (size < 1) return [items]
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

/**
 * Pulls a JSON array out of free text: tolerant of ```json fences, a prose
 * preamble and trailing commentary. Returns null when the text holds no
 * complete array — including output truncated at max_tokens, which is why the
 * extractor asks for tool-use output and treats this as the fallback only.
 */
export function parseJsonArrayLoose(text: string): unknown[] | null {
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start < 0 || end <= start) return null
  try {
    const value: unknown = JSON.parse(text.slice(start, end + 1))
    return Array.isArray(value) ? value : null
  } catch {
    return null
  }
}

// ── Time budget ─────────────────────────────────────────────────────────────

/**
 * The route's maxDuration is 300s. Starting another report with less than a
 * minute left risks the platform killing the function mid-report, which
 * strands the open cron_runs row (ok IS NULL forever). Unstarted reports
 * simply wait for the next run.
 */
export const REPORT_TIME_BUDGET_MS = 240_000

export function hasBudget(startedAt: number, now: number, budget = REPORT_TIME_BUDGET_MS): boolean {
  return now - startedAt < budget
}

// ── Run status for the HQ page ──────────────────────────────────────────────

/** The cron_runs columns the /hq page reads. */
export type ScrapeRunRow = {
  started_at: string
  finished_at: string | null
  ok: boolean | null
  yield: number
  notified: number
  error: string | null
  detail: unknown
}

export type RunState = 'running' | 'cut_off' | 'ok' | 'failed'

/**
 * An open row older than maxDuration (300s) plus grace was killed by the
 * platform and will never close — the 2026-09-07 18:49 UTC row. Inside that
 * window an open row is a run in flight, and the page keeps polling.
 */
export const RUN_CUTOFF_MS = 330_000

export function runState(row: ScrapeRunRow | null, now: Date): RunState | null {
  if (!row) return null
  if (row.finished_at === null || row.ok === null) {
    return now.getTime() - new Date(row.started_at).getTime() < RUN_CUTOFF_MS ? 'running' : 'cut_off'
  }
  return row.ok ? 'ok' : 'failed'
}

// ── Stall detection ─────────────────────────────────────────────────────────

/**
 * Temple posts weekly, sometimes two weeks at once. Fourteen days with no
 * newer upload means either the City stopped publishing or the page changed
 * shape under us — both need a human.
 *
 * Deliberately NOT the zero-yield streak: a daily cron over a weekly source is
 * zero-yield six days in seven by design.
 */
export const STALL_DAYS = 14

export function reportStalled(newestUploadedAt: Date | null, now: Date, days = STALL_DAYS): boolean {
  if (!newestUploadedAt) return false // "no PDFs listed at all" is a different, louder failure
  return now.getTime() - newestUploadedAt.getTime() > days * 86_400_000
}

/**
 * Nag once a week, not once a day: the stall push fires only on Mondays
 * (UTC, when the 14:00 cron runs). Pure so it can be tested on fixed dates.
 */
export function stallPushDue(newestUploadedAt: Date | null, now: Date): boolean {
  return reportStalled(newestUploadedAt, now) && now.getUTCDay() === 1
}

// ── Push copy ───────────────────────────────────────────────────────────────

export type ClassCounts = Record<LeadClass, number>

export function emptyClassCounts(): ClassCounts {
  return { accessory: 0, new_home: 0, commercial: 0 }
}

/** "3 accessory · 18 new homes · 1 commercial" — zeros omitted. */
export function digestBody(counts: ClassCounts): string {
  const parts: string[] = []
  if (counts.accessory) parts.push(`${counts.accessory} accessory`)
  if (counts.new_home) parts.push(`${counts.new_home} new home${counts.new_home === 1 ? '' : 's'}`)
  if (counts.commercial) parts.push(`${counts.commercial} commercial`)
  return parts.length ? parts.join(' · ') : 'no wheelhouse rows this week'
}
