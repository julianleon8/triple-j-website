'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, XCircle } from 'lucide-react'
import { useHaptics } from '@/lib/hq/haptics'

const LOST_REASONS = [
  { value: 'price',                label: 'Price too high' },
  { value: 'timeline',             label: 'Timeline didn’t work' },
  { value: 'went_with_competitor', label: 'Went with competitor' },
  { value: 'changed_mind',         label: 'Changed mind / cancelled' },
  { value: 'unreachable',          label: 'Unreachable' },
  { value: 'no_budget',            label: 'No budget' },
  { value: 'out_of_area',          label: 'Out of service area' },
  { value: 'other',                label: 'Other' },
] as const

type LostReason = (typeof LOST_REASONS)[number]['value']

type Props = {
  leadId: string
  open: boolean
  onClose: () => void
}

/**
 * Forces lost_reason capture when marking a lead lost. Migration 015's
 * trigger auto-stamps lost_at when status flips to 'lost', so we just
 * PATCH status + lost_reason + lost_reason_notes in one request.
 */
export function LostReasonModal({ leadId, open, onClose }: Props) {
  const router = useRouter()
  const haptics = useHaptics()
  const [reason, setReason] = useState<LostReason | ''>('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function save() {
    if (!reason) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'lost',
          lost_reason: reason,
          lost_reason_notes: notes.trim() || null,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(typeof body?.error === 'string' ? body.error : 'Failed to save')
      }
      haptics.success()
      onClose()
      router.refresh()
    } catch (err) {
      haptics.error()
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lost-reason-title"
        className="relative w-full max-w-md rounded-t-2xl bg-(--surface-1) p-5 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="lost-reason-title" className="text-[18px] font-bold text-(--text-primary)">
            Mark lead as lost
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-(--text-tertiary) hover:bg-(--surface-2)"
            aria-label="Cancel"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <p className="mt-1 text-[13px] text-(--text-secondary)">
          Record why so we can fix the leak.
        </p>

        <fieldset className="mt-4">
          <legend className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
            Reason
          </legend>
          <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {LOST_REASONS.map((r) => (
              <label
                key={r.value}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-[14px] tap-list ${
                  reason === r.value
                    ? 'border-(--brand-fg) bg-(--brand-fg)/10 text-(--brand-fg)'
                    : 'border-(--border-subtle) bg-(--surface-2) text-(--text-primary)'
                }`}
              >
                <input
                  type="radio"
                  name="lost-reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  className="sr-only"
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-4 block">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
            Notes <span className="font-normal normal-case tracking-normal text-(--text-tertiary)">(optional)</span>
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Anything specific to remember?"
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
            onClick={onClose}
            className="rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3 text-[14px] font-semibold text-(--text-primary) tap-list"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!reason || saving}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-3 text-[14px] font-semibold text-white tap-solid disabled:opacity-50"
          >
            <XCircle size={16} strokeWidth={2} />
            {saving ? 'Saving…' : 'Mark lost'}
          </button>
        </div>
      </div>
    </div>
  )
}
