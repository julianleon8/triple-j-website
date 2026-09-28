import {
  BRAND_CARD_ALT,
  BRAND_CARD_CONTENT_TYPE,
  OG_SIZE,
  renderBrandCard,
} from '@/lib/og-card'

/**
 * Homepage OG card — the link people text most.
 *
 * The page sets its own `openGraph` without `images`, and Next replaces a
 * parent segment's `openGraph` wholesale, so until this file existed the
 * homepage shipped no og:image at all: iMessage fell back to the layout's
 * twitter:image, a /og-default.jpg with an empty white circle where the logo
 * belonged. A file here is merged after the page's own metadata, so the
 * override cannot drop it. Prerenders at build; takes no params.
 */

export const size = OG_SIZE
export const contentType = BRAND_CARD_CONTENT_TYPE
export const alt = BRAND_CARD_ALT

export default function HomeOpenGraphImage() {
  return renderBrandCard()
}
