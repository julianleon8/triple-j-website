import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * /services/pbr-vs-pbu-panels OG card — the page's own H1 and hero copy.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Triple J Metal — PBR vs PBU metal roofing panels compared'

export default function PanelGuideOpenGraphImage() {
  return renderOgCard({
    eyebrow: 'Panel Guide',
    headline: 'PBR vs PBU Metal Roofing Panels',
    accent: 'Which One Do You Need?',
    subhead:
      'Both PBR and PBU panels are high-quality metal roofing options used in Central Texas metal buildings. The right choice depends on your budget, aesthetics, and how much long-term maintenance you want to deal with.',
    path: '/services/pbr-vs-pbu-panels',
  })
}
