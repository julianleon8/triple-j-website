import { BLOG } from '@/i18n/pages/blog'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/** /es/blog OG card: the Spanish twin of /blog (src/i18n/pages/blog.ts). */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = BLOG.es.og.alt

export default function BlogIndexOpenGraphImage() {
  const t = BLOG.es.og
  return renderOgCard({
    eyebrow: t.eyebrow,
    headline: t.headline,
    accent: t.accent,
    subhead: t.subhead,
    path: '/es/blog',
  })
}
