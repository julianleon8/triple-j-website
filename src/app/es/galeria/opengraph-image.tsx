import { GALLERY } from '@/i18n/pages/gallery'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'
import { SITE } from '@/lib/site'

/** /es/galeria OG card: the Spanish twin of /gallery. */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = GALLERY.es.og.alt

export default function GalleryOpenGraphImage() {
  const t = GALLERY.es.og
  return renderOgCard({
    eyebrow: t.eyebrow,
    headline: t.headline,
    accent: t.accent,
    subhead: t.subhead(SITE.stats.projects),
    path: '/es/galeria',
  })
}
