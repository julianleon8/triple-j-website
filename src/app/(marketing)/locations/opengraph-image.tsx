import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card'

/**
 * /locations hub OG card — the page's own H1 and hero copy. City pages keep
 * their own cards; this one covers the hub, which shared no og:image before.
 */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Triple J Metal — metal building installation across Central Texas'

export default function LocationsHubOpenGraphImage() {
  return renderOgCard({
    eyebrow: 'Service Areas',
    headline: 'Metal Building Installation',
    accent: 'Across Central Texas.',
    subhead:
      'Triple J Metal is based in Temple, TX. We build welded or bolted carports, garages, barns, and RV covers across the entire Killeen–Temple–Belton corridor and surrounding counties.',
    path: '/locations',
  })
}
