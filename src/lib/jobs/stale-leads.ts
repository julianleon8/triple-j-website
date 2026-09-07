/**
 * Pure decision logic for the stale-lead nudge.
 *
 * Separate from the route because Next 16 rejects any export from a route.ts
 * that is not a route field — and because this is the part worth unit
 * testing without a database.
 */

import { COLD_THRESHOLD_HOURS } from '@/lib/pipeline'
import { formatCityOrZip } from '@/lib/locations'
import { getSiteUrl } from '@/lib/site-url'

export type StaleLeadRow = {
  id: string
  name: string
  city: string | null
  zip: string | null
  service_type: string | null
  timeline: string | null
  created_at: string
}

/** How many leads to name before collapsing into "+N more". */
const NAMED_LIMIT = 3

export function staleCutoff(now: Date): string {
  return new Date(now.getTime() - COLD_THRESHOLD_HOURS * 3_600_000).toISOString()
}

/**
 * Builds the push + email wording for a batch of stale leads.
 *
 * Keeps singular and plural phrasing in one place rather than inline in the
 * query path, and keeps the push and the email saying the same thing.
 */
export function buildStaleDigest(rows: StaleLeadRow[], now: Date) {
  const named = rows.slice(0, NAMED_LIMIT)
  const moreCount = Math.max(0, rows.length - named.length)
  const hoursOld = (row: StaleLeadRow) =>
    Math.floor((now.getTime() - new Date(row.created_at).getTime()) / 3_600_000)

  const describe = (row: StaleLeadRow) =>
    [
      formatCityOrZip(row.city, row.zip),
      row.service_type?.replace(/_/g, ' ') ?? null,
      `${hoursOld(row)}h waiting`,
    ]
      .filter(Boolean)
      .join(' · ')

  const single = rows.length === 1
  const anyAsap = rows.some((r) => r.timeline === 'asap')

  return {
    title: single
      ? `⏰ No reply yet: ${rows[0].name}`
      : `⏰ ${rows.length} leads waiting on a reply`,
    body: single
      ? describe(rows[0])
      : `${named.map((r) => r.name).join(', ')}${moreCount > 0 ? ` +${moreCount} more` : ''}`,
    heading: single
      ? `${rows[0].name} has been waiting ${hoursOld(rows[0])}h`
      : `${rows.length} leads have had no response`,
    subhead: `Nothing has moved these out of "new" in over ${COLD_THRESHOLD_HOURS} hours.${
      anyAsap ? ' At least one marked their timeline ASAP.' : ''
    }`,
    items: named.map((row) => ({
      primary: row.name,
      secondary: describe(row),
      href: `${getSiteUrl()}/hq/leads/${row.id}`,
    })),
    moreCount,
  }
}
