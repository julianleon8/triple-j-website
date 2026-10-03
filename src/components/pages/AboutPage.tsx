import Image from 'next/image'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { FeatureCard, NumberedRow, RuleList } from '@/components/forge/cards'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { LANG_TAG, type Locale } from '@/i18n/config'
import { ABOUT } from '@/i18n/pages/about'
import { localizeHref } from '@/i18n/routes'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

// Layout-mounted <OrganizationJsonLd /> already emits the comprehensive
// LocalBusiness + Organization graph on every marketing page. Per-page
// schema here is a focused AboutPage WebPage node referencing the
// canonical Organization via @id — no duplicate LocalBusiness.
function jsonLd(baseUrl: string, locale: Locale) {
  const t = ABOUT[locale].jsonLd
  const url = `${baseUrl}${localizeHref('/about', locale)}`
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': url,
    url,
    name: t.name,
    description: t.description,
    isPartOf: { '@id': `${baseUrl}/#website` },
    about: { '@id': `${baseUrl}/#organization` },
    inLanguage: LANG_TAG[locale],
  }
}

/** /about (English) and /es/nosotros (Spanish). */
export function AboutPage({ locale }: { locale: Locale }) {
  const baseUrl = getSiteUrl()
  const t = ABOUT[locale]
  return (
    <div data-forge="">
      <BreadcrumbJsonLd items={[{ name: t.hero.current, path: '/about' }]} locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(baseUrl, locale)).replace(/</g, '\\u003c') }}
      />

      {/* 1 · Hero */}
      <PageHero
        breadcrumb={<Breadcrumb trail={[{ name: t.hero.company }]} current={t.hero.current} jsonLd={false} locale={locale} />}
        image={{
          src: '/images/red-iron-frame-hero.jpg',
          alt: t.hero.imgAlt,
          position: '50% 40%',
        }}
        contentMax="max-w-[800px]"
        eyebrow={t.hero.eyebrow}
        h1a={t.hero.h1a}
        h1b={t.hero.h1b}
        lede={t.hero.lede}
        facts={[
          { k: t.hero.facts.projects, v: t.hero.facts.projectsValue(SITE.stats.projects) },
          { k: t.hero.facts.onSite, v: t.hero.facts.onSiteValue },
          { k: t.hero.facts.afterApproval, v: t.hero.facts.afterApprovalValue },
          { k: t.hero.facts.founded, v: t.hero.facts.foundedValue(SITE.established) },
        ]}
      />

      {/* 2 · Crew */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-stretch gap-[clamp(32px,4vw,80px)] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="relative min-h-[380px] overflow-hidden rounded-[12px] bg-forge-slate">
            <Image
              src="/images/carport-truck-concrete-hero.jpg"
              alt={t.crew.imgAlt}
              fill
              sizes="(min-width: 900px) 640px, 100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-x-0 bottom-0 px-6 pt-16 pb-[22px] text-[15px] text-white"
              style={{ background: 'var(--scrim-caption)' }}
            >
              {t.crew.caption}
            </div>
          </ForgeReveal>
          <ForgeReveal>
            <SectionHeading
              eyebrow={t.crew.eyebrow}
              line1={t.crew.line1}
              line2={t.crew.line2}
              lede={t.crew.lede}
              ledeMax="max-w-[540px]"
            />
            <div className="mt-7 border-t border-forge-mist">
              {t.crew.people.map((c) => (
                <div key={c.title} className="border-b border-forge-mist py-5">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 className="m-0 font-forge-display text-[24px] font-bold text-forge-navy">{c.title}</h3>
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
                {t.crew.talk}<TrackedPhoneNumber className="tabular-nums" />
              </TrackedPhoneLink>
              <span className="text-forge-slate">{t.crew.languages}</span>
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* 3 · What sets us apart */}
      <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading eyebrow={t.apart.eyebrow} line1={t.apart.line1} line2={t.apart.line2} />
          </ForgeReveal>
          <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
            {t.apart.items.map((a, i) => (
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
            <SectionHeading eyebrow={t.materials.eyebrow} line1={t.materials.line1} line2={t.materials.line2} />
            <p className="mt-[18px] max-w-[580px] text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate">
              {t.materials.body}
            </p>
            <RuleList className="mt-[26px]" itemClassName="text-[15px] text-forge-navy" items={t.materials.rules} />
          </ForgeReveal>
          <ForgeReveal className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-forge-silver bg-forge-slate">
            <Image
              src="/images/carport-residential-completed.jpg"
              alt={t.materials.imgAlt}
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
            <SectionHeading tone="dark" eyebrow={t.how.eyebrow} line1={t.how.line1} line2={t.how.line2} />
          </ForgeReveal>
          <ForgeReveal className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-x-[clamp(32px,4vw,72px)] border-t border-forge-silver/[.18]">
            {t.how.items.map((h, i) => (
              <NumberedRow key={h.title} index={i} title={h.title}>
                {h.body}
              </NumberedRow>
            ))}
          </ForgeReveal>
        </div>
      </section>

      {/* 6 · Where to next */}
      <section data-forge="" data-tone="light" className="border-t border-forge-mist bg-forge-fog py-8 text-forge-navy">
        <div className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center gap-x-6 gap-y-3.5 px-[clamp(20px,3vw,40px)]">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate">{t.next.label}</p>
          <div className="flex flex-wrap gap-2.5">
            {t.next.links.map((r) => (
              <ForgeButtonLink key={r.href} href={localizeHref(r.href, locale)} variant="linkAccent" size="tap">
                {r.label} →
              </ForgeButtonLink>
            ))}
          </div>
        </div>
      </section>

      {/* 7 · Quote */}
      <QuoteSection locale={locale} />
    </div>
  )
}
