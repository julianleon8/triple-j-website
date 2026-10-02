import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { numeral } from '@/components/forge/cards'
import { buttonClass } from '@/components/forge/styles'
import { ComparisonTable } from '@/components/sections/ComparisonTable'
import { AuthorByline } from '@/components/sections/AuthorByline'
import { RelatedComparisons } from '@/components/sections/RelatedComparisons'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import {
  COMPETITORS,
  LOCAL_ROUNDUP_COMPARISON_ROWS,
  LOCAL_ROUNDUP_SLUGS,
} from '@/lib/competitors'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Best Metal Carport Builders, Temple TX 2026',
  description:
    'Honest roundup of Bell County metal carport builders: Triple J Metal, Rough Country, L&E Metal, Texas Custom Carports, A+ Sheds and Premier Portables.',
  alternates: { canonical: '/best-metal-carport-builders-temple-tx' },
  openGraph: {
    title: 'Best Metal Carport Builders in Temple, TX (2026)',
    description: 'Honest comparison of Bell County metal building contractors.',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Metal Carport Builders in Temple, TX (2026)',
    description: 'Honest comparison of Bell County metal building contractors.',
  },
}

export default function BestBuildersRoundupPage() {
  const baseUrl = getSiteUrl()
  const pageUrl = `${baseUrl}/best-metal-carport-builders-temple-tx`
  const builders = LOCAL_ROUNDUP_SLUGS.map((s) => COMPETITORS[s])

  // Per-page @graph: WebPage + ItemList for the roundup. Triple J at
  // position 1, the 5 local competitors at 2-6 with their public URLs
  // cited. Honest ordering — we put ourselves first because it's our site,
  // not because we're claiming to be objectively #1.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: 'Best Metal Carport Builders in Temple, TX (2026 Roundup)',
        description:
          'Honest comparison of metal carport builders in Bell County, Texas. Includes Triple J Metal and five local competitors sourced from Yelp.',
        isPartOf: { '@id': `${baseUrl}/#website` },
        about: { '@id': `${baseUrl}/#localbusiness` },
        inLanguage: 'en-US',
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#roundup`,
        name: 'Bell County Metal Carport Builders',
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: builders.length,
        itemListElement: builders.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'LocalBusiness',
            name: c.name,
            description: c.oneLiner,
            url: c.homeUrl,
            address: {
              '@type': 'PostalAddress',
              addressRegion: 'TX',
              addressCountry: 'US',
            },
          },
        })),
      },
    ],
  }

  return (
    <div data-forge="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Best Builders', path: '/best-metal-carport-builders-temple-tx' },
        ]}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <PageHero
        variant="plain"
        breadcrumb={<Breadcrumb trail={[]} current="Best builders" jsonLd={false} />}
        contentMax="w-full max-w-[920px]"
        eyebrow="Local Roundup · 2026"
        h1a="Best metal carport builders in Temple, TX (2026 roundup)"
        lede={
          <>
            An honest comparison of Bell County metal building contractors. We&rsquo;re Triple J
            Metal — yes, we&rsquo;re on this list. We also list the five other local builders
            we know about so you can compare. No paid placements, no sponsored slots.
          </>
        }
        ledeMax="max-w-[680px]"
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              Get a Free Quote from Triple J
            </ForgeButtonLink>
            <TrackedPhoneLink
              surface="best_builders_roundup_hero"
              className={buttonClass('outlineDark', 'lg')}
            >
              Call&nbsp;
            </TrackedPhoneLink>
          </>
        }
        after={<AuthorByline asOf={COMPETITORS['triple-j-metal'].asOf} />}
      />

      {/* ── Disclosure ──────────────────────────────────────────────── */}
      <section
        data-forge=""
        data-tone="light"
        className="border-b border-forge-mist bg-forge-fog py-[clamp(36px,4vw,56px)] text-forge-navy"
      >
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <p className="m-0 max-w-[820px] border-l-2 border-forge-navy pl-[clamp(18px,2vw,28px)] text-[15px] leading-[1.65] text-forge-slate [text-wrap:pretty]">
            <strong className="font-semibold text-forge-navy">Disclosure:</strong>{' '}This is Triple J Metal&rsquo;s website.
            Triple J appears first because we publish this list; the order is not an independent ranking. The other listed builders are
            real Bell County companies sourced from Yelp searches as of April 2026. We don&rsquo;t earn
            referrals if you choose a competitor — but we want you to be able to compare us fairly.
          </p>
        </div>
      </section>

      {/* ── Why this list exists ──────────────────────────────────── */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading line1="Why a Bell County builder usually beats a national kit" size="compact" balance />
            <p className="mt-5 text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate [text-wrap:pretty]">
              Metal carport buyers can compare local builders with national providers. Installation may be included in either model. Ask who will do the work, whether concrete is included, and what the written scope covers.
            </p>
            <p className="mt-4 text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate [text-wrap:pretty]">
              For most homeowners, the local-builder path produces a better outcome: someone you can
              actually call back, faster scheduling, and (in most cases) a real concrete pad poured by
              the same company. That&rsquo;s why this roundup focuses on the local Central Texas
              builders we know about — including us.
            </p>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Builder profiles ─────────────────────────────────────────── */}
      <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <SectionHeading line1="Local builders to compare" size="compact" />
          <ol className="mt-9 flex list-none flex-col gap-4 p-0">
            {builders.map((c, i) => {
              const isSelf = c.type === 'self'
              return (
                <li
                  key={c.slug}
                  data-tone={isSelf ? 'dark' : undefined}
                  className={`rounded-[12px] border p-[clamp(20px,2.2vw,28px)] ${
                    isSelf
                      ? 'border-forge-navy bg-forge-navy text-white'
                      : 'border-forge-silver bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-forge-display text-[15px] font-bold ${
                        isSelf
                          ? 'border-white bg-white text-forge-navy'
                          : 'border-forge-silver bg-forge-fog text-forge-navy'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                        <h3
                          className={`m-0 font-forge-display text-[clamp(19px,.4vw_+_16px,22px)] font-bold leading-[1.2] ${
                            isSelf ? 'text-white' : 'text-forge-navy'
                          }`}
                        >
                          {c.name}
                        </h3>
                        {isSelf && (
                          <span className="rounded-full border border-forge-silver/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[.16em] text-forge-silver">
                            That&rsquo;s us
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-2 text-[15px] leading-[1.6] [text-wrap:pretty] ${
                          isSelf ? 'text-white/86' : 'text-forge-slate'
                        }`}
                      >
                        {c.oneLiner}
                      </p>
                      <p className={`mt-3 text-[13px] ${isSelf ? 'text-forge-steel-light' : 'text-forge-slate'}`}>
                        Coverage: {c.coverage} ·{' '}
                        <a
                          href={c.homeUrl}
                          target="_blank"
                          rel="nofollow noopener"
                          className={`border-b font-semibold transition-colors ${
                            isSelf
                              ? 'border-white/40 text-white hover:border-white'
                              : 'border-forge-silver text-forge-navy hover:border-forge-navy'
                          }`}
                        >
                          {isSelf ? 'Our site' : 'Public listing'}
                        </a>
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ── Comparison table ─────────────────────────────────────────── */}
      <ComparisonTable
        competitorSlugs={LOCAL_ROUNDUP_SLUGS}
        rows={LOCAL_ROUNDUP_COMPARISON_ROWS}
        eyebrow="Side-by-side"
        heading="Feature comparison across local builders"
        subheading="Most of the local builder data comes from Yelp listings and public directories — many fields are unknown without the builder's own website. We've shown what we can verify, marked the rest 'unknown,' and welcome corrections from the other builders if anything's wrong."
      />

      {/* ── How to choose ────────────────────────────────────────────── */}
      <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading line1="How to choose between local builders" size="compact" />
            <p className="mt-5 text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate [text-wrap:pretty]">
              Most local Bell County builders deliver real value compared to national kits. The
              differences come down to four questions:
            </p>
            <ul className="mt-7 list-none border-t border-forge-silver p-0 text-[15px] leading-[1.6] text-forge-slate">
              {[
                <>
                  <strong className="font-semibold text-forge-navy">Welded or bolted?</strong> Triple J offers both. Compare the complete design, framing, anchoring, and specifications for your site.
                </>,
                <>
                  <strong className="font-semibold text-forge-navy">Concrete in the same contract?</strong> Some builders pour the slab,
                  others expect you to hire a separate concrete contractor. The single-contract
                  version saves coordination headaches.
                </>,
                <>
                  <strong className="font-semibold text-forge-navy">How fast can they start?</strong> Same-week scheduling is rare. If the
                  builder needs 4–6 weeks, that may be fine for a planned build but bad for a
                  hailstorm-driven RV cover.
                </>,
                <>
                  <strong className="font-semibold text-forge-navy">Will the same crew do site prep, install, and cleanup?</strong> Some
                  local builders sub out portions of the work. The cleanest version is one crew,
                  start to finish.
                </>,
              ].map((item, i) => (
                <li key={i} className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 border-b border-forge-silver py-5">
                  <span aria-hidden="true" className="pt-0.5 font-forge-display text-[15px] font-bold text-forge-steel">
                    {numeral(i)}
                  </span>
                  <span className="[text-wrap:pretty]">{item}</span>
                </li>
              ))}
            </ul>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Why pick Triple J Metal (navy band) ─────────────────────── */}
      <section data-forge="" data-tone="dark" className="bg-forge-navy py-[clamp(64px,7vw,104px)] text-white">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading tone="dark" eyebrow="Why pick us" line1="When Triple J Metal is the right fit" size="compact" />
            <ul className="mt-8 flex list-none flex-col gap-3.5 p-0 text-[16px] leading-[1.6] text-white/86">
              <li className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-px shrink-0 font-bold text-forge-steel-light">✓</span>
                You want to discuss welded and bolted options with the crew that will install the structure.
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-px shrink-0 font-bold text-forge-steel-light">✓</span>
                You want the concrete pad, engineered for Bell County clay, poured in the same
                contract as the structure install.
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-px shrink-0 font-bold text-forge-steel-light">✓</span>
                You need it built same-week. We schedule within days of contract signing.
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-px shrink-0 font-bold text-forge-steel-light">✓</span>
                You speak Spanish or want to. Hablamos español con Juan y Freddy.
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-px shrink-0 font-bold text-forge-steel-light">✓</span>
                You want a local Texas phone number ({SITE.phone}) that goes to the actual
                family running the company.
              </li>
            </ul>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow className="mt-9 max-w-full whitespace-normal! text-center">
              Get a Free Quote from {SITE.name}
            </ForgeButtonLink>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Related comparisons cluster ──────────────────────────────── */}
      <RelatedComparisons currentSlug="roundup" />

      {/* ── Quote form ───────────────────────────────────────────────── */}
      <QuoteSection />
    </div>
  )
}
