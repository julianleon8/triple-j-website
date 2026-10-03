import type { Metadata } from 'next'

import { HybridProjectsPage } from '@/components/pages/HybridProjectsPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { HYBRID_PAGE } from '@/i18n/pages/hybrid-projects'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const t = HYBRID_PAGE.es.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('/services/hybrid-projects', 'es'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    type: 'website',
    ...ogLocale('es'),
  },
}

export default async function Page() {
  const { data: projects } = await getAdminClient()
    .from('gallery_items')
    .select(
      `
      *,
      gallery_photos ( id, image_url, alt_text, sort_order, is_cover )
      `,
    )
    .eq('is_active', true)
    .eq('type', 'Hybrid')
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })

  return <HybridProjectsPage locale="es" projects={projects ?? []} />
}
