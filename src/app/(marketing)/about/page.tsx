import Image from 'next/image'
import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { FeatureCard, NumberedRow, RuleList } from '@/components/forge/cards'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'About — Temple, TX Metal Building Family',
  description:
    'Temple, TX family metal building contractor. 150+ completed projects, welded red iron steel, turnkey concrete. Not a national chain.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Triple J Metal | Temple, TX',
    description: 'Local Temple family business. 150+ completed metal building projects across Central Texas.',
    type: 'website',
  },
}

// Layout-mounted <OrganizationJsonLd /> already emits the comprehensive
// LocalBusiness + Organization graph on every marketing page. Per-page
// schema here is a focused AboutPage WebPage node referencing the
// canonical Organization via @id — no duplicate LocalBusiness.
function jsonLd(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${baseUrl}/about`,
    url: `${baseUrl}/about`,
    name: `About ${SITE.name}`,
    description:
      'Family-owned Temple, TX metal building contractor. 150+ completed projects, welded red iron steel, turnkey concrete.',
    isPartOf: { '@id': `${baseUrl}/#website` },
    about: { '@id': `${baseUrl}/#organization` },
    inLanguage: 'en-US',
  }
}

const CREW = [
  {
    name: 'Juan',
    role: 'Co-owner · Relationships',
    body: 'The family connection behind Triple J. Juan builds relationships with customers across Central Texas.',
  },
  {
    name: 'Julian',
    role: 'Sales · Operations',
    body: 'Your point of contact for planning the build, talking through options and keeping the details moving.',
  },
  {
    name: 'Freddy',
    role: 'Foreman · Fabrication',
    body: 'Jose Alfredo “Freddy” leads the crew — the measurements, cuts and welds that bring your plans to life.',
  },
]

const APART = [
  {
    title: 'Local crew — not a dealer',
    body: 'We don’t sell kits. We build structures. Every job is handled by our own Temple-based crew from start to finish.',
  },
  {
    title: 'Welded or bolted',
    body: 'Both options, built by us. Framing, anchoring and any engineering requirements are confirmed for your design and site.',
  },
  {
    title: 'Concrete on the same contract',
    body: 'Site prep, concrete and the structure quoted together. Concrete is priced separately so you see exactly what’s included.',
  },
  {
    title: 'Same-week scheduling',
    body: 'Your install date is confirmed after we review scope, materials, site readiness and any required approvals.',
  },
  {
    title: 'Custom dimensions',
    body: 'Not catalog sizes. You tell us the width, length and height — we build exactly that, any configuration, any roof style.',
  },
  {
    title: 'Permit planning',
    body: 'We give permit guidance and discuss approvals before scheduling. Filing responsibilities are confirmed in your written scope.',
  },
]

const HOW = [
  {
    title: 'Show up when we say we will',
    body: 'If we schedule a build date, we’re there. No rescheduling after you’ve cleared the site.',
  },
  {
    title: 'One company, start to finish',
    body: 'Site prep, concrete, steel structure, cleanup — the same crew under one contract.',
  },
  {
    title: 'Built to outlast the contract',
    body: 'Welded red iron and permanent bolts on Galvalume® substrate — real estate improvements your kids inherit in working condition.',
  },
  {
    title: 'Permanent, not portable',
    body: 'No kits that rattle loose in the first Texas thunderstorm. Every weld and anchor is built for the wind our county actually sees.',
  },
  {
    title: 'Honest pricing, no surprises',
    body: 'We quote the full job upfront — including concrete if you need it. No add-ons after the fact.',
  },
]

export default function AboutPage() {
  const baseUrl = getSiteUrl()
  return (
    <div data-forge="">
      <BreadcrumbJsonLd items={[{ name: 'About', path: '/about' }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(baseUrl)).replace(/</g, '\\u003c') }}
      />

      {/* 1 · Hero */}
      <PageHero
        breadcrumb={<Breadcrumb trail={[{ name: 'Company' }]} current="About" jsonLd={false} />}
        image={{
          src: '/images/red-iron-frame-hero.jpg',
          alt: 'Red iron frame going up on a Triple J Metal jobsite',
          position: '50% 40%',
        }}
        contentMax="max-w-[800px]"
        eyebrow="About Triple J"
        h1a="Temple’s metal building family."
        h1b="Not a national chain."
        lede="Founded by a Temple family and run out of Temple, TX. We build every structure ourselves — no subcontractors, no kit drops, no hand-offs. One crew. One contract. Done right."
        facts={[
          { k: 'Projects', v: `${SITE.stats.projects} completed` },
          { k: 'On-site', v: 'Mon–Sat' },
          { k: 'After approval', v: 'Same-week' },
          { k: 'Founded', v: `${SITE.established} · Temple, TX` },
        ]}
      />

      {/* 2 · Crew */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-stretch gap-[clamp(32px,4vw,80px)] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="relative min-h-[380px] overflow-hidden rounded-[12px] bg-forge-slate">
            <Image
              src="/images/carport-truck-concrete-hero.jpg"
              alt="Finished Triple J Metal carport over a truck on a fresh concrete pad"
              fill
              sizes="(min-width: 900px) 640px, 100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-x-0 bottom-0 px-6 pt-16 pb-[22px] text-[15px] text-white"
              style={{ background: 'var(--scrim-caption)' }}
            >
              From the first measurement to the final weld.
            </div>
          </ForgeReveal>
          <ForgeReveal>
            <SectionHeading
              eyebrow="Meet Triple J"
              line1="Three names."
              line2="One family business."
              lede="Juan, Julian and Jose Alfredo. The people behind the name, based right here in Temple."
              ledeMax="max-w-[540px]"
            />
            <div className="mt-7 border-t border-forge-mist">
              {CREW.map((c) => (
                <div key={c.name} className="border-b border-forge-mist py-5">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 className="m-0 font-forge-display text-[24px] font-bold text-forge-navy">{c.name}</h3>
                    <span className="text-[12px] font-semibold uppercase tracking-[.16em] text-forge-slate">{c.role}</span>
                  </div>
                  <p className="mt-2 text-[15px] leading-[1.6] text-forge-slate">{c.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px]">
              <TrackedPhoneLink
                surface="about_crew"
                mode="children-only"
                className="border-b border-forge-silver font-semibold text-forge-navy transition-colors hover:border-forge-navy"
              >
                Talk with our team · <TrackedPhoneNumber className="tabular-nums" />
              </TrackedPhoneLink>
              <span className="text-forge-slate">English &amp; Español</span>
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* 3 · What sets us apart */}
      <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading eyebrow="What sets us apart" line1="No kits. No subs." line2="No hand-offs." />
          </ForgeReveal>
          <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
            {APART.map((a, i) => (
              <FeatureCard key={a.title} index={i} title={a.title}>
                {a.body}
              </FeatureCard>
            ))}
          </ForgeReveal>
        </div>
      </section>

      {/* 4 · Materials (never name a supplier) */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(32px,4vw,80px)] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal>
            <SectionHeading eyebrow="Materials" line1="Texas steel." line2="Texas suppliers." />
            <p className="mt-[18px] max-w-[580px] text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate">
              PBR and PBU panels, Galvalume® roofing, and concealed-fastener standing-seam systems for HOA-grade builds —
              sourced from leading regional Texas suppliers. Multi-source by design, so we’re never bottlenecked when one
              supplier runs short on a color or gauge.
            </p>
            <RuleList
              className="mt-[26px]"
              itemClassName="text-[15px] text-forge-navy"
              items={[
                'Regional Texas suppliers — multi-source',
                '14-gauge standard · 11-gauge heavy-duty columns',
                'Galvalume® substrate · 40-year painted finish',
              ]}
            />
          </ForgeReveal>
          <ForgeReveal className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-forge-silver bg-forge-slate">
            <Image
              src="/images/carport-residential-completed.jpg"
              alt="Completed residential metal carport with painted steel panels"
              fill
              sizes="(min-width: 900px) 640px, 100vw"
              className="object-cover"
            />
          </ForgeReveal>
        </div>
      </section>

      {/* 5 · How we work (navy) */}
      <section data-forge="" data-tone="dark" className="bg-forge-navy py-[clamp(64px,7vw,104px)] text-white">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading tone="dark" eyebrow="How we work" line1="You keep your weekend." line2="We keep our word." />
          </ForgeReveal>
          <ForgeReveal className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-x-[clamp(32px,4vw,72px)] border-t border-forge-silver/[.18]">
            {HOW.map((h, i) => (
              <NumberedRow key={h.title} index={i} title={h.title}>
                {h.body}
              </NumberedRow>
            ))}
          </ForgeReveal>
        </div>
      </section>

      {/* 6 · Quote */}
      <QuoteSection />
    </div>
  )
}
