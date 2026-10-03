import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { Chip } from '@/components/forge/Chip'
import { Eyebrow } from '@/components/forge/Eyebrow'
import { MessageForm } from '@/components/forge/MessageForm'
import { MapBand } from '@/components/forge/misc'
import { PageHero } from '@/components/forge/PageHero'
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from '@/components/ui/icons'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { SERVICE_CITIES, SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Contact | Temple, TX | Free Quote',
  description:
    `Call ${SITE.phone} for a same-day callback. Temple-based metal building crew — carports, garages, barns, and RV covers across Central Texas.`,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Triple J Metal | Temple, TX',
    description: `Call ${SITE.phone} for a same-day callback. Temple-based metal building contractor.`,
    type: 'website',
  },
}

// Layout-mounted <OrganizationJsonLd /> already emits the comprehensive
// LocalBusiness graph on every marketing page. Per-page schema here is
// a ContactPage node referencing the canonical LocalBusiness via @id —
// no duplicate business entity. See docs/SCHEMA-AUDIT.md.
function jsonLd(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${baseUrl}/contact`,
    url: `${baseUrl}/contact`,
    name: `Contact ${SITE.name}`,
    description:
      'Reach Triple J Metal — Temple, TX metal building contractor. Phone, email, and free quote form for Central Texas customers.',
    isPartOf: { '@id': `${baseUrl}/#website` },
    about: { '@id': `${baseUrl}/#localbusiness` },
    inLanguage: 'en-US',
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

// Linked chips: the cities with a Forge page. The rest are plain chips.
const LINKED_CITIES = ['temple', 'belton']
const MAP_QUERY = encodeURIComponent(SITE.addressOneLine).replace(/%20/g, '+')

export default function ContactPage() {
  const baseUrl = getSiteUrl()
  const plainCities = [
    ...SERVICE_CITIES.filter((c) => !LINKED_CITIES.includes(c.slug)).map((c) => c.name.replace(/, TX$/, '')),
    'Salado',
    'Lampasas',
  ]
  return (
    <div data-forge="">
      <BreadcrumbJsonLd items={[{ name: 'Contact', path: '/contact' }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(baseUrl)).replace(/</g, '\\u003c') }}
      />

      {/* 1 · Header (navy band) */}
      <PageHero
        variant="plain"
        contentMax="max-w-[800px]"
        breadcrumb={<Breadcrumb trail={[{ name: 'Company' }]} current="Contact" jsonLd={false} />}
        eyebrow="Contact us"
        h1a="Get in touch."
        h1b="We call back same day."
        lede="A question about your project, or ready for a quote? Call us directly or send a message. A real person from our Temple crew picks up — or calls you back the same day."
      />

      {/* 2 · Reach us */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(56px,6vw,96px)] text-forge-navy">
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(32px,4vw,80px)] px-[clamp(20px,3vw,40px)]">
          <div>
            <Eyebrow>Reach us directly</Eyebrow>
            <div className="mt-6 flex flex-col border-t border-forge-mist">
              <TrackedPhoneLink surface="contact_reach" mode="children-only" className={linkRowCls}>
                <ReachRow
                  dark
                  icon={<PhoneIcon width={20} height={20} aria-hidden="true" />}
                  label="Phone · English & Español"
                  value={
                    <TrackedPhoneNumber className="font-forge-display text-[clamp(26px,1.4vw_+_16px,34px)] font-black tabular-nums text-forge-navy" />
                  }
                  sub="Same-day callback"
                />
              </TrackedPhoneLink>
              <div className={rowCls}>
                {/* "Emergency quotes" subline dropped: nothing in the vault supports it (D18). */}
                <ReachRow
                  icon={<ClockIcon width={20} height={20} aria-hidden="true" />}
                  label="Hours"
                  value={<span className="text-[17px] font-semibold">{SITE.hours}</span>}
                />
              </div>
              <div className={rowCls}>
                <ReachRow
                  icon={<PinIcon width={20} height={20} aria-hidden="true" />}
                  label="Shop"
                  value={<span className="text-[17px] font-semibold">{SITE.addressOneLine}</span>}
                  sub="Serving all of Central Texas"
                />
              </div>
              <a href={SITE.emailHref} className={linkRowCls}>
                <ReachRow
                  icon={<MailIcon width={20} height={20} aria-hidden="true" />}
                  label="Email"
                  value={<span className="text-[17px] font-semibold [overflow-wrap:anywhere]">{SITE.email}</span>}
                />
              </a>
            </div>
            <div className="mt-7 rounded-[12px] border border-forge-silver bg-forge-fog p-5">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate">Service area</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SERVICE_CITIES.filter((c) => LINKED_CITIES.includes(c.slug)).map((c) => (
                  <Chip key={c.slug} size="sm" href={`/locations/${c.slug}`}>
                    {c.name.replace(/, TX$/, '')} →
                  </Chip>
                ))}
                {plainCities.map((c) => (
                  <Chip key={c} size="sm">
                    {c}
                  </Chip>
                ))}
              </div>
              <p className="mt-3 text-[13px] text-forge-slate">Within ~90 minutes of Temple. Call to confirm your area.</p>
            </div>
          </div>
          <MessageForm />
        </div>
      </section>

      {/* 3 · Map */}
      <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(48px,5vw,80px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <MapBand
            src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
            title={`${SITE.name} — ${SITE.addressOneLine}`}
            callout={
              <>
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-steel-light">Triple J shop · HQ</p>
                <p className="mt-1.5 font-forge-display text-[18px] font-bold">
                  {SITE.address.street}, {SITE.address.city}
                </p>
                <Link
                  href={`https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`}
                  target="_blank"
                  rel="noopener"
                  className="mt-2 inline-block text-[14px] font-semibold text-forge-silver transition-colors hover:text-white"
                >
                  Get directions →
                </Link>
              </>
            }
          />
        </div>
      </section>
    </div>
  )
}
