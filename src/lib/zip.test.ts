import { describe, it, expect } from 'vitest'
import { LOCATIONS, ZIP_TO_CITY, cityFromZip } from './locations'
import {
  zipInfo,
  normalizeZip,
  milesBetween,
  milesFromShop,
  bearingFromShop,
  bandForMiles,
  formatDistance,
  formatLeadLocation,
  SHOP_ORIGIN,
  BAND_MAX_MILES,
} from './zip'

describe('normalizeZip', () => {
  it('accepts a bare 5-digit ZIP', () => {
    expect(normalizeZip('76513')).toBe('76513')
  })

  it('accepts ZIP+4 and keeps only the 5', () => {
    expect(normalizeZip('76513-1234')).toBe('76513')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeZip('  76513 ')).toBe('76513')
  })

  it('rejects anything that is not a ZIP', () => {
    for (const bad of ['', '   ', '7651', '765133', 'ABCDE', '76513x', null, undefined]) {
      expect(normalizeZip(bad), String(bad)).toBeNull()
    }
  })
})

describe('milesBetween', () => {
  it('is zero for a point against itself', () => {
    expect(milesBetween(31.0982, -97.3428, 31.0982, -97.3428)).toBe(0)
  })

  it('is symmetric', () => {
    const a = milesBetween(31.0982, -97.3428, 30.5054, -97.6473)
    const b = milesBetween(30.5054, -97.6473, 31.0982, -97.3428)
    expect(a).toBeCloseTo(b, 9)
  })

  it('matches a known distance — Temple to Waco is about 34 miles', () => {
    // Independently checkable: Temple (31.0982, -97.3428) to Waco
    // (31.5493, -97.1467). Straight-line, so it sits under the ~40 mi drive.
    expect(milesBetween(31.0982, -97.3428, 31.5493, -97.1467)).toBeCloseTo(33.6, 0)
  })
})

describe('bearingFromShop', () => {
  it('reads the four cardinals off the shop origin', () => {
    const { lat, lng } = SHOP_ORIGIN
    expect(bearingFromShop(lat + 1, lng)).toBe('N')
    expect(bearingFromShop(lat - 1, lng)).toBe('S')
    expect(bearingFromShop(lat, lng + 1)).toBe('E')
    expect(bearingFromShop(lat, lng - 1)).toBe('W')
  })

  it('puts Waco north and Round Rock southwest — the two ends of the I-35 run', () => {
    expect(bearingFromShop(31.5493, -97.1467)).toBe('N')   // Waco, 20° true
    expect(bearingFromShop(30.5054, -97.6473)).toBe('SW')  // Round Rock, 204° true
  })
})

describe('bandForMiles', () => {
  it('bands on the documented thresholds, inclusive at each edge', () => {
    expect(bandForMiles(0)).toBe('local')
    expect(bandForMiles(BAND_MAX_MILES.local)).toBe('local')
    expect(bandForMiles(BAND_MAX_MILES.local + 0.1)).toBe('nearby')
    expect(bandForMiles(BAND_MAX_MILES.nearby)).toBe('nearby')
    expect(bandForMiles(BAND_MAX_MILES.nearby + 0.1)).toBe('edge')
    expect(bandForMiles(BAND_MAX_MILES.edge)).toBe('edge')
    expect(bandForMiles(BAND_MAX_MILES.edge + 0.1)).toBe('outside')
  })
})

describe('zipInfo', () => {
  it('resolves a core service-area ZIP', () => {
    const info = zipInfo('76513')
    expect(info).not.toBeNull()
    expect(info!.city).toBe('Belton')
    expect(info!.county).toBe('Bell')
    expect(info!.state).toBe('TX')
    expect(info!.inServiceArea).toBe(true)
    expect(info!.approximate).toBe(false)
    expect(info!.miles).toBeLessThan(15)
    expect(info!.band).toBe('local')
  })

  it('lists every city a ZIP touches, not just the primary', () => {
    // A ZIP is an area. 76513 genuinely spans five places, and the crew asking
    // "where is this job" is better served by all of them than by one.
    const info = zipInfo('76513')!
    expect(info.cities).toContain('Belton')
    expect(info.cities).toContain('Harker Heights')
    expect(info.cities).toContain('Nolanville')
    expect(info.cities[0]).toBe('Belton')
  })

  it('resolves an out-of-area Texas ZIP with a distance and no service flag', () => {
    const info = zipInfo('79101')  // Amarillo
    expect(info).not.toBeNull()
    expect(info!.city).toBe('Amarillo')
    expect(info!.county).toBe('Potter')
    expect(info!.inServiceArea).toBe(false)
    expect(info!.band).toBe('outside')
    expect(info!.miles).toBeGreaterThan(300)
  })

  it('resolves ZIPs in the states bordering Texas', () => {
    // Street ZIPs, not the downtown PO-box ZIPs — those have no ZCTA anywhere
    // in the country, which is exactly why 73101/71101/72201 are absent.
    expect(zipInfo('73012')?.state).toBe('OK')  // Oklahoma City
    expect(zipInfo('71047')?.state).toBe('LA')  // Shreveport
    expect(zipInfo('87101')?.state).toBe('NM')  // Albuquerque
    expect(zipInfo('72103')?.state).toBe('AR')  // Little Rock
  })

  it('returns null for a ZIP outside the dataset rather than guessing', () => {
    expect(zipInfo('90210')).toBeNull()  // California — deliberately out of scope
    expect(zipInfo('00000')).toBeNull()
    expect(zipInfo('nope')).toBeNull()
  })

  it('falls back to the city coordinate for PO-box-only ZIPs', () => {
    // These twelve have no ZCTA, so no census row and no area to measure. The
    // curated map still names the city, so distance is still answerable —
    // flagged approximate so the UI can render "~".
    for (const zip of ['76503', '76505', '76508', '76540', '76545', '76546',
                       '76547', '76702', '76703', '78627', '78680', '78683']) {
      const info = zipInfo(zip)
      expect(info, zip).not.toBeNull()
      expect(info!.approximate, zip).toBe(true)
      expect(info!.inServiceArea, zip).toBe(true)
      expect(info!.city, zip).toBe(cityFromZip(zip))
    }
  })
})

describe('the curated service-area map stays authoritative', () => {
  it('resolves every served ZIP, and names it exactly what locations.ts does', () => {
    // This is the contract that keeps the 2026-09-07 lock intact: zip.ts adds
    // geography, it never renames a place Julian has already named. If the
    // census disagrees with the curated map, the curated map wins.
    for (const [zip, city] of Object.entries(ZIP_TO_CITY)) {
      const info = zipInfo(zip)
      expect(info, `${zip} (${city})`).not.toBeNull()
      expect(info!.city, `${zip}`).toBe(city)
      expect(info!.inServiceArea, `${zip}`).toBe(true)
    }
  })

  it('places every served city at or inside the edge band', () => {
    // Guards the thresholds against drift: adding a city farther out than
    // BAND_MAX_MILES.edge fails here rather than silently reclassifying a
    // chunk of the service area as "out of area" in Julian's push.
    for (const zip of Object.keys(ZIP_TO_CITY)) {
      const info = zipInfo(zip)!
      expect(info.band, `${zip} → ${info.city} at ${info.miles} mi`).not.toBe('outside')
      expect(info.miles, `${zip} → ${info.city}`).toBeLessThanOrEqual(BAND_MAX_MILES.edge)
    }
  })

  it('agrees with every LOCATIONS city page on which city its primary ZIP is', () => {
    for (const loc of Object.values(LOCATIONS)) {
      if (loc.name === loc.county) continue  // county surface, not a place
      expect(zipInfo(loc.zip)?.city, `${loc.slug} (${loc.zip})`).toBe(loc.name)
    }
  })

  it('keeps the published city coordinate within a few miles of the census point', () => {
    // Cross-checks two independent sources. A hand-typed lat/lng that drifted
    // would show up here as a city sitting miles from its own ZIP.
    for (const loc of Object.values(LOCATIONS)) {
      if (loc.name === loc.county) continue
      const info = zipInfo(loc.zip)
      if (!info || info.approximate) continue
      const drift = milesBetween(loc.lat, loc.lng, info.lat, info.lng)
      expect(drift, `${loc.slug}: published point is ${drift.toFixed(1)} mi from its ZIP`).toBeLessThan(12)
    }
  })
})

describe('formatDistance', () => {
  it('gives one decimal close in and whole miles further out', () => {
    expect(formatDistance(zipInfo('76513')!)).toBe('9.9 mi')
    expect(formatDistance(zipInfo('79101')!)).toMatch(/^\d{3} mi$/)
  })

  it('marks an approximate distance with a tilde', () => {
    // 76540 is a Killeen PO-box ZIP — no ZCTA, so it measures off Killeen's
    // own point rather than the ZIP's.
    expect(formatDistance(zipInfo('76540')!)).toMatch(/^~\d+ mi$/)
  })

  it('gives no distance at all under a mile', () => {
    // Temple's PO-box ZIPs fall back to Temple's point, which is the shop
    // origin. "~0.0 mi" read like a broken field; the city name is the answer.
    expect(formatDistance(zipInfo('76503')!)).toBeNull()
    expect(formatLeadLocation(null, '76503')).toBe('Temple')
  })
})

describe('formatLeadLocation', () => {
  it('puts city and distance on one line for a served ZIP', () => {
    expect(formatLeadLocation('Belton', '76513')).toBe('Belton · 9.9 mi')
  })

  it('flags a genuinely far lead as out of area', () => {
    const line = formatLeadLocation(null, '79101')
    expect(line).toContain('Amarillo')
    expect(line).toContain('out of area')
  })

  it('does not call a close-but-unlisted town out of area', () => {
    // Thorndale (76577) is not on the curated served-towns list, but it is
    // 35 mi out — well inside the range Triple J already drives. Labelling it
    // "out of area" in the push would talk Julian out of a viable job.
    const line = formatLeadLocation(null, '76577')
    expect(zipInfo('76577')!.inServiceArea).toBe(false)
    expect(line).toContain('Thorndale')
    expect(line).toContain('35 mi')
    expect(line).not.toContain('out of area')
  })

  it('never renders worse than formatCityOrZip did', () => {
    // The old behaviour, preserved exactly for every input the new lookup
    // cannot improve on.
    expect(formatLeadLocation('Belton', null)).toBe('Belton')
    expect(formatLeadLocation(null, '90210')).toBe('ZIP 90210')
    expect(formatLeadLocation(null, null)).toBe('Unknown')
    expect(formatLeadLocation('  ', '  ')).toBe('Unknown')
  })

  it('never puts a bare ZIP where a city name belongs', () => {
    // The regression that produced "New Lead: <name> — 78664 — garage".
    expect(formatLeadLocation(null, '78664')).toContain('Round Rock')
    expect(formatLeadLocation(null, '78664')).not.toMatch(/\b78664\b/)
  })
})

describe('milesFromShop', () => {
  it('is zero at the shop origin', () => {
    expect(milesFromShop(SHOP_ORIGIN.lat, SHOP_ORIGIN.lng)).toBe(0)
  })

  it('rounds to one decimal', () => {
    const m = milesFromShop(30.5054, -97.6473)
    expect(m).toBe(Math.round(m * 10) / 10)
  })
})
