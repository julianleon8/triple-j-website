import { LOCATIONS, LOCATION_SLUGS } from '@/lib/locations'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * Per-city OG card. Replaces the shared /og-default.jpg that all 14 city pages
 * inherited — see the note in src/lib/og-card.tsx.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Triple J Metal — metal carports and buildings in Central Texas'

// Prerender one card per city at build time rather than on first crawl.
export function generateStaticParams() {
  return LOCATION_SLUGS.map((slug) => ({ slug }))
}

// `params` is a Promise as of Next 16 — awaiting it is required, not optional.
export default async function LocationOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const loc = LOCATIONS[slug]

  return renderOgCard({
    eyebrow: loc.county,
    headline: 'Metal Buildings in',
    accent: `${loc.name}, TX.`,
    subhead: loc.metaDescription,
    path: `/locations/${slug}`,
  })
}
