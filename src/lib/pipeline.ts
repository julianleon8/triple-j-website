/**
 * Unified pipeline row — every HQ entity (lead, permit, customer, quote, job)
 * maps into this shape so a single <ListRow> can render any of them.
 *
 * Used by the Funnel tab (all entities) and the Now tab (filtered slices).
 */

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
}

// ── Entity shapes (subset we need for mapping) ────────────────────────────

export type LeadForRow = {
  id: string
  created_at: string
  name: string
  phone: string
  city: string | null
  zip: string | null
  service_type: string
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

export const LEAD_STATUS_CLASS: Record<string, string> = {
  new:       'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  contacted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  quoted:    'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  won:       'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  lost:      'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

export const PERMIT_STATUS_CLASS: Record<string, string> = {
  new:        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  called:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  qualified:  'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  junk:       'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400',
  won:        'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  lost:       'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

export const QUOTE_STATUS_CLASS: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
  sent:      'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  accepted:  'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  declined:  'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  expired:   'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400',
}

export const JOB_STATUS_CLASS: Record<string, string> = {
  scheduled:   'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  completed:   'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  on_hold:     'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400',
  cancelled:   'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

// ── Formatters ─────────────────────────────────────────────────────────────

function compactUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n).toLocaleString()}`
}

function readableService(s: string): string {
  return s.replace(/_/g, ' ')
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

export function leadToRow(lead: LeadForRow): PipelineRow {
  const badges: PipelineBadge[] = []
  if (lead.timeline === 'asap' && lead.status === 'new') badges.push({ text: 'ASAP', tone: 'asap' })
  if (lead.is_military) badges.push({ text: 'MIL', tone: 'mil' })

  const locationBits = [lead.city, lead.zip].filter(Boolean).join(' · ')
  const serviceBits = [readableService(lead.service_type), lead.structure_type].filter(Boolean).join(' · ')
  const secondary = [locationBits, serviceBits].filter(Boolean).join(' — ')

  return {
    kind: 'lead',
    id: lead.id,
    href: '/hq',
    primary: lead.name,
    secondary: secondary || 'Recent lead',
    trailing: {
      type: 'status',
      value: lead.status,
      statusClass: LEAD_STATUS_CLASS[lead.status] ?? 'bg-gray-100 text-gray-600',
    },
    badges,
    created_at: lead.created_at,
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
      : { type: 'status', value: permit.status, statusClass: PERMIT_STATUS_CLASS[permit.status] ?? '' },
    badges,
    created_at: permit.created_at,
  }
}

export function customerToRow(customer: CustomerForRow): PipelineRow {
  const locationBits = [customer.city, customer.phone].filter(Boolean).join(' · ')
  return {
    kind: 'customer',
    id: customer.id,
    href: '/hq/customers',
    primary: customer.name,
    secondary: locationBits || 'Customer',
    trailing: { type: 'chevron' },
    created_at: customer.created_at,
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
      statusClass: QUOTE_STATUS_CLASS[quote.status] ?? '',
    },
    badges,
    created_at: quote.created_at,
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
    href: '/hq/jobs',
    primary: customerName,
    secondary: [`#${job.job_number}`, job.job_type, scheduledBit, job.city].filter(Boolean).join(' · '),
    trailing: {
      type: 'amount',
      value: compactUSD(balance > 0 ? balance : total),
      sub: job.status.replace('_', ' '),
      statusClass: JOB_STATUS_CLASS[job.status] ?? '',
    },
    badges,
    created_at: job.created_at,
  }
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
