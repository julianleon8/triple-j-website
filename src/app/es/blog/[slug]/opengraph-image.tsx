import { BLOG } from '@/i18n/pages/blog'
import { categoryLabel, localizedPost, postBySpanishSlug, SPANISH_POST_SLUGS } from '@/lib/blog.es'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * Per-post OG card, Spanish twin of /blog/[slug]/opengraph-image.tsx: same
 * card, the Spanish title and excerpt, the Spanish post slug in the footer.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = BLOG.es.og.alt

// Prerender one card per post at build time rather than on first crawl.
export function generateStaticParams() {
  return SPANISH_POST_SLUGS.map((slug) => ({ slug }))
}

// `params` is a Promise as of Next 16 — awaiting it is required, not optional.
export default async function BlogOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const english = postBySpanishSlug(slug)

  // The page itself calls notFound() for an unknown slug, but this route is
  // reachable on its own, so fall back to a valid card rather than throwing.
  if (!english) {
    const t = BLOG.es.og
    return renderOgCard({
      eyebrow: t.eyebrow,
      headline: t.headline,
      accent: t.accent,
      path: '/es/blog',
    })
  }

  const post = localizedPost(english, 'es')

  // Titles run long, so split on the colon: the card leads with the subject
  // and drops the qualifier into the accent line (same as the English card).
  const [lead, ...rest] = post.title.split(':')
  // The Spanish qualifier after the colon starts lowercase; as a line of its own it takes a capital.
  const qualifier = rest.join(':').trim()

  return renderOgCard({
    eyebrow: categoryLabel(post.category, 'es'),
    headline: lead.trim(),
    accent: qualifier ? qualifier.charAt(0).toUpperCase() + qualifier.slice(1) : undefined,
    subhead: post.excerpt,
    path: `/es/blog/${slug}`,
  })
}
