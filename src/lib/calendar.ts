/**
 * Pure helpers for /hq/calendar week view.
 *
 * Server-safe — no React, no DOM. Used by the calendar page server
 * component to compute week boundaries + unify three event sources
 * (jobs, permit-lead callbacks, lead appointments) into a single
 * sorted array of CalendarEvent.
 *
 * Week convention: Monday-anchored. Builder schedules read better
 * with the work week as the visual unit; Sunday is the trailing
 * weekend column. No locale-dependent formatting here — that's the
 * client component's job.
 */

import { JOB_STATUS_CLASS } from '@/lib/pipeline'

/* ─── Types ──────────────────────────────────────────────────────────── */

export type CalendarEventKind = 'job' | 'permit_callback' | 'appointment'

export type CalendarEvent = {
  id: string
  kind: CalendarEventKind
  /** Short title shown on the chip (e.g. "JJM-2026-042 — Carport"). */
  title: string
  /** Optional second line — customer name, address, etc. */
  subtitle?: string
  /** ISO date (YYYY-MM-DD) the event starts. */
  startDate: string
  /** ISO date the event ends inclusive. Same as startDate for single-day events. */
  endDate: string
  /** Optional ISO time-of-day for time-sensitive events (appointments). */
  startTime?: string
  /** Where clicking the chip should go. */
  href: string
  /** Status pill class (Tailwind), if applicable — only jobs render a pill. */
  statusClass?: string
  /** Status string for the pill text. */
  statusLabel?: string
}

export type WeekRange = {
  /** Monday of the visible week, local-time start of day. */
  start: Date
  /** Sunday end-of-day of the visible week. */
  end: Date
  /** ISO date string of the Monday (YYYY-MM-DD). Used in URL query. */
  mondayIso: string
  /** ISO date string of the Sunday (YYYY-MM-DD). */
  sundayIso: string
}

/* ─── Week-range helpers ────────────────────────────────────────────── */

/**
 * Given any date, return the surrounding Monday-Sunday week range with
 * boundaries clamped to local-day start/end. Used to compute the date
 * window the page queries against + the column dates the grid renders.
 */
export function getWeekRange(reference: Date): WeekRange {
  const d = new Date(reference)
  d.setHours(0, 0, 0, 0)
  // getDay: 0 = Sunday … 6 = Saturday. Monday = 1. Treat Sunday as
  // "end of previous week" so the Monday lookback is 6 days, not 0.
  const day = d.getDay()
  const daysFromMonday = day === 0 ? 6 : day - 1
  const start = new Date(d)
  start.setDate(d.getDate() - daysFromMonday)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return {
    start,
    end,
    mondayIso: toIsoDate(start),
    sundayIso: toIsoDate(end),
  }
}

/**
 * Parse the ?week=<iso> query param. Defaults to the current week's
 * Monday when the param is absent or invalid.
 */
export function parseWeekParam(param: string | undefined): Date {
  if (param) {
    const candidate = new Date(`${param}T00:00:00`)
    if (!Number.isNaN(candidate.getTime())) {
      return candidate
    }
  }
  return new Date()
}

/** Render a Date as YYYY-MM-DD in local time (no UTC offset). */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Add `days` (signed) to `iso` and return the new ISO date. */
export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return toIsoDate(d)
}

/* ─── Event unification ─────────────────────────────────────────────── */

export type JobRowForCalendar = {
  id: string
  job_number: string
  status: string
  job_type: string | null
  city: string | null
  scheduled_date: string | null
  end_date: string | null
  customers?: { name: string | null } | null
}

export type PermitCallbackRowForCalendar = {
  id: string
  address: string | null
  city: string | null
  called_at: string
  status: string
}

export type AppointmentRowForCalendar = {
  id: string
  lead_id: string
  appointment_at: string
  kind: string
  notes: string | null
  leads?: { name: string | null } | null
}

/**
 * Merge the three DB row shapes into a unified sorted CalendarEvent list.
 *
 * - jobs without scheduled_date are dropped (not on the schedule)
 * - permit-lead callbacks use called_at (the actual outreach moment)
 * - lead_appointments use appointment_at (scheduled appointment)
 *
 * Sort order: startDate ascending, then startTime ascending (events with
 * a specific time-of-day sort before whole-day events on the same day).
 */
export function unifyEvents(args: {
  jobs: JobRowForCalendar[]
  permitCallbacks: PermitCallbackRowForCalendar[]
  appointments: AppointmentRowForCalendar[]
}): CalendarEvent[] {
  const events: CalendarEvent[] = []

  for (const j of args.jobs) {
    if (!j.scheduled_date) continue
    const startDate = j.scheduled_date.slice(0, 10)
    const endDate = j.end_date ? j.end_date.slice(0, 10) : startDate
    const customer = j.customers?.name ?? null
    const titleParts = [`#${j.job_number}`]
    if (j.job_type) titleParts.push(readableJobType(j.job_type))
    events.push({
      id: `job:${j.id}`,
      kind: 'job',
      title: titleParts.join(' · '),
      subtitle: [customer, j.city].filter(Boolean).join(' · ') || undefined,
      startDate,
      endDate,
      href: `/hq/jobs/${j.id}`,
      statusClass: JOB_STATUS_CLASS[j.status],
      statusLabel: j.status.replace(/_/g, ' '),
    })
  }

  for (const p of args.permitCallbacks) {
    const startDate = p.called_at.slice(0, 10)
    const startTime = p.called_at.slice(11, 16) // HH:MM in UTC; close enough for chip display
    events.push({
      id: `permit:${p.id}`,
      kind: 'permit_callback',
      title: 'Permit callback',
      subtitle: [p.address, p.city].filter(Boolean).join(', ') || undefined,
      startDate,
      endDate: startDate,
      startTime,
      href: `/hq/permit-leads/${p.id}`,
    })
  }

  for (const a of args.appointments) {
    const startDate = a.appointment_at.slice(0, 10)
    const startTime = a.appointment_at.slice(11, 16)
    const customer = a.leads?.name ?? 'Lead'
    events.push({
      id: `appt:${a.id}`,
      kind: 'appointment',
      title: appointmentKindLabel(a.kind),
      subtitle: customer,
      startDate,
      endDate: startDate,
      startTime,
      href: `/hq/leads/${a.lead_id}`,
    })
  }

  events.sort((a, b) => {
    if (a.startDate !== b.startDate) return a.startDate < b.startDate ? -1 : 1
    const at = a.startTime ?? '99:99'
    const bt = b.startTime ?? '99:99'
    return at < bt ? -1 : at > bt ? 1 : 0
  })

  return events
}

function readableJobType(t: string): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function appointmentKindLabel(kind: string): string {
  if (kind === 'site_visit') return 'Site visit'
  if (kind === 'follow_up_call') return 'Follow-up call'
  return 'Appointment'
}

/* ─── Day-of-week helpers (for the grid columns) ─────────────────────── */

export type WeekDay = {
  /** Monday=1 ... Sunday=7. */
  ordinal: 1 | 2 | 3 | 4 | 5 | 6 | 7
  /** Display label, e.g. "Mon". */
  short: string
  /** ISO date, e.g. "2026-04-28". */
  iso: string
  /** True when this day equals today's local date. */
  isToday: boolean
}

const SHORT_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export function weekDays(range: WeekRange): WeekDay[] {
  const todayIso = toIsoDate(new Date())
  return SHORT_DAY_NAMES.map((short, i) => ({
    ordinal: (i + 1) as WeekDay['ordinal'],
    short,
    iso: addDaysIso(range.mondayIso, i),
    isToday: addDaysIso(range.mondayIso, i) === todayIso,
  }))
}

/**
 * Given an event's [startDate, endDate] and a week range, return:
 *   - the column index (1..7) where the event chip starts
 *   - the column span (≤ remaining days in the week from start)
 * Used to place a multi-day job span across the grid.
 *
 * Returns null when the event doesn't overlap the visible week at all
 * (defensive — the page query should filter these already).
 */
export function eventSpanForWeek(
  event: CalendarEvent,
  range: WeekRange,
): { startCol: number; spanCols: number } | null {
  if (event.endDate < range.mondayIso) return null
  if (event.startDate > range.sundayIso) return null

  const visibleStart = event.startDate < range.mondayIso ? range.mondayIso : event.startDate
  const visibleEnd = event.endDate > range.sundayIso ? range.sundayIso : event.endDate

  const startCol = daysBetween(range.mondayIso, visibleStart) + 1
  const spanCols = daysBetween(visibleStart, visibleEnd) + 1

  return { startCol, spanCols }
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(`${fromIso}T00:00:00`).getTime()
  const b = new Date(`${toIso}T00:00:00`).getTime()
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}
