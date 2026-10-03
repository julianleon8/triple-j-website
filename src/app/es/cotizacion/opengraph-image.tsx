import { QUOTE } from '@/i18n/pages/quote'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/** /es/cotizacion OG card: the Spanish twin of /quote, with the same response promise. */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = QUOTE.es.og.alt

export default function QuoteOpenGraphImage() {
  const t = QUOTE.es.og
  return renderOgCard({
    eyebrow: t.eyebrow,
    headline: t.headline,
    accent: t.accent,
    subhead: t.subhead,
    path: '/es/cotizacion',
  })
}
