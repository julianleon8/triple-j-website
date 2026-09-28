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
export const alt = `Contact Triple J Metal — call ${SITE.phone}`

export default function ContactOpenGraphImage() {
  return renderOgCard({
    eyebrow: 'Contact',
    headline: 'Get in Touch',
    accent: SITE.phone,
    subhead: `${SITE.addressOneLine} · ${SITE.hours}`,
    path: '/contact',
  })
}
