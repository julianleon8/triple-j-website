import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'
import { SITE } from '@/lib/site'

/**
 * /about OG card. The page sets its own `openGraph` without `images`, so until
 * this file existed it shared no og:image at all. Text is the page's own H1
 * and share description — see src/lib/og-card.tsx.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Triple J Metal — a Temple, TX family metal building company'

export default function AboutOpenGraphImage() {
  return renderOgCard({
    eyebrow: 'Temple, TX',
    headline: 'Temple’s Local Metal Building Family',
    accent: 'Not a National Chain.',
    subhead: `Local Temple family business. ${SITE.stats.projects} completed metal building projects across Central Texas.`,
    path: '/about',
  })
}
