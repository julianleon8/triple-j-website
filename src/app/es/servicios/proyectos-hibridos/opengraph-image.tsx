import { HYBRID_PAGE } from '@/i18n/pages/hybrid-projects'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * /es/servicios/proyectos-hibridos OG card — the Spanish twin of
 * /services/hybrid-projects. The page is force-dynamic; this image route prerenders.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = HYBRID_PAGE.es.og.alt

export default function HybridProjectsOpenGraphImage() {
  const t = HYBRID_PAGE.es.og
  return renderOgCard({
    eyebrow: t.eyebrow,
    headline: t.headline,
    accent: t.accent,
    subhead: t.subhead,
    path: '/es/servicios/proyectos-hibridos',
  })
}
