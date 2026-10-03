import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { Chip } from '@/components/forge/Chip'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass } from '@/components/forge/styles'
import { PinIcon } from '@/components/ui/icons'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { LOCATIONS, LOCATION_SLUGS } from '@/lib/locations'

export const metadata: Metadata = {
  title: 'Metal Building Service Areas, Central TX',
  description:
    `Welded or bolted carports, garages, RV covers and barns in ${LOCATION_SLUGS.length} Central Texas cities, from Waco to Round Rock. Same-week installs from our Temple shop.`,
  alternates: { canonical: '/locations' },
  openGraph: {
    title: 'Service Areas | Triple J Metal',
    description: 'Metal building installation across Central Texas. Temple-based crew.',
    type: 'website',
  },
}

/**
 * /locations — single canonical service-areas hub.
 *
 * Replaces the prior unstyled list view AND absorbs the old /service-areas
 * page (now 301'd here in next.config.ts). Pulls every entry from
 * src/lib/locations.ts so cities and counties stay in sync with their
 * individual /locations/[slug] pages.
 *
 * Page order: hero → stats strip → cities grid → counties grid →
 * how-far-we-travel → QuoteSection. Forge: navy hero + fact strip, then
 * white / fog / white bands into the fog quote band.
 */
export default function LocationsPage() {
  // Split LOCATIONS into city slugs (no '-county' suffix) and county slugs.
  const citySlugs = LOCATION_SLUGS
  // Distinct counties, derived from the cities themselves so this can never
  // drift from LOCATIONS the way a hand-kept county list would.
  const countiesServed = [...new Set(LOCATION_SLUGS.map((s) => LOCATIONS[s].county))].sort()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Triple J Metal Service Areas',
    description:
      'Cities and counties served by Triple J Metal for metal building installation in Central Texas',
    itemListElement: LOCATION_SLUGS.map((slug, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `Metal Buildings ${LOCATIONS[slug].name}, TX`,
      url: `https://www.triplejmetaltx.com/locations/${slug}`,
    })),
  }

  return (
    <div data-forge="">
      <BreadcrumbJsonLd items={[{ name: 'Service Areas', path: '/locations' }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* ── Hero ── */}
      <PageHero
        variant="plain"
        breadcrumb={<Breadcrumb trail={[]} current="Service areas" jsonLd={false} />}
        contentMax="w-full max-w-[860px]"
        eyebrow="Where We Build"
        h1a="Metal building installation across Central Texas"
        lede={
          <>
            Triple J Metal is based in Temple, TX. We build welded or bolted carports, garages,
            barns, and RV covers across the entire Killeen–Temple–Belton corridor and surrounding
            counties. If you&rsquo;re within 90 minutes of Temple, we come to you.
          </>
        }
        ledeMax="max-w-[660px]"
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              Get a Free Quote
            </ForgeButtonLink>
            <TrackedPhoneLink
              surface="locations_index_hero"
              className={buttonClass('outlineDark', 'lg')}
            >
              Call&nbsp;
            </TrackedPhoneLink>
          </>
        }
      />

      {/* ── Stats strip ── (the hero fact-strip look, 2×2 on phones) */}
      <div data-forge="" data-tone="dark" className="border-t border-forge-silver/20 bg-forge-navy text-white">
        <dl className="mx-auto grid w-full max-w-[1360px] grid-cols-2 px-[clamp(20px,3vw,40px)] md:grid-cols-4">
          {[
            { stat: String(citySlugs.length), label: 'Cities Served' },
            { stat: String(countiesServed.length), label: 'Counties Covered' },
            { stat: 'Same-Week', label: 'On-Site After Approval' },
            { stat: 'Zero', label: 'Subcontractors — Ever' },
          ].map(({ stat, label }, i) => (
            <div
              key={label}
              className={`border-l border-forge-silver/[.18] px-[clamp(12px,1.4vw,18px)] pt-[18px] pb-5 ${
                i > 1 ? 'max-md:border-t' : ''
              }`}
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[.2em] text-forge-steel-light">{label}</dt>
              <dd className="m-0 mt-1.5 font-forge-display text-[19px] font-bold leading-[1.2] text-white">{stat}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── Cities grid ── */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading
              line1="Cities we serve"
              lede="Click any city to see a dedicated page with local service details, pricing context, and area-specific information for your project."
              ledeMax="max-w-[640px]"
            />
          </ForgeReveal>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {citySlugs.map((slug) => {
              const loc = LOCATIONS[slug]
              const isHomeBase = slug === 'temple'
              return (
                <Link
                  key={slug}
                  href={`/locations/${slug}`}
                  data-tone={isHomeBase ? 'dark' : undefined}
                  className={`group flex flex-col rounded-[12px] border p-[clamp(16px,1.6vw,22px)] transition-colors duration-200 ${
                    isHomeBase
                      ? 'border-forge-navy bg-forge-navy text-white hover:bg-forge-navy-raised'
                      : 'border-forge-silver bg-forge-fog hover:border-forge-navy hover:bg-white'
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <PinIcon
                      width={16}
                      height={16}
                      aria-hidden="true"
                      className={`mt-0.5 flex-none ${isHomeBase ? 'text-forge-silver' : 'text-forge-slate'}`}
                    />
                    {isHomeBase && (
                      <span className="rounded-full border border-forge-silver/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.14em] text-forge-silver">
                        Home Base
                      </span>
                    )}
                  </div>
                  <div
                    className={`font-forge-display text-[clamp(16px,.4vw_+_13px,19px)] font-bold leading-[1.2] ${
                      isHomeBase ? 'text-white' : 'text-forge-navy'
                    }`}
                  >
                    {loc.name}, TX
                  </div>
                  <div className={`mt-1 text-[12px] ${isHomeBase ? 'text-forge-steel-light' : 'text-forge-slate'}`}>
                    {loc.county}
                  </div>
                  <div
                    className={`mt-2 line-clamp-2 text-[13px] leading-[1.45] ${
                      isHomeBase ? 'text-white/80' : 'text-forge-slate'
                    }`}
                  >
                    {loc.distanceFromTemple ?? loc.heroHeadline}
                  </div>
                  <div
                    className={`mt-auto pt-4 text-[13px] font-semibold ${
                      isHomeBase ? 'text-forge-silver group-hover:text-white' : 'text-forge-navy'
                    }`}
                  >
                    View details{' '}
                    <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Counties served ──
          Was a grid of eight linked county pages. Those pages were 28-36 lines
          of data each with no landmarks, callouts or city-filtered photos, and
          they cannibalised the city pages that sit inside them (/locations/
          lampasas vs /locations/lampasas-county). They 301 to their strongest
          member city as of 2026-09-06 — see next.config.ts. The coverage claim
          is still worth stating, so it is derived from the cities we do have
          rather than from eight thin pages. */}
      <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading
              line1="Counties we serve"
              lede="Our Temple-based crew covers these counties in full — including towns and rural ag properties not listed individually above."
              ledeMax="max-w-[640px]"
            />
          </ForgeReveal>
          <ul className="mt-8 flex list-none flex-wrap gap-2 p-0">
            {countiesServed.map((county) => (
              <li key={county}>
                <Chip>{county}</Chip>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How far we travel ── */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading line1="How far do we travel?" size="compact" />
            <p className="mt-5 text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate [text-wrap:pretty]">
              Our Temple-based crew regularly builds within a 90-minute radius. That covers most of
              Bell, Coryell, McLennan, Lampasas, and Williamson counties. For larger commercial jobs
              or unique projects, we&rsquo;ll travel further — just call and ask.
            </p>
            <p className="mt-4 text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate [text-wrap:pretty]">
              Not sure if you&rsquo;re in our range? Call{' '}
              <TrackedPhoneNumber className="whitespace-nowrap font-semibold text-forge-navy tabular-nums" />{' '}— we&rsquo;ll tell you
              immediately.
            </p>
            <div className="mt-8">
              <TrackedPhoneLink
                surface="locations_index_inline"
                className={buttonClass('navy', 'lg', false, 'max-w-full flex-wrap justify-start')}
              >
                Call to confirm your area —&nbsp;
              </TrackedPhoneLink>
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Quote form ── */}
      <QuoteSection />
    </div>
  )
}
