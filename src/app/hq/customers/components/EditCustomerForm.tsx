'use client'

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
  customer: Customer
  onSave: (updated: Customer) => void
  onCancel: () => void
}

export default function EditCustomerForm({ customer, onSave, onCancel }: Props) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      city: (form.elements.namedItem('city') as HTMLInputElement).value,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value,
    }

    const res = await fetch(`/api/customers/${customer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      const updated = await res.json()
      onSave(updated)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input name="name"  defaultValue={customer.name}        placeholder="Name"  required className={INPUT} />
        <input name="phone" defaultValue={customer.phone}       placeholder="Phone" required inputMode="tel" className={INPUT} />
        <input name="email" defaultValue={customer.email ?? ''} placeholder="Email" className={INPUT} />
        <input name="city"  defaultValue={customer.city  ?? ''} placeholder="City"  className={INPUT} />
      </div>
      <textarea name="notes" defaultValue={customer.notes ?? ''} placeholder="Notes" rows={2} className={`${INPUT} resize-none w-full`} />
      <div className="flex gap-2">
        <button type="submit"
          className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold min-h-11 px-4 rounded-lg transition">
          Save
        </button>
        <button type="button" onClick={onCancel}
          className="bg-(--surface-3) hover:opacity-80 text-(--text-primary) text-sm font-bold min-h-11 px-4 rounded-lg transition">
          Cancel
        </button>
      </div>
    </form>
  )
}

const INPUT =
  'min-h-11 rounded-lg border border-(--border-strong) bg-(--surface-1) text-(--text-primary) placeholder:text-(--text-tertiary) px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400'
