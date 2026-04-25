import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Service Areas — Central Texas',
  description:
    'Triple J Metal serves Bell, McLennan, Coryell, Williamson, Lampasas, Falls, Milam, and Burnet counties. 14 cities, local crew, same-week installs.',
  alternates: { canonical: '/service-areas' },
  openGraph: {
    title: 'Service Areas | Triple J Metal',
    description: 'Metal building installation across 8 Central Texas counties. Temple-based crew.',
    type: 'website',
  },
}

const CITIES = [
  {
    slug: 'temple',
    name: 'Temple',
    county: 'Bell County',
    note: 'Our home base — 150+ builds here',
    highlight: true,
  },
  {
    slug: 'belton',
    name: 'Belton',
    county: 'Bell County',
    note: '10 min from Temple',
    highlight: false,
  },
  {
    slug: 'killeen',
    name: 'Killeen',
    county: 'Bell County',
    note: 'Fort Cavazos military discount',
    highlight: false,
  },
  {
    slug: 'harker-heights',
    name: 'Harker Heights',
    county: 'Bell County',
    note: 'Fort Cavazos military discount',
    highlight: false,
  },
  {
    slug: 'copperas-cove',
    name: 'Copperas Cove',
    county: 'Coryell County',
    note: '30 min from Temple',
    highlight: false,
  },
  {
    slug: 'salado',
    name: 'Salado',
    county: 'Bell County',
    note: '20 min from Temple',
    highlight: false,
  },
  {
    slug: 'waco',
    name: 'Waco',
    county: 'McLennan County',
    note: '45 min from Temple',
    highlight: false,
  },
  {
    slug: 'georgetown',
    name: 'Georgetown',
    county: 'Williamson County',
    note: '60 min from Temple',
    highlight: false,
  },
  {
    slug: 'round-rock',
    name: 'Round Rock',
    county: 'Williamson County',
    note: '70 min from Temple',
    highlight: false,
  },
  {
    slug: 'lampasas',
    name: 'Lampasas',
    county: 'Lampasas County',
    note: '45 min from Temple',
    highlight: false,
  },
  {
    slug: 'holland',
    name: 'Holland',
    county: 'Bell County',
    note: 'Rural Bell County neighbor',
    highlight: false,
  },
  {
    slug: 'taylor',
    name: 'Taylor',
    county: 'Williamson County',
    note: '55 min from Temple',
    highlight: false,
  },
  {
    slug: 'troy',
    name: 'Troy',
    county: 'Bell County',
    note: 'Rural Bell County neighbor',
    highlight: false,
  },
  {
    slug: 'nolanville',
    name: 'Nolanville',
    county: 'Bell County',
    note: '15 min from Temple',
    highlight: false,
  },
] as const

// County-wide pages — broader SEO surfaces that serve every city in the county.
const COUNTIES = [
  { slug: 'bell-county',       name: 'Bell County',       seat: 'Belton',     note: 'Our home county — 150+ projects' },
  { slug: 'mclennan-county',   name: 'McLennan County',   seat: 'Waco',       note: 'Waco metro + Brazos corridor' },
  { slug: 'coryell-county',    name: 'Coryell County',    seat: 'Gatesville', note: 'Copperas Cove + ranch country' },
  { slug: 'williamson-county', name: 'Williamson County', seat: 'Georgetown', note: 'Georgetown · Round Rock · Taylor' },
  { slug: 'lampasas-county',   name: 'Lampasas County',   seat: 'Lampasas',   note: 'Hill Country ranch territory' },
  { slug: 'falls-county',      name: 'Falls County',      seat: 'Marlin',     note: 'East rural ag — Marlin · Rosebud' },
  { slug: 'milam-county',      name: 'Milam County',      seat: 'Cameron',    note: 'Cameron · Rockdale · Thorndale' },
  { slug: 'burnet-county',     name: 'Burnet County',     seat: 'Burnet',     note: 'Hill Country + Highland Lakes' },
] as const

export default function ServiceAreasPage() {
  return (
    <>
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
              Triple J Metal is based in Temple, TX. We build carports, garages, barns, and RV covers
              across the entire Killeen–Temple–Belton corridor and surrounding counties. If you&rsquo;re
              within 90 minutes of Temple, we come to you.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#quote" variant="primary" size="lg">
                Get a Free Quote
              </ButtonLink>
              <TrackedPhoneLink
                surface="service_areas_hero"
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
              { stat: '14',        label: 'Cities Served' },
              { stat: '8',         label: 'Counties Covered' },
              { stat: 'Same-Week', label: 'On-Site After Approval' },
              { stat: 'Zero',      label: 'Subcontractors — Ever' },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div className="text-xl font-extrabold">{stat}</div>
                <div className="text-xs text-white/75 mt-0.5 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── City grid ── */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <h2 className="mb-4">Cities We Serve</h2>
          <p className="text-ink-500 text-lg mb-10 max-w-2xl">
            Click any city to see a dedicated page with local service details, pricing context,
            and area-specific information for your project.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/locations/${city.slug}`}
                className={`group flex flex-col rounded-xl border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all ${
                  city.highlight
                    ? 'border-(--color-brand-300) bg-brand-50 hover:border-(--color-brand-500)'
                    : 'border-ink-100 bg-ink-50 hover:border-(--color-brand-300) hover:bg-brand-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <svg className="w-4 h-4 text-(--color-brand-600) shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {city.highlight && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-brand-600) bg-(--color-brand-100) px-2 py-0.5 rounded-full">
                      Home Base
                    </span>
                  )}
                </div>
                <div className="font-bold text-ink-900 text-base leading-tight">{city.name}, TX</div>
                <div className="text-xs text-ink-400 mt-0.5">{city.county}</div>
                <div className="text-xs text-ink-500 mt-2 font-medium">{city.note}</div>
                <div className="mt-4 text-xs font-semibold text-(--color-brand-600) group-hover:underline">
                  View details →
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── County grid (county-wide SEO surfaces) ── */}
      <section className="py-16 md:py-24 bg-ink-50 border-y border-ink-100">
        <Container>
          <h2 className="mb-4">Counties We Serve</h2>
          <p className="text-ink-500 text-lg mb-10 max-w-2xl">
            County-wide pages with the local context for every property in the county — including
            cities, towns, and rural ag properties not listed individually above.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {COUNTIES.map((county) => (
              <Link
                key={county.slug}
                href={`/locations/${county.slug}`}
                className="group flex flex-col rounded-xl border border-ink-100 bg-white p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-(--color-brand-300) hover:bg-brand-50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <svg className="w-4 h-4 text-(--color-brand-600) shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="font-bold text-ink-900 text-base leading-tight">{county.name}</div>
                <div className="text-xs text-ink-400 mt-0.5">Seat: {county.seat}</div>
                <div className="text-xs text-ink-500 mt-2 font-medium">{county.note}</div>
                <div className="mt-4 text-xs font-semibold text-(--color-brand-600) group-hover:underline">
                  View county page →
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── How far we travel ── */}
      <section className="py-16 md:py-20 bg-ink-50">
        <Container size="narrow">
          <h2 className="mb-6">How Far Do We Travel?</h2>
          <p className="text-ink-600 text-lg leading-relaxed mb-6">
            Our Temple-based crew regularly builds within a 90-minute radius. That covers
            most of Bell, Coryell, McLennan, Lampasas, and Williamson counties. For larger
            commercial jobs or unique projects, we&rsquo;ll travel further — just call and ask.
          </p>
          <p className="text-ink-600 text-lg leading-relaxed">
            Not sure if you&rsquo;re in our range? Call <TrackedPhoneNumber /> — we&rsquo;ll tell you
            immediately. We don&rsquo;t charge a travel fee for most residential projects within
            the service area.
          </p>
          <div className="mt-8">
            <TrackedPhoneLink
              surface="service_areas_inline"
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
