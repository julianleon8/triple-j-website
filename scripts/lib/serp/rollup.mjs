// Turn per-result judgments into the answer: which searches can Triple J take.
//
// Pure and deterministic. Claude says what each result is and why; the
// bucket and the score are decided here, so the rules are visible and tested.

import { BEATABLE_REASONS } from './judge.mjs'

/** Rough share of clicks by organic position. Only the ordering matters. */
const CLICK_SHARE = [0, 0.3, 0.15, 0.1, 0.07, 0.05, 0.04, 0.03, 0.025, 0.02, 0.02]

const INTENT_WEIGHT = { hire_installer: 1, price_research: 0.8, buy_kit: 0.5, mixed: 0.5, info: 0.35, navigational: 0.1 }
const COMMERCIAL = new Set(['hire_installer', 'price_research', 'buy_kit'])

/** A map pack sits above the organic results and takes most local clicks. */
const MAP_PACK_DAMPING = 0.6

export const BUCKETS = ['take', 'content', 'held', 'human', 'skip']
export const BUCKET_LABELS = {
  take: 'Take',
  content: 'Content play',
  held: 'Holding top 3',
  human: 'Needs a human',
  skip: 'Skip',
}

/**
 * @param {object} keyword  grid entry
 * @param {object} serp  normalized results page
 * @param {object|null} verdict  KeywordVerdict, or null when judging failed
 * @param {{ ownDomain: string, knownPaths: Set<string>, locationSlugs: Set<string> }} site
 */
export function scoreKeyword(keyword, serp, verdict, site) {
  const own = serp.organic.find((o) => o.domain === site.ownDomain) ?? null
  const byPos = new Map((verdict?.results ?? []).map((r) => [r.position, r]))
  const results = serp.organic.map((o) => {
    const r = byPos.get(o.position)
    const reason = o.domain === site.ownDomain ? 'own_site' : r?.reason ?? null
    return {
      position: o.position,
      domain: o.domain,
      url: o.url,
      title: o.title,
      reason,
      beatable: reason ? BEATABLE_REASONS.has(reason) : null,
      intentMatch: r?.intent_match ?? null,
      note: r?.note ?? '',
    }
  })

  const beatable = results.filter((r) => r.beatable)
  const firstBeatable = beatable.length ? Math.min(...beatable.map((r) => r.position)) : null
  const beatableTop5 = beatable.filter((r) => r.position <= 5).length
  const intent = verdict?.intent ?? null

  const raw = beatable.reduce((sum, r) => sum + (CLICK_SHARE[r.position] ?? 0.01), 0)
  const score = verdict ? Math.round(raw * (INTENT_WEIGHT[intent] ?? 0.3) * (serp.localPack.length ? MAP_PACK_DAMPING : 1) * 100) : 0

  let bucket
  if (!verdict) bucket = 'human'
  else if (own && own.position <= 3) bucket = 'held'
  else if (!verdict.intent_clear || intent === 'mixed') bucket = 'human'
  else if (COMMERCIAL.has(intent) && ((firstBeatable !== null && firstBeatable <= 3) || beatableTop5 >= 2)) bucket = 'take'
  else if (intent === 'info' && firstBeatable !== null && firstBeatable <= 5) bucket = 'content'
  else bucket = 'skip'

  return {
    id: keyword.id,
    query: keyword.query,
    city: keyword.city,
    citySlug: keyword.citySlug,
    scope: keyword.scope,
    intent,
    intentClear: verdict?.intent_clear ?? null,
    rationale: verdict?.rationale ?? '',
    bucket,
    score,
    firstBeatable,
    beatableTop5,
    beatableCount: beatable.length,
    ownPosition: own?.position ?? null,
    ownUrl: own?.url ?? null,
    localPack: serp.localPack,
    adCount: serp.ads.length,
    paa: serp.paa,
    related: serp.related,
    results,
    target: targetPage(keyword, intent, own, site),
  }
}

/** Where the work goes: the page that already ranks, the page that should, or a new one. */
export function targetPage(keyword, intent, own, site) {
  if (own) return { kind: 'improve', path: new URL(own.url).pathname }
  if (intent === 'info') return { kind: 'new', path: null, label: 'new blog post or FAQ' }
  const cityPage = `/locations/${keyword.citySlug}`
  if (keyword.scope === 'city' && site.locationSlugs.has(keyword.citySlug)) {
    return { kind: 'improve', path: cityPage, label: `for "${keyword.term}"` }
  }
  if (keyword.service && site.knownPaths.has(keyword.service)) return { kind: 'improve', path: keyword.service }
  return { kind: 'new', path: null, label: `new page for "${keyword.term}"` }
}

const countBy = (items, key) => {
  const m = new Map()
  for (const it of items) {
    const k = key(it)
    if (k) m.set(k, (m.get(k) ?? 0) + 1)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
}

/**
 * Whole-run summary for the report.
 * @param {ReturnType<typeof scoreKeyword>[]} scored
 * @param {Map<string, { verdict: object|null, template?: { similarity: number } }>} pageInfo  by URL
 */
export function summarize(scored, pageInfo) {
  const allResults = scored.flatMap((k) => k.results.map((r) => ({ ...r, query: k.query, city: k.city })))
  const judged = allResults.filter((r) => r.reason)
  const byBucket = Object.fromEntries(BUCKETS.map((b) => [b, scored.filter((k) => k.bucket === b).sort((a, z) => z.score - a.score)]))

  // Who holds the top 10, and how often it's a copy-paste city page.
  const domains = countBy(allResults, (r) => r.domain).map(([domain, appearances]) => {
    const rows = allResults.filter((r) => r.domain === domain)
    const templated = rows.filter((r) => (pageInfo.get(r.url)?.template?.similarity ?? 0) >= 0.8).length
    const beatable = rows.filter((r) => r.beatable).length
    const type = rows.map((r) => pageInfo.get(r.url)?.verdict?.site_type ?? pageInfo.get(r.url)?.knownType).find(Boolean) ?? null
    const local = rows.some((r) => pageInfo.get(r.url)?.verdict?.based_in_central_texas)
    return { domain, appearances, templated, beatable, type, local }
  })

  // Who holds the map pack in each city.
  const mapPack = new Map()
  for (const k of scored) {
    for (const p of k.localPack) {
      const cityMap = mapPack.get(k.city) ?? new Map()
      const prev = cityMap.get(p.title) ?? { title: p.title, rating: p.rating, reviews: p.reviews, count: 0, best: p.position }
      prev.count++
      prev.best = Math.min(prev.best, p.position)
      cityMap.set(p.title, prev)
      mapPack.set(k.city, cityMap)
    }
  }

  const listedIn = countBy(judged.filter((r) => r.reason === 'directory_get_listed'), (r) => r.domain)

  const searched = new Set(scored.map((k) => k.query.toLowerCase()))
  const candidates = countBy(
    scored.flatMap((k) => [...k.related, ...k.paa]),
    (q) => (searched.has(q.toLowerCase()) ? null : q),
  )

  return {
    keywords: scored.length,
    results: allResults.length,
    judgedResults: judged.length,
    beatableResults: judged.filter((r) => r.beatable).length,
    templatedResults: allResults.filter((r) => (pageInfo.get(r.url)?.template?.similarity ?? 0) >= 0.8).length,
    withMapPack: scored.filter((k) => k.localPack.length).length,
    ownRanking: scored.filter((k) => k.ownPosition !== null).sort((a, b) => a.ownPosition - b.ownPosition),
    reasons: countBy(judged, (r) => r.reason),
    byBucket,
    domains,
    mapPack: [...mapPack.entries()].map(([city, m]) => ({ city, holders: [...m.values()].sort((a, b) => b.count - a.count || a.best - b.best) })),
    listedIn,
    candidates,
  }
}
