'use client'

import { useState } from 'react'
import EditCustomerForm from './EditCustomerForm'
import NewCustomerForm from './NewCustomerForm'

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
  const [showNewForm, setShowNewForm] = useState(false)

  const handleSave = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c))
    setEditingId(null)
  }

  const handleCreate = (created: Customer) => {
    setCustomers(prev => [created, ...prev])
    setShowNewForm(false)
  }

  return (
    <div className="space-y-3">
      {/* Create toggle */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-(--text-secondary)">{customers.length} customer{customers.length === 1 ? '' : 's'}</span>
        <button
          onClick={() => setShowNewForm(v => !v)}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold min-h-11 px-4 rounded-lg transition"
        >
          {showNewForm ? 'Cancel' : '+ New Customer'}
        </button>
      </div>

      {showNewForm && (
        <NewCustomerForm onCreate={handleCreate} onCancel={() => setShowNewForm(false)} />
      )}

      {customers.length === 0 && !showNewForm && (
        <div className="rounded-xl border border-(--border-subtle) bg-(--surface-2) p-10 text-center">
          <p className="text-sm text-(--text-secondary)">
            No customers yet. Tap <strong>+ New Customer</strong> or convert a lead.
          </p>
        </div>
      )}

      {/* Mobile cards (hidden md:+) */}
      <ul className="md:hidden space-y-2">
        {customers.map(customer => (
          <li key={customer.id} className="rounded-xl border border-(--border-subtle) bg-(--surface-2) p-4">
            {editingId === customer.id ? (
              <EditCustomerForm
                customer={customer}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[17px] font-semibold text-(--text-primary) truncate">
                      {customer.name}
                    </div>
                    {customer.city && (
                      <div className="mt-0.5 text-[13px] text-(--text-secondary)">{customer.city}</div>
                    )}
                  </div>
                  <time className="shrink-0 text-[11px] text-(--text-tertiary)">
                    {new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </time>
                </div>

                {customer.email && (
                  <div className="text-[13px] text-(--text-secondary) truncate">{customer.email}</div>
                )}

                {customer.notes && (
                  <p className="mt-2 text-[13px] text-(--text-secondary) line-clamp-2">{customer.notes}</p>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex-1 min-h-11 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 text-white text-[15px] font-semibold px-3 py-2 active:scale-95 transition-transform"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.33 1.9.63 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.3 1.85.51 2.81.63A2 2 0 0122 16.92z" />
                    </svg>
                    {customer.phone}
                  </a>
                  <button
                    onClick={() => setEditingId(customer.id)}
                    className="min-h-11 px-4 rounded-lg bg-(--surface-3) text-(--text-primary) text-[13px] font-semibold"
                  >
                    Edit
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Desktop table (hidden below md:) */}
      <div className="hidden md:block rounded-xl shadow-sm border border-(--border-subtle) bg-(--surface-2) overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-(--surface-3) text-(--text-secondary) uppercase text-xs border-b border-(--border-subtle)">
            <tr>
              {['Created', 'Name', 'Phone', 'Email', 'City', 'Notes', ''].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border-subtle) text-(--text-primary)">
            {customers.map(customer => (
              <tr key={customer.id} className="hover:bg-(--surface-3) transition-colors align-top">
                <td className="px-4 py-3 text-(--text-tertiary) whitespace-nowrap">
                  {new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 font-semibold">{customer.name}</td>
                <td className="px-4 py-3">
                  <a href={`tel:${customer.phone}`} className="text-(--brand-fg) hover:underline font-mono">
                    {customer.phone}
                  </a>
                </td>
                <td className="px-4 py-3 text-(--text-secondary)">{customer.email || '—'}</td>
                <td className="px-4 py-3">{customer.city || '—'}</td>
                <td className="px-4 py-3 text-(--text-secondary) max-w-xs truncate">{customer.notes || '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingId(editingId === customer.id ? null : customer.id)}
                    className="text-xs text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 hover:opacity-80 px-3 py-1 rounded-full font-semibold transition"
                  >
                    {editingId === customer.id ? 'Cancel' : 'Edit'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Desktop edit form shows below the table to avoid colSpan trickery */}
        {editingId && customers.find(c => c.id === editingId) && (
          <div className="border-t border-(--border-subtle) p-4">
            <EditCustomerForm
              customer={customers.find(c => c.id === editingId)!}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
