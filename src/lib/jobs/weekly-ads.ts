import type { PushPayload } from '@/lib/push'

/**
 * Monday push: last week on the website, from PostHog.
 *
 * Replaces reading the weekly dashboard email for the headline numbers. The
 * week is the 7 days before the run against the 7 before that. Internal
 * traffic (the owner's own browsers, previews) is excluded the same way the
 * dashboard's filter does it, and the captcha reminder is not a failure.
 */
export const WEEKLY_ADS_QUERY = `
SELECT
  countIf(event = 'lead_created' AND timestamp >= now() - INTERVAL 7 DAY) AS leads,
  countIf(event = 'lead_created' AND timestamp < now() - INTERVAL 7 DAY) AS leads_prev,
  countIf(event = 'lead_created' AND timestamp >= now() - INTERVAL 7 DAY AND session.$channel_type = 'Paid Search') AS leads_paid,
  countIf(event = 'phone_clicked' AND timestamp >= now() - INTERVAL 7 DAY) AS calls,
  countIf(event = 'phone_clicked' AND timestamp < now() - INTERVAL 7 DAY) AS calls_prev,
  uniqIf(person_id, event = '$pageview' AND timestamp >= now() - INTERVAL 7 DAY) AS visitors,
  countIf(event = 'quote_form_failed' AND timestamp >= now() - INTERVAL 7 DAY AND properties.reason != 'captcha_missing') AS failed
FROM events
WHERE timestamp >= now() - INTERVAL 14 DAY
  AND event IN ('lead_created', 'phone_clicked', '$pageview', 'quote_form_failed')
  AND ifNull(toString(properties.internal_traffic), '') != 'true'
`

export type WeeklyNumbers = {
  leads: number
  leads_prev: number
  leads_paid: number
  calls: number
  calls_prev: number
  visitors: number
  failed: number
}

const FIELDS: (keyof WeeklyNumbers)[] = ['leads', 'leads_prev', 'leads_paid', 'calls', 'calls_prev', 'visitors', 'failed']

/** Map a HogQL result row onto named numbers; anything missing reads as 0. */
export function parseWeeklyRow(columns: string[], row: unknown[] | undefined): WeeklyNumbers {
  const out = Object.fromEntries(FIELDS.map((f) => [f, 0])) as WeeklyNumbers
  if (!row) return out
  columns.forEach((name, i) => {
    if ((FIELDS as string[]).includes(name)) {
      const n = Number(row[i])
      out[name as keyof WeeklyNumbers] = Number.isFinite(n) ? n : 0
    }
  })
  return out
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

function change(now: number, before: number, what: string): string | null {
  if (now === before) return null
  return `${what} ${now > before ? 'up' : 'down'} from ${before} the week before`
}

export function buildWeeklyPush(n: WeeklyNumbers, dashboardUrl: string): PushPayload {
  const leads = n.leads_paid > 0 ? `${plural(n.leads, 'lead')} (${n.leads_paid} from Google Ads)` : plural(n.leads, 'lead')
  const parts = [leads, plural(n.calls, 'call tap'), plural(n.visitors, 'visitor')]
  if (n.failed > 0) parts.push(plural(n.failed, 'failed quote send'))

  const moves = [change(n.leads, n.leads_prev, 'Leads'), change(n.calls, n.calls_prev, 'Call taps')].filter(Boolean)
  const body = `${parts.join(' · ')}.${moves.length ? ` ${moves.join('; ')}.` : ''}`

  return {
    title: '📈 Website last week',
    body: body.slice(0, 200),
    url: dashboardUrl,
    tag: 'weekly-ads',
  }
}
