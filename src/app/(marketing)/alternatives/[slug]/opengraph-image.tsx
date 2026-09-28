import { ALTERNATIVES_SLUGS, getAlternativesContent } from '@/lib/competitors'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * Per-comparison OG card — each page's own H1 and hero subhead from
 * src/lib/competitors.ts. The pages set both `openGraph` and `twitter` without
 * images, so they shared no image at all before this.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Triple J Metal — compare metal carport options in Central Texas'

// Prerender one card per comparison at build time rather than on first crawl.
export function generateStaticParams() {
  return ALTERNATIVES_SLUGS.map((slug) => ({ slug }))
}

// `params` is a Promise as of Next 16 — awaiting it is required, not optional.
export default async function AlternativesOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const content = getAlternativesContent(slug)

  // The page 404s an unknown slug, but this route is reachable on its own, so
  // fall back to a valid card rather than throwing.
  if (!content) {
    return renderOgCard({
      eyebrow: 'Compare',
      headline: 'Compare Metal Carport Options',
      accent: 'In Central Texas.',
      // There is no /alternatives index page to point at.
      path: '',
    })
  }

  return renderOgCard({
    eyebrow: 'Compare',
    headline: content.h1,
    subhead: content.heroSubhead,
    path: `/alternatives/${slug}`,
  })
}
