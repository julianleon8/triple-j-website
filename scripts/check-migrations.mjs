#!/usr/bin/env node
// Migration drift checker.
//
// The database owns the record of what has been applied
// (supabase_migrations.schema_migrations). This script does NOT keep a second
// copy of that -- it compares the files in supabase/migrations/ against the
// live ledger and reports both directions:
//
//   * a file with no ledger row   -> written but never applied
//   * a ledger row with no file   -> applied out-of-band, no DDL in the repo
//
// The second direction is the one that matters. It is how `gallery_photos`
// existed in production for months with no migration in the repo, leaving a
// dangling reference in 009 and a schema that could not be rebuilt.
//
// schema_migrations lives outside the `public` schema, so PostgREST does not
// expose it and a service-role key cannot read it. Fetch it through the
// Supabase MCP server (see Connectors.md) and pipe the result in:
//
//   node scripts/check-migrations.mjs --stdin  < applied.json
//   node scripts/check-migrations.mjs --applied applied.json
//   node scripts/check-migrations.mjs --sql          # print the query to run
//
// Input is the query's JSON result: [{ "version": "...", "name": "..." }, ...]
//
// Not wired into governance.yml -- CI has no database access. Run it on demand,
// and after any schema change.

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const SQL = 'select version, name from supabase_migrations.schema_migrations order by version;'

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const DIR = path.join(ROOT, 'supabase/migrations')

const argv = process.argv.slice(2)
const arg = (flag) => {
  const i = argv.indexOf(flag)
  return i === -1 ? null : argv[i + 1]
}

if (argv.includes('--sql') || argv.length === 0) {
  console.log('Run this against the project (Supabase MCP execute_sql, or the SQL editor),')
  console.log('then pipe the JSON result back in:\n')
  console.log(`  ${SQL}\n`)
  console.log('  node scripts/check-migrations.mjs --stdin < applied.json')
  process.exit(argv.includes('--sql') ? 0 : 2)
}

let raw
if (argv.includes('--stdin')) {
  raw = readFileSync(0, 'utf8')
} else {
  const f = arg('--applied')
  if (!f || !existsSync(f)) {
    console.error('error: --applied <file.json> not found. See --sql for the query to run.')
    process.exit(2)
  }
  raw = readFileSync(f, 'utf8')
}

let rows
try {
  rows = JSON.parse(raw)
  if (!Array.isArray(rows)) throw new Error('expected a JSON array')
} catch (err) {
  console.error(`error: could not parse ledger JSON -- ${err.message}`)
  process.exit(2)
}

// Match on the migration name (`008_gallery_photos`), not the timestamp
// version: versions were assigned by whatever applied them and do not
// correspond to the numeric prefixes in the filenames.
const applied = new Map()
for (const r of rows) {
  const name = (r.name ?? '').replace(/\.sql$/, '').trim()
  if (name) applied.set(name, r.version ?? '?')
}

const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.sql'))
  .map((f) => f.replace(/\.sql$/, ''))
  .sort()

const notApplied = files.filter((f) => !applied.has(f))
const orphans = [...applied.keys()].filter((n) => !files.includes(n)).sort()

console.log(`migration files: ${files.length}   ledger rows: ${applied.size}\n`)

let failed = false

if (notApplied.length) {
  failed = true
  console.error(`NOT APPLIED (${notApplied.length}) -- written but never run:`)
  for (const f of notApplied) console.error(`  supabase/migrations/${f}.sql`)
  console.error('')
}

if (orphans.length) {
  failed = true
  console.error(`ORPHANED (${orphans.length}) -- applied to the database with no file in the repo:`)
  for (const n of orphans) console.error(`  ${n} (version ${applied.get(n)})`)
  console.error('  The schema cannot be rebuilt from this repo until each is reconstructed.')
  console.error('  Introspect the live objects and write an idempotent file, as 008 documents.\n')
}

// A numeric gap is not automatically a problem, but it is worth surfacing:
// 007 is missing because it never existed, and that took months to notice.
const nums = files.map((f) => parseInt(f.slice(0, 3), 10)).filter(Number.isFinite).sort((a, b) => a - b)
const gaps = []
for (let n = nums[0]; n < nums[nums.length - 1]; n++) {
  if (!nums.includes(n)) gaps.push(String(n).padStart(3, '0'))
}
if (gaps.length) console.log(`note: numbering gaps at ${gaps.join(', ')} (no file; confirm intentional)\n`)

if (failed) {
  process.exit(1)
}
console.log('Migrations in sync with the database ledger')
process.exit(0)
