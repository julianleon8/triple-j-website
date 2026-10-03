import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { GalleryDetailPage, sortPhotos, type GalleryPhoto } from '@/components/pages/GalleryDetailPage'
import { buildWord } from '@/i18n/copy/ui'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { GALLERY } from '@/i18n/pages/gallery'
import { getAdminClient } from '@/lib/supabase/admin'

// HQ edits revalidate this page on demand (src/lib/gallery-revalidate.ts); the
// hourly refresh is the backstop for edits made straight in Supabase.
export const revalidate = 3600

export async function generateStaticParams() {
  const { data } = await getAdminClient()
    .from('gallery_items')
    .select('id')
    .eq('is_active', true)
  return (data ?? []).map((row: { id: string }) => ({ id: row.id }))
}

export async function generateMetadata(
  { params }: PageProps<'/es/galeria/[id]'>,
): Promise<Metadata> {
  const { id } = await params
  const { data: item } = await getAdminClient()
    .from('gallery_items')
    .select('title, city, type, alt_text, gallery_photos ( id, image_url, alt_text, sort_order, is_cover )')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()
  if (!item) return {}
  // Title, city and the photo caption (alt_text) are typed in HQ and show as stored.
  const title = `${item.title} — ${item.city}`
  const description =
    item.alt_text ||
    GALLERY.es.detail.description(buildWord(item.type, 'es'), item.city)
  // The project's own cover photo is the share image; this `openGraph`
  // replaces the layout's wholesale, so `images` has to be named here.
  const cover = sortPhotos((item.gallery_photos ?? []) as GalleryPhoto[])[0]
  return {
    title,
    description,
    alternates: localeAlternates(`/gallery/${id}`, 'es'),
    openGraph: {
      title,
      description,
      url: `/es/galeria/${id}`,
      type: 'article',
      ...ogLocale('es'),
      ...(cover ? { images: [{ url: cover.image_url, alt: cover.alt_text || title }] } : {}),
    },
  }
}

export default async function Page(
  { params }: PageProps<'/es/galeria/[id]'>,
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

  return <GalleryDetailPage locale="es" id={id} item={item} photos={photos} />
}
