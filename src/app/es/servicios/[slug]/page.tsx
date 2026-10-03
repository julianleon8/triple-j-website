import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ServicePage } from '@/components/pages/ServicePage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { SERVICE_SLUG_ES, englishPath } from '@/i18n/routes'
import { filterByTypes, getBuilds } from '@/lib/forge-builds'
import { getService } from '@/lib/services.es'

/** The English service for a Spanish slug (`cocheras` → `carports`), or undefined. */
function serviceFor(esSlug: string) {
  const path = englishPath(`/es/servicios/${esSlug}`)
  const enSlug = path?.slice('/services/'.length)
  return enSlug ? getService(enSlug, 'es') : undefined
}

export async function generateStaticParams() {
  return Object.values(SERVICE_SLUG_ES).map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: PageProps<'/es/servicios/[slug]'>
): Promise<Metadata> {
  const { slug } = await params
  const svc = serviceFor(slug)
  if (!svc) return {}
  return {
    title: svc.metaTitle,
    description: svc.metaDescription,
    alternates: localeAlternates(`/services/${svc.slug}`, 'es'),
    openGraph: { title: svc.metaTitle, description: svc.metaDescription, type: 'website', ...ogLocale('es') },
    twitter: {
      card: 'summary_large_image',
      title: svc.metaTitle,
      description: svc.metaDescription,
    },
  }
}

// Recent builds read live gallery_items; refresh hourly.
export const revalidate = 3600

export default async function Page(
  { params }: PageProps<'/es/servicios/[slug]'>
) {
  const { slug } = await params
  const svc = serviceFor(slug)
  if (!svc) notFound()

  // Recent builds: live items of this service's type, shown only with 3+.
  const typed = svc.galleryTypes ? filterByTypes(await getBuilds({ order: 'featured' }), svc.galleryTypes) : []
  const builds = (svc.galleryTag ? typed.filter((b) => b.tag === svc.galleryTag) : typed).slice(0, 8)

  return <ServicePage locale="es" svc={svc} builds={builds} />
}
