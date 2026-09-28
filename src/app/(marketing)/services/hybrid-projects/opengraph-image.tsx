import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * /services/hybrid-projects OG card — the page's own H1 and share
 * description. The page is force-dynamic; this image route prerenders.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Triple J Metal — custom hybrid metal builds in Central Texas'

export default function HybridProjectsOpenGraphImage() {
  return renderOgCard({
    eyebrow: 'Custom Builds',
    headline: 'Hybrid Projects',
    accent: 'Beyond the Standard Catalog.',
    subhead:
      'Custom horse stalls, warehouses, decks, and one-off metal builds across Central Texas. Welded + bolted, on-site, no kits.',
    path: '/services/hybrid-projects',
  })
}
