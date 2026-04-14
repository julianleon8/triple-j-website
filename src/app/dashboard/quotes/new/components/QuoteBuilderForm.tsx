'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Customer = { id: string; name: string; email: string | null }
type LineItem = { description: string; quantity: number; unit_price: number; sort_order: number }
type Template = { id: string; name: string; line_items: LineItem[] }

interface Props {
  customers: Customer[]
}

const emptyItem = (): LineItem => ({ description: '', quantity: 1, unit_price: 0, sort_order: 0 })

export default function QuoteBuilderForm({ customers }: Props) {
  const router = useRouter()
  const [customerId, setCustomerId] = useState('')
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyItem()])
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])

  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value, sort_order: i } : item
    ))
  }

  const removeItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index))
  }

  const loadTemplates = async () => {
    if (templates.length === 0) {
      const res = await fetch('/api/quote-templates')
      if (res.ok) setTemplates(await res.json())
    }
    setShowTemplates(true)
  }

  const applyTemplate = (template: Template) => {
    setLineItems(prev => [
      ...prev.filter(i => i.description !== ''),
      ...template.line_items.map((item, i) => ({ ...item, sort_order: prev.length + i })),
    ])
    setShowTemplates(false)
  }

  const handleSave = async () => {
    setError('')
    if (!customerId) { setError('Please select a customer'); return }
    const validItems = lineItems.filter(i => i.description.trim())
    if (!validItems.length) { setError('Add at least one line item'); return }

    setIsSaving(true)
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customerId,
        valid_until: validUntil,
        notes,
        line_items: validItems.map((item, i) => ({ ...item, sort_order: i })),
      }),
    })

    const data = await res.json()
    setIsSaving(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to save quote')
      return
    }

    setSavedQuoteId(data.id)
  }

  const handleSend = async () => {
    if (!savedQuoteId) return
    setIsSending(true)
    setError('')

    const res = await fetch(`/api/quotes/${savedQuoteId}/send`, { method: 'POST' })
    const data = await res.json()
    setIsSending(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to send quote')
      return
    }

    router.push(`/dashboard/quotes/${savedQuoteId}`)
    router.refresh()
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Customer + Validity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Quote Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Customer</label>
            <select
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Select a customer…</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}{c.email ? ` — ${c.email}` : ' (no email)'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valid Until</label>
            <input
              type="date"
              value={validUntil}
              onChange={e => setValidUntil(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Payment terms, job details, special instructions…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Line Items</h2>
          <button
            type="button"
            onClick={loadTemplates}
            className="text-xs text-yellow-700 bg-yellow-100 hover:bg-yellow-200 px-3 py-1.5 rounded-lg font-semibold transition"
          >
            + Add from Template
          </button>
        </div>

        {/* Template picker */}
        {showTemplates && (
          <div className="mb-4 border border-yellow-200 rounded-lg overflow-hidden">
            <div className="bg-yellow-50 px-4 py-2 flex justify-between items-center">
              <span className="text-xs font-semibold text-yellow-800">Select a template</span>
              <button onClick={() => setShowTemplates(false)} className="text-xs text-yellow-600 hover:text-yellow-800">✕</button>
            </div>
            {templates.length === 0
              ? <p className="px-4 py-3 text-sm text-gray-400">No templates found.</p>
              : templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-yellow-50 border-t border-yellow-100 transition"
                >
                  <span className="font-medium">{t.name}</span>
                </button>
              ))
            }
          </div>
        )}

        {/* Header */}
        <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-medium text-gray-500 uppercase">
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Unit Price</div>
          <div className="col-span-1 text-right">Total</div>
          <div className="col-span-1" />
        </div>

        {lineItems.map((item, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
            <input
              value={item.description}
              onChange={e => updateItem(i, 'description', e.target.value)}
              placeholder="Description"
              className="col-span-6 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={item.quantity}
              onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
              className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.unit_price}
              onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
              className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <div className="col-span-1 text-right text-sm font-medium text-gray-700">
              ${(item.quantity * item.unit_price).toFixed(2)}
            </div>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="col-span-1 text-gray-300 hover:text-red-400 text-center transition text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setLineItems(prev => [...prev, { ...emptyItem(), sort_order: prev.length }])}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg px-4 py-2 w-full transition"
        >
          + Add Row
        </button>

        {/* Subtotal */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <div className="text-right">
            <div className="text-sm text-gray-500">Subtotal</div>
            <div className="text-xl font-bold">${subtotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3">
        {!savedQuoteId ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-200 text-black font-bold px-6 py-2.5 rounded-lg transition text-sm"
          >
            {isSaving ? 'Saving…' : 'Save Draft'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/quotes/${savedQuoteId}`)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-2.5 rounded-lg transition text-sm"
            >
              View Draft
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="bg-green-600 hover:bg-green-500 disabled:bg-green-300 text-white font-bold px-6 py-2.5 rounded-lg transition text-sm"
            >
              {isSending ? 'Sending…' : 'Send Quote to Customer'}
            </button>
          </>
        )}
      </div>

      {savedQuoteId && (
        <p className="text-sm text-green-600 font-medium">
          Draft saved. Click &ldquo;Send Quote to Customer&rdquo; to email it.
        </p>
      )}
    </div>
  )
}
