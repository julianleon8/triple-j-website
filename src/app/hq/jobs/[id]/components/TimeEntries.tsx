import { Plus, Clock } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { AddTimeEntrySheet } from './AddTimeEntrySheet'
import { TimeEntryRow } from './TimeEntryRow'

type Props = {
  jobId: string
}

type TimeEntry = {
  id: string
  crew_member: string
  work_date: string
  hours: number
  hourly_rate: number | null
  flat_amount: number | null
  total_cost: number
  notes: string | null
}

/**
 * Server component. Lists every time_entries row for this job grouped
 * by crew_member with subtotal hours + cost. Tap "Add time entry" →
 * sheet. Migration 018's trigger pushes each row into job_costs as
 * cost_type='labor'.
 */
export async function TimeEntries({ jobId }: Props) {
  const admin = getAdminClient()
  const { data } = await admin
    .from('time_entries')
    .select('id, crew_member, work_date, hours, hourly_rate, flat_amount, total_cost, notes')
    .eq('job_id', jobId)
    .order('work_date', { ascending: false })

  const rows = (data ?? []) as TimeEntry[]
  const totalHours = rows.reduce((s, r) => s + Number(r.hours), 0)
  const totalCost = rows.reduce((s, r) => s + Number(r.total_cost), 0)

  // Group by crew_member.
  const byCrew = new Map<string, { rows: TimeEntry[]; hours: number; cost: number }>()
  for (const r of rows) {
    const g = byCrew.get(r.crew_member) ?? { rows: [], hours: 0, cost: 0 }
    g.rows.push(r)
    g.hours += Number(r.hours)
    g.cost += Number(r.total_cost)
    byCrew.set(r.crew_member, g)
  }

  return (
    <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
          <Clock size={14} strokeWidth={2} />
          Time entries
        </h2>
        <AddTimeEntrySheet jobId={jobId}>
          <span className="inline-flex items-center gap-1 rounded-full bg-(--surface-1) border border-(--border-subtle) px-3 py-1.5 text-[13px] font-semibold text-(--text-primary) tap-list">
            <Plus size={14} strokeWidth={2.4} /> Add time
          </span>
        </AddTimeEntrySheet>
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-[13px] text-(--text-tertiary)">
          No labor logged yet. Each entry rolls into the cost ledger as labor.
        </p>
      ) : (
        <>
          <div className="mt-3 space-y-3">
            {[...byCrew.entries()].map(([crew, g]) => (
              <div key={crew}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-(--text-primary)">{crew}</span>
                  <span className="text-[12px] tabular-nums text-(--text-secondary)">
                    {g.hours.toFixed(1)}h · {fmtUSD(g.cost)}
                  </span>
                </div>
                <ul className="space-y-1">
                  {g.rows.map((r) => <TimeEntryRow key={r.id} row={r} />)}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-(--border-subtle) pt-3">
            <span className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
              Total labor
            </span>
            <span className="text-[14px] font-bold tabular-nums text-(--text-primary)">
              {totalHours.toFixed(1)}h · {fmtUSD(totalCost)}
            </span>
          </div>
        </>
      )}
    </section>
  )
}

function fmtUSD(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}
