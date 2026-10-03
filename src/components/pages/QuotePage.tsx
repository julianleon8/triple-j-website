import Image from 'next/image'
import Link from 'next/link'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { BuildGrid } from '@/components/forge/BuildGrid'
import { FeatureCard, RuleList } from '@/components/forge/cards'
import { Eyebrow } from '@/components/forge/Eyebrow'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass, type } from '@/components/forge/styles'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { PhoneIcon } from '@/components/ui/icons'
import { LANG_TAG, type Locale } from '@/i18n/config'
import { QUOTE } from '@/i18n/pages/quote'
import { localizeHref } from '@/i18n/routes'
import type { BuildItem } from '@/lib/forge-builds'
import type { ProjectReference } from '@/lib/project-reference'
import type { QuotePrefill } from '@/lib/quote-prefill'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

// The layout-mounted <OrganizationJsonLd /> already emits the LocalBusiness
// graph. This is a ContactPage node referencing it by @id — never a second
// business entity. See docs/SCHEMA-AUDIT.md.
function jsonLd(baseUrl: string, locale: Locale) {
  const t = QUOTE[locale].jsonLd
  const url = `${baseUrl}${localizeHref('/quote', locale)}`
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': url,
    url,
    name: t.name,
    description: t.description,
    isPartOf: { '@id': `${baseUrl}/#website` },
    about: { '@id': `${baseUrl}/#localbusiness` },
    inLanguage: LANG_TAG[locale],
  }
}

/**
 * /quote (English) and /es/cotizacion (Spanish). The route files read
 * `searchParams` and the Supabase project reference, and fetch the builds;
 * this renders what they hand it.
 *
 * How it works on /quote (Locked: the homepage dropped it, /quote keeps it).
 * The pre-Forge copy promised concrete on every job and a frame-day-one,
 * panels-day-two build — the retired 48-hour claim. Rewritten to the locks:
 * concrete available and priced separately; same-week scheduling once the
 * scope is settled. The response promise is the hero's line, not repeated.
 */
export function QuotePage({
  locale,
  prefill,
  reference,
  builds,
}: {
  locale: Locale
  prefill: QuotePrefill
  reference: ProjectReference | undefined
  /** Empty on the fencing variant (the route skips the fetch). */
  builds: readonly BuildItem[]
}) {
  const baseUrl = getSiteUrl()
  const t = QUOTE[locale]
  const isFencing = prefill.service === 'fencing' && !prefill.projectId

  const points = isFencing ? t.points.fencing : t.points.build

  return (
    <div data-forge="">
      <BreadcrumbJsonLd items={[{ name: t.hero.current, path: '/quote' }]} locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd(baseUrl, locale)).replace(/</g, '\\u003c'),
        }}
      />

      {/* Hero + form. This navy band is the ground the bare QuoteForm card
          (chrome={false}) sits on — do not lighten it without giving the card
          its own backdrop. */}
      <section data-forge="" data-tone="dark" className="relative overflow-hidden bg-forge-navy text-white">
        <Image
          src="/images/red-iron-frame-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: '50% 40%' }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'var(--scrim-hero-page)' }} />
        <div className="relative mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)] pt-[clamp(24px,3vw,40px)] pb-[clamp(56px,6vw,96px)]">
          <Breadcrumb trail={[]} current={t.hero.current} jsonLd={false} locale={locale} />
          <div className="mt-[clamp(28px,4vw,56px)] grid gap-[clamp(36px,4vw,64px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:items-start">
            {/* Form first in the DOM: on a phone, an ad visitor should land on
                the thing they came to do, not scroll past a pitch to reach it. */}
            <div id="quote" className="order-1 scroll-mt-24 lg:order-2">
              <QuoteForm
                chrome={false}
                source="quote_page"
                projectReference={reference}
                initialService={prefill.service}
                initialZip={prefill.zip}
              />
            </div>

            <div className="order-2 lg:sticky lg:top-[calc(var(--forge-header-h)_+_24px)] lg:order-1 lg:pt-4">
              <Eyebrow tone="dark">{t.hero.eyebrow}</Eyebrow>
              <h1 className={`mt-[18px] ${type.h1} text-white`}>
                {t.hero.h1a}
                <br />
                <span className="forge-steel-text">{isFencing ? t.hero.h1bFence : t.hero.h1bBuild}</span>
              </h1>
              <p className="mt-6 text-[clamp(18px,.5vw_+_15px,21px)] font-semibold text-white">
                {t.hero.promise}
              </p>
              <p className={`mt-2 max-w-[480px] ${type.heroLede} text-white/78`}>
                {t.hero.lede}
              </p>

              {/* Cold traffic off a Marketplace ad often just wants to call.
                  Equal weight to the form, and tracked so ?src= attribution and
                  the swapped number agree about the visit. */}
              <div className="mt-8">
                <TrackedPhoneLink surface="quote_page_hero" mode="children-only" className={buttonClass('outlineDark', 'lg')}>
                  <PhoneIcon className="h-5 w-5" />
                  {t.hero.call}<TrackedPhoneNumber className="tabular-nums" />
                </TrackedPhoneLink>
              </div>

              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-forge-silver/20 pt-6">
                {[
                  { k: t.hero.since, v: SITE.established },
                  { k: t.hero.projects, v: SITE.stats.projects },
                  { k: t.hero.clients, v: SITE.stats.clients },
                ].map((f) => (
                  <div key={f.k}>
                    <dt className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-steel-light">{f.k}</dt>
                    <dd className="mt-1.5 font-forge-display text-[28px] font-black leading-none tabular-nums text-white">{f.v}</dd>
                  </div>
                ))}
              </dl>

              <RuleList className="mt-8" itemClassName="text-[15px] text-white/80" items={points} />
            </div>
          </div>
        </div>
      </section>

      {isFencing ? (
        <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
          <ForgeReveal className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
            <SectionHeading
              eyebrow={t.fencing.eyebrow}
              line1={t.fencing.line1}
              line2={t.fencing.line2}
              ledeMax="max-w-[640px]"
              lede={t.fencing.lede}
            />
          </ForgeReveal>
        </section>
      ) : (
        <>
          <section
            aria-labelledby="how-heading"
            data-forge=""
            data-tone="light"
            className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy"
          >
            <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
              <ForgeReveal className="max-w-[760px]">
                <SectionHeading
                  headingId="how-heading"
                  eyebrow={t.how.eyebrow}
                  line1={t.how.line1}
                  line2={t.how.line2}
                  lede={t.how.lede}
                />
              </ForgeReveal>
              <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
                {t.how.steps.map((h, i) => (
                  <FeatureCard key={h.title} index={i} title={h.title}>
                    {h.body}
                  </FeatureCard>
                ))}
              </ForgeReveal>
            </div>
          </section>

          {builds.length >= 3 ? (
            <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
              <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
                <ForgeReveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                  <SectionHeading eyebrow={t.builds.eyebrow} line1={t.builds.line1} line2={t.builds.line2} className="max-w-[720px]" />
                  <Link href={localizeHref('/gallery', locale)} className="border-b border-forge-silver pb-0.5 text-[15px] font-semibold transition-colors hover:border-forge-navy">
                    {t.builds.gallery}
                  </Link>
                </ForgeReveal>
                <BuildGrid items={builds} />
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
