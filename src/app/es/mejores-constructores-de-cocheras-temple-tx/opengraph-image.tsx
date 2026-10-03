import { ROUNDUP } from '@/i18n/pages/roundup'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/** /es/mejores-constructores-de-cocheras-temple-tx OG card: the Spanish twin of the roundup (src/i18n/pages/roundup.ts). */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = ROUNDUP.es.og.alt

export default function RoundupOpenGraphImage() {
  const t = ROUNDUP.es.og
  return renderOgCard({
    eyebrow: t.eyebrow,
    headline: t.headline,
    accent: t.accent,
    subhead: t.subhead,
    path: '/es/mejores-constructores-de-cocheras-temple-tx',
  })
}
