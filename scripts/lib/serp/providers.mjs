// Google results pages, geolocated to a city, from a SERP API.
//
// Google itself is never fetched: scraping it breaks its terms and gets
// blocked. Two providers, picked by which key is set (DataForSEO wins):
//
//   DataForSEO  DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD   ~$0.002 per results page (live mode)
//   Serper      SERPER_API_KEY                           2,500 free searches, then ~$1 per 1,000
//
// Both are normalized to one shape so nothing downstream knows which ran:
//   { organic: [{ position, url, domain, title, snippet, date }],
//     localPack: [{ position, title, domain, rating, reviews, address }],
//     ads: [{ domain, title }], paa: [string], related: [string], cost }

export function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

export function pickProvider(env, requested) {
  const hasDfs = Boolean(env.DATAFORSEO_LOGIN && env.DATAFORSEO_PASSWORD)
  const hasSerper = Boolean(env.SERPER_API_KEY)
  if (requested === 'dataforseo') return hasDfs ? 'dataforseo' : null
  if (requested === 'serper') return hasSerper ? 'serper' : null
  return hasDfs ? 'dataforseo' : hasSerper ? 'serper' : null
}

// ── DataForSEO ──────────────────────────────────────────────────────────────

export function normalizeDataForSeo(json) {
  const task = json?.tasks?.[0]
  if (!task || task.status_code !== 20000) {
    throw new Error(`DataForSEO task failed: ${task?.status_code ?? json?.status_code} ${task?.status_message ?? json?.status_message ?? ''}`.trim())
  }
  const items = task.result?.[0]?.items ?? []
  const organic = []
  const localPack = []
  const ads = []
  const paa = []
  const related = []
  for (const it of items) {
    switch (it.type) {
      case 'organic':
        organic.push({
          position: it.rank_group,
          url: it.url,
          domain: domainOf(it.url) || it.domain,
          title: it.title ?? '',
          snippet: it.description ?? '',
          date: it.timestamp ?? null,
        })
        break
      case 'local_pack':
        localPack.push({
          position: it.rank_group,
          title: it.title ?? '',
          domain: it.domain ? it.domain.replace(/^www\./, '') : domainOf(it.url ?? ''),
          rating: it.rating?.value ?? null,
          reviews: it.rating?.votes_count ?? null,
          address: it.description ?? null,
        })
        break
      case 'paid':
        ads.push({ domain: domainOf(it.url ?? '') || it.domain || '', title: it.title ?? '' })
        break
      case 'people_also_ask':
        for (const q of it.items ?? []) if (q?.title) paa.push(q.title)
        break
      case 'related_searches':
        for (const q of it.items ?? []) if (typeof q === 'string') related.push(q)
        break
    }
  }
  organic.sort((a, b) => a.position - b.position)
  return { organic: organic.slice(0, 10), localPack, ads, paa, related, cost: task.cost ?? null }
}

async function fetchDataForSeo(keyword, env) {
  const auth = Buffer.from(`${env.DATAFORSEO_LOGIN}:${env.DATAFORSEO_PASSWORD}`).toString('base64')
  const { city, state, country } = keyword.location
  const res = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
    method: 'POST',
    headers: { authorization: `Basic ${auth}`, 'content-type': 'application/json' },
    // Mobile: most local trade searches happen on a phone, and the map pack
    // placement differs from desktop.
    body: JSON.stringify([
      {
        keyword: keyword.query,
        location_name: `${city},${state},${country}`,
        language_code: 'en',
        device: 'mobile',
        depth: 10,
      },
    ]),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`DataForSEO HTTP ${res.status}`)
  return normalizeDataForSeo(await res.json())
}

// ── Serper ──────────────────────────────────────────────────────────────────

export function normalizeSerper(json) {
  const organic = (json?.organic ?? []).map((o) => ({
    position: o.position,
    url: o.link,
    domain: domainOf(o.link),
    title: o.title ?? '',
    snippet: o.snippet ?? '',
    date: o.date ?? null,
  }))
  const localPack = (json?.places ?? []).map((p, i) => ({
    position: p.position ?? i + 1,
    title: p.title ?? '',
    domain: p.website ? domainOf(p.website) : '',
    rating: p.rating ?? null,
    reviews: p.ratingCount ?? null,
    address: p.address ?? null,
  }))
  const ads = (json?.ads ?? []).map((a) => ({ domain: domainOf(a.link ?? ''), title: a.title ?? '' }))
  const paa = (json?.peopleAlsoAsk ?? []).map((q) => q.question).filter(Boolean)
  const related = (json?.relatedSearches ?? []).map((q) => q.query).filter(Boolean)
  organic.sort((a, b) => a.position - b.position)
  return { organic: organic.slice(0, 10), localPack, ads, paa, related, cost: null }
}

async function fetchSerper(keyword, env) {
  const { city, state, country } = keyword.location
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'x-api-key': env.SERPER_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ q: keyword.query, location: `${city}, ${state}, ${country}`, gl: 'us', hl: 'en', num: 10 }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`Serper HTTP ${res.status}`)
  return normalizeSerper(await res.json())
}

export async function fetchSerp(provider, keyword, env) {
  if (provider === 'dataforseo') return fetchDataForSeo(keyword, env)
  if (provider === 'serper') return fetchSerper(keyword, env)
  throw new Error(`Unknown SERP provider: ${provider}`)
}
