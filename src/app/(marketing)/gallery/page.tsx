import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { getSiteUrl } from '@/lib/site-url'
import { getAdminClient } from '@/lib/supabase/admin'
import { describeGalleryColors } from '@/lib/gallery-colors'
import { GALLERY_FILTERS, resolveGalleryFilter } from '@/lib/gallery-filters'

type GalleryPhoto = {
  id: string
  image_url: string
  alt_text: string | null
  sort_order: number
  is_cover: boolean
}

function pickCover(
  photos: GalleryPhoto[] | null | undefined,
): { url: string; alt: string | null } | null {
  const list = photos ?? []
  const cover = list.find((p) => p.is_cover) ?? list[0]
  if (!cover) return null
  return { url: cover.image_url, alt: cover.alt_text }
}

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

const TAG_COLORS: Record<string, string> = {
  Welded:  'bg-blue-100 text-blue-800',
  Bolted:  'bg-ink-100 text-ink-600',
  Turnkey: 'bg-amber-100 text-amber-800',
}

export default async function GalleryPage({ searchParams }: {
  searchParams: Promise<{ type?: string | string[] }>
}) {
  const filter = resolveGalleryFilter((await searchParams).type)
  const { data: projects } = await getAdminClient()
    .from('gallery_items')
    .select(
      `
      *,
      gallery_photos ( id, image_url, alt_text, sort_order, is_cover )
      `,
    )
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })

  const visibleProjects = (projects ?? []).filter((project) =>
    pickCover(project.gallery_photos as GalleryPhoto[] | null) &&
    (filter.types === null || filter.types.includes(project.type))
  )

  // Index-level ImageGallery schema — feeds Google Image Search with the
  // cover photos of every active project. Detail pages emit per-project
  // schemas with all photos.
  const indexCovers = (projects ?? []).slice(0, 24).map((proj) => {
    const photoList = (proj.gallery_photos as { image_url: string; alt_text: string | null; is_cover: boolean }[] | null) ?? []
    const cover = photoList.find((p) => p.is_cover) ?? photoList[0]
    if (!cover) return null
    return {
      '@type': 'ImageObject' as const,
      url: cover.image_url,
      contentUrl: cover.image_url,
      caption: cover.alt_text || proj.title,
      contentLocation: {
        '@type': 'Place' as const,
        name: `${proj.city}, TX`,
      },
    }
  }).filter(Boolean)

  const indexJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Triple J Metal — Project Gallery',
    description: '150+ completed metal carports, garages, barns, and RV covers across Central Texas.',
    url: `${getSiteUrl()}/gallery`,
    associatedMedia: indexCovers,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(indexJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <section className="bg-ink-900 py-10 text-white md:py-14">
        <Container size="wide">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-300">The Triple J portfolio</p>
              <h1 className="mt-3 text-5xl font-extrabold uppercase leading-none text-white sm:text-6xl">Built here. Built for you.</h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75">Explore our Central Texas projects, from backyard patios to garages and ranch structures.</p>
            </div>
            <ButtonLink href="#quote" size="lg">Plan Your Build</ButtonLink>
          </div>
        </Container>
      </section>

      <section id="projects" aria-label="Project portfolio" className="scroll-mt-24 bg-paper-2 py-8 md:py-10">
        <Container size="wide">
          <nav aria-label="Filter projects by building type" className="mb-8 flex flex-wrap gap-2">
            {GALLERY_FILTERS.map((option) => (
              <Link key={option.slug}
                href={option.slug === 'all' ? '/gallery#projects' : `/gallery?type=${option.slug}#projects`}
                aria-current={filter.slug === option.slug ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${filter.slug === option.slug ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 bg-white text-ink-600 hover:border-ink-900 hover:text-ink-900'}`}
              >{option.label}</Link>
            ))}
          </nav>
          <p className="mb-5 text-sm text-ink-500">{visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'} · {filter.label}</p>
          {visibleProjects.length === 0 && (
            <div className="rounded-lg border border-ink-200 bg-white px-6 py-12 text-center">
              <h2 className="text-2xl text-ink-900">More builds to explore</h2>
              <p className="mt-3 text-base text-ink-600">No project photos in this category yet. Browse all projects or tell us what you have in mind.</p>
              <Link href="/gallery#projects" className="mt-5 inline-flex min-h-11 items-center font-semibold text-brand-700 underline underline-offset-4">View all projects</Link>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProjects.map((project) => {
              const cover = pickCover(project.gallery_photos as GalleryPhoto[] | null)
              if (!cover) return null
              const colorLine = describeGalleryColors({
                panelColor: project.panel_color,
                panelColorLine: project.panel_color_line,
                trimColor: project.trim_color,
                trimColorLine: project.trim_color_line,
              }).label
              return (
                <Link
                  key={project.id}
                  href={`/gallery/${project.id}`}
                  className="group block rounded-lg overflow-hidden border border-ink-100 bg-white hover:shadow-md transition-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                >
                  <article>
                    <div className="relative aspect-4/3 overflow-hidden bg-ink-200">
                      <Image
                        src={cover.url}
                        alt={cover.alt || project.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={cover.url.startsWith('/')}
                      />
                      {/in progress/i.test(project.title) && (
                        <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow">
                          In progress
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide">
                          {project.type} · {project.city}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${TAG_COLORS[project.tag] ?? 'bg-ink-100 text-ink-600'}`}>
                          {project.tag}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-ink-900 leading-snug">
                        {project.title}
                      </h2>
                      {colorLine && (
                        <p className="mt-1.5 text-xs text-ink-500">
                          {colorLine}
                        </p>
                      )}
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-ink-500 text-sm mb-6">
              New photos added as our projects take shape.
            </p>
            <ButtonLink href="#quote" variant="primary" size="lg">
              Get a Free Quote for Your Project
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ── Quote form ── */}
      <QuoteForm />
    </>
  )
}
