import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { ArrowRightIcon } from '@/components/ui/icons'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { ComparisonTable } from '@/components/sections/ComparisonTable'
import { AuthorByline } from '@/components/sections/AuthorByline'
import { RelatedComparisons } from '@/components/sections/RelatedComparisons'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import {
  ALTERNATIVES_SLUGS,
  COMPETITORS,
  NATIONAL_KIT_COMPARISON_ROWS,
  getAlternativesContent,
  type AlternativesSlug,
  type CompetitorSlug,
} from '@/lib/competitors'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

export async function generateStaticParams() {
  return ALTERNATIVES_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: PageProps<'/alternatives/[slug]'>,
): Promise<Metadata> {
  const { slug } = await params
  const content = getAlternativesContent(slug)
  if (!content) return {}
  return {
    title: { absolute: `${content.metaTitle} | ${SITE.name}` },
    description: content.metaDescription,
    alternates: { canonical: `/alternatives/${slug}` },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.metaTitle,
      description: content.metaDescription,
    },
  }
}

export default async function AlternativesPage(
  { params }: PageProps<'/alternatives/[slug]'>,
) {
  const { slug } = await params
  const content = getAlternativesContent(slug)
  if (!content) notFound()

  const baseUrl = getSiteUrl()
  const pageUrl = `${baseUrl}/alternatives/${slug}`

  // Per-page comparison rows differ by which page you're on. The
  // consolidated 'national-kit-dealers' page uses a wider row set built
  // dynamically for all 5 national kits; individual brand pages use the
  // standard 8-row template that hard-codes Triple J vs that one brand.
  const isConsolidated = slug === 'national-kit-dealers'
  // After isConsolidated narrows out 'national-kit-dealers', the remaining
  // slugs (eagle-carports, get-carports, carport-central) are all valid
  // CompetitorSlug values — cast through to satisfy the row builder.
  const comparisonRows = isConsolidated
    ? consolidatedRows()
    : NATIONAL_KIT_COMPARISON_ROWS(slug as CompetitorSlug)

  // Per-page @graph: WebPage + ItemList (the comparison) + each compared
  // entity as a Product. Triple J marked as the recommended provider
  // through ItemList ordering (we're position 1).
  const compared = content.competitorSlugs.map((s) => COMPETITORS[s])
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: content.metaTitle,
        description: content.metaDescription,
        isPartOf: { '@id': `${baseUrl}/#website` },
        about: { '@id': `${baseUrl}/#localbusiness` },
        inLanguage: 'en-US',
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#comparison`,
        name: content.h1,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: compared.length,
        itemListElement: compared.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Product',
            name: c.name,
            description: c.oneLiner,
            url: c.homeUrl,
            brand: { '@type': 'Brand', name: c.name },
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
          { name: 'Alternatives', path: '/alternatives' },
          { name: content.h1, path: `/alternatives/${slug}` },
        ]}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-ink-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
              Comparison
            </span>
            <h1 className="mt-3 text-white">{content.h1}</h1>
            <p className="mt-5 text-lg text-white/75 leading-relaxed">
              {content.heroSubhead}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#quote" variant="primary" size="lg">
                Get a Free Quote
              </ButtonLink>
              <TrackedPhoneLink
                surface={`alternatives_${slug}_hero`}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border-2 border-white/30 text-white font-semibold hover:border-white/60 transition-colors text-sm"
              >
                Call&nbsp;
              </TrackedPhoneLink>
            </div>
            <AuthorByline asOf={COMPETITORS['triple-j-metal'].asOf} />
          </div>
        </Container>
      </section>

      {/* ── TL;DR callout ────────────────────────────────────────────── */}
      <section className="py-10 md:py-14 bg-(--color-brand-600) text-white">
        <Container size="narrow">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70 mb-3">
            TL;DR
          </p>
          <p className="text-lg leading-relaxed">{content.tldr}</p>
          {/* TODO(hearth): once Hearth is integrated, add an "Affordable
              monthly payments — as low as $X/mo" callout under the TL;DR
              with a link to the financing page. */}
        </Container>
      </section>

      {/* ── Why people compare ───────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-white">
        <Container size="narrow">
          <h2 className="mb-5">Why people compare these</h2>
          <p className="text-ink-600 text-base leading-relaxed">{content.whyCompare}</p>
        </Container>
      </section>

      {/* ── Comparison table ─────────────────────────────────────────── */}
      <ComparisonTable
        competitorSlugs={content.competitorSlugs}
        rows={comparisonRows}
        eyebrow="Side-by-side"
        heading="Feature-by-feature comparison"
        subheading="What you get with each company on the most-asked questions. Verified from each company's public website."
      />

      {/* ── Detailed breakdown sections ──────────────────────────────── */}
      <section className="py-14 md:py-20 bg-ink-50">
        <Container size="narrow">
          <div className="space-y-10">
            {content.breakdownSections.map((section) => (
              <article key={section.heading}>
                <h2 className="mb-4">{section.heading}</h2>
                <p className="text-ink-700 text-base leading-relaxed">{section.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Honest "when competitor wins" + "when Triple J wins" ────── */}
      <section className="py-14 md:py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="rounded-2xl border border-ink-100 bg-ink-50 p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500 mb-3">
                When the competitor is the right pick
              </p>
              <p className="text-ink-700 leading-relaxed">{content.whenCompetitorWins}</p>
            </div>
            <div className="rounded-2xl border-2 border-(--color-brand-400) bg-(--color-brand-50) p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-(--color-brand-700) mb-3">
                When Triple J Metal is the better fit
              </p>
              <ul className="space-y-3">
                {content.whenTripleJWins.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-sm text-ink-800 leading-relaxed">
                    <span className="text-(--color-brand-600) font-bold shrink-0 mt-0.5">✓</span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href="#quote"
                variant="primary"
                size="md"
                icon={<ArrowRightIcon className="h-4 w-4" />}
                iconPosition="right"
                className="mt-6"
              >
                Get a Free Quote
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Related comparisons cluster ──────────────────────────────── */}
      <RelatedComparisons currentSlug={slug as AlternativesSlug} />

      {/* ── Quote form ───────────────────────────────────────────────── */}
      <QuoteForm />
    </>
  )
}

/**
 * The consolidated `/alternatives/national-kit-dealers` page compares
 * Triple J vs. all 5 national kits in a single matrix. Build the rows
 * dynamically so the same row label maps across every kit competitor.
 */
function consolidatedRows() {
  const allKits: AlternativesSlug[] = ['eagle-carports', 'get-carports', 'carport-central']
  // Use the eagle-carports row template since the kit-dealer business model
  // is functionally identical across all 5 — same yes/no answers per row.
  // For each row, fan the eagle "competitor" cell out across all 5 kits.
  const eagleRows = NATIONAL_KIT_COMPARISON_ROWS('eagle-carports')
  return eagleRows.map((row) => {
    const kitCell = row.cells['eagle-carports']
    const tripleJCell = row.cells['triple-j-metal']
    return {
      ...row,
      cells: {
        'eagle-carports': kitCell,
        'get-carports': kitCell,
        'carport-central': kitCell,
        'viking-steel': kitCell,
        'infinity-carports': kitCell,
        'triple-j-metal': tripleJCell,
      },
    }
  })
  void allKits
}
