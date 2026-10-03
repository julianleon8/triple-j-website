import { describe, expect, it } from 'vitest'

import { BLOG_POSTS } from '@/lib/blog'
import { SERVICE_SLUGS } from '@/lib/services'

import { localeFromPath } from './config'
import { localeAlternates } from './metadata'
import { POST_SLUG_ES, SERVICE_SLUG_ES, counterpartPath, englishPath, localizeHref, spanishPath } from './routes'

describe('routes', () => {
  it('maps every service and blog post to a Spanish slug, uniquely', () => {
    for (const slug of SERVICE_SLUGS) expect(SERVICE_SLUG_ES[slug], slug).toBeTruthy()
    for (const post of BLOG_POSTS) expect(POST_SLUG_ES[post.slug], post.slug).toBeTruthy()
    expect(Object.keys(SERVICE_SLUG_ES).sort()).toEqual([...SERVICE_SLUGS].sort())
    expect(new Set(Object.values(SERVICE_SLUG_ES)).size).toBe(Object.keys(SERVICE_SLUG_ES).length)
    expect(new Set(Object.values(POST_SLUG_ES)).size).toBe(Object.keys(POST_SLUG_ES).length)
  })

  it('localizes hrefs, keeping query and hash', () => {
    expect(localizeHref('/', 'es')).toBe('/es')
    expect(localizeHref('/services/carports', 'es')).toBe('/es/servicios/cocheras')
    expect(localizeHref('/services/colors', 'es')).toBe('/es/servicios/colores')
    expect(localizeHref('/locations/temple', 'es')).toBe('/es/ciudades/temple')
    expect(localizeHref('/quote?service=lean-to', 'es')).toBe('/es/cotizacion?service=lean-to')
    expect(localizeHref('/#quote', 'es')).toBe('/es#quote')
    expect(localizeHref('/gallery/abc', 'es')).toBe('/es/galeria/abc')
    expect(localizeHref('/services/carports', 'en')).toBe('/services/carports')
  })

  it('leaves English-only, external and unknown hrefs alone', () => {
    expect(localizeHref('/privacy', 'es')).toBe('/privacy')
    expect(localizeHref('/terms', 'es')).toBe('/terms')
    expect(localizeHref('#quote', 'es')).toBe('#quote')
    expect(localizeHref('tel:+12543467764', 'es')).toBe('tel:+12543467764')
    expect(localizeHref('https://example.com/about', 'es')).toBe('https://example.com/about')
    expect(localizeHref('/services/not-a-service', 'es')).toBe('/services/not-a-service')
    expect(localizeHref('/hq', 'es')).toBe('/hq')
  })

  it('round-trips every Spanish path back to its English one', () => {
    const english = [
      '/', '/about', '/quote', '/services', '/locations', '/blog', '/gallery/123',
      ...SERVICE_SLUGS.map((s) => `/services/${s}`),
      ...BLOG_POSTS.map((p) => `/blog/${p.slug}`),
    ]
    for (const en of english) expect(englishPath(spanishPath(en)!), en).toBe(en)
  })

  it('switches language on the same page, falling back to the homepage', () => {
    expect(counterpartPath('/services/carports')).toBe('/es/servicios/cocheras')
    expect(counterpartPath('/es/servicios/cocheras')).toBe('/services/carports')
    expect(counterpartPath('/es')).toBe('/')
    expect(counterpartPath('/privacy')).toBe('/es')
    expect(counterpartPath('/es/no-such-page')).toBe('/')
  })

  it('reads the language from a path', () => {
    expect(localeFromPath('/es')).toBe('es')
    expect(localeFromPath('/es/nosotros')).toBe('es')
    expect(localeFromPath('/estimate')).toBe('en')
    expect(localeFromPath('/')).toBe('en')
  })

  it('pairs hreflang only where a Spanish page exists', () => {
    expect(localeAlternates('/about', 'es')).toEqual({
      canonical: '/es/nosotros',
      languages: { en: '/about', es: '/es/nosotros', 'x-default': '/about' },
    })
    expect(localeAlternates('/privacy', 'en')).toEqual({ canonical: '/privacy' })
  })
})
