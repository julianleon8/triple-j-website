import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { BuildGrid } from '@/components/forge/BuildGrid'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { getBuilds } from '@/lib/forge-builds'
import { filtersWithCounts, matchesFilter, resolveGalleryFilter } from '@/lib/gallery-filters'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Project Gallery — 150+ Central Texas Builds',
  description:
    'Browse 150+ metal carports, garages, barns, and RV covers built across Temple, Belton, Killeen, and Central Texas. Welded and bolted.',
  alternates: { canonical: '/gallery' },
  openGraph: {
    title: 'Project Gallery | Triple J Metal',
    description: '150+ completed metal building projects across Central Texas.',
    type: 'website',
  },
}

export default async function GalleryPage({ searchParams }: {
  searchParams: Promise<{ type?: string | string[] }>
}) {
  const filter = resolveGalleryFilter((await searchParams).type)
  const builds = await getBuilds({ order: 'featured' })
  const visible = builds.filter((b) => matchesFilter(filter, b.type))
  const filters = filtersWithCounts(builds.map((b) => b.type))

  // Index-level ImageGallery schema — feeds Google Image Search with the
  // cover photos of every active project. Detail pages emit per-project
  // schemas with all photos.
  const indexJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Triple J Metal — Project Gallery',
    description: '150+ completed metal carports, garages, barns, and RV covers across Central Texas.',
    url: `${getSiteUrl()}/gallery`,
    associatedMedia: builds.slice(0, 24).map((b) => ({
      '@type': 'ImageObject' as const,
      url: b.img,
      contentUrl: b.img,
      caption: b.alt || b.title,
      contentLocation: { '@type': 'Place' as const, name: `${b.city}, TX` },
    })),
  }

  return (
    <div data-forge="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(indexJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* Header (navy band, no photo) */}
      <PageHero
        variant="plain"
        breadcrumb={<Breadcrumb trail={[{ name: 'Company' }]} current="Gallery" currentPath="/gallery" />}
        eyebrow="The Triple J portfolio"
        h1a="Built here."
        h1b="Built for you."
        lede="Central Texas projects, from backyard patios to garages and ranch structures. Every one is a Triple J crew job — tap a build to see it up close."
        aside={
          <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
            Plan Your Build
          </ForgeButtonLink>
        }
      />

      {/* Grid */}
      <section
        id="projects"
        aria-label="Project portfolio"
        data-forge=""
        data-tone="light"
        className="scroll-mt-24 bg-forge-fog pt-7 pb-[clamp(64px,7vw,104px)] text-forge-navy"
      >
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <nav aria-label="Filter by building type" className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const on = f.slug === filter.slug
              return (
                <Link
                  key={f.slug}
                  href={f.slug === 'all' ? '/gallery#projects' : `/gallery?type=${f.slug}#projects`}
                  scroll={false}
                  aria-current={on ? 'page' : undefined}
                  className={`inline-flex h-11 items-center gap-2 rounded-[6px] border px-4 text-[14px] font-semibold transition-colors duration-[250ms] ${
                    on
                      ? 'border-forge-navy bg-forge-navy text-white'
                      : 'border-forge-silver bg-white text-forge-navy hover:border-forge-steel'
                  }`}
                >
                  {f.label}
                  <span className={`text-[12px] font-semibold tabular-nums ${on ? 'text-forge-steel-light' : 'text-forge-steel'}`}>
                    {f.count}
                  </span>
                </Link>
              )
            })}
          </nav>
          <p className="mt-5 text-[14px] text-forge-slate">
            {visible.length} {visible.length === 1 ? 'project' : 'projects'} · {filter.label}
          </p>

          {visible.length ? (
            <BuildGrid
              items={visible}
              variant="gallery"
              className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-5"
              sizes="(min-width: 1200px) 420px, (min-width: 700px) 45vw, 100vw"
            />
          ) : (
            <div className="mt-4 rounded-[12px] border border-forge-silver bg-white px-6 py-12 text-center">
              <h2 className="font-forge-display text-[24px] font-bold">More builds to explore</h2>
              <p className="mt-3 text-[15px] text-forge-slate">No project photos in this category yet.</p>
              <Link href="/gallery#projects" className="mt-5 inline-flex min-h-11 items-center border-b border-forge-silver font-semibold">
                View all projects
              </Link>
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-[12px] border border-forge-silver bg-white p-6">
            <p className="text-[15px] text-forge-slate">
              New photos are added as our projects take shape. Don’t see your build? We probably still build it.
            </p>
            <ForgeButtonLink href="#quote" variant="navy" size="md" arrow>
              Get a Free Quote
            </ForgeButtonLink>
          </div>
        </div>
      </section>

      <QuoteSection />
    </div>
  )
}
