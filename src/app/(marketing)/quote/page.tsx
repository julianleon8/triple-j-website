import type { Metadata } from 'next'
import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Gallery } from '@/components/sections/Gallery'
import { TrackedPhoneButtonLink } from '@/components/site/TrackedPhone'
import { PhoneIcon } from '@/components/ui/icons'
import { getAdminClient } from '@/lib/supabase/admin'
import { parseQuotePrefill } from '@/lib/quote-prefill'
import type { ProjectReference } from '@/lib/project-reference'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Get a Free Quote | Metal Buildings in Central Texas',
  description:
    `Free quote on a welded or bolted metal carport, garage, barn, or RV cover. Temple, TX crew — same day, guaranteed within 24 hours. Call ${SITE.phone}.`,
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

export default async function QuotePage({ searchParams }: PageProps<'/quote'>) {
  const baseUrl = getSiteUrl()
  const prefill = parseQuotePrefill(await searchParams)
  const reference = prefill.projectId ? await loadReference(prefill.projectId) : undefined

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd(baseUrl)).replace(/</g, '\\u003c'),
        }}
      />

      {/* Hero + form.
          This band owns the dark ground the bare QuoteForm is styled against —
          the card is white-on-white without it. Do not lighten this section
          without giving the form its own backdrop. */}
      <section className="relative overflow-hidden bg-black text-white py-14 md:py-20">
        <div className="absolute inset-0">
          <Image
            src="/images/red-iron-frame-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-tr from-black/95 via-black/80 to-[color:var(--color-brand-700)]/40"
        />

        <Container size="wide" className="relative">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:items-start">
            {/* Form first in the DOM: on a phone, an ad visitor should land on
                the thing they came to do, not scroll past a pitch to reach it. */}
            <div id="quote" className="order-1 lg:order-2 scroll-mt-24">
              <QuoteForm chrome={false} source="quote_page" projectReference={reference} initialService={prefill.service} initialZip={prefill.zip} />
            </div>

            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
                Free Quote
              </span>

              <h1 className="mt-5 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-white text-4xl sm:text-5xl lg:text-6xl">
                Tell us about
                <br />
                <span className="text-[color:var(--color-brand-400)]">your build.</span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl font-semibold text-white">
                Same day, guaranteed within 24 hours.
              </p>
              <p className="mt-2 text-base text-white/70 leading-relaxed max-w-md">
                Two quick steps, then a real Texas crew calls you back — Julian or Juan,
                not an offshore call center.
              </p>

              {/* Cold traffic off a Marketplace ad often just wants to call.
                  Equal weight to the form, and tracked so ?src= attribution and
                  the swapped number agree about the visit. */}
              <div className="mt-8">
                <TrackedPhoneButtonLink
                  surface="quote_page_hero"
                  variant="outline-dark"
                  size="lg"
                  label="Or just call "
                  icon={<PhoneIcon className="h-5 w-5" />}
                />
              </div>

              <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50">Since</dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold text-white">{SITE.established}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50">Projects</dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold text-white">{SITE.stats.projects}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50">Clients</dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold text-white">{SITE.stats.clients}</dd>
                </div>
              </dl>

              <ul className="mt-8 space-y-3 text-sm text-white/75">
                <li className="flex gap-3">
                  <span aria-hidden="true" className="text-[color:var(--color-brand-400)]">·</span>
                  Welded or bolted — your call, quoted both ways.
                </li>
                <li className="flex gap-3">
                  <span aria-hidden="true" className="text-[color:var(--color-brand-400)]">·</span>
                  Building permits? We&rsquo;ll talk you through it.
                </li>
                <li className="flex gap-3">
                  <span aria-hidden="true" className="text-[color:var(--color-brand-400)]">·</span>
                  Se habla español — pregunta por Juan o Freddy.
                </li>
                <li className="flex gap-3">
                  <span aria-hidden="true" className="text-[color:var(--color-brand-400)]">·</span>
                  Military, first-responder &amp; trade discounts honored.
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <HowItWorks />
      <Gallery />
    </>
  )
}
