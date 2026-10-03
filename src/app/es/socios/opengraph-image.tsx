import { PARTNERS } from '@/i18n/pages/partners'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/** /es/socios OG card: the Spanish twin of /partners. */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = PARTNERS.es.og.alt

export default function PartnersOpenGraphImage() {
  const t = PARTNERS.es.og
  return renderOgCard({
    eyebrow: t.eyebrow,
    headline: t.headline,
    subhead: t.subhead,
    path: '/es/socios',
  })
}
