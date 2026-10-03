import { describe, expect, it } from 'vitest'

import { LOCATIONS, LOCATION_SLUGS, type LocationData } from '@/lib/locations'
import { LOCATIONS_ES, getLocation } from '@/lib/locations.es'

const NUMBER = /\d+(?:,\d{3})*(?:\.\d+)?/g
const nums = (s: string) => s.match(NUMBER) ?? []

/** Every [english, spanish] string pair in a city, with a label for failures. */
function pairs(slug: string): Array<[string, string, string]> {
  const en = LOCATIONS[slug]
  const es = LOCATIONS_ES[slug]
  const out: Array<[string, string, string]> = []
  const add = (label: string, a: string | undefined, b: string | undefined) => {
    if (a === undefined) return
    out.push([`${slug}.${label}`, a, b ?? ''])
  }
  const scalar = [
    'county',
    'metaTitle',
    'metaDescription',
    'heroHeadline',
    'heroCopy',
    'areaContext',
    'whyLocal',
    'heroImageAlt',
    'heroSubhead',
    'distanceFromTemple',
    'localIntro',
    'heroEyebrow',
    'introEyebrow',
    'introHeading',
    'areaNote',
    'landHeading',
    'whyHeading',
  ] as const satisfies readonly (keyof LocationData)[]
  for (const k of scalar) add(k, en[k], es[k])
  add('customHeadline.line1', en.customHeadline?.line1, es.customHeadline?.line1)
  add('customHeadline.line2', en.customHeadline?.line2, es.customHeadline?.line2)
  en.services.forEach((v, i) => add(`services[${i}]`, v, es.services[i]))
  en.neighborhoods?.forEach((v, i) => add(`neighborhoods[${i}]`, v, es.neighborhoods?.[i]))
  en.whyLocalBullets?.forEach((v, i) => add(`whyLocalBullets[${i}]`, v, es.whyLocalBullets?.[i]))
  add('military.headline', en.military?.headline, es.military?.headline)
  add('military.copy', en.military?.copy, es.military?.copy)
  en.military?.keywords.forEach((v, i) => add(`military.keywords[${i}]`, v, es.military?.keywords[i]))
  en.landmarks?.forEach((l, i) => {
    add(`landmarks[${i}].name`, l.name, es.landmarks?.[i]?.name)
    add(`landmarks[${i}].blurb`, l.blurb, es.landmarks?.[i]?.blurb)
    add(`landmarks[${i}].imageAlt`, l.imageAlt, es.landmarks?.[i]?.imageAlt)
  })
  en.callouts?.forEach((c, i) => {
    add(`callouts[${i}].eyebrow`, c.eyebrow, es.callouts?.[i]?.eyebrow)
    add(`callouts[${i}].headline`, c.headline, es.callouts?.[i]?.headline)
    add(`callouts[${i}].blurb`, c.blurb, es.callouts?.[i]?.blurb)
    add(`callouts[${i}].ctaLabel`, c.ctaLabel, es.callouts?.[i]?.ctaLabel)
  })
  add('localSource.label', en.localSource?.label, es.localSource?.label)
  en.facts?.forEach((f, i) => {
    add(`facts[${i}].k`, f.k, es.facts?.[i]?.k)
    add(`facts[${i}].v`, f.v, es.facts?.[i]?.v)
    add(`facts[${i}].s`, f.s, es.facts?.[i]?.s)
  })
  en.why?.forEach((w, i) => {
    add(`why[${i}].t`, w.t, es.why?.[i]?.t)
    add(`why[${i}].b`, w.b, es.why?.[i]?.b)
  })
  add('quoteCallout.eyebrow', en.quoteCallout?.eyebrow, es.quoteCallout?.eyebrow)
  add('quoteCallout.headline', en.quoteCallout?.headline, es.quoteCallout?.headline)
  add('quoteCallout.blurb', en.quoteCallout?.blurb, es.quoteCallout?.blurb)
  add('quoteCallout.ctaLabel', en.quoteCallout?.ctaLabel, es.quoteCallout?.ctaLabel)
  return out
}

describe('locations.es', () => {
  it('has Spanish copy for exactly the cities in locations.ts', () => {
    expect(Object.keys(LOCATIONS_ES).sort()).toEqual([...LOCATION_SLUGS].sort())
  })

  it.each(LOCATION_SLUGS)('%s: Spanish mirrors the English shape', (slug) => {
    const en = LOCATIONS[slug]
    const es = LOCATIONS_ES[slug]
    expect(es.services).toHaveLength(en.services.length)
    expect(es.neighborhoods?.length).toBe(en.neighborhoods?.length)
    expect(es.whyLocalBullets?.length).toBe(en.whyLocalBullets?.length)
    expect(es.landmarks?.length).toBe(en.landmarks?.length)
    expect(es.callouts?.length).toBe(en.callouts?.length)
    expect(es.facts?.length).toBe(en.facts?.length)
    expect(es.why?.length).toBe(en.why?.length)
    expect(Boolean(es.military)).toBe(Boolean(en.military))
    expect(es.military?.keywords.length).toBe(en.military?.keywords.length)
    expect(Boolean(es.localSource)).toBe(Boolean(en.localSource))
    expect(Boolean(es.quoteCallout)).toBe(Boolean(en.quoteCallout))
    expect(Boolean(es.customHeadline)).toBe(Boolean(en.customHeadline))
    for (const [label, , spanish] of pairs(slug)) {
      expect(spanish.trim(), `${label} is missing in Spanish`).not.toBe('')
    }
  })

  it.each(LOCATION_SLUGS)('%s: every number is identical in both languages', (slug) => {
    for (const [label, english, spanish] of pairs(slug)) {
      expect(nums(spanish), label).toEqual(nums(english))
    }
  })

  it('carries no names and no retired claims in Spanish', () => {
    const all = JSON.stringify(LOCATIONS_ES)
    expect(all).not.toMatch(/\b(?:Juan|Freddy|Julian|Jos[eé] Alfredo)\b/)
    expect(all).not.toMatch(/48 horas/i)
    expect(all).not.toMatch(/concreto incluido|incluye (?:la )?losa/i)
    expect(all).not.toMatch(/calibre 12/i)
    expect(all).not.toMatch(/\b(?:tramitamos|sacamos|presentamos) (?:el |los |tu |tus )?permisos?\b/i)
    expect(all).not.toMatch(/\b(?:usted|ustedes|vosotros)\b/i)
  })

  describe('getLocation', () => {
    it('returns the English record untouched for en', () => {
      expect(getLocation('temple', 'en')).toBe(LOCATIONS.temple)
    })

    it('is undefined for an unknown slug', () => {
      expect(getLocation('nowhere', 'es')).toBeUndefined()
      expect(getLocation('nowhere', 'en')).toBeUndefined()
    })

    it.each(LOCATION_SLUGS)('%s: keeps the English facts and swaps the copy', (slug) => {
      const en = LOCATIONS[slug]
      const es = getLocation(slug, 'es')!
      expect(es.slug).toBe(en.slug)
      expect(es.name).toBe(en.name)
      expect(es.zip).toBe(en.zip)
      expect(es.lat).toBe(en.lat)
      expect(es.lng).toBe(en.lng)
      expect(es.heroImage).toBe(en.heroImage)
      expect(es.topServices).toEqual(en.topServices)
      expect(es.relatedPosts).toEqual(en.relatedPosts)
      expect(es.galleryCities).toEqual(en.galleryCities)
      expect(es.habla).toBe(en.habla)
      expect(es.landmarks?.map((l) => l.imageSrc)).toEqual(en.landmarks?.map((l) => l.imageSrc))
      expect(es.callouts?.map((c) => c.ctaHref)).toEqual(en.callouts?.map((c) => c.ctaHref))
      expect(es.localSource?.url).toBe(en.localSource?.url)
      expect(es.metaTitle).toBe(LOCATIONS_ES[slug].metaTitle)
      expect(es.metaTitle).not.toBe(en.metaTitle)
    })
  })
})
