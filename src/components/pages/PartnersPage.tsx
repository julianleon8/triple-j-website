import Link from 'next/link'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { BuildGrid } from '@/components/forge/BuildGrid'
import { numeral } from '@/components/forge/cards'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass } from '@/components/forge/styles'
import { PartnerInquiryForm } from '@/components/sections/PartnerInquiryForm'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import type { Locale } from '@/i18n/config'
import { PARTNERS } from '@/i18n/pages/partners'
import { localizeHref } from '@/i18n/routes'
import type { BuildItem } from '@/lib/forge-builds'
import { SITE } from '@/lib/site'

/**
 * /partners (English) and /es/socios (Spanish). The route files fetch the
 * featured builds (the gallery's curated flag first, then sort order); the
 * inquiry form reads its language from the URL.
 */
export function PartnersPage({ locale, featured }: { locale: Locale; featured: readonly BuildItem[] }) {
  const t = PARTNERS[locale]
  const inlineLink =
    'border-b border-forge-silver font-semibold text-forge-navy transition-colors hover:border-forge-navy'

  return (
    <div data-forge="">
      <BreadcrumbJsonLd items={[{ name: t.hero.current, path: '/partners' }]} locale={locale} />

      {/* 1 · Hero */}
      <PageHero
        breadcrumb={<Breadcrumb trail={[{ name: t.hero.company }]} current={t.hero.current} jsonLd={false} locale={locale} />}
        image={{ src: '/images/double-carport-install.jpg', alt: t.hero.imgAlt }}
        contentMax="max-w-[820px]"
        ledeMax="max-w-[640px]"
        eyebrow={t.hero.eyebrow}
        h1a={t.hero.h1a}
        h1b={t.hero.h1b}
        lede={t.hero.lede}
        actions={
          <>
            <ForgeButtonLink href="#inquire" variant="white" size="lg" arrow>
              {t.hero.inquiry}
            </ForgeButtonLink>
            <TrackedPhoneLink surface="partners_hero" mode="children-only" className={buttonClass('outlineDark', 'lg')}>
              {t.hero.call}<TrackedPhoneNumber className="tabular-nums" />
            </TrackedPhoneLink>
          </>
        }
        facts={[
          // The design's "2 in-house welders" line, with named welders, is not
          // supported by the vault (D18); the locked zero-subcontractors fact
          // stands in.
          { k: t.hero.facts.crew, v: t.hero.facts.crewValue, s: t.hero.facts.crewSub },
          { k: t.hero.facts.track, v: t.hero.facts.trackValue(SITE.stats.projects), s: t.hero.facts.trackSub },
          { k: t.hero.facts.mobilization, v: t.hero.facts.mobilizationValue, s: t.hero.facts.mobilizationSub },
          { k: t.hero.facts.hq, v: t.hero.facts.hqValue, s: t.hero.facts.hqSub },
        ]}
      />

      {/* 2 · What we offer partners */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[780px]">
            <SectionHeading
              eyebrow={t.offer.eyebrow}
              line1={t.offer.line1}
              balance
              lede={t.offer.lede}
              ledeMax="max-w-[640px]"
            />
          </ForgeReveal>
          <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-4">
            {t.offer.items.map((o, i) => (
              <div key={o.title} className="rounded-[12px] border border-forge-silver bg-forge-fog px-[26px] pt-[26px] pb-7">
                <span className="font-forge-display text-[14px] font-bold text-forge-steel">{numeral(i)}</span>
                <h3 className="mt-3 font-forge-display text-[21px] font-bold text-forge-navy">{o.title}</h3>
                <p className="mt-2.5 text-[15px] leading-[1.65] text-forge-slate">{o.body}</p>
              </div>
            ))}
          </ForgeReveal>
        </div>
      </section>

      {/* 3 · Featured builds */}
      {featured.length ? (
        <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
          <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
              <SectionHeading eyebrow={t.featured.eyebrow} line1={t.featured.line1} />
              <Link href={localizeHref('/gallery', locale)} className="border-b border-forge-silver pb-0.5 text-[15px] font-semibold transition-colors hover:border-forge-navy">
                {t.featured.gallery}
              </Link>
            </div>
            <BuildGrid items={featured} className="mt-9 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4" />
          </div>
        </section>
      ) : null}

      {/* 4 · Inquiry */}
      <section id="inquire" data-forge="" data-tone="light" className="scroll-mt-20 bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-start gap-[clamp(32px,4vw,80px)] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal>
            <SectionHeading
              eyebrow={t.inquire.eyebrow}
              line1={t.inquire.line1}
              line2={t.inquire.line2}
              lede={t.inquire.lede}
              ledeMax="max-w-[520px]"
            />
            <div data-tone="dark" className="mt-7 rounded-[12px] bg-forge-navy px-6 py-[22px] text-white">
              <p className="font-forge-display text-[19px] font-bold">{t.inquire.skipTitle}</p>
              <p className="mt-1.5 text-[14px] text-white/75">{t.inquire.skipBody}</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <TrackedPhoneLink surface="partners_inquiry" className={buttonClass('white', 'tap', false, 'tabular-nums')} />
                <a href={SITE.emailHref} className={buttonClass('outlineDark', 'tap')}>
                  {t.inquire.email}
                </a>
              </div>
            </div>
            <p className="mt-5 max-w-[520px] text-[14px] leading-[1.6] text-forge-slate">
              {t.inquire.newIntro}
              <Link href={localizeHref('/services', locale)} className={inlineLink}>
                {t.inquire.services}
              </Link>
              {t.inquire.sepA}
              <Link href={localizeHref('/locations', locale)} className={inlineLink}>
                {t.inquire.locations}
              </Link>
              {t.inquire.sepB}
              <Link href={localizeHref('/about', locale)} className={inlineLink}>
                {t.inquire.about}
              </Link>
              {t.inquire.end}
            </p>
          </ForgeReveal>
          <PartnerInquiryForm />
        </div>
      </section>
    </div>
  )
}
