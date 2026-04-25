'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { addDaysIso, toIsoDate } from '@/lib/calendar'

type Props = {
  /** Monday ISO of the currently visible week. */
  mondayIso: string
  /** Sunday ISO of the currently visible week. */
  sundayIso: string
  /** Already-formatted human label, e.g. "Apr 21 — Apr 27, 2026". */
  rangeLabel: string
}

/**
 * Prev / Today / Next nav for the /hq/calendar week view. Updates
 * `?week=<monday-iso>` via router.replace (uses useTransition to keep
 * the click feeling instant — Next streams the new week's data while
 * the URL changes).
 */
export function WeekNav({ mondayIso, sundayIso, rangeLabel }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function go(targetMondayIso: string) {
    startTransition(() => {
      router.replace(`/hq/calendar?week=${targetMondayIso}`)
    })
  }

  const prevMonday = addDaysIso(mondayIso, -7)
  const nextMonday = addDaysIso(mondayIso, 7)
  const todayMondayIso = (() => {
    // Compute current Monday locally (mirrors getWeekRange logic).
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const day = d.getDay()
    const offset = day === 0 ? 6 : day - 1
    d.setDate(d.getDate() - offset)
    return toIsoDate(d)
  })()
  const isCurrentWeek = mondayIso === todayMondayIso

  return (
    <header className="flex items-center justify-between gap-2 rounded-2xl border border-(--border-subtle) bg-(--surface-2) px-3 py-2.5">
      <button
        type="button"
        onClick={() => go(prevMonday)}
        disabled={isPending}
        aria-label="Previous week"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--surface-1) text-(--text-primary) tap-list disabled:opacity-50"
      >
        <ChevronLeft size={18} strokeWidth={2} />
      </button>

      <div className="flex flex-col items-center text-center">
        <span className="text-[15px] font-semibold text-(--text-primary)">{rangeLabel}</span>
        <span className="text-[11px] text-(--text-tertiary) tabular-nums">
          {mondayIso} → {sundayIso}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {!isCurrentWeek && (
          <button
            type="button"
            onClick={() => go(todayMondayIso)}
            disabled={isPending}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-(--brand-fg) px-3 text-[13px] font-semibold text-white tap-solid disabled:opacity-50"
          >
            <CalendarDays size={14} strokeWidth={2} />
            Today
          </button>
        )}
        <button
          type="button"
          onClick={() => go(nextMonday)}
          disabled={isPending}
          aria-label="Next week"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--surface-1) text-(--text-primary) tap-list disabled:opacity-50"
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      </div>
    </header>
  )
}
