import { describe, it, expect } from 'vitest'
import { leadToRow, urgencyScore, reasonFor, type LeadForRow } from './pipeline'

function lead(over: Partial<LeadForRow> = {}): LeadForRow {
  return {
    id: 'l1',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    name: 'Dana Ruiz',
    phone: '2545550118',
    city: 'Temple',
    zip: '76501',
    service_type: 'carport',
    structure_type: null,
    timeline: null,
    is_military: null,
    status: 'new',
    ...over,
  }
}

describe('a draft never becomes the next call', () => {
  it('scores 0 even though it is a new lead less than 12h old', () => {
    const complete = leadToRow(lead())
    // The same row, only missing a name, must not outrank anything.
    const draft = leadToRow(lead({ name: null, service_type: null, is_draft: true }))

    expect(urgencyScore(complete)).toBeGreaterThan(0)
    expect(urgencyScore(draft)).toBe(0)
  })

  it('scores 0 for an old draft too, so ageing cannot promote it', () => {
    const old = leadToRow(
      lead({
        name: null,
        service_type: null,
        is_draft: true,
        created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      }),
    )
    expect(urgencyScore(old)).toBe(0)
  })

  it('scores 0 for a draft carrying the badges that normally boost a lead', () => {
    const draft = leadToRow(
      lead({ name: null, service_type: null, is_draft: true, timeline: 'asap', is_military: true }),
    )
    expect(urgencyScore(draft)).toBe(0)
  })

  it('labels a draft as unfinished rather than as a new lead', () => {
    expect(reasonFor(leadToRow(lead({ name: null, service_type: null, is_draft: true })))).toBe(
      'Unfinished draft',
    )
  })
})

describe('leadToRow marks drafts', () => {
  it('trusts the generated column when the query selected it', () => {
    expect(leadToRow(lead({ is_draft: true })).isDraft).toBe(true)
    expect(leadToRow(lead({ is_draft: false })).isDraft).toBe(false)
  })

  it('falls back to the same predicate when is_draft was not selected', () => {
    // Older select lists do not ask for is_draft; the row must still be right.
    expect(leadToRow(lead({ name: null })).isDraft).toBe(true)
    expect(leadToRow(lead({ service_type: null })).isDraft).toBe(true)
    expect(leadToRow(lead()).isDraft).toBe(false)
  })

  it('identifies a nameless lead by its phone number, not "undefined"', () => {
    const row = leadToRow(lead({ name: null, phone: '2545550118' }))
    expect(row.primary).toBe('(254) 555-0118')
  })

  it('falls back again when there is no phone either', () => {
    expect(leadToRow(lead({ name: null, phone: null })).primary).toBe('New lead')
  })

  it('does not throw on a null service_type', () => {
    expect(() => leadToRow(lead({ service_type: null }))).not.toThrow()
  })
})
