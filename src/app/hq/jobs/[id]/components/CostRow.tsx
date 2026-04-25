'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Receipt as ReceiptIcon, Clock, NotebookPen } from 'lucide-react'

type Row = {
  id: string
  cost_type: string
  amount: number
  source_table: 'job_receipts' | 'time_entries' | 'manual'
  source_id: string | null
  logged_at: string
  notes: string | null
}

const SOURCE_ICON = {
  job_receipts: ReceiptIcon,
  time_entries: Clock,
  manual:       NotebookPen,
}

const SOURCE_LABEL = {
  job_receipts: 'Receipt',
  time_entries: 'Time entry',
  manual:       'Manual',
}

/**
 * One ledger row. Manual entries get an inline delete button — receipts
 * and time-entries link back to their upstream views (deletion must
 * flow through the source table to keep the trigger chain consistent).
 */
export function CostRow({ row }: { row: Row }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const Icon = SOURCE_ICON[row.source_table]

  async function handleDelete() {
    if (deleting) return
    if (!confirm('Delete this cost entry?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/hq/job-costs?id=${row.id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl bg-(--surface-1) px-3 py-2">
      <div className="min-w-0 flex items-center gap-2">
        <Icon size={14} strokeWidth={2} className="shrink-0 text-(--text-tertiary)" />
        <div className="min-w-0">
          <div className="truncate text-[13px] text-(--text-primary)">
            {row.notes || SOURCE_LABEL[row.source_table]}
          </div>
          <div className="text-[11px] text-(--text-tertiary)">
            {SOURCE_LABEL[row.source_table]} · {formatRelative(row.logged_at)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[14px] font-semibold tabular-nums text-(--text-primary)">
          ${Number(row.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
        {row.source_table === 'manual' ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg p-1.5 text-(--text-tertiary) hover:bg-(--surface-2) hover:text-red-500 disabled:opacity-50"
            aria-label="Delete cost entry"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </li>
  )
}

function formatRelative(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
