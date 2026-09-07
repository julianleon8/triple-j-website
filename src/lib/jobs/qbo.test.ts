import { describe, it, expect } from 'vitest'
import { assessRefreshToken, REFRESH_WARN_DAYS } from './qbo-keepalive'
import { toExpenseLines, type ReceiptRow } from './receipt-push'
import { receiptDocNumber } from '@/lib/qbo'

const NOW = new Date('2026-09-07T12:00:00.000Z')
const inDays = (n: number) => new Date(NOW.getTime() + n * 86_400_000).toISOString()

const receipt = (over: Partial<ReceiptRow> = {}): ReceiptRow => ({
  id: '3f2b1a4c-9d8e-4f7a-b6c5-1e2d3c4b5a69',
  job_id: 'job-1',
  vendor: 'Home Depot',
  receipt_date: '2026-09-01',
  total: 240,
  line_items: [],
  memo: null,
  image_url: 'https://example.com/r.jpg',
  ...over,
})

describe('assessRefreshToken', () => {
  it('is quiet while there is plenty of runway', () => {
    const v = assessRefreshToken(inDays(90), NOW)
    expect(v.severity).toBe('ok')
    expect(v.shouldWarn).toBe(false)
    expect(v.daysLeft).toBe(90)
  })

  it('warns inside the reconnect window', () => {
    const v = assessRefreshToken(inDays(REFRESH_WARN_DAYS - 1), NOW)
    expect(v.severity).toBe('warn')
    expect(v.shouldWarn).toBe(true)
  })

  it('does not warn exactly at the boundary', () => {
    expect(assessRefreshToken(inDays(REFRESH_WARN_DAYS), NOW).shouldWarn).toBe(false)
  })

  it('reports an already-dead token as expired', () => {
    const v = assessRefreshToken(inDays(-3), NOW)
    expect(v.severity).toBe('expired')
    expect(v.shouldWarn).toBe(true)
    expect(v.daysLeft).toBeLessThan(0)
  })
})

describe('receiptDocNumber', () => {
  it('fits inside QBO’s 21-character DocNumber limit', () => {
    expect(receiptDocNumber(receipt().id).length).toBeLessThanOrEqual(21)
  })

  it('is stable for the same receipt', () => {
    // This is the whole idempotency guarantee — a retry must produce the same
    // DocNumber or the duplicate check cannot recognise the earlier Purchase.
    const id = receipt().id
    expect(receiptDocNumber(id)).toBe(receiptDocNumber(id))
  })

  it('differs between receipts', () => {
    expect(receiptDocNumber('aaaaaaaa-1111-2222-3333-444444444444')).not.toBe(
      receiptDocNumber('bbbbbbbb-1111-2222-3333-444444444444'),
    )
  })

  it('contains no dashes from the uuid', () => {
    expect(receiptDocNumber(receipt().id).slice(2)).not.toContain('-')
  })
})

describe('toExpenseLines', () => {
  it('returns nothing when the receipt has no line items', () => {
    expect(toExpenseLines(receipt())).toEqual([])
  })

  it('prefers an explicit line total', () => {
    const lines = toExpenseLines(
      receipt({ line_items: [{ description: 'Anchors', qty: 4, unit_price: 5, total: 22 }] }),
    )
    expect(lines).toEqual([{ description: 'Anchors', amount: 22 }])
  })

  it('falls back to qty x unit price', () => {
    const lines = toExpenseLines(
      receipt({ line_items: [{ description: 'Tube steel', qty: 3, unit_price: 12.5 }] }),
    )
    expect(lines).toEqual([{ description: 'Tube steel', amount: 37.5 }])
  })

  it('falls back to the receipt total when a line has neither', () => {
    const lines = toExpenseLines(
      receipt({ total: 99, line_items: [{ description: 'Misc' }] }),
    )
    expect(lines).toEqual([{ description: 'Misc', amount: 99 }])
  })
})
