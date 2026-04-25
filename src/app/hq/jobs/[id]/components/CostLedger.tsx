import { Plus } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { AddCostSheet } from './AddCostSheet'
import { CostRow } from './CostRow'

type Props = {
  jobId: string
}

type JobCost = {
  id: string
  cost_type: string
  amount: number
  source_table: 'job_receipts' | 'time_entries' | 'manual'
  source_id: string | null
  logged_at: string
  notes: string | null
}

const COST_TYPE_LABEL: Record<string, string> = {
  material:     'Material',
  concrete_sub: 'Concrete sub',
  labor:        'Labor',
  fuel:         'Fuel',
  permit:       'Permit',
  equipment:    'Equipment',
  misc:         'Misc',
}

const COST_TYPE_TONE: Record<string, string> = {
  material:     'bg-(--surface-3) text-(--text-primary)',
  concrete_sub: 'bg-stone-500/15 text-stone-700 dark:text-stone-300',
  labor:        'bg-(--brand-fg)/15 text-(--brand-fg)',
  fuel:         'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  permit:       'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
  equipment:    'bg-purple-500/15 text-purple-700 dark:text-purple-300',
  misc:         'bg-(--surface-3) text-(--text-secondary)',
}

/**
 * Server component. Lists all rows in job_costs for this job, grouped
 * by cost_type with subtotals. Each row shows source ("Receipt #4",
 * "Time entry · Freddy", or "Manual") + amount + relative date.
 *
 * Manual rows can be deleted directly via /api/hq/job-costs DELETE
 * (handled in CostRow). Receipt + time-entry rows must be deleted via
 * their upstream tables — surfaced as a hint in the row UI.
 */
export async function CostLedger({ jobId }: Props) {
  const admin = getAdminClient()
  const { data } = await admin
    .from('job_costs')
    .select('id, cost_type, amount, source_table, source_id, logged_at, notes')
    .eq('job_id', jobId)
    .order('logged_at', { ascending: false })

  const rows = (data ?? []) as JobCost[]
  const total = rows.reduce((s, r) => s + Number(r.amount), 0)

  // Group by cost_type for subtotals.
  const grouped = new Map<string, { rows: JobCost[]; subtotal: number }>()
  for (const r of rows) {
    const g = grouped.get(r.cost_type) ?? { rows: [], subtotal: 0 }
    g.rows.push(r)
    g.subtotal += Number(r.amount)
    grouped.set(r.cost_type, g)
  }

  return (
    <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
          Cost ledger
        </h2>
        <AddCostSheet jobId={jobId}>
          <span className="inline-flex items-center gap-1 rounded-full bg-(--surface-1) border border-(--border-subtle) px-3 py-1.5 text-[13px] font-semibold text-(--text-primary) tap-list">
            <Plus size={14} strokeWidth={2.4} /> Add cost
          </span>
        </AddCostSheet>
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-[13px] text-(--text-tertiary)">
          No costs logged yet. Receipts and time entries flow in here automatically; tap “Add cost” for cash spend without a receipt.
        </p>
      ) : (
        <>
          <div className="mt-3 space-y-3">
            {[...grouped.entries()].map(([costType, g]) => (
              <div key={costType}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                      COST_TYPE_TONE[costType] ?? COST_TYPE_TONE.misc
                    }`}
                  >
                    {COST_TYPE_LABEL[costType] ?? costType}
                  </span>
                  <span className="text-[12px] tabular-nums text-(--text-secondary)">
                    {fmtUSD(g.subtotal)}
                  </span>
                </div>
                <ul className="space-y-1">
                  {g.rows.map((r) => (
                    <CostRow key={r.id} row={r} />
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-(--border-subtle) pt-3">
            <span className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
              Total costs
            </span>
            <span className="text-[18px] font-bold tabular-nums text-(--text-primary)">
              {fmtUSD(total)}
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
