import { PBR_PAGE } from '@/i18n/pages/pbr-vs-pbu'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * /es/servicios/paneles-pbr-vs-pbu OG card — the Spanish twin of
 * /services/pbr-vs-pbu-panels: the page's own H1 and hero copy.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = PBR_PAGE.es.og.alt

export default function PanelGuideOpenGraphImage() {
  const t = PBR_PAGE.es.og
  return renderOgCard({
    eyebrow: t.eyebrow,
    headline: t.headline,
    accent: t.accent,
    subhead: t.subhead,
    path: '/es/servicios/paneles-pbr-vs-pbu',
  })
}
