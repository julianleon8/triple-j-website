import { describe, expect, it } from 'vitest'

import {
  ALTERNATIVES_CONTENT,
  ALTERNATIVES_SLUGS,
  COMPETITORS,
  LOCAL_ROUNDUP_COMPARISON_ROWS,
  NATIONAL_KIT_COMPARISON_ROWS,
  type ComparisonCell,
  type ComparisonRow,
} from './competitors'
import {
  ALTERNATIVES_CONTENT_ES,
  COMPETITORS_ES,
  getAlternativesContent,
  getCompetitor,
  localRoundupComparisonRows,
  nationalKitComparisonRows,
} from './competitors.es'

/** Every digit run in a string, sorted: "3,000 PSI · 20x20" → ["20", "20", "3000"]. */
function numbers(text: string): string[] {
  return (text.match(/\d[\d,.]*\d|\d/g) ?? []).map((n) => n.replace(/,(?=\d{3}\b)/g, '')).sort()
}

/** Walk the Spanish copy and pair each string with the English string at the same path. */
function pairs(es: unknown, en: unknown, path = ''): { path: string; es: string; en: string }[] {
  if (typeof es === 'string') return [{ path, es, en: String(en) }]
  if (Array.isArray(es)) {
    const list = en as unknown[]
    return [
      { path: `${path}.length`, es: String(es.length), en: String(list.length) },
      ...es.flatMap((v, i) => pairs(v, list[i], `${path}[${i}]`)),
    ]
  }
  if (es && typeof es === 'object') {
    return Object.entries(es).flatMap(([k, v]) => pairs(v, (en as Record<string, unknown>)[k], `${path}.${k}`))
  }
  return []
}

function statusOf(cell: ComparisonCell | undefined): string {
  return typeof cell === 'string' ? cell : (cell?.status ?? 'unknown')
}

function noteOf(cell: ComparisonCell | undefined): string | null {
  return typeof cell === 'object' ? cell.note : null
}

/** Rows keep their statuses; every English note has a Spanish one; numbers match. */
function expectTwinRows(en: ComparisonRow[], es: ComparisonRow[]) {
  expect(es).toHaveLength(en.length)
  en.forEach((row, i) => {
    const twin = es[i]
    expect(Object.keys(twin.cells).sort()).toEqual(Object.keys(row.cells).sort())
    expect(twin.label).not.toBe(row.label)
    expect(Boolean(twin.description)).toBe(Boolean(row.description))
    for (const slug of Object.keys(row.cells) as (keyof typeof row.cells)[]) {
      expect(statusOf(twin.cells[slug])).toBe(statusOf(row.cells[slug]))
      const note = noteOf(row.cells[slug])
      if (note === null) {
        expect(noteOf(twin.cells[slug])).toBeNull()
      } else {
        const spanish = noteOf(twin.cells[slug])
        expect(spanish, `${row.label} / ${slug}: note not translated`).not.toBeNull()
        expect(spanish).not.toBe(note)
        expect(numbers(spanish ?? '')).toEqual(numbers(note))
      }
    }
  })
}

describe('Spanish competitor copy', () => {
  it('covers every competitor and every alternatives page', () => {
    expect(Object.keys(COMPETITORS_ES).sort()).toEqual(Object.keys(COMPETITORS).sort())
    expect(Object.keys(ALTERNATIVES_CONTENT_ES).sort()).toEqual([...ALTERNATIVES_SLUGS].sort())
  })

  it.each(Object.keys(COMPETITORS))('%s: facts stay English, words are Spanish with the same numbers', (slug) => {
    const en = COMPETITORS[slug as keyof typeof COMPETITORS]
    const es = getCompetitor(en.slug, 'es')
    expect({ name: es.name, type: es.type, homeUrl: es.homeUrl, asOf: es.asOf, slug: es.slug }).toEqual({
      name: en.name,
      type: en.type,
      homeUrl: en.homeUrl,
      asOf: en.asOf,
      slug: en.slug,
    })
    for (const field of ['oneLiner', 'coverage'] as const) {
      expect(es[field]).not.toBe(en[field])
      expect(numbers(es[field]), `${slug} ${field}`).toEqual(numbers(en[field]))
    }
    expect(getCompetitor(en.slug, 'en')).toBe(en)
  })

  describe.each(ALTERNATIVES_SLUGS)('alternatives/%s', (slug) => {
    const en = ALTERNATIVES_CONTENT[slug]
    const es = getAlternativesContent(slug, 'es')

    it('keeps slug and compared competitors, English comes back untouched', () => {
      expect(es?.slug).toBe(en.slug)
      expect(es?.competitorSlugs).toEqual(en.competitorSlugs)
      expect(getAlternativesContent(slug, 'en')).toBe(en)
    })

    it('is a twin of the English: same shape, same numbers, translated', () => {
      // Only fields the English entry has, and every translatable field present.
      expect(Object.keys(ALTERNATIVES_CONTENT_ES[slug]).every((k) => k in en)).toBe(true)
      expect(Object.keys(ALTERNATIVES_CONTENT_ES[slug]).sort()).toEqual(
        Object.keys(en).filter((k) => k !== 'slug' && k !== 'competitorSlugs').sort(),
      )
      for (const p of pairs(ALTERNATIVES_CONTENT_ES[slug], en)) {
        expect(p.es.trim(), p.path).not.toBe('')
        expect(numbers(p.es), `${slug}${p.path}`).toEqual(numbers(p.en))
        if (p.en.split(/\s+/).length >= 5) expect(p.es, `${slug}${p.path}: left in English`).not.toBe(p.en)
      }
    })

    it('keeps the locks: same-week, concrete priced separately, no "48 horas"', () => {
      const text = JSON.stringify(es)
      expect(text).not.toMatch(/48 horas|concreto incluido|tramitamos|presentamos el permiso/i)
      expect(text).toMatch(/misma semana/)
      expect(text).toMatch(/no incluyen el concreto/)
    })
  })

  it('returns null for an unknown slug', () => {
    expect(getAlternativesContent('nope', 'es')).toBeNull()
    expect(getAlternativesContent('constructor', 'es')).toBeNull()
  })

  it('translates the /alternatives comparison rows without touching a status', () => {
    expect(nationalKitComparisonRows('eagle-carports', 'en')).toEqual(NATIONAL_KIT_COMPARISON_ROWS('eagle-carports'))
    expectTwinRows(
      NATIONAL_KIT_COMPARISON_ROWS('eagle-carports'),
      nationalKitComparisonRows('eagle-carports', 'es'),
    )
    // The competitor's own key carries the competitor note.
    const row = nationalKitComparisonRows('carport-central', 'es')[0]
    expect(noteOf(row.cells['carport-central'])).toBe('Confirma con el proveedor')
  })

  it('translates the local roundup rows without touching a status', () => {
    expect(localRoundupComparisonRows('en')).toBe(LOCAL_ROUNDUP_COMPARISON_ROWS)
    expectTwinRows(LOCAL_ROUNDUP_COMPARISON_ROWS, localRoundupComparisonRows('es'))
  })
})
