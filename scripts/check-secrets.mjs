#!/usr/bin/env node
// Secret scanner. Shared by .githooks/pre-commit, the Claude Code hooks, and
// .github/workflows/governance.yml so all three enforce exactly one ruleset.
//
//   node scripts/check-secrets.mjs <file>...   scan specific files on disk
//   node scripts/check-secrets.mjs --staged    scan staged content (pre-commit)
//   node scripts/check-secrets.mjs --all       scan every git-tracked text file
//   node scripts/check-secrets.mjs --stdin <path>   scan text piped on stdin
//
// Exit 0 = clean, 1 = findings. No dependencies — runs before `npm ci`.

import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()

// Tuned to the providers this repo actually uses. Narrow on purpose: a scanner
// that cries wolf gets bypassed with --no-verify, which is worse than no scanner.
const PATTERNS = [
  ['Anthropic API key', /sk-ant-api\d{2}-[A-Za-z0-9_-]{20,}/],
  ['OpenAI API key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/],
  ['Resend API key', /\bre_[A-Za-z0-9_-]{16,}/],
  ['Twilio account SID', /\bAC[0-9a-f]{32}\b/],
  ['Twilio auth token', /\bSK[0-9a-f]{32}\b/],
  ['JWT (Supabase anon/service_role)', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ['Supabase personal access token', /\bsbp_[0-9a-f]{40}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Meta long-lived access token', /\bEAA[A-Za-z0-9]{40,}/],
  ['Stripe secret key', /\b[sr]k_(?:live|test)_[A-Za-z0-9]{20,}/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}/],
  ['Private key block', /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/],
]

// Values in .env.example that are obviously not real.
const PLACEHOLDER = new RegExp(
  '^(' +
    [
      '', '""', "''", '<.*>', 'your[-_].*', 'xxx+', 'changeme', 'example.*',
      'placeholder.*', 'todo', 'tbd',
      'https?://.*', 'mailto:.*',
      '[^@\\s]+@[^@\\s]+\\.[a-z]{2,}(,[^@\\s]+@[^@\\s]+\\.[a-z]{2,})*', // documented default addresses
      'development', 'production', 'sandbox',
    ].join('|') +
    ')$',
  'i'
)

const SKIP_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.svg', '.pdf',
  '.woff', '.woff2', '.ttf', '.otf', '.eot', '.mp4', '.webm', '.zip', '.lock',
])

function loadIgnore() {
  const f = path.join(ROOT, '.secretsignore')
  if (!existsSync(f)) return []
  return readFileSync(f, 'utf8')
    .split('\n')
    .map((l) => l.replace(/#.*$/, '').trim())
    .filter(Boolean)
    .map((glob) => new RegExp('^' + glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*') + '$'))
}
const IGNORES = loadIgnore()
const ignored = (rel) => IGNORES.some((re) => re.test(rel))

// git tracks symlinks (e.g. .claude/skills/* -> .agents/skills/*); never read through one.
function isRegularFile(abs) {
  try {
    return statSync(abs, { throwIfNoEntry: false })?.isFile() ?? false
  } catch {
    return false
  }
}

const findings = []
const add = (file, line, rule) => findings.push({ file, line, rule })

function scan(rel, text) {
  if (ignored(rel)) return
  if (text.includes('\u0000')) return // binary

  const isEnvExample = rel === '.env.example'

  // Path rule: no .env file other than the template may ever be committed.
  const base = path.basename(rel)
  if (base.startsWith('.env') && rel !== '.env.example') {
    add(rel, 1, 'env file must never be committed (only .env.example)')
    return
  }

  text.split('\n').forEach((line, i) => {
    const n = i + 1
    if (/check-secrets|secretsignore/.test(line)) return // don't flag this file's own patterns

    for (const [name, re] of PATTERNS) {
      if (re.test(line)) add(rel, n, name)
    }

    // Value rule: .env.example documents key NAMES, never real values.
    if (isEnvExample) {
      const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/)
      if (m) {
        const val = m[2].trim().replace(/^["']|["']$/g, '')
        if (val && !PLACEHOLDER.test(val)) {
          add(rel, n, `.env.example holds a real-looking value for ${m[1]}`)
        }
      }
    }
  })
}

function gitFiles(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\n')
    .filter(Boolean)
}

const argv = process.argv.slice(2)

if (argv[0] === '--stdin') {
  // Used by the Claude Code PreToolUse hook: content isn't on disk yet.
  const rel = argv[1] || 'stdin'
  scan(rel, readFileSync(0, 'utf8'))
} else if (argv[0] === '--staged') {
  for (const rel of gitFiles(['diff', '--cached', '--name-only', '--diff-filter=ACM'])) {
    if (SKIP_EXT.has(path.extname(rel))) continue
    let text
    try {
      text = execFileSync('git', ['show', `:${rel}`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
    } catch {
      continue
    }
    scan(rel, text)
  }
} else if (argv[0] === '--all') {
  for (const rel of gitFiles(['ls-files'])) {
    if (SKIP_EXT.has(path.extname(rel))) continue
    const abs = path.join(ROOT, rel)
    if (!isRegularFile(abs)) continue
    scan(rel, readFileSync(abs, 'utf8'))
  }
} else if (argv.length) {
  for (const f of argv) {
    const abs = path.isAbsolute(f) ? f : path.join(process.cwd(), f)
    if (!isRegularFile(abs)) continue
    scan(path.relative(ROOT, abs), readFileSync(abs, 'utf8'))
  }
} else {
  console.error('usage: check-secrets.mjs [--staged|--all|--stdin <path>|<file>...]')
  process.exit(2)
}

if (findings.length) {
  console.error('\nX Secret scan failed\n')
  for (const f of findings) console.error(`  ${f.file}:${f.line} — ${f.rule}`)
  console.error(`\n${findings.length} finding(s). Move the value into .env (gitignored) and leave a placeholder behind.`)
  console.error('If this is a false positive, add the path to .secretsignore.\n')
  process.exit(1)
}
process.exit(0)
