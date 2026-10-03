import { ABOUT } from '@/i18n/pages/about'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'
import { SITE } from '@/lib/site'

/** /es/nosotros OG card: the Spanish twin of /about (src/i18n/pages/about.ts). */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = ABOUT.es.og.alt

export default function AboutOpenGraphImage() {
  const t = ABOUT.es.og
  return renderOgCard({
    eyebrow: t.eyebrow,
    headline: t.headline,
    accent: t.accent,
    subhead: t.subhead(SITE.stats.projects),
    path: '/es/nosotros',
  })
}
