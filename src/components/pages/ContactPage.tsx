import Link from 'next/link'
import type { ReactNode } from 'react'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { Chip } from '@/components/forge/Chip'
import { Eyebrow } from '@/components/forge/Eyebrow'
import { MessageForm } from '@/components/forge/MessageForm'
import { MapBand } from '@/components/forge/misc'
import { PageHero } from '@/components/forge/PageHero'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from '@/components/ui/icons'
import { LANG_TAG, type Locale } from '@/i18n/config'
import { CONTACT, contactHours } from '@/i18n/pages/contact'
import { localizeHref } from '@/i18n/routes'
import { ALL_CITY_SLUGS } from '@/lib/city-links'
import { LOCATIONS } from '@/lib/locations'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

// Layout-mounted <OrganizationJsonLd /> already emits the comprehensive
// LocalBusiness graph on every marketing page. Per-page schema here is
// a ContactPage node referencing the canonical LocalBusiness via @id —
// no duplicate business entity. See docs/SCHEMA-AUDIT.md.
function jsonLd(baseUrl: string, locale: Locale) {
  const t = CONTACT[locale].jsonLd
  const url = `${baseUrl}${localizeHref('/contact', locale)}`
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

function ReachRow({
  icon,
  dark = false,
  label,
  value,
  sub,
}: {
  icon: ReactNode
  dark?: boolean
  label: string
  value: ReactNode
  sub?: string
}) {
  return (
    <>
      <span
        className={`inline-flex size-11 flex-none items-center justify-center rounded-[8px] ${
          dark ? 'bg-forge-navy text-white' : 'bg-forge-mist text-forge-navy'
        }`}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate">{label}</span>
        {value}
        {sub ? <span className="text-[14px] text-forge-slate">{sub}</span> : null}
      </span>
    </>
  )
}

const rowCls = 'flex items-start gap-4 border-b border-forge-mist py-[22px]'
const linkRowCls = `${rowCls} transition-colors duration-200 hover:bg-forge-fog`

const MAP_QUERY = encodeURIComponent(SITE.addressOneLine).replace(/%20/g, '+')

/** /contact (English) and /es/contacto (Spanish). The message form reads the language from the URL. */
export function ContactPage({ locale }: { locale: Locale }) {
  const baseUrl = getSiteUrl()
  const t = CONTACT[locale]
  return (
    <div data-forge="">
      <BreadcrumbJsonLd items={[{ name: t.hero.current, path: '/contact' }]} locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(baseUrl, locale)).replace(/</g, '\\u003c') }}
      />

      {/* 1 · Header (navy band) */}
      <PageHero
        variant="plain"
        contentMax="max-w-[800px]"
        breadcrumb={<Breadcrumb trail={[{ name: t.hero.company }]} current={t.hero.current} jsonLd={false} locale={locale} />}
        eyebrow={t.hero.eyebrow}
        h1a={t.hero.h1a}
        h1b={t.hero.h1b}
        lede={t.hero.lede}
      />

      {/* 2 · Reach us */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(56px,6vw,96px)] text-forge-navy">
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(32px,4vw,80px)] px-[clamp(20px,3vw,40px)]">
          <div>
            <Eyebrow>{t.reach.eyebrow}</Eyebrow>
            <div className="mt-6 flex flex-col border-t border-forge-mist">
              <TrackedPhoneLink surface="contact_reach" mode="children-only" className={linkRowCls}>
                <ReachRow
                  dark
                  icon={<PhoneIcon width={20} height={20} aria-hidden="true" />}
                  label={t.reach.phoneLabel}
                  value={
                    <TrackedPhoneNumber className="font-forge-display text-[clamp(26px,1.4vw_+_16px,34px)] font-black tabular-nums text-forge-navy" />
                  }
                  sub={t.reach.phoneSub}
                />
              </TrackedPhoneLink>
              <div className={rowCls}>
                {/* "Emergency quotes" subline dropped: nothing in the vault supports it (D18). */}
                <ReachRow
                  icon={<ClockIcon width={20} height={20} aria-hidden="true" />}
                  label={t.reach.hoursLabel}
                  value={<span className="text-[17px] font-semibold">{contactHours(locale)}</span>}
                />
              </div>
              <div className={rowCls}>
                <ReachRow
                  icon={<PinIcon width={20} height={20} aria-hidden="true" />}
                  label={t.reach.shopLabel}
                  value={<span className="text-[17px] font-semibold">{SITE.addressOneLine}</span>}
                  sub={t.reach.shopSub}
                />
              </div>
              <a href={SITE.emailHref} className={linkRowCls}>
                <ReachRow
                  icon={<MailIcon width={20} height={20} aria-hidden="true" />}
                  label={t.reach.emailLabel}
                  value={<span className="text-[17px] font-semibold [overflow-wrap:anywhere]">{SITE.email}</span>}
                />
              </a>
            </div>
            <div className="mt-7 rounded-[12px] border border-forge-silver bg-forge-fog p-5">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate">{t.area.label}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ALL_CITY_SLUGS.map((slug) => (
                  <Chip key={slug} size="sm" href={localizeHref(`/locations/${slug}`, locale)}>
                    {LOCATIONS[slug].name} →
                  </Chip>
                ))}
              </div>
              <p className="mt-3 text-[13px] text-forge-slate">{t.area.note}</p>
              <p className="mt-3 text-[13px] text-forge-slate">
                {t.area.partnerQuestion}{' '}
                <Link href={localizeHref('/partners', locale)} className="border-b border-forge-silver font-semibold text-forge-navy transition-colors hover:border-forge-navy">
                  {t.area.partnerLink}
                </Link>
                .
              </p>
            </div>
          </div>
          <MessageForm />
        </div>
      </section>

      {/* 3 · Map */}
      <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(48px,5vw,80px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <MapBand
            src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed${locale === 'es' ? '&hl=es' : ''}`}
            title={`${SITE.name} — ${SITE.addressOneLine}`}
            callout={
              <>
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-steel-light">{t.map.callout}</p>
                <p className="mt-1.5 font-forge-display text-[18px] font-bold">
                  {SITE.address.street}, {SITE.address.city}
                </p>
                <Link
                  href={`https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}${locale === 'es' ? '&hl=es' : ''}`}
                  target="_blank"
                  rel="noopener"
                  className="mt-2 inline-block text-[14px] font-semibold text-forge-silver transition-colors hover:text-white"
                >
                  {t.map.directions}
                </Link>
              </>
            }
          />
        </div>
      </section>
    </div>
  )
}
