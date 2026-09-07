import { describe, it, expect } from 'vitest'
import { staleCutoff, buildStaleDigest, type StaleLeadRow } from '@/lib/jobs/stale-leads'
import { countOpensByQuote, engagementPhrase } from '@/lib/jobs/quote-sweep'
import { dedupeBounces, bounceWindowStart, type BounceEvent } from '@/lib/jobs/bounce-watch'
import { COLD_THRESHOLD_HOURS } from '@/lib/pipeline'
import { todayInCentral } from '@/lib/calendar'

const NOW = new Date('2026-09-07T18:00:00.000Z')

const lead = (over: Partial<StaleLeadRow> = {}): StaleLeadRow => ({
  id: 'l1',
  name: 'Dana Ruiz',
  city: 'Temple',
  zip: '76501',
  service_type: 'metal_carport',
  timeline: 'this_month',
  created_at: '2026-09-06T18:00:00.000Z', // 24h before NOW
  ...over,
})

const bounce = (over: Partial<BounceEvent> = {}): BounceEvent => ({
  resend_id: 're_1',
  event_type: 'email.bounced',
  to_email: 'someone@example.com',
  subject: 'Your Quote Q-1001',
  occurred_at: '2026-09-07T12:00:00.000Z',
  ...over,
})

describe('staleCutoff', () => {
  it('sits exactly COLD_THRESHOLD_HOURS behind now', () => {
    const cutoff = new Date(staleCutoff(NOW)).getTime()
    expect(NOW.getTime() - cutoff).toBe(COLD_THRESHOLD_HOURS * 3_600_000)
  })
})

describe('buildStaleDigest', () => {
  it('names a single lead and describes its wait', () => {
    const d = buildStaleDigest([lead()], NOW)
    expect(d.title).toBe('⏰ No reply yet: Dana Ruiz')
    expect(d.body).toContain('Temple')
    expect(d.body).toContain('24h waiting')
    expect(d.moreCount).toBe(0)
  })

  it('collapses past three leads into a +N more count', () => {
    const rows = ['a', 'b', 'c', 'd', 'e'].map((id) => lead({ id, name: id.toUpperCase() }))
    const d = buildStaleDigest(rows, NOW)
    expect(d.title).toBe('⏰ 5 leads waiting on a reply')
    expect(d.body).toBe('A, B, C +2 more')
    expect(d.items).toHaveLength(3)
    expect(d.moreCount).toBe(2)
  })

  it('falls back to the ZIP when a lead has no resolved city', () => {
    // leads.city is NULL for an unrecognised ZIP; it must never render twice.
    const d = buildStaleDigest([lead({ city: null, zip: '76577' })], NOW)
    expect(d.body).toContain('ZIP 76577')
    expect(d.body).not.toContain('76577 · 76577')
  })

  it('calls out an ASAP lead in the subhead', () => {
    expect(buildStaleDigest([lead({ timeline: 'asap' })], NOW).subhead).toContain('ASAP')
    expect(buildStaleDigest([lead()], NOW).subhead).not.toContain('ASAP')
  })

  it('links each named lead to its HQ page', () => {
    const d = buildStaleDigest([lead({ id: 'abc' })], NOW)
    expect(d.items[0].href).toMatch(/\/hq\/leads\/abc$/)
  })
})

describe('countOpensByQuote', () => {
  it('counts opens and clicks per quote', () => {
    const counts = countOpensByQuote([
      { quote_id: 'q1', resend_id: 'r1', event_type: 'email.opened' },
      { quote_id: 'q1', resend_id: 'r2', event_type: 'email.clicked' },
      { quote_id: 'q2', resend_id: 'r3', event_type: 'email.opened' },
    ])
    expect(counts).toEqual({ q1: 2, q2: 1 })
  })

  it('ignores deliveries and sends', () => {
    const counts = countOpensByQuote([
      { quote_id: 'q1', resend_id: 'r1', event_type: 'email.sent' },
      { quote_id: 'q1', resend_id: 'r2', event_type: 'email.delivered' },
    ])
    expect(counts).toEqual({})
  })

  it('does not double-count a webhook retry', () => {
    // The Resend webhook plain-inserts, so the same event can appear twice.
    const counts = countOpensByQuote([
      { quote_id: 'q1', resend_id: 'r1', event_type: 'email.opened' },
      { quote_id: 'q1', resend_id: 'r1', event_type: 'email.opened' },
    ])
    expect(counts).toEqual({ q1: 1 })
  })

  it('skips events with no quote attached', () => {
    expect(countOpensByQuote([
      { quote_id: null, resend_id: 'r1', event_type: 'email.opened' },
    ])).toEqual({})
  })
})

describe('engagementPhrase', () => {
  it('reads naturally at each count', () => {
    expect(engagementPhrase(0)).toBe('never opened')
    expect(engagementPhrase(1)).toBe('opened once')
    expect(engagementPhrase(4)).toBe('opened 4x')
  })
})

describe('bounceWindowStart', () => {
  it('uses the last successful run when there is one', () => {
    const last = new Date('2026-09-07T06:00:00.000Z')
    expect(bounceWindowStart(last, NOW)).toBe(last.toISOString())
  })

  it('uses a 24h window on a first run rather than all time', () => {
    // Otherwise standing the job up alerts once per bounce in all history.
    const start = new Date(bounceWindowStart(null, NOW)).getTime()
    expect(NOW.getTime() - start).toBe(24 * 3_600_000)
  })
})

describe('dedupeBounces', () => {
  it('collapses repeated deliveries of the same event', () => {
    expect(dedupeBounces([bounce(), bounce(), bounce()])).toHaveLength(1)
  })

  it('keeps distinct recipients apart', () => {
    const out = dedupeBounces([bounce({ resend_id: 'a' }), bounce({ resend_id: 'b' })])
    expect(out).toHaveLength(2)
  })

  it('keeps a bounce and a complaint for the same message apart', () => {
    const out = dedupeBounces([
      bounce({ resend_id: 'a', event_type: 'email.bounced' }),
      bounce({ resend_id: 'a', event_type: 'email.complained' }),
    ])
    expect(out).toHaveLength(2)
  })

  it('preserves input order', () => {
    const out = dedupeBounces([
      bounce({ resend_id: 'a', to_email: 'first@x.com' }),
      bounce({ resend_id: 'b', to_email: 'second@x.com' }),
    ])
    expect(out.map((e) => e.to_email)).toEqual(['first@x.com', 'second@x.com'])
  })
})

describe('todayInCentral', () => {
  it('is still yesterday in Central when UTC has already rolled over', () => {
    // 02:00 UTC on the 8th is 21:00 Central on the 7th. Using the server
    // clock here would expire quotes a day early every evening.
    expect(todayInCentral(new Date('2026-09-08T02:00:00.000Z'))).toBe('2026-09-07')
  })

  it('handles the CST side of the DST boundary', () => {
    // 2026-11-01 is the fall-back; 05:30 UTC is 23:30 Central on Oct 31.
    expect(todayInCentral(new Date('2026-11-01T04:30:00.000Z'))).toBe('2026-10-31')
  })

  it('formats as YYYY-MM-DD so it compares against a date column', () => {
    expect(todayInCentral(new Date('2026-09-07T18:00:00.000Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
