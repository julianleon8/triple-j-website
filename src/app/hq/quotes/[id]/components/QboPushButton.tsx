'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { useHaptics } from '@/lib/hq/haptics'

/**
 * Pushes an accepted quote into QuickBooks Online as a draft invoice.
 *
 * Lifted out of the old QuoteEditor when quotes went read-only. It was the one
 * thing in that component with no equivalent in QuoteDetailActions, so it had
 * to survive the deletion — everything else there (save, send) was either
 * quote-building or a duplicate of an action already on this page.
 */
export function QboPushButton({ id }: { id: string }) {
  const haptics = useHaptics()
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function push() {
    if (pending) return
    setPending(true)
    setResult(null)
    setError(null)
    const res = await fetch(`/api/qbo/push/${id}`, { method: 'POST' })
    setPending(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(typeof body.error === 'string' ? body.error : 'QuickBooks push failed')
      haptics.error()
      return
    }
    const body = (await res.json().catch(() => ({}))) as { invoiceId?: string }
    setResult(
      body.invoiceId
        ? `Pushed to QuickBooks — invoice ${body.invoiceId}`
        : 'Pushed to QuickBooks',
    )
    haptics.success()
  }

  return (
    <div className="rounded-md border border-(--border-subtle) bg-(--surface-2) p-4">
      <button
        type="button"
        onClick={push}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md bg-(--link-fg) px-5 py-2.5 text-[15px] font-semibold text-(--text-on-brand) tap-solid disabled:opacity-50"
      >
        <Upload size={16} strokeWidth={2} />
        {pending ? 'Pushing…' : 'Push to QuickBooks'}
      </button>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.04em] text-(--text-tertiary)">
        Creates a draft invoice in QuickBooks Online
      </p>
      {result && <p className="mt-2 text-[13px] text-green-600 dark:text-green-400">{result}</p>}
      {error && <p className="mt-2 text-[13px] text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
