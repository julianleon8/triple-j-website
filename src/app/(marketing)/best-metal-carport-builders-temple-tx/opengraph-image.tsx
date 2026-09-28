import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * Roundup OG card — the page's own H1 and share description. The page sets
 * both `openGraph` and `twitter` without images, so it shared no image at all.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Best metal carport builders in Temple, TX — 2026 roundup'

export default function RoundupOpenGraphImage() {
  return renderOgCard({
    eyebrow: '2026 Roundup',
    headline: 'Best Metal Carport Builders',
    accent: 'in Temple, TX.',
    subhead: 'Honest comparison of Bell County metal building contractors.',
    path: '/best-metal-carport-builders-temple-tx',
  })
}
