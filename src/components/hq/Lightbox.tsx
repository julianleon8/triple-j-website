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
