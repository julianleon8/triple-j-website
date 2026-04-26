import type { Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { LOCATIONS, LOCATION_SLUGS } from '@/lib/locations'

export const metadata: Metadata = {
  title: 'Metal Building Service Areas in Central Texas',
  description:
    'Triple J Metal serves 14 cities and 8 counties across Central Texas — Bell, McLennan, Coryell, Williamson, Lampasas, Falls, Milam, and Burnet. Welded or bolted carports, garages, RV covers, and barns. Same-week installs.',
  alternates: { canonical: '/locations' },
  openGraph: {
    title: 'Service Areas | Triple J Metal',
    description: 'Metal building installation across 8 Central Texas counties. Temple-based crew.',
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
 * how-far-we-travel → QuoteForm.
 */
export default function LocationsPage() {
  // Split LOCATIONS into city slugs (no '-county' suffix) and county slugs.
  const citySlugs = LOCATION_SLUGS.filter((s) => !s.endsWith('-county'))
  const countySlugs = LOCATION_SLUGS.filter((s) => s.endsWith('-county'))

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* ── Hero ── */}
      <section className="relative bg-ink-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              Where We Build
            </span>
            <h1 className="mt-3 text-white">Metal Building Installation Across Central Texas</h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed max-w-2xl">
              Triple J Metal is based in Temple, TX. We build welded or bolted carports, garages,
              barns, and RV covers across the entire Killeen–Temple–Belton corridor and surrounding
              counties. If you&rsquo;re within 90 minutes of Temple, we come to you.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#quote" variant="primary" size="lg">
                Get a Free Quote
              </ButtonLink>
              <TrackedPhoneLink
                surface="locations_index_hero"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border-2 border-white/30 text-white font-semibold hover:border-white/60 transition-colors text-sm"
              >
                Call&nbsp;
              </TrackedPhoneLink>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-(--color-brand-600) text-white py-5">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { stat: String(citySlugs.length), label: 'Cities Served' },
              { stat: String(countySlugs.length), label: 'Counties Covered' },
              { stat: 'Same-Week', label: 'On-Site After Approval' },
              { stat: 'Zero', label: 'Subcontractors — Ever' },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div className="text-xl font-extrabold">{stat}</div>
                <div className="text-xs text-white/75 mt-0.5 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Cities grid ── */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <h2 className="mb-4">Cities We Serve</h2>
          <p className="text-ink-500 text-lg mb-10 max-w-2xl">
            Click any city to see a dedicated page with local service details, pricing context,
            and area-specific information for your project.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {citySlugs.map((slug) => {
              const loc = LOCATIONS[slug]
              const isHomeBase = slug === 'temple'
              return (
                <Link
                  key={slug}
                  href={`/locations/${slug}`}
                  className={`group flex flex-col rounded-xl border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all ${
                    isHomeBase
                      ? 'border-(--color-brand-300) bg-brand-50 hover:border-(--color-brand-500)'
                      : 'border-ink-100 bg-ink-50 hover:border-(--color-brand-300) hover:bg-brand-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <svg
                      className="w-4 h-4 text-(--color-brand-600) shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {isHomeBase && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-brand-600) bg-(--color-brand-100) px-2 py-0.5 rounded-full">
                        Home Base
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-ink-900 text-base leading-tight">
                    {loc.name}, TX
                  </div>
                  <div className="text-xs text-ink-400 mt-0.5">{loc.county}</div>
                  <div className="text-xs text-ink-500 mt-2 font-medium line-clamp-2">
                    {loc.distanceFromTemple ?? loc.heroHeadline}
                  </div>
                  <div className="mt-4 text-xs font-semibold text-(--color-brand-600) group-hover:underline">
                    View details →
                  </div>
                </Link>
              )
            })}
          </div>
        </Container>
      </section>

      {/* ── Counties grid ── */}
      <section className="py-16 md:py-24 bg-ink-50 border-y border-ink-100">
        <Container>
          <h2 className="mb-4">Counties We Serve</h2>
          <p className="text-ink-500 text-lg mb-10 max-w-2xl">
            County-wide pages with the local context for every property in the county — including
            cities, towns, and rural ag properties not listed individually above.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {countySlugs.map((slug) => {
              const loc = LOCATIONS[slug]
              return (
                <Link
                  key={slug}
                  href={`/locations/${slug}`}
                  className="group flex flex-col rounded-xl border border-ink-100 bg-white p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-(--color-brand-300) hover:bg-brand-50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <svg
                      className="w-4 h-4 text-(--color-brand-600) shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="font-bold text-ink-900 text-base leading-tight">{loc.name}</div>
                  <div className="text-xs text-ink-500 mt-2 font-medium line-clamp-3">
                    {loc.heroHeadline}
                  </div>
                  <div className="mt-4 text-xs font-semibold text-(--color-brand-600) group-hover:underline">
                    View county page →
                  </div>
                </Link>
              )
            })}
          </div>
        </Container>
      </section>

      {/* ── How far we travel ── */}
      <section className="py-16 md:py-20 bg-white">
        <Container size="narrow">
          <h2 className="mb-6">How Far Do We Travel?</h2>
          <p className="text-ink-600 text-lg leading-relaxed mb-6">
            Our Temple-based crew regularly builds within a 90-minute radius. That covers most of
            Bell, Coryell, McLennan, Lampasas, and Williamson counties. For larger commercial jobs
            or unique projects, we&rsquo;ll travel further — just call and ask.
          </p>
          <p className="text-ink-600 text-lg leading-relaxed">
            Not sure if you&rsquo;re in our range? Call <TrackedPhoneNumber /> — we&rsquo;ll tell you
            immediately. We don&rsquo;t charge a travel fee for most residential projects within the
            service area.
          </p>
          <div className="mt-8">
            <TrackedPhoneLink
              surface="locations_index_inline"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-ink-900 text-white font-semibold hover:bg-ink-800 transition-colors text-sm"
            >
              Call to confirm your area —&nbsp;
            </TrackedPhoneLink>
          </div>
        </Container>
      </section>

      {/* ── Quote form ── */}
      <QuoteForm />
    </>
  )
}
