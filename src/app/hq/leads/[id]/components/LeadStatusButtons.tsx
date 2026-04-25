'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, MessageCircle, UserCheck, UserSquare2, XCircle } from 'lucide-react'
import { useHaptics } from '@/lib/hq/haptics'
import { LostReasonModal } from './LostReasonModal'

type Props = {
  leadId: string
  currentStatus: string
  existingCustomerId: string | null
}

/**
 * Replaces the legacy ConvertToCustomerButton with a 4-action bar:
 *   - Mark Contacted   → PATCH status='contacted' (first_response_at auto-stamps via 015 trigger)
 *   - Mark Quoted      → PATCH status='quoted'
 *   - Mark Won         → calls existing /convert endpoint (creates customer + sets status='won')
 *   - Mark Lost        → opens LostReasonModal
 *
 * If a customer already exists for this lead, swap to a single
 * "Open customer record" link.
 */
export function LeadStatusButtons({ leadId, currentStatus, existingCustomerId }: Props) {
  const router = useRouter()
  const haptics = useHaptics()
  const [pending, setPending] = useState<'won' | 'contacted' | 'quoted' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lostOpen, setLostOpen] = useState(false)

  if (existingCustomerId) {
    return (
      <Link
        href={`/hq/customers/${existingCustomerId}`}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-(--border-subtle) bg-(--surface-2) px-3 py-4 text-[16px] font-semibold text-(--text-primary) tap-list"
      >
        <UserSquare2 size={18} strokeWidth={2} /> Open customer record
      </Link>
    )
  }

  async function patchStatus(status: 'contacted' | 'quoted') {
    if (pending) return
    setPending(status)
    setError(null)
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      haptics.success()
      router.refresh()
    } catch (err) {
      haptics.error()
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setPending(null)
    }
  }

  async function markWon() {
    if (pending) return
    setPending('won')
    setError(null)
    try {
      const res = await fetch(`/api/leads/${leadId}/convert`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to convert')
      }
      const body = (await res.json()) as { customer_id: string }
      haptics.success()
      router.push(`/hq/customers/${body.customer_id}`)
    } catch (err) {
      haptics.error()
      setError(err instanceof Error ? err.message : 'Failed to convert')
    } finally {
      setPending(null)
    }
  }

  const isLost = currentStatus === 'lost'
  const isWon = currentStatus === 'won'

  return (
    <>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => patchStatus('contacted')}
            disabled={!!pending || currentStatus === 'contacted'}
            className="flex items-center justify-center gap-2 rounded-2xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3.5 text-[14px] font-semibold text-(--text-primary) tap-list disabled:opacity-50"
          >
            <MessageCircle size={16} strokeWidth={2} />
            {pending === 'contacted' ? 'Saving…' : 'Mark Contacted'}
          </button>
          <button
            type="button"
            onClick={() => patchStatus('quoted')}
            disabled={!!pending || currentStatus === 'quoted'}
            className="flex items-center justify-center gap-2 rounded-2xl border border-(--border-subtle) bg-(--surface-2) px-3 py-3.5 text-[14px] font-semibold text-(--text-primary) tap-list disabled:opacity-50"
          >
            <CheckCircle2 size={16} strokeWidth={2} />
            {pending === 'quoted' ? 'Saving…' : 'Mark Quoted'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={markWon}
            disabled={!!pending || isWon}
            className="flex items-center justify-center gap-2 rounded-2xl bg-(--brand-fg) px-3 py-4 text-[16px] font-semibold text-white tap-solid disabled:opacity-50"
          >
            <UserCheck size={18} strokeWidth={2} />
            {pending === 'won' ? 'Converting…' : 'Mark Won'}
          </button>
          <button
            type="button"
            onClick={() => setLostOpen(true)}
            disabled={!!pending || isLost}
            className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-3 py-4 text-[16px] font-semibold text-white tap-solid disabled:opacity-50"
          >
            <XCircle size={18} strokeWidth={2} />
            Mark Lost
          </button>
        </div>

        {error ? <p className="text-center text-[13px] text-red-500">{error}</p> : null}
      </div>

      <LostReasonModal leadId={leadId} open={lostOpen} onClose={() => setLostOpen(false)} />
    </>
  )
}
