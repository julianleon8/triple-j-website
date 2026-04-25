'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, AlertCircle, Check } from 'lucide-react'

type Account = { id: string; name: string; accountType: string }

type Props = {
  currentId: string | null
  currentName: string | null
}

/**
 * /hq/settings/quickbooks → "Receipt OCR — posting account" picker.
 * Loads accounts from /api/qbo/accounts on mount, persists the selection
 * via /api/qbo/expense-account.
 */
export function ExpenseAccountPicker({ currentId, currentName }: Props) {
  const [accounts, setAccounts] = useState<Account[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<string | null>(currentId)
  const [savedId, setSavedId] = useState<string | null>(currentId)
  const [savedName, setSavedName] = useState<string | null>(currentName)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/qbo/accounts')
        const data = (await res.json().catch(() => ({}))) as {
          accounts?: Account[]
          error?: string
        }
        if (cancelled) return
        if (!res.ok) {
          setLoadError(data.error ?? `Failed to load (${res.status})`)
          setAccounts([])
        } else {
          setAccounts(data.accounts ?? [])
        }
      } catch (err) {
        if (cancelled) return
        setLoadError(err instanceof Error ? err.message : 'Failed to load accounts')
        setAccounts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const onSave = useCallback(async () => {
    setSaving(true)
    setSaveError(null)
    const account = accounts?.find((a) => a.id === selectedId) ?? null
    try {
      const res = await fetch('/api/qbo/expense-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: selectedId,
          account_name: account?.name ?? null,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setSaveError(data.error ?? `Save failed (${res.status})`)
      } else {
        setSavedId(selectedId)
        setSavedName(account?.name ?? null)
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [selectedId, accounts])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-(--text-tertiary)">
        <Loader2 size={14} strokeWidth={2} className="animate-spin" />
        Loading accounts from QuickBooks…
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-start gap-2 rounded-xl bg-red-500/15 px-3 py-2 text-[13px] text-red-600 dark:text-red-400">
        <AlertCircle size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
        <span>{loadError}</span>
      </div>
    )
  }

  if (!accounts || accounts.length === 0) {
    return (
      <p className="text-sm text-(--text-tertiary)">
        No expense accounts found. Add one in QuickBooks Online and refresh.
      </p>
    )
  }

  const dirty = selectedId !== savedId

  return (
    <div className="space-y-3">
      <select
        value={selectedId ?? ''}
        onChange={(e) => setSelectedId(e.target.value || null)}
        className="w-full rounded-xl border border-(--border-strong) bg-(--surface-1) px-3 py-2.5 text-[15px] text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--brand-fg)"
      >
        <option value="">— No account selected —</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
            {a.accountType ? ` · ${a.accountType}` : ''}
          </option>
        ))}
      </select>

      {savedId && savedName && !dirty && (
        <div className="flex items-center gap-2 text-[12px] text-emerald-600 dark:text-emerald-400">
          <Check size={12} strokeWidth={2.4} />
          <span>
            Receipts post to <strong>{savedName}</strong>.
          </span>
        </div>
      )}

      {saveError && (
        <div className="flex items-start gap-2 rounded-xl bg-red-500/15 px-3 py-2 text-[12px] text-red-600 dark:text-red-400">
          <AlertCircle size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={saving || !dirty}
        className="inline-flex items-center gap-1.5 rounded-xl bg-(--brand-fg) px-4 py-2 text-[14px] font-semibold text-white tap-solid disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 size={14} strokeWidth={2} className="animate-spin" /> Saving…
          </>
        ) : dirty ? (
          'Save'
        ) : (
          'Saved'
        )}
      </button>
    </div>
  )
}
