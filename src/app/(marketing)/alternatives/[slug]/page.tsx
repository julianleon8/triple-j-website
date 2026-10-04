import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { numeral } from '@/components/forge/cards'
import { buttonClass } from '@/components/forge/styles'
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

  // One table, Triple J against all five national kit dealers. The
  // per-brand pages that compared one dealer each were folded in here.
  const comparisonRows = consolidatedRows()

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
    <div data-forge="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      {/* No `/alternatives` hub page exists, so that crumb used to resolve to a
          404 and Google drops a BreadcrumbList containing a dead URL. Trail is
          Home → comparison until a real hub is built. */}
      <BreadcrumbJsonLd
        items={[{ name: content.h1, path: `/alternatives/${slug}` }]}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <PageHero
        variant="plain"
        breadcrumb={<Breadcrumb trail={[]} current={content.h1} jsonLd={false} />}
        contentMax="w-full max-w-[920px]"
        eyebrow="Comparison"
        h1a={content.h1}
        lede={content.heroSubhead}
        ledeMax="max-w-[680px]"
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              Get a Free Quote
            </ForgeButtonLink>
            <TrackedPhoneLink
              surface={`alternatives_${slug}_hero`}
              className={buttonClass('outlineDark', 'lg')}
            >
              Call&nbsp;
            </TrackedPhoneLink>
          </>
        }
        after={<AuthorByline asOf={COMPETITORS['triple-j-metal'].asOf} />}
      />

      {/* ── TL;DR callout ────────────────────────────────────────────── */}
      <section
        data-forge=""
        data-tone="light"
        className="border-b border-forge-mist bg-forge-fog py-[clamp(40px,4vw,64px)] text-forge-navy"
      >
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <div className="max-w-[760px] border-l-2 border-forge-navy pl-[clamp(18px,2vw,28px)]">
            <p className="m-0 text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate">
              TL;DR
            </p>
            <p className="mt-3 text-[clamp(17px,.5vw_+_14px,20px)] leading-[1.6] text-forge-navy [text-wrap:pretty]">
              {content.tldr}
            </p>
          </div>
          {/* TODO(hearth): once Hearth is integrated, add an "Affordable
              monthly payments — as low as $X/mo" callout under the TL;DR
              with a link to the financing page. */}
        </div>
      </section>

      {/* ── Why people compare ───────────────────────────────────────── */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading line1="Why people compare these" size="compact" />
            <p className="mt-5 text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.65] text-forge-slate [text-wrap:pretty]">
              {content.whyCompare}
            </p>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Comparison table ─────────────────────────────────────────── */}
      <ComparisonTable
        competitorSlugs={content.competitorSlugs}
        rows={comparisonRows}
        eyebrow="Side-by-side"
        heading="Feature-by-feature comparison"
        subheading="What you get with each company on the most-asked questions. Verified from each company's public website."
        tone="fog"
      />

      {/* ── Detailed breakdown sections ──────────────────────────────── */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal stagger className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-4">
            {content.breakdownSections.map((section, i) => (
              <article
                key={section.heading}
                className="flex flex-col gap-2.5 rounded-[12px] border border-forge-silver bg-forge-fog px-[clamp(22px,2.4vw,32px)] pt-6 pb-7"
              >
                <div className="flex items-center gap-3" aria-hidden="true">
                  <span className="font-forge-display text-[14px] font-bold text-forge-steel">{numeral(i)}</span>
                  <span className="h-px flex-1 bg-forge-silver" />
                </div>
                <h2 className="mt-1.5 font-forge-display text-[clamp(21px,.6vw_+_16px,25px)] font-bold leading-[1.2] text-forge-navy">
                  {section.heading}
                </h2>
                <p className="m-0 text-[15px] leading-[1.65] text-forge-slate [text-wrap:pretty]">{section.body}</p>
              </article>
            ))}
          </ForgeReveal>
        </div>
      </section>

      {/* ── Honest "when competitor wins" + "when Triple J wins" ────── */}
      <section data-forge="" data-tone="light" className="bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy">
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-stretch gap-[clamp(16px,2vw,24px)] px-[clamp(20px,3vw,40px)]">
          <ForgeReveal className="rounded-[12px] border border-forge-silver bg-white p-[clamp(24px,2.4vw,36px)]">
            <p className="m-0 text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate">
              When the competitor is the right pick
            </p>
            <p className="mt-4 text-[16px] leading-[1.65] text-forge-slate [text-wrap:pretty]">{content.whenCompetitorWins}</p>
          </ForgeReveal>
          <ForgeReveal className="rounded-[12px] border border-forge-navy bg-forge-navy p-[clamp(24px,2.4vw,36px)] text-white">
            <div data-tone="dark">
              <p className="m-0 text-[11px] font-bold uppercase tracking-[.2em] text-forge-silver">
                When Triple J Metal is the better fit
              </p>
              <ul className="mt-5 flex list-none flex-col gap-3 p-0">
                {content.whenTripleJWins.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-[15px] leading-[1.6] text-white/86">
                    <span aria-hidden="true" className="mt-px shrink-0 font-bold text-forge-steel-light">✓</span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <ForgeButtonLink href="#quote" variant="white" size="md" arrow className="mt-7">
                Get a Free Quote
              </ForgeButtonLink>
            </div>
          </ForgeReveal>
        </div>
      </section>

      {/* ── Related comparisons cluster ──────────────────────────────── */}
      <RelatedComparisons currentSlug={slug as AlternativesSlug} />

      {/* ── Quote form ───────────────────────────────────────────────── */}
      <QuoteSection />
    </div>
  )
}

/**
 * Triple J vs. all 5 national kit dealers in a single matrix. Build the rows
 * dynamically so the same row label maps across every kit competitor.
 */
function consolidatedRows() {
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
}
