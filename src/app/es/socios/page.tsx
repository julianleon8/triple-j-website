import type { Metadata } from 'next'

import { PartnersPage } from '@/components/pages/PartnersPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { PARTNERS } from '@/i18n/pages/partners'
import { getBuilds } from '@/lib/forge-builds'

export const dynamic = 'force-dynamic'

const t = PARTNERS.es.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('/partners', 'es'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    url: '/es/socios',
    type: 'website',
    ...ogLocale('es'),
  },
}

export default async function Page() {
  // Featured jobs first (the gallery's curated flag), then by sort order.
  const featured = (await getBuilds({ order: 'featured' })).slice(0, 6)

  return <PartnersPage locale="es" featured={featured} />
}
