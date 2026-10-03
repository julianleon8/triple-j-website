import { describe, expect, it } from 'vitest'

import { BLOG_POSTS } from '@/lib/blog'

/**
 * English and Spanish copy must stay twins (Locked Decisions → Spanish site).
 *
 * For every bilingual copy module (src/i18n/copy, src/i18n/pages) and every
 * Spanish data file (src/lib/*.es.ts):
 *   - the Spanish side has the English side's keys, no more, no fewer;
 *   - no Spanish string is empty;
 *   - every string carries the same numbers as its English twin, so a price,
 *     size, PSI, gauge, distance or percentage can't drift between languages;
 *   - a sentence of five or more words was actually translated.
 *
 * Functions (copy with interpolation) are called with sample arguments and
 * their output is compared the same way.
 */

type Leaf = { path: string; value: string }

const SAMPLE_ARGS: unknown[] = ['Sample', 'Sample', 'Sample', 'Sample']

function leaves(value: unknown, path = ''): Leaf[] {
  if (typeof value === 'string') return [{ path, value }]
  if (typeof value === 'function') {
    const out = (value as (...args: unknown[]) => unknown)(...SAMPLE_ARGS.slice(0, value.length))
    return leaves(out, `${path}()`)
  }
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, `${path}[${i}]`))
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k))
  }
  return []
}

function shape(value: unknown): unknown {
  if (typeof value === 'function') return 'fn'
  if (Array.isArray(value)) return value.length
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, shape((value as Record<string, unknown>)[k])]))
  }
  return typeof value
}

/** Every number as written, normalized: "3,000" and "3000" are the same number. */
export function numbers(text: string): string[] {
  return (text.match(/\d[\d,.]*\d|\d/g) ?? []).map((n) => n.replace(/,(?=\d{3}\b)/g, '').replace(/\.$/, '')).sort()
}

/** Strings that are legitimately the same in both languages. */
const SAME_OK = /^(Triple J Metal|Fort Cavazos|HOA|PBR|PBU|Galvalume|Temple|Belton|Killeen|Waco|[A-Z][\w-]*,? TX)\b/

function comparePair(name: string, en: unknown, es: unknown) {
  expect(shape(es), `${name}: Spanish has a different shape from English`).toEqual(shape(en))
  const enLeaves = leaves(en)
  const esLeaves = new Map(leaves(es).map((l) => [l.path, l.value]))
  for (const { path, value } of enLeaves) {
    const spanish = esLeaves.get(path)
    expect(spanish, `${name} ${path}: missing in Spanish`).toBeDefined()
    if (spanish === undefined) continue
    if (value.trim()) expect(spanish.trim(), `${name} ${path}: empty in Spanish`).not.toBe('')
    expect(numbers(spanish), `${name} ${path}: numbers differ\n  en: ${value}\n  es: ${spanish}`).toEqual(numbers(value))
    const words = value.trim().split(/\s+/).length
    if (words >= 5 && !value.startsWith('/') && !SAME_OK.test(value)) {
      expect(spanish, `${name} ${path}: left in English`).not.toBe(value)
    }
  }
}

const copyModules = import.meta.glob<Record<string, unknown>>(['./copy/*.ts', './pages/*.ts', '!./**/*.test.ts'], {
  eager: true,
})

describe('bilingual copy modules', () => {
  const pairs = Object.entries(copyModules).flatMap(([file, mod]) =>
    Object.entries(mod)
      .filter(([, v]) => v && typeof v === 'object' && 'en' in (v as object) && 'es' in (v as object))
      .map(([exportName, v]) => [`${file} ${exportName}`, v as { en: unknown; es: unknown }] as const),
  )

  it('finds the copy modules', () => {
    expect(pairs.length).toBeGreaterThanOrEqual(8)
  })

  it.each(pairs)('%s: Spanish is a twin of English', (name, pair) => {
    comparePair(name, pair.en, pair.es)
  })
})

/**
 * Spanish data files keyed by English slug, compared entry by entry against
 * the English record, on the fields the Spanish file translates. A new
 * `src/lib/*.es.ts` must be listed here (the first test fails until it is).
 */
const dataModules = import.meta.glob<Record<string, unknown>>(['../lib/*.es.ts'], { eager: true })

const DATA_SOURCES: Record<string, { en: Record<string, unknown>; esExport: string }> = {
  '../lib/blog.es.ts': { en: Object.fromEntries(BLOG_POSTS.map((p) => [p.slug, p])), esExport: 'BLOG_POSTS_ES' },
}

describe('Spanish data files', () => {
  it('knows every Spanish data file', () => {
    expect(Object.keys(dataModules).sort()).toEqual(Object.keys(DATA_SOURCES).sort())
  })

  it.each(Object.entries(DATA_SOURCES))('%s: every entry is a twin of its English one', (file, { en, esExport }) => {
    const es = dataModules[file]?.[esExport] as Record<string, unknown> | undefined
    expect(es, `${file} exports no ${esExport}`).toBeDefined()
    for (const [slug, spanish] of Object.entries(es ?? {})) {
      const english = en[slug] as Record<string, unknown> | undefined
      expect(english, `${file}: Spanish entry "${slug}" has no English twin`).toBeDefined()
      if (!english) continue
      const englishFields = Object.fromEntries(Object.keys(spanish as object).map((k) => [k, english[k]]))
      comparePair(`${file} ${slug}`, englishFields, spanish)
    }
  })
})
