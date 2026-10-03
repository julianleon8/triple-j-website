import { CONTACT, contactHours } from '@/i18n/pages/contact'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'
import { SITE } from '@/lib/site'

/** /es/contacto OG card: the Spanish twin of /contact (same card, same facts from src/lib/site.ts). */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = CONTACT.es.og.alt

export default function ContactOpenGraphImage() {
  const t = CONTACT.es.og
  return renderOgCard({
    eyebrow: t.eyebrow,
    headline: t.headline,
    accent: SITE.phone,
    subhead: t.subhead(SITE.addressOneLine, contactHours('es')),
    path: '/es/contacto',
  })
}
