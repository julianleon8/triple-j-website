import type { Metadata } from 'next'

import { BlogIndexPage } from '@/components/pages/BlogIndexPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { BLOG } from '@/i18n/pages/blog'

const t = BLOG.es.index.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('/blog', 'es'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    url: '/es/blog',
    type: 'website',
    ...ogLocale('es'),
  },
}

export default function Page() {
  return <BlogIndexPage locale="es" />
}
