import Image from 'next/image'
import Link from 'next/link'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { FeatureCard } from '@/components/forge/cards'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { ForgeReveal } from '@/components/forge/ForgeReveal'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { SectionHeading } from '@/components/forge/SectionHeading'
import { buttonClass, type } from '@/components/forge/styles'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink } from '@/components/site/TrackedPhone'
import type { Locale } from '@/i18n/config'
import { buildWord } from '@/i18n/copy/ui'
import { HYBRID_PAGE } from '@/i18n/pages/hybrid-projects'
import { localizeHref } from '@/i18n/routes'
import { describeGalleryColors } from '@/lib/gallery-colors'

type GalleryPhoto = {
  id: string
  image_url: string
  alt_text: string | null
  sort_order: number
  is_cover: boolean
}

/** A `gallery_items` row with its photos, as the route file reads it. */
export type HybridProject = {
  id: string
  title: string
  city: string | null
  tag: string | null
  is_featured: boolean | null
  panel_color: string | null
  panel_color_line: string | null
  trim_color: string | null
  trim_color_line: string | null
  gallery_photos: GalleryPhoto[] | null
}

function pickCover(
  photos: GalleryPhoto[] | null | undefined,
): { url: string; alt: string | null } | null {
  const list = photos ?? []
  const cover = list.find((p) => p.is_cover) ?? list[0]
  if (!cover) return null
  return { url: cover.image_url, alt: cover.alt_text }
}

const section = 'py-[clamp(64px,7vw,104px)]'
const container = 'mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]'

/**
 * Hybrid projects (custom builds). Rendered by `/services/hybrid-projects` and
 * `/es/servicios/proyectos-hibridos`; the route files read the live
 * `type = 'Hybrid'` gallery items and pass them in.
 */
export function HybridProjectsPage({ locale, projects }: { locale: Locale; projects: readonly HybridProject[] }) {
  const t = HYBRID_PAGE[locale]

  /** "Burnished Slate panels · Charcoal trim": color names are catalog names, the words around them are ours. */
  const colorLine = (project: HybridProject): string | null => {
    const { panel, trim } = describeGalleryColors({
      panelColor: project.panel_color,
      panelColorLine: project.panel_color_line,
      trimColor: project.trim_color,
      trimColorLine: project.trim_color_line,
    })
    if (panel && trim) return t.colorLabel.both(panel.name, trim.name)
    if (panel) return t.colorLabel.panels(panel.name)
    if (trim) return t.colorLabel.trim(trim.name)
    return null
  }

  return (
    <div data-forge="">
      <BreadcrumbJsonLd
        items={[
          { name: t.breadcrumbs.services, path: '/services' },
          { name: t.breadcrumbs.hybrid, path: '/services/hybrid-projects' },
        ]}
        locale={locale}
      />
      {/* ── Hero ── */}
      <PageHero
        variant="plain"
        breadcrumb={
          <Breadcrumb
            trail={[{ name: t.breadcrumbs.services, href: '/services' }]}
            current={t.breadcrumbs.hybrid}
            jsonLd={false}
            locale={locale}
          />
        }
        eyebrow={t.hero.eyebrow}
        h1a={t.hero.h1a}
        h1b={t.hero.h1b}
        lede={t.hero.lede}
        ledeMax="max-w-[640px]"
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              {t.hero.quote}
            </ForgeButtonLink>
            <TrackedPhoneLink surface="hybrid_projects_hero" className={buttonClass('outlineDark', 'lg')}>
              {t.hero.call}&nbsp;
            </TrackedPhoneLink>
          </>
        }
      />

      {/* ── Project grid (auto-pulled from /hq/gallery type=Hybrid) ── */}
      <section data-forge="" data-tone="light" className={`bg-white text-forge-navy ${section}`}>
        <div className={container}>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
            <SectionHeading line1={t.grid.heading} />
            <Link
              href={localizeHref('/gallery', locale)}
              className="border-b border-forge-silver pb-0.5 text-[15px] font-semibold text-forge-navy transition-colors hover:border-forge-navy"
            >
              {t.grid.all}
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="mt-10 rounded-[12px] border border-dashed border-forge-silver bg-forge-fog px-6 py-16 text-center">
              <p className="text-[16px] font-semibold text-forge-navy">
                {t.grid.emptyTitle}
              </p>
              <p className="mx-auto mt-2 max-w-md text-[14px] leading-[1.6] text-forge-slate">
                {t.grid.emptyBody}
              </p>
              <div className="mt-6">
                <ForgeButtonLink href="#quote" variant="navy" size="md">
                  {t.grid.emptyCta}
                </ForgeButtonLink>
              </div>
            </div>
          ) : (
            <ForgeReveal stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const cover = pickCover(project.gallery_photos)
                if (!cover) return null
                const colors = colorLine(project)
                return (
                  <Link
                    key={project.id}
                    href={localizeHref(`/gallery/${project.id}`, locale)}
                    className="group flex flex-col overflow-hidden rounded-[12px] border border-forge-silver bg-white text-forge-navy transition-[border-color,box-shadow] duration-300 ease-forge hover:border-forge-steel hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <article className="flex flex-1 flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden bg-forge-slate">
                        <Image
                          src={cover.url}
                          alt={cover.alt || project.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                          unoptimized={cover.url.startsWith('/')}
                        />
                        {project.is_featured && (
                          <span className="absolute top-3 left-3 rounded-[4px] bg-forge-navy px-2 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-white">
                            {t.grid.featured}
                          </span>
                        )}
                      </div>
                      <div className="px-[18px] pt-4 pb-[18px]">
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="text-[11px] font-semibold uppercase tracking-[.2em] text-forge-slate">
                            {buildWord('Hybrid', locale)} · {buildWord(project.city ?? '', locale)}
                          </span>
                          {project.tag && (
                            <span className="rounded-[4px] border border-forge-mist bg-forge-fog px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.12em] text-forge-slate">
                              {buildWord(project.tag, locale)}
                            </span>
                          )}
                        </div>
                        <h3 className="font-forge-display text-[19px] font-bold leading-[1.25] text-forge-navy">
                          {project.title}
                        </h3>
                        {colors && (
                          <p className="mt-1.5 text-[13px] text-forge-slate">{colors}</p>
                        )}
                      </div>
                    </article>
                  </Link>
                )
              })}
            </ForgeReveal>
          )}
        </div>
      </section>

      {/* ── What counts as a hybrid project ── */}
      <section
        data-forge=""
        data-tone="light"
        className={`border-t border-forge-mist bg-forge-fog text-forge-navy ${section}`}
      >
        <div className={container}>
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading eyebrow={t.mean.eyebrow} line1={t.mean.heading} />
            <p className={`mt-4 text-forge-slate ${type.lede}`}>{t.mean.p1}</p>
            <p className={`mt-3 text-forge-slate ${type.lede}`}>{t.mean.p2}</p>
          </ForgeReveal>

          <ForgeReveal stagger className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
            {t.mean.types.map((item, i) => (
              <FeatureCard key={item.title} index={i} title={item.title}>
                {item.desc}
              </FeatureCard>
            ))}
          </ForgeReveal>
        </div>
      </section>

      {/* ── Why Triple J — the engineering reality ── */}
      <section data-forge="" data-tone="light" className={`bg-white text-forge-navy ${section}`}>
        <div className={container}>
          <ForgeReveal className="max-w-[760px]">
            <SectionHeading eyebrow={t.how.eyebrow} line1={t.how.heading} balance />
            <p className={`mt-4 text-forge-slate ${type.lede}`}>
              {t.how.p1.before}<em>{t.how.p1.or}</em>{t.how.p1.mid}<em>{t.how.p1.and}</em>{t.how.p1.after}
            </p>
            <p className={`mt-3 text-forge-slate ${type.lede}`}>{t.how.p2}</p>
          </ForgeReveal>
        </div>
      </section>

      {/* ── CTA / Quote form ── */}
      <section
        data-forge=""
        data-tone="dark"
        className="bg-forge-navy py-[clamp(48px,5vw,80px)] text-white"
      >
        <div className={container}>
          <SectionHeading
            tone="dark"
            align="center"
            line1={t.cta.line1}
            line2={t.cta.line2}
            ledeMax="max-w-xl"
            lede={t.cta.lede}
          />
        </div>
      </section>
      <QuoteSection locale={locale} />
    </div>
  )
}
