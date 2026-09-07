// Shared table of MECHANICAL copy corrections.
//
// Only rules whose replacement is unambiguous in every context belong here.
// A rule that needs judgement about the surrounding sentence must stay a
// report-only rule in check-vault.mjs -- an auto-fixer that produces awkward
// prose is worse than one that stays quiet.
//
// Deliberately NOT auto-fixed: "4,000 PSI concrete". The 2026-05-01 reversal
// made it on-request-only, but several live occurrences tie the spec to
// specific soil claims ("engineered for Blackland Prairie clay"), so the
// replacement wording differs case by case. Reported, never rewritten.

export const FIXES = [
  {
    id: 'brand-alias-jjj',
    re: /Triple JJJ Metal Buildings(?: LLC)?/g,
    to: 'Triple J Metal',
    why: 'retired brand alias',
  },
  {
    id: 'legal-alias',
    re: /Triple J Metal Buildings,? LLC/g,
    to: 'Triple J Metal LLC',
    why: 'retired legal alias',
  },
  {
    id: 'build-time',
    re: /\b48[-‑ ]?(?:hour|hr)s?[-‑ ]build(?:s)?\b/gi,
    to: 'same-week build',
    why: '48 hrs is materials arrival, not build time',
  },
  {
    id: 'build-time-noun',
    re: /\b48[-‑ ]?(?:hour|hr)s?[-‑ ]build time\b/gi,
    to: 'same-week build time',
    why: '48 hrs is materials arrival, not build time',
  },
  {
    id: 'turnaround',
    re: /\b48[-‑ ]?(?:hour|hr)s?[-‑ ]turnaround\b/gi,
    to: 'same-week turnaround',
    why: 'retired timeline claim',
  },
]

// A line that names a retired claim in order to ban it is not a violation, and
// rewriting it would destroy the rule. Same guard check-vault.mjs uses.
export const DEFINES =
  /retired|never say|never use|do not use|not the promised|instead of|reversed|banned/i

export function applyFixes(text) {
  const changes = []
  const out = text
    .split('\n')
    .map((line, i) => {
      if (DEFINES.test(line)) return line
      let next = line
      for (const f of FIXES) {
        f.re.lastIndex = 0
        if (!f.re.test(next)) continue
        f.re.lastIndex = 0
        const before = next
        next = next.replace(f.re, f.to)
        if (next !== before) changes.push({ line: i + 1, id: f.id, why: f.why, to: f.to })
      }
      return next
    })
    .join('\n')
  return { text: out, changes }
}
