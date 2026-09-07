import { describe, it, expect } from 'vitest'
import {
  LOCATIONS,
  ZIP_TO_CITY,
  cityFromZip,
  isServedZip,
  formatCityOrZip,
} from './locations'

describe('cityFromZip', () => {
  it('resolves every city that has a landing page', () => {
    // The regression that motivated this module: Round Rock ships a location
    // page at /locations/round-rock, but 78664 was missing from both of the
    // hand-maintained ZIP maps, so a Round Rock lead was stored as "78664".
    for (const loc of Object.values(LOCATIONS)) {
      if (loc.name === loc.county) continue // county surface, not a city
      expect(cityFromZip(loc.zip), `${loc.slug} (${loc.zip})`).toBe(loc.name)
    }
  })

  it('resolves 78664 to Round Rock', () => {
    expect(cityFromZip('78664')).toBe('Round Rock')
  })

  it('resolves secondary ZIPs to the same city as the primary', () => {
    expect(cityFromZip('76504')).toBe('Temple')   // Temple primary is 76501
    expect(cityFromZip('76544')).toBe('Killeen')  // Fort Cavazos
    expect(cityFromZip('78681')).toBe('Round Rock')
  })

  it('resolves served towns without a landing page', () => {
    expect(cityFromZip('76511')).toBe('Bartlett')
    expect(cityFromZip('76557')).toBe('Moody')
  })

  it('maps 76578 to Thrall, not Taylor', () => {
    // Both old maps said Taylor. Taylor is 76574 — which LOCATIONS has always
    // had right, and which is now the single source.
    expect(cityFromZip('76578')).toBe('Thrall')
    expect(cityFromZip('76574')).toBe('Taylor')
  })

  it('returns null for an unrecognised ZIP rather than echoing it back', () => {
    // The old fallback was `?? zip`, which wrote a ZIP into leads.city and
    // corrupted every city-level report.
    expect(cityFromZip('76577')).toBeNull() // Thorndale — outside the map
    expect(cityFromZip('90210')).toBeNull()
  })

  it('handles blank, null and undefined', () => {
    expect(cityFromZip('')).toBeNull()
    expect(cityFromZip('   ')).toBeNull()
    expect(cityFromZip(null)).toBeNull()
    expect(cityFromZip(undefined)).toBeNull()
  })

  it('trims surrounding whitespace', () => {
    expect(cityFromZip(' 76501 ')).toBe('Temple')
  })
})

describe('ZIP_TO_CITY', () => {
  it('resolves only to cities, never to a county surface', () => {
    // County entries in LOCATIONS carry a city's ZIP (bell-county holds 76513,
    // Belton's). If the build ever stops skipping them, a lead from Belton
    // would be filed under "Bell County".
    const countyNames = new Set(
      Object.values(LOCATIONS).filter(l => l.name === l.county).map(l => l.name),
    )
    for (const [zip, city] of Object.entries(ZIP_TO_CITY)) {
      expect(countyNames.has(city), `${zip} resolved to county "${city}"`).toBe(false)
    }
  })

  it('never lets two cities claim the same ZIP', () => {
    // The map itself cannot hold a duplicate key, so the real assertion is on
    // the inputs: every declared ZIP must survive into the built map with the
    // city that declared it. A silent overwrite shows up here as a mismatch.
    for (const loc of Object.values(LOCATIONS)) {
      if (loc.name === loc.county) continue
      expect(ZIP_TO_CITY[loc.zip], `${loc.slug} lost its primary ZIP ${loc.zip}`).toBe(loc.name)
    }
  })

  it('never maps a ZIP to a city name we do not use elsewhere', () => {
    const known = new Set(Object.values(LOCATIONS).map(l => l.name))
    const towns = new Set(['Bartlett', 'Florence', 'Little River-Academy', 'Moody', 'Thrall'])
    for (const [zip, city] of Object.entries(ZIP_TO_CITY)) {
      expect(known.has(city) || towns.has(city), `${zip} → ${city}`).toBe(true)
    }
  })
})

describe('isServedZip', () => {
  it('is true for mapped ZIPs and false otherwise', () => {
    expect(isServedZip('76501')).toBe(true)
    expect(isServedZip('76577')).toBe(false)
    expect(isServedZip(null)).toBe(false)
  })
})

describe('formatCityOrZip', () => {
  it('prefers the city', () => {
    expect(formatCityOrZip('Temple', '76501')).toBe('Temple')
  })

  it('labels a bare ZIP so an alert subject does not read like spam', () => {
    expect(formatCityOrZip(null, '76577')).toBe('ZIP 76577')
  })

  it('treats a blank city as absent', () => {
    expect(formatCityOrZip('  ', '76577')).toBe('ZIP 76577')
  })

  it('falls back to Unknown with neither', () => {
    expect(formatCityOrZip(null, null)).toBe('Unknown')
  })
})
