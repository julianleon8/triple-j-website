import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { LOCATIONS, LOCATION_SLUGS } from '@/lib/locations'
import { SITE } from '@/lib/site'

export async function generateStaticParams() {
  return LOCATION_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: PageProps<'/locations/[slug]'>
): Promise<Metadata> {
  const { slug } = await params
  const loc = LOCATIONS[slug]
  if (!loc) return {}
  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
    keywords: [
      `carport builders ${loc.name} tx`,
      `metal carports ${loc.name} texas`,
      `turnkey carports ${loc.name}`,
      `carports with concrete ${loc.name} tx`,
      `welded carport ${loc.name} tx`,
      ...(loc.military?.keywords ?? []),
    ],
    openGraph: { title: loc.metaTitle, description: loc.metaDescription, type: 'website' },
    alternates: { canonical: `/locations/${slug}` },
  }
}

export default async function LocationPage(
  { params }: PageProps<'/locations/[slug]'>
) {
  const { slug } = await params
  const loc = LOCATIONS[slug]
  if (!loc) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${SITE.name} — ${loc.name} TX`,
    description: loc.metaDescription,
    telephone: SITE.phone,
    url: `https://www.triplejmetaltx.com/locations/${slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.zip,
      addressCountry: 'US',
    },
    geo: { '@type': 'GeoCoordinates', latitude: loc.lat, longitude: loc.lng },
    areaServed: { '@type': 'City', name: loc.name, containedIn: { '@type': 'State', name: 'Texas' } },
    openingHours: 'Mo-Sa 08:00-18:00',
    priceRange: '$$',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Service Areas', path: '/locations' },
          { name: loc.name, path: `/locations/${slug}` },
        ]}
      />

      {/* ── Hero ── */}
      <section className="relative bg-ink-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              {loc.county}
            </span>
            <h1 className="mt-3 text-white">{loc.heroHeadline}</h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed max-w-2xl">
              {loc.heroCopy}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#quote" variant="primary" size="lg">
                Get a Free Quote
              </ButtonLink>
              <a
                href={`tel:${SITE.phone}`}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border-2 border-white/30 text-white font-semibold hover:border-white/60 transition-colors text-sm"
              >
                Call {SITE.phone}
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Trust strip ── */}
      <section className="bg-(--color-brand-600) text-white py-5">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { stat: 'Zero',       label: 'Subcontractors — Ever' },
              { stat: 'Same-Week', label: 'On-Site After Approval' },
              { stat: '1',         label: 'Contract for Everything' },
              { stat: 'Temple TX', label: 'Local Family Business' },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div className="text-xl font-extrabold">{stat}</div>
                <div className="text-xs text-white/75 mt-0.5 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Services ── */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <h2 className="mb-10">Metal Building Services in {loc.name}, TX</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loc.services.map((service) => (
              <div
                key={service}
                className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 px-5 py-4"
              >
                <span className="w-2 h-2 rounded-full bg-(--color-brand-600) shrink-0" />
                <span className="text-sm font-medium text-ink-800">{service}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-3 flex-wrap">
            <ButtonLink href="/services" variant="secondary" size="sm">
              View all services →
            </ButtonLink>
            <ButtonLink href="/services/turnkey-carports-with-concrete" variant="secondary" size="sm">
              Turnkey + Concrete →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ── Why Triple J local ── */}
      <section className="py-16 md:py-20 bg-ink-50">
        <Container size="narrow">
          <h2 className="mb-6">Why Triple J Metal in {loc.name}?</h2>
          <p className="text-ink-600 text-lg leading-relaxed mb-8">
            {loc.whyLocal}
          </p>
          <ul className="space-y-3">
            {[
              'Temple-based family business — 150+ completed projects',
              'Welded AND bolted red iron steel — your choice',
              'Concrete pad pouring included in the same contract',
              'Same-week installs — no 4–16 week wait lists',
              'Licensed and insured',
              'Steel from MetalMax (Waco) — 100% Texas supplier',
              '4,000 PSI concrete for Bell County expansive clay soils',
            ].map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-ink-700">
                <span className="text-(--color-brand-600) mt-0.5 font-bold shrink-0">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Area context ── */}
      <section className="py-16 bg-white">
        <Container size="narrow">
          <h2 className="mb-6">Serving {loc.name} and {loc.county}</h2>
          <p className="text-ink-600 text-lg leading-relaxed">
            {loc.areaContext}
          </p>
        </Container>
      </section>

      {/* ── Military section (Killeen + Harker Heights only) ── */}
      {loc.military && (
        <section className="py-16 bg-ink-900 text-white">
          <Container size="narrow">
            <div className="flex items-start gap-5">
              <span className="text-4xl shrink-0">⭐</span>
              <div>
                <h2 className="text-white mb-4">{loc.military.headline}</h2>
                <p className="text-white/75 text-lg leading-relaxed">
                  {loc.military.copy}
                </p>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── Competitor comparison ── */}
      <section className="py-16 bg-ink-50">
        <Container size="narrow">
          <h2 className="mb-8">The Local Advantage</h2>
          <div className="rounded-xl border border-ink-200 overflow-hidden">
            <div className="grid grid-cols-2 bg-ink-900 text-white text-sm font-bold uppercase tracking-wide">
              <div className="px-5 py-3">National Dealers</div>
              <div className="px-5 py-3 text-brand-400">Triple J Metal</div>
            </div>
            {[
              ['Ship a kit, you handle installation', 'Full crew install — we do everything'],
              ["4–16 week lead times", 'Most installs within the week'],
              ["No concrete — \"customer's responsibility\"", 'Concrete pad poured in the same contract'],
              ['No local phone, no local crew', `Temple-based — 15–30 min from ${loc.name}`],
              ['One-size catalog structures', 'Custom dimensions, any configuration'],
            ].map(([them, us], i) => (
              <div
                key={i}
                className={`grid grid-cols-2 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-ink-50'}`}
              >
                <div className="px-5 py-4 text-ink-500 border-r border-ink-100">
                  ✗ {them}
                </div>
                <div className="px-5 py-4 font-medium text-ink-800">
                  <span className="text-(--color-brand-600)">✓</span> {us}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Quote form ── */}
      <QuoteForm />
    </>
  )
}
