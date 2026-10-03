import { BLOG } from '@/i18n/pages/blog'
import { BLOG_POSTS } from '@/lib/blog'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * Per-post OG card. The posts have no hero imagery of their own, so every one
 * of them was falling back to the shared /og-default.jpg — including in the
 * BlogPosting `image` property. See src/lib/og-card.tsx.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = BLOG.en.og.alt

// Prerender one card per post at build time rather than on first crawl.
export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

// `params` is a Promise as of Next 16 — awaiting it is required, not optional.
export default async function BlogOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  // The page itself calls notFound() for an unknown slug, but this route is
  // reachable on its own, so fall back to a valid card rather than throwing.
  if (!post) {
    const t = BLOG.en.og
    return renderOgCard({
      eyebrow: t.eyebrow,
      headline: t.headline,
      accent: t.accent,
      path: '/blog',
    })
  }

  // Titles here run long ("Bell County Metal Building Permit Guide:
  // Temple, Belton & Killeen Requirements"). Split on the colon so the card
  // leads with the subject and drops the qualifier into the accent line.
  const [lead, ...rest] = post.title.split(':')

  return renderOgCard({
    eyebrow: post.category,
    headline: lead.trim(),
    accent: rest.length > 0 ? rest.join(':').trim() : undefined,
    subhead: post.excerpt,
    path: `/blog/${slug}`,
  })
}
