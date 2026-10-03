import { CITY_PAGE } from '@/i18n/pages/locations'
import { LOCATION_SLUGS } from '@/lib/locations'
import { getLocation } from '@/lib/locations.es'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * Per-city OG card, Spanish twin of /locations/[slug]/opengraph-image.tsx:
 * same card, the Spanish county and description. City slugs are the same in
 * both languages.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = CITY_PAGE.es.og.alt

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
  const loc = getLocation(slug, 'es')
  if (!loc) throw new Error(`No city for slug "${slug}"`)

  return renderOgCard({
    eyebrow: loc.county,
    headline: CITY_PAGE.es.og.headline,
    accent: `${loc.name}, TX.`,
    subhead: loc.metaDescription,
    path: `/es/ciudades/${slug}`,
  })
}
