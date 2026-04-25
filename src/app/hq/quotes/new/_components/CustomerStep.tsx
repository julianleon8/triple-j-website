'use client'

import { useMemo, useState } from 'react'
import { Check, UserPlus, X } from 'lucide-react'
import type { WizardCustomer } from './QuoteWizard'
import { Input } from '@/components/hq/ui/Input'

type Props = {
  customers: WizardCustomer[]
  customerId: string | null
  onSelect: (id: string) => void
  onCreated: (customer: WizardCustomer) => void
}

export function CustomerStep({ customers, customerId, onSelect, onCreated }: Props) {
  const [query, setQuery] = useState('')
  const [showNew, setShowNew] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers.slice(0, 25)
    return customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q))
      .slice(0, 25)
  }, [customers, query])

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-[22px] font-bold text-(--text-primary)">Customer</h2>
        <p className="mt-0.5 text-[14px] text-(--text-secondary)">
          Search or pick the customer this quote is for.
        </p>
      </header>

      <Input
        label="Search by name or email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="search"
      />

      {!showNew && (
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-(--border-strong) bg-(--surface-2) px-3 py-3 text-[14px] font-semibold text-(--brand-fg) tap-list"
        >
          <UserPlus size={16} strokeWidth={2} /> New customer
        </button>
      )}

      {showNew && (
        <NewCustomerInline
          onCreated={(c) => {
            setShowNew(false)
            onCreated(c)
          }}
          onCancel={() => setShowNew(false)}
        />
      )}

      <ul className="overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-2) divide-y divide-(--border-subtle)">
        {filtered.length === 0 ? (
          <li className="px-4 py-8 text-center text-[13px] text-(--text-tertiary)">
            No customers match &ldquo;{query}&rdquo;.
          </li>
        ) : (
          filtered.map((c) => {
            const selected = c.id === customerId
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left tap-list ${
                    selected ? 'bg-(--surface-3)' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-(--text-primary) truncate">{c.name}</p>
                    <p className="mt-0.5 text-[12px] text-(--text-tertiary) truncate">
                      {c.email ?? 'No email on file'}
                    </p>
                  </div>
                  {selected && <Check size={18} strokeWidth={2} className="shrink-0 text-(--brand-fg)" />}
                </button>
              </li>
            )
          })
        )}
      </ul>
    </section>
  )
}

type NewCustomerInlineProps = {
  onCreated: (c: WizardCustomer) => void
  onCancel: () => void
}

function NewCustomerInline({ onCreated, onCancel }: NewCustomerInlineProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setError(null)
    if (name.trim().length < 2) { setError('Name is required'); return }
    if (phone.trim().length < 10) { setError('Phone is required'); return }
    setSaving(true)
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        city: city.trim() || undefined,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(typeof body.error === 'string' ? body.error : 'Failed to create customer')
      return
    }
    const created = await res.json() as { id: string; name: string; email: string | null }
    onCreated({ id: created.id, name: created.name, email: created.email ?? null })
  }

  return (
    <div className="space-y-3 rounded-xl border border-(--border-subtle) bg-(--surface-2) p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-(--text-primary)">New customer</h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-(--surface-3) text-(--text-secondary)"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" />
      <Input label="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
      <Input label="City (optional)" value={city} onChange={(e) => setCity(e.target.value)} />
      {error && <p className="text-[13px] text-red-500">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={saving}
        className="w-full rounded-xl bg-(--brand-fg) px-3 py-3 text-[15px] font-semibold text-white tap-solid disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save customer'}
      </button>
    </div>
  )
}
