import type { Metadata } from 'next'

import { PbrVsPbuPage } from '@/components/pages/PbrVsPbuPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { PBR_PAGE } from '@/i18n/pages/pbr-vs-pbu'

const t = PBR_PAGE.es.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('/services/pbr-vs-pbu-panels', 'es'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    type: 'article',
    ...ogLocale('es'),
  },
}

export default function Page() {
  return <PbrVsPbuPage locale="es" />
}
