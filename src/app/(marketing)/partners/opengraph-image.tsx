import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * /partners OG card — the page's own H1 and share description. The page is
 * force-dynamic; this image route is not, and prerenders at build.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Triple J Metal — Central Texas installation partner for suppliers and GCs'

export default function PartnersOpenGraphImage() {
  return renderOgCard({
    eyebrow: 'B2B Partners',
    headline: 'Looking for a Central Texas Installation Partner?',
    subhead:
      'B2B install partnership in Central Texas — welded + bolted, no subs, photo-documented. Suppliers, manufacturers, GCs welcome.',
    path: '/partners',
  })
}
