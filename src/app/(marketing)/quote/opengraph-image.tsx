import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * /quote is the link pasted into Facebook Marketplace posts and texted to
 * customers, so its preview card does more work than most. It takes no params
 * and prerenders at build.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Triple J Metal — free quote on a Central Texas metal building'

export default function QuoteOpenGraphImage() {
  return renderOgCard({
    eyebrow: 'Free Quote',
    headline: 'Tell Us About',
    accent: 'Your Build.',
    subhead:
      'Welded or bolted metal buildings across Central Texas. Same day, guaranteed within 24 hours.',
    path: '/quote',
  })
}
