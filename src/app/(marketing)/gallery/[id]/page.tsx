import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'
import { getAdminClient } from '@/lib/supabase/admin'
import { describeGalleryColors } from '@/lib/gallery-colors'
import { PhotoLightbox } from './PhotoLightbox'

type GalleryPhoto = {
  id: string
  image_url: string
  alt_text: string | null
  sort_order: number
  is_cover: boolean
}

export async function generateStaticParams() {
  const { data } = await getAdminClient()
    .from('gallery_items')
    .select('id')
    .eq('is_active', true)
  return (data ?? []).map((row: { id: string }) => ({ id: row.id }))
}

export async function generateMetadata(
  { params }: PageProps<'/gallery/[id]'>,
): Promise<Metadata> {
  const { id } = await params
  const { data: item } = await getAdminClient()
    .from('gallery_items')
    .select('title, city, type, alt_text')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()
  if (!item) return {}
  const title = `${item.title} — ${item.city}`
  const description =
    item.alt_text ||
    `${item.type} built by Triple J Metal in ${item.city}. Welded or bolted, same-week scheduling, Temple TX crew.`
  return {
    title,
    description,
    alternates: { canonical: `/gallery/${id}` },
    openGraph: { title, description, type: 'article' },
  }
}

function sortPhotos(photos: GalleryPhoto[]): GalleryPhoto[] {
  return photos.slice().sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1
    return a.sort_order - b.sort_order
  })
}

export default async function GalleryDetailPage(
  { params }: PageProps<'/gallery/[id]'>,
) {
  const { id } = await params
  const { data: item } = await getAdminClient()
    .from('gallery_items')
    .select(
      `
      *,
      gallery_photos ( id, image_url, alt_text, sort_order, is_cover )
      `,
    )
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()

  if (!item) notFound()

  const photos = sortPhotos(item.gallery_photos ?? [])
  if (photos.length === 0) notFound()
  const cover = photos[0]

  const colors = describeGalleryColors({
    panelColor: item.panel_color,
    panelColorLine: item.panel_color_line,
    trimColor: item.trim_color,
    trimColorLine: item.trim_color_line,
  })

  // ImageGallery schema — feeds Google Image Search + AI Overviews.
  // Each photo gets its own ImageObject with caption + contentLocation.
  const galleryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: `${item.title} — ${item.city}`,
    description:
      item.alt_text ||
      `${item.type} built by Triple J Metal in ${item.city}.`,
    url: `${getSiteUrl()}/gallery/${id}`,
    associatedMedia: photos.map((p) => ({
      '@type': 'ImageObject',
      url: p.image_url,
      contentUrl: p.image_url,
      caption: p.alt_text || item.title,
      contentLocation: {
        '@type': 'Place',
        name: `${item.city}, TX`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: item.city,
          addressRegion: 'TX',
          addressCountry: 'US',
        },
      },
      creator: {
        '@type': 'Organization',
        name: SITE.name,
        url: getSiteUrl(),
      },
      copyrightHolder: {
        '@type': 'Organization',
        name: SITE.name,
      },
      acquireLicensePage: `${getSiteUrl()}/terms`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(galleryJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* ── Hero ── */}
      <section className="relative bg-ink-900 text-white py-16 md:py-20 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="grid md:grid-cols-[1fr_minmax(auto,460px)] gap-10 md:gap-14 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
                Triple J Build · {item.type}
              </span>
              <h1 className="mt-3 text-white">{item.title}</h1>
              <p className="mt-4 text-lg text-white/75">{item.city}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <ButtonLink href="/#quote" variant="primary" size="lg">
                  Build one like this
                </ButtonLink>
                <TrackedPhoneLink
                  surface="gallery_id_hero"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border-2 border-white/30 text-white font-semibold hover:border-white/60 transition-colors text-sm"
                >
                  Call&nbsp;
                </TrackedPhoneLink>
              </div>
            </div>
            <a
              href="#project-photos"
              className="group relative block aspect-4/3 rounded-2xl overflow-hidden bg-ink-800 shadow-xl"
              aria-label={`View all ${photos.length} photos of ${item.title}`}
            >
              <Image
                src={cover.image_url}
                alt={cover.alt_text || item.title}
                fill
                sizes="(max-width: 768px) 100vw, 460px"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                unoptimized={cover.image_url.startsWith('/')}
                priority
              />
              {/* Click affordance overlay */}
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 group-hover:bg-white/25 transition-colors">
                View all {photos.length} photos →
              </span>
            </a>
          </div>
        </Container>
      </section>

      {/* ── Body: photos + sidebar ── */}
      <section className="py-16 md:py-20 bg-white">
        <Container size="wide">
          <div className="grid md:grid-cols-[1fr_300px] gap-12">
            <div>
              <h2 id="project-photos" className="mb-6 scroll-mt-24">
                Project Photos
              </h2>
              {photos.length > 0 ? (
                <PhotoLightbox
                  photos={photos.map((p) => ({
                    id: p.id,
                    src: p.image_url,
                    alt: p.alt_text || item.title,
                  }))}
                />
              ) : (
                <p className="text-ink-500">
                  Additional photos coming soon. Call <TrackedPhoneNumber /> to see more
                  examples like this build.
                </p>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-ink-100 bg-ink-50 p-5">
                <h2 className="text-sm font-bold uppercase tracking-widest text-ink-400 mb-4">
                  Build Details
                </h2>
                <dl className="space-y-3">
                  <DetailRow label="Project" value={item.title} />
                  <DetailRow label="Location" value={item.city} />
                  <DetailRow label="Type" value={item.type} />
                  <DetailRow label="Construction" value={item.tag} />
                  {colors.panel && (
                    <DetailRow
                      label="Panel Color"
                      value={
                        <Link
                          href={`/services/colors#${colors.panel.slug}`}
                          className="text-brand-700 hover:underline"
                        >
                          {colors.panel.name} ({colors.panel.line})
                        </Link>
                      }
                    />
                  )}
                  {colors.trim && (
                    <DetailRow
                      label="Trim Color"
                      value={
                        <Link
                          href={`/services/colors#${colors.trim.slug}`}
                          className="text-brand-700 hover:underline"
                        >
                          {colors.trim.name} ({colors.trim.line})
                        </Link>
                      }
                    />
                  )}
                  {item.panel_profile && (
                    <DetailRow
                      label="Panel Profile"
                      value={
                        <Link
                          href="/services/pbr-vs-pbu-panels"
                          className="text-brand-700 hover:underline"
                        >
                          {item.panel_profile}
                        </Link>
                      }
                    />
                  )}
                  {item.gauge && (
                    <DetailRow label="Gauge" value={`${item.gauge} ga`} />
                  )}
                </dl>
              </div>
              <ButtonLink href="/gallery" variant="secondary" size="sm">
                ← All projects
              </ButtonLink>
            </aside>
          </div>
        </Container>
      </section>

      <QuoteForm />
    </>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </dt>
      <dd className="text-sm font-medium text-ink-800">{value}</dd>
    </div>
  )
}
