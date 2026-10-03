import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { RuleList } from '@/components/forge/cards'
import { FaqAccordion } from '@/components/forge/FaqAccordion'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass, type } from '@/components/forge/styles'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import { LANG_TAG, type Locale } from '@/i18n/config'
import { PBR_PAGE } from '@/i18n/pages/pbr-vs-pbu'
import { localizeHref } from '@/i18n/routes'
import { getSiteUrl } from '@/lib/site-url'

const section = 'py-[clamp(64px,7vw,104px)]'
const container = 'mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]'
/** Comparison table columns: attribute + PBR + PBU from sm up; attribute stacks above on phones. */
const tableCols = 'grid grid-cols-2 sm:grid-cols-[minmax(0,.8fr)_minmax(0,1fr)_minmax(0,1fr)]'

/** PBR vs PBU guide. Rendered by `/services/pbr-vs-pbu-panels` and `/es/servicios/paneles-pbr-vs-pbu`. */
export function PbrVsPbuPage({ locale }: { locale: Locale }) {
  const t = PBR_PAGE[locale]

  // The FAQPage node here was removed 2026-09-06 — Google retired the FAQ rich
  // result on 2026-05-07, so it earned nothing. The visible Q&A comparison below
  // is unchanged. A WebPage node replaces it so the page still joins the sitewide
  // @graph rather than shipping no structured data at all.
  const pageUrl = `${getSiteUrl()}${localizeHref('/services/pbr-vs-pbu-panels', locale)}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': pageUrl,
    url: pageUrl,
    name: t.jsonLd.name,
    description: t.jsonLd.description,
    isPartOf: { '@id': `${getSiteUrl()}/#website` },
    about: { '@id': `${getSiteUrl()}/#localbusiness` },
    inLanguage: LANG_TAG[locale],
  }

  return (
    <div data-forge="">
      <BreadcrumbJsonLd
        items={[
          { name: t.breadcrumbs.services, path: '/services' },
          { name: t.breadcrumbs.page, path: '/services/pbr-vs-pbu-panels' },
        ]}
        locale={locale}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* ── Hero ── */}
      <PageHero
        variant="plain"
        breadcrumb={
          <Breadcrumb
            trail={[{ name: t.breadcrumbs.services, href: '/services' }]}
            current={t.breadcrumbs.page}
            jsonLd={false}
            locale={locale}
          />
        }
        eyebrow={t.hero.eyebrow}
        h1a={t.hero.h1a}
        h1b={t.hero.h1b}
        contentMax="max-w-[860px]"
        lede={t.hero.lede}
        ledeMax="max-w-[640px]"
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              {t.hero.quote}
            </ForgeButtonLink>
            <TrackedPhoneLink surface="pbr_pbu_hero" className={buttonClass('outlineDark', 'lg')}>
              {t.hero.ask}&nbsp;
            </TrackedPhoneLink>
          </>
        }
      />

      {/* ── What each panel is ── */}
      <section data-forge="" data-tone="light" className={`bg-white text-forge-navy ${section}`}>
        <div className={container}>
          <SectionHeading align="center" line1={t.what.heading} />
          <ForgeReveal stagger className="mt-11 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* PBR */}
            <div className="flex flex-col rounded-[12px] border border-forge-silver bg-forge-fog p-[clamp(22px,2.5vw,32px)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 flex-none items-center justify-center rounded-[6px] bg-forge-navy font-forge-display text-[13px] font-bold text-white">
                  PBR
                </span>
                <h3 className="font-forge-display text-[22px] font-bold leading-[1.2] text-forge-navy">{t.what.pbr.title}</h3>
              </div>
              <p className={`mt-5 ${type.micro} text-forge-steel`}>
                {t.what.pbr.expansion}
              </p>
              <p className="mt-3 text-[15px] leading-[1.65] text-forge-slate [text-wrap:pretty]">
                {t.what.pbr.body}
              </p>
              <RuleList
                className="mt-6 border-t border-forge-mist pt-5"
                itemClassName="text-[15px] leading-[1.45] text-forge-navy"
                items={t.what.pbr.points}
              />
            </div>

            {/* PBU */}
            <div className="flex flex-col rounded-[12px] border border-forge-silver bg-forge-fog p-[clamp(22px,2.5vw,32px)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 flex-none items-center justify-center rounded-[6px] bg-forge-slate font-forge-display text-[13px] font-bold text-white">
                  PBU
                </span>
                <h3 className="font-forge-display text-[22px] font-bold leading-[1.2] text-forge-navy">{t.what.pbu.title}</h3>
              </div>
              <p className={`mt-5 ${type.micro} text-forge-steel`}>
                {t.what.pbu.expansion}
              </p>
              <p className="mt-3 text-[15px] leading-[1.65] text-forge-slate [text-wrap:pretty]">
                {t.what.pbu.body}
              </p>
              <RuleList
                className="mt-6 border-t border-forge-mist pt-5"
                itemClassName="text-[15px] leading-[1.45] text-forge-navy"
                items={t.what.pbu.points}
              />
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section
        data-forge=""
        data-tone="light"
        className={`border-t border-forge-mist bg-forge-fog text-forge-navy ${section}`}
      >
        <div className={container}>
          <ForgeReveal className="mx-auto max-w-[920px]">
            <SectionHeading line1={t.compare.heading} />
            <div className="mt-8 overflow-hidden rounded-[12px] border border-forge-silver bg-white">
              <div className={`${tableCols} bg-forge-navy ${type.micro}`}>
                <div className="hidden px-4 py-3.5 text-forge-steel-light sm:block">{t.compare.attribute}</div>
                <div className="px-4 py-3.5 text-white">{t.compare.pbr}</div>
                <div className="px-4 py-3.5 text-forge-silver">{t.compare.pbu}</div>
              </div>
              {t.compare.rows.map((row, i) => (
                <div
                  key={row.attribute}
                  className={`${tableCols} border-t border-forge-mist text-[14px] leading-[1.5] ${i % 2 === 0 ? 'bg-white' : 'bg-forge-fog'}`}
                >
                  <div className="col-span-2 px-4 pt-4 font-semibold text-forge-navy sm:col-span-1 sm:border-r sm:border-forge-mist sm:pb-4">
                    {row.attribute}
                  </div>
                  <div className="border-r border-forge-mist px-4 pt-1.5 pb-4 text-forge-slate sm:pt-4">
                    {row.pbr}
                  </div>
                  <div className="px-4 pt-1.5 pb-4 text-forge-slate sm:pt-4">
                    {row.pbu}
                  </div>
                </div>
              ))}
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Our recommendation ── */}
      <section data-forge="" data-tone="dark" className={`bg-forge-navy text-white ${section}`}>
        <div className={container}>
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading tone="dark" line1={t.recommend.line1} line2={t.recommend.line2} />
            <div className={`mt-6 space-y-5 text-white/80 ${type.lede}`}>
              <p>
                {t.recommend.p1.before}<strong className="text-white">{t.recommend.p1.strong}</strong>{t.recommend.p1.after}
              </p>
              <p>
                <strong className="text-white">{t.recommend.p2.strong}</strong>{t.recommend.p2.after}
              </p>
              <p>{t.recommend.p3}</p>
            </div>
            <div className="mt-8 rounded-[12px] border border-forge-silver/[.22] bg-forge-navy-raised p-6">
              <p className={`mb-2 ${type.micro} text-forge-silver`}>
                {t.recommend.steelLabel}
              </p>
              <p className="text-[15px] leading-[1.6] text-white/80">
                {t.recommend.steel}
              </p>
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section data-forge="" data-tone="light" className={`bg-white text-forge-navy ${section}`}>
        <div className={container}>
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading line1={t.faq.heading} />
            <div className="mt-8">
              <FaqAccordion faqs={t.faq.items} />
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Related links ── */}
      <section data-forge="" data-tone="light" className="border-t border-forge-mist bg-forge-fog py-8 text-forge-navy">
        <div className={`${container} flex flex-wrap items-center gap-x-6 gap-y-3.5`}>
          <p className={`${type.micro} text-forge-slate`}>
            {t.related.label}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {t.related.links.map((link) => (
              <ForgeButtonLink key={link.href} href={localizeHref(link.href, locale)} variant="linkAccent" size="tap">
                {link.label}
              </ForgeButtonLink>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote form ── */}
      <QuoteSection locale={locale} />
    </div>
  )
}
