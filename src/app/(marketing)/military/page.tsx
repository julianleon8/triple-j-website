import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { TrustBar } from '@/components/sections/TrustBar'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneButtonLink } from '@/components/site/TrackedPhone'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

/**
 * /military — Fort Cavazos PCS-season landing page.
 *
 * Discoverable as a footer link + intentionally NOT in the header nav
 * (per 2026-04-24 decision: keep focused for paid search/social ad
 * traffic; organic discovery flows through internal links from
 * /locations/killeen and /locations/harker-heights).
 *
 * Military discount: 7% off every install for active-duty, retired,
 * Reserve/Guard, and first responders. Confirmed 2026-04-24.
 *
 * Schema: per-page @graph with a Service node scoped to the Fort Cavazos
 * catchment + a WebPage node referencing the canonical LocalBusiness +
 * Organization graph emitted by the marketing layout. See
 * docs/SCHEMA-AUDIT.md for the canonical-graph pattern.
 */

const MILITARY_DISCOUNT_PCT = 7

const FORT_CAVAZOS_CATCHMENT = [
  { slug: 'killeen', name: 'Killeen', distance: '15 min from Cavazos main gate' },
  { slug: 'harker-heights', name: 'Harker Heights', distance: '10 min from Cavazos main gate' },
  { slug: 'copperas-cove', name: 'Copperas Cove', distance: '20 min from Cavazos main gate' },
  { slug: 'nolanville', name: 'Nolanville', distance: '12 min from Cavazos main gate' },
  { slug: 'belton', name: 'Belton', distance: '25 min from Cavazos main gate' },
] as const

const PCS_SCENARIOS = [
  {
    eyebrow: 'Pre-deployment',
    title: 'Protect the truck before you ship out.',
    body: "Welded carport installed before your deployment date so the truck doesn't sit in Texas sun and hail for 9 to 12 months. Spouse comes home to a covered driveway, not a cracked dashboard.",
  },
  {
    eyebrow: 'TDY-friendly',
    title: "Cover for the spouse's vehicle during TDY.",
    body: "Quick-install bolted carport sized for the daily-driver — so weather doesn't add to the mental load while you're traveling for training. We coordinate the build week with the household, not the deployment cycle.",
  },
  {
    eyebrow: 'Overseas tour',
    title: 'RV / boat storage during a 2-3 year tour.',
    body: 'Welded RV cover or fully-enclosed garage so the toys ride out the tour under steel — not a tarp that fails in a Bell County hailstorm. We size for what you own, not for what fits a national kit.',
  },
] as const

const TIMELINE_STEPS = [
  {
    n: '1',
    title: 'Same-day callback',
    body: 'Call 254-346-7764 or send a quote request. Juan or Julian gets back to you the same day — usually within an hour during business hours.',
  },
  {
    n: '2',
    title: 'Site visit (or photo walk-through)',
    body: 'On-site visit at your home or rental, OR a video walk-through if you\'re still PCSing in. We measure the lot, talk size + style + concrete, and email the quote that day.',
  },
  {
    n: '3',
    title: 'Build week scheduled around your orders',
    body: "Most installs land same-week to the week after — built around PCS arrivals, deployment dates, and TDY blocks. We don't overpromise, and we don't disappear.",
  },
] as const

export const metadata: Metadata = {
  // Use `absolute` to bypass the root layout's `%s | Triple J Metal`
  // title template — this string already includes the brand suffix in the
  // intended position. Without `absolute` the template would append a
  // second " | Triple J Metal" and ship a double-branded title.
  title: {
    absolute:
      'Fort Cavazos Carports & Metal Buildings | PCS Same-Week Installs | Triple J Metal',
  },
  description:
    'Welded or bolted carports, RV covers, and garages for Fort Cavazos active-duty, retired, and Reserve/Guard families. Same-week installs across Killeen, Harker Heights, Copperas Cove, Nolanville, Belton. 7% military discount honored. Hablamos español.',
  alternates: { canonical: '/military' },
  openGraph: {
    title: 'Fort Cavazos Carports — Same-Week Installs for PCS Families',
    description:
      'Local Temple-based crew. Welded or bolted carports + RV covers + garages built around PCS timelines, not 12-week wait lists. 7% military discount. Hablamos español.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fort Cavazos Carports — Same-Week Installs for PCS Families',
    description:
      '7% military discount. Same-week welded or bolted carports, RV covers, and garages around PCS timelines. Hablamos español.',
  },
}

function jsonLd(baseUrl: string) {
  const pageUrl = `${baseUrl}/military`
  const cities = FORT_CAVAZOS_CATCHMENT.map((c) => ({
    '@type': 'City',
    name: `${c.name}, TX`,
    containedInPlace: { '@type': 'AdministrativeArea', name: 'Bell County, Texas' },
  }))

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: 'Fort Cavazos PCS Metal Building Installation',
        description:
          'Welded or bolted carports, RV covers, and garages installed within PCS timelines for Fort Cavazos active-duty, retired, Reserve/Guard, and first-responder families across the Killeen / Harker Heights catchment.',
        serviceType: 'Metal building installation for military families',
        provider: { '@id': `${baseUrl}/#localbusiness` },
        areaServed: cities,
        offers: {
          '@type': 'Offer',
          name: `${MILITARY_DISCOUNT_PCT}% Fort Cavazos military and first-responder discount`,
          eligibleCustomerType: [
            'Active-duty military',
            'Retired military',
            'Reserve/Guard',
            'First responders',
          ],
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Fort Cavazos services',
          itemListElement: [
            { name: 'Welded metal carports', url: `${baseUrl}/services/carports` },
            { name: 'Bolted metal carports', url: `${baseUrl}/services/carports` },
            { name: 'RV and boat covers', url: `${baseUrl}/services/rv-covers` },
            { name: 'Metal garages', url: `${baseUrl}/services/metal-garages` },
            {
              name: 'Turnkey carports with concrete',
              url: `${baseUrl}/services/turnkey-carports-with-concrete`,
            },
          ].map((svc, i) => ({
            '@type': 'Offer',
            position: i + 1,
            itemOffered: { '@type': 'Service', name: svc.name, url: svc.url },
          })),
        },
        availableLanguage: ['English', 'Spanish'],
      },
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: 'Fort Cavazos Carports — Same-Week Installs for PCS Families',
        description:
          'Welded or bolted carports, RV covers, and garages built around PCS timelines for Fort Cavazos military families. 7% military discount.',
        isPartOf: { '@id': `${baseUrl}/#website` },
        about: { '@id': `${pageUrl}#service` },
        provider: { '@id': `${baseUrl}/#localbusiness` },
        inLanguage: 'en-US',
      },
    ],
  }
}

export default function MilitaryPage() {
  const baseUrl = getSiteUrl()
  return (
    <div data-theme="military">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd(baseUrl)).replace(/</g, '\\u003c'),
        }}
      />
      <BreadcrumbJsonLd items={[{ name: 'Fort Cavazos Military', path: '/military' }]} />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative bg-ink-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/carport-truck-concrete-hero.jpg"
            alt="Welded metal carport over a pickup truck on a residential property near Fort Cavazos, Texas"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          {/* Light-tactical overlay — faint digital-camo tile behind the
              dark gradient so the hero reads "tactical" without becoming a
              literal camo wallpaper. Opacity stays low (~10%) to preserve
              text legibility. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-mil-camo opacity-10 mix-blend-overlay"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(15,23,42,0.85) 50%, rgba(75,83,32,0.35) 100%)',
            }}
            aria-hidden="true"
          />
        </div>
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-accent-red)]/20 border border-[color:var(--color-accent-red)]/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-accent-red)]">
                Fort Cavazos
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                {MILITARY_DISCOUNT_PCT}% Military Discount Honored
              </span>
            </div>
            <h1 className="font-display font-extrabold uppercase tracking-tight text-white text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
              Fort Cavazos Carports —{' '}
              <span className="text-[color:var(--color-brand-400)]">Same-Week Installs</span> for
              PCS Families
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
              Welded or bolted carports, RV covers, and garages built around your orders — not a
              12-week wait list. Local Temple crew, 25 minutes from the Cavazos main gate. Hablamos
              español con Juan y Freddy.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink
                href="#quote"
                variant="primary"
                size="lg"
                className="!bg-white !text-[color:var(--color-ink-900)] hover:!bg-white/90"
              >
                Get my PCS quote
              </ButtonLink>
              <TrackedPhoneButtonLink
                surface="military_hero"
                variant="outline-dark"
                size="lg"
              />
            </div>
            <p className="mt-5 text-sm text-white/55">
              Active-duty · Retired · Reserve/Guard · First responders — all eligible. Mention your
              service when you call or check the box on the quote form.
            </p>
          </div>
        </Container>
      </section>

      <TrustBar />

      {/* ── PCS Orders Don't Wait ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white">
        <Container>
          <Reveal className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                Same-week scheduling
              </span>
              <h2 className="mt-3 font-display font-extrabold uppercase tracking-tight text-[color:var(--color-ink-900)] text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
                PCS orders don&apos;t wait. Neither do we.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-[color:var(--color-ink-700)]">
                Most national carport companies quote 8 to 12 weeks. By then your household goods
                have shown up, the truck&apos;s sat in a Texas summer, and the spouse is improvising
                shade with a tarp.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-[color:var(--color-ink-700)]">
                Triple J Metal is a local Temple crew, 25 minutes from the Cavazos main gate. Most
                installs land within a week of approval — concrete poured the same week, structure
                built the next. Built around the PCS calendar, not the franchise wait list.
              </p>
            </div>
            <div className="rounded-2xl border border-[color:var(--color-ink-200)] bg-[color:var(--color-ink-50)] p-7 md:p-9">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-[color:var(--color-brand-600)] text-white flex items-center justify-center font-extrabold text-xl">
                  {MILITARY_DISCOUNT_PCT}%
                </div>
                <h3 className="font-display font-extrabold uppercase tracking-tight text-2xl text-[color:var(--color-ink-900)]">
                  Fort Cavazos Military Discount
                </h3>
              </div>
              <p className="text-[15px] leading-relaxed text-[color:var(--color-ink-700)]">
                <strong>{MILITARY_DISCOUNT_PCT}% off every install</strong> for active-duty,
                retired, Reserve/Guard, and first responders connected to Fort Cavazos. Stacks with
                whatever else we&apos;re running — no fine print, no expiration, no &ldquo;valid on
                select sizes only.&rdquo;
              </p>
              <ul className="mt-5 space-y-2.5 text-[15px] text-[color:var(--color-ink-700)]">
                <li className="flex gap-2.5">
                  <span className="text-brand-600 font-bold">·</span>
                  Honored on welded, bolted, and turnkey-with-concrete builds.
                </li>
                <li className="flex gap-2.5">
                  <span className="text-brand-600 font-bold">·</span>
                  Honored on RV covers, boat covers, and fully-enclosed garages.
                </li>
                <li className="flex gap-2.5">
                  <span className="text-brand-600 font-bold">·</span>
                  Verified by service ID, military email, or DD-214 — your call.
                </li>
              </ul>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── Common PCS scenarios ───────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-[color:var(--color-ink-50)]">
        <Container>
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              PCS scenarios we build for
            </span>
            <h2 className="mt-3 font-display font-extrabold uppercase tracking-tight text-[color:var(--color-ink-900)] text-4xl sm:text-5xl leading-[1.05] max-w-3xl">
              We&apos;ve built for every PCS season since we opened.
            </h2>
          </Reveal>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {PCS_SCENARIOS.map((s) => (
              <Reveal key={s.title}>
                <div className="h-full rounded-2xl bg-white border border-[color:var(--color-ink-200)] p-7 hover:border-[color:var(--color-brand-400)] transition-colors">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-accent-red)]">
                    {s.eyebrow}
                  </span>
                  <h3 className="mt-3 font-display font-extrabold uppercase tracking-tight text-xl text-[color:var(--color-ink-900)]">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-ink-700)]">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Service area ───────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <Container>
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              Where we build
            </span>
            <h2 className="mt-3 font-display font-extrabold uppercase tracking-tight text-[color:var(--color-ink-900)] text-4xl sm:text-5xl leading-[1.05] max-w-3xl">
              Every city in the Fort Cavazos catchment.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[color:var(--color-ink-700)] max-w-2xl">
              Killeen and Harker Heights are our highest-volume military markets. We also build for
              Cavazos families across the rest of Bell County and into Coryell County for Copperas
              Cove.
            </p>
          </Reveal>
          <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {FORT_CAVAZOS_CATCHMENT.map((c) => (
              <Link
                key={c.slug}
                href={`/locations/${c.slug}`}
                className="group rounded-xl border border-[color:var(--color-ink-200)] bg-[color:var(--color-ink-50)] p-5 hover:border-[color:var(--color-brand-400)] hover:bg-white transition-colors"
              >
                <div className="font-display font-extrabold uppercase tracking-tight text-lg text-[color:var(--color-ink-900)] group-hover:text-[color:var(--color-brand-600)]">
                  {c.name}, TX
                </div>
                <div className="mt-1 text-xs text-[color:var(--color-ink-500)]">{c.distance}</div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Approval/site-visit timeline ───────────────────────────────── */}
      <section className="py-20 md:py-24 bg-ink-900 text-white">
        <div className="hero-glow absolute" aria-hidden="true" />
        <Container className="relative">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-400)]">
              How it works on a military timeline
            </span>
            <h2 className="mt-3 font-display font-extrabold uppercase tracking-tight text-white text-4xl sm:text-5xl leading-[1.05] max-w-3xl">
              Quote to keys, built around your orders.
            </h2>
          </Reveal>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {TIMELINE_STEPS.map((s) => (
              <Reveal key={s.n}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-7 h-full">
                  <div className="text-5xl font-display font-extrabold text-[color:var(--color-brand-400)]">
                    {s.n}
                  </div>
                  <h3 className="mt-3 font-display font-extrabold uppercase tracking-tight text-xl text-white">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/70">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Bilingual ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-[color:var(--color-ink-50)]">
        <Container>
          <Reveal className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              Hablamos español
            </span>
            <h2 className="mt-3 font-display font-extrabold uppercase tracking-tight text-[color:var(--color-ink-900)] text-3xl sm:text-4xl leading-[1.1]">
              Bilingual crew for Fort Cavazos&apos; multilingual community.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[color:var(--color-ink-700)]">
              Military spouses and families come from every background. Juan and Freddy run quotes,
              site visits, and the build itself in Spanish or English — no language barrier between
              you and the people building your structure.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ── PCS testimonial ────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <Container>
          <Reveal className="max-w-3xl mx-auto text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              From a Fort Cavazos family
            </span>
            <blockquote className="mt-6 text-2xl md:text-3xl font-display font-bold text-[color:var(--color-ink-900)] leading-snug">
              &ldquo;PCSed to Fort Cavazos in July. Needed cover for my truck before the heat
              destroyed the paint. Juan came out himself for the walk-through and had us scheduled
              the same week.&rdquo;
            </blockquote>
            <div className="mt-6 text-sm uppercase tracking-[0.18em] font-semibold text-[color:var(--color-ink-500)]">
              PCS truck cover · Killeen, TX
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── Quote form CTA ─────────────────────────────────────────────── */}
      <section id="quote" className="py-20 md:py-28 bg-ink-900 text-white scroll-mt-20">
        <Container>
          <Reveal className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-400)]">
              Same-day callback
            </span>
            <h2 className="mt-3 font-display font-extrabold uppercase tracking-tight text-white text-4xl sm:text-5xl leading-[1.05]">
              Get your Fort Cavazos quote.
            </h2>
            <p className="mt-5 text-lg text-white/75 leading-relaxed">
              The military discount box is pre-checked below — verify the rest and we&apos;ll be in
              touch the same day with timeline + pricing.
            </p>
          </Reveal>
          <QuoteForm initialMilitary />
        </Container>
      </section>

      {/* ── Related reading ────────────────────────────────────────────── */}
      <section className="py-16 bg-[color:var(--color-ink-50)] border-t border-[color:var(--color-ink-200)]">
        <Container>
          <Reveal className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              More for Cavazos families
            </span>
            <h3 className="mt-3 font-display font-extrabold uppercase tracking-tight text-[color:var(--color-ink-900)] text-2xl sm:text-3xl">
              Articles + city pages
            </h3>
            <ul className="mt-6 space-y-3 text-[15px] text-[color:var(--color-ink-700)]">
              <li>
                <Link
                  href="/blog/fort-cavazos-pcs-metal-carport"
                  className="hover:text-[color:var(--color-brand-600)] transition-colors underline underline-offset-4"
                >
                  How military families get a metal carport on military timelines
                </Link>
              </li>
              <li>
                <Link
                  href="/locations/killeen"
                  className="hover:text-[color:var(--color-brand-600)] transition-colors underline underline-offset-4"
                >
                  Metal carports in Killeen, TX — Fort Cavazos page
                </Link>
              </li>
              <li>
                <Link
                  href="/locations/harker-heights"
                  className="hover:text-[color:var(--color-brand-600)] transition-colors underline underline-offset-4"
                >
                  Metal carports in Harker Heights, TX — military discount details
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/bell-county-metal-building-permit-guide-2025"
                  className="hover:text-[color:var(--color-brand-600)] transition-colors underline underline-offset-4"
                >
                  Bell County permit guide (Killeen + Harker Heights specifics)
                </Link>
              </li>
            </ul>
          </Reveal>
        </Container>
      </section>
    </div>
  )
}
