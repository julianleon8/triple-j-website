/**
 * Pure logic for the weekday morning brief — one email that says what came in
 * since the last brief and who is still waiting on a first call.
 *
 * Owner-approved 2026-09-29, after four of the site's first seven leads sat in
 * `new` for months. The stale-lead push fires once per lead, ever (locked
 * 2026-09-07) and that rule stands; this is a different thing — a daily list
 * by email that keeps naming a lead until someone works it.
 *
 * Separate from the route because Next 16 rejects non-route exports from a
 * route.ts, and because this is the part worth testing without a database.
 */

import { formatCityOrZip } from '@/lib/locations'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

export type BriefLeadRow = {
  id: string
  name: string | null
  city: string | null
  zip: string | null
  service_type: string | null
  source: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_content: string | null
  gclid: string | null
  created_at: string
}

export type BriefItem = { primary: string; secondary: string; href: string }

export type MorningBrief = {
  subject: string
  heading: string
  /** One line under the heading: the counts at a glance. */
  subhead: string
  /** Title of the "new" list, carrying the window it covers. */
  newTitle: string
  newItems: BriefItem[]
  newMore: number
  waitingItems: BriefItem[]
  waitingMore: number
  draftCount: number
}

/** Leads named per section before collapsing into "+N more". */
export const BRIEF_LIST_LIMIT = 10

/** A first brief, or one after a long outage, never looks back further than this. */
const MAX_WINDOW_HOURS = 7 * 24
const DEFAULT_WINDOW_HOURS = 24

const TZ = 'America/Chicago'

/**
 * Who gets the brief. The owner named both addresses on 2026-09-29: the Triple J
 * inbox (`SITE.email`, the one owner of that fact) and Julian's own.
 * `MORNING_BRIEF_TO` (comma-separated) replaces the list without a deploy.
 */
export function morningBriefRecipients(env: string | undefined): string[] {
  const fromEnv = (env ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return fromEnv.length > 0 ? fromEnv : [SITE.email, 'julianleon0724@yahoo.com']
}

/** Start of "new since the last brief": the last successful run, bounded to 7 days. */
export function briefWindowStart(lastSuccessAt: Date | null, now: Date): Date {
  const floor = new Date(now.getTime() - MAX_WINDOW_HOURS * 3_600_000)
  if (!lastSuccessAt) return new Date(now.getTime() - DEFAULT_WINDOW_HOURS * 3_600_000)
  return lastSuccessAt < floor ? floor : lastSuccessAt
}

/** Where a lead came from, in the words the owner uses. */
export function sourceLabel(row: BriefLeadRow): string {
  const utm = row.utm_source?.toLowerCase() ?? null
  if (utm === 'fbm') {
    return row.utm_content ? `Marketplace listing ${row.utm_content.toUpperCase()}` : 'Marketplace'
  }
  if (row.gclid || (utm === 'google' && (row.utm_medium === 'cpc' || row.utm_medium === 'paid'))) {
    return 'Google Ads'
  }
  switch (row.source) {
    case 'facebook_messenger': return 'Facebook message'
    case 'facebook_lead_ads': return 'Facebook lead form'
    case 'phone': return 'Phone call'
    case 'voice_memo': return 'Voice memo'
  }
  return utm ? `Website (${row.utm_source})` : 'Website'
}

function waitingFor(createdAt: string, now: Date): string {
  const hours = Math.max(0, Math.floor((now.getTime() - new Date(createdAt).getTime()) / 3_600_000))
  if (hours < 24) return `${hours}h waiting`
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'} waiting`
}

function describe(row: BriefLeadRow, tail: string): string {
  return [
    row.service_type?.replace(/_/g, ' ') ?? null,
    // formatCityOrZip says "Unknown" for neither; the brief just leaves it out.
    row.city?.trim() || row.zip?.trim() ? formatCityOrZip(row.city, row.zip) : null,
    tail,
  ]
    .filter(Boolean)
    .join(' · ')
}

function item(row: BriefLeadRow, tail: string): BriefItem {
  return {
    primary: row.name?.trim() || 'No name yet',
    secondary: describe(row, tail),
    href: `${getSiteUrl()}/hq/leads/${row.id}`,
  }
}

function formatWhen(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/**
 * The brief's wording. `newLeads` newest first; `waiting` oldest first — the
 * lead that has waited longest is the one to call first. `waitingTotal` is the
 * full count, which may exceed the rows passed.
 */
export function buildMorningBrief(input: {
  newLeads: BriefLeadRow[]
  waiting: BriefLeadRow[]
  waitingTotal: number
  draftCount: number
  since: Date
  now: Date
}): MorningBrief {
  const { newLeads, waiting, waitingTotal, draftCount, since, now } = input

  const newPart = newLeads.length === 0 ? 'no new leads' : plural(newLeads.length, 'new lead', 'new leads')
  const waitingPart = waitingTotal === 0 ? null : `${waitingTotal} waiting on a call`
  const subject = `Morning brief: ${[newPart, waitingPart].filter(Boolean).join(' · ')}`

  const heading =
    waitingTotal > 0
      ? `Call ${waiting[0]?.name?.trim() || 'the oldest lead'} first`
      : newLeads.length > 0
        ? plural(newLeads.length, 'new lead since the last brief', 'new leads since the last brief')
        : 'All caught up'

  const newShown = newLeads.slice(0, BRIEF_LIST_LIMIT)
  const waitingShown = waiting.slice(0, BRIEF_LIST_LIMIT)

  return {
    subject,
    heading,
    subhead: [
      newLeads.length === 0 ? 'No new leads' : plural(newLeads.length, 'new lead', 'new leads'),
      `${waitingTotal} waiting on a call`,
      draftCount > 0 ? plural(draftCount, 'draft', 'drafts') : null,
    ].filter(Boolean).join(' · '),
    newTitle: `New since ${formatWhen(since)} Central`,
    newItems: newShown.map((row) => item(row, sourceLabel(row))),
    newMore: Math.max(0, newLeads.length - newShown.length),
    waitingItems: waitingShown.map((row) => item(row, waitingFor(row.created_at, now))),
    waitingMore: Math.max(0, waitingTotal - waitingShown.length),
    draftCount,
  }
}
