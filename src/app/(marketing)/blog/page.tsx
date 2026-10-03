import { PreFooterCta } from '@/components/site/PreFooterCta'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { Eyebrow } from '@/components/forge/Eyebrow'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass, containerClass } from '@/components/forge/styles'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import { BLOG_POSTS, type BlogCategory } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog | Central Texas Metal Building Guides',
  description:
    'Local guides, permit walkthroughs, and metal building education for Central Texas. Written by the Triple J Metal crew in Temple, TX.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | Triple J Metal',
    description: 'Central Texas metal building guides — permits, welding, HOA, military, and soil.',
    type: 'website',
  },
}

// Forge category pills: navy/steel neutrals, olive only on military content.
const CATEGORY_COLORS: Record<BlogCategory, string> = {
  Guides:    'bg-forge-navy text-white',
  Local:     'bg-forge-mist text-forge-navy',
  Military:  'bg-forge-olive text-white',
  HOA:       'border border-forge-silver bg-white text-forge-navy',
  Materials: 'border border-forge-silver bg-forge-fog text-forge-slate',
}

const pillClass = 'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase leading-none tracking-[.14em]'

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
    <div data-forge="">
      <BreadcrumbJsonLd items={[{ name: 'Blog', path: '/blog' }]} />
      {/* ── Hero ── */}
      <PageHero
        variant="plain"
        breadcrumb={<Breadcrumb trail={[]} current="Blog" jsonLd={false} />}
        eyebrow="Resource Center"
        h1a="Metal Building Guides for Central Texas"
        lede="Permit requirements, soil conditions, HOA rules, and the honest difference between welded and bolted steel — written by the Triple J Metal crew in Temple, TX, not an AI content farm."
        ledeMax="max-w-[640px]"
        contentMax="max-w-[820px]"
        actions={
          <>
            <ForgeButtonLink href="/#quote" variant="white" size="lg" arrow>
              Get a free quote
            </ForgeButtonLink>
            <TrackedPhoneLink surface="blog_index_hero" className={buttonClass('outlineDark', 'lg')}>
              Or call&nbsp;
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
          <Eyebrow>Latest Post</Eyebrow>
          <ForgeReveal className="mt-6">
            <Link
              href={`/blog/${featured.slug}`}
              className="group block rounded-[12px] border border-forge-silver bg-forge-fog p-[clamp(24px,3vw,40px)] transition-colors duration-200 hover:border-forge-navy"
            >
              <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className={`${pillClass} ${CATEGORY_COLORS[featured.category]}`}>
                  {featured.category}
                </span>
                <span className="text-[13px] text-forge-slate">{formatDate(featured.date)}</span>
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
                Read article →
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
          aria-label="More articles"
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
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-[12px] border border-forge-silver bg-white p-6 transition-colors duration-200 hover:border-forge-navy"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className={`${pillClass} ${CATEGORY_COLORS[post.category]}`}>
                      {post.category}
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
            line1="Ready to Build in Central Texas?"
            size="compact"
            align="center"
            balance
            lede={<>Skip the research — call the crew that builds in Temple, TX and know exactly what you&rsquo;re getting.</>}
            ledeMax="max-w-[580px]"
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ForgeButtonLink href="/#quote" variant="navy" size="lg" arrow>
              Get a Free Quote
            </ForgeButtonLink>
            <TrackedPhoneLink surface="blog_hero" className={buttonClass('outlineLight', 'lg')}>
              Call&nbsp;
            </TrackedPhoneLink>
          </div>
        </ForgeReveal>
      </section>
      <PreFooterCta />
    </div>
  )
}
