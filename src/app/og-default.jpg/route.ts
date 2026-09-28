import { renderBrandCard } from '@/lib/og-card'

/**
 * /og-default.jpg — the fallback share image. The root layout names it as the
 * og:image and twitter:image for every page without a card of its own,
 * OrganizationJsonLd as the business image, and BlogPosting as the post image.
 *
 * It used to be a hand-made file in public/ with an empty white circle where
 * the logo belonged. Rendering it from the homepage card's code means the two
 * cannot drift apart again. Generated once at build, then served statically.
 */

export const dynamic = 'force-static'

export function GET() {
  return renderBrandCard()
}
