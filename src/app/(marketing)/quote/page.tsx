import type { Metadata } from 'next'
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
import { getBuilds } from '@/lib/forge-builds'
import type { ProjectReference } from '@/lib/project-reference'
import { parseQuotePrefill } from '@/lib/quote-prefill'
import { getAdminClient } from '@/lib/supabase/admin'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Free Quote: Metal Buildings & Fencing',
  description:
    `Free quote on a welded or bolted metal carport, garage, barn, RV cover or metal fence. Temple, TX crew — same day, guaranteed within 24 hours.`,
  // Bare canonical on purpose: this page is the target of every ad variant, and
  // they all arrive with a different query string (?src=fb, ?service=, ?city=).
  // Without this each one would look like a separate URL.
  alternates: { canonical: '/quote' },
  openGraph: {
    title: 'Get a Free Quote | Triple J Metal',
    description:
      'Tell us about your build and a real Texas crew calls you back. Same day, guaranteed within 24 hours.',
    type: 'website',
  },
}

// The layout-mounted <OrganizationJsonLd /> already emits the LocalBusiness
// graph. This is a ContactPage node referencing it by @id — never a second
// business entity. See docs/SCHEMA-AUDIT.md.
function jsonLd(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${baseUrl}/quote`,
    url: `${baseUrl}/quote`,
    name: `Get a free quote from ${SITE.name}`,
    description:
      'Request a free quote on a metal carport, garage, barn, or RV cover in Temple and Central Texas.',
    isPartOf: { '@id': `${baseUrl}/#website` },
    about: { '@id': `${baseUrl}/#localbusiness` },
    inLanguage: 'en-US',
  }
}

type GalleryRow = {
  id: string
  title: string
  city: string | null
  type: string
  gallery_photos: { image_url: string; is_cover: boolean; sort_order: number }[] | null
}

/**
 * Resolve ?project= against live gallery data, the same way /api/leads does.
 *
 * Unlike the API route, a failure here is not a 503. Nothing is lost by
 * rendering the form without the reference card — the customer has not typed
 * anything yet — whereas failing the page would cost the whole visit.
 */
async function loadReference(id: string): Promise<ProjectReference | undefined> {
  try {
    const { data, error } = await getAdminClient()
      .from('gallery_items')
      .select('id, title, city, type, gallery_photos ( image_url, is_cover, sort_order )')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle<GalleryRow>()

    if (error || !data) return undefined

    const photos = data.gallery_photos ?? []
    const cover = photos.find((p) => p.is_cover) ?? [...photos].sort((a, b) => a.sort_order - b.sort_order)[0]
    if (!cover) return undefined

    return {
      id: data.id,
      title: data.title,
      city: data.city || 'Central Texas',
      type: data.type,
      image: cover.image_url,
    }
  } catch {
    return undefined
  }
}

/**
 * How it works on /quote (Locked: the homepage dropped it, /quote keeps it).
 * The pre-Forge copy promised concrete on every job and a frame-day-one,
 * panels-day-two build — the retired 48-hour claim. Rewritten to the locks:
 * concrete available and priced separately; same-week scheduling once the
 * scope is settled. The response promise is the hero's line, not repeated.
 */
const HOW = [
  {
    title: 'Call or request a free quote',
    body: 'Tell us where, what size, and what you’re using it for. We come out, measure, and give you an honest, on-the-spot price.',
  },
  {
    title: 'Site prep and concrete, if you need them',
    body: 'Need a pad? Our crew grades it, runs the forms and pours it — concrete is available on any build and priced separately. One contract, one phone number.',
  },
  {
    title: 'Same-week scheduling',
    body: 'Your install date is confirmed after we review scope, materials, site readiness and any required approvals. You keep your weekend; we keep our word.',
  },
] as const

export default async function QuotePage({ searchParams }: PageProps<'/quote'>) {
  const baseUrl = getSiteUrl()
  const prefill = parseQuotePrefill(await searchParams)
  const isFencing = prefill.service === 'fencing' && !prefill.projectId
  const reference = prefill.projectId ? await loadReference(prefill.projectId) : undefined
  const builds = isFencing ? [] : await getBuilds({ order: 'featured', limit: 6 })

  const points = isFencing
    ? [
        'Metal privacy, pipe/ranch, ornamental fencing and gates.',
        'Share your layout and any city or HOA requirements.',
        'Se habla español — pregunta por Juan o Freddy.',
        'Military, first-responder & trade discounts honored.',
      ]
    : [
        'Welded or bolted — your call, quoted both ways.',
        'Building permits? We’ll talk you through it.',
        'Se habla español — pregunta por Juan o Freddy.',
        'Military, first-responder & trade discounts honored.',
      ]

  return (
    <div data-forge="">
      <BreadcrumbJsonLd items={[{ name: 'Free Quote', path: '/quote' }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd(baseUrl)).replace(/</g, '\\u003c'),
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
          <Breadcrumb trail={[]} current="Free Quote" jsonLd={false} />
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
              <Eyebrow tone="dark">Free quote</Eyebrow>
              <h1 className={`mt-[18px] ${type.h1} text-white`}>
                Tell us about
                <br />
                <span className="forge-steel-text">{isFencing ? 'your fence.' : 'your build.'}</span>
              </h1>
              <p className="mt-6 text-[clamp(18px,.5vw_+_15px,21px)] font-semibold text-white">
                Same day, guaranteed within 24 hours.
              </p>
              <p className={`mt-2 max-w-[480px] ${type.heroLede} text-white/78`}>
                Two quick steps, then a real Texas crew calls you back — Julian or Juan, not an offshore call center.
              </p>

              {/* Cold traffic off a Marketplace ad often just wants to call.
                  Equal weight to the form, and tracked so ?src= attribution and
                  the swapped number agree about the visit. */}
              <div className="mt-8">
                <TrackedPhoneLink surface="quote_page_hero" mode="children-only" className={buttonClass('outlineDark', 'lg')}>
                  <PhoneIcon className="h-5 w-5" />
                  Or just call <TrackedPhoneNumber className="tabular-nums" />
                </TrackedPhoneLink>
              </div>

              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-forge-silver/20 pt-6">
                {[
                  { k: 'Since', v: SITE.established },
                  { k: 'Projects', v: SITE.stats.projects },
                  { k: 'Clients', v: SITE.stats.clients },
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
              eyebrow="Metal fencing"
              line1="Your fence, from inquiry"
              line2="to installation."
              ledeMax="max-w-[640px]"
              lede="Send your approximate footage, style, and gate needs. We’ll review the site and scope, provide a written quote, and confirm an installation schedule after materials and any required approvals are settled."
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
                  eyebrow="How it works"
                  line1="Three steps."
                  line2="One company. Done."
                  lede="We built Triple J to cut out the worst part of hiring a contractor: the endless coordination. You call once — we take it from there."
                />
              </ForgeReveal>
              <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
                {HOW.map((h, i) => (
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
                  <SectionHeading eyebrow="Built by Triple J" line1="A few places we’ve" line2="left our mark." className="max-w-[720px]" />
                  <Link href="/gallery" className="border-b border-forge-silver pb-0.5 text-[15px] font-semibold transition-colors hover:border-forge-navy">
                    See the full gallery →
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
