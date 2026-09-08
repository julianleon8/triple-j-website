import {
  Home,
  Inbox,
  PhoneCall,
  Hammer,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'

/**
 * The one description of HQ navigation.
 *
 * There were three, and they had already drifted: BottomTabBar's TABS and
 * HqChrome's NAV listed the same five destinations but decided "is this tab
 * active?" two different ways, and HqHeader's titleFor() knew about routes
 * neither nav did (Permits, Customers, Quotes, Settings) while having no entry
 * at all for /hq/calendar, /hq/calculator, /hq/activity or /hq/partners — all
 * four of which rendered as "Triple J". Adding the Capture tab across three
 * lists with three matching rules is how a fourth divergence starts.
 *
 * No 'use client' and no JSX here: icons are component references, so both a
 * server and a client component can import this.
 */

export type HqTab = {
  href: string
  label: string
  icon: LucideIcon
  /** The single definition of "this tab is active", shared by both navs. */
  match: (pathname: string) => boolean
}

/**
 * The five bottom tabs. Gallery moved into the More hub to make room for
 * Capture — the redesign is built around getting a caller into the database
 * before hanging up, and that has to be one thumb-reach away.
 */
export const HQ_TABS: HqTab[] = [
  { href: '/hq',         label: 'Today',   icon: Home,           match: (p) => p === '/hq' },
  { href: '/hq/leads',   label: 'Leads',   icon: Inbox,          match: (p) => p.startsWith('/hq/leads') },
  { href: '/hq/capture', label: 'Capture', icon: PhoneCall,      match: (p) => p.startsWith('/hq/capture') },
  { href: '/hq/jobs',    label: 'Jobs',    icon: Hammer,         match: (p) => p.startsWith('/hq/jobs') },
  { href: '/hq/more',    label: 'More',    icon: MoreHorizontal, match: (p) => p.startsWith('/hq/more') },
]

/**
 * Desktop nav, derived from the tabs so the two cannot diverge again. Desktop
 * keeps Gallery, which has the room for it and is genuinely easier to manage
 * on a big screen; the phone reaches it through More.
 */
export const HQ_DESKTOP_NAV: { href: string; label: string; match: (p: string) => boolean }[] = [
  ...HQ_TABS.map(({ href, label, match }) => ({ href, label, match })),
  { href: '/hq/gallery', label: 'Gallery', match: (p: string) => p.startsWith('/hq/gallery') },
]

/**
 * Detail routes, checked before the list prefixes so /hq/leads/<id> reads
 * "Lead" rather than "Leads".
 */
const DETAIL_TITLES: [RegExp, string][] = [
  [/^\/hq\/leads\/[^/]+$/, 'Lead'],
  [/^\/hq\/jobs\/[^/]+$/, 'Job'],
  [/^\/hq\/customers\/[^/]+$/, 'Customer'],
  [/^\/hq\/quotes\/[^/]+$/, 'Quote'],
]

/**
 * Longest-prefix-first, so /hq/more/stats and /hq/settings/logs win over
 * /hq/more and /hq/settings. Sorted at module load rather than hand-ordered,
 * which is what let the old hand-ordered chain grow holes.
 */
const PREFIX_TITLES: [string, string][] = [
  ['/hq/leads', 'Leads'],
  ['/hq/permit-leads', 'Permits'],
  ['/hq/capture', 'New Lead'],
  ['/hq/customers', 'Customers'],
  ['/hq/quotes', 'Quotes'],
  ['/hq/jobs', 'Jobs'],
  ['/hq/gallery', 'Gallery'],
  ['/hq/calendar', 'Calendar'],
  ['/hq/calculator', 'Calculator'],
  ['/hq/activity', 'Activity'],
  ['/hq/partners', 'Partners'],
  ['/hq/more/stats', 'Stats'],
  ['/hq/more', 'More'],
  ['/hq/settings/notifications', 'Notifications'],
  ['/hq/settings/passkeys', 'Passkeys'],
  ['/hq/settings/testing', 'Testing'],
  ['/hq/settings/logs', 'Logs'],
  ['/hq/settings/quickbooks', 'QuickBooks'],
  ['/hq/settings', 'Settings'],
].sort((a, b) => b[0].length - a[0].length) as [string, string][]

/**
 * Screen title for the mobile header. The old version carried a `tab` argument
 * for a `?tab=funnel` branch that had been dead since hq/page.tsx started
 * redirecting that param away.
 */
export function titleForPath(pathname: string): string {
  if (pathname === '/hq') return 'Today'
  for (const [re, title] of DETAIL_TITLES) if (re.test(pathname)) return title
  for (const [prefix, title] of PREFIX_TITLES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return title
  }
  return 'Triple J'
}
