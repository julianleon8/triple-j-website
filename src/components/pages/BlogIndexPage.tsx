import Link from 'next/link'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { Eyebrow } from '@/components/forge/Eyebrow'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass, containerClass } from '@/components/forge/styles'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { PreFooterCta } from '@/components/site/PreFooterCta'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import { formatLongDate, type Locale } from '@/i18n/config'
import { BLOG } from '@/i18n/pages/blog'
import { localizeHref } from '@/i18n/routes'
import { BLOG_POSTS, type BlogCategory } from '@/lib/blog'
import { categoryLabel, localizedPost } from '@/lib/blog.es'

// Forge category pills: navy/steel neutrals, olive only on military content.
const CATEGORY_COLORS: Record<BlogCategory, string> = {
  Guides:    'bg-forge-navy text-white',
  Local:     'bg-forge-mist text-forge-navy',
  Military:  'bg-forge-olive text-white',
  HOA:       'border border-forge-silver bg-white text-forge-navy',
  Materials: 'border border-forge-silver bg-forge-fog text-forge-slate',
}

const pillClass = 'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase leading-none tracking-[.14em]'

/** /blog (English) and /es/blog (Spanish). */
export function BlogIndexPage({ locale }: { locale: Locale }) {
  const t = BLOG[locale].index
  const [featured, ...rest] = BLOG_POSTS.map((post) => localizedPost(post, locale))

  return (
    <div data-forge="">
      <BreadcrumbJsonLd items={[{ name: t.hero.current, path: '/blog' }]} locale={locale} />
      {/* ── Hero ── */}
      <PageHero
        variant="plain"
        breadcrumb={<Breadcrumb trail={[]} current={t.hero.current} jsonLd={false} locale={locale} />}
        eyebrow={t.hero.eyebrow}
        h1a={t.hero.h1a}
        lede={t.hero.lede}
        ledeMax="max-w-[640px]"
        contentMax="max-w-[820px]"
        actions={
          <>
            <ForgeButtonLink href={localizeHref('/#quote', locale)} variant="white" size="lg" arrow>
              {t.hero.quote}
            </ForgeButtonLink>
            <TrackedPhoneLink surface="blog_index_hero" className={buttonClass('outlineDark', 'lg')}>
              {t.hero.call}
            </TrackedPhoneLink>
          </>
        }
      />

      {/* ── Featured post ── */}
      <section
        data-forge=""
        data-tone="light"
        className="bg-white pt-[clamp(64px,7vw,104px)] pb-10 text-forge-navy"
      >
        <div className={containerClass}>
          <Eyebrow>{t.featured.eyebrow}</Eyebrow>
          <ForgeReveal className="mt-6">
            <Link
              href={localizeHref(`/blog/${featured.slug}`, locale)}
              className="group block rounded-[12px] border border-forge-silver bg-forge-fog p-[clamp(24px,3vw,40px)] transition-colors duration-200 hover:border-forge-navy"
            >
              <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className={`${pillClass} ${CATEGORY_COLORS[featured.category]}`}>
                  {categoryLabel(featured.category, locale)}
                </span>
                <span className="text-[13px] text-forge-slate">{formatLongDate(featured.date, locale)}</span>
                <span aria-hidden="true" className="text-[13px] text-forge-steel">·</span>
                <span className="text-[13px] text-forge-slate">{featured.readTime}</span>
              </div>
              <h2 className="max-w-[900px] font-forge-display text-[clamp(24px,1.4vw_+_14px,34px)] font-bold leading-[1.2] text-forge-navy [text-wrap:balance]">
                {featured.title}
              </h2>
              <p className="mt-3 max-w-[760px] text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.6] text-forge-slate">
                {featured.excerpt}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 border-b border-forge-silver pb-0.5 text-[15px] font-semibold text-forge-navy transition-colors group-hover:border-forge-navy">
                {t.featured.read}
              </span>
            </Link>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Post grid ── */}
      {rest.length > 0 && (
        <section
          data-forge=""
          data-tone="light"
          aria-label={t.grid.aria}
          className="bg-white pb-[clamp(64px,7vw,104px)] text-forge-navy"
        >
          <div className={containerClass}>
            <ForgeReveal
              stagger
              className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-5 border-t border-forge-mist pt-10"
            >
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={localizeHref(`/blog/${post.slug}`, locale)}
                  className="group flex flex-col rounded-[12px] border border-forge-silver bg-white p-6 transition-colors duration-200 hover:border-forge-navy"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className={`${pillClass} ${CATEGORY_COLORS[post.category]}`}>
                      {categoryLabel(post.category, locale)}
                    </span>
                    <span className="text-[13px] text-forge-slate">{post.readTime}</span>
                  </div>
                  <h2 className="font-forge-display text-[19px] font-bold leading-[1.3] text-forge-navy [text-wrap:balance]">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-[15px] leading-[1.6] text-forge-slate">{post.excerpt}</p>
                </Link>
              ))}
            </ForgeReveal>
          </div>
        </section>
      )}

      {/* ── CTA strip ── */}
      <section
        data-forge=""
        data-tone="light"
        className="border-t border-forge-mist bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy"
      >
        <ForgeReveal className={`${containerClass} flex flex-col items-center text-center`}>
          <SectionHeading
            line1={t.cta.line1}
            size="compact"
            align="center"
            balance
            lede={t.cta.lede}
            ledeMax="max-w-[580px]"
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ForgeButtonLink href={localizeHref('/#quote', locale)} variant="navy" size="lg" arrow>
              {t.cta.quote}
            </ForgeButtonLink>
            <TrackedPhoneLink surface="blog_hero" className={buttonClass('outlineLight', 'lg')}>
              {t.cta.call}
            </TrackedPhoneLink>
          </div>
        </ForgeReveal>
      </section>
      <PreFooterCta locale={locale} />
    </div>
  )
}
