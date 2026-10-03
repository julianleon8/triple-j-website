import type { Metadata } from 'next'

import { ColorsPage } from '@/components/pages/ColorsPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { COLORS_PAGE } from '@/i18n/pages/colors'

const t = COLORS_PAGE.es.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('/services/colors', 'es'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    type: 'website',
    ...ogLocale('es'),
  },
}

export default function Page() {
  return <ColorsPage locale="es" />
}
