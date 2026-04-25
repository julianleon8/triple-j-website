import Link from 'next/link'
import type { CalendarEvent } from '@/lib/calendar'

/**
 * Single-line calendar event chip. Color-coded by event kind:
 *   - job              -> brand-blue with status pill
 *   - permit_callback  -> indigo
 *   - appointment      -> amber
 *
 * Server component. The grid (CalendarWeek) handles placement; this
 * component renders the chip's interior + the link wrapper.
 */

const KIND_CLASS: Record<CalendarEvent['kind'], string> = {
  job:              'bg-(--brand-fg)/10 border-(--brand-fg)/25 text-(--brand-fg) hover:bg-(--brand-fg)/15',
  permit_callback:  'bg-indigo-500/10 border-indigo-500/25 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/15',
  appointment:      'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/15',
}

export function EventChip({ event }: { event: CalendarEvent }) {
  return (
    <Link
      href={event.href}
      prefetch
      className={`block rounded-lg border px-2 py-1.5 text-[11px] leading-tight tap-list ${KIND_CLASS[event.kind]}`}
    >
      <div className="flex items-baseline gap-1.5">
        {event.startTime ? (
          <span className="shrink-0 font-semibold tabular-nums">{event.startTime}</span>
        ) : null}
        <span className="font-semibold truncate">{event.title}</span>
      </div>
      {event.subtitle ? (
        <div className="mt-0.5 truncate text-[10px] opacity-75">{event.subtitle}</div>
      ) : null}
      {event.statusLabel ? (
        <span
          className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
            event.statusClass ?? 'bg-(--surface-3) text-(--text-secondary)'
          }`}
        >
          {event.statusLabel}
        </span>
      ) : null}
    </Link>
  )
}
