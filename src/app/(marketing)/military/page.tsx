import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { RuleList } from '@/components/forge/cards'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { MilitaryCalculator } from '@/components/forge/MilitaryCalculator'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass } from '@/components/forge/styles'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { LOCATIONS } from '@/lib/locations'
import { getSiteUrl } from '@/lib/site-url'
import { SITE } from '@/lib/site'

/**
 * /military — Fort Cavazos PCS-season landing page (Forge, olive + tan accents).
 *
 * Discoverable as a footer link + intentionally NOT in the header nav
 * (per 2026-04-24 decision: keep focused for paid search/social ad
 * traffic; organic discovery flows through internal links from
 * /locations/killeen and /locations/harker-heights).
 *
 * Military discount: 7% off every install for active-duty, retired,
 * Reserve/Guard, and first responders. Confirmed 2026-04-24.
 *
 * Not shipped from the design (D18, 2026-10-02): the "stacks with whatever
 * else we're running" line, per-city drive times to the main gate, and the
 * placeholder Fort Cavazos testimonial — none is verified. A real review from
 * testimonials.md can take the right-hand slot of the Hablamos español band.
 *
 * Schema: per-page @graph with a Service node scoped to the Fort Cavazos
 * catchment + a WebPage node referencing the canonical LocalBusiness +
 * Organization graph emitted by the marketing layout. See
 * docs/SCHEMA-AUDIT.md for the canonical-graph pattern.
 */

const MILITARY_DISCOUNT_PCT = 7

// Every catchment city has a location page; the tile shows its county.
const FORT_CAVAZOS_CATCHMENT = [
  { slug: 'harker-heights', name: 'Harker Heights' },
  { slug: 'nolanville', name: 'Nolanville' },
  { slug: 'killeen', name: 'Killeen' },
  { slug: 'copperas-cove', name: 'Copperas Cove' },
  { slug: 'belton', name: 'Belton', featured: true },
] as const

const PCS_SCENARIOS = [
  {
    eyebrow: 'Pre-deployment',
    title: 'Protect the truck before you ship out.',
    body: 'A welded carport installed before your deployment date, so the truck doesn’t sit in Texas sun and hail for 9 to 12 months.',
  },
  {
    eyebrow: 'TDY-friendly',
    title: 'Cover the spouse’s vehicle during TDY.',
    body: 'A quick-install bolted carport sized for the daily driver. We coordinate build week with the household, not the deployment cycle.',
  },
  {
    eyebrow: 'Overseas tour',
    title: 'RV or boat storage for a 2–3 year tour.',
    body: 'A welded RV cover or enclosed garage so the toys ride out the tour under steel — not a tarp that fails in a Bell County hailstorm.',
  },
] as const

// Step 1 keeps the locked response promise ("within 24 hours"); same-day
// wording belongs to /quote only.
const TIMELINE_STEPS = [
  {
    title: 'Callback within 24 hours',
    body: `Call ${SITE.phone} or send a quote request. Juan or Julian gets back to you within 24 hours.`,
  },
  {
    title: 'Site visit or video walk-through',
    body: 'On-site at your home or rental — or a video walk-through if you’re still PCSing in. We measure, talk size, style and concrete, and email the quote that day.',
  },
  {
    title: 'Build week around your orders',
    body: 'Most installs land same-week to the week after — built around PCS arrivals, deployment dates and TDY blocks. We don’t overpromise, and we don’t disappear.',
  },
] as const

const MORE_FOR_FAMILIES = [
  { href: '/blog/fort-cavazos-pcs-metal-carport', label: 'How military families get a metal carport on military timelines' },
  { href: '/locations/killeen', label: 'Metal carports in Killeen, TX' },
  { href: '/locations/harker-heights', label: 'Metal carports in Harker Heights, TX' },
  { href: '/blog/bell-county-metal-building-permit-guide', label: 'Bell County permit guide (Killeen + Harker Heights)' },
] as const

const pad = 'py-[clamp(64px,7vw,104px)]'
const wrap = 'mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]'
const split =
  'mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-[clamp(32px,4vw,80px)] px-[clamp(20px,3vw,40px)]'
const badge =
  'inline-flex h-[30px] items-center rounded-full border px-3 text-[11px] font-bold uppercase tracking-[.18em]'
const lede = 'text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate'

export const metadata: Metadata = {
  // The root layout's `%s | Triple J Metal` template adds the brand — never
  // put it in this string too.
  title: 'Fort Cavazos Carports & Metal Buildings',
  description:
    'Welded or bolted carports, RV covers and garages for Fort Cavazos families. Same-week installs near Killeen and Harker Heights. 7% military discount.',
  alternates: { canonical: '/military' },
  openGraph: {
    title: 'Fort Cavazos Carports — Same-Week Installs for PCS Families',
    description:
      'Local Temple-based crew. Welded or bolted carports + RV covers + garages built around PCS timelines. 7% military discount. Hablamos español.',
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
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: `${LOCATIONS[c.slug]?.county ?? 'Bell County'}, Texas`,
    },
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
    <div data-forge="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd(baseUrl)).replace(/</g, '\\u003c'),
        }}
      />
      <BreadcrumbJsonLd items={[{ name: 'Fort Cavazos Military', path: '/military' }]} />

      {/* 1 · Hero */}
      <PageHero
        size="military"
        scrim="military"
        image={{
          src: '/images/carport-truck-concrete-hero.jpg',
          alt: 'Welded metal carport over a pickup truck near Fort Cavazos, Texas',
        }}
        breadcrumb={<Breadcrumb trail={[{ name: 'Military' }]} current="Fort Cavazos" jsonLd={false} />}
        contentMax="max-w-[820px]"
        above={
          <div className="flex flex-wrap gap-2">
            <span className={`${badge} border-forge-tan/60 bg-forge-olive/45 text-forge-tan-light`}>Fort Cavazos</span>
            <span className={`${badge} border-white/30 bg-white/8 text-white`}>
              {MILITARY_DISCOUNT_PCT}% military discount honored
            </span>
          </div>
        }
        h1a="Fort Cavazos carports."
        h1b="Same-week for PCS families."
        ledeMax="max-w-[640px]"
        lede="Welded or bolted carports, RV covers and garages built around your orders, with same-week scheduling. Local Temple crew, 30 min from Killeen. Hablamos español con Juan y Freddy."
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              Get my PCS quote
            </ForgeButtonLink>
            <TrackedPhoneLink surface="military_hero" mode="children-only" className={buttonClass('outlineDark', 'lg')}>
              Call <TrackedPhoneNumber className="tabular-nums" />
            </TrackedPhoneLink>
          </>
        }
        after={
          <p className="mt-[18px] text-[14px] text-white/72">
            Active-duty · Retired · Reserve/Guard · First responders — all eligible.
          </p>
        }
      />

      {/* 2 · PCS + discount panel */}
      <section data-forge="" data-tone="light" className={`bg-white ${pad} text-forge-navy`}>
        <div className={`${split} items-start`}>
          <ForgeReveal>
            <SectionHeading
              eyebrow="Same-week scheduling"
              eyebrowTone="military"
              line1="PCS orders don’t wait."
              line2="Neither do we."
            />
            <p className={`mt-[18px] max-w-[580px] ${lede}`}>
              Wait in a long build queue and your household goods show up first. The truck’s sat through a Texas
              summer, and the spouse is improvising shade with a tarp.
            </p>
            <p className={`mt-3.5 max-w-[580px] ${lede}`}>
              We’re a local Temple crew, 30 minutes from Killeen. Most installs land within a week of approval —
              concrete poured the same week, structure built the next. Built around the PCS calendar, not a franchise
              wait list.
            </p>
          </ForgeReveal>
          <ForgeReveal className="overflow-hidden rounded-[12px] border border-forge-silver bg-forge-fog">
            <div className="flex items-center gap-4 bg-forge-olive px-[26px] py-6 text-white">
              <span className="inline-flex size-[60px] flex-none items-center justify-center rounded-full border-2 border-forge-tan font-forge-display text-[20px] font-black">
                {MILITARY_DISCOUNT_PCT}%
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-tan-light">Off every install</p>
                <h3 className="mt-1 font-forge-display text-[clamp(20px,.8vw_+_14px,26px)] font-black leading-[1.15]">
                  Fort Cavazos military discount
                </h3>
              </div>
            </div>
            <div className="px-[26px] pt-6 pb-[26px]">
              <p className="text-[15px] leading-[1.65] text-forge-navy">
                For active-duty, retired, Reserve/Guard and first responders.
              </p>
              <MilitaryCalculator pct={MILITARY_DISCOUNT_PCT} />
              <RuleList
                tone="tan"
                className="mt-5 !gap-2.5"
                itemClassName="text-[14px] text-forge-navy"
                items={[
                  'Welded, bolted and turnkey-with-concrete builds',
                  'RV covers, boat covers and enclosed garages',
                  'Verified by service ID, military email or DD-214',
                ]}
              />
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* 3 · PCS scenarios */}
      <section data-forge="" data-tone="light" className={`bg-forge-fog ${pad} text-forge-navy`}>
        <div className={wrap}>
          <ForgeReveal className="max-w-[780px]">
            <SectionHeading
              eyebrow="PCS scenarios we build for"
              eyebrowTone="military"
              line1="Every PCS season since we opened."
              balance
            />
          </ForgeReveal>
          <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
            {PCS_SCENARIOS.map((s) => (
              <div
                key={s.title}
                className="rounded-[12px] border border-t-[3px] border-forge-silver border-t-forge-olive bg-white px-[26px] pt-[26px] pb-7"
              >
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-olive">{s.eyebrow}</p>
                <h3 className="mt-2.5 font-forge-display text-[20px] font-bold leading-[1.25] text-forge-navy">{s.title}</h3>
                <p className="mt-2.5 text-[15px] leading-[1.65] text-forge-slate">{s.body}</p>
              </div>
            ))}
          </ForgeReveal>
        </div>
      </section>

      {/* 4 · Catchment */}
      <section data-forge="" data-tone="light" className={`bg-white ${pad} text-forge-navy`}>
        <div className={wrap}>
          <ForgeReveal className="max-w-[780px]">
            <SectionHeading
              eyebrow="Where we build"
              eyebrowTone="military"
              line1="Every city in the Cavazos catchment."
              balance
              ledeMax="max-w-[640px]"
              lede="Killeen and Harker Heights are our highest-volume military markets. We also build for Cavazos families across Bell County and into Coryell County."
            />
          </ForgeReveal>
          <ForgeReveal className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3">
            {FORT_CAVAZOS_CATCHMENT.map((c) => {
              const featured = 'featured' in c && c.featured
              return (
                <Link
                  key={c.slug}
                  href={`/locations/${c.slug}`}
                  className={`block rounded-[12px] border p-5 transition-colors duration-200 ${
                    featured
                      ? 'border-forge-navy bg-white hover:bg-forge-fog'
                      : 'border-forge-silver bg-forge-fog hover:border-forge-steel hover:bg-white'
                  }`}
                >
                  <span className="block font-forge-display text-[19px] font-bold text-forge-navy">
                    {c.name}
                    {featured ? <span aria-hidden="true"> →</span> : null}
                  </span>
                  <span className="mt-1.5 block text-[13px] text-forge-slate">{LOCATIONS[c.slug]?.county}</span>
                </Link>
              )
            })}
          </ForgeReveal>
        </div>
      </section>

      {/* 5 · On a military timeline (navy) */}
      <section data-forge="" data-tone="dark" className={`bg-forge-navy ${pad} text-white`}>
        <div className={wrap}>
          <ForgeReveal className="max-w-[780px]">
            <SectionHeading
              tone="dark"
              eyebrow="On a military timeline"
              eyebrowTone="militaryDark"
              line1="Quote to keys,"
              line2="built around your orders."
            />
          </ForgeReveal>
          <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
            {TIMELINE_STEPS.map((s, i) => (
              <div key={s.title} className="rounded-[12px] border border-forge-silver/20 bg-forge-navy-raised p-[26px]">
                <span className="font-forge-display text-[44px] font-black leading-none text-forge-tan">{i + 1}</span>
                <h3 className="mt-3.5 font-forge-display text-[20px] font-bold text-white">{s.title}</h3>
                <p className="mt-2.5 text-[15px] leading-[1.65] text-white/75">{s.body}</p>
              </div>
            ))}
          </ForgeReveal>
        </div>
      </section>

      {/* 6 · Hablamos español. The design's testimonial figure waits for a
          real review (testimonials.md); until then the slot carries the
          internal links the old page ended on. */}
      <section data-forge="" data-tone="light" className={`bg-forge-fog ${pad} text-forge-navy`}>
        <div className={`${split} items-center`}>
          <ForgeReveal>
            <SectionHeading
              eyebrow="Hablamos español"
              eyebrowTone="military"
              size="compact"
              balance
              line1="A bilingual crew for a multilingual post."
            />
            <p className={`mt-4 max-w-[560px] ${lede}`}>
              Military families come from every background. Juan and Freddy run quotes, site visits and the build
              itself in Spanish or English — no language barrier between you and the people building your structure.
            </p>
          </ForgeReveal>
          <ForgeReveal className="rounded-[12px] border border-forge-silver bg-white p-[clamp(24px,2.4vw,40px)]">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-olive">More for Cavazos families</p>
            <ul className="mt-3 flex flex-col">
              {MORE_FOR_FAMILIES.map((l) => (
                <li key={l.href} className="border-b border-forge-mist last:border-b-0">
                  <Link
                    href={l.href}
                    className="group flex min-h-11 items-center justify-between gap-4 py-3 text-[15px] font-semibold text-forge-navy"
                  >
                    <span className="border-b border-transparent transition-colors group-hover:border-forge-navy">
                      {l.label}
                    </span>
                    <span aria-hidden="true" className="text-forge-steel transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </ForgeReveal>
        </div>
      </section>

      {/* 7 · Quote — discount box arrives pre-checked */}
      <QuoteSection initialMilitary />
    </div>
  )
}
