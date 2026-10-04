import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Eyebrow } from '@/components/forge/Eyebrow'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { BLOG_POSTS, postModified, relatedBlogPosts } from '@/lib/blog'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

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
      authors: ['Triple J Metal'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

/** The ~760px reading column, centred, with the Forge gutter. */
const readingClass = 'mx-auto w-full max-w-[840px] px-[clamp(20px,3vw,40px)]'

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

  const baseUrl = getSiteUrl()
  const postUrl = `${baseUrl}/blog/${post.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${postUrl}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: postModified(post),
    author: { '@id': `${baseUrl}/#organization` },
    publisher: { '@id': `${baseUrl}/#organization` },
    url: postUrl,
    // Stays the static default on purpose. The per-post card added 2026-09-06
    // (./opengraph-image.tsx) is served from a content-hashed URL Next.js
    // generates at build time — `/blog/<slug>/opengraph-image-1m3o9y?<hash>` —
    // which page code cannot reference, and the unhashed path 404s. The card
    // still reaches Google and every social scraper through the og:image meta
    // tag, which is what the preferred-image guidance actually reads.
    image: `${baseUrl}/og-default.jpg`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    articleSection: post.category,
    keywords: post.tags.join(', '),
    inLanguage: 'en-US',
  }

  const relatedPosts = relatedBlogPosts(post.slug)

  return (
    <div data-forge="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />

      {/* ── Hero ── */}
      <section
        data-forge=""
        data-tone="dark"
        className="bg-forge-navy pt-[clamp(24px,3vw,40px)] pb-[clamp(48px,5vw,72px)] text-white"
      >
        <div className={readingClass}>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-forge-silver transition-colors hover:text-white"
          >
            ← All Articles
          </Link>
          <div className="mt-[clamp(32px,4vw,56px)] flex flex-wrap items-center gap-x-3 gap-y-2">
            <Eyebrow as="span" tone={post.category === 'Military' ? 'militaryDark' : 'dark'}>
              {post.category}
            </Eyebrow>
            <span aria-hidden="true" className="text-[13px] text-forge-steel">·</span>
            <span className="text-[13px] text-forge-steel-light">{post.readTime}</span>
          </div>
          <h1 className="mt-[18px] font-forge-display text-[clamp(30px,2.2vw_+_16px,48px)] font-black leading-[1.1] tracking-[.01em] text-white [text-wrap:balance]">
            {post.title}
          </h1>
          {/* Credits the crew, matching BlogPosting.author (the organization) —
              no post records an individual author or reviewer. */}
          <p className="mt-5 text-[14px] text-forge-silver">
            By the {SITE.name} crew · Temple, TX · Published{' '}
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </p>
          <p className="mt-5 text-[clamp(16px,.4vw_+_14px,18px)] leading-[1.6] text-white/86 [text-wrap:pretty]">
            {post.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex h-7 items-center rounded-full border border-white/20 px-3 text-[12px] font-semibold text-forge-silver"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Article body ── */}
      <article
        data-forge=""
        data-tone="light"
        className="bg-white py-[clamp(56px,6vw,96px)] text-forge-navy"
      >
        <div className={readingClass}>
          <div className="forge-prose">
            <PostContent />
          </div>
        </div>
      </article>

      {/* ── Author strip ── */}
      <section
        data-forge=""
        data-tone="light"
        className="border-t border-forge-mist bg-forge-fog py-10 text-forge-navy"
      >
        <div className={readingClass}>
          <div className="flex items-start gap-4">
            <Image
              src="/images/logo-lion.png"
              alt=""
              aria-hidden="true"
              width={48}
              height={48}
              className="size-12 shrink-0 object-contain"
            />
            <div>
              <p className="text-[15px] font-semibold text-forge-navy">
                <Link href="/about" className="underline decoration-forge-silver underline-offset-4 transition-colors hover:decoration-forge-navy">
                  Triple J Metal — Temple, TX
                </Link>
              </p>
              <p className="mt-1 text-[14px] leading-[1.6] text-forge-slate">
                Local metal building contractor serving Central Texas since {SITE.established}. Welded or bolted red iron,
                concrete available, same-week scheduling. This guide was written by our crew from first-hand experience
                in Bell County.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related posts ── */}
      {relatedPosts.length > 0 && (
        <section
          data-forge=""
          data-tone="light"
          aria-labelledby="related-heading"
          className="bg-white py-[clamp(56px,6vw,88px)] text-forge-navy"
        >
          <ForgeReveal className={readingClass}>
            <h2
              id="related-heading"
              className="font-forge-display text-[clamp(24px,1vw_+_16px,30px)] font-bold leading-[1.2] text-forge-navy"
            >
              More Articles
            </h2>
            <div className="mt-6 space-y-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block rounded-[12px] border border-forge-silver bg-forge-fog p-5 transition-colors duration-200 hover:border-forge-navy"
                >
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-forge-slate">
                    {related.category} · {related.readTime}
                  </p>
                  <p className="text-[16px] font-semibold leading-[1.4] text-forge-navy">
                    {related.title}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <ForgeButtonLink href="/blog" variant="outlineLight" size="sm">
                ← Back to all articles
              </ForgeButtonLink>
            </div>
          </ForgeReveal>
        </section>
      )}

      {/* ── Quote form ── */}
      <QuoteSection />
    </div>
  )
}
