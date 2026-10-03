import { describe, expect, it } from 'vitest'

import { leadCustomerConfirmationSubject, leadCustomerConfirmationText } from './LeadCustomerConfirmation'

const base = { name: 'Ana', phone: '254-555-0100', city: 'Temple', serviceType: 'carport', isMilitary: true, timeline: 'asap' }

describe('lead confirmation email', () => {
  it('keeps the English email as it was', () => {
    const text = leadCustomerConfirmationText(base)
    expect(text).toContain('We got your carport request for Temple.')
    expect(text).toContain('call you back at 254-555-0100 today')
    expect(leadCustomerConfirmationSubject()).toBe('We got your quote request — Triple J Metal')
  })

  it('writes to a Spanish-site lead in Spanish, with the same promise', () => {
    const text = leadCustomerConfirmationText({ ...base, locale: 'es' })
    expect(text).toContain('Recibimos tu solicitud de cochera en Temple.')
    expect(text).toContain('te llamará al 254-555-0100 hoy mismo')
    expect(text).toContain('7% de descuento')
    expect(leadCustomerConfirmationSubject('es')).toBe('Recibimos tu solicitud de cotización — Triple J Metal')
    const later = leadCustomerConfirmationText({ ...base, locale: 'es', timeline: 'this_month' })
    expect(later).toContain('en menos de 24 horas')
  })

  it('names no one', () => {
    for (const locale of ['en', 'es'] as const) {
      expect(leadCustomerConfirmationText({ ...base, locale })).not.toMatch(/\b(Juan|Julian|Freddy)\b/)
    }
  })
})
