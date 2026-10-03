import type { Metadata } from 'next'

import { CitiesHubPage } from '@/components/pages/CitiesHubPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { CITIES_HUB } from '@/i18n/pages/locations'
import { LOCATION_SLUGS } from '@/lib/locations'

const t = CITIES_HUB.es.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description(LOCATION_SLUGS.length),
  alternates: localeAlternates('/locations', 'es'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    type: 'website',
    ...ogLocale('es'),
  },
}

/** /es/ciudades — the Spanish twin of /locations (same view, Spanish copy). */
export default function Page() {
  return <CitiesHubPage locale="es" />
}
