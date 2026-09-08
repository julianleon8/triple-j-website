import type { PipelineBadge } from '@/lib/pipeline'

/**
 * The badge palette, owned in one place.
 *
 * `ListRow` and `MessagesRow` each carried a byte-identical copy of this map,
 * which meant restyling one silently drifted the other — and the two render the
 * same `PipelineRow` in different variants, so the drift would show up as the
 * same lead wearing two different badges depending on which list you opened.
 *
 * Ink is dark on the light hues (amber, yellow) and white on the dark ones.
 * White on amber-500 is ~2.1:1 and must not come back.
 */
export const BADGE_TONE: Record<PipelineBadge['tone'], string> = {
  hot:      'bg-red-500 text-white',
  asap:     'bg-amber-500 text-black',
  mil:      'bg-blue-500 text-white',
  today:    'bg-emerald-500 text-white',
  new:      'bg-sky-500 text-white',
  featured: 'bg-amber-400 text-black',
  warn:     'bg-orange-500 text-white',
}

/** Shared chip geometry — 3px radius, per the 2b scale. */
export const BADGE_CLASS =
  'rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider'
