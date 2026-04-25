import { TrendingUp, DollarSign } from 'lucide-react'

type Props = {
  totalContract: number | null
  grossProfit: number | null
  grossMargin: number | null
}

/**
 * Read-only KPIs derived from migration 016's cached columns.
 * Refreshes automatically — receipts (020), time entries (018), and
 * manual cost rows (017) all flow through tg_jobs_recompute_profit.
 *
 * Renders as two tiles. Hidden when total_contract is null because
 * the margin math is meaningless without a contract amount.
 */
export function JobMarginKPIs({ totalContract, grossProfit, grossMargin }: Props) {
  if (totalContract == null || totalContract === 0) {
    return null
  }

  const profitTone =
    grossProfit == null ? 'neutral' :
    grossProfit < 0 ? 'red' :
    grossMargin != null && grossMargin < 0.20 ? 'amber' :
    'green'

  return (
    <section className="grid grid-cols-2 gap-3">
      <div
        className={`rounded-2xl border p-4 ${
          profitTone === 'red' ? 'border-red-500/30 bg-red-500/5' :
          profitTone === 'amber' ? 'border-amber-500/30 bg-amber-500/5' :
          profitTone === 'green' ? 'border-green-500/30 bg-green-500/5' :
          'border-(--border-subtle) bg-(--surface-2)'
        }`}
      >
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
          <DollarSign size={12} strokeWidth={2.5} />
          Gross profit
        </div>
        <div className="mt-1 text-[22px] font-bold tabular-nums text-(--text-primary)">
          {grossProfit == null ? '—' : fmtSignedUSD(grossProfit)}
        </div>
        <div className="mt-0.5 text-[11px] text-(--text-tertiary)">
          Contract {fmtUSD(totalContract)} − costs
        </div>
      </div>

      <div
        className={`rounded-2xl border p-4 ${
          profitTone === 'red' ? 'border-red-500/30 bg-red-500/5' :
          profitTone === 'amber' ? 'border-amber-500/30 bg-amber-500/5' :
          profitTone === 'green' ? 'border-green-500/30 bg-green-500/5' :
          'border-(--border-subtle) bg-(--surface-2)'
        }`}
      >
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
          <TrendingUp size={12} strokeWidth={2.5} />
          Gross margin
        </div>
        <div className="mt-1 text-[22px] font-bold tabular-nums text-(--text-primary)">
          {grossMargin == null ? '—' : `${(grossMargin * 100).toFixed(1)}%`}
        </div>
        <div className="mt-0.5 text-[11px] text-(--text-tertiary)">
          {profitTone === 'red' ? 'Underwater' :
           profitTone === 'amber' ? 'Below 20%' :
           profitTone === 'green' ? 'Healthy' : 'Awaiting costs'}
        </div>
      </div>
    </section>
  )
}

function fmtUSD(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function fmtSignedUSD(n: number): string {
  const sign = n < 0 ? '−' : ''
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}
