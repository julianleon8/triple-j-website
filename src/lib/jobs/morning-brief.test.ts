import { describe, expect, it } from 'vitest'

import {
  BRIEF_LIST_LIMIT,
  briefWindowStart,
  buildMorningBrief,
  morningBriefRecipients,
  sourceLabel,
  type BriefLeadRow,
} from './morning-brief'

const now = new Date('2026-09-30T12:00:00Z') // Wed 7:00 am Central
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString()

function lead(over: Partial<BriefLeadRow> = {}): BriefLeadRow {
  return {
    id: 'lead-1',
    name: 'Maria Lopez',
    city: 'Belton',
    zip: null,
    service_type: 'carport',
    source: 'website_form',
    utm_source: null,
    utm_medium: null,
    utm_content: null,
    gclid: null,
    created_at: hoursAgo(3),
    ...over,
  }
}

describe('morningBriefRecipients', () => {
  it('defaults to the two addresses the owner named', () => {
    expect(morningBriefRecipients(undefined)).toEqual(['julianleon@triplejmetaltx.com', 'julianleon0724@yahoo.com'])
    expect(morningBriefRecipients('  ')).toHaveLength(2)
  })

  it('lets MORNING_BRIEF_TO replace the list', () => {
    expect(morningBriefRecipients('a@x.com, b@y.com')).toEqual(['a@x.com', 'b@y.com'])
  })
})

describe('briefWindowStart', () => {
  it('starts at the last successful brief', () => {
    const last = new Date(hoursAgo(24))
    expect(briefWindowStart(last, now)).toEqual(last)
  })

  it('looks back 24 hours on the first run', () => {
    expect(briefWindowStart(null, now).toISOString()).toBe(hoursAgo(24))
  })

  it('never looks back more than 7 days', () => {
    expect(briefWindowStart(new Date(hoursAgo(24 * 30)), now).toISOString()).toBe(hoursAgo(24 * 7))
  })
})

describe('sourceLabel', () => {
  it('names the Marketplace listing from the tracked link', () => {
    expect(sourceLabel(lead({ utm_source: 'fbm', utm_content: 'a' }))).toBe('Marketplace listing A')
  })

  it('recognises Google Ads by click ID or cpc tagging', () => {
    expect(sourceLabel(lead({ gclid: 'abc' }))).toBe('Google Ads')
    expect(sourceLabel(lead({ utm_source: 'google', utm_medium: 'cpc' }))).toBe('Google Ads')
  })

  it('falls back to the lead source', () => {
    expect(sourceLabel(lead({ source: 'facebook_messenger' }))).toBe('Facebook message')
    expect(sourceLabel(lead({ source: 'phone' }))).toBe('Phone call')
    expect(sourceLabel(lead())).toBe('Website')
    expect(sourceLabel(lead({ utm_source: 'newsletter' }))).toBe('Website (newsletter)')
  })
})

describe('buildMorningBrief', () => {
  const since = new Date(hoursAgo(24))

  it('leads with the longest-waiting lead and counts both lists in the subject', () => {
    const brief = buildMorningBrief({
      newLeads: [lead({ id: 'n1', utm_source: 'fbm', utm_content: 'c' })],
      waiting: [lead({ id: 'w1', name: 'Old Lead', city: null, zip: '76502', created_at: hoursAgo(24 * 100) })],
      waitingTotal: 4,
      draftCount: 1,
      since,
      now,
    })
    expect(brief.subject).toBe('Morning brief: 1 new lead · 4 waiting on a call')
    expect(brief.heading).toBe('Call Old Lead first')
    expect(brief.waitingItems[0].secondary).toBe('carport · ZIP 76502 · 100 days waiting')
    expect(brief.waitingItems[0].href).toMatch(/\/hq\/leads\/w1$/)
    expect(brief.waitingMore).toBe(3)
    expect(brief.newItems[0].secondary).toBe('carport · Belton · Marketplace listing C')
    expect(brief.draftCount).toBe(1)
  })

  it('says all caught up when there is nothing to do', () => {
    const brief = buildMorningBrief({ newLeads: [], waiting: [], waitingTotal: 0, draftCount: 0, since, now })
    expect(brief.subject).toBe('Morning brief: no new leads')
    expect(brief.heading).toBe('All caught up')
  })

  it('names a lead with no name and leaves out an unknown place', () => {
    const brief = buildMorningBrief({
      newLeads: [lead({ name: null, city: null, zip: null, service_type: null, created_at: hoursAgo(2) })],
      waiting: [],
      waitingTotal: 0,
      draftCount: 0,
      since,
      now,
    })
    expect(brief.newItems[0]).toMatchObject({ primary: 'No name yet', secondary: 'Website' })
    expect(brief.heading).toBe('1 new lead since the last brief')
  })

  it('caps each list and counts the rest', () => {
    const many = Array.from({ length: BRIEF_LIST_LIMIT + 5 }, (_, i) => lead({ id: `n${i}` }))
    const brief = buildMorningBrief({ newLeads: many, waiting: [], waitingTotal: 0, draftCount: 0, since, now })
    expect(brief.newItems).toHaveLength(BRIEF_LIST_LIMIT)
    expect(brief.newMore).toBe(5)
  })

  it('titles the new list with its window in Central time and sums up under the heading', () => {
    const brief = buildMorningBrief({ newLeads: [lead()], waiting: [], waitingTotal: 4, draftCount: 1, since, now })
    expect(brief.newTitle).toBe('New since Tue, Sep 29, 7:00 AM Central')
    expect(brief.subhead).toBe('1 new lead · 4 waiting on a call · 1 draft')
  })
})
