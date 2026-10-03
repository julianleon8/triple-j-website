import { describe, expect, it } from 'vitest'

import { QUOTES, quoteDate } from './quotes'

describe('quote copy', () => {
  it('keeps the carrier opt-out keyword in both languages', () => {
    for (const locale of ['en', 'es'] as const) {
      expect(QUOTES[locale].sms('Q-1', 'Ana', '$3,000', 'https://x.test/q')).toContain('STOP')
    }
  })

  it('keeps the English SMS exactly as it was', () => {
    expect(QUOTES.en.sms('Q-1', 'Ana', '$3,000', 'https://x.test/q')).toBe(
      'Triple J Metal — Quote Q-1 for Ana: $3,000. Review + accept: https://x.test/q. Reply STOP to opt out.',
    )
  })

  it('dates a quote in the customer language, reading date-only values as UTC', () => {
    expect(quoteDate('2026-11-02', 'en')).toBe('November 2, 2026')
    expect(quoteDate('2026-11-02', 'es')).toBe('2 de noviembre de 2026')
  })
})
