/**
 * Quote list segments, shared by the server (which counts) and the client
 * (which filters) so the two can never disagree about what a segment holds.
 *
 * The vocabulary is owned by the database: `quotes.status` is one of
 * draft | sent | accepted | declined | expired (see QUOTE_STATUS_CLASS in
 * src/lib/pipeline.ts).
 */

export const QUOTE_SEGMENTS = ['out', 'won', 'lost', 'all'] as const

export type QuoteSegment = (typeof QUOTE_SEGMENTS)[number]

export type QuoteCounts = Record<QuoteSegment, number>

/**
 * `draft` deliberately belongs to no segment but `all`. Quote building left
 * HQ, so a draft is a legacy row — it is not out for an answer, not won and
 * not lost, and surfacing it under any of those would misreport the pipeline.
 */
export function inSegment(status: string | null | undefined, seg: QuoteSegment): boolean {
  if (seg === 'all') return true
  if (!status) return false
  switch (seg) {
    case 'out':
      return status === 'sent'
    case 'won':
      return status === 'accepted'
    case 'lost':
      return status === 'declined' || status === 'expired'
  }
}

export function countSegments(statuses: (string | null | undefined)[]): QuoteCounts {
  return {
    out: statuses.filter((s) => inSegment(s, 'out')).length,
    won: statuses.filter((s) => inSegment(s, 'won')).length,
    lost: statuses.filter((s) => inSegment(s, 'lost')).length,
    all: statuses.length,
  }
}
