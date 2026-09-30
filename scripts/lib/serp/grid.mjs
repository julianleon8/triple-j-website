// Keyword grid for scripts/serp-steal.mjs: seed terms x cities -> searches.
//
// Pure. Cities are passed in from src/lib/site.ts (SERVICE_CITIES) or
// src/lib/locations.ts (LOCATIONS); nothing here restates them.

const STATE = 'Texas'
const COUNTRY = 'United States'

export function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** "Killeen, TX" -> "Killeen" */
export function bareCityName(name) {
  return name.replace(/,\s*TX$/i, '').trim()
}

/**
 * @param {object} args
 * @param {{ term: string, service: string|null, scope: 'city'|'near'|'home' }[]} args.terms
 * @param {{ slug: string, name: string }[]} args.cities  display names, e.g. "Killeen, TX" or "Killeen"
 * @param {{ slug: string, name: string }} args.home  where `home` terms are searched from
 * @returns {{ id: string, query: string, term: string, service: string|null, scope: string,
 *   citySlug: string, city: string, location: { city: string, state: string, country: string } }[]}
 */
export function buildGrid({ terms, cities, home }) {
  const out = []
  const push = (t, city, query) => {
    const cityName = bareCityName(city.name)
    out.push({
      id: `${slugify(query)}--${city.slug}`,
      query,
      term: t.term,
      service: t.service,
      scope: t.scope,
      citySlug: city.slug,
      city: cityName,
      location: { city: cityName, state: STATE, country: COUNTRY },
    })
  }
  for (const t of terms) {
    if (t.scope === 'home') {
      push(t, home, t.term)
      continue
    }
    for (const city of cities) {
      const query = t.scope === 'city' ? `${t.term} ${bareCityName(city.name).toLowerCase()} tx` : t.term
      push(t, city, query)
    }
  }
  const seen = new Set()
  return out.filter((k) => (seen.has(k.id) ? false : seen.add(k.id)))
}

/** `slug: 'carports'` entries in src/lib/services.ts (which can't be imported from Node: it uses the @/ alias). */
export function serviceSlugsFromSource(source) {
  return [...source.matchAll(/^\s*slug:\s*['"]([^'"]+)['"]/gm)].map((m) => m[1])
}

/** Seed service paths that don't resolve to a page on the site. */
export function unknownServicePaths(terms, knownPaths) {
  const known = new Set(knownPaths)
  return [...new Set(terms.map((t) => t.service).filter((p) => p && !known.has(p)))]
}
