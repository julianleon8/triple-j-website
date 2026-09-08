/**
 * Unified pipeline row — every HQ entity (lead, permit, customer, quote, job)
 * maps into this shape so a single <ListRow> can render any of them.
 *
 * Used by the Funnel tab (all entities) and the Now tab (filtered slices).
 */

import { formatCityOrZip } from '@/lib/locations'
import { isDraftLead } from '@/lib/hq/capture-draft'

export type PipelineKind = 'lead' | 'permit' | 'customer' | 'quote' | 'job'

export type PipelineBadgeTone = 'hot' | 'asap' | 'mil' | 'today' | 'new' | 'featured' | 'warn'

export type PipelineBadge = {
  text: string
  tone: PipelineBadgeTone
}

export type PipelineTrailing =
  | { type: 'status'; value: string; statusClass: string }
  | { type: 'score';  value: number /* 1-10 */ }
  | { type: 'amount'; value: string /* "$12,345" */; sub?: string /* status pill */; statusClass?: string }
  | { type: 'chevron' }

export type PipelineRow = {
  kind: PipelineKind
  id: string
  href: string
  primary: string
  secondary: string
  trailing?: PipelineTrailing
  badges?: PipelineBadge[]
  created_at: string
  /**
   * A lead still missing a name or a service — leads.is_draft, carried through
   * explicitly rather than derived from what the row happens to render.
   */
  isDraft?: boolean
  /** Non-visual hints carried alongside the row (phone for swipe-to-call, etc.). */
  meta?: { phone?: string | null; sentAt?: string | null }
}

/** Leads past this age with no contact are "cold" — surfaced with a red banner/bar. */
export const COLD_THRESHOLD_HOURS = 12

/**
 * A sent quote with no answer after this long is stalled — worth a call.
 * Measured from sent_at, not created_at: a quote can sit in draft for weeks
 * before it goes out, and the clock only starts when the customer sees it.
 */
export const QUOTE_STALL_HOURS = 72

/** True when the row is a still-new lead older than COLD_THRESHOLD_HOURS. */
export function isCold(row: PipelineRow): boolean {
  if (row.kind !== 'lead') return false
  if (!row.trailing || row.trailing.type !== 'status') return false
  if (row.trailing.value !== 'new') return false
  const ageH = (Date.now() - new Date(row.created_at).getTime()) / 3_600_000
  return ageH > COLD_THRESHOLD_HOURS
}

// ── Entity shapes (subset we need for mapping) ────────────────────────────

export type LeadForRow = {
  id: string
  created_at: string
  /** Null on a capture draft — migration 033 dropped the NOT NULL. */
  name: string | null
  phone: string | null
  city: string | null
  zip: string | null
  /** Generated in the database (migration 033); absent on older select lists. */
  is_draft?: boolean | null
  /** Null on a capture draft; the 'carport' column default was dropped in 033. */
  service_type: string | null
  structure_type: string | null
  timeline: string | null
  is_military: boolean | null
  status: string
}

export type PermitForRow = {
  id: string
  created_at: string
  jurisdiction: string
  permit_number: string | null
  permit_type: string | null
  address: string | null
  city: string | null
  valuation: number | null
  wheelhouse_score: number | null
  status: string
}

export type CustomerForRow = {
  id: string
  created_at: string
  name: string
  phone: string
  city: string | null
}

export type QuoteForRow = {
  id: string
  created_at: string
  quote_number: string
  status: string
  total: number | null
  valid_until: string | null
  /** Set only when the quote actually went out (email or SMS). Null while draft. */
  sent_at?: string | null
  customers?: { name: string | null } | null
}

export type JobForRow = {
  id: string
  created_at: string
  job_number: string
  status: string
  job_type: string | null
  city: string | null
  scheduled_date: string | null
  total_contract: number | null
  balance_due: number | null
  customers?: { name: string | null } | null
}

// ── Status pill styles (one source of truth) ───────────────────────────────
//
// Direction 2b draws a status as a small squared chip: a 15% tint of the tone,
// a 40% border of the same, and the tone itself as the text. Five tones cover
// all 21 states, so the tone is what each map stores and TONE is the only place
// a colour is written down. The 21 hardcoded Tailwind palette strings this
// replaced repeated six colours in four near-identical maps.
//
// The exported records still hold class STRINGS, so every consumer
// (ListRow, PipelineList, the three detail pages, calendar.ts) is unchanged.

type Tone = 'info' | 'pending' | 'review' | 'good' | 'bad' | 'muted'

const TONE: Record<Tone, string> = {
  info:    'border border-hq-sky/40 bg-hq-sky/15 text-hq-sky',
  pending: 'border border-hq-gold/40 bg-hq-gold/15 text-hq-gold',
  review:  'border border-hq-violet/40 bg-hq-violet/15 text-hq-violet',
  good:    'border border-hq-green/40 bg-hq-green/15 text-hq-green',
  bad:     'border border-hq-red/40 bg-hq-red/15 text-hq-red',
  muted:   'border border-(--border-subtle) bg-(--surface-3) text-(--text-tertiary)',
}

/**
 * The class for a status with no entry in its map. Previously this was written
 * inline seven times as either 'bg-gray-100 text-gray-600' — which set a light
 * background with no dark counterpart, so it vanished in dark mode — or as ''
 * , which rendered an unstyled chip. Both are now a real muted chip.
 */
export const MUTED_STATUS_CLASS = TONE.muted

const byTone = (m: Record<string, Tone>): Record<string, string> =>
  Object.fromEntries(Object.entries(m).map(([k, tone]) => [k, TONE[tone]]))

export const LEAD_STATUS_CLASS: Record<string, string> = byTone({
  new:       'info',
  contacted: 'pending',
  quoted:    'review',
  won:       'good',
  lost:      'bad',
})

export const PERMIT_STATUS_CLASS: Record<string, string> = byTone({
  new:       'info',
  called:    'pending',
  qualified: 'good',
  junk:      'muted',
  won:       'good',
  lost:      'bad',
})

export const QUOTE_STATUS_CLASS: Record<string, string> = byTone({
  draft:    'muted',
  sent:     'info',
  accepted: 'good',
  declined: 'bad',
  expired:  'muted',
})

export const JOB_STATUS_CLASS: Record<string, string> = byTone({
  scheduled:   'info',
  in_progress: 'pending',
  completed:   'good',
  on_hold:     'muted',
  cancelled:   'bad',
})

// ── Formatters ─────────────────────────────────────────────────────────────

function compactUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n).toLocaleString()}`
}

function readableService(s: string | null): string {
  return s ? s.replace(/_/g, ' ') : ''
}

function isToday(iso: string): boolean {
  const d = new Date(iso)
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth()    === today.getMonth() &&
    d.getDate()     === today.getDate()
  )
}

// ── Mappers ────────────────────────────────────────────────────────────────

/**
 * What to call a lead that may not have a name yet. Capture saves from a phone
 * number alone, so the number is the identity until someone types one — which
 * is also how the draft rows in the inbox are drawn.
 */
export function leadDisplayName(lead: { name: string | null; phone: string | null }): string {
  const name = lead.name?.trim()
  if (name) return name
  const phone = lead.phone?.trim()
  if (phone) return formatUsPhone(phone)
  return 'New lead'
}

/** (254) 555-0118 for a ten-digit US number; unchanged for anything else. */
export function formatUsPhone(raw: string): string {
  const d = raw.replace(/\D/g, '')
  const ten = d.length === 11 && d.startsWith('1') ? d.slice(1) : d
  return ten.length === 10 ? `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}` : raw
}

export function leadToRow(lead: LeadForRow): PipelineRow {
  const badges: PipelineBadge[] = []
  if (lead.timeline === 'asap' && lead.status === 'new') badges.push({ text: 'ASAP', tone: 'asap' })
  if (lead.is_military) badges.push({ text: 'MIL', tone: 'mil' })

  // When the ZIP resolved, city and zip are both meaningful and both show.
  // When it didn't, city is null and formatCityOrZip renders "ZIP 76577"
  // once — not the old "76577 · 76577".
  const locationBits = lead.city
    ? [lead.city, lead.zip].filter(Boolean).join(' · ')
    : formatCityOrZip(null, lead.zip)
  const serviceBits = [readableService(lead.service_type), lead.structure_type].filter(Boolean).join(' · ')
  const secondary = [locationBits, serviceBits].filter(Boolean).join(' — ')

  return {
    kind: 'lead',
    id: lead.id,
    href: `/hq/leads/${lead.id}`,
    primary: leadDisplayName(lead),
    secondary: secondary || 'Recent lead',
    trailing: {
      type: 'status',
      value: lead.status,
      statusClass: LEAD_STATUS_CLASS[lead.status] ?? MUTED_STATUS_CLASS,
    },
    badges,
    isDraft: lead.is_draft ?? isDraftLead(lead),
    created_at: lead.created_at,
    meta: { phone: lead.phone },
  }
}

export function permitToRow(permit: PermitForRow): PipelineRow {
  const badges: PipelineBadge[] = []
  const score = permit.wheelhouse_score ?? 0
  if (score >= 8 && permit.status === 'new') badges.push({ text: 'HOT', tone: 'hot' })

  const jurisdictionLabel = permit.jurisdiction
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const locationBits = [permit.address, permit.city].filter(Boolean).join(', ')

  return {
    kind: 'permit',
    id: permit.id,
    href: '/hq/permit-leads',
    primary: `${jurisdictionLabel}${permit.permit_number ? ` · #${permit.permit_number}` : ''}`,
    secondary: [locationBits, permit.permit_type, permit.valuation ? compactUSD(Number(permit.valuation)) : null]
      .filter(Boolean)
      .join(' — '),
    trailing: score
      ? { type: 'score', value: score }
      : { type: 'status', value: permit.status, statusClass: PERMIT_STATUS_CLASS[permit.status] ?? MUTED_STATUS_CLASS },
    badges,
    created_at: permit.created_at,
  }
}

export function customerToRow(customer: CustomerForRow): PipelineRow {
  const locationBits = [customer.city, customer.phone].filter(Boolean).join(' · ')
  return {
    kind: 'customer',
    id: customer.id,
    href: `/hq/customers/${customer.id}`,
    primary: customer.name,
    secondary: locationBits || 'Customer',
    trailing: { type: 'chevron' },
    created_at: customer.created_at,
    meta: { phone: customer.phone },
  }
}

export function quoteToRow(quote: QuoteForRow): PipelineRow {
  const customerName = quote.customers?.name ?? 'Unknown customer'
  const validBit = quote.valid_until
    ? `Valid ${new Date(quote.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : null

  const badges: PipelineBadge[] = []
  if (quote.status === 'sent' && quote.valid_until) {
    const ms = new Date(quote.valid_until).getTime() - Date.now()
    const days = Math.ceil(ms / 86_400_000)
    if (days >= 0 && days <= 3) badges.push({ text: `Expires ${days}d`, tone: 'warn' })
  }

  const total = Number(quote.total ?? 0)
  return {
    kind: 'quote',
    id: quote.id,
    href: `/hq/quotes/${quote.id}`,
    primary: `${customerName}`,
    secondary: [`#${quote.quote_number}`, validBit].filter(Boolean).join(' · '),
    trailing: {
      type: 'amount',
      value: compactUSD(total),
      sub: quote.status,
      statusClass: QUOTE_STATUS_CLASS[quote.status] ?? MUTED_STATUS_CLASS,
    },
    badges,
    created_at: quote.created_at,
    meta: { sentAt: quote.sent_at ?? null },
  }
}

export function jobToRow(job: JobForRow): PipelineRow {
  const customerName = job.customers?.name ?? 'Unknown customer'
  const scheduledBit = job.scheduled_date
    ? new Date(job.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  const badges: PipelineBadge[] = []
  if (job.scheduled_date && isToday(job.scheduled_date)) badges.push({ text: 'TODAY', tone: 'today' })

  const total = Number(job.total_contract ?? 0)
  const balance = Number(job.balance_due ?? 0)

  return {
    kind: 'job',
    id: job.id,
    href: `/hq/jobs/${job.id}`,
    primary: customerName,
    secondary: [`#${job.job_number}`, job.job_type, scheduledBit, job.city].filter(Boolean).join(' · '),
    trailing: {
      type: 'amount',
      value: compactUSD(balance > 0 ? balance : total),
      sub: job.status.replace('_', ' '),
      statusClass: JOB_STATUS_CLASS[job.status] ?? MUTED_STATUS_CLASS,
    },
    badges,
    created_at: job.created_at,
  }
}

// ── Urgency scoring (Today feed) ───────────────────────────────────────────

/**
 * Returns a 0–100 urgency score for a pipeline row.
 * 0 = don't surface in Today's Needs Attention feed.
 * Higher = more urgent. NextActionCard takes the top row; anything scoring 0 is
 * excluded from Today entirely.
 *
 * Rubric (intentionally conservative — we'd rather miss than cry-wolf):
 *   NEW lead:                70  (+20 asap, +5 military)
 *   HOT permit (score>=8):   80
 *   Quote expiring <=48h:    75
 *   Quote sent + silence 72h: 55
 *   Job scheduled today:     65
 *   + recency boost:         +min(10, hours since creation capped at 10)
 */
/**
 * Hours since a quote was sent.
 *
 * Returns 0 — never stale — when sent_at is unknown, rather than falling back
 * to created_at. That fallback is exactly the bug this replaces: the old code
 * measured silence from quote *creation*, so a quote drafted in March and
 * emailed yesterday already scored as ignored for months.
 *
 * Callers must select sent_at (see quoteToRow). A caller that forgets it loses
 * stall detection, which is the safe direction to fail: no false alarms.
 */
function hoursSinceSent(row: PipelineRow): number {
  const stamp = row.meta?.sentAt
  if (!stamp) return 0
  return Math.max(0, (Date.now() - new Date(stamp).getTime()) / 3_600_000)
}

/**
 * Short human label for *why* a row needs attention.
 *
 * Lives here rather than in NextActionCard so the cron nudges say the same
 * words the dashboard does — a push reading "Quote silent" should land the
 * reader on a card reading "Quote silent".
 */
export function reasonFor(row: PipelineRow): string {
  switch (row.kind) {
    case 'lead': {
      if (row.isDraft) return 'Unfinished draft'
      if (row.badges?.some((b) => b.tone === 'asap')) return 'ASAP lead'
      if (row.badges?.some((b) => b.tone === 'mil')) return 'Military lead'
      return 'New lead'
    }
    case 'permit':
      return 'Hot permit'
    case 'quote': {
      if (row.badges?.some((b) => b.tone === 'warn')) return 'Quote expiring'
      return 'Quote silent'
    }
    case 'job':
      return 'Job today'
    default:
      return 'Needs attention'
  }
}

export function urgencyScore(row: PipelineRow): number {
  // A draft is an unfinished note to self, not an action. Today's "call next"
  // card filters on score > 0, so this single line
  // is what stops a nameless capture becoming the next thing to do.
  if (row.isDraft) return 0

  let score = 0

  const status = extractRowStatus(row)
  const hoursSinceCreated = Math.max(
    0,
    (Date.now() - new Date(row.created_at).getTime()) / 3_600_000,
  )

  switch (row.kind) {
    case 'lead': {
      if (status === 'new') {
        score = 70
        if (row.badges?.some((b) => b.tone === 'asap')) score += 20
        if (row.badges?.some((b) => b.tone === 'mil')) score += 5
        if (hoursSinceCreated > COLD_THRESHOLD_HOURS) score += 15
      }
      break
    }
    case 'permit': {
      const isHot = row.badges?.some((b) => b.tone === 'hot')
      if (isHot && status === 'new') score = 80
      break
    }
    case 'quote': {
      // Quotes reach NeedsAttention when sent + either near-expiry or stale.
      const sub = row.trailing?.type === 'amount' ? row.trailing.sub : null
      if (sub === 'sent') {
        const expiringSoon = row.badges?.some((b) => b.tone === 'warn')
        if (expiringSoon) {
          score = 75
        } else if (hoursSinceSent(row) >= QUOTE_STALL_HOURS) {
          score = 55
        }
      }
      break
    }
    case 'job': {
      if (row.badges?.some((b) => b.tone === 'today')) score = 65
      break
    }
    case 'customer':
      // Customers never bubble into the attention feed on their own.
      break
  }

  if (score > 0) score += Math.min(10, Math.floor(hoursSinceCreated))
  return Math.min(100, score)
}

function extractRowStatus(row: PipelineRow): string | null {
  if (!row.trailing) return null
  if (row.trailing.type === 'status') return row.trailing.value
  if (row.trailing.type === 'amount') return row.trailing.sub ?? null
  return null
}

/**
 * Builds the unified pipeline row list from the 5 entity arrays.
 * Sorted by created_at desc (newest first).
 */
export function buildPipeline(args: {
  leads: LeadForRow[]
  permits: PermitForRow[]
  customers: CustomerForRow[]
  quotes: QuoteForRow[]
  jobs: JobForRow[]
}): PipelineRow[] {
  const rows: PipelineRow[] = [
    ...args.leads.map(leadToRow),
    ...args.permits.map(permitToRow),
    ...args.customers.map(customerToRow),
    ...args.quotes.map(quoteToRow),
    ...args.jobs.map(jobToRow),
  ]
  rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  return rows
}
