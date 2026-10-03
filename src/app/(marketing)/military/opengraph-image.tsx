import { MILITARY } from '@/i18n/pages/military'
import { renderMilitaryOgCard } from '@/lib/military-og'
import { OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og-card'

/**
 * Per-page Open Graph + Twitter card image for /military.
 *
 * Next.js's file-based OG image API: any `opengraph-image.tsx` (or
 * `twitter-image.tsx`) inside a route segment becomes that page's
 * og:image / twitter:image. Generated as a 1200×630 PNG at request time
 * + cached. The card itself is src/lib/military-og.tsx (olive and tan, the
 * military hero scrim), shared with /es/militares.
 *
 * Falls back to /og-default.jpg sitewide if this route fails to render.
 */

// Default Node serverless runtime. Edge would be cheaper per-request
// but the ImageResponse bundle (@vercel/og + satori + resvg WASM)
// exceeds Vercel's 1 MB Edge Function size limit. Node serverless has
// a 50 MB function limit and OG images are cached aggressively by
// crawlers + the CDN, so cold-start cost is paid at most once per
// invalidation.
export const alt = MILITARY.en.og.alt
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function MilitaryOpenGraphImage() {
  return renderMilitaryOgCard('en')
}
