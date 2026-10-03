import type { Metadata } from 'next'

import { AboutPage } from '@/components/pages/AboutPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { ABOUT } from '@/i18n/pages/about'

const t = ABOUT.es.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('/about', 'es'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    url: '/es/nosotros',
    type: 'website',
    ...ogLocale('es'),
  },
}

export default function Page() {
  return <AboutPage locale="es" />
}
