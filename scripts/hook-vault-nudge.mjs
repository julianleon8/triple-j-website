#!/usr/bin/env node
// Claude Code Stop hook. Warn-only, never blocks.
// The vault went four months without an entry while code kept changing; this
// is the countermeasure. One git call, ~20ms.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

let payload = {}
try {
  payload = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  /* fall through */
}
if (payload.stop_hook_active) process.exit(0) // don't re-fire on our own output

let dirty
try {
  dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' })
    .split('\n')
    .map((l) => l.slice(3).trim())
    .filter(Boolean)
} catch {
  process.exit(0)
}

const PRODUCT = /^(src\/lib\/(site|services|locations)\.ts|Business Profile\.md|Market Strategy\.md|Website Copy & Messaging\.md|Locked Decisions\.md|Connectors\.md|Project Context\.md)$/
const LEDGER = /^(Decisions\.md|Session Notes\.md)$/

const touchedProduct = dirty.some((f) => PRODUCT.test(f))
const touchedLedger = dirty.some((f) => LEDGER.test(f))

if (touchedProduct && !touchedLedger) {
  console.log(
    'Vault sync: product surface changed but neither Decisions.md nor Session Notes.md was written this session.\n' +
      'If a decision was made or reversed, log it now — same turn, per AGENTS.md.'
  )
}
process.exit(0)
