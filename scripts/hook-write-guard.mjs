#!/usr/bin/env node
// Claude Code PreToolUse hook for Write|Edit.
// Blocks (exit 2) a write that would put a credential into a file, before the
// file exists. This is the only hard block in the governance system.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

let payload
try {
  payload = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  process.exit(0) // never break the session on a malformed payload
}

const input = payload.tool_input ?? {}
const file = input.file_path ?? ''
if (!file) process.exit(0)

const base = path.basename(file)
if (base.startsWith('.env') && base !== '.env.example') {
  console.error(
    `Refused: ${base} holds live credentials and must never be written by an agent.\n` +
      'Ask the user to edit it directly. Document the key name in .env.example instead.'
  )
  process.exit(2)
}

// Write sends `content`; Edit sends `new_string`. MultiEdit sends `edits[]`.
const parts = [input.content, input.new_string]
if (Array.isArray(input.edits)) parts.push(...input.edits.map((e) => e?.new_string))
const text = parts.filter((s) => typeof s === 'string').join('\n')
if (!text) process.exit(0)

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
try {
  execFileSync('node', [path.join(root, 'scripts/check-secrets.mjs'), '--stdin', path.relative(root, file)], {
    input: text,
    stdio: ['pipe', 'pipe', 'pipe'],
  })
} catch (err) {
  console.error(
    'Refused: this write contains a credential-shaped string.\n' +
      String(err.stderr ?? '') +
      'Put the real value in .env (gitignored) and reference it via process.env.'
  )
  process.exit(2)
}
process.exit(0)
