import { CITIES_HUB } from '@/i18n/pages/locations'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * /es/ciudades hub OG card — the Spanish twin of /locations: the page's own
 * H1 and hero copy.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = CITIES_HUB.es.og.alt

export default function CitiesHubOpenGraphImage() {
  const t = CITIES_HUB.es.og
  return renderOgCard({
    eyebrow: t.eyebrow,
    headline: t.headline,
    accent: t.accent,
    subhead: t.subhead,
    path: '/es/ciudades',
  })
}
