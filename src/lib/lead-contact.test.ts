import { describe, expect, it } from 'vitest'
import { dialablePhone, isMessengerLead } from './lead-contact'

describe('dialablePhone', () => {
  it('cleans a real US number for a tel:/sms: link', () => {
    expect(dialablePhone('(254) 555-0142')).toBe('2545550142')
    expect(dialablePhone('+1 254 555 0142')).toBe('+12545550142')
    expect(dialablePhone('254.555.0142')).toBe('2545550142')
  })

  it('rejects the placeholders sources store when there is no phone', () => {
    expect(dialablePhone('messenger')).toBeNull()
    expect(dialablePhone('Not provided')).toBeNull()
    expect(dialablePhone('FB-PSID-1234567890123456')).toBeNull()
  })

  it('rejects empty and too-short values', () => {
    expect(dialablePhone(null)).toBeNull()
    expect(dialablePhone(undefined)).toBeNull()
    expect(dialablePhone('')).toBeNull()
    expect(dialablePhone('555-0142')).toBeNull()
  })
})

describe('isMessengerLead', () => {
  it('knows a Messenger DM by its source or its placeholder phone', () => {
    expect(isMessengerLead({ source: 'facebook_messenger', phone: 'messenger' })).toBe(true)
    expect(isMessengerLead({ source: null, phone: 'messenger' })).toBe(true)
    expect(isMessengerLead({ source: null, phone: 'FB-PSID-1234567890123456' })).toBe(true)
  })

  it('does not claim a lead ad or a website lead', () => {
    expect(isMessengerLead({ source: 'facebook_lead_ads', phone: 'Not provided' })).toBe(false)
    expect(isMessengerLead({ source: 'website', phone: '(254) 555-0142' })).toBe(false)
  })
})
