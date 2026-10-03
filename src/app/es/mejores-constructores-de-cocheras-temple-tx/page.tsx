import type { Metadata } from 'next'

import { RoundupPage } from '@/components/pages/RoundupPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { ROUNDUP } from '@/i18n/pages/roundup'

const t = ROUNDUP.es.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('/best-metal-carport-builders-temple-tx', 'es'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    url: '/es/mejores-constructores-de-cocheras-temple-tx',
    type: 'article',
    ...ogLocale('es'),
  },
  twitter: {
    card: 'summary_large_image',
    title: t.ogTitle,
    description: t.ogDescription,
  },
}

export default function Page() {
  return <RoundupPage locale="es" />
}
