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
    <tr className="bg-blue-50">
      <td colSpan={7} className="px-4 py-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input name="name" placeholder="Name *" required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="phone" placeholder="Phone *" required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="email" type="email" placeholder="Email"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="city" placeholder="City"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <textarea name="notes" placeholder="Notes" rows={1}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 col-span-2 resize-none" />
          <div className="flex gap-2 items-center col-span-full md:col-span-1">
            <button type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
              {saving ? 'Saving…' : 'Create Customer'}
            </button>
            <button type="button" onClick={onCancel} disabled={saving}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg transition">
              Cancel
            </button>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
        </form>
      </td>
    </tr>
  )
}
