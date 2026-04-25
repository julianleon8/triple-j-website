'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHaptics } from '@/lib/hq/haptics'

const INTENT_STAGES = [
  { value: 'info_gathering', label: 'Browsing',       sub: 'Just exploring' },
  { value: 'timeline_known', label: 'Has timeline',   sub: 'Knows when' },
  { value: 'budget_set',     label: 'Has budget',     sub: 'Knows the number' },
  { value: 'ready_to_buy',   label: 'Ready to buy',   sub: 'Wants quote now' },
] as const

type IntentStage = (typeof INTENT_STAGES)[number]['value']

type Props = {
  leadId: string
  current: IntentStage | null
}

/**
 * Manual intent_stage override (migration 014). The form auto-infers
 * an initial value via inferIntentStage(); this picker lets Julian
 * promote a lead to ready_to_buy after a phone call, or correct an
 * overcalled stage. PATCHes the lead with the new value.
 */
export function IntentStagePicker({ leadId, current }: Props) {
  const router = useRouter()
  const haptics = useHaptics()
  const [pending, setPending] = useState<IntentStage | null>(null)

  async function set(stage: IntentStage) {
    if (pending || stage === current) return
    setPending(stage)
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent_stage: stage }),
      })
      if (res.ok) {
        haptics.tap()
        router.refresh()
      } else {
        haptics.error()
      }
    } finally {
      setPending(null)
    }
  }

  return (
    <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
      <h3 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
        Intent stage
      </h3>
      <p className="mt-1 text-[12px] text-(--text-tertiary)">
        Where the prospect is in their decision. Bump after a real conversation.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {INTENT_STAGES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => set(s.value)}
            disabled={!!pending}
            className={`rounded-xl border px-3 py-2.5 text-left tap-list disabled:opacity-50 ${
              current === s.value
                ? 'border-(--brand-fg) bg-(--brand-fg)/10'
                : 'border-(--border-subtle) bg-(--surface-1)'
            }`}
          >
            <div className={`text-[13px] font-semibold ${
              current === s.value ? 'text-(--brand-fg)' : 'text-(--text-primary)'
            }`}>
              {s.label}
            </div>
            <div className="text-[11px] text-(--text-tertiary)">{s.sub}</div>
          </button>
        ))}
      </div>
    </section>
  )
}
