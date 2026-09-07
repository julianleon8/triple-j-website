/**
 * Pure decision logic for the daily quote sweep.
 *
 * Separate from the route because Next 16 rejects any export from a route.ts
 * that is not a route field.
 */

export type ExpiringQuote = { id: string; quote_number: string }

export type StalledQuote = {
  id: string
  quote_number: string
  total: number | null
  sent_at: string
  customers: { name: string | null } | null
}

export type QuoteEmailEvent = {
  quote_id: string | null
  resend_id: string
  event_type: string
}

/**
 * Turns raw email_events rows into a per-quote engagement count.
 *
 * Resend retries are not deduplicated on insert (api/webhooks/resend plain
 * inserts, with no unique constraint on resend_id), so the same delivery can
 * appear more than once. Counting distinct resend_id keeps "opened 5x" from
 * being an artifact of retry noise.
 */
export function countOpensByQuote(events: QuoteEmailEvent[]): Record<string, number> {
  const seen = new Set<string>()
  const counts: Record<string, number> = {}
  for (const e of events) {
    if (!e.quote_id) continue
    if (e.event_type !== 'email.opened' && e.event_type !== 'email.clicked') continue
    const key = `${e.resend_id}:${e.event_type}`
    if (seen.has(key)) continue
    seen.add(key)
    counts[e.quote_id] = (counts[e.quote_id] ?? 0) + 1
  }
  return counts
}

/** Human phrase for how a customer has engaged with a quote email. */
export function engagementPhrase(opens: number): string {
  if (opens === 0) return 'never opened'
  if (opens === 1) return 'opened once'
  return `opened ${opens}x`
}
