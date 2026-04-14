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
    <tr className="bg-yellow-50">
      <td colSpan={7} className="px-4 py-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input name="name" defaultValue={customer.name} placeholder="Name" required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <input name="phone" defaultValue={customer.phone} placeholder="Phone" required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <input name="email" defaultValue={customer.email ?? ''} placeholder="Email"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <input name="city" defaultValue={customer.city ?? ''} placeholder="City"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <textarea name="notes" defaultValue={customer.notes ?? ''} placeholder="Notes" rows={1}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 col-span-2 resize-none" />
          <div className="flex gap-2 items-center">
            <button type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-4 py-2 rounded-lg transition">
              Save
            </button>
            <button type="button" onClick={onCancel}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg transition">
              Cancel
            </button>
          </div>
        </form>
      </td>
    </tr>
  )
}
