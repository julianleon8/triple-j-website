import type { Metadata } from 'next'

import { ContactPage } from '@/components/pages/ContactPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { CONTACT } from '@/i18n/pages/contact'

const t = CONTACT.es.meta

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: localeAlternates('/contact', 'es'),
  openGraph: {
    title: t.ogTitle,
    description: t.ogDescription,
    url: '/es/contacto',
    type: 'website',
    ...ogLocale('es'),
  },
}

export default function Page() {
  return <ContactPage locale="es" />
}
