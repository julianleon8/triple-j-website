import { CONTACT, contactHours } from '@/i18n/pages/contact'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'
import { SITE } from '@/lib/site'

/**
 * /contact OG card: the ways to reach the crew, all from src/lib/site.ts. It
 * deliberately leaves out the page's "we call back same day" — the copy rules
 * reserve the same-day promise for /quote, where it carries its 24-hour
 * guarantee, and a card shared out of context should not stretch it further.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = CONTACT.en.og.alt

export default function ContactOpenGraphImage() {
  const t = CONTACT.en.og
  return renderOgCard({
    eyebrow: t.eyebrow,
    headline: t.headline,
    accent: SITE.phone,
    subhead: t.subhead(SITE.addressOneLine, contactHours('en')),
    path: '/contact',
  })
}
