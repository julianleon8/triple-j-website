import { describe, it, expect } from 'vitest'
import { LOCATIONS } from './locations'
import { MIN_INBOUND, NEAREST_COUNT, nearbyCities } from './city-links'

const cities = Object.values(LOCATIONS).filter((l) => l.name !== l.county)

describe('nearbyCities', () => {
  it('gives every city at least the nearest few, none of them itself, none twice', () => {
    for (const c of cities) {
      const slugs = nearbyCities(c.slug).map((n) => n.slug)
      expect(slugs.length, c.slug).toBeGreaterThanOrEqual(NEAREST_COUNT)
      expect(slugs, c.slug).not.toContain(c.slug)
      expect(new Set(slugs).size, c.slug).toBe(slugs.length)
    }
  })

  it('links every city page from at least MIN_INBOUND other city pages', () => {
    // The regression: Waco is nobody's three nearest cities, and Holland, Salado,
    // Taylor and Troy were linked only from the /locations index.
    for (const c of cities) {
      const inbound = cities.filter((o) => nearbyCities(o.slug).some((n) => n.slug === c.slug))
      expect(inbound.length, c.slug).toBeGreaterThanOrEqual(MIN_INBOUND)
    }
  })

  it('lists the nearest city first and keeps the order by distance', () => {
    expect(nearbyCities('killeen')[0].slug).toBe('harker-heights')
    expect(nearbyCities('harker-heights')[0].slug).toBe('nolanville')
    expect(nearbyCities('georgetown')[0].slug).toBe('round-rock')
  })

  it('returns nothing for an unknown slug', () => {
    expect(nearbyCities('atlantis')).toEqual([])
  })
})
