#!/usr/bin/env node
// Claude Code PreToolUse hook for Bash.
// Runs on every Bash call, so it exits immediately unless the command is a
// commit. Only then does it pay for a staged secret scan.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

let payload
try {
  payload = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  process.exit(0)
}

const cmd = payload.tool_input?.command ?? ''

// Match only an actual invocation at a shell boundary. Matching the bare phrase
// anywhere would fire on any command whose text merely mentions the verb --
// a heredoc writing documentation, for instance.
const INVOCATION = /(?:^|[;&|(]|\n)\s*(?:sudo\s+)?git\s+(?:-\S+\s+)*commit\b/
const invocation = cmd.match(INVOCATION)
if (!invocation) process.exit(0)

// Only inspect flags on the invocation itself, not the whole script.
const tail = cmd.slice(invocation.index)
if (/--no-verify|\s-n\b/.test(tail)) {
  console.error(
    'Refused: --no-verify bypasses the secret scan. Remove it, or ask the user to override explicitly.'
  )
  process.exit(2)
}

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
try {
  execFileSync('node', [path.join(root, 'scripts/check-secrets.mjs'), '--staged'], { stdio: ['ignore', 'pipe', 'pipe'] })
} catch (err) {
  console.error('Refused: staged changes contain a credential.\n' + String(err.stderr ?? ''))
  process.exit(2)
}
process.exit(0)
