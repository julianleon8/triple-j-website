#!/usr/bin/env node
// Keyword openings: which Google searches Triple J can take from the sites
// that hold them now.
//
// For every search in the grid (seed terms from research/keywords/seeds.json
// x cities from src/lib/site.ts) it pulls Google's top 10 as seen from that
// city, reads each ranking page, has Claude say what each page is and whether
// a strong local page could outrank it, then scores and buckets the searches.
//
//   node scripts/serp-steal.mjs plan              the search list and a cost estimate; no network
//   node scripts/serp-steal.mjs run [flags]       fetch, judge, write the report
//   node scripts/serp-steal.mjs report [flags]    rebuild the report from cache; no network, no Claude
//
// Flags
//   --model <id>        Claude model for both judgments (default claude-sonnet-5-5)
//   --provider <name>   dataforseo | serper (default: whichever key is set, DataForSEO first)
//   --cities all        every /locations page instead of SERVICE_CITIES
//   --city <slug>       one city only
//   --limit <n>         the first n searches (a cheap trial run)
//   --max-usd <n>       stop calling Claude once this much is spent (default 25)
//   --concurrency <n>   parallel requests (default 4)
//   --month YYYY-MM     which month's cached results to use (default: this month)
//
// Needs ANTHROPIC_API_KEY plus DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD, or
// SERPER_API_KEY. Reads .env.local and .env when present.
//
// Every stage caches to .serp-cache/ (gitignored), so an interrupted run
// resumes where it stopped and a re-run costs nothing. Search results and
// pages are cached per month; judgments are cached by their exact input and
// model, so changing the model or PROMPT_VERSION redoes only the judgments.
// The report lands in research/keywords/serp-steal-<date>.{md,html,json}.

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Anthropic from '@anthropic-ai/sdk'

import { buildGrid, serviceSlugsFromSource, unknownServicePaths } from './lib/serp/grid.mjs'
import { domainOf, fetchSerp, pickProvider } from './lib/serp/providers.mjs'
import { fetchPage, findTemplatedPages, knownSite } from './lib/serp/pages.mjs'
import {
  KEYWORD_SYSTEM,
  KeywordVerdict,
  PAGE_SYSTEM,
  PRICES,
  PROMPT_VERSION,
  PageVerdict,
  judge,
  keywordUserPrompt,
  pageUserPrompt,
  usageCost,
} from './lib/serp/judge.mjs'
import { BUCKETS, BUCKET_LABELS, scoreKeyword, summarize } from './lib/serp/rollup.mjs'
import { renderHtml, renderMarkdown } from './lib/serp/report.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = path.join(ROOT, '.serp-cache')
const OUT_DIR = path.join(ROOT, 'research/keywords')
const DEFAULT_MODEL = 'claude-sonnet-5-5'

// ── args + env ──────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const command = argv[0]
const flag = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`)
  return i === -1 ? fallback : argv[i + 1]
}

for (const f of ['.env.local', '.env']) {
  const p = path.join(ROOT, f)
  if (existsSync(p)) process.loadEnvFile(p)
}

const opts = {
  model: flag('model', DEFAULT_MODEL),
  provider: flag('provider'),
  cities: flag('cities'),
  city: flag('city'),
  limit: flag('limit') ? Number(flag('limit')) : null,
  maxUsd: Number(flag('max-usd', '25')),
  concurrency: Number(flag('concurrency', '4')),
  month: flag('month', new Date().toISOString().slice(0, 7)),
}

// ── small helpers ───────────────────────────────────────────────────────────

const sha = (s) => createHash('sha1').update(s).digest('hex').slice(0, 16)

function cached(file) {
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null
}

function store(file, value) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(value, null, 2))
  return value
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}

const log = (...a) => console.log(...a)

// ── site facts, read from their owners ──────────────────────────────────────

async function loadSite() {
  const { SERVICE_CITIES, SITE } = await import('../src/lib/site.ts')
  const { LOCATIONS } = await import('../src/lib/locations.ts')
  const { getSiteUrl } = await import('../src/lib/site-url.ts')

  const serviceSlugs = serviceSlugsFromSource(readFileSync(path.join(ROOT, 'src/lib/services.ts'), 'utf8'))
  const staticServicePages = readdirSync(path.join(ROOT, 'src/app/(marketing)/services'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('['))
    .map((d) => d.name)
  const knownPaths = new Set([...serviceSlugs, ...staticServicePages].map((s) => `/services/${s}`))
  const locationSlugs = new Set(Object.keys(LOCATIONS))

  const locations = Object.values(LOCATIONS)
  const placeNames = [...new Set([...locations.map((l) => l.name), ...locations.map((l) => l.county), ...SERVICE_CITIES.map((c) => c.name.replace(/,\s*TX$/i, ''))])]

  const homeSlug = SITE.address.city.toLowerCase()
  return {
    ownDomain: domainOf(getSiteUrl()),
    serviceCities: SERVICE_CITIES.map((c) => ({ slug: c.slug, name: c.name })),
    allLocations: locations.map((l) => ({ slug: l.slug, name: l.name })),
    home: { slug: homeSlug, name: SITE.address.city },
    knownPaths,
    locationSlugs,
    placeNames,
  }
}

function loadGrid(site) {
  const seeds = JSON.parse(readFileSync(path.join(OUT_DIR, 'seeds.json'), 'utf8'))
  const missing = unknownServicePaths(seeds.terms, site.knownPaths)
  if (missing.length) {
    console.error(`seeds.json names service pages the site doesn't have: ${missing.join(', ')}`)
    process.exit(1)
  }
  let cities = opts.cities === 'all' ? site.allLocations : site.serviceCities
  if (opts.city) cities = cities.filter((c) => c.slug === opts.city)
  if (!cities.length) {
    console.error(`No city matches --city ${opts.city}`)
    process.exit(1)
  }
  let grid = buildGrid({ terms: seeds.terms, cities, home: site.home })
  if (opts.city) grid = grid.filter((k) => k.citySlug === opts.city)
  if (opts.limit) grid = grid.slice(0, opts.limit)
  return grid
}

// ── plan ────────────────────────────────────────────────────────────────────

function plan(grid) {
  const byScope = grid.reduce((m, k) => ((m[k.scope] = (m[k.scope] ?? 0) + 1), m), {})
  const cities = [...new Set(grid.map((k) => k.city))]
  log(`${grid.length} searches from ${cities.length} cities: ${cities.join(', ')}`)
  log(`  ${Object.entries(byScope).map(([s, n]) => `${s} ${n}`).join(' · ')}`)
  log('')
  for (const k of grid.slice(0, 12)) log(`  ${k.query.padEnd(44)} from ${k.city}`)
  if (grid.length > 12) log(`  … and ${grid.length - 12} more`)
  log('')
  // Rough: ~5 new pages per search after de-duplication, ~3.5k tokens in and
  // ~0.4k out per page call, ~5k in and ~1.5k out per search call.
  const pages = grid.length * 5
  const inTok = pages * 3500 + grid.length * 5000
  const outTok = pages * 400 + grid.length * 1500
  log('Estimated cost for a full run (rough, before caching):')
  log(`  search results: DataForSEO ~$${(grid.length * 0.002).toFixed(2)} · Serper ${grid.length} credits`)
  for (const m of ['claude-sonnet-5-5', 'claude-opus-5-5']) {
    const p = PRICES[m]
    log(`  Claude ${m}: ~$${((inTok * p.input + outTok * p.output) / 1e6).toFixed(2)}`)
  }
  log('')
  const provider = pickProvider(process.env, opts.provider)
  log(`Keys: search results ${provider ?? 'MISSING'} · Claude ${process.env.ANTHROPIC_API_KEY ? 'set' : 'MISSING'}`)
}

// ── run / report ────────────────────────────────────────────────────────────

async function execute(grid, site, { offline }) {
  const provider = offline ? opts.provider ?? pickCachedProvider() : pickProvider(process.env, opts.provider)
  if (!provider) {
    console.error(
      offline
        ? `No cached search results for ${opts.month}. Run \`run\` first.`
        : 'No search-results key. Set DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD, or SERPER_API_KEY.',
    )
    process.exit(1)
  }
  if (!offline && !process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set.')
    process.exit(1)
  }
  if (!PRICES[opts.model]) log(`Note: no price on file for ${opts.model}; cost will show as $0.`)

  const monthDir = path.join(CACHE, opts.month)
  const judgeDir = path.join(CACHE, 'judgments', opts.model)
  const client = offline ? null : new Anthropic({ maxRetries: 4 })
  // claude: spent by this invocation. analysis: what every judgment in the
  // report cost when it was made, cached ones included.
  const spend = { claude: 0, analysis: 0, calls: 0, cachedCalls: 0, serp: 0, serpFetched: 0, serpCostKnown: true }

  // 1. Search results
  log(`1/4 search results (${provider}, ${grid.length} searches)`)
  const serps = await mapLimit(grid, opts.concurrency, async (k) => {
    const file = path.join(monthDir, 'serp', provider, `${k.id}.json`)
    const hit = cached(file)
    if (hit) return hit.serp
    if (offline) return null
    try {
      const serp = await fetchSerp(provider, k, process.env)
      spend.serpFetched++
      if (serp.cost === null) spend.serpCostKnown = false
      else spend.serp += serp.cost
      return store(file, { keyword: k, fetchedAt: new Date().toISOString(), serp }).serp
    } catch (err) {
      log(`  ! ${k.query} (${k.city}): ${err.message}`)
      return null
    }
  })
  const withSerp = grid.map((k, i) => ({ k, serp: serps[i] })).filter((x) => x.serp)
  log(`  ${withSerp.length} of ${grid.length} searches have results (${spend.serpFetched} fetched now)`)

  // 2. Pages
  const hits = new Map()
  for (const { serp } of withSerp) for (const o of serp.organic) if (!hits.has(o.url)) hits.set(o.url, o)
  log(`2/4 pages (${hits.size} unique URLs)`)
  const pages = new Map()
  await mapLimit([...hits.values()], opts.concurrency + 2, async (hit) => {
    const known = knownSite(hit.domain)
    if (known && !known.fetchable) return pages.set(hit.url, { knownType: known.type, fetched: null })
    const file = path.join(monthDir, 'pages', `${sha(hit.url)}.json`)
    let fetched = cached(file)
    if (!fetched && !offline) fetched = store(file, await fetchPage(hit.url))
    pages.set(hit.url, { knownType: known?.type ?? null, fetched })
  })
  const fetchedOk = [...pages.values()].filter((p) => p.fetched?.ok).length
  const templates = findTemplatedPages(
    [...pages.entries()].filter(([, p]) => p.fetched?.ok).map(([url, p]) => ({ url, domain: domainOf(url), text: p.fetched.facts.fullText })),
    site.placeNames,
  )
  log(`  read ${fetchedOk} pages; ${[...templates.values()].filter((t) => t.similarity >= 0.8).length} are copy-paste city pages`)

  const budgetLeft = () => spend.claude < opts.maxUsd
  const callJudge = async (kind, system, user, schema, effort, maxTokens) => {
    const file = path.join(judgeDir, `${kind}-${sha(`${PROMPT_VERSION}\n${system}\n${user}`)}.json`)
    const hit = cached(file)
    if (hit) {
      spend.cachedCalls++
      spend.analysis += usageCost(opts.model, hit.usage)
      return hit
    }
    if (offline) return null
    if (!budgetLeft()) return { ok: false, error: 'budget reached' }
    const res = await judge(client, { model: opts.model, system, user, schema, effort, maxTokens })
    spend.calls++
    spend.claude += usageCost(opts.model, res.usage)
    spend.analysis += usageCost(opts.model, res.usage)
    // Only successes are cached; a failure is retried next run.
    return res.ok ? store(file, { ok: true, data: res.data, usage: res.usage }) : res
  }

  // 3. What each page is
  const toJudge = [...hits.values()].filter((h) => !(pages.get(h.url)?.knownType && !pages.get(h.url)?.fetched))
  log(`3/4 classifying ${toJudge.length} pages with ${opts.model}`)
  const pageInfo = new Map()
  for (const [url, p] of pages) {
    pageInfo.set(url, { verdict: null, facts: p.fetched?.ok ? p.fetched.facts : null, knownType: p.knownType, template: templates.get(url) })
  }
  let pageFailures = 0
  await mapLimit(toJudge, opts.concurrency, async (h) => {
    const info = pageInfo.get(h.url)
    try {
      const res = await callJudge('page', PAGE_SYSTEM, pageUserPrompt(h, pages.get(h.url).fetched, info.template), PageVerdict, 'low', 4000)
      if (res?.ok) info.verdict = res.data
      else if (res) {
        pageFailures++
        if (res.error !== 'budget reached') log(`  ! ${h.url}: ${res.error}`)
      }
    } catch (err) {
      pageFailures++
      log(`  ! ${h.url}: ${err.message}`)
    }
  })
  log(`  ${toJudge.length - pageFailures} classified · Claude so far $${spend.claude.toFixed(2)}`)

  // 4. What each results page offers
  log(`4/4 judging ${withSerp.length} results pages with ${opts.model}`)
  const infoFor = (url) => pageInfo.get(url) ?? { verdict: null, facts: null }
  const verdicts = await mapLimit(withSerp, opts.concurrency, async ({ k, serp }) => {
    try {
      const res = await callJudge('keyword', KEYWORD_SYSTEM, keywordUserPrompt(k, serp, infoFor, site.ownDomain), KeywordVerdict, 'medium', 8000)
      if (res && !res.ok && res.error !== 'budget reached') log(`  ! ${k.query} (${k.city}): ${res.error}`)
      return res?.ok ? res.data : null
    } catch (err) {
      log(`  ! ${k.query} (${k.city}): ${err.message}`)
      return null
    }
  })
  if (!budgetLeft()) log(`  Stopped calling Claude at the $${opts.maxUsd} budget; unjudged searches land in "Needs a human". Re-run with a higher --max-usd to finish.`)

  // Score, summarize, write
  const scored = withSerp.map(({ k, serp }, i) => scoreKeyword(k, serp, verdicts[i], site))
  const summary = summarize(scored, pageInfo)
  const date = new Date().toISOString().slice(0, 10)
  const run = {
    date,
    month: new Date(`${opts.month}-15`).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    provider,
    model: opts.model,
    searches: scored.length,
    cities: [...new Set(scored.map((k) => k.city))],
    serpCost: spend.serpCostKnown ? spend.serp : null,
    serpCostLabel: offline
      ? 'none (rebuilt from cache)'
      : spend.serpCostKnown
        ? `$${spend.serp.toFixed(3)}`
        : `${spend.serpFetched} ${provider} credits`,
    claudeCost: spend.claude,
    analysisCost: spend.analysis,
    claudeCalls: spend.calls,
    cachedCalls: spend.cachedCalls,
  }
  mkdirSync(OUT_DIR, { recursive: true })
  const base = path.join(OUT_DIR, `serp-steal-${date}`)
  writeFileSync(`${base}.md`, renderMarkdown(run, summary))
  writeFileSync(`${base}.html`, renderHtml(run, summary, scored))
  writeFileSync(`${base}.json`, JSON.stringify({ run, keywords: scored }, null, 2))

  log('')
  log(BUCKETS.map((b) => `${BUCKET_LABELS[b]} ${summary.byBucket[b].length}`).join(' · '))
  log(`Spent: search results ${run.serpCostLabel} · Claude $${spend.claude.toFixed(2)} (${spend.calls} calls, ${spend.cachedCalls} from cache)`)
  log(`Wrote ${path.relative(ROOT, base)}.{md,html,json}`)
}

function pickCachedProvider() {
  const dir = path.join(CACHE, opts.month, 'serp')
  if (!existsSync(dir)) return null
  return readdirSync(dir)[0] ?? null
}

// ── main ────────────────────────────────────────────────────────────────────

const site = await loadSite()
const grid = loadGrid(site)

if (command === 'plan') plan(grid)
else if (command === 'run') await execute(grid, site, { offline: false })
else if (command === 'report') await execute(grid, site, { offline: true })
else {
  console.log('Usage: node scripts/serp-steal.mjs plan | run | report [--model id] [--provider dataforseo|serper] [--cities all] [--city slug] [--limit n] [--max-usd n] [--concurrency n] [--month YYYY-MM]')
  process.exit(command ? 1 : 0)
}
