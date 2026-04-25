export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { CardSkeleton } from '@/components/hq/Skeleton'
import {
  getWeekRange,
  parseWeekParam,
  unifyEvents,
  type AppointmentRowForCalendar,
  type JobRowForCalendar,
  type PermitCallbackRowForCalendar,
} from '@/lib/calendar'
import { CalendarWeek } from './components/CalendarWeek'
import { WeekNav } from './components/WeekNav'

type SearchParams = Promise<{ week?: string }>

/**
 * /hq/calendar — read-only week view (v1).
 *
 * Surfaces three event sources on a Monday-anchored 7-day grid:
 *   - jobs (jobs.scheduled_date through jobs.end_date — multi-day spans)
 *   - permit-lead callbacks (permit_leads.called_at)
 *   - lead site-visit + follow-up appointments (lead_appointments)
 *
 * v1 is read-only. Click any chip → navigate to its detail page.
 * Drag-to-reschedule, day/month views, crew assignments, weather
 * conflicts are all v2/v3/v4 — see the plan file for scope.
 *
 * Manual prereqs (apply in Supabase SQL editor before traffic hits):
 *   - migrations/022_jobs_end_date.sql
 *   - migrations/023_lead_appointments.sql
 */
export default async function CalendarPage({ searchParams }: { searchParams: SearchParams }) {
  const { week } = await searchParams
  const reference = parseWeekParam(week)
  const range = getWeekRange(reference)

  return (
    <div className="space-y-3">
      <Link
        href="/hq/more"
        className="inline-flex items-center gap-1 text-[15px] font-medium text-(--brand-fg)"
      >
        <ArrowLeft size={18} strokeWidth={2} /> More
      </Link>

      <WeekNav
        mondayIso={range.mondayIso}
        sundayIso={range.sundayIso}
        rangeLabel={formatRange(range.start, range.end)}
      />

      <Suspense
        key={range.mondayIso}
        fallback={<CardSkeleton height="h-48" radius="rounded-2xl" />}
      >
        <CalendarEvents range={range} />
      </Suspense>

      <p className="px-1 pt-2 text-[11px] text-(--text-tertiary)">
        Read-only week view. Drag-to-reschedule + crew assignments coming in v2/v3.
      </p>
    </div>
  )
}

/**
 * Suspense'd async server component — fans out the three queries in
 * parallel, hands the unified event list to <CalendarWeek>. Streaming
 * boundary keeps the WeekNav header visible while the data loads.
 */
async function CalendarEvents({ range }: { range: ReturnType<typeof getWeekRange> }) {
  const admin = getAdminClient()

  const weekStartIso = `${range.mondayIso}T00:00:00.000Z`
  // Sunday end-of-day in UTC. The exact tail boundary is fuzzy across
  // local timezone offsets but for a 7-day window we don't need precision.
  const weekEndIso = `${range.sundayIso}T23:59:59.999Z`

  const [jobsRes, permitsRes, apptsRes] = await Promise.all([
    // Jobs: any job that scheduled_date ≤ sunday AND (end_date ≥ monday OR end_date null AND scheduled_date ≥ monday)
    admin
      .from('jobs')
      .select('id, job_number, status, job_type, city, scheduled_date, end_date, customers(name)')
      .lte('scheduled_date', range.sundayIso)
      .or(`end_date.gte.${range.mondayIso},and(end_date.is.null,scheduled_date.gte.${range.mondayIso})`),

    // Permit-lead callbacks within the week.
    admin
      .from('permit_leads')
      .select('id, address, city, called_at, status')
      .gte('called_at', weekStartIso)
      .lt('called_at', weekEndIso),

    // Lead appointments within the week.
    admin
      .from('lead_appointments')
      .select('id, lead_id, appointment_at, kind, notes, leads(name)')
      .gte('appointment_at', weekStartIso)
      .lt('appointment_at', weekEndIso),
  ])

  const events = unifyEvents({
    jobs: (jobsRes.data ?? []) as unknown as JobRowForCalendar[],
    permitCallbacks: (permitsRes.data ?? []) as PermitCallbackRowForCalendar[],
    appointments: (apptsRes.data ?? []) as unknown as AppointmentRowForCalendar[],
  })

  return <CalendarWeek range={range} events={events} />
}

function formatRange(start: Date, end: Date): string {
  // "Apr 21 — 27, 2026" when same month; "Apr 28 — May 4, 2026" when crossing.
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const startMonth = start.toLocaleString('en-US', { month: 'short' })
  const endMonth = end.toLocaleString('en-US', { month: 'short' })
  const startDay = start.getDate()
  const endDay = end.getDate()
  const year = end.getFullYear()
  if (sameMonth) {
    return `${startMonth} ${startDay} — ${endDay}, ${year}`
  }
  return `${startMonth} ${startDay} — ${endMonth} ${endDay}, ${year}`
}
