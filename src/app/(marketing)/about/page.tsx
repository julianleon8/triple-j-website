import type { Metadata } from 'next'

import { AboutPage } from '@/components/pages/AboutPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { ABOUT } from '@/i18n/pages/about'

const t = ABOUT.en.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('/about', 'en'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    type: 'website',
    ...ogLocale('en'),
  },
}

export default function Page() {
  return <AboutPage locale="en" />
}
