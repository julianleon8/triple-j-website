import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'
import { SITE } from '@/lib/site'

/**
 * /gallery OG card — the page's own H1 and share description. The page sets
 * its own `openGraph` without `images`, so it shared no og:image before this.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Triple J Metal project gallery — metal buildings across Central Texas'

export default function GalleryOpenGraphImage() {
  return renderOgCard({
    eyebrow: 'Project Gallery',
    headline: 'Built Here.',
    accent: 'Built for You.',
    subhead: `${SITE.stats.projects} completed metal building projects across Central Texas.`,
    path: '/gallery',
  })
}
