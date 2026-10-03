import { MILITARY } from '@/i18n/pages/military'
import { renderMilitaryOgCard } from '@/lib/military-og'
import { OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og-card'

/** /es/militares OG card: the Spanish twin of /military (src/lib/military-og.tsx). */

export const alt = MILITARY.es.og.alt
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function MilitaryOpenGraphImage() {
  return renderMilitaryOgCard('es')
}
