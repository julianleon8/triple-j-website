import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'

import { buildGrid, serviceSlugsFromSource, unknownServicePaths } from './grid.mjs'
import { domainOf, normalizeDataForSeo, normalizeSerper, pickProvider } from './providers.mjs'
import { extractPage, findTemplatedPages, knownSite, templateTokens } from './pages.mjs'
import { KeywordVerdict, PageVerdict, keywordUserPrompt, pageUserPrompt, usageCost } from './judge.mjs'
import { scoreKeyword, summarize } from './rollup.mjs'
import { renderHtml, renderMarkdown } from './report.mjs'

const ROOT = path.resolve(import.meta.dirname, '../../..')

// ── grid ────────────────────────────────────────────────────────────────────

describe('buildGrid', () => {
  const cities = [
    { slug: 'temple', name: 'Temple, TX' },
    { slug: 'killeen', name: 'Killeen, TX' },
  ]
  const home = { slug: 'temple', name: 'Temple' }
  const grid = buildGrid({
    terms: [
      { term: 'carports', service: '/services/carports', scope: 'city' },
      { term: 'carport installers near me', service: '/services/carports', scope: 'near' },
      { term: 'welded vs bolted carport', service: null, scope: 'home' },
    ],
    cities,
    home,
  })

  it('names the city in city-scope queries and searches from that city', () => {
    const k = grid.find((g) => g.query === 'carports killeen tx')
    expect(k).toMatchObject({ citySlug: 'killeen', city: 'Killeen', location: { city: 'Killeen', state: 'Texas', country: 'United States' } })
  })

  it('searches near-scope terms unchanged from every city', () => {
    expect(grid.filter((g) => g.query === 'carport installers near me').map((g) => g.citySlug)).toEqual(['temple', 'killeen'])
  })

  it('searches home-scope terms once, from home', () => {
    const home = grid.filter((g) => g.scope === 'home')
    expect(home).toHaveLength(1)
    expect(home[0].citySlug).toBe('temple')
  })

  it('gives every search a unique id', () => {
    expect(new Set(grid.map((g) => g.id)).size).toBe(grid.length)
  })
})

describe('seeds.json', () => {
  it('points every term at a page the site actually has', () => {
    const seeds = JSON.parse(readFileSync(path.join(ROOT, 'research/keywords/seeds.json'), 'utf8'))
    const slugs = serviceSlugsFromSource(readFileSync(path.join(ROOT, 'src/lib/services.ts'), 'utf8'))
    const staticPages = readdirSync(path.join(ROOT, 'src/app/(marketing)/services'), { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('['))
      .map((d) => d.name)
    expect(slugs).toContain('carports')
    expect(unknownServicePaths(seeds.terms, [...slugs, ...staticPages].map((s) => `/services/${s}`))).toEqual([])
  })
})

// ── providers ───────────────────────────────────────────────────────────────

describe('normalizeDataForSeo', () => {
  const ok = (items) => ({ tasks: [{ status_code: 20000, cost: 0.002, result: [{ items }] }] })

  it('splits organic, map pack, ads, questions and related searches', () => {
    const serp = normalizeDataForSeo(
      ok([
        { type: 'paid', url: 'https://www.ads.example/x', title: 'Ad' },
        { type: 'local_pack', rank_group: 1, title: 'L&E Metal', domain: 'www.lemetal.example', rating: { value: 4.9, votes_count: 12 } },
        { type: 'organic', rank_group: 2, url: 'https://www.b.example/p', title: 'B', description: 'b' },
        { type: 'organic', rank_group: 1, url: 'https://a.example/', title: 'A', description: 'a' },
        { type: 'people_also_ask', items: [{ title: 'How much is a carport?' }] },
        { type: 'related_searches', items: ['carports near me'] },
      ]),
    )
    expect(serp.organic.map((o) => o.domain)).toEqual(['a.example', 'b.example'])
    expect(serp.localPack[0]).toMatchObject({ title: 'L&E Metal', domain: 'lemetal.example', rating: 4.9, reviews: 12 })
    expect(serp.ads).toEqual([{ domain: 'ads.example', title: 'Ad' }])
    expect(serp.paa).toEqual(['How much is a carport?'])
    expect(serp.related).toEqual(['carports near me'])
    expect(serp.cost).toBe(0.002)
  })

  it('throws on a failed task instead of returning an empty page', () => {
    expect(() => normalizeDataForSeo({ tasks: [{ status_code: 40501, status_message: 'Invalid Field' }] })).toThrow(/40501/)
  })
})

describe('normalizeSerper', () => {
  it('maps organic results, places and questions', () => {
    const serp = normalizeSerper({
      organic: [{ position: 1, link: 'https://www.viking.example/killeen', title: 'V', snippet: 's' }],
      places: [{ title: 'Rough Country', rating: 5, ratingCount: 3, website: 'https://roughcountry.example' }],
      peopleAlsoAsk: [{ question: 'Do I need a permit?' }],
      relatedSearches: [{ query: 'carport prices' }],
    })
    expect(serp.organic[0]).toMatchObject({ position: 1, domain: 'viking.example' })
    expect(serp.localPack[0]).toMatchObject({ position: 1, title: 'Rough Country', domain: 'roughcountry.example', reviews: 3 })
    expect(serp.paa).toEqual(['Do I need a permit?'])
    expect(serp.cost).toBeNull()
  })
})

describe('providers', () => {
  it('prefers DataForSEO when both keys are set', () => {
    const env = { DATAFORSEO_LOGIN: 'a', DATAFORSEO_PASSWORD: 'b', SERPER_API_KEY: 'c' }
    expect(pickProvider(env)).toBe('dataforseo')
    expect(pickProvider(env, 'serper')).toBe('serper')
    expect(pickProvider({ SERPER_API_KEY: 'c' }, 'dataforseo')).toBeNull()
  })

  it('strips www from domains and tolerates junk', () => {
    expect(domainOf('https://WWW.Example.com/a')).toBe('example.com')
    expect(domainOf('not a url')).toBe('')
  })
})

// ── pages ───────────────────────────────────────────────────────────────────

describe('extractPage', () => {
  it('measures the page body but reads contact details from nav, footer and structured data', () => {
    const html = `<html><head><title>Carports &amp; More</title>
      <script type="application/ld+json">{"@type":"LocalBusiness","telephone":"+1-254-555-0101","address":{"addressLocality":"Temple","postalCode":"76502"},"dateModified":"2025-03-01"}</script>
      </head><body><nav>Home Call (254) 555-0101</nav>
      <h1>Welded carports</h1><p>${'word '.repeat(300)}</p><img src="a.jpg">
      <footer>123 Main St, Belton, TX 76513 · © 2019-2024</footer></body></html>`
    const f = extractPage(html)
    expect(f.title).toBe('Carports & More')
    expect(f.h1).toBe('Welded carports')
    expect(f.words).toBeGreaterThanOrEqual(300)
    expect(f.words).toBeLessThan(310) // nav + footer excluded
    expect(f.phones254).toBe(1) // same number, three spellings
    expect(f.txZips.sort()).toEqual(['76502', '76513'])
    expect(f.schemaLocality).toBe('Temple')
    expect(f.updatedYear).toBe(2025)
    expect(f.copyrightYear).toBe(2024)
    expect(f.jsRendered).toBe(false)
  })

  it('flags a JavaScript app shell instead of calling it thin', () => {
    const f = extractPage('<html><body><div id="root"></div><script type="module" src="/x.js"></script></body></html>')
    expect(f.words).toBe(0)
    expect(f.jsRendered).toBe(true)
  })
})

describe('copy-paste city pages', () => {
  const places = ['Killeen', 'Temple', 'Bell County']
  const body = (city) =>
    `Looking for metal carports in ${city}, TX? Our ${city} customers get free delivery and installation on level lots anywhere in Bell County. ` +
    Array.from({ length: 40 }, (_, i) => `Section ${i} explains sizes, gauges, anchors and warranty terms for buyers.`).join(' ')

  it('treats the same page with the town swapped as identical', () => {
    expect(templateTokens('Carports in Killeen, TX 76541', places)).toEqual(templateTokens('Carports in Temple, Texas 76502', places))
    const t = findTemplatedPages(
      [
        { url: 'https://d.example/killeen', domain: 'd.example', text: body('Killeen') },
        { url: 'https://d.example/temple', domain: 'd.example', text: body('Temple') },
      ],
      places,
    )
    expect(t.get('https://d.example/killeen').similarity).toBeGreaterThan(0.95)
    expect(t.get('https://d.example/killeen').peer).toBe('https://d.example/temple')
  })

  it('never compares pages across domains, and skips short pages', () => {
    const t = findTemplatedPages(
      [
        { url: 'https://a.example/killeen', domain: 'a.example', text: body('Killeen') },
        { url: 'https://b.example/temple', domain: 'b.example', text: body('Temple') },
        { url: 'https://c.example/1', domain: 'c.example', text: 'short page' },
        { url: 'https://c.example/2', domain: 'c.example', text: 'short page' },
      ],
      places,
    )
    expect(t.size).toBe(0)
  })

  it('knows directories and social sites from the domain', () => {
    expect(knownSite('yelp.com')).toEqual({ type: 'directory', fetchable: false })
    expect(knownSite('m.facebook.com')).toEqual({ type: 'social', fetchable: false })
    expect(knownSite('vikingsteelstructures.com')).toBeNull()
  })
})

// ── judge ───────────────────────────────────────────────────────────────────

describe('structured-output schemas', () => {
  it('convert to JSON schemas the API accepts', () => {
    for (const schema of [PageVerdict, KeywordVerdict]) {
      const format = zodOutputFormat(schema)
      expect(format.type).toBe('json_schema')
      expect(format.schema.additionalProperties).toBe(false)
    }
  })
})

describe('prompts', () => {
  it('tells the page judge about template similarity and JavaScript pages', () => {
    const hit = { url: 'https://v.example/killeen', domain: 'v.example', title: 'T', snippet: 'S' }
    const facts = extractPage('<html><body><div id="root"></div></body></html>')
    const text = pageUserPrompt(hit, { ok: true, facts }, { similarity: 0.998, peer: 'https://v.example/temple' })
    expect(text).toContain('Template similarity: 1.00 with https://v.example/temple')
    expect(text).toContain('drawn by JavaScript')
    expect(pageUserPrompt(hit, null)).toContain('Fetched: no')
  })

  it('tells the keyword judge where Triple J ranks', () => {
    const serp = { organic: [{ position: 4, url: 'https://www.triplejmetaltx.com/locations/killeen', domain: 'triplejmetaltx.com', title: 'x', snippet: 'y' }], localPack: [], ads: [], paa: [] }
    const text = keywordUserPrompt({ query: 'carports killeen tx', city: 'Killeen' }, serp, () => ({ verdict: null, facts: null }), 'triplejmetaltx.com')
    expect(text).toContain('triplejmetaltx.com: position 4')
    expect(text).toContain('Map pack: none')
  })
})

describe('usageCost', () => {
  it('prices every token class', () => {
    const usage = { input_tokens: 1e6, output_tokens: 1e5, cache_read_input_tokens: 1e6, cache_creation_input_tokens: 0 }
    expect(usageCost('claude-sonnet-5-5', usage)).toBeCloseTo(2 + 1 + 0.2)
    expect(usageCost('claude-opus-5-5', usage)).toBeCloseTo(4 + 2 + 0.2)
    expect(usageCost('unknown-model', usage)).toBe(0)
  })
})

// ── rollup ──────────────────────────────────────────────────────────────────

const site = {
  ownDomain: 'triplejmetaltx.com',
  knownPaths: new Set(['/services/carports']),
  locationSlugs: new Set(['killeen']),
}
const keyword = { id: 'k', query: 'carports killeen tx', term: 'carports', service: '/services/carports', scope: 'city', citySlug: 'killeen', city: 'Killeen' }
const serpOf = (n, extra = {}) => ({
  organic: Array.from({ length: n }, (_, i) => ({ position: i + 1, url: `https://s${i + 1}.example/p`, domain: `s${i + 1}.example`, title: `t${i + 1}` })),
  localPack: [],
  ads: [],
  paa: [],
  related: [],
  ...extra,
})
const verdictOf = (reasons, extra = {}) => ({
  intent: 'hire_installer',
  intent_clear: true,
  rationale: 'r',
  results: reasons.map((reason, i) => ({ position: i + 1, intent_match: 'match', reason, note: '' })),
  ...extra,
})

describe('scoreKeyword', () => {
  it('takes a buyer search with a beatable result in the top 3', () => {
    const k = scoreKeyword(keyword, serpOf(3), verdictOf(['strong_page', 'templated_city_page', 'strong_page']), site)
    expect(k.bucket).toBe('take')
    expect(k.firstBeatable).toBe(2)
    expect(k.target).toEqual({ kind: 'improve', path: '/locations/killeen', label: 'for "carports"' })
  })

  it('derives beatability from the reason alone', () => {
    const k = scoreKeyword(keyword, serpOf(2), verdictOf(['directory_get_listed', 'thin']), site)
    expect(k.results.map((r) => r.beatable)).toEqual([false, true])
  })

  it('skips a search held by strong pages', () => {
    expect(scoreKeyword(keyword, serpOf(5), verdictOf(Array(5).fill('strong_local_competitor')), site).bucket).toBe('skip')
  })

  it('sends unclear or failed judgments to a human', () => {
    expect(scoreKeyword(keyword, serpOf(3), verdictOf(['thin', 'thin', 'thin'], { intent_clear: false }), site).bucket).toBe('human')
    expect(scoreKeyword(keyword, serpOf(3), null, site).bucket).toBe('human')
  })

  it('marks information searches with weak results as content plays, aimed at a new post', () => {
    const k = scoreKeyword({ ...keyword, scope: 'home' }, serpOf(5), verdictOf(['strong_page', 'forum_or_social', 'outdated', 'strong_page', 'strong_page'], { intent: 'info' }), site)
    expect(k.bucket).toBe('content')
    expect(k.target.kind).toBe('new')
  })

  it('recognizes Triple J by domain and counts a top-3 spot as already ranking', () => {
    const serp = serpOf(3)
    serp.organic[1] = { position: 2, url: 'https://www.triplejmetaltx.com/services/carports', domain: 'triplejmetaltx.com', title: 'us' }
    const k = scoreKeyword(keyword, serp, verdictOf(['thin', 'strong_page', 'thin']), site)
    expect(k.results[1].reason).toBe('own_site')
    expect(k.bucket).toBe('held')
    expect(k.target).toEqual({ kind: 'improve', path: '/services/carports' })
  })

  it('scores lower when a map pack sits above the organic results', () => {
    const v = verdictOf(['thin', 'strong_page'])
    const plain = scoreKeyword(keyword, serpOf(2), v, site).score
    const packed = scoreKeyword(keyword, serpOf(2, { localPack: [{ position: 1, title: 'X' }] }), v, site).score
    expect(packed).toBeLessThan(plain)
  })
})

describe('summarize', () => {
  const serp = serpOf(3, { localPack: [{ position: 1, title: 'L&E Metal', rating: 4.9, reviews: 10 }], related: ['carports near me', 'carports killeen tx'] })
  const scored = [scoreKeyword(keyword, serp, verdictOf(['templated_city_page', 'directory_get_listed', 'strong_page']), site)]
  const pageInfo = new Map([['https://s1.example/p', { verdict: { site_type: 'national_kit_dealer', based_in_central_texas: false }, template: { similarity: 0.99, peer: 'x' } }]])
  const s = summarize(scored, pageInfo)

  it('counts copy-paste pages per domain and overall', () => {
    expect(s.templatedResults).toBe(1)
    expect(s.domains.find((d) => d.domain === 's1.example')).toMatchObject({ templated: 1, beatable: 1, type: 'national_kit_dealer', local: false })
  })

  it('lists map pack holders, directories and new searches to try', () => {
    expect(s.mapPack).toEqual([{ city: 'Killeen', holders: [{ title: 'L&E Metal', rating: 4.9, reviews: 10, count: 1, best: 1 }] }])
    expect(s.listedIn).toEqual([['s2.example', 1]])
    expect(s.candidates).toEqual([['carports near me', 1]]) // the query itself is excluded
  })

  it('renders both reports with user text escaped in the HTML', () => {
    const evil = [{ ...scored[0], query: '<script>alert(1)</script>' }]
    const run = { date: '2026-10-01', month: 'October 2026', provider: 'dataforseo', pageModel: 'claude-sonnet-5-5', judgeModel: 'claude-opus-5-5', searches: 1, cities: ['Killeen'], serpCost: 0.002, serpCostLabel: '$0.002', claudeCost: 0.05, analysisCost: 0.05, claudeCalls: 4, cachedCalls: 0 }
    const html = renderHtml(run, summarize(evil, pageInfo), evil)
    expect(html).toContain('<title>Keyword Openings October 2026</title>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toMatch(/<html|<body/i)
    expect(html).toContain('pages read by claude-sonnet-5-5 · searches judged by claude-opus-5-5')
    expect(renderMarkdown(run, s)).toContain('## Take (1)')
  })
})
