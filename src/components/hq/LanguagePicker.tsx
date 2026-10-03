'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHaptics } from '@/lib/hq/haptics'

const OPTIONS = [
  { value: 'en', label: 'English', sub: 'Emails, texts and quotes in English' },
  { value: 'es', label: 'Español', sub: 'Emails, texts and quotes in Spanish' },
] as const

type Language = (typeof OPTIONS)[number]['value']

/**
 * The language a lead or customer is spoken to in (migration 034). Set from
 * the page the form was filled on; this corrects it after a call, or sets it
 * for a phone or Messenger lead, which always starts as English. A customer's
 * value picks the quote email, SMS and PDF language.
 */
export function LanguagePicker({ endpoint, current }: { endpoint: string; current: string | null | undefined }) {
  const router = useRouter()
  const haptics = useHaptics()
  const [pending, setPending] = useState<Language | null>(null)
  const value: Language = current === 'es' ? 'es' : 'en'

  async function set(language: Language) {
    if (pending || language === value) return
    setPending(language)
    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferred_language: language }),
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
      <h3 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">Language</h3>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => set(o.value)}
            disabled={!!pending}
            aria-pressed={value === o.value}
            className={`rounded-xl border px-3 py-2.5 text-left tap-list disabled:opacity-50 ${
              value === o.value ? 'border-(--brand-fg) bg-(--brand-fg)/10' : 'border-(--border-subtle) bg-(--surface-1)'
            }`}
          >
            <div className={`text-[13px] font-semibold ${value === o.value ? 'text-(--brand-fg)' : 'text-(--text-primary)'}`}>
              {o.label}
            </div>
            <div className="text-[11px] text-(--text-tertiary)">{o.sub}</div>
          </button>
        ))}
      </div>
    </section>
  )
}
