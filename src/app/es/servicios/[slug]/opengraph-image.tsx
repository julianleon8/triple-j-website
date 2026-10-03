import { SERVICE_PAGE } from '@/i18n/pages/service'
import { SERVICE_SLUG_ES, englishPath } from '@/i18n/routes'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'
import { getService } from '@/lib/services.es'

/**
 * Per-service OG card, Spanish twin of /services/[slug]/opengraph-image.tsx:
 * same card, the Spanish title, hero qualifier and description.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = SERVICE_PAGE.es.ogAlt

// Prerender one card per service at build time, under the Spanish slugs.
export function generateStaticParams() {
  return Object.values(SERVICE_SLUG_ES).map((slug) => ({ slug }))
}

// `params` is a Promise as of Next 16 — awaiting it is required, not optional.
export default async function ServiceOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const enSlug = englishPath(`/es/servicios/${slug}`)?.slice('/services/'.length)
  const svc = enSlug ? getService(enSlug, 'es') : undefined
  if (!svc) throw new Error(`No Spanish service for slug "${slug}"`)

  // The accent line is the page's own hero qualifier — the text after the em
  // dash — so the card says only what the page it opens says.
  const [, ...qualifier] = svc.heroHeadline.split(/\s+—\s+/)

  return renderOgCard({
    eyebrow: SERVICE_PAGE.es.ogEyebrow,
    headline: svc.title,
    accent: qualifier.length > 0 ? `${qualifier.join(' — ')}.` : undefined,
    subhead: svc.metaDescription,
    path: `/es/servicios/${slug}`,
  })
}
