/// <reference types="vite/client" />

import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { englishPath, localizeHref, POST_SLUG_ES } from '@/i18n/routes'
import { BLOG_POSTS } from '@/lib/blog'
import { BLOG_POSTS_ES, localizedPost, postBySpanishSlug, SPANISH_POST_SLUGS } from '@/lib/blog.es'

import { POST_BODIES_ES } from './posts/es'

/**
 * The Spanish blog (the /es mirror, 2026-10-03) is held to what guards the
 * English posts, plus: it carries the same numbers, structure and links as
 * its English twin, every link points at a Spanish page, and none of the
 * claims the English locks retire (names, "48 horas", calibre 12, "we file
 * the permit") sneak in through the translation.
 */

type Module = { default: ComponentType }
const english = import.meta.glob<Module>('./posts/*.tsx', { eager: true })
const spanish = import.meta.glob<Module>('./posts/es/*.tsx', { eager: true })

const bodyOf = (modules: Record<string, Module>, slug: string): ComponentType => {
  const found = Object.entries(modules).find(([path]) => path.endsWith(`/${slug}.tsx`))
  if (!found) throw new Error(`no body for ${slug}`)
  return found[1].default
}

const render = (Body: ComponentType) => renderToStaticMarkup(createElement(Body))

const textOf = (markup: string) =>
  markup
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()

/** Every number as written, normalized: "3,000" and "3000" are the same number. */
const numbers = (text: string) =>
  (text.match(/\d[\d,.]*\d|\d/g) ?? []).map((n) => n.replace(/,(?=\d{3}\b)/g, '').replace(/\.$/, '')).sort()

const hrefsOf = (markup: string) => [...markup.matchAll(/href="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'))
const tagsOf = (markup: string) => [...markup.matchAll(/<([a-z][a-z0-9]*)/g)].map((m) => m[1])

describe('Spanish post bodies', () => {
  it('has one Spanish body per English post, registered, and none without an English twin', () => {
    const slugs = BLOG_POSTS.map((p) => p.slug).sort()
    const files = readdirSync(join(process.cwd(), 'src/app/(marketing)/blog/[slug]/posts/es'))
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => f.replace(/\.tsx$/, ''))
      .sort()
    expect(files).toEqual(slugs)
    expect(Object.keys(POST_BODIES_ES).sort()).toEqual(slugs)
  })

  it('gives every post a Spanish URL slug and a Spanish card', () => {
    const slugs = BLOG_POSTS.map((p) => p.slug)
    expect(slugs.every((s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(POST_SLUG_ES[s] ?? ''))).toBe(true)
    expect(new Set(slugs.map((s) => POST_SLUG_ES[s])).size).toBe(slugs.length)
    expect(SPANISH_POST_SLUGS).toEqual(slugs.map((s) => POST_SLUG_ES[s]))
    for (const post of BLOG_POSTS) {
      expect(BLOG_POSTS_ES[post.slug], `${post.slug}: no Spanish card`).toBeDefined()
      expect(postBySpanishSlug(POST_SLUG_ES[post.slug])?.slug).toBe(post.slug)
      expect(localizedPost(post, 'es').title).not.toBe(post.title)
    }
    expect(postBySpanishSlug('not-a-post')).toBeUndefined()
  })

  describe.each(BLOG_POSTS.map((p) => [p.slug] as const))('%s', (slug) => {
    const en = render(bodyOf(english, slug))
    const es = render(bodyOf(spanish, slug))

    it('keeps the English structure: same headings, lists, tables and links in the same order', () => {
      expect(tagsOf(es)).toEqual(tagsOf(en))
    })

    it('carries the same numbers as the English', () => {
      expect(numbers(textOf(es))).toEqual(numbers(textOf(en)))
    })

    it('links only to Spanish pages, and to the same pages the English links to', () => {
      const hrefs = hrefsOf(es)
      const internal = hrefs.filter((h) => h.startsWith('/'))
      const external = hrefs.filter((h) => !h.startsWith('/'))

      // No English internal page: every internal link is a real /es/ page.
      for (const href of internal) {
        expect(href.startsWith('/es/'), `${href} is not a Spanish page`).toBe(true)
        expect(englishPath(href.split(/[?#]/)[0]), `${href} is not a page in routes.ts`).not.toBeNull()
      }

      // Each English link has its Spanish counterpart, and the Spanish adds none.
      const enHrefs = hrefsOf(en)
      expect(internal.sort()).toEqual(enHrefs.filter((h) => h.startsWith('/')).map((h) => localizeHref(h, 'es')).sort())
      expect(external.sort()).toEqual(enHrefs.filter((h) => !h.startsWith('/')).sort())

      // The internal-linking rule (Locked Decisions): a service, a city (or the military page) and the quote.
      expect(internal.some((h) => h.startsWith('/es/servicios/'))).toBe(true)
      expect(internal.some((h) => h.startsWith('/es/ciudades/') || h === '/es/militares')).toBe(true)
      expect(internal).toContain('/es/cotizacion')
    })

    it('keeps the claim locks and the site voice', () => {
      const text = textOf(es)
      const forbidden: [RegExp, string][] = [
        [/\b(Juan|Freddy|Julian|Jos[eé] Alfredo)\b/, 'no names on the site'],
        [/\b48 horas\b/i, 'never a 48-hour build'],
        [/calibre 12\b|12[- ]gauge/i, 'never 12-gauge: heavy-duty is 11-gauge columns'],
        [/\b(tramitamos|sacamos|presentamos|gestionamos)\b/i, 'permits are advisory: we never file or pull one'],
        [/concreto[^.]{0,60}\bincluid[oa]s?\b|\bincluid[oa]s?\b[^.]{0,60}concreto/i, 'concrete is available and priced separately, never included'],
        [/4,000 PSI (?:est[aá]ndar|de serie)|4,000 PSI is the/i, '4,000 PSI is on request; 3,000 PSI is standard'],
        [/\busted(?:es)?\b|\bvosotros\b|\bordenador\b/i, 'tú voice, Mexican/Texas Spanish'],
        [/\b(?:the|your|you|with|from)\b/, 'left in English'],
      ]
      for (const [re, why] of forbidden) {
        expect(text, why).not.toMatch(re)
      }
    })
  })

  it('keeps the permit guide fee figures as of 2025, in Spanish', () => {
    const es = textOf(render(bodyOf(spanish, 'bell-county-metal-building-permit-guide')))
    expect(es).toContain('Vigente en 2025')
    expect(es).not.toMatch(/As of/)
    for (const fee of ['$50–$150', '$150–$350', '$350–$800+']) expect(es).toContain(fee)
  })
})
