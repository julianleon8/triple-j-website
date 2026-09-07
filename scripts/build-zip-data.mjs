#!/usr/bin/env node
/**
 * Builds src/lib/data/zip-geo.json — the ZIP reference dataset behind
 * src/lib/zip.ts.
 *
 * Source: U.S. Census Bureau, public domain (no attribution required, no
 * licence to carry). Three files, all fetched fresh at build time:
 *
 *   1. 2023 ZCTA Gazetteer            → the interior point (lat/lng) per ZCTA
 *   2. 2020 ZCTA ↔ County relationship → county name + state, with the land
 *                                        area of each overlapping part
 *   3. 2020 ZCTA ↔ Place relationship  → every incorporated place and CDP the
 *                                        ZCTA touches, with part land areas
 *
 * A ZCTA is not a USPS ZIP code. ZCTAs are census geography approximating the
 * delivery areas of *street* ZIPs; PO-box-only and single-building ZIPs have no
 * ZCTA and are absent here. That is fine for this library's job: those ZIPs
 * resolve to null and the curated service-area map in locations.ts still
 * answers for them.
 *
 * Coverage is Texas plus the four states that border it. Everything past that
 * is far enough away that "outside the service area" is the whole answer and a
 * city name would not change what Julian does about it.
 *
 * Usage:
 *   node scripts/build-zip-data.mjs
 *   node scripts/build-zip-data.mjs --cache-dir /tmp/census   # reuse downloads
 */

import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'src/lib/data/zip-geo.json')

/** State FIPS → USPS abbreviation. Texas and the states that border it. */
const STATES = {
  '48': 'TX',
  '40': 'OK',
  '22': 'LA',
  '35': 'NM',
  '05': 'AR',
}

const BASE_REL = 'https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520'
const SOURCES = {
  gazetteer: 'https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_zcta_national.zip',
  county: `${BASE_REL}/tab20_zcta520_county20_natl.txt`,
  place: `${BASE_REL}/tab20_zcta520_place20_natl.txt`,
}

const cacheArg = process.argv.indexOf('--cache-dir')
const CACHE = cacheArg > -1 ? process.argv[cacheArg + 1] : join(tmpdir(), 'tjm-census-zip')
mkdirSync(CACHE, { recursive: true })

function fetchToCache(url, name) {
  const path = join(CACHE, name)
  if (existsSync(path)) {
    console.log(`  cached  ${name}`)
    return path
  }
  console.log(`  fetch   ${name}`)
  execFileSync('curl', ['-sS', '--fail', '--max-time', '600', '-o', path, url], {
    stdio: ['ignore', 'inherit', 'inherit'],
  })
  return path
}

/** Census pipe-delimited files carry a UTF-8 BOM on the header line. */
function readPipeRows(path) {
  const text = readFileSync(path, 'utf8').replace(/^﻿/, '')
  const lines = text.split('\n')
  const header = lines[0].split('|')
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    const cells = line.split('|')
    const row = {}
    for (let c = 0; c < header.length; c++) row[header[c]] = cells[c]
    rows.push(row)
  }
  return rows
}

/**
 * Census place names carry a legal-status suffix: "Belton city",
 * "Harker Heights city", "Fort Hood CDP", "Bartlett town". Strip it — nobody
 * reading a push notification wants "Belton city".
 *
 * "Balance of" prefixes and the handful of names ending in a genuine word we'd
 * otherwise eat (e.g. "Village of Salado" is not a thing, but "Bee Cave
 * village" is) are handled by only stripping a known trailing token.
 */
const PLACE_SUFFIXES = [
  'CDP',
  'city',
  'town',
  'village',
  'borough',
  'municipality',
  'comunidad',
  'zona urbana',
]
function cleanPlaceName(namelsad) {
  let name = (namelsad || '').trim()
  if (!name) return null
  for (const suffix of PLACE_SUFFIXES) {
    if (name.toLowerCase().endsWith(` ${suffix.toLowerCase()}`)) {
      name = name.slice(0, -(suffix.length + 1)).trim()
      break
    }
  }
  // "Urbana" etc. can end up empty only if the whole name was a suffix.
  return name || null
}

/** "Bell County" → "Bell". The word "County" on every row is pure noise. */
function cleanCountyName(namelsad) {
  return (namelsad || '').trim().replace(/\s+County$/i, '').trim() || null
}

console.log('Building ZIP geo dataset from U.S. Census sources')
console.log(`  cache   ${CACHE}`)

// ── 1. County relationship: gives us state membership + county name ─────────
// This is also what decides which ZCTAs are in scope — a ZCTA has no state of
// its own, but its county parts do.
const countyPath = fetchToCache(SOURCES.county, 'zcta_county.txt')
const countyRows = readPipeRows(countyPath)

/** zip → { county, state } for the county part with the most land in the ZCTA. */
const countyByZip = new Map()
for (const row of countyRows) {
  const zip = row.GEOID_ZCTA5_20
  const countyGeoid = row.GEOID_COUNTY_20
  if (!zip || !countyGeoid) continue

  const state = STATES[countyGeoid.slice(0, 2)]
  if (!state) continue

  const county = cleanCountyName(row.NAMELSAD_COUNTY_20)
  if (!county) continue

  const area = Number(row.AREALAND_PART) || 0
  const held = countyByZip.get(zip)
  if (!held || area > held.area) {
    countyByZip.set(zip, { county, state, area })
  }
}
console.log(`  ${countyByZip.size} ZCTAs in ${Object.values(STATES).join(', ')}`)

// ── 2. Place relationship: every city/town/CDP each ZCTA touches ────────────
const placePath = fetchToCache(SOURCES.place, 'zcta_place.txt')
const placeRows = readPipeRows(placePath)

/** zip → [{ name, area }] — unranked; sorted once all rows are in. */
const placesByZip = new Map()
for (const row of placeRows) {
  const zip = row.GEOID_ZCTA5_20
  if (!zip || !countyByZip.has(zip)) continue

  // Rows with an empty place are the unincorporated remainder of the ZCTA.
  // They are the largest part in most rural ZIPs and name no place at all.
  const name = cleanPlaceName(row.NAMELSAD_PLACE_20)
  if (!name) continue

  const area = Number(row.AREALAND_PART) || 0
  const list = placesByZip.get(zip)
  if (list) list.push({ name, area })
  else placesByZip.set(zip, [{ name, area }])
}

// ── 3. Gazetteer: the interior point for each ZCTA ──────────────────────────
const gazZip = fetchToCache(SOURCES.gazetteer, 'gaz_zcta.zip')
const gazTxt = join(CACHE, '2023_Gaz_zcta_national.txt')
if (!existsSync(gazTxt)) {
  execFileSync('unzip', ['-o', '-q', gazZip, '-d', CACHE], { stdio: 'inherit' })
}

/** zip → [lat, lng]. Tab-delimited, and the trailing column is space-padded. */
const pointByZip = new Map()
{
  const lines = readFileSync(gazTxt, 'utf8').replace(/^﻿/, '').split('\n')
  const header = lines[0].split('\t').map((h) => h.trim())
  const iZip = header.indexOf('GEOID')
  const iLat = header.indexOf('INTPTLAT')
  const iLng = header.indexOf('INTPTLONG')
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const cells = lines[i].split('\t')
    const zip = cells[iZip]?.trim()
    const lat = Number(cells[iLat])
    const lng = Number(cells[iLng])
    if (!zip || !Number.isFinite(lat) || !Number.isFinite(lng)) continue
    pointByZip.set(zip, [lat, lng])
  }
}

// ── 4. Join, rank, emit ────────────────────────────────────────────────────
// Row shape: [zip, lat, lng, state, county, ...places]
// places[0] is the primary city — the named place covering the most land in
// the ZCTA. Land-area ranking is a proxy for the USPS preferred city name, not
// the same thing: the real mapping is USPS-licensed data we don't have. It is
// close enough for a ZIP outside the service area, and inside the service area
// the curated map in locations.ts overrides it anyway.
const rows = []
const missingPoint = []
for (const [zip, { county, state }] of countyByZip) {
  const point = pointByZip.get(zip)
  if (!point) {
    missingPoint.push(zip)
    continue
  }
  const places = (placesByZip.get(zip) ?? [])
    .sort((a, b) => b.area - a.area || a.name.localeCompare(b.name))
    .map((p) => p.name)

  // ~11m of precision. Four decimals is far finer than a ZCTA centroid means
  // and cuts the file by a third against the raw six.
  const lat = Math.round(point[0] * 1e4) / 1e4
  const lng = Math.round(point[1] * 1e4) / 1e4

  rows.push([zip, lat, lng, state, county, ...places])
}
rows.sort((a, b) => a[0].localeCompare(b[0]))

const withoutPlace = rows.filter((r) => r.length === 5).length
console.log(`  ${rows.length} rows · ${withoutPlace} with no named place · ${missingPoint.length} skipped for no gazetteer point`)

const payload = {
  _comment: 'GENERATED by scripts/build-zip-data.mjs — do not edit by hand.',
  _source: 'U.S. Census Bureau (public domain): 2023 ZCTA Gazetteer, 2020 ZCTA↔County and ZCTA↔Place relationship files',
  _rowShape: '[zip, lat, lng, state, county, ...places] — places[0] is the primary city',
  generated: new Date().toISOString().slice(0, 10),
  states: Object.values(STATES).sort(),
  count: rows.length,
  rows,
}

mkdirSync(dirname(OUT), { recursive: true })
// One row per line: a 4,000-element array on a single line is unreviewable in
// a diff, and JSON.stringify's indent mode puts every array element on its own
// line, which is just as bad the other way.
const body = rows.map((r) => `    ${JSON.stringify(r)}`).join(',\n')
const json =
  '{\n' +
  Object.entries(payload)
    .filter(([k]) => k !== 'rows')
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
    .join(',\n') +
  ',\n  "rows": [\n' +
  body +
  '\n  ]\n}\n'

writeFileSync(OUT, json)
const kb = Math.round(Buffer.byteLength(json) / 1024)
console.log(`  wrote   ${OUT.replace(ROOT + '/', '')} (${kb} KB)`)
