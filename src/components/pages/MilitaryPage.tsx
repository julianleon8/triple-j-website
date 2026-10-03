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
import { LANG_TAG, type Locale } from '@/i18n/config'
import { MILITARY } from '@/i18n/pages/military'
import { localizeHref } from '@/i18n/routes'
import { LOCATIONS } from '@/lib/locations'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

/**
 * /military (English) and /es/militares (Spanish) — Fort Cavazos PCS-season
 * landing page (Forge, olive + tan accents). Copy: src/i18n/pages/military.ts.
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

const pad = 'py-[clamp(64px,7vw,104px)]'
const wrap = 'mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]'
const split =
  'mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-[clamp(32px,4vw,80px)] px-[clamp(20px,3vw,40px)]'
const badge =
  'inline-flex h-[30px] items-center rounded-full border px-3 text-[11px] font-bold uppercase tracking-[.18em]'
const lede = 'text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate'

function countyOf(slug: string, locale: Locale): string {
  const county = LOCATIONS[slug]?.county ?? 'Bell County'
  return MILITARY[locale].jsonLd.counties[county] ?? county
}

function jsonLd(baseUrl: string, locale: Locale) {
  const t = MILITARY[locale].jsonLd
  const pageUrl = `${baseUrl}${localizeHref('/military', locale)}`
  const cities = FORT_CAVAZOS_CATCHMENT.map((c) => ({
    '@type': 'City',
    name: t.cityState(c.name),
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: `${countyOf(c.slug, locale)}, ${t.stateSuffix}`,
    },
  }))
  const service = (href: string) => `${baseUrl}${localizeHref(href, locale)}`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: t.serviceName,
        description: t.serviceDescription,
        serviceType: t.serviceType,
        provider: { '@id': `${baseUrl}/#localbusiness` },
        areaServed: cities,
        offers: {
          '@type': 'Offer',
          name: t.offerName(MILITARY_DISCOUNT_PCT),
          eligibleCustomerType: t.eligible,
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: t.catalogName,
          itemListElement: [
            { name: t.offers.welded, url: service('/services/carports') },
            { name: t.offers.bolted, url: service('/services/carports') },
            { name: t.offers.rv, url: service('/services/rv-covers') },
            { name: t.offers.garages, url: service('/services/metal-garages') },
            {
              name: t.offers.turnkey,
              url: service('/services/turnkey-carports-with-concrete'),
            },
          ].map((svc, i) => ({
            '@type': 'Offer',
            position: i + 1,
            itemOffered: { '@type': 'Service', name: svc.name, url: svc.url },
          })),
        },
        availableLanguage: t.availableLanguage,
      },
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: t.pageName,
        description: t.pageDescription,
        isPartOf: { '@id': `${baseUrl}/#website` },
        about: { '@id': `${pageUrl}#service` },
        provider: { '@id': `${baseUrl}/#localbusiness` },
        inLanguage: LANG_TAG[locale],
      },
    ],
  }
}

export function MilitaryPage({ locale }: { locale: Locale }) {
  const baseUrl = getSiteUrl()
  const t = MILITARY[locale]
  return (
    <div data-forge="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd(baseUrl, locale)).replace(/</g, '\\u003c'),
        }}
      />
      <BreadcrumbJsonLd items={[{ name: t.jsonLd.breadcrumb, path: '/military' }]} locale={locale} />

      {/* 1 · Hero */}
      <PageHero
        size="military"
        scrim="military"
        image={{
          src: '/images/carport-truck-concrete-hero.jpg',
          alt: t.hero.imgAlt,
        }}
        breadcrumb={
          <Breadcrumb trail={[{ name: t.hero.company }]} current={t.hero.current} jsonLd={false} locale={locale} />
        }
        contentMax="max-w-[820px]"
        above={
          <div className="flex flex-wrap gap-2">
            <span className={`${badge} border-forge-tan/60 bg-forge-olive/45 text-forge-tan-light`}>{t.hero.badge}</span>
            <span className={`${badge} border-white/30 bg-white/8 text-white`}>
              {t.hero.badgePct(MILITARY_DISCOUNT_PCT)}
            </span>
          </div>
        }
        h1a={t.hero.h1a}
        h1b={t.hero.h1b}
        ledeMax="max-w-[640px]"
        lede={t.hero.lede}
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              {t.hero.cta}
            </ForgeButtonLink>
            <TrackedPhoneLink surface="military_hero" mode="children-only" className={buttonClass('outlineDark', 'lg')}>
              {t.hero.call} <TrackedPhoneNumber className="tabular-nums" />
            </TrackedPhoneLink>
          </>
        }
        after={<p className="mt-[18px] text-[14px] text-white/72">{t.hero.eligible}</p>}
      />

      {/* 2 · PCS + discount panel */}
      <section data-forge="" data-tone="light" className={`bg-white ${pad} text-forge-navy`}>
        <div className={`${split} items-start`}>
          <ForgeReveal>
            <SectionHeading
              eyebrow={t.pcs.eyebrow}
              eyebrowTone="military"
              line1={t.pcs.line1}
              line2={t.pcs.line2}
            />
            <p className={`mt-[18px] max-w-[580px] ${lede}`}>{t.pcs.p1}</p>
            <p className={`mt-3.5 max-w-[580px] ${lede}`}>{t.pcs.p2}</p>
          </ForgeReveal>
          <ForgeReveal className="overflow-hidden rounded-[12px] border border-forge-silver bg-forge-fog">
            <div className="flex items-center gap-4 bg-forge-olive px-[26px] py-6 text-white">
              <span className="inline-flex size-[60px] flex-none items-center justify-center rounded-full border-2 border-forge-tan font-forge-display text-[20px] font-black">
                {MILITARY_DISCOUNT_PCT}%
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-tan-light">
                  {t.discount.eyebrow}
                </p>
                <h3 className="mt-1 font-forge-display text-[clamp(20px,.8vw_+_14px,26px)] font-black leading-[1.15]">
                  {t.discount.title}
                </h3>
              </div>
            </div>
            <div className="px-[26px] pt-6 pb-[26px]">
              <p className="text-[15px] leading-[1.65] text-forge-navy">{t.discount.who}</p>
              <MilitaryCalculator pct={MILITARY_DISCOUNT_PCT} />
              <RuleList
                tone="tan"
                className="mt-5 !gap-2.5"
                itemClassName="text-[14px] text-forge-navy"
                items={t.discount.items}
              />
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* 3 · PCS scenarios */}
      <section data-forge="" data-tone="light" className={`bg-forge-fog ${pad} text-forge-navy`}>
        <div className={wrap}>
          <ForgeReveal className="max-w-[780px]">
            <SectionHeading eyebrow={t.scenarios.eyebrow} eyebrowTone="military" line1={t.scenarios.line1} balance />
          </ForgeReveal>
          <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
            {t.scenarios.items.map((s) => (
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
              eyebrow={t.catchment.eyebrow}
              eyebrowTone="military"
              line1={t.catchment.line1}
              balance
              ledeMax="max-w-[640px]"
              lede={t.catchment.lede}
            />
          </ForgeReveal>
          <ForgeReveal className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3">
            {FORT_CAVAZOS_CATCHMENT.map((c) => {
              const featured = 'featured' in c && c.featured
              return (
                <Link
                  key={c.slug}
                  href={localizeHref(`/locations/${c.slug}`, locale)}
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
                  <span className="mt-1.5 block text-[13px] text-forge-slate">
                    {LOCATIONS[c.slug] ? countyOf(c.slug, locale) : undefined}
                  </span>
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
              eyebrow={t.timeline.eyebrow}
              eyebrowTone="militaryDark"
              line1={t.timeline.line1}
              line2={t.timeline.line2}
            />
          </ForgeReveal>
          <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
            {t.timeline.steps.map((s, i) => (
              <div key={s.title} className="rounded-[12px] border border-forge-silver/20 bg-forge-navy-raised p-[26px]">
                <span className="font-forge-display text-[44px] font-black leading-none text-forge-tan">{i + 1}</span>
                <h3 className="mt-3.5 font-forge-display text-[20px] font-bold text-white">{s.title}</h3>
                <p className="mt-2.5 text-[15px] leading-[1.65] text-white/75">{s.body(SITE.phone)}</p>
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
              eyebrow={t.spanish.eyebrow}
              eyebrowTone="military"
              size="compact"
              balance
              line1={t.spanish.line1}
            />
            <p className={`mt-4 max-w-[560px] ${lede}`}>{t.spanish.body}</p>
          </ForgeReveal>
          <ForgeReveal className="rounded-[12px] border border-forge-silver bg-white p-[clamp(24px,2.4vw,40px)]">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-olive">{t.spanish.moreEyebrow}</p>
            <ul className="mt-3 flex flex-col">
              {t.spanish.links.map((l) => (
                <li key={l.href} className="border-b border-forge-mist last:border-b-0">
                  <Link
                    href={localizeHref(l.href, locale)}
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
      <QuoteSection initialMilitary locale={locale} />
    </div>
  )
}
