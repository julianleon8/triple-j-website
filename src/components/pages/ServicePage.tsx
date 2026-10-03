import Link from 'next/link'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { BuildGrid } from '@/components/forge/BuildGrid'
import { Chip } from '@/components/forge/Chip'
import { FaqAccordion } from '@/components/forge/FaqAccordion'
import { FeatureCard, RuleList, SpecSheet } from '@/components/forge/cards'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { OptionTabs } from '@/components/forge/OptionTabs'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { RelatedGuides } from '@/components/forge/RelatedGuides'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass } from '@/components/forge/styles'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { LANG_TAG, type Locale } from '@/i18n/config'
import { SERVICE_PAGE } from '@/i18n/pages/service'
import { localizeHref } from '@/i18n/routes'
import { ALL_CITY_SLUGS } from '@/lib/city-links'
import type { BuildItem } from '@/lib/forge-builds'
import { LOCATIONS } from '@/lib/locations'
import { SERVICE_PHOTOS, type ServiceData } from '@/lib/services'
import { getService } from '@/lib/services.es'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

const menuName = (svc: ServiceData) => svc.forge?.menu ?? svc.shortTitle

type NavLink = { href: string; label: string }

/**
 * One service page (Forge). Rendered by `/services/[slug]` and
 * `/es/servicios/[slug]`; the route files pick the service, read the live
 * builds (gallery-revalidate.test.ts wants that read in a page.tsx) and pass
 * `svc` already in the page's language (`getService(slug, locale)`).
 */
export function ServicePage({
  locale,
  svc,
  builds,
}: {
  locale: Locale
  svc: ServiceData
  /** Live gallery items of this service's type, already filtered and capped. */
  builds: readonly BuildItem[]
}) {
  const t = SERVICE_PAGE[locale]
  const slug = svc.slug
  const f = svc.forge
  const menu = menuName(svc)

  /** Panel and finish pages apply to every building, not to fencing or gates. */
  const panelLinks = (): NavLink[] => {
    if (slug === 'metal-fencing' || slug === 'gates') return []
    return [
      { href: '/services/colors', label: t.panels.colors },
      { href: '/services/pbr-vs-pbu-panels', label: t.panels.pbrPbu },
      // Stalls, decks and one-offs sit next to barns and garages.
      ...(slug === 'barns' || slug === 'metal-garages' ? [{ href: '/services/hybrid-projects', label: t.panels.hybrid }] : []),
    ]
  }

  /** Order is the design's: two related services, then the fixed links. */
  const relatedLinks = (): NavLink[] => {
    const related = (f?.related ?? svc.relatedSlugs).slice(0, 2)
    return [
      ...related
        .map((s) => getService(s, locale))
        .filter((s): s is ServiceData => Boolean(s))
        .map((s) => ({ href: `/services/${s.slug}`, label: menuName(s) })),
      { href: '/gallery', label: t.links.gallery },
      { href: '/locations/temple', label: t.links.temple },
      { href: '/locations/belton', label: t.links.belton },
      { href: '/about', label: t.links.about },
      { href: '/military', label: t.links.military },
    ]
  }

  const baseUrl = getSiteUrl()
  const pageUrl = `${baseUrl}${localizeHref(`/services/${slug}`, locale)}`

  // Per-service @graph: a Service node referencing the canonical
  // LocalBusiness via @id, plus a WebPage node. See docs/SCHEMA-AUDIT.md.
  // No FAQPage node: Google retired the FAQ rich result 2026-05-07 (locked).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: svc.title,
        description: svc.metaDescription,
        serviceType: svc.title,
        provider: { '@id': `${baseUrl}/#localbusiness` },
        areaServed: { '@type': 'State', name: 'Texas' },
        url: pageUrl,
      },
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: svc.metaTitle ?? `${svc.title} | ${SITE.name}`,
        description: svc.metaDescription,
        isPartOf: { '@id': `${baseUrl}/#website` },
        about: { '@id': `${pageUrl}#service` },
        inLanguage: LANG_TAG[locale],
      },
    ],
  }

  const heroImage = f
    ? { src: f.img, alt: f.imgAlt, position: f.pos }
    : SERVICE_PHOTOS[slug]
      ? { src: SERVICE_PHOTOS[slug], alt: t.heroImageAlt(svc.title), position: '50% 50%' }
      : null

  const heroActions = (
    <>
      <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
        {t.quote}
      </ForgeButtonLink>
      <TrackedPhoneLink
        surface="services_slug_hero"
        mode="children-only"
        className={buttonClass('outlineDark', 'lg')}
      >
        {t.call} <TrackedPhoneNumber className="tabular-nums" />
      </TrackedPhoneLink>
    </>
  )
  const breadcrumb = (
    <Breadcrumb
      trail={[{ name: t.breadcrumb, href: '/services' }]}
      current={menu}
      currentPath={`/services/${slug}`}
      locale={locale}
    />
  )
  const heroCopy = {
    breadcrumb,
    eyebrow: f?.eyebrow ?? (svc.keywordGap ? t.gapEyebrows[svc.keywordGap] : undefined),
    h1a: f?.h1a ?? svc.heroHeadline,
    h1b: f?.h1b,
    lede: f?.lede ?? svc.heroCopy,
    actions: heroActions,
  }

  return (
    <div data-forge="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* 1 · Hero */}
      {heroImage ? (
        <PageHero {...heroCopy} image={heroImage} facts={f?.facts} />
      ) : (
        <PageHero {...heroCopy} variant="plain" />
      )}

      {/* 2 · Options */}
      {f && f.options.length ? (
        <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
          <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
            <OptionTabs
              heading={
                <SectionHeading eyebrow={f.optEyebrow} line1={f.optHeading} lede={f.optLede} ledeMax="max-w-[560px]" />
              }
              options={f.options.map((o) => ({
                ...o,
                imgAlt: o.title,
                quote: {
                  service: svc.quoteService,
                  structure: o.structure,
                  concrete: o.concrete,
                },
              }))}
            />
          </div>
        </section>
      ) : null}

      {/* 3 · What's included */}
      {svc.features.length ? (
        <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
          <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
            <ForgeReveal className="max-w-[760px]">
              <SectionHeading eyebrow={t.included} line1={svc.featuresHeading ?? t.included} balance />
            </ForgeReveal>
            <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
              {svc.features.map((feat, i) => (
                <FeatureCard key={feat.title} index={i} title={feat.title}>
                  {feat.description}
                </FeatureCard>
              ))}
            </ForgeReveal>
          </div>
        </section>
      ) : null}

      {/* 4 · Recent builds (3+ live matches only) */}
      {builds.length >= 3 ? (
        <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
          <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
              <SectionHeading eyebrow={t.builds.eyebrow} line1={t.builds.heading} className="max-w-[720px]" />
              <Link href={localizeHref('/gallery', locale)} className="border-b border-forge-silver pb-0.5 text-[15px] font-semibold transition-colors hover:border-forge-navy">
                {t.builds.gallery}
              </Link>
            </div>
            <BuildGrid items={builds} />
          </div>
        </section>
      ) : null}

      {/* 5 · Specs (navy) */}
      {svc.technicalAuthority ? (
        <section data-forge="" data-tone="dark" className="bg-forge-navy py-[clamp(64px,7vw,104px)] text-white">
          <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(32px,4vw,72px)] px-[clamp(20px,3vw,40px)]">
            <ForgeReveal>
              {f?.techHeading ? (
                <SectionHeading tone="dark" eyebrow={t.tech.eyebrow} line1={f.techHeading} balance />
              ) : (
                <SectionHeading tone="dark" line1={t.tech.heading} />
              )}
              <p className="mt-[18px] max-w-[600px] text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.6] text-white/80 [text-wrap:pretty]">
                {svc.technicalAuthority}
              </p>
              {svc.trustPoints?.length ? <RuleList className="mt-7" items={svc.trustPoints} /> : null}
            </ForgeReveal>
            {f?.specs.length ? (
              <ForgeReveal>
                <SpecSheet
                  title={t.tech.specTitle(menu)}
                  rows={f.specs}
                  footnote={t.tech.footnote}
                />
              </ForgeReveal>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* 6 · FAQ */}
      {svc.faqs.length ? (
        <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
          <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-start gap-[clamp(32px,4vw,72px)] px-[clamp(20px,3vw,40px)]">
            <ForgeReveal>
              <SectionHeading eyebrow={t.faq.eyebrow} line1={t.faq.line1} line2={t.faq.line2} />
              <p className="mt-4 max-w-[420px] text-[16px] leading-[1.6] text-forge-slate">
                {t.faq.stillUnsure}{' '}
                <TrackedPhoneLink
                  surface="services_slug_faq"
                  className="border-b border-forge-silver font-semibold text-forge-navy tabular-nums transition-colors hover:border-forge-navy"
                />
                {t.faq.picksUp}
              </p>
            </ForgeReveal>
            <ForgeReveal>
              <FaqAccordion faqs={svc.faqs} />
            </ForgeReveal>
          </div>
        </section>
      ) : null}

      {/* 7 · Guides (only when relatedPosts is populated) */}
      {svc.relatedPosts?.length ? <RelatedGuides postSlugs={svc.relatedPosts} locale={locale} /> : null}

      {/* 8 · Related, panels, and the cities we serve */}
      <section data-forge="" data-tone="light" className="border-t border-forge-mist bg-forge-fog py-8 text-forge-navy">
        <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-[clamp(20px,3vw,40px)]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate min-[900px]:w-[150px]">{t.rails.related}</p>
            <div className="flex flex-wrap gap-2.5">
              {relatedLinks().map((r) => (
                <ForgeButtonLink key={r.href} href={localizeHref(r.href, locale)} variant="linkAccent" size="tap">
                  {r.label} →
                </ForgeButtonLink>
              ))}
            </div>
          </div>
          {panelLinks().length ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate min-[900px]:w-[150px]">{t.rails.panels}</p>
              <div className="flex flex-wrap gap-2.5">
                {panelLinks().map((r) => (
                  <ForgeButtonLink key={r.href} href={localizeHref(r.href, locale)} variant="linkAccent" size="tap">
                    {r.label} →
                  </ForgeButtonLink>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate min-[900px]:w-[150px]">{t.rails.cities}</p>
            <div className="flex flex-wrap gap-2">
              {ALL_CITY_SLUGS.map((slug) => (
                <Chip key={slug} href={localizeHref(`/locations/${slug}`, locale)} size="sm">
                  {LOCATIONS[slug].name}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9 · Quote */}
      <QuoteSection initialService={svc.quoteService} serviceName={svc.quoteService ? menu : undefined} locale={locale} />
    </div>
  )
}
