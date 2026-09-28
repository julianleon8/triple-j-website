import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * /blog index OG card — the same lines as the fallback card in
 * ./[slug]/opengraph-image.tsx, with the page's share description. Posts keep
 * their own cards; this one covers the index, which shared no og:image before.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Triple J Metal — metal building guides for Central Texas'

export default function BlogIndexOpenGraphImage() {
  return renderOgCard({
    eyebrow: 'Blog',
    headline: 'Metal Building Guides',
    accent: 'For Central Texas.',
    subhead: 'Central Texas metal building guides — permits, welding, HOA, military, and soil.',
    path: '/blog',
  })
}
