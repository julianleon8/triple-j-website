import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { SERVICES, SERVICE_SLUGS } from '@/lib/services'
import { SITE } from '@/lib/site'

export async function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: PageProps<'/services/[slug]'>
): Promise<Metadata> {
  const { slug } = await params
  const svc = SERVICES[slug]
  if (!svc) return {}
  return {
    title: svc.metaTitle,
    description: svc.metaDescription,
    alternates: { canonical: `/services/${slug}` },
    openGraph: { title: svc.metaTitle, description: svc.metaDescription, type: 'website' },
  }
}

const GAP_BADGES: Record<number, { label: string; color: string }> = {
  1: { label: 'Turnkey + Concrete',    color: 'bg-amber-100 text-amber-800' },
  2: { label: 'Welded Steel Quality',  color: 'bg-blue-100 text-blue-800' },
  3: { label: 'Same-Week Speed',        color: 'bg-green-100 text-green-800' },
  4: { label: 'HOA Luxury Builds',     color: 'bg-purple-100 text-purple-800' },
}

export default async function ServicePage(
  { params }: PageProps<'/services/[slug]'>
) {
  const { slug } = await params
  const svc = SERVICES[slug]
  if (!svc) notFound()

  const gap = svc.keywordGap ? GAP_BADGES[svc.keywordGap] : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: svc.title,
    description: svc.metaDescription,
    provider: {
      '@type': 'LocalBusiness',
      name: SITE.name,
      telephone: SITE.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: SITE.address.street,
        addressLocality: SITE.address.city,
        addressRegion: SITE.address.state,
        postalCode: SITE.address.zip,
        addressCountry: 'US',
      },
    },
    areaServed: { '@type': 'State', name: 'Texas' },
    ...(svc.faqs.length > 0 && {
      mainEntity: {
        '@type': 'FAQPage',
        mainEntity: svc.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Services', path: '/services' },
          { name: svc.title, path: `/services/${slug}` },
        ]}
      />

      {/* ── Hero ── */}
      <section className="relative bg-[color:var(--color-ink-900)] text-white py-20 md:py-28 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            {gap && (
              <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${gap.color}`}>
                {gap.label}
              </span>
            )}
            <h1 className="text-white">{svc.heroHeadline}</h1>
            <p className="mt-5 text-lg md:text-xl text-white/75 max-w-2xl leading-relaxed">
              {svc.heroCopy}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#quote" variant="primary" size="lg">
                Get a Free Quote
              </ButtonLink>
              <a
                href={`tel:${SITE.phone}`}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border-2 border-white/30 text-white font-semibold hover:border-white/60 transition-colors text-sm"
              >
                Call {SITE.phone}
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Main benefit callout ── */}
      <section className="bg-[color:var(--color-brand-600)] text-white py-6">
        <Container>
          <p className="text-center font-semibold text-lg">{svc.mainBenefit}</p>
        </Container>
      </section>

      {/* ── Features grid ── */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <h2 className="text-center mb-12">What&rsquo;s Included</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {svc.features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-[color:var(--color-ink-100)] bg-[color:var(--color-ink-50)] p-6"
              >
                <div className="w-8 h-1 bg-[color:var(--color-brand-600)] rounded mb-4" />
                <h3 className="text-base font-bold text-[color:var(--color-ink-900)] mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-[color:var(--color-ink-500)] leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Technical authority ── */}
      <section className="py-16 md:py-20 bg-[color:var(--color-ink-50)]">
        <Container size="narrow">
          <h2 className="mb-6">Built for Central Texas</h2>
          <p className="text-[color:var(--color-ink-600)] text-lg leading-relaxed">
            {svc.technicalAuthority}
          </p>
          <div className="mt-8 flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-ink-700)]">
              <span className="text-[color:var(--color-brand-600)]">✓</span> Licensed &amp; Insured
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-ink-700)]">
              <span className="text-[color:var(--color-brand-600)]">✓</span> Texas-Sourced Red Iron Steel
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-ink-700)]">
              <span className="text-[color:var(--color-brand-600)]">✓</span> Temple-Based Crew
            </div>
          </div>
        </Container>
      </section>

      {/* ── Competitor comparison ── */}
      <section className="py-16 md:py-24 bg-white">
        <Container size="narrow">
          <h2 className="mb-2">Why Not the Other Guys?</h2>
          <p className="text-[color:var(--color-ink-500)] mb-8">
            Here&rsquo;s what separates Triple J Metal from national dealers and kit sellers.
          </p>
          <div className="rounded-xl border border-[color:var(--color-ink-200)] overflow-hidden">
            <div className="grid grid-cols-2 bg-[color:var(--color-ink-900)] text-white text-sm font-bold uppercase tracking-wide">
              <div className="px-5 py-3">The Other Guys</div>
              <div className="px-5 py-3 text-[color:var(--color-brand-400)]">Triple J Metal</div>
            </div>
            {svc.competitorRows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-2 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-[color:var(--color-ink-50)]'}`}
              >
                <div className="px-5 py-4 text-[color:var(--color-ink-500)] border-r border-[color:var(--color-ink-100)]">
                  ✗ {row.them}
                </div>
                <div className="px-5 py-4 font-medium text-[color:var(--color-ink-800)]">
                  <span className="text-[color:var(--color-brand-600)]">✓</span> {row.us}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Military section (RV covers page only) ── */}
      {svc.militaryAngle && (
        <section className="py-16 bg-[color:var(--color-ink-900)] text-white">
          <Container size="narrow">
            <div className="flex items-start gap-5">
              <span className="text-4xl">⭐</span>
              <div>
                <h2 className="text-white mb-3">Fort Cavazos Military Discount</h2>
                <p className="text-white/75 text-lg leading-relaxed mb-4">
                  PCS&rsquo;ing to Fort Cavazos? We protect your vehicles fast — on-site same week,
                  often before your household goods even arrive. Active duty, veterans, and first responders
                  receive a discount on all Triple J Metal installs.
                </p>
                <p className="text-white/60 text-sm">
                  Mention your service when you call, or check the Military / First Responder box
                  on the quote form below.
                </p>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── FAQ ── */}
      {svc.faqs.length > 0 && (
        <section className="py-16 md:py-24 bg-[color:var(--color-ink-50)]">
          <Container size="narrow">
            <h2 className="mb-10">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {svc.faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-xl bg-white border border-[color:var(--color-ink-100)] p-6"
                >
                  <h3 className="text-base font-bold text-[color:var(--color-ink-900)] mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-sm text-[color:var(--color-ink-500)] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Related services ── */}
      {svc.relatedSlugs.length > 0 && (
        <section className="py-12 bg-white border-t border-[color:var(--color-ink-100)]">
          <Container>
            <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--color-ink-400)] mb-6">
              Related Services
            </p>
            <div className="flex flex-wrap gap-3">
              {svc.relatedSlugs.map((s) => {
                const rel = SERVICES[s]
                if (!rel) return null
                return (
                  <ButtonLink key={s} href={`/services/${s}`} variant="secondary" size="sm">
                    {rel.shortTitle}
                  </ButtonLink>
                )
              })}
            </div>
          </Container>
        </section>
      )}

      {/* ── Quote form ── */}
      <QuoteForm />
    </>
  )
}
