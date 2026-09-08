import { describe, it, expect } from 'vitest'
import { HQ_TABS, HQ_DESKTOP_NAV, titleForPath } from './nav'

describe('HQ_TABS', () => {
  it('is Today, Leads, Capture, Jobs, More', () => {
    expect(HQ_TABS.map((t) => t.label)).toEqual(['Today', 'Leads', 'Capture', 'Jobs', 'More'])
  })

  it('gave Gallery its tab to Capture, and kept Gallery on desktop', () => {
    expect(HQ_TABS.map((t) => t.href)).not.toContain('/hq/gallery')
    expect(HQ_DESKTOP_NAV.map((n) => n.href)).toContain('/hq/gallery')
  })

  it('derives the desktop nav from the tabs, so the two cannot drift', () => {
    for (const tab of HQ_TABS) {
      expect(HQ_DESKTOP_NAV.some((n) => n.href === tab.href && n.label === tab.label)).toBe(true)
    }
  })

  it.each([
    ['/hq', 'Today'],
    ['/hq/leads', 'Leads'],
    ['/hq/leads/abc-123', 'Leads'],
    ['/hq/capture', 'Capture'],
    ['/hq/capture?id=x', 'Capture'],
    ['/hq/jobs/9', 'Jobs'],
    ['/hq/more/stats', 'More'],
  ])('%s activates exactly one tab (%s)', (path, label) => {
    const active = HQ_TABS.filter((t) => t.match(path.split('?')[0]))
    expect(active.map((t) => t.label)).toEqual([label])
  })

  it('leaves no tab active on routes that are not tabs', () => {
    for (const p of ['/hq/customers', '/hq/quotes', '/hq/settings', '/hq/calendar']) {
      expect(HQ_TABS.filter((t) => t.match(p))).toHaveLength(0)
    }
  })

  it('does not light up Today on every route', () => {
    expect(HQ_TABS[0].match('/hq/leads')).toBe(false)
  })
})

describe('titleForPath', () => {
  it.each([
    ['/hq', 'Today'],
    ['/hq/leads', 'Leads'],
    ['/hq/leads/abc', 'Lead'],
    ['/hq/jobs', 'Jobs'],
    ['/hq/jobs/abc', 'Job'],
    ['/hq/customers', 'Customers'],
    ['/hq/customers/abc', 'Customer'],
    ['/hq/quotes', 'Quotes'],
    ['/hq/quotes/abc', 'Quote'],
    ['/hq/capture', 'New Lead'],
    ['/hq/permit-leads', 'Permits'],
    ['/hq/gallery', 'Gallery'],
    ['/hq/more', 'More'],
    ['/hq/more/stats', 'Stats'],
    ['/hq/settings', 'Settings'],
    ['/hq/settings/logs', 'Logs'],
    ['/hq/settings/testing', 'Testing'],
    ['/hq/settings/quickbooks', 'QuickBooks'],
    ['/hq/settings/notifications', 'Notifications'],
  ])('%s -> %s', (path, title) => {
    expect(titleForPath(path)).toBe(title)
  })

  it('names the four routes that used to fall through to "Triple J"', () => {
    // These had no entry in the old titleFor and all rendered as "Triple J".
    expect(titleForPath('/hq/calendar')).toBe('Calendar')
    expect(titleForPath('/hq/calculator')).toBe('Calculator')
    expect(titleForPath('/hq/activity')).toBe('Activity')
    expect(titleForPath('/hq/partners')).toBe('Partners')
    expect(titleForPath('/hq/settings/passkeys')).toBe('Passkeys')
  })

  it('prefers the longer prefix regardless of declaration order', () => {
    expect(titleForPath('/hq/more/stats')).toBe('Stats')
    expect(titleForPath('/hq/settings/logs')).toBe('Logs')
    // permit-leads must not be swallowed by the /hq/leads entry
    expect(titleForPath('/hq/permit-leads')).toBe('Permits')
  })

  it('falls back for anything genuinely unknown', () => {
    expect(titleForPath('/hq/nope')).toBe('Triple J')
  })
})
