/**
 * Shared scaffolding for scheduled jobs.
 *
 * Every cron route is three things: an auth check, some work, and a record
 * that the work happened. Before this module the first was copy-pasted (with
 * a bug — see cronAuth), and the third did not exist at all.
 *
 * A route becomes:
 *
 *   export const dynamic = 'force-dynamic'
 *   export const maxDuration = 30
 *   export const GET = cronRoute('stale-leads', runStaleLeads)
 *   export const POST = GET
 *
 * The POST alias exists so /hq buttons can trigger a job by hand, the same
 * way PermitLeadsTable's "Run Scrape Now" already does.
 */

import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isOwnerEmail } from '@/lib/owner'

/** What a job reports back. Anything omitted is recorded as zero / null. */
export type CronResult = {
  ok: boolean
  /** Units acted on: permits inserted, quotes expired, leads nudged. */
  yield?: number
  /** Pushes + emails actually delivered. */
  notified?: number
  error?: string
  detail?: unknown
}

/** What a job is handed. All history is precomputed — the job never queries cron_runs itself. */
export type CronContext = {
  db: SupabaseClient
  /**
   * started_at of the most recent successful run, or null if this job has
   * never succeeded. Deliberately started_at rather than finished_at: an
   * event that arrived *during* the previous run may or may not have been
   * seen by it, so the window overlaps slightly. A duplicate alert is
   * cheap; a missed bounce is not.
   */
  lastSuccessAt: Date | null
  /** Successful runs, newest first, that returned yield 0 before the first non-zero. */
  consecutiveZeroYield: number
  /** Completed runs, newest first, that failed before the first success. */
  consecutiveFailures: number
}

export type CronRunRow = {
  started_at: string
  ok: boolean | null
  yield: number
}

/** How much history to load. Ample for any streak threshold we'd set. */
const HISTORY_LIMIT = 30

/**
 * Derives the three history questions from raw cron_runs rows, newest first.
 *
 * Rows still in flight (ok IS NULL) are skipped rather than counted — this is
 * what lets a job read its own history safely, since withCronRun opens the
 * current run's row *before* calling the job.
 *
 * Pure: no I/O, no clock. Unit-tested in cron.test.ts.
 */
export function computeStreaks(rows: CronRunRow[]): Omit<CronContext, 'db'> {
  let lastSuccessAt: Date | null = null
  let consecutiveZeroYield = 0
  let consecutiveFailures = 0
  let zeroYieldOpen = true
  let failureOpen = true

  for (const row of rows) {
    if (row.ok === null) continue // in flight, including this very run

    if (row.ok) {
      if (!lastSuccessAt) lastSuccessAt = new Date(row.started_at)
      failureOpen = false
      if (zeroYieldOpen) {
        if (row.yield === 0) consecutiveZeroYield++
        else zeroYieldOpen = false
      }
    } else {
      if (failureOpen) consecutiveFailures++
      // A failed run says nothing about yield — it never got to produce any.
      // Leave the zero-yield streak untouched rather than breaking or
      // extending it, so an outage doesn't silently reset the rot detector.
    }
  }

  return { lastSuccessAt, consecutiveZeroYield, consecutiveFailures }
}

/**
 * Dual auth: Vercel Cron sends `Bearer $CRON_SECRET`; a manual /hq trigger
 * carries a Supabase session cookie.
 *
 * The existence guard on the secret is load-bearing. Both original crons
 * compared `auth === \`Bearer ${process.env.CRON_SECRET}\`` directly, so with
 * CRON_SECRET unset in an environment, the literal header "Bearer undefined"
 * authenticated as cron.
 */
export async function cronAuth(request: NextRequest): Promise<'cron' | 'session' | null> {
  const secret = process.env.CRON_SECRET
  const header = request.headers.get('authorization')
  if (secret && header === `Bearer ${secret}`) return 'cron'

  // The session branch exists so /hq buttons can trigger a job by hand, so it
  // has to hold to the same bar as the rest of HQ: owner, not merely signed in.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user && isOwnerEmail(user.email) ? 'session' : null
}

/**
 * Opens a cron_runs row, runs the job with its own history, closes the row.
 *
 * Never throws. A job that throws is recorded as ok:false with the message —
 * matching the house rule that a cron route returns 200 with a self-reporting
 * body rather than a 5xx that Vercel would surface as an opaque failure.
 *
 * If cron_runs is unavailable the job still runs; only the record is lost.
 */
export async function withCronRun(
  job: string,
  fn: (ctx: CronContext) => Promise<CronResult>,
): Promise<CronResult & { job: string; ranAt: string }> {
  const db = getAdminClient()
  const ranAt = new Date().toISOString()

  const { data: opened, error: openError } = await db
    .from('cron_runs')
    .insert({ job, started_at: ranAt })
    .select('id')
    .single()

  if (openError) console.error(`[${job}] could not open cron_runs row:`, openError)
  const runId: string | null = opened?.id ?? null

  const { data: history, error: historyError } = await db
    .from('cron_runs')
    .select('started_at, ok, yield')
    .eq('job', job)
    .order('started_at', { ascending: false })
    .limit(HISTORY_LIMIT)

  if (historyError) console.error(`[${job}] could not read cron_runs history:`, historyError)
  const streaks = computeStreaks((history ?? []) as CronRunRow[])

  let result: CronResult
  try {
    result = await fn({ db, ...streaks })
  } catch (err) {
    result = { ok: false, error: err instanceof Error ? err.message : String(err) }
    console.error(`[${job}] threw:`, err)
  }

  if (runId) {
    const { error: closeError } = await db
      .from('cron_runs')
      .update({
        finished_at: new Date().toISOString(),
        ok: result.ok,
        yield: result.yield ?? 0,
        notified: result.notified ?? 0,
        error: result.error ?? null,
        detail: (result.detail ?? null) as never,
      })
      .eq('id', runId)
    if (closeError) console.error(`[${job}] could not close cron_runs row:`, closeError)
  }

  return { ...result, job, ranAt }
}

/** Builds the standard cron route handler. */
export function cronRoute(job: string, fn: (ctx: CronContext) => Promise<CronResult>) {
  return async function handler(request: NextRequest) {
    const who = await cronAuth(request)
    if (!who) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json(await withCronRun(job, fn))
  }
}
