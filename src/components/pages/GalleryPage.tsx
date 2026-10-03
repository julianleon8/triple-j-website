import Link from 'next/link'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { BuildGrid } from '@/components/forge/BuildGrid'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import type { Locale } from '@/i18n/config'
import { GALLERY } from '@/i18n/pages/gallery'
import { localizeHref } from '@/i18n/routes'
import type { BuildItem } from '@/lib/forge-builds'
import { filterLabel, filtersWithCounts, matchesFilter, resolveGalleryFilter } from '@/lib/gallery-filters'
import { getSiteUrl } from '@/lib/site-url'

/**
 * /gallery (English) and /es/galeria (Spanish). The route files read
 * `?type=` and fetch the builds; project titles, cities and captions show
 * as stored in HQ.
 */
export function GalleryPage({
  locale,
  builds,
  type,
}: {
  locale: Locale
  builds: readonly BuildItem[]
  /** The raw `?type=` search param. */
  type: string | string[] | undefined
}) {
  const t = GALLERY[locale]
  const filter = resolveGalleryFilter(type)
  const visible = builds.filter((b) => matchesFilter(filter, b.type))
  const filters = filtersWithCounts(builds.map((b) => b.type))

  // Index-level ImageGallery schema — feeds Google Image Search with the
  // cover photos of every active project. Detail pages emit per-project
  // schemas with all photos.
  const indexJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: t.jsonLd.name,
    description: t.jsonLd.description,
    url: `${getSiteUrl()}${localizeHref('/gallery', locale)}`,
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
        breadcrumb={
          <Breadcrumb
            trail={[{ name: t.hero.company }]}
            current={t.hero.current}
            currentPath="/gallery"
            locale={locale}
          />
        }
        eyebrow={t.hero.eyebrow}
        h1a={t.hero.h1a}
        h1b={t.hero.h1b}
        lede={t.hero.lede}
        aside={
          <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
            {t.hero.plan}
          </ForgeButtonLink>
        }
      />

      {/* Grid */}
      <section
        id="projects"
        aria-label={t.grid.aria}
        data-forge=""
        data-tone="light"
        className="scroll-mt-24 bg-forge-fog pt-7 pb-[clamp(64px,7vw,104px)] text-forge-navy"
      >
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          <nav aria-label={t.grid.filterAria} className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const on = f.slug === filter.slug
              return (
                <Link
                  key={f.slug}
                  href={localizeHref(f.slug === 'all' ? '/gallery#projects' : `/gallery?type=${f.slug}#projects`, locale)}
                  scroll={false}
                  aria-current={on ? 'page' : undefined}
                  className={`inline-flex h-11 items-center gap-2 rounded-[6px] border px-4 text-[14px] font-semibold transition-colors duration-[250ms] ${
                    on
                      ? 'border-forge-navy bg-forge-navy text-white'
                      : 'border-forge-silver bg-white text-forge-navy hover:border-forge-steel'
                  }`}
                >
                  {filterLabel(f, locale)}
                  <span className={`text-[12px] font-semibold tabular-nums ${on ? 'text-forge-steel-light' : 'text-forge-steel'}`}>
                    {f.count}
                  </span>
                </Link>
              )
            })}
          </nav>
          <p className="mt-5 text-[14px] text-forge-slate">{t.grid.count(visible.length, filterLabel(filter, locale))}</p>

          {visible.length ? (
            <BuildGrid
              items={visible}
              variant="gallery"
              className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-5"
              sizes="(min-width: 1200px) 420px, (min-width: 700px) 45vw, 100vw"
            />
          ) : (
            <div className="mt-4 rounded-[12px] border border-forge-silver bg-white px-6 py-12 text-center">
              <h2 className="font-forge-display text-[24px] font-bold">{t.grid.emptyTitle}</h2>
              <p className="mt-3 text-[15px] text-forge-slate">{t.grid.emptyBody}</p>
              <Link href={localizeHref('/gallery#projects', locale)} className="mt-5 inline-flex min-h-11 items-center border-b border-forge-silver font-semibold">
                {t.grid.viewAll}
              </Link>
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-[12px] border border-forge-silver bg-white p-6">
            <p className="text-[15px] text-forge-slate">{t.grid.footNote}</p>
            <ForgeButtonLink href="#quote" variant="navy" size="md" arrow>
              {t.grid.quote}
            </ForgeButtonLink>
          </div>
        </div>
      </section>

      <QuoteSection locale={locale} />
    </div>
  )
}
