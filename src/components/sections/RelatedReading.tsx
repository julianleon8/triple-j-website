import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { ArrowRightIcon } from '@/components/ui/icons'
import { BLOG_POSTS, type BlogPost } from '@/lib/blog'

type Props = {
  /** Blog post slugs to feature. Up to 3 will render — extras are ignored. */
  postSlugs: string[]
  /** Optional eyebrow override (default: "Further Reading"). */
  eyebrow?: string
}

/**
 * Inline mid-content callout for cross-linking blog posts to topical service
 * or location pages. Drop into a service or location page in the middle of
 * the scroll — picks up considered-buyer scrollers without breaking the
 * sales flow at the bottom.
 *
 * Renders nothing when no slugs resolve to real posts.
 */
export function RelatedReading({ postSlugs, eyebrow = 'Further Reading' }: Props) {
  const posts = postSlugs
    .map((slug) => BLOG_POSTS.find((p) => p.slug === slug))
    .filter((p): p is BlogPost => Boolean(p))
    .slice(0, 3)

  if (posts.length === 0) return null

  return (
    <section
      aria-label="Further reading"
      className="relative py-12 md:py-14 bg-[color:var(--color-brand-50)] border-y border-[color:var(--color-brand-100)]"
    >
      <Container size="wide">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)]">
            {eyebrow}
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-[color:var(--color-brand-200)]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-[color:var(--color-brand-100)] bg-white p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-brand-700)] mb-2">
                {post.category} · {post.readTime}
              </p>
              <h3 className="text-base font-extrabold text-[color:var(--color-ink-900)] leading-snug group-hover:text-[color:var(--color-brand-700)] transition-colors">
                {post.title}
              </h3>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[color:var(--color-brand-600)] group-hover:gap-2.5 transition-all">
                Read article
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
