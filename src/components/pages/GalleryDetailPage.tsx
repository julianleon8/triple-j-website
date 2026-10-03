import Image from 'next/image'
import Link from 'next/link'

import { Breadcrumb } from '@/components/forge/Breadcrumb'
import { ForgeButtonLink } from '@/components/forge/ForgeButton'
import { PageHero } from '@/components/forge/PageHero'
import { QuoteSection } from '@/components/forge/QuoteSection'
import { buttonClass } from '@/components/forge/styles'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrackedPhoneLink, TrackedPhoneNumber } from '@/components/site/TrackedPhone'
import { buildWord } from '@/i18n/copy/ui'
import type { Locale } from '@/i18n/config'
import { GALLERY } from '@/i18n/pages/gallery'
import { localizeHref } from '@/i18n/routes'
import { describeGalleryColors } from '@/lib/gallery-colors'
import { SITE } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'

import { PhotoLightbox } from './PhotoLightbox'

export type GalleryPhoto = {
  id: string
  image_url: string
  alt_text: string | null
  sort_order: number
  is_cover: boolean
}

/** The `gallery_items` columns this page shows (typed in HQ; shown as stored). */
export type GalleryItem = {
  id: string
  title: string
  city: string
  type: string
  tag: string | null
  panel_color: string | null
  panel_color_line: string | null
  trim_color: string | null
  trim_color_line: string | null
  panel_profile: string | null
  gauge: string | number | null
}

/** Cover first, then by sort order. */
export function sortPhotos(photos: GalleryPhoto[]): GalleryPhoto[] {
  return photos.slice().sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1
    return a.sort_order - b.sort_order
  })
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

/**
 * /gallery/[id] (English) and /es/galeria/[id] (Spanish). The route files read
 * the item and its photos from Supabase (and 404 when there are none); this
 * renders them. The type and construction words go through `buildWord`;
 * titles, cities, captions and color names show as stored.
 */
export function GalleryDetailPage({
  locale,
  id,
  item,
  photos,
}: {
  locale: Locale
  id: string
  item: GalleryItem
  /** Already sorted (cover first) and never empty. */
  photos: GalleryPhoto[]
}) {
  const t = GALLERY[locale].detail
  const cover = photos[0]
  const typeWord = buildWord(item.type, locale)
  const galleryPath = localizeHref('/gallery', locale)

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
    description: t.jsonLdDescription(typeWord, item.city),
    url: `${getSiteUrl()}${localizeHref(`/gallery/${id}`, locale)}`,
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
          { name: t.gallery, path: '/gallery' },
          { name: item.title, path: `/gallery/${id}` },
        ]}
        locale={locale}
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
          <Breadcrumb trail={[{ name: t.gallery, href: '/gallery' }]} current={item.title} jsonLd={false} locale={locale} />
        }
        eyebrow={t.eyebrow(typeWord)}
        h1a={item.title}
        lede={item.city}
        contentMax="max-w-[640px]"
        actions={
          <>
            <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
              {t.build}
            </ForgeButtonLink>
            <TrackedPhoneLink surface="gallery_id_hero" mode="children-only" className={buttonClass('outlineDark', 'lg')}>
              {t.call}<TrackedPhoneNumber className="tabular-nums" />
            </TrackedPhoneLink>
          </>
        }
        aside={
          <a
            href="#project-photos"
            className="relative block aspect-4/3 w-full max-w-[460px] overflow-hidden rounded-[12px] border border-forge-silver/[.22] bg-forge-navy-raised shadow-[var(--shadow-mega)]"
            aria-label={t.viewAria(photos.length, item.title)}
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
              {t.viewAll(photos.length)}
            </span>
          </a>
        }
      />

      {/* ── Body: photos + details ── */}
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(56px,6vw,96px)] text-forge-navy">
        <div className="mx-auto grid w-full max-w-[1360px] gap-12 px-[clamp(20px,3vw,40px)] md:grid-cols-[1fr_300px]">
          <div>
            <h2 id="project-photos" className="mb-6 scroll-mt-24 font-forge-display text-[clamp(26px,2vw_+_12px,40px)] font-black leading-[1.1]">
              {t.photosTitle}
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
                {t.morePhotosBefore}<TrackedPhoneNumber />{t.morePhotosAfter}
              </p>
            )}
          </div>

          <aside className="flex flex-col items-start gap-4">
            <div className="w-full rounded-[12px] border border-forge-silver bg-forge-fog p-5">
              <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate">{t.detailsTitle}</h2>
              <dl className="flex flex-col gap-3">
                <DetailRow label={t.labels.project} value={item.title} />
                <DetailRow label={t.labels.location} value={item.city} />
                <DetailRow label={t.labels.type} value={typeWord} />
                <DetailRow label={t.labels.construction} value={item.tag ? buildWord(item.tag, locale) : item.tag} />
                {colors.panel && (
                  <DetailRow
                    label={t.labels.panelColor}
                    value={
                      <Link href={localizeHref(`/services/colors#${colors.panel.slug}`, locale)} className={detailLink}>
                        {colors.panel.name} ({colors.panel.line})
                      </Link>
                    }
                  />
                )}
                {colors.trim && (
                  <DetailRow
                    label={t.labels.trimColor}
                    value={
                      <Link href={localizeHref(`/services/colors#${colors.trim.slug}`, locale)} className={detailLink}>
                        {colors.trim.name} ({colors.trim.line})
                      </Link>
                    }
                  />
                )}
                {item.panel_profile && (
                  <DetailRow
                    label={t.labels.panelProfile}
                    value={
                      <Link href={localizeHref('/services/pbr-vs-pbu-panels', locale)} className={detailLink}>
                        {item.panel_profile}
                      </Link>
                    }
                  />
                )}
                {item.gauge && (
                  <DetailRow label={t.labels.gauge} value={t.gaugeValue(String(item.gauge))} />
                )}
              </dl>
            </div>
            <ForgeButtonLink href={galleryPath} variant="outlineLight" size="tap">
              {t.allProjects}
            </ForgeButtonLink>
          </aside>
        </div>
      </section>

      <QuoteSection
        key={item.id}
        locale={locale}
        projectReference={{ id: item.id, title: item.title, city: item.city || "Central Texas", type: item.type, image: cover.image_url }}
      />
    </div>
  )
}
