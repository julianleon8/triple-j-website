import { PANEL_COLORS } from '@/lib/colors'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * /services/colors OG card — the page's own H1 and share description, with
 * the colour count read from the palette so it cannot drift from the page.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Triple J Metal — metal panel colors and finishes'

export default function ColorsOpenGraphImage() {
  return renderOgCard({
    eyebrow: 'Panel Colors',
    headline: 'Metal Panel Colors & Finishes',
    subhead: `Choose from ${PANEL_COLORS.length} painted Galvalume® panel colors for your Central Texas metal building. Standard and Premium lines.`,
    path: '/services/colors',
  })
}
