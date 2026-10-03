#!/usr/bin/env node
// Internal-link audit over the built site.
//
// Counts the links a page gets from the BODY of other pages -- inside <main>,
// not the header/footer every page shares -- because a footer link tells a
// reader nothing about what to read next. Reports:
//
//   * thin pages      fewer than --min-in other pages link to them from a body
//   * dead ends       a page whose own body links nowhere
//   * blog posts      with no link to a service, a city, or the quote page
//                     (seo/SITE-STRUCTURE.md: each post links 1 service + 1 city + the quote)
//   * broken links    an internal link whose target is not a page
//
// It reads Next's prerendered HTML, so build first. Pages rendered on demand
// (gallery, partners, quote, hybrid-projects) are not in that output; start the
// built site and pass --base to fetch them too:
//
//   npm run build
//   node scripts/check-links.mjs
//
//   npm run build && npx next start -p 3100 &
//   node scripts/check-links.mjs --base http://localhost:3100
//
// `npm run build` needs the Supabase env vars set to *something*; placeholders
// are fine for this (see Connectors.md). Gallery project pages (/gallery/<id>)
// read the database and are not crawled, so their inbound links are not counted.
//
//   --dir <path>      prerendered HTML (default .next/server/app)
//   --base <url>      also fetch the on-demand pages from a running server
//   --min-in <n>      body-inbound floor (default 2)
//   --ignore a,b      routes left out of the thin/dead-end checks
//                     (default /privacy,/terms,/gallery -- legal pages, and a
//                     gallery whose links come from the database)
//   --strict          exit 1 when anything is flagged (default: report only)
//
// Not wired into governance.yml: it needs a build. Run it on demand, and after
// any change to navigation, templates, or the data in services.ts / locations.ts.

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(name)
  return i === -1 ? fallback : args[i + 1]
}
const DIR = opt('--dir', '.next/server/app')
const BASE = opt('--base', null)
const MIN_IN = Number(opt('--min-in', '2'))
const IGNORE = new Set(opt('--ignore', '/privacy,/terms,/gallery').split(','))
const STRICT = args.includes('--strict')

// Not part of the public site, or not a page a visitor reads.
const SKIP = /^\/(hq|login|setup|_|api|offline|quotes|sw|thank-you)/
// Pages rendered on demand, so absent from the prerendered output.
const ON_DEMAND = ['/gallery', '/partners', '/quote', '/services/hybrid-projects']
const ORIGIN = 'https://www.triplejmetaltx.com'

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    return e.isDirectory() ? walk(p) : e.name.endsWith('.html') ? [p] : []
  })
}

function routeOf(file) {
  const rel = relative(DIR, file).replace(/\.html$/, '')
  return rel === 'index' ? '/' : '/' + rel.replace(/\/index$/, '')
}

function normalize(href, from) {
  if (!href || /^(mailto:|tel:|sms:|javascript:|data:|#)/i.test(href.trim())) return null
  let url
  try {
    url = new URL(href.trim(), ORIGIN + from)
  } catch {
    return null
  }
  if (!/triplejmetaltx\.com$/.test(url.hostname)) return null
  return url.pathname.replace(/\/+$/, '') || '/'
}

function linksIn(html, from) {
  const out = []
  for (const m of html.matchAll(/<a\b([^>]*)>/gi)) {
    const href = m[1].match(/\bhref="([^"]*)"/i)
    const to = href && normalize(href[1].replace(/&amp;/g, '&'), from)
    if (to) out.push(to)
  }
  return out
}

function crawl(route, html) {
  const start = html.search(/<main\b/i)
  const end = html.lastIndexOf('</main>')
  const hasMain = start >= 0 && end > start
  return {
    body: linksIn(hasMain ? html.slice(start, end) : '', route),
    chrome: linksIn(hasMain ? html.slice(0, start) + html.slice(end) : html, route),
  }
}

if (!existsSync(DIR)) {
  console.error(`No prerendered HTML at ${DIR}. Run \`npm run build\` first (or pass --dir).`)
  process.exit(2)
}

const pages = {}
for (const f of walk(DIR)) {
  const route = routeOf(f)
  if (!SKIP.test(route)) pages[route] = crawl(route, readFileSync(f, 'utf8'))
}

if (BASE) {
  for (const route of ON_DEMAND) {
    try {
      const res = await fetch(BASE + route)
      if (res.ok) pages[route] = crawl(route, await res.text())
      else console.error(`skipped ${route}: HTTP ${res.status}`)
    } catch (e) {
      console.error(`skipped ${route}: ${e.message}`)
    }
  }
}

const routes = Object.keys(pages).sort()
const inbound = Object.fromEntries(routes.map((r) => [r, new Set()]))
for (const r of routes) {
  for (const to of pages[r].body) if (to !== r && inbound[to]) inbound[to].add(r)
}
const outbound = (r) => new Set(pages[r].body.filter((t) => t !== r))

const flags = []
for (const r of routes) {
  if (IGNORE.has(r)) continue
  if (inbound[r].size < MIN_IN) flags.push(`thin      ${r} -- linked from ${inbound[r].size} page bodies (floor ${MIN_IN})`)
  if (outbound(r).size === 0) flags.push(`dead end  ${r} -- no links in its body`)
}
for (const r of routes.filter((p) => p.startsWith('/blog/'))) {
  const to = [...outbound(r)]
  if (!to.some((t) => t.startsWith('/services/'))) flags.push(`blog      ${r} -- no service link`)
  if (!to.some((t) => t.startsWith('/locations/') || t === '/military')) flags.push(`blog      ${r} -- no city link`)
  if (!to.includes('/quote')) flags.push(`blog      ${r} -- no link to /quote`)
}
// On-demand pages are real routes even when this run did not fetch them.
const known = new Set([...routes, ...ON_DEMAND])
for (const r of routes) {
  for (const to of new Set([...pages[r].body, ...pages[r].chrome])) {
    // /gallery/<id> pages come from the database and are not crawled.
    if (!known.has(to) && !to.startsWith('/gallery/')) flags.push(`broken    ${r} -> ${to}`)
  }
}

const rows = routes.map((r) => ({ r, i: inbound[r].size, o: outbound(r).size })).sort((a, b) => a.i - b.i || a.r.localeCompare(b.r))
console.log(`${routes.length} pages${BASE ? '' : ' (prerendered only; pass --base for the on-demand pages)'}\n`)
console.log('route'.padEnd(64), 'in(body)', 'out(body)')
for (const { r, i, o } of rows) console.log(r.padEnd(64), String(i).padStart(8), String(o).padStart(9))

console.log(flags.length ? `\n${flags.length} flagged:\n  ${flags.join('\n  ')}` : '\nNo thin pages, dead ends, bare blog posts, or broken links.')
if (STRICT && flags.length) process.exit(1)
