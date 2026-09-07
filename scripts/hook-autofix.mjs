#!/usr/bin/env node
// Claude Code PostToolUse hook for Write|Edit|MultiEdit.
//
// Repairs retired copy the moment it is written, instead of waiting for CI to
// report it. Runs after the write has landed, rewrites the file in place, and
// tells the agent what changed so its in-context copy does not go stale.
//
// Never blocks. Only applies the mechanical rules in lib/copy-fixes.mjs --
// anything needing judgement stays a report in check-vault.mjs.

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { applyFixes } from './lib/copy-fixes.mjs'

let payload
try {
  payload = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  process.exit(0)
}

const file = payload.tool_input?.file_path
if (!file || !existsSync(file)) process.exit(0)
try {
  if (!statSync(file).isFile()) process.exit(0)
} catch {
  process.exit(0)
}

const root = payload.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const rel = path.relative(root, file)

// Ledgers record what was true at the time; the archive is history. Neither is
// live copy, so neither gets rewritten.
//
// Locked Decisions.md and AGENTS.md are exempt for a different reason: they are
// the rule files. A rule must be able to name the phrase it bans, and on
// 2026-09-06 this hook rewrote `never "48-hour build"` in Locked Decisions.md
// into `never "same-week build"` -- it destroyed the rule it enforces. A file
// that defines the vocabulary can never be edited by a tool that reads it.
const EXEMPT =
  /^(Decisions\.md|Session Notes\.md|Locked Decisions\.md|AGENTS\.md|archive\/|scripts\/lib\/copy-fixes\.mjs$|scripts\/check-vault\.mjs$)/
if (EXEMPT.test(rel) || rel.startsWith('..')) process.exit(0)
if (!/\.(md|ts|tsx|txt)$/.test(rel)) process.exit(0)

const original = readFileSync(file, 'utf8')
const { text, changes } = applyFixes(original)
if (!changes.length) process.exit(0)

writeFileSync(file, text)

const lines = changes.map((c) => `  ${rel}:${c.line} -> "${c.to}" (${c.why})`).join('\n')
const msg =
  `Auto-fixed ${changes.length} retired phrase(s) in ${rel} after your write:\n${lines}\n` +
  `The file on disk now differs from what you wrote. Re-read it before editing again.`

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: msg },
  })
)
process.exit(0)
