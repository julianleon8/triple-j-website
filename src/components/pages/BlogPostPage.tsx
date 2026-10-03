import Image from 'next/image'
import Link from 'next/link'
import type { ComponentType } from 'react'

import { Eyebrow } from '@/components/forge/Eyebrow'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { formatLongDate, LANG_TAG, type Locale } from '@/i18n/config'
import { BLOG } from '@/i18n/pages/blog'
import { localizeHref } from '@/i18n/routes'
import { relatedBlogPosts, type BlogPost } from '@/lib/blog'
import { categoryLabel, localizedPost } from '@/lib/blog.es'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

/** The ~760px reading column, centred, with the Forge gutter. */
const readingClass = 'mx-auto w-full max-w-[840px] px-[clamp(20px,3vw,40px)]'

/**
 * /blog/[slug] (English) and /es/blog/[slug] (Spanish).
 *
 * `post` is the post in the page's language (see `localizedPost`); its slug
 * and date are the English post's. `Body` is that language's body component
 * (posts/<slug>.tsx or posts/es/<slug>.tsx).
 */
export function BlogPostPage({ locale, post, Body }: { locale: Locale; post: BlogPost; Body: ComponentType }) {
  const t = BLOG[locale].post
  const baseUrl = getSiteUrl()
  const postUrl = `${baseUrl}${localizeHref(`/blog/${post.slug}`, locale)}`
  const category = categoryLabel(post.category, locale)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${postUrl}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
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
    articleSection: category,
    keywords: post.tags.join(', '),
    inLanguage: LANG_TAG[locale],
  }

  const relatedPosts = relatedBlogPosts(post.slug).map((related) => localizedPost(related, locale))

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
        locale={locale}
      />

      {/* ── Hero ── */}
      <section
        data-forge=""
        data-tone="dark"
        className="bg-forge-navy pt-[clamp(24px,3vw,40px)] pb-[clamp(48px,5vw,72px)] text-white"
      >
        <div className={readingClass}>
          <Link
            href={localizeHref('/blog', locale)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-forge-silver transition-colors hover:text-white"
          >
            {t.back}
          </Link>
          <div className="mt-[clamp(32px,4vw,56px)] flex flex-wrap items-center gap-x-3 gap-y-2">
            <Eyebrow as="span" tone={post.category === 'Military' ? 'militaryDark' : 'dark'}>
              {category}
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
            {t.byline(SITE.name)}{' '}
            <time dateTime={post.date}>{formatLongDate(post.date, locale)}</time>
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
            <Body />
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
                <Link href={localizeHref('/about', locale)} className="underline decoration-forge-silver underline-offset-4 transition-colors hover:decoration-forge-navy">
                  {t.author.name}
                </Link>
              </p>
              <p className="mt-1 text-[14px] leading-[1.6] text-forge-slate">
                {t.author.bio(SITE.established)}
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
              {t.related.heading}
            </h2>
            <div className="mt-6 space-y-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={localizeHref(`/blog/${related.slug}`, locale)}
                  className="group block rounded-[12px] border border-forge-silver bg-forge-fog p-5 transition-colors duration-200 hover:border-forge-navy"
                >
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-forge-slate">
                    {categoryLabel(related.category, locale)} · {related.readTime}
                  </p>
                  <p className="text-[16px] font-semibold leading-[1.4] text-forge-navy">
                    {related.title}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <ForgeButtonLink href={localizeHref('/blog', locale)} variant="outlineLight" size="sm">
                {t.related.back}
              </ForgeButtonLink>
            </div>
          </ForgeReveal>
        </section>
      )}

      {/* ── Quote form ── */}
      <QuoteSection locale={locale} />
    </div>
  )
}
