'use client'

import dynamic from 'next/dynamic'
import type { SheetProps } from './SheetImpl'

export type { SheetProps } from './SheetImpl'

/**
 * Lazy-load wrapper around SheetImpl. Pulls framer-motion (~128 KB) into a
 * separate chunk that only fetches when the user actually opens a sheet.
 *
 * `ssr: false` + `loading: () => null` is correct here because:
 *   1. Sheet renders nothing when `open=false` anyway (it's a closed modal).
 *   2. SSR'ing the framer-motion content for `open=false` would waste server
 *      cycles to render markup that's invisible.
 *   3. First-time open in a session has a ~50ms chunk-fetch delay; subsequent
 *      opens use the cached chunk and feel instant. Acceptable trade-off.
 *
 * See docs/PERF-BASELINE-2026-04-25.md for the full bundle map.
 */
export const Sheet = dynamic<SheetProps>(
  () => import('./SheetImpl').then((m) => m.SheetImpl),
  { ssr: false, loading: () => null },
)
