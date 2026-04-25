'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useHaptics } from '@/lib/hq/haptics'

const COST_TYPES = [
  { value: 'material',     label: 'Material' },
  { value: 'concrete_sub', label: 'Concrete sub' },
  { value: 'labor',        label: 'Labor' },
  { value: 'fuel',         label: 'Fuel' },
  { value: 'permit',       label: 'Permit' },
  { value: 'equipment',    label: 'Equipment' },
  { value: 'misc',         label: 'Misc' },
] as const

type CostType = (typeof COST_TYPES)[number]['value']

type Props = {
  jobId: string
  /** Trigger element (typically a button/link) — clicking opens the sheet. */
  children: ReactNode
}

export function AddCostSheet({ jobId, children }: Props) {
  const router = useRouter()
  const haptics = useHaptics()
  const [open, setOpen] = useState(false)
  const [costType, setCostType] = useState<CostType>('material')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setCostType('material')
    setAmount('')
    setNotes('')
    setError(null)
  }

  async function save() {
    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      setError('Amount must be greater than 0')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/hq/job-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          cost_type: costType,
          amount: amt,
          notes: notes.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(typeof body?.error === 'string' ? body.error : 'Failed to save')
      }
      haptics.success()
      reset()
      setOpen(false)
      router.refresh()
    } catch (err) {
      haptics.error()
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="contents">
        {children}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-cost-title"
            className="relative w-full max-w-md rounded-t-2xl bg-(--surface-1) p-5 shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 id="add-cost-title" className="text-[18px] font-bold text-(--text-primary)">
                Add cost
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-(--text-tertiary) hover:bg-(--surface-2)"
                aria-label="Close"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <p className="mt-1 text-[13px] text-(--text-secondary)">
              For cash spend without a receipt, sub-trade payments, etc.
            </p>

            <label className="mt-4 block">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                Type
              </span>
              <select
                value={costType}
                onChange={(e) => setCostType(e.target.value as CostType)}
                className="mt-1.5 block w-full rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3 text-[15px] text-(--text-primary) outline-none focus:border-(--brand-fg)"
              >
                {COST_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>

            <label className="mt-3 block">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                Amount
              </span>
              <div className="mt-1.5 flex items-center rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 focus-within:border-(--brand-fg)">
                <span className="text-[15px] text-(--text-tertiary)">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent px-2 py-3 text-[15px] text-(--text-primary) outline-none placeholder:text-(--text-tertiary)"
                />
              </div>
            </label>

            <label className="mt-3 block">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                Notes <span className="font-normal normal-case tracking-normal text-(--text-tertiary)">(optional)</span>
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="What was this for?"
                className="mt-1.5 w-full rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-2 text-[14px] text-(--text-primary) outline-none focus:border-(--brand-fg)"
              />
            </label>

            {error ? (
              <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-[13px] text-red-600 dark:text-red-300">
                {error}
              </p>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3 text-[14px] font-semibold text-(--text-primary) tap-list"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-(--brand-fg) px-3 py-3 text-[14px] font-semibold text-white tap-solid disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
