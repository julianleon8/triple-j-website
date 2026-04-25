'use client'

import dynamic from 'next/dynamic'
import type { LightboxProps } from './LightboxImpl'

export type { LightboxPhoto, LightboxProps } from './LightboxImpl'

/**
 * Lazy-load wrapper around LightboxImpl. Pulls framer-motion (~128 KB) into
 * a separate chunk that only fetches when the user actually taps a photo.
 *
 * Same `ssr: false, loading: () => null` strategy as ./Sheet.tsx — the
 * Lightbox renders nothing when `open=false`, so SSR'ing it would just be
 * deadweight markup. First-time tap has a ~50ms chunk fetch; subsequent
 * taps use the cached chunk.
 */
export const Lightbox = dynamic<LightboxProps>(
  () => import('./LightboxImpl').then((m) => m.LightboxImpl),
  { ssr: false, loading: () => null },
)

/**
 * Hover-prefetch helper. Call from any element that triggers a Lightbox
 * open (e.g. onPointerEnter / onFocus on a photo thumbnail). Kicks off
 * the lazy chunk fetch in the background so the first photo-tap in the
 * session feels instant.
 *
 * No-op on the server. Idempotent.
 */
export function prefetchLightbox(): void {
  if (typeof window === 'undefined') return
  void import('./LightboxImpl')
}
