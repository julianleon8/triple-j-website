import { BRAND_CARD_ALT_ES, BRAND_CARD_CONTENT_TYPE, OG_SIZE, renderBrandCard } from '@/lib/og-card'

/** The /es homepage card: the English brand card, in Spanish. Prerenders at build. */

export const size = OG_SIZE
export const contentType = BRAND_CARD_CONTENT_TYPE
export const alt = BRAND_CARD_ALT_ES

export default function SpanishHomeOpenGraphImage() {
  return renderBrandCard('es')
}
