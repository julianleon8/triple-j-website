import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { buttonClass } from '@/components/forge/styles'
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
    .select('title, city, type, alt_text, gallery_photos ( id, image_url, alt_text, sort_order, is_cover )')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()
  if (!item) return {}
  const title = `${item.title} — ${item.city}`
  const description =
    item.alt_text ||
    `${item.type} built by Triple J Metal in ${item.city}. Welded or bolted, same-week scheduling, Temple TX crew.`
  // The project's own cover photo is the share image — nothing represents the
  // page better. This `openGraph` replaces the layout's wholesale, so without
  // `images` here the page would share no image at all.
  const cover = sortPhotos((item.gallery_photos ?? []) as GalleryPhoto[])[0]
  return {
    title,
    description,
    alternates: { canonical: `/gallery/${id}` },
    openGraph: {
      title,
      description,
      type: 'article',
      ...(cover ? { images: [{ url: cover.image_url, alt: cover.alt_text || title }] } : {}),
    },
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
    <div data-forge="">
      <BreadcrumbJsonLd
        items={[
          { name: 'Gallery', path: '/gallery' },
          { name: item.title, path: `/gallery/${id}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(galleryJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* ── Hero (navy band) ── */}
      <PageHero
        variant="plain"
        breadcrumb={
          <Breadcrumb trail={[{ name: 'Gallery', href: '/gallery' }]} current={item.title} jsonLd={false} />
        }
        eyebrow={`Triple J build · ${item.type}`}
        h1a={item.title}
        lede={item.city}
        contentMax="max-w-[640px]"
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              Build one like this
            </ForgeButtonLink>
            <TrackedPhoneLink surface="gallery_id_hero" mode="children-only" className={buttonClass('outlineDark', 'lg')}>
              Call <TrackedPhoneNumber className="tabular-nums" />
            </TrackedPhoneLink>
          </>
        }
        aside={
          <a
            href="#project-photos"
            className="relative block aspect-4/3 w-full max-w-[460px] overflow-hidden rounded-[12px] border border-forge-silver/[.22] bg-forge-navy-raised shadow-[var(--shadow-mega)]"
            aria-label={`View all ${photos.length} photos of ${item.title}`}
          >
            <Image
              src={cover.image_url}
              alt={cover.alt_text || item.title}
              fill
              sizes="(max-width: 768px) 100vw, 460px"
              className="object-cover object-center"
              unoptimized={cover.image_url.startsWith('/')}
              priority
            />
            <span aria-hidden="true" className="absolute inset-0" style={{ background: 'var(--scrim-photo-card)' }} />
            <span className="absolute right-3 bottom-3 rounded-[6px] border border-white/30 bg-[rgba(0,24,42,.6)] px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[.12em] text-white">
              View all {photos.length} photos →
            </span>
          </a>
        }
      />

      {/* ── Body: photos + details ── */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(56px,6vw,96px)] text-forge-navy">
        <div className="mx-auto grid w-full max-w-[1360px] gap-12 px-[clamp(20px,3vw,40px)] md:grid-cols-[1fr_300px]">
          <div>
            <h2 id="project-photos" className="mb-6 scroll-mt-24 font-forge-display text-[clamp(26px,2vw_+_12px,40px)] font-black leading-[1.1]">
              Project photos
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
              <p className="text-forge-slate">
                Additional photos coming soon. Call <TrackedPhoneNumber /> to see more
                examples like this build.
              </p>
            )}
          </div>

          <aside className="flex flex-col items-start gap-4">
            <div className="w-full rounded-[12px] border border-forge-silver bg-forge-fog p-5">
              <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate">Build details</h2>
              <dl className="flex flex-col gap-3">
                <DetailRow label="Project" value={item.title} />
                <DetailRow label="Location" value={item.city} />
                <DetailRow label="Type" value={item.type} />
                <DetailRow label="Construction" value={item.tag} />
                {colors.panel && (
                  <DetailRow
                    label="Panel Color"
                    value={
                      <Link href={`/services/colors#${colors.panel.slug}`} className={detailLink}>
                        {colors.panel.name} ({colors.panel.line})
                      </Link>
                    }
                  />
                )}
                {colors.trim && (
                  <DetailRow
                    label="Trim Color"
                    value={
                      <Link href={`/services/colors#${colors.trim.slug}`} className={detailLink}>
                        {colors.trim.name} ({colors.trim.line})
                      </Link>
                    }
                  />
                )}
                {item.panel_profile && (
                  <DetailRow
                    label="Panel Profile"
                    value={
                      <Link href="/services/pbr-vs-pbu-panels" className={detailLink}>
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
            <ForgeButtonLink href="/gallery" variant="outlineLight" size="tap">
              ← All projects
            </ForgeButtonLink>
          </aside>
        </div>
      </section>

      <QuoteSection key={item.id} projectReference={{ id: item.id, title: item.title, city: item.city || "Central Texas", type: item.type, image: cover.image_url }} />
    </div>
  )
}

const detailLink = 'border-b border-forge-silver text-forge-navy transition-colors hover:border-forge-navy'

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[11px] font-semibold uppercase tracking-[.18em] text-forge-steel">
        {label}
      </dt>
      <dd className="m-0 text-[14px] font-medium text-forge-navy">{value}</dd>
    </div>
  )
}
