import { describe, expect, it } from 'vitest'

import { SERVICE_SLUG_ES } from '@/i18n/routes'
import { SITE } from './site'
import { SERVICES } from './services'
import { SERVICES_ES, getService } from './services.es'

const SUFFIX = ` | ${SITE.name}`
const TITLE_MAX = 60
const DESCRIPTION_MAX = 155

const slugs = Object.keys(SERVICES)

/** Every digit run in a string, sorted: "$3,300 · 20×20" → ["20", "20", "3,300"]. */
function numbers(text: string): string[] {
  return (text.match(/\d[\d,.]*\d|\d/g) ?? []).sort()
}

/** Walk the Spanish copy and pair each string with the English string at the same path. */
function pairs(es: unknown, en: unknown, path = ''): { path: string; es: string; en: string }[] {
  if (typeof es === 'string') return [{ path, es, en: String(en) }]
  if (Array.isArray(es)) {
    const list = en as unknown[]
    return [{ path: `${path}.length`, es: String(es.length), en: String(list.length) }, ...es.flatMap((v, i) => pairs(v, list[i], `${path}[${i}]`))]
  }
  if (es && typeof es === 'object') {
    return Object.entries(es).flatMap(([k, v]) => pairs(v, (en as Record<string, unknown>)[k], `${path}.${k}`))
  }
  return []
}

describe('Spanish service copy', () => {
  it('covers every service, and every service has a Spanish slug', () => {
    expect(Object.keys(SERVICES_ES).sort()).toEqual([...slugs].sort())
    expect(Object.keys(SERVICE_SLUG_ES).sort()).toEqual([...slugs].sort())
  })

  describe.each(slugs)('%s', (slug) => {
    const en = SERVICES[slug]
    const es = SERVICES_ES[slug]

    it('has the English copy fields, and a forge block exactly when the English has one', () => {
      expect(Boolean(es.forge)).toBe(Boolean(en.forge))
      expect(Boolean(es.trustPoints)).toBe(Boolean(en.trustPoints))
      expect(Boolean(es.featuresHeading)).toBe(Boolean(en.featuresHeading))
    })

    it('keeps every number identical field by field', () => {
      for (const p of pairs(es, en)) {
        expect(numbers(p.es), `${slug}${p.path}`).toEqual(numbers(p.en))
      }
    })

    it('fits the title and description in a search result', () => {
      expect(es.metaTitle.endsWith(SUFFIX)).toBe(false)
      expect((es.metaTitle + SUFFIX).length).toBeLessThanOrEqual(TITLE_MAX)
      expect(es.metaDescription.length).toBeLessThanOrEqual(DESCRIPTION_MAX)
    })

    it('merges into a full service record', () => {
      const merged = getService(slug, 'es')
      expect(merged?.slug).toBe(slug)
      expect(merged?.title).toBe(es.title)
      expect(merged?.relatedSlugs).toEqual(en.relatedSlugs)
      expect(merged?.forge?.img).toBe(en.forge?.img)
      expect(merged?.forge?.related).toEqual(en.forge?.related)
      expect(merged?.forge?.options.map((o) => o.price !== undefined)).toEqual(en.forge?.options.map((o) => o.price !== undefined))
      expect(merged?.forge?.options.map((o) => o.structure)).toEqual(en.forge?.options.map((o) => o.structure))
      expect(getService(slug, 'en')).toBe(en)
    })
  })

  it('never breaks the claim locks in Spanish', () => {
    const all = JSON.stringify(SERVICES_ES)
    expect(all).not.toMatch(/48 horas/i)
    expect(all).not.toMatch(/calibre 12/i)
    expect(all).not.toMatch(/concreto incluido|incluye (la )?losa/i)
    expect(all).not.toMatch(/\b(tramitamos|sacamos|presentamos) (el |los |tu |tus )?permisos?\b/i)
    expect(all).not.toMatch(/\b(Juan|Freddy|Julian|Jose Alfredo)\b/)
    expect(all).not.toMatch(/\busted(es)?\b/i)
  })

  it('returns undefined for an unknown slug', () => {
    expect(getService('nope', 'es')).toBeUndefined()
  })
})
