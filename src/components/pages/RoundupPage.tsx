import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { numeral } from '@/components/forge/cards'
import { buttonClass } from '@/components/forge/styles'
import { ComparisonTable } from '@/components/sections/ComparisonTable'
import { AuthorByline } from '@/components/sections/AuthorByline'
import { RelatedComparisons } from '@/components/sections/RelatedComparisons'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import { LANG_TAG, type Locale } from '@/i18n/config'
import { ROUNDUP } from '@/i18n/pages/roundup'
import { localizeHref } from '@/i18n/routes'
import { COMPETITORS, LOCAL_ROUNDUP_SLUGS } from '@/lib/competitors'
import { getCompetitor, localRoundupComparisonRows } from '@/lib/competitors.es'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

/**
 * /best-metal-carport-builders-temple-tx (English) and
 * /es/mejores-constructores-de-cocheras-temple-tx (Spanish). Copy:
 * src/i18n/pages/roundup.ts. Competitor facts and rows: src/lib/competitors.ts
 * (facts + English) and competitors.es.ts (Spanish). Competitor names, URLs and
 * dates are the same in both languages.
 */
export function RoundupPage({ locale }: { locale: Locale }) {
  const t = ROUNDUP[locale]
  const baseUrl = getSiteUrl()
  const pageUrl = `${baseUrl}${localizeHref('/best-metal-carport-builders-temple-tx', locale)}`
  const builders = LOCAL_ROUNDUP_SLUGS.map((s) => getCompetitor(s, locale))

  // Per-page @graph: WebPage + ItemList for the roundup. Triple J at
  // position 1, the 5 local competitors at 2-6 with their public URLs
  // cited. Honest ordering — we put ourselves first because it's our site,
  // not because we're claiming to be objectively #1.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: t.jsonLd.name,
        description: t.jsonLd.description,
        isPartOf: { '@id': `${baseUrl}/#website` },
        about: { '@id': `${baseUrl}/#localbusiness` },
        inLanguage: LANG_TAG[locale],
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#roundup`,
        name: t.jsonLd.listName,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: builders.length,
        itemListElement: builders.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'LocalBusiness',
            name: c.name,
            description: c.oneLiner,
            url: c.homeUrl,
            address: {
              '@type': 'PostalAddress',
              addressRegion: 'TX',
              addressCountry: 'US',
            },
          },
        })),
      },
    ],
  }

  return (
    <div data-forge="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: t.jsonLd.breadcrumb, path: '/best-metal-carport-builders-temple-tx' },
        ]}
        locale={locale}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <PageHero
        variant="plain"
        breadcrumb={<Breadcrumb trail={[]} current={t.hero.crumb} jsonLd={false} locale={locale} />}
        contentMax="w-full max-w-[920px]"
        eyebrow={t.hero.eyebrow}
        h1a={t.hero.h1}
        lede={t.hero.lede}
        ledeMax="max-w-[680px]"
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              {t.hero.cta}
            </ForgeButtonLink>
            <TrackedPhoneLink
              surface="best_builders_roundup_hero"
              className={buttonClass('outlineDark', 'lg')}
            >
              {t.hero.call}
            </TrackedPhoneLink>
          </>
        }
        after={<AuthorByline asOf={COMPETITORS['triple-j-metal'].asOf} locale={locale} />}
      />

      {/* ── Disclosure ──────────────────────────────────────────────── */}
      <section
        data-forge=""
        data-tone="light"
        className="border-b border-forge-mist bg-forge-fog py-[clamp(36px,4vw,56px)] text-forge-navy"
      >
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <p className="m-0 max-w-[820px] border-l-2 border-forge-navy pl-[clamp(18px,2vw,28px)] text-[15px] leading-[1.65] text-forge-slate [text-wrap:pretty]">
            <strong className="font-semibold text-forge-navy">{t.disclosure.lead}</strong>{' '}{t.disclosure.body}
          </p>
        </div>
      </section>

      {/* ── Why this list exists ──────────────────────────────────── */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading line1={t.why.heading} size="compact" balance />
            <p className="mt-5 text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate [text-wrap:pretty]">
              {t.why.p1}
            </p>
            <p className="mt-4 text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate [text-wrap:pretty]">
              {t.why.p2}
            </p>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Builder profiles ─────────────────────────────────────────── */}
      <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <SectionHeading line1={t.profiles.heading} size="compact" />
          <ol className="mt-9 flex list-none flex-col gap-4 p-0">
            {builders.map((c, i) => {
              const isSelf = c.type === 'self'
              return (
                <li
                  key={c.slug}
                  data-tone={isSelf ? 'dark' : undefined}
                  className={`rounded-[12px] border p-[clamp(20px,2.2vw,28px)] ${
                    isSelf
                      ? 'border-forge-navy bg-forge-navy text-white'
                      : 'border-forge-silver bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-forge-display text-[15px] font-bold ${
                        isSelf
                          ? 'border-white bg-white text-forge-navy'
                          : 'border-forge-silver bg-forge-fog text-forge-navy'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                        <h3
                          className={`m-0 font-forge-display text-[clamp(19px,.4vw_+_16px,22px)] font-bold leading-[1.2] ${
                            isSelf ? 'text-white' : 'text-forge-navy'
                          }`}
                        >
                          {c.name}
                        </h3>
                        {isSelf && (
                          <span className="rounded-full border border-forge-silver/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[.16em] text-forge-silver">
                            {t.profiles.self}
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-2 text-[15px] leading-[1.6] [text-wrap:pretty] ${
                          isSelf ? 'text-white/86' : 'text-forge-slate'
                        }`}
                      >
                        {c.oneLiner}
                      </p>
                      <p className={`mt-3 text-[13px] ${isSelf ? 'text-forge-steel-light' : 'text-forge-slate'}`}>
                        {t.profiles.coverage} {c.coverage} ·{' '}
                        <a
                          href={c.homeUrl}
                          target="_blank"
                          rel="nofollow noopener"
                          className={`border-b font-semibold transition-colors ${
                            isSelf
                              ? 'border-white/40 text-white hover:border-white'
                              : 'border-forge-silver text-forge-navy hover:border-forge-navy'
                          }`}
                        >
                          {isSelf ? t.profiles.ourSite : t.profiles.listing}
                        </a>
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ── Comparison table ─────────────────────────────────────────── */}
      <ComparisonTable
        competitorSlugs={LOCAL_ROUNDUP_SLUGS}
        rows={localRoundupComparisonRows(locale)}
        eyebrow={t.table.eyebrow}
        heading={t.table.heading}
        subheading={t.table.subheading}
        locale={locale}
      />

      {/* ── How to choose ────────────────────────────────────────────── */}
      <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading line1={t.choose.heading} size="compact" />
            <p className="mt-5 text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate [text-wrap:pretty]">
              {t.choose.intro}
            </p>
            <ul className="mt-7 list-none border-t border-forge-silver p-0 text-[15px] leading-[1.6] text-forge-slate">
              {t.choose.items.map((item, i) => (
                <li key={i} className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 border-b border-forge-silver py-5">
                  <span aria-hidden="true" className="pt-0.5 font-forge-display text-[15px] font-bold text-forge-steel">
                    {numeral(i)}
                  </span>
                  <span className="[text-wrap:pretty]">
                    <strong className="font-semibold text-forge-navy">{item.lead}</strong> {item.body}
                  </span>
                </li>
              ))}
            </ul>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Why pick Triple J Metal (navy band) ─────────────────────── */}
      <section data-forge="" data-tone="dark" className="bg-forge-navy py-[clamp(64px,7vw,104px)] text-white">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading tone="dark" eyebrow={t.pick.eyebrow} line1={t.pick.heading} size="compact" />
            <ul className="mt-8 flex list-none flex-col gap-3.5 p-0 text-[16px] leading-[1.6] text-white/86">
              {[...t.pick.items, t.pick.phone(SITE.phone)].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-px shrink-0 font-bold text-forge-steel-light">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow className="mt-9 max-w-full whitespace-normal! text-center">
              {t.pick.cta(SITE.name)}
            </ForgeButtonLink>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Related comparisons cluster ──────────────────────────────── */}
      <RelatedComparisons currentSlug="roundup" locale={locale} />

      {/* ── Quote form ───────────────────────────────────────────────── */}
      <QuoteSection locale={locale} />
    </div>
  )
}
