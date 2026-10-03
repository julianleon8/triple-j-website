import type { Metadata } from 'next'

import { ColorsPage } from '@/components/pages/ColorsPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { COLORS_PAGE } from '@/i18n/pages/colors'

const t = COLORS_PAGE.en.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('/services/colors', 'en'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    type: 'website',
    ...ogLocale('en'),
  },
}

export default function Page() {
  return <ColorsPage locale="en" />
}
