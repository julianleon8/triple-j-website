import { COLORS_PAGE } from '@/i18n/pages/colors'
import { PANEL_COLORS } from '@/lib/colors'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * /es/servicios/colores OG card — the Spanish twin of /services/colors, with
 * the colour count read from the palette so it cannot drift from the page.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = COLORS_PAGE.es.og.alt

export default function ColorsOpenGraphImage() {
  const t = COLORS_PAGE.es.og
  return renderOgCard({
    eyebrow: t.eyebrow,
    headline: t.headline,
    subhead: t.subhead(PANEL_COLORS.length),
    path: '/es/servicios/colores',
  })
}
