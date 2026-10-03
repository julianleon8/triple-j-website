import { describe, expect, it } from 'vitest'

import { classifyLink, isOwnerPath, isTrackedPath, utmSourceFromSrc } from './analytics'

const origin = 'https://www.triplejmetaltx.com'

describe('isTrackedPath', () => {
  it('tracks the marketing site', () => {
    for (const path of ['/', '/quote', '/thank-you', '/services/metal-carports', '/locations/temple', '/blog/x', '/hqx']) {
      expect(isTrackedPath(path)).toBe(true)
    }
  })
  it('never tracks owner tools or a customer quote', () => {
    for (const path of ['/hq', '/hq/leads/1', '/login', '/setup', '/quotes/abc123', '/offline', '/api/leads']) {
      expect(isTrackedPath(path)).toBe(false)
    }
  })
})

describe('isOwnerPath', () => {
  it('marks only the owner routes, not a customer quote', () => {
    expect(isOwnerPath('/hq/jobs')).toBe(true)
    expect(isOwnerPath('/login')).toBe(true)
    expect(isOwnerPath('/quotes/abc123')).toBe(false)
    expect(isOwnerPath('/quote')).toBe(false)
  })
})

describe('classifyLink', () => {
  it('finds every route to the quote form', () => {
    expect(classifyLink('/quote', origin)).toBe('quote')
    expect(classifyLink('/quote?city=temple', origin)).toBe('quote')
    expect(classifyLink('#quote', origin)).toBe('quote')
    expect(classifyLink('/#quote', origin)).toBe('quote')
    expect(classifyLink(`${origin}/quote`, origin)).toBe('quote')
  })
  it('reads contact links by scheme', () => {
    expect(classifyLink('tel:+12545550100', origin)).toBe('phone')
    expect(classifyLink('TEL:+12545550100', origin)).toBe('phone')
    expect(classifyLink('sms:+12545550100', origin)).toBe('text')
    expect(classifyLink('mailto:info@triplejmetaltx.com', origin)).toBe('email')
  })
  it('recognises map links as directions', () => {
    expect(classifyLink('https://www.google.com/maps/dir/?api=1&destination=Temple', origin)).toBe('directions')
    expect(classifyLink('https://maps.google.com/?q=Temple', origin)).toBe('directions')
    expect(classifyLink('https://maps.app.goo.gl/abc', origin)).toBe('directions')
    expect(classifyLink('https://maps.apple.com/?q=Temple', origin)).toBe('directions')
  })
  it('ignores everything else', () => {
    expect(classifyLink('/services', origin)).toBe(null)
    expect(classifyLink('/quotes/abc123', origin)).toBe(null)
    expect(classifyLink('https://www.google.com/search?q=carports', origin)).toBe(null)
    expect(classifyLink('https://example.com/quote', origin)).toBe(null)
    expect(classifyLink('http://[bad', origin)).toBe(null)
  })
})

describe('utmSourceFromSrc', () => {
  it('maps ?src= to utm_source, like the lead row does', () => {
    expect(utmSourceFromSrc(`${origin}/quote?src=fb`)).toBe('fb')
  })
  it('never overrides a real utm_source', () => {
    expect(utmSourceFromSrc(`${origin}/quote?src=fb&utm_source=google`)).toBe(null)
  })
  it('returns null with nothing to map', () => {
    expect(utmSourceFromSrc(`${origin}/quote`)).toBe(null)
    expect(utmSourceFromSrc(`${origin}/quote?src=`)).toBe(null)
    expect(utmSourceFromSrc(undefined)).toBe(null)
    expect(utmSourceFromSrc('not a url')).toBe(null)
  })
})
