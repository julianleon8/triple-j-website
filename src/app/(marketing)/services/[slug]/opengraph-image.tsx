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

  // The blue line is the page's own hero qualifier — the text after the em
  // dash ("Custom Metal Carports — Welded or Bolted, Same-Week Installs") — so
  // the card says only what the page it opens says. A hero without one gets no
  // accent. Never a blanket "Built Turnkey.": turnkey (site prep + concrete +
  // install, one contract) is one option alongside welded and bolted.
  const [, ...qualifier] = svc.heroHeadline.split(/\s+—\s+/)

  return renderOgCard({
    eyebrow: 'Central Texas',
    headline: svc.title,
    accent: qualifier.length > 0 ? `${qualifier.join(' — ')}.` : undefined,
    subhead: svc.metaDescription,
    path: `/services/${slug}`,
  })
}
