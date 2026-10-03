import type { Metadata } from 'next'

import { MilitaryPage } from '@/components/pages/MilitaryPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { MILITARY } from '@/i18n/pages/military'

const t = MILITARY.es.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('/military', 'es'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    url: '/es/militares',
    type: 'website',
    ...ogLocale('es'),
  },
  twitter: {
    card: 'summary_large_image',
    title: t.twitterTitle,
    description: t.twitterDescription,
  },
}

export default function Page() {
  return <MilitaryPage locale="es" />
}
