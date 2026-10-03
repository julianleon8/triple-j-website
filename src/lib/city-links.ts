import { LOCATIONS, LOCATION_SLUGS, type LocationData } from './locations'
import { SERVICE_CITIES } from './site'

/**
 * Which other city pages each city page links to.
 *
 * Derived from the latitude/longitude already on every LOCATIONS entry, so
 * nobody hand-maintains a second list of who is next to whom. Straight-line
 * distance, like src/lib/zip.ts — it picks neighbours, it is never shown as a
 * drive time.
 *
 * Rule: link the NEAREST_COUNT closest cities. A far-flung city (Waco, Lampasas)
 * is nobody's closest three, which would leave its page reachable only from the
 * /locations index. So any city that fewer than MIN_INBOUND others link to is
 * also added to the pages of the cities nearest to it, until it has MIN_INBOUND.
 */
export const NEAREST_COUNT = 3
export const MIN_INBOUND = 2

const EARTH_RADIUS_MILES = 3958.8

function miles(a: LocationData, b: LocationData): number {
  const rad = (deg: number) => (deg * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h))
}

function buildTable(cities: LocationData[]): Record<string, string[]> {
  // Every other city, nearest first.
  const byDistance: Record<string, string[]> = {}
  for (const a of cities) {
    byDistance[a.slug] = cities
      .filter((b) => b.slug !== a.slug)
      .sort((x, y) => miles(a, x) - miles(a, y))
      .map((b) => b.slug)
  }

  const links: Record<string, Set<string>> = {}
  for (const c of cities) links[c.slug] = new Set(byDistance[c.slug].slice(0, NEAREST_COUNT))

  const inbound = (slug: string) => cities.filter((c) => links[c.slug].has(slug)).length
  for (const c of cities) {
    for (const nearby of byDistance[c.slug]) {
      if (inbound(c.slug) >= MIN_INBOUND) break
      links[nearby].add(c.slug)
    }
  }

  const bySlug = Object.fromEntries(cities.map((c) => [c.slug, c]))
  return Object.fromEntries(
    cities.map((c) => [
      c.slug,
      [...links[c.slug]].sort((x, y) => miles(c, bySlug[x]) - miles(c, bySlug[y])),
    ]),
  )
}

// County surfaces (name === county) are not cities; src/lib/locations.ts skips
// them the same way when it builds the ZIP map.
const CITIES = Object.values(LOCATIONS).filter((l) => l.name !== l.county)
const TABLE = buildTable(CITIES)

/** The city pages to link from `slug`'s page, nearest first. */
export function nearbyCities(slug: string): LocationData[] {
  return (TABLE[slug] ?? []).map((s) => LOCATIONS[s])
}

/**
 * Every city page slug, for "cities we serve" lists. The footer's cities come
 * first, in the order src/lib/site.ts keeps them; the rest follow.
 */
export const ALL_CITY_SLUGS: string[] = [
  ...SERVICE_CITIES.map((c) => c.slug as string),
  ...LOCATION_SLUGS.filter((s) => !SERVICE_CITIES.some((c) => c.slug === s)),
]
