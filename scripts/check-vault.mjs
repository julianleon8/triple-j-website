#!/usr/bin/env node
// Vault integrity checker. Mechanises the rules in AGENTS.md so drift is caught
// by CI instead of accumulating silently for four months.
//
//   node scripts/check-vault.mjs
//
// Exit 0 = clean, 1 = findings. No dependencies.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { applyFixes, DEFINES } from './lib/copy-fixes.mjs'

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8')
const has = (p) => existsSync(path.join(ROOT, p))

const FIX = process.argv.includes('--fix')
const fixed = []

const findings = []
const fail = (file, line, msg) => findings.push({ file, line, msg })


const rootMd = readdirSync(ROOT).filter((f) => f.endsWith('.md')).sort()

// ---------------------------------------------------------------- rule 1
// Every live vault file is indexed in AGENTS.md. This is the rule that makes
// "8 of 16 files indexed" impossible to repeat.
{
  const agents = read('AGENTS.md')
  const exempt = new Set(['AGENTS.md', 'CLAUDE.md'])
  for (const f of rootMd) {
    if (exempt.has(f)) continue
    if (!agents.includes('`' + f + '`')) {
      fail('AGENTS.md', 1, `vault index is missing \`${f}\` - add it, or move the file to archive/`)
    }
  }
}

// ---------------------------------------------------------------- rule 2
// Cited paths exist. Four names are grandfathered: they were cited by
// Decisions.md rows before ever being committed, and the ledger is append-only
// so those rows cannot be edited. See the note at the top of Decisions.md.
{
  const GRANDFATHERED = new Set([
    'dev/project_2025_pricing_internal.md',
    'dev/feedback_ad_pricing_accuracy.md',
    'dev/feedback_turnkey_vs_steel_install.md',
    'dev/feedback_no_public_pricing_yet.md',
    // Ledger row cites src/app/llms.txt; the file actually lives at public/llms.txt.
    // Decisions.md is append-only, so the row stands as written.
    'src/app/llms.txt',
  ])
  for (const f of ['Decisions.md', 'Locked Decisions.md', 'AGENTS.md']) {
    if (!has(f)) continue
    read(f).split('\n').forEach((line, i) => {
      for (const m of line.matchAll(/`((?:dev|docs|seo|src|scripts)\/[A-Za-z0-9._/-]+)`/g)) {
        const p = m[1]
        if (GRANDFATHERED.has(p) || has(p)) continue
        fail(f, i + 1, `cites \`${p}\`, which does not exist`)
      }
    })
  }
}

// ---------------------------------------------------------------- rule 3
// Session Notes.md: one H1, entries strictly newest-first.
{
  const lines = read('Session Notes.md').split('\n')
  const h1 = lines.filter((l) => /^# /.test(l))
  if (h1.length !== 1) fail('Session Notes.md', 1, `expected exactly one H1, found ${h1.length}`)

  let prev = null
  lines.forEach((l, i) => {
    const m = l.match(/^## (\d{4}-\d{2}-\d{2})/)
    if (!m) return
    if (prev && m[1] > prev) {
      fail('Session Notes.md', i + 1, `${m[1]} appears after ${prev} - entries must be newest-first`)
    }
    prev = m[1]
  })
}

// ---------------------------------------------------------------- rule 4
// Decisions.md renders as one continuous table: after the separator row, every
// non-blank line is a table row, and no blank line sits between rows.
{
  const lines = read('Decisions.md').split('\n')
  const start = lines.findIndex((l) => /^\|-{3,}/.test(l))
  if (start === -1) fail('Decisions.md', 1, 'no markdown table separator found')
  else {
    for (let i = start + 1; i < lines.length; i++) {
      const l = lines[i]
      if (l.trim() === '') {
        const nxt = lines.slice(i + 1).find((x) => x.trim() !== '')
        if (nxt && nxt.startsWith('|')) {
          fail('Decisions.md', i + 1, 'blank line between table rows splits the table in Obsidian')
        }
        continue
      }
      if (!l.startsWith('|')) fail('Decisions.md', i + 1, 'prose inside the decisions table')
    }
  }
}

// ---------------------------------------------------------------- rule 5
// Retired claims must not appear in live vault copy or in shipped source.
// Ledgers and the archive are exempt - they record what was true then.
{
  const BANNED = [
    [/48[- ]h(?:ou)?r build/i, 'retired claim "48-hour build" - 48 hrs is materials arrival; say "same-week"'],
    [/48[- ]hour turnaround/i, 'retired claim - say "same-week turnaround"'],
    [/Triple JJJ/i, 'retired brand alias'],
    [/Triple J Metal Buildings LLC/i, 'retired legal alias - the legal name is "Triple J Metal LLC"'],
    [/4,?000 PSI concrete/i, '4,000 PSI is on-request only, never the promised default (reversed 2026-05-01)'],
  ]
  const EXEMPT = new Set(['Decisions.md', 'Session Notes.md', 'Locked Decisions.md'])

  const scanText = (rel, text, report = fail) => {
    text.split('\n').forEach((line, i) => {
      if (DEFINES.test(line)) return
      for (const [re, msg] of BANNED) {
        if (re.test(line)) report(rel, i + 1, msg)
      }
    })
  }

  const autofix = (rel) => {
    const before = read(rel)
    const { text, changes } = applyFixes(before)
    if (!changes.length) return
    writeFileSync(path.join(ROOT, rel), text)
    for (const c of changes) fixed.push({ file: rel, line: c.line, to: c.to })
  }

  const live = rootMd.filter((f) => !EXEMPT.has(f))
  if (FIX) for (const rel of live) autofix(rel)
  for (const rel of live) scanText(rel, read(rel))

  // Shipped source is customer-facing copy, held to the same rules.
  const srcFiles = execFileSync('git', ['ls-files', 'src'], { encoding: 'utf8' })
    .split('\n')
    .filter((f) => /\.(ts|tsx)$/.test(f))
  // The 4,000 PSI drift found on 2026-09-06 was carried here as a non-failing
  // warning while the copy decision was outstanding. It was resolved the same
  // day -- all 22 occurrences rewritten to "3,000 PSI standard, 4,000 on
  // request" -- so this rule now enforces with no exceptions. Keep it that way:
  // a standing exception list is how the drift survived four months.
  for (const rel of srcFiles) {
    if (!has(rel)) continue
    if (FIX) autofix(rel)
    scanText(rel, read(rel), fail)
  }
}

// ---------------------------------------------------------------- rule 6
// Locked Decisions.md exists and every section has content.
{
  if (!has('Locked Decisions.md')) {
    fail('Locked Decisions.md', 1, 'missing - this file is the current-state half of the memory system')
  } else {
    const lines = read('Locked Decisions.md').split('\n')
    lines.forEach((l, i) => {
      if (!/^## /.test(l)) return
      const body = lines.slice(i + 1).find((x) => x.trim() !== '')
      if (!body || /^#/.test(body)) fail('Locked Decisions.md', i + 1, `section "${l.slice(3)}" is empty`)
    })
  }
}

// ---------------------------------------------------------------------------
if (fixed.length) {
  console.error(`\nAuto-fixed ${fixed.length} retired phrase(s):\n`)
  for (const f of fixed) console.error(`  ${f.file}:${f.line} -> "${f.to}"`)
  console.error('')
}

if (findings.length) {
  console.error('\nX Vault check failed\n')
  const byFile = {}
  for (const f of findings) (byFile[f.file] ??= []).push(f)
  for (const [file, list] of Object.entries(byFile)) {
    console.error(`  ${file}`)
    for (const f of list) console.error(`    :${f.line} - ${f.msg}`)
  }
  console.error(`\n${findings.length} finding(s).\n`)
  process.exit(1)
}
console.log(FIX && fixed.length ? `Vault check passed (${fixed.length} auto-fixed)` : 'Vault check passed')
process.exit(0)
