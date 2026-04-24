import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import { BLOG_POSTS, type BlogCategory } from '@/lib/blog'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Blog | Central Texas Metal Building Guides',
  description:
    'Local guides, permit walkthroughs, and metal building education for Central Texas. Written by the Triple J Metal crew in Temple, TX.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | Triple J Metal LLC',
    description: 'Central Texas metal building guides — permits, welding, HOA, military, and soil.',
    type: 'website',
  },
}

const CATEGORY_COLORS: Record<BlogCategory, string> = {
  Guides:    'bg-blue-100 text-blue-800',
  Local:     'bg-amber-100 text-amber-800',
  Military:  'bg-green-100 text-green-800',
  HOA:       'bg-purple-100 text-purple-800',
  Materials: 'bg-ink-100 text-ink-600',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-ink-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              Resource Center
            </span>
            <h1 className="mt-3 text-white">Metal Building Guides for Central Texas</h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed max-w-2xl">
              Permit requirements, soil conditions, HOA rules, and the honest difference between
              welded and bolted steel — written by the Triple J Metal crew in Temple, TX, not an
              AI content farm.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Featured post ── */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700 mb-6">
            Latest Post
          </p>
          <Link
            href={`/blog/${featured.slug}`}
            className="group block rounded-2xl border border-ink-100 bg-ink-50 p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${CATEGORY_COLORS[featured.category]}`}>
                {featured.category}
              </span>
              <span className="text-xs text-ink-400">{formatDate(featured.date)}</span>
              <span className="text-xs text-ink-400">·</span>
              <span className="text-xs text-ink-400">{featured.readTime}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-ink-900 group-hover:text-brand-700 transition-colors leading-snug mb-3">
              {featured.title}
            </h2>
            <p className="text-ink-500 leading-relaxed mb-5">{featured.excerpt}</p>
            <span className="text-sm font-semibold text-brand-700 group-hover:gap-2 inline-flex items-center gap-1.5 transition-all">
              Read article →
            </span>
          </Link>
        </Container>
      </section>

      {/* ── Post grid ── */}
      {rest.length > 0 && (
        <section className="py-10 pb-20 bg-white border-t border-ink-100">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl border border-ink-100 bg-ink-50 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category]}`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-ink-400">{post.readTime}</span>
                  </div>
                  <h2 className="text-base font-bold text-ink-900 group-hover:text-brand-700 transition-colors leading-snug mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-ink-500 leading-relaxed line-clamp-3">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── CTA strip ── */}
      <section className="py-14 bg-ink-50 border-t border-ink-100">
        <Container className="text-center">
          <h2 className="mb-3">Ready to Build in Central Texas?</h2>
          <p className="text-ink-500 mb-7 max-w-xl mx-auto">
            Skip the research — call the crew that builds in Temple, TX and know exactly what you&rsquo;re getting.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <ButtonLink href="/#quote" variant="primary" size="lg">
              Get a Free Quote
            </ButtonLink>
            <a
              href={`tel:${SITE.phone}`}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border-2 border-ink-300 text-ink-700 font-semibold hover:border-ink-500 transition-colors text-sm"
            >
              Call {SITE.phone}
            </a>
          </div>
        </Container>
      </section>
    </>
  )
}
