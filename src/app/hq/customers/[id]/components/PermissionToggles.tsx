'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, MessageSquareHeart } from 'lucide-react'
import { useHaptics } from '@/lib/hq/haptics'

type Props = {
  customerId: string
  featurePermission: boolean | null
  repeatContactPermission: boolean | null
}

/**
 * Two flywheel permissions (migration 019). null = never asked, true =
 * yes, false = asked + said no. The UI shows three states per toggle
 * (Not asked / Yes / No) — the API stamps *_asked_at on the first
 * non-null change.
 */
export function PermissionToggles({
  customerId,
  featurePermission,
  repeatContactPermission,
}: Props) {
  return (
    <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
      <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
        Permissions
      </h2>
      <div className="mt-3 space-y-3">
        <Toggle
          customerId={customerId}
          kind="feature"
          icon={Camera}
          label="Feature in marketing"
          sub="Use photos of this build in case studies / ads"
          value={featurePermission}
        />
        <Toggle
          customerId={customerId}
          kind="repeat"
          icon={MessageSquareHeart}
          label="Repeat contact"
          sub="OK to text in 12mo for accessory or expansion"
          value={repeatContactPermission}
        />
      </div>
    </section>
  )
}

function Toggle({
  customerId, kind, icon: Icon, label, sub, value,
}: {
  customerId: string
  kind: 'feature' | 'repeat'
  icon: typeof Camera
  label: string
  sub: string
  value: boolean | null
}) {
  const router = useRouter()
  const haptics = useHaptics()
  const [busy, setBusy] = useState(false)

  async function set(next: boolean) {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/permission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, value: next }),
      })
      if (res.ok) {
        haptics.tap()
        router.refresh()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-(--surface-1) p-3">
      <div className="flex min-w-0 items-start gap-2">
        <Icon size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-(--text-tertiary)" />
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-(--text-primary)">{label}</div>
          <div className="text-[12px] text-(--text-tertiary)">{sub}</div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 rounded-lg bg-(--surface-2) p-0.5">
        <button
          type="button"
          onClick={() => set(false)}
          disabled={busy}
          className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${
            value === false
              ? 'bg-(--surface-3) text-(--text-primary) shadow-sm'
              : 'text-(--text-tertiary)'
          }`}
        >
          No
        </button>
        <button
          type="button"
          onClick={() => set(true)}
          disabled={busy}
          className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${
            value === true
              ? 'bg-(--brand-fg) text-white shadow-sm'
              : 'text-(--text-tertiary)'
          }`}
        >
          Yes
        </button>
      </div>
    </div>
  )
}
