import { describe, expect, it } from 'vitest'
import { countSegments, inSegment, QUOTE_SEGMENTS } from './quote-segments'

const ALL_STATUSES = ['draft', 'sent', 'accepted', 'declined', 'expired']

describe('inSegment', () => {
  it('puts every status in "all"', () => {
    for (const s of ALL_STATUSES) expect(inSegment(s, 'all')).toBe(true)
  })

  it('treats a missing status as "all" only', () => {
    expect(inSegment(null, 'all')).toBe(true)
    expect(inSegment(undefined, 'all')).toBe(true)
    for (const seg of QUOTE_SEGMENTS.filter((s) => s !== 'all')) {
      expect(inSegment(null, seg)).toBe(false)
      expect(inSegment(undefined, seg)).toBe(false)
    }
  })

  it('maps sent to out, accepted to won', () => {
    expect(inSegment('sent', 'out')).toBe(true)
    expect(inSegment('accepted', 'won')).toBe(true)
    expect(inSegment('sent', 'won')).toBe(false)
    expect(inSegment('accepted', 'out')).toBe(false)
  })

  it('counts both declined and expired as lost', () => {
    expect(inSegment('declined', 'lost')).toBe(true)
    expect(inSegment('expired', 'lost')).toBe(true)
  })

  // The point of the decision, not an accident: quote building left HQ, so a
  // draft is a legacy row and belongs to no outcome segment.
  it('keeps draft out of every segment but all', () => {
    expect(inSegment('draft', 'all')).toBe(true)
    expect(inSegment('draft', 'out')).toBe(false)
    expect(inSegment('draft', 'won')).toBe(false)
    expect(inSegment('draft', 'lost')).toBe(false)
  })

  it('never puts one status in two outcome segments', () => {
    const outcomes = QUOTE_SEGMENTS.filter((s) => s !== 'all')
    for (const s of ALL_STATUSES) {
      expect(outcomes.filter((seg) => inSegment(s, seg)).length).toBeLessThanOrEqual(1)
    }
  })

  it('ignores unknown statuses rather than guessing', () => {
    expect(inSegment('somethingelse', 'out')).toBe(false)
    expect(inSegment('somethingelse', 'lost')).toBe(false)
    expect(inSegment('somethingelse', 'all')).toBe(true)
  })
})

describe('countSegments', () => {
  it('counts all as the full length, including drafts and nulls', () => {
    const c = countSegments(['draft', 'sent', 'accepted', 'declined', 'expired', null])
    expect(c.all).toBe(6)
    expect(c.out).toBe(1)
    expect(c.won).toBe(1)
    expect(c.lost).toBe(2)
  })

  it('returns zeroes for an empty list', () => {
    expect(countSegments([])).toEqual({ out: 0, won: 0, lost: 0, all: 0 })
  })

  // Guards the reason this module exists: the server counts and the client
  // filters through the same predicate, so a segment can never advertise a
  // count it cannot then render.
  it('agrees with filtering by the same predicate', () => {
    const statuses = ['draft', 'sent', 'sent', 'accepted', 'declined', 'expired', null]
    const counts = countSegments(statuses)
    for (const seg of QUOTE_SEGMENTS) {
      expect(statuses.filter((s) => inSegment(s, seg)).length).toBe(counts[seg])
    }
  })
})
