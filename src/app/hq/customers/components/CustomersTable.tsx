'use client'

import { Fragment, useState } from 'react'
import EditCustomerForm from './EditCustomerForm'

type Customer = {
  id: string
  created_at: string
  name: string
  phone: string
  email: string | null
  city: string | null
  notes: string | null
}

export default function CustomersTable({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSave = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c))
    setEditingId(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
          <tr>
            {['Created', 'Name', 'Phone', 'Email', 'City', 'Notes', ''].map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {customers.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                No customers yet. Customers are added when you convert a lead.
              </td>
            </tr>
          )}
          {customers.map(customer => (
            <Fragment key={customer.id}>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 font-semibold">{customer.name}</td>
                <td className="px-4 py-3">
                  <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline font-mono">
                    {customer.phone}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-500">{customer.email || '—'}</td>
                <td className="px-4 py-3">{customer.city || '—'}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{customer.notes || '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingId(editingId === customer.id ? null : customer.id)}
                    className="text-xs text-yellow-700 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-full font-semibold transition"
                  >
                    {editingId === customer.id ? 'Cancel' : 'Edit'}
                  </button>
                </td>
              </tr>
              {editingId === customer.id && (
                <EditCustomerForm
                  customer={customer}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                />
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
