import {
  eventSpanForWeek,
  weekDays,
  type CalendarEvent,
  type WeekRange,
} from '@/lib/calendar'
import { EventChip } from './EventChip'

/**
 * Read-only week grid for /hq/calendar v1.
 *
 * Layout:
 *   - Mobile (< sm): a vertical stack of 7 day-cards. Each card
 *     shows the day header + every event chip stacked.
 *   - Desktop (sm+): 7-column CSS-grid. Single-day events occupy
 *     one column. Multi-day jobs span via grid-column: <start>/<span>.
 *
 * Server component — chips are server-rendered Links. Client only
 * needed for prefetch hover behavior, which Next/Link handles.
 */

type Props = {
  range: WeekRange
  events: CalendarEvent[]
}

export function CalendarWeek({ range, events }: Props) {
  const days = weekDays(range)

  // Mobile rendering: bucket events by day for the vertical stack.
  const eventsByDayIso = new Map<string, CalendarEvent[]>()
  for (const day of days) eventsByDayIso.set(day.iso, [])
  for (const ev of events) {
    // Multi-day jobs render on EACH day they span in the mobile stack.
    let cursor = ev.startDate
    while (cursor <= ev.endDate && cursor <= range.sundayIso) {
      const bucket = eventsByDayIso.get(cursor)
      if (bucket) bucket.push(ev)
      cursor = addOneDay(cursor)
    }
  }

  return (
    <section className="space-y-3">
      {/* ── Mobile: vertical day cards ────────────────────────────── */}
      <div className="space-y-2 sm:hidden">
        {days.map((day) => {
          const dayEvents = eventsByDayIso.get(day.iso) ?? []
          return (
            <div
              key={day.iso}
              className={`rounded-2xl border bg-(--surface-2) p-3 ${
                day.isToday ? 'border-(--brand-fg)' : 'border-(--border-subtle)'
              }`}
            >
              <div className="mb-2 flex items-baseline justify-between">
                <div className={`text-[14px] font-bold ${day.isToday ? 'text-(--brand-fg)' : 'text-(--text-primary)'}`}>
                  {day.short} {dayOfMonth(day.iso)}
                  {day.isToday ? <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider">Today</span> : null}
                </div>
                <div className="text-[11px] text-(--text-tertiary)">
                  {dayEvents.length === 0 ? 'No events' : `${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'}`}
                </div>
              </div>
              {dayEvents.length === 0 ? null : (
                <ul className="space-y-1.5">
                  {dayEvents.map((ev) => (
                    <li key={`${day.iso}::${ev.id}`}>
                      <EventChip event={ev} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Desktop: 7-column grid ────────────────────────────────── */}
      <div className="hidden sm:block">
        {/* Day headers */}
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
        >
          {days.map((day) => (
            <div
              key={day.iso}
              className={`rounded-xl border px-2 py-2 text-center ${
                day.isToday
                  ? 'border-(--brand-fg) bg-(--brand-fg)/5'
                  : 'border-(--border-subtle) bg-(--surface-2)'
              }`}
            >
              <div className={`text-[12px] font-semibold uppercase tracking-wider ${
                day.isToday ? 'text-(--brand-fg)' : 'text-(--text-tertiary)'
              }`}>
                {day.short}
              </div>
              <div className={`mt-0.5 text-[18px] font-bold tabular-nums ${
                day.isToday ? 'text-(--brand-fg)' : 'text-(--text-primary)'
              }`}>
                {dayOfMonth(day.iso)}
              </div>
            </div>
          ))}
        </div>

        {/* Event grid: events placed by their column-span. Stacks vertically
            within each row using auto-flow. Multi-day jobs render once,
            spanning their column range. Single-day events occupy 1 column. */}
        <div
          className="mt-2 grid gap-2"
          style={{
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gridAutoRows: 'minmax(0, auto)',
          }}
        >
          {events.map((ev) => {
            const span = eventSpanForWeek(ev, range)
            if (!span) return null
            return (
              <div
                key={ev.id}
                style={{
                  gridColumnStart: span.startCol,
                  gridColumnEnd: `span ${span.spanCols}`,
                }}
              >
                <EventChip event={ev} />
              </div>
            )
          })}
          {events.length === 0 ? (
            <div
              className="col-span-7 rounded-xl border border-dashed border-(--border-strong) bg-(--surface-2) px-4 py-10 text-center"
              style={{ gridColumn: '1 / span 7' }}
            >
              <p className="text-[14px] text-(--text-secondary)">No events scheduled this week.</p>
              <p className="mt-1 text-[12px] text-(--text-tertiary)">
                Jobs, permit-lead callbacks, and lead appointments will appear here.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/* ─── helpers ─────────────────────────────────────────────────────────── */

function addOneDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function dayOfMonth(iso: string): string {
  return iso.slice(8, 10)
}
