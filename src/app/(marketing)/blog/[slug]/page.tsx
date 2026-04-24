import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { BLOG_POSTS } from '@/lib/blog'
import { SITE } from '@/lib/site'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) return {}
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: ['Triple J Metal LLC'],
      tags: post.tags,
    },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) notFound()

  // Dynamic import of the post content component
  const PostModule = await import(`./posts/${post.slug}`).catch(() => null)
  if (!PostModule) notFound()
  const PostContent = PostModule.default

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: SITE.name,
      url: 'https://triplejmetaltx.com',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: 'https://triplejmetaltx.com',
    },
    url: `https://triplejmetaltx.com/blog/${post.slug}`,
    keywords: post.tags.join(', '),
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* ── Hero ── */}
      <section className="relative bg-ink-900 text-white py-16 md:py-24 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container size="narrow" className="relative">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 mb-6 transition-colors"
          >
            ← All Articles
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
              {post.category}
            </span>
            <span className="text-white/40 text-xs">·</span>
            <span className="text-xs text-white/50">{formatDate(post.date)}</span>
            <span className="text-white/40 text-xs">·</span>
            <span className="text-xs text-white/50">{post.readTime}</span>
          </div>
          <h1 className="text-white leading-tight">{post.title}</h1>
          <p className="mt-5 text-lg text-white/70 leading-relaxed">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-white/60 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Article body ── */}
      <article className="py-14 md:py-20 bg-white">
        <Container size="narrow">
          <div className="prose prose-lg max-w-none prose-headings:font-extrabold prose-headings:text-ink-900 prose-p:text-ink-600 prose-p:leading-relaxed prose-a:text-brand-700 prose-strong:text-ink-900 prose-li:text-ink-600">
            <PostContent />
          </div>
        </Container>
      </article>

      {/* ── Author strip ── */}
      <section className="py-10 bg-ink-50 border-t border-ink-100">
        <Container size="narrow">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
              <span className="text-white font-extrabold text-sm">JJJ</span>
            </div>
            <div>
              <p className="font-bold text-ink-900 text-sm">Triple J Metal LLC — Temple, TX</p>
              <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">
                Local metal building contractor serving Central Texas since {SITE.established}. Welded red iron structures,
                turnkey concrete, same-week scheduling. This guide was written by our crew from first-hand experience
                in Bell County.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Related posts ── */}
      {relatedPosts.length > 0 && (
        <section className="py-14 bg-white border-t border-ink-100">
          <Container size="narrow">
            <h2 className="text-lg font-extrabold text-ink-900 mb-6">More Articles</h2>
            <div className="space-y-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block rounded-xl border border-ink-100 bg-ink-50 p-5 hover:shadow-sm hover:-translate-y-0.5 transition-all"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-1">
                    {related.category} · {related.readTime}
                  </p>
                  <p className="text-sm font-bold text-ink-900 group-hover:text-brand-700 transition-colors leading-snug">
                    {related.title}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <ButtonLink href="/blog" variant="secondary" size="sm">
                ← Back to all articles
              </ButtonLink>
            </div>
          </Container>
        </section>
      )}

      {/* ── Quote form ── */}
      <QuoteForm />
    </>
  )
}
