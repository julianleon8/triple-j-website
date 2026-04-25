'use client'

import { useCallback, useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2, Receipt } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  pendingCount: number
  pushedThisMonth: number
  accountConfigured: boolean
}

type ResultMessage =
  | { kind: 'success'; text: string }
  | { kind: 'error'; text: string }
  | null

export function PendingReceiptsCard({
  pendingCount,
  pushedThisMonth,
  accountConfigured,
}: Props) {
  const router = useRouter()
  const [pushing, setPushing] = useState(false)
  const [result, setResult] = useState<ResultMessage>(null)

  const onPushAll = useCallback(async () => {
    if (pushing) return
    setPushing(true)
    setResult(null)
    try {
      const res = await fetch('/api/hq/receipts/push-all', { method: 'POST' })
      const data = (await res.json().catch(() => ({}))) as {
        attempted?: number
        succeeded?: number
        failures?: Array<{ id: string; vendor: string | null; error: string }>
        error?: string
      }
      if (!res.ok) {
        setResult({ kind: 'error', text: data.error ?? `Failed (${res.status})` })
        return
      }
      const succeeded = data.succeeded ?? 0
      const failures = data.failures ?? []
      if (succeeded === 0 && failures.length === 0) {
        setResult({ kind: 'success', text: 'Nothing to push.' })
      } else if (failures.length === 0) {
        setResult({
          kind: 'success',
          text: `Pushed ${succeeded} receipt${succeeded === 1 ? '' : 's'} to QuickBooks.`,
        })
      } else {
        setResult({
          kind: 'error',
          text: `Pushed ${succeeded}, ${failures.length} still failing — ${failures[0].error.slice(0, 120)}`,
        })
      }
      router.refresh()
    } catch (err) {
      setResult({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Failed',
      })
    } finally {
      setPushing(false)
    }
  }, [pushing, router])

  return (
    <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
            <Receipt size={14} strokeWidth={2} className="text-(--text-secondary)" />
            Receipts queue
          </h2>
          <p className="mt-1 text-xs text-(--text-tertiary)">
            {pendingCount > 0
              ? `${pendingCount} receipt${pendingCount === 1 ? '' : 's'} pending push to QuickBooks.`
              : 'No receipts pending push.'}{' '}
            {pushedThisMonth > 0
              ? `${pushedThisMonth} pushed this month.`
              : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onPushAll}
          disabled={pushing || pendingCount === 0 || !accountConfigured}
          title={
            !accountConfigured
              ? 'Pick a posting account above first.'
              : pendingCount === 0
              ? 'No pending receipts.'
              : undefined
          }
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-(--brand-fg) px-3 py-2 text-[13px] font-semibold text-white tap-solid disabled:opacity-50"
        >
          {pushing ? (
            <>
              <Loader2 size={12} strokeWidth={2} className="animate-spin" /> Pushing…
            </>
          ) : (
            'Push pending'
          )}
        </button>
      </div>

      {result && (
        <div
          className={`flex items-start gap-2 rounded-xl px-3 py-2 text-[12px] ${
            result.kind === 'success'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/15 text-red-600 dark:text-red-400'
          }`}
        >
          {result.kind === 'success' ? (
            <CheckCircle2 size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
          )}
          <span>{result.text}</span>
        </div>
      )}
    </section>
  )
}
