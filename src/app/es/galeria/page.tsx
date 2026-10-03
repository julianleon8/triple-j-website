import type { Metadata } from 'next'

import { GalleryPage } from '@/components/pages/GalleryPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { GALLERY } from '@/i18n/pages/gallery'
import { getBuilds } from '@/lib/forge-builds'

const t = GALLERY.es.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('/gallery', 'es'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    url: '/es/galeria',
    type: 'website',
    ...ogLocale('es'),
  },
}

export default async function Page({ searchParams }: {
  searchParams: Promise<{ type?: string | string[] }>
}) {
  const type = (await searchParams).type
  const builds = await getBuilds({ order: 'featured' })

  return <GalleryPage locale="es" builds={builds} type={type} />
}
