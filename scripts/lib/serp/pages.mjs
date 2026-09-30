// Ranking pages: fetch once, reduce to facts, and find copy-paste city pages.
//
// The facts a model is bad at guessing (word count, dates, a 254 phone
// number, Texas ZIPs, whether a dealer's Killeen page is its Temple page with
// the city swapped) are measured here in code. The model gets them as input.

/** Sites whose type is known from the domain alone, and whether a plain fetch is worth trying. */
const KNOWN_SITES = [
  [/(^|\.)reddit\.com$|(^|\.)quora\.com$/, 'forum', false],
  [/(^|\.)youtube\.com$|(^|\.)tiktok\.com$/, 'video', false],
  [/(^|\.)facebook\.com$|(^|\.)instagram\.com$|(^|\.)nextdoor\.com$/, 'social', false],
  [/(^|\.)(yelp|angi|homeadvisor|thumbtack|houzz|porch|buildzoom|yellowpages|manta|mapquest|bbb|superpages|expertise|networx|fixr|homeguide)\.(com|org)$/, 'directory', false],
  [/(^|\.)(homedepot|lowes|tractorsupply|menards|walmart|amazon)\.com$/, 'big_box_retailer', false],
  [/(^|\.)(craigslist\.org|offerup\.com)$/, 'classifieds', false],
]

export function knownSite(domain) {
  for (const [re, type, fetchable] of KNOWN_SITES) if (re.test(domain)) return { type, fetchable }
  return null
}

// ── HTML -> facts ───────────────────────────────────────────────────────────

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', copy: '©', hellip: '…' }

export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return Number.isFinite(n) ? String.fromCodePoint(n) : m
    }
    return ENTITIES[e.toLowerCase()] ?? m
  })
}

const stripTags = (html) => decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()

function firstMatch(html, re) {
  const m = html.match(re)
  return m ? stripTags(m[1]) : null
}

function yearsIn(s) {
  return [...s.matchAll(/\b(20[12]\d)-\d\d-\d\d/g)].map((m) => Number(m[1]))
}

/**
 * @param {string} html
 * @param {{ excerptChars?: number }} [opts]
 */
export function extractPage(html, { excerptChars = 6000 } = {}) {
  const jsonLd = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join(' ')
  const modifiedMeta = [...html.matchAll(/<meta[^>]+(?:article:modified_time|og:updated_time|article:published_time)[^>]*>/gi)].map((m) => m[0]).join(' ')

  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1>/gi, ' ')
  const body = cleaned.replace(/^[\s\S]*?<body[^>]*>/i, '')
  // Nav and footer still count for phone numbers and ZIPs (that's where the
  // address lives), but not for the text a reader would call the page.
  const main = body.replace(/<(nav|header|footer|aside)\b[\s\S]*?<\/\1>/gi, ' ')

  const allText = stripTags(body)
  const mainText = stripTags(main)
  const words = mainText ? mainText.split(/\s+/).length : 0

  const copyright = [...allText.matchAll(/(?:©|copyright)\s*(?:\d{4}\s*[-–]\s*)?(20[12]\d)/gi)].map((m) => Number(m[1]))
  const structured = yearsIn(jsonLd + ' ' + modifiedMeta)

  // A business's own phone and address often live only in its structured
  // data (a LocalBusiness block in <head>), especially on JavaScript sites.
  const contactText = `${allText} ${jsonLd}`
  const phones = (contactText.match(/\(?\b254\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g) ?? []).map((p) => p.replace(/\D/g, '').slice(-10))
  const zips = [
    ...[...allText.matchAll(/\b(?:TX|Texas)\s*,?\s*(7[5-9]\d{3})\b/g)].map((m) => m[1]),
    ...[...jsonLd.matchAll(/"postalCode"\s*:\s*"(7[5-9]\d{3})/g)].map((m) => m[1]),
  ]
  const locality = jsonLd.match(/"addressLocality"\s*:\s*"([^"]+)"/)

  return {
    title: firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: (html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) ?? [])[1] ?? null,
    h1: firstMatch(cleaned, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
    h2s: [...cleaned.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => stripTags(m[1])).filter(Boolean).slice(0, 12),
    words,
    images: (main.match(/<img\b/gi) ?? []).length,
    phones254: new Set(phones).size,
    txZips: [...new Set(zips)],
    schemaLocality: locality ? decodeEntities(locality[1]) : null,
    // Almost no text plus an app root: the page is drawn by JavaScript, which
    // a plain fetch doesn't run. Its word count says nothing about its depth.
    jsRendered: words < 150 && /id=["'](?:root|__next|app|__nuxt)["']/i.test(html),
    updatedYear: structured.length ? Math.max(...structured) : null,
    copyrightYear: copyright.length ? Math.max(...copyright) : null,
    text: mainText.slice(0, excerptChars),
    // Longer copy for copy-paste detection only; never sent to Claude.
    fullText: mainText.slice(0, 40_000),
  }
}

export async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml',
        'accept-language': 'en-US,en;q=0.9',
      },
    })
    const type = res.headers.get('content-type') ?? ''
    if (!res.ok) return { ok: false, status: res.status }
    if (!type.includes('html')) return { ok: false, status: res.status, reason: `not html (${type})` }
    const html = (await res.text()).slice(0, 3_000_000)
    return { ok: true, status: res.status, finalUrl: res.url, facts: extractPage(html) }
  } catch (err) {
    return { ok: false, status: 0, reason: String(err?.message ?? err) }
  }
}

// ── Copy-paste city pages ───────────────────────────────────────────────────

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Word tokens with every place name, ZIP and digit run neutralized, so two city versions of one template compare equal. */
export function templateTokens(text, placeNames) {
  let t = ` ${text.toLowerCase()} `
  const names = [...placeNames].map((n) => n.toLowerCase()).sort((a, b) => b.length - a.length)
  for (const n of names) t = t.replace(new RegExp(`\\b${escapeRe(n)}\\b`, 'g'), ' place ')
  t = t.replace(/\b(tx|texas)\b/g, ' place ').replace(/\d+/g, '0')
  return t.split(/[^a-z0-9]+/).filter(Boolean)
}

export function shingles(tokens, k = 5) {
  const set = new Set()
  for (let i = 0; i + k <= tokens.length; i++) set.add(tokens.slice(i, i + k).join(' '))
  return set
}

export function jaccard(a, b) {
  if (!a.size || !b.size) return 0
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  return inter / (a.size + b.size - inter)
}

export const TEMPLATE_THRESHOLD = 0.8

/**
 * For each page, its highest similarity to another page on the same domain.
 * Pages under 150 words are skipped: short pages look alike for free.
 *
 * @param {{ url: string, domain: string, text: string }[]} pages
 * @param {string[]} placeNames
 * @returns {Map<string, { similarity: number, peer: string }>}
 */
export function findTemplatedPages(pages, placeNames, { maxPerDomain = 24 } = {}) {
  const byDomain = new Map()
  for (const p of pages) {
    if (!p.text) continue
    const tokens = templateTokens(p.text, placeNames)
    if (tokens.length < 150) continue
    const list = byDomain.get(p.domain) ?? []
    if (list.length < maxPerDomain) list.push({ url: p.url, set: shingles(tokens) })
    byDomain.set(p.domain, list)
  }
  const best = new Map()
  for (const list of byDomain.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const s = jaccard(list[i].set, list[j].set)
        for (const [a, b] of [[list[i], list[j]], [list[j], list[i]]]) {
          if (s > (best.get(a.url)?.similarity ?? -1)) best.set(a.url, { similarity: s, peer: b.url })
        }
      }
    }
  }
  return best
}
