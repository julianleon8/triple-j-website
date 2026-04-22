'use client'

import { useState } from 'react'

type Customer = {
  id: string
  created_at: string
  name: string
  phone: string
  email: string | null
  city: string | null
  notes: string | null
}

interface Props {
  onCreate: (created: Customer) => void
  onCancel: () => void
}

export default function NewCustomerForm({ onCreate, onCancel }: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const form = e.currentTarget
    const data = {
      name:  (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim() || undefined,
      city:  (form.elements.namedItem('city') as HTMLInputElement).value.trim() || undefined,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value.trim() || undefined,
    }

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    setSaving(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(typeof body?.error === 'string' ? body.error : 'Failed to create customer')
      return
    }

    onCreate(await res.json())
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-brand-500/40 bg-brand-600/5 p-4 space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input name="name"  placeholder="Name *"  required className={INPUT} />
        <input name="phone" placeholder="Phone *" required inputMode="tel" className={INPUT} />
        <input name="email" type="email" placeholder="Email" className={INPUT} />
        <input name="city"  placeholder="City" className={INPUT} />
      </div>
      <textarea name="notes" placeholder="Notes" rows={2} className={`${INPUT} resize-none w-full`} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-bold min-h-11 px-4 rounded-lg transition">
          {saving ? 'Saving…' : 'Create Customer'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving}
          className="bg-(--surface-3) hover:opacity-80 text-(--text-primary) text-sm font-bold min-h-11 px-4 rounded-lg transition">
          Cancel
        </button>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </form>
  )
}

const INPUT =
  'min-h-11 rounded-lg border border-(--border-strong) bg-(--surface-1) text-(--text-primary) placeholder:text-(--text-tertiary) px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
