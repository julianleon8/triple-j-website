import type { Metadata } from 'next'

import { QuotePage } from '@/components/pages/QuotePage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { QUOTE } from '@/i18n/pages/quote'
import { getBuilds } from '@/lib/forge-builds'
import type { ProjectReference } from '@/lib/project-reference'
import { parseQuotePrefill } from '@/lib/quote-prefill'
import { getAdminClient } from '@/lib/supabase/admin'

const t = QUOTE.es.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  // Bare canonical on purpose (see /quote): every ad variant arrives with its
  // own query string, and each would otherwise look like a separate URL.
  alternates: localeAlternates('/quote', 'es'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    url: '/es/cotizacion',
    type: 'website',
    ...ogLocale('es'),
  },
}

type GalleryRow = {
  id: string
  title: string
  city: string | null
  type: string
  gallery_photos: { image_url: string; is_cover: boolean; sort_order: number }[] | null
}

/**
 * Resolve ?project= against live gallery data, the same way /api/leads does.
 *
 * Unlike the API route, a failure here is not a 503. Nothing is lost by
 * rendering the form without the reference card — the customer has not typed
 * anything yet — whereas failing the page would cost the whole visit.
 */
async function loadReference(id: string): Promise<ProjectReference | undefined> {
  try {
    const { data, error } = await getAdminClient()
      .from('gallery_items')
      .select('id, title, city, type, gallery_photos ( image_url, is_cover, sort_order )')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle<GalleryRow>()

    if (error || !data) return undefined

    const photos = data.gallery_photos ?? []
    const cover = photos.find((p) => p.is_cover) ?? [...photos].sort((a, b) => a.sort_order - b.sort_order)[0]
    if (!cover) return undefined

    return {
      id: data.id,
      title: data.title,
      city: data.city || 'Central Texas',
      type: data.type,
      image: cover.image_url,
    }
  } catch {
    return undefined
  }
}

export default async function Page({ searchParams }: PageProps<'/es/cotizacion'>) {
  const prefill = parseQuotePrefill(await searchParams)
  const isFencing = prefill.service === 'fencing' && !prefill.projectId
  const reference = prefill.projectId ? await loadReference(prefill.projectId) : undefined
  const builds = isFencing ? [] : await getBuilds({ order: 'featured', limit: 6 })

  return <QuotePage locale="es" prefill={prefill} reference={reference} builds={builds} />
}
