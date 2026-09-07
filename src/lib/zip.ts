import zipGeo from '@/lib/data/zip-geo.json'
import { LOCATIONS, cityFromZip } from '@/lib/locations'

/* ────────────────────────────────────────────────────────────────────────────
   ZIP geography — where a ZIP is, and how far it is from the shop.

   This module sits *underneath* the service-area logic in locations.ts, it does
   not replace it. Two different questions, two different owners:

     "Is this ZIP a place we serve?"  → cityFromZip() in locations.ts.
                                        A curated business fact. Still the only
                                        thing allowed to populate `leads.city`.
     "Where on earth is this ZIP?"    → zipInfo() here.
                                        Census reference data. Answers for any
                                        of 4,188 ZIPs across TX and the states
                                        bordering it, served or not.

   The curated answer always wins where the two overlap, so nothing about
   existing lead handling changes: an out-of-area ZIP still resolves to a null
   city (locked 2026-09-07) and only gains a distance beside it.

   ── Straight-line, not drive time ──
   `miles` is great-circle distance from the shop. It is free, instant, offline,
   and cannot fail on the lead-notification path — which matters, because that
   path sends Julian's push. In the Central Texas highway grid it runs a little
   under road distance. `driveMinutes` is the seam where a real routing provider
   plugs in later; it is null everywhere today and no caller should assume
   otherwise.

   ── Bundle note ──
   The backing JSON is ~280 KB. Every consumer today is server-side (API routes,
   HQ server components, cron). Do not import this module from a `'use client'`
   component — it would ship the whole dataset to the browser. There is no
   `server-only` package installed to enforce that, so it is a convention.
   ──────────────────────────────────────────────────────────────────────────── */

/** `[zip, lat, lng, state, county, ...places]` — see scripts/build-zip-data.mjs. */
type GeoRow = [string, number, number, string, string, ...string[]]

const ROWS = zipGeo.rows as GeoRow[]

const GEO_BY_ZIP: ReadonlyMap<string, GeoRow> = new Map(ROWS.map((row) => [row[0], row]))

/**
 * Where distances are measured from.
 *
 * This is the published Temple city point from LOCATIONS, not a survey of the
 * yard at 3319 Tem-Bel Ln — the shop sits southwest of the city centroid, so
 * every number here carries a couple of miles of slack. That is well inside the
 * error the straight-line approximation already has, and it keeps the origin a
 * fact this repo already owns rather than a coordinate invented here. Replace
 * both numbers if an exact shop coordinate is ever measured; nothing else needs
 * to change.
 */
export const SHOP_ORIGIN = {
  lat: LOCATIONS.temple.lat,
  lng: LOCATIONS.temple.lng,
} as const

const EARTH_RADIUS_MI = 3958.7613

const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

/** Great-circle distance in miles between two points. */
export function milesBetween(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_MI * 2 * Math.asin(Math.sqrt(h))
}

/** Straight-line miles from the shop, rounded to one decimal. */
export function milesFromShop(lat: number, lng: number): number {
  return Math.round(milesBetween(SHOP_ORIGIN.lat, SHOP_ORIGIN.lng, lat, lng) * 10) / 10
}

export type Bearing = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

const COMPASS: readonly Bearing[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

/**
 * Compass direction from the shop to a point.
 *
 * Far more sensitive to SHOP_ORIGIN than distance is. The origin is currently
 * Temple's city point, which sits northeast of the actual yard on Tem-Bel Ln,
 * and that few miles of offset is enough to swing a nearby town a whole compass
 * point: Belton comes out 'W' from the city centre where anyone local would say
 * south. Distance barely moves (9.9 mi against a published 10). So bearing is
 * computed and exposed, but deliberately kept out of the default display string
 * until SHOP_ORIGIN is a real surveyed coordinate — see formatDistance.
 */
export function bearingFromShop(lat: number, lng: number): Bearing {
  const φ1 = toRad(SHOP_ORIGIN.lat)
  const φ2 = toRad(lat)
  const Δλ = toRad(lng - SHOP_ORIGIN.lng)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const deg = (toDeg(Math.atan2(y, x)) + 360) % 360
  return COMPASS[Math.round(deg / 45) % 8]
}

/**
 * How far out a job is, in the terms the crew actually thinks in.
 *
 * Thresholds are straight-line and were set from the real spread of the service
 * area rather than picked round: the farthest city Triple J currently lists
 * (Lampasas) is 54 mi out and Round Rock is 45, so every served city lands at
 * or inside `edge`. `zip.test.ts` asserts that, which means adding a city
 * farther out than 60 mi fails the build instead of silently reclassifying the
 * whole service area as `outside`.
 */
export type TravelBand = 'local' | 'nearby' | 'edge' | 'outside'

export const BAND_MAX_MILES = {
  local: 20,
  nearby: 40,
  edge: 60,
} as const

export function bandForMiles(miles: number): TravelBand {
  if (miles <= BAND_MAX_MILES.local) return 'local'
  if (miles <= BAND_MAX_MILES.nearby) return 'nearby'
  if (miles <= BAND_MAX_MILES.edge) return 'edge'
  return 'outside'
}

/** Short human label per band, for HQ badges. */
export const BAND_LABELS: Record<TravelBand, string> = {
  local: 'Local',
  nearby: 'Nearby',
  edge: 'Edge of area',
  outside: 'Out of area',
}

export type ZipInfo = {
  zip: string
  /**
   * The single best city name for this ZIP. The curated service-area name when
   * there is one, otherwise the census place covering the most land.
   */
  city: string
  /**
   * Every city, town and CDP the ZIP touches, largest first — a ZIP is an area,
   * not a point, and 76513 genuinely spans Belton, Temple, Morgan's Point
   * Resort, Harker Heights and Nolanville.
   */
  cities: readonly string[]
  county: string
  /** Two-letter state. */
  state: string
  lat: number
  lng: number
  /** Straight-line miles from the shop. See the module note. */
  miles: number
  bearing: Bearing
  band: TravelBand
  /** Reserved for a routing provider. Always null today. */
  driveMinutes: number | null
  /** True when locations.ts recognises this ZIP as somewhere Triple J serves. */
  inServiceArea: boolean
  /**
   * True when the coordinate is the city's point rather than the ZIP's own —
   * the case for PO-box-only ZIPs, which have no census area to measure.
   */
  approximate: boolean
}

/** `76513-1234` and ` 76513 ` both mean 76513. Anything else is not a ZIP. */
export function normalizeZip(zip: string | null | undefined): string | null {
  const trimmed = zip?.trim()
  if (!trimmed) return null
  const match = /^(\d{5})(?:-\d{4})?$/.exec(trimmed)
  return match ? match[1] : null
}

/**
 * Everything known about a ZIP, or null when it is neither a served ZIP nor
 * present in the census dataset (a ZIP outside TX and its neighbours, or one
 * that simply isn't real).
 */
export function zipInfo(zip: string | null | undefined): ZipInfo | null {
  const key = normalizeZip(zip)
  if (!key) return null

  const servedCity = cityFromZip(key)
  const row = GEO_BY_ZIP.get(key)

  if (row) {
    const [, lat, lng, state, county, ...places] = row
    // The curated name wins. Census land-area ranking is a proxy for the USPS
    // preferred city, and where Julian has stated the answer his answer is the
    // one that belongs in front of him.
    const city = servedCity ?? places[0] ?? county
    const cities = servedCity && places[0] !== servedCity ? [servedCity, ...places] : places
    return {
      zip: key,
      city,
      cities,
      county,
      state,
      lat,
      lng,
      miles: milesFromShop(lat, lng),
      bearing: bearingFromShop(lat, lng),
      band: bandForMiles(milesFromShop(lat, lng)),
      driveMinutes: null,
      inServiceArea: servedCity !== null,
      approximate: false,
    }
  }

  // No census row. PO-box-only ZIPs have no ZCTA at all — twelve of the curated
  // service-area ZIPs are exactly this (Temple 76503/76505/76508, Killeen
  // 76540/76545/76546/76547, Waco 76702/76703, Georgetown 78627, Round Rock
  // 78680/78683). We still know the city, so we still know roughly how far the
  // job is; fall back to the city's own published coordinate.
  if (!servedCity) return null

  const loc = Object.values(LOCATIONS).find(
    (l) => l.name === servedCity && l.name !== l.county,
  )
  if (!loc) return null

  const miles = milesFromShop(loc.lat, loc.lng)
  return {
    zip: key,
    city: servedCity,
    cities: [servedCity],
    county: loc.county.replace(/\s+County$/i, ''),
    state: 'TX',
    lat: loc.lat,
    lng: loc.lng,
    miles,
    bearing: bearingFromShop(loc.lat, loc.lng),
    band: bandForMiles(miles),
    driveMinutes: null,
    inServiceArea: true,
    approximate: true,
  }
}

/**
 * `9.9 mi`, or `~10 mi` when the coordinate is the city's, not the ZIP's.
 * Null under a mile — see below.
 *
 * No compass point. `info.bearing` is there for any caller that wants it, but
 * it is wrong often enough at close range to undermine the distance beside it
 * (see bearingFromShop) and distance is the thing actually being asked for.
 * Add it here once SHOP_ORIGIN is the real yard.
 */
export function formatDistance(info: ZipInfo): string | null {
  // Temple's PO-box ZIPs fall back to Temple's city point, which *is* the shop
  // origin — so they measure 0.0 mi and rendered "~0.0 mi", which reads like a
  // bug rather than "this job is in town". Under a mile there is no distance
  // worth printing; the city name is already the whole answer.
  if (info.miles < 1) return null
  const miles = info.miles < 10 ? info.miles.toFixed(1) : Math.round(info.miles).toString()
  return `${info.approximate ? '~' : ''}${miles} mi`
}

/**
 * The one-line location string for a push notification, email subject or HQ
 * row: `Belton · 10 mi SW`, or `Amarillo · 344 mi NW · out of area`.
 *
 * Replaces a bare `formatCityOrZip()` at call sites that have room for the
 * distance. Degrades to exactly what `formatCityOrZip()` returns when the ZIP
 * resolves to nothing, so no caller gets worse output than it has today.
 */
export function formatLeadLocation(
  city: string | null | undefined,
  zip: string | null | undefined,
): string {
  const info = zipInfo(zip)
  if (!info) {
    const c = city?.trim()
    if (c) return c
    const z = zip?.trim()
    return z ? `ZIP ${z}` : 'Unknown'
  }
  const parts = [city?.trim() || info.city, formatDistance(info)]
  // "Out of area" is a claim about distance, not about the curated list.
  // Thorndale (76577) is 35 mi out and simply isn't on the served-towns list
  // yet — flagging it out of area would talk Julian out of a job well inside
  // the range he already drives. Only the `outside` band earns the label; for
  // anything nearer, the distance says everything and he makes the call.
  if (info.band === 'outside') parts.push('out of area')
  return parts.filter(Boolean).join(' · ')
}
