'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck, UserSquare2 } from 'lucide-react'
import { useHaptics } from '@/lib/hq/haptics'

type Props = {
  leadId: string
  existingCustomerId: string | null
}

export function ConvertToCustomerButton({ leadId, existingCustomerId }: Props) {
  const router = useRouter()
  const haptics = useHaptics()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function convert() {
    if (pending) return
    setPending(true)
    setError(null)
    try {
      const res = await fetch(`/api/leads/${leadId}/convert`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Failed to convert')
        haptics.error()
        return
      }
      const body = await res.json() as { customer_id: string }
      haptics.success()
      router.push(`/hq/customers/${body.customer_id}`)
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={convert}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-(--brand-fg) px-3 py-4 text-[16px] font-semibold text-white tap-solid disabled:opacity-60"
      >
        <UserCheck size={18} strokeWidth={2} /> {pending ? 'Converting…' : 'Convert to Customer'}
      </button>
      {error && <p className="mt-2 text-center text-[13px] text-red-500">{error}</p>}
    </div>
  )
}
