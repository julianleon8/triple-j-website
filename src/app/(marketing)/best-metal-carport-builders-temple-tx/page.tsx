import type { Metadata } from 'next'

import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { ComparisonTable } from '@/components/sections/ComparisonTable'
import { AuthorByline } from '@/components/sections/AuthorByline'
import { RelatedComparisons } from '@/components/sections/RelatedComparisons'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import {
  COMPETITORS,
  LOCAL_ROUNDUP_COMPARISON_ROWS,
  LOCAL_ROUNDUP_SLUGS,
} from '@/lib/competitors'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: { absolute: 'Best Metal Carport Builders in Temple, TX (2026 Roundup) | Triple J Metal' },
  description:
    'Honest roundup of Bell County metal carport builders. Triple J Metal, Rough Country, L&E Metal, Texas Custom Carports, A+ Sheds, Premier Portables — compared side-by-side.',
  alternates: { canonical: '/best-metal-carport-builders-temple-tx' },
  openGraph: {
    title: 'Best Metal Carport Builders in Temple, TX (2026)',
    description: 'Honest comparison of Bell County metal building contractors.',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Metal Carport Builders in Temple, TX (2026)',
    description: 'Honest comparison of Bell County metal building contractors.',
  },
}

export default function BestBuildersRoundupPage() {
  const baseUrl = getSiteUrl()
  const pageUrl = `${baseUrl}/best-metal-carport-builders-temple-tx`
  const builders = LOCAL_ROUNDUP_SLUGS.map((s) => COMPETITORS[s])

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
        name: 'Best Metal Carport Builders in Temple, TX (2026 Roundup)',
        description:
          'Honest comparison of metal carport builders in Bell County, Texas. Includes Triple J Metal and five local competitors sourced from Yelp.',
        isPartOf: { '@id': `${baseUrl}/#website` },
        about: { '@id': `${baseUrl}/#localbusiness` },
        inLanguage: 'en-US',
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#roundup`,
        name: 'Bell County Metal Carport Builders',
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Best Builders', path: '/best-metal-carport-builders-temple-tx' },
        ]}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-ink-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              Local Roundup · 2026
            </span>
            <h1 className="mt-3 text-white">
              Best Metal Carport Builders in Temple, TX (2026 Roundup)
            </h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed">
              An honest comparison of Bell County metal building contractors. We&rsquo;re Triple J
              Metal — yes, we&rsquo;re on this list. We also list the five other local builders
              we know about so you can compare. No paid placements, no sponsored slots.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#quote" variant="primary" size="lg">
                Get a Free Quote from Triple J
              </ButtonLink>
              <TrackedPhoneLink
                surface="best_builders_roundup_hero"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border-2 border-white/30 text-white font-semibold hover:border-white/60 transition-colors text-sm"
              >
                Call&nbsp;
              </TrackedPhoneLink>
            </div>
            <AuthorByline asOf={COMPETITORS['triple-j-metal'].asOf} />
          </div>
        </Container>
      </section>

      {/* ── Disclosure ──────────────────────────────────────────────── */}
      <section className="py-8 md:py-10 bg-(--color-brand-600) text-white">
        <Container size="narrow">
          <p className="text-sm leading-relaxed">
            <strong className="text-white">Disclosure:</strong> This is Triple J Metal&rsquo;s website.
            We&rsquo;re #1 on the list because that&rsquo;s our home page. The other five builders are
            real Bell County companies sourced from Yelp searches as of April 2026. We don&rsquo;t earn
            referrals if you choose a competitor — but we want you to be able to compare us fairly.
          </p>
        </Container>
      </section>

      {/* ── Why this list exists ──────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-white">
        <Container size="narrow">
          <h2 className="mb-5">Why a Bell County builder usually beats a national kit</h2>
          <p className="text-ink-700 text-base leading-relaxed mb-4">
            Metal carport buyers in Central Texas have two paths: buy a prefab kit from a national
            company (Eagle, Get Carports, Carport Central, Viking, Infinity) and arrange installation
            yourself, OR hire a local builder who delivers and installs the structure on your property
            with their own crew.
          </p>
          <p className="text-ink-700 text-base leading-relaxed">
            For most homeowners, the local-builder path produces a better outcome: someone you can
            actually call back, faster scheduling, and (in most cases) a real concrete pad poured by
            the same company. That&rsquo;s why this roundup focuses on the six local Bell County
            builders we know about — including us.
          </p>
        </Container>
      </section>

      {/* ── Builder profiles ─────────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-ink-50">
        <Container>
          <h2 className="mb-8">The six local builders</h2>
          <ol className="space-y-6">
            {builders.map((c, i) => {
              const isSelf = c.type === 'self'
              return (
                <li
                  key={c.slug}
                  className={`relative rounded-2xl p-6 md:p-7 border ${
                    isSelf
                      ? 'bg-(--color-brand-50) border-(--color-brand-300) border-2'
                      : 'bg-white border-ink-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-white font-extrabold text-sm shrink-0 ${
                        isSelf ? 'bg-(--color-brand-600)' : 'bg-ink-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-ink-900">{c.name}</h3>
                        {isSelf && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-brand-700) bg-(--color-brand-100) px-2 py-0.5 rounded-full">
                            That&rsquo;s us
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-ink-700 leading-relaxed">{c.oneLiner}</p>
                      <p className="mt-3 text-xs text-ink-500">
                        Coverage: {c.coverage} ·{' '}
                        <a
                          href={c.homeUrl}
                          target="_blank"
                          rel="nofollow noopener"
                          className="text-(--color-brand-700) hover:underline"
                        >
                          {isSelf ? 'Our site' : 'Public listing'}
                        </a>
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </Container>
      </section>

      {/* ── Comparison table ─────────────────────────────────────────── */}
      <ComparisonTable
        competitorSlugs={LOCAL_ROUNDUP_SLUGS}
        rows={LOCAL_ROUNDUP_COMPARISON_ROWS}
        eyebrow="Side-by-side"
        heading="Feature comparison across local builders"
        subheading="Most of the local builder data comes from Yelp listings and public directories — many fields are unknown without the builder's own website. We've shown what we can verify, marked the rest 'unknown,' and welcome corrections from the other builders if anything's wrong."
      />

      {/* ── How to choose ────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-white">
        <Container size="narrow">
          <h2 className="mb-5">How to choose between local builders</h2>
          <p className="text-ink-700 text-base leading-relaxed mb-6">
            Most local Bell County builders deliver real value compared to national kits. The
            differences come down to four questions:
          </p>
          <ul className="space-y-4 text-ink-700 leading-relaxed">
            <li className="flex items-start gap-3">
              <span className="text-(--color-brand-600) font-bold shrink-0 mt-0.5">1.</span>
              <span>
                <strong>Welded or bolted?</strong> Welded red iron is permanent and storm-rated;
                bolted is faster and cheaper. Triple J does both — many local builders offer only
                bolted. Ask explicitly.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-(--color-brand-600) font-bold shrink-0 mt-0.5">2.</span>
              <span>
                <strong>Concrete in the same contract?</strong> Some builders pour the slab,
                others expect you to hire a separate concrete contractor. The single-contract
                version saves coordination headaches.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-(--color-brand-600) font-bold shrink-0 mt-0.5">3.</span>
              <span>
                <strong>How fast can they start?</strong> Same-week scheduling is rare. If the
                builder needs 4–6 weeks, that may be fine for a planned build but bad for a
                hailstorm-driven RV cover.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-(--color-brand-600) font-bold shrink-0 mt-0.5">4.</span>
              <span>
                <strong>Will the same crew do site prep, install, and cleanup?</strong> Some
                local builders sub out portions of the work. The cleanest version is one crew,
                start to finish.
              </span>
            </li>
          </ul>
        </Container>
      </section>

      {/* ── Why pick Triple J Metal ─────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-ink-50">
        <Container size="narrow">
          <div className="rounded-2xl border-2 border-(--color-brand-400) bg-(--color-brand-50) p-7 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-(--color-brand-700) mb-3">
              Why pick us
            </p>
            <h2 className="mb-4 text-(--color-brand-700)">
              When Triple J Metal is the right fit
            </h2>
            <ul className="space-y-3 text-ink-800 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-(--color-brand-600) font-bold shrink-0 mt-0.5">✓</span>
                You want the welded option (a permanent steel structure rated for Texas storms),
                not just a bolted kit.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-(--color-brand-600) font-bold shrink-0 mt-0.5">✓</span>
                You want the concrete pad (4,000 PSI for Bell County clay) poured in the same
                contract as the structure install.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-(--color-brand-600) font-bold shrink-0 mt-0.5">✓</span>
                You need it built same-week. We schedule within days of contract signing.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-(--color-brand-600) font-bold shrink-0 mt-0.5">✓</span>
                You speak Spanish or want to. Hablamos español con Juan y Freddy.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-(--color-brand-600) font-bold shrink-0 mt-0.5">✓</span>
                You want a local Texas phone number (254-346-7764) that goes to the actual
                family running the company.
              </li>
            </ul>
            <ButtonLink
              href="#quote"
              variant="primary"
              size="lg"
              className="mt-7"
            >
              Get a Free Quote from {SITE.name}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ── Related comparisons cluster ──────────────────────────────── */}
      <RelatedComparisons currentSlug="roundup" />

      {/* ── Quote form ───────────────────────────────────────────────── */}
      <QuoteForm />
    </>
  )
}
