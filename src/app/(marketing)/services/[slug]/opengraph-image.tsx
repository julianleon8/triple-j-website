import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'
import { SERVICES, SERVICE_SLUGS } from '@/lib/services'

/**
 * Per-service OG card. Replaces the shared /og-default.jpg that every service
 * page inherited — see the note in src/lib/og-card.tsx.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Triple J Metal — metal buildings in Central Texas'

// Prerender one card per service at build time rather than on first crawl.
export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }))
}

// `params` is a Promise as of Next 16 — awaiting it is required, not optional.
export default async function ServiceOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const svc = SERVICES[slug]

  return renderOgCard({
    eyebrow: 'Central Texas',
    headline: svc.title,
    accent: 'Built Turnkey.',
    subhead: svc.metaDescription,
    path: `/services/${slug}`,
  })
}
