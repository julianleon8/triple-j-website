import { describe, it, expect } from 'vitest'

import { SITE } from '@/lib/site'

import { napSignature } from './nap'
import { leadCustomerConfirmationText } from './LeadCustomerConfirmation'
import { quoteEmailText } from './QuoteEmail'

// The NAP consolidation moved the phone and address out of every email template
// and into src/lib/site.ts. Nothing covered these templates, so a broken import
// or a stray literal would have failed silently on the lead-notification path.

describe('napSignature', () => {
  it('uses the brand name and derives every part from SITE', () => {
    const sig = napSignature()
    expect(sig).toBe(`${SITE.name} · ${SITE.addressOneLine} · ${SITE.phone}`)
    expect(sig).toContain('254-346-7764')
    expect(sig).toContain('3319 Tem-Bel Ln, Temple, TX 76502')
  })

  it('uses the registered legal name for contractual copy', () => {
    expect(napSignature({ legal: true }).startsWith(SITE.legalName)).toBe(true)
    expect(napSignature().startsWith(`${SITE.name} ·`)).toBe(true)
  })
})

describe('email plaintext bodies', () => {
  it('renders the lead confirmation with a real phone number, not an unresolved template', () => {
    const text = leadCustomerConfirmationText({
      name: 'Test Customer',
      phone: '555-0100',
      city: 'Temple',
      serviceType: 'carport',
      isMilitary: false,
    })
    expect(text).toContain(SITE.phone)
    expect(text).toContain(napSignature())
    // Catches the failure mode where ${SITE.phone} lands in a plain string.
    expect(text).not.toContain('${')
  })

  it('renders a quote email under the legal name', () => {
    const text = quoteEmailText({
      customerName: 'Test Customer',
      quoteNumber: 'Q-1001',
      lineItems: [
        { description: '20x20 carport', quantity: 1, unit_price: 3000, total_price: 3000 },
      ],
      subtotal: 3000,
      taxAmount: 0,
      total: 3000,
      validUntil: '2026-10-01',
      acceptUrl: 'https://example.com/quotes/token',
    })
    expect(text).toContain(SITE.phone)
    expect(text).toContain(napSignature({ legal: true }))
    expect(text).not.toContain('${')
  })
})
