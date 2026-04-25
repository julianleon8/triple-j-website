'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, UserSquare2, X } from 'lucide-react'

type Customer = { id: string; name: string; phone: string | null; city: string | null }

type Props = {
  leadId: string
  /** Already-linked referring customer (server-resolved). */
  current: { id: string; name: string } | null
}

/**
 * Typeahead picker that links the lead to the customer who referred
 * them. Powers leads.referring_customer_id (migration 014). Saves
 * via PATCH /api/leads/[id]; clearing sends `referring_customer_id: null`.
 */
export function ReferrerPicker({ leadId, current }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search. Hits /api/customers?q=<query>; empty query
  // returns recents.
  useEffect(() => {
    if (!open) return
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`)
        if (!res.ok) throw new Error('search failed')
        const body = (await res.json()) as { customers: Customer[] }
        setResults(body.customers)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => {
      if (debounce.current) clearTimeout(debounce.current)
    }
  }, [query, open])

  async function pick(customerId: string | null) {
    setSaving(true)
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referring_customer_id: customerId }),
      })
      if (!res.ok) throw new Error('save failed')
      setOpen(false)
      router.refresh()
    } catch {
      // Surface error inline; keep the picker open so user can retry.
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
              Referred by
            </h3>
            <p className="mt-1 truncate text-[15px] text-(--text-primary)">
              {current ? (
                <span className="inline-flex items-center gap-1.5">
                  <UserSquare2 size={14} strokeWidth={2} className="text-(--brand-fg)" />
                  {current.name}
                </span>
              ) : (
                <span className="text-(--text-tertiary)">Not set</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl border border-(--border-subtle) bg-(--surface-1) px-3 py-2 text-[13px] font-semibold text-(--text-primary) tap-list"
          >
            {current ? 'Change' : 'Set'}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
          Pick referring customer
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-(--text-tertiary) hover:bg-(--surface-1)"
          aria-label="Close"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-1) px-3 py-2.5">
        <Search size={16} strokeWidth={2} className="shrink-0 text-(--text-tertiary)" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers by name or phone…"
          className="w-full bg-transparent text-[15px] text-(--text-primary) outline-none placeholder:text-(--text-tertiary)"
        />
      </div>

      <ul className="mt-3 max-h-72 overflow-y-auto">
        {loading && results.length === 0 ? (
          <li className="px-2 py-3 text-[13px] text-(--text-tertiary)">Searching…</li>
        ) : results.length === 0 ? (
          <li className="px-2 py-3 text-[13px] text-(--text-tertiary)">
            {query ? 'No matches' : 'No customers yet'}
          </li>
        ) : (
          results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => pick(c.id)}
                disabled={saving}
                className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2.5 text-left tap-list hover:bg-(--surface-1) disabled:opacity-50"
              >
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-(--text-primary)">
                    {c.name}
                  </div>
                  <div className="truncate text-[12px] text-(--text-tertiary)">
                    {[c.phone, c.city].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {current?.id === c.id ? (
                  <span className="shrink-0 rounded-full bg-(--brand-fg)/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-(--brand-fg)">
                    Current
                  </span>
                ) : null}
              </button>
            </li>
          ))
        )}
      </ul>

      {current ? (
        <button
          type="button"
          onClick={() => pick(null)}
          disabled={saving}
          className="mt-3 w-full rounded-xl border border-(--border-subtle) bg-(--surface-1) px-3 py-2.5 text-[13px] font-medium text-(--text-secondary) tap-list disabled:opacity-50"
        >
          Clear referrer
        </button>
      ) : null}
    </section>
  )
}
