/**
 * Pure decision logic for the outbound-email bounce watch.
 *
 * Separate from the route because Next 16 rejects any export from a route.ts
 * that is not a route field.
 */

export type BounceEvent = {
  resend_id: string
  event_type: string
  to_email: string | null
  subject: string | null
  occurred_at: string
}

export const WATCHED_EVENTS = ['email.bounced', 'email.complained']

/** First-run window when there is no prior successful run to measure from. */
const COLD_START_HOURS = 24

/**
 * The lower bound for "new since I last looked".
 *
 * Falls back to a short window rather than all-time on a first run, so
 * standing up the job does not fire one alert per bounce in recorded history.
 */
export function bounceWindowStart(lastSuccessAt: Date | null, now: Date): string {
  if (lastSuccessAt) return lastSuccessAt.toISOString()
  return new Date(now.getTime() - COLD_START_HOURS * 3_600_000).toISOString()
}

/**
 * Collapses Resend webhook retries.
 *
 * The webhook plain-inserts each delivery — no upsert, no unique constraint
 * on resend_id — so one bounce can be several rows. Without this, "3 bounces"
 * may be one address failing once.
 */
export function dedupeBounces(events: BounceEvent[]): BounceEvent[] {
  const seen = new Set<string>()
  const out: BounceEvent[] = []
  for (const e of events) {
    const key = `${e.resend_id}:${e.event_type}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(e)
  }
  return out
}
