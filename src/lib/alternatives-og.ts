import type { Locale } from '@/i18n/config'
import { ALTERNATIVES } from '@/i18n/pages/alternatives'
import { localizeHref } from '@/i18n/routes'
import { getAlternativesContent } from '@/lib/competitors.es'
import { renderOgCard } from '@/lib/og-card'

/**
 * The /alternatives/[slug] and /es/alternativas/[slug] OG card: each page's
 * own H1 and hero subhead (src/lib/competitors.ts, competitors.es.ts). The two
 * route files (`opengraph-image.tsx`) only pick the language.
 */
export function renderAlternativesOgCard(slug: string, locale: Locale) {
  const t = ALTERNATIVES[locale].og
  const content = getAlternativesContent(slug, locale)

  // The page 404s an unknown slug, but this route is reachable on its own, so
  // fall back to a valid card rather than throwing.
  if (!content) {
    return renderOgCard({
      eyebrow: t.eyebrow,
      headline: t.fallbackHeadline,
      accent: t.fallbackAccent,
      // There is no /alternatives index page to point at.
      path: '',
    })
  }

  return renderOgCard({
    eyebrow: t.eyebrow,
    headline: content.h1,
    subhead: content.heroSubhead,
    path: localizeHref(`/alternatives/${slug}`, locale),
  })
}
