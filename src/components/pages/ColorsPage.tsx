import Image from 'next/image'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass, type } from '@/components/forge/styles'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import type { Locale } from '@/i18n/config'
import { COLORS_PAGE } from '@/i18n/pages/colors'
import { localizeHref } from '@/i18n/routes'
import { TURNIUM_COLORS, SHEFFIELD_COLORS, getSwatchUrl, type PanelColor } from '@/lib/colors'

const section = 'py-[clamp(64px,7vw,104px)]'
const container = 'mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]'
const swatchGrid = 'mt-10 grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7'

/** Swatch badges — Forge tags; the swatch image itself carries the real panel colour. */
const bestValueTag =
  'rounded-[4px] bg-forge-navy px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[.12em] text-white'
const hoaTag =
  'rounded-[4px] border border-forge-silver bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[.12em] text-forge-navy'

function ColorCard({ color, locale }: { color: PanelColor; locale: Locale }) {
  const t = COLORS_PAGE[locale]
  const swatchUrl = getSwatchUrl(color)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-[12px] border border-forge-silver bg-forge-mist">
        <Image
          src={swatchUrl}
          alt={t.swatchAlt(color.name)}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover"
        />
        {color.mostEconomical && (
          <span className={`absolute top-2 left-2 ${bestValueTag}`}>
            {t.bestValue}
          </span>
        )}
        {color.hoaFriendly && (
          <span className={`absolute top-2 right-2 ${hoaTag}`}>
            {t.hoa}
          </span>
        )}
      </div>
      <div className="text-center leading-tight">
        {/* The color name is the manufacturer's catalog name — English in both languages. */}
        <div className="text-[13px] font-semibold text-forge-navy">{color.name}</div>
        {color.mostEconomical && (
          <div className="mt-0.5 text-[11px] font-semibold text-forge-slate">
            {t.cheapest}
          </div>
        )}
      </div>
    </div>
  )
}

/** Panel colors and finishes. Rendered by `/services/colors` and `/es/servicios/colores`. */
export function ColorsPage({ locale }: { locale: Locale }) {
  const t = COLORS_PAGE[locale]
  const standardLabel = t.lines.standard.label
  const premiumLabel = t.lines.premium.label

  return (
    <div data-forge="">
      <BreadcrumbJsonLd
        items={[
          { name: t.breadcrumbs.services, path: '/services' },
          { name: t.breadcrumbs.colors, path: '/services/colors' },
        ]}
        locale={locale}
      />
      {/* ── Hero ── */}
      <PageHero
        variant="plain"
        breadcrumb={
          <Breadcrumb
            trail={[{ name: t.breadcrumbs.services, href: '/services' }]}
            current={t.breadcrumbs.colors}
            jsonLd={false}
            locale={locale}
          />
        }
        eyebrow={t.hero.eyebrow}
        h1a={t.hero.h1}
        lede={t.hero.lede}
        ledeMax="max-w-[640px]"
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              {t.hero.quote}
            </ForgeButtonLink>
            <TrackedPhoneLink surface="colors_hero" className={buttonClass('outlineDark', 'lg')}>
              {t.hero.call}&nbsp;
            </TrackedPhoneLink>
          </>
        }
      />

      {/* ── Finish overview ── */}
      <section
        data-forge=""
        data-tone="dark"
        aria-label={t.overview.aria}
        className="border-t border-forge-silver/15 bg-forge-navy-raised text-white"
      >
        <div className={`${container} grid grid-cols-2 md:grid-cols-4`}>
          {t.overview.stats.map(({ stat, label }) => (
            <div key={label} className="border-l border-forge-silver/[.18] px-[18px] pt-[18px] pb-5">
              <div className="font-forge-display text-[clamp(18px,.6vw_+_14px,22px)] font-bold leading-[1.2] text-white">
                {stat}
              </div>
              <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-[.2em] text-forge-steel-light">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Standard Line ── */}
      <section data-forge="" data-tone="light" className={`bg-white text-forge-navy ${section}`}>
        <div className={container}>
          <SectionHeading
            eyebrow={t.lines.standard.eyebrow}
            line1={standardLabel}
            line2={t.count(TURNIUM_COLORS.length)}
            ledeMax="max-w-[640px]"
            lede={t.lines.standard.lede(t.lines.standard.sub)}
          />
          <div className={swatchGrid}>
            {TURNIUM_COLORS.map((color) => (
              <ColorCard key={`standard-${color.slug}`} color={color} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Premium Line ── */}
      <section
        data-forge=""
        data-tone="light"
        className={`border-t border-forge-mist bg-forge-fog text-forge-navy ${section}`}
      >
        <div className={container}>
          <SectionHeading
            eyebrow={t.lines.premium.eyebrow}
            line1={premiumLabel}
            line2={t.count(SHEFFIELD_COLORS.length)}
            ledeMax="max-w-[640px]"
            lede={t.lines.premium.lede(t.lines.premium.sub)}
          />
          <div className={swatchGrid}>
            {SHEFFIELD_COLORS.map((color) => (
              <ColorCard key={`premium-${color.slug}`} color={color} locale={locale} />
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-2.5 border-t border-forge-mist pt-5 text-[13px] text-forge-slate sm:flex-row sm:items-center sm:gap-6">
            <span className="inline-flex items-center gap-2">
              <span className={hoaTag}>{t.hoa}</span>
              {t.legend.hoa}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className={bestValueTag}>{t.bestValue}</span>
              {t.legend.bestValue}
            </span>
          </div>
        </div>
      </section>

      {/* ── About the finish system ── */}
      <section data-forge="" data-tone="dark" className={`bg-forge-navy text-white ${section}`}>
        <div className={container}>
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading tone="dark" line1={t.about.heading} />
            <div className={`mt-6 space-y-5 text-white/80 ${type.lede}`}>
              <p>{t.about.p1}</p>
              <p>{t.about.p2(standardLabel.toLowerCase(), premiumLabel.toLowerCase())}</p>
            </div>
            <div className="mt-8 rounded-[12px] border border-forge-silver/[.22] bg-forge-navy-raised p-5 text-[14px] leading-[1.6] text-white/80">
              <strong className="text-white">{t.about.noteLabel}</strong> {t.about.note}
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Related links ── */}
      <section data-forge="" data-tone="light" className="bg-white py-8 text-forge-navy">
        <div className={`${container} flex flex-wrap items-center gap-x-6 gap-y-3.5`}>
          <p className={`${type.micro} text-forge-slate`}>
            {t.related.label}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <ForgeButtonLink href={localizeHref('/services/pbr-vs-pbu-panels', locale)} variant="linkAccent" size="tap">
              {t.related.pbrPbu}
            </ForgeButtonLink>
            <ForgeButtonLink href={localizeHref('/services', locale)} variant="linkAccent" size="tap">
              {t.related.services}
            </ForgeButtonLink>
            <ForgeButtonLink href={localizeHref('/gallery', locale)} variant="linkAccent" size="tap">
              {t.related.gallery}
            </ForgeButtonLink>
          </div>
        </div>
      </section>

      {/* ── Quote form ── */}
      <QuoteSection locale={locale} />
    </div>
  )
}
