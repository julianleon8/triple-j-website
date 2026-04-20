'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Customer = { id: string; name: string; email: string | null }
type LineItem = { id?: string; description: string; quantity: number; unit_price: number; sort_order: number }

interface Quote {
  id: string
  quote_number: string
  status: string
  valid_until: string | null
  notes: string | null
  total: number
  customers: Customer | null
  quote_line_items: LineItem[]
}

interface Props {
  quote: Quote
  customers: Customer[]
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
}

export default function QuoteEditor({ quote, customers }: Props) {
  const router = useRouter()
  const [lineItems, setLineItems] = useState<LineItem[]>(
    quote.quote_line_items.sort((a, b) => a.sort_order - b.sort_order)
  )
  const [validUntil, setValidUntil] = useState(quote.valid_until ?? '')
  const [notes, setNotes] = useState(quote.notes ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isPushingQBO, setIsPushingQBO] = useState(false)
  const [qboResult, setQboResult] = useState<string>('')
  const [error, setError] = useState('')
  const [confirmSend, setConfirmSend] = useState(false)
  const isDraft = quote.status === 'draft'
  const isAccepted = quote.status === 'accepted'

  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const removeItem = (index: number) => setLineItems(prev => prev.filter((_, i) => i !== index))

  const handleSave = async () => {
    setError('')
    setIsSaving(true)
    const res = await fetch(`/api/quotes/${quote.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valid_until: validUntil,
        notes,
        line_items: lineItems.filter(i => i.description.trim()).map((item, i) => ({ ...item, sort_order: i })),
      }),
    })
    setIsSaving(false)
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Save failed'); return }
    router.refresh()
  }

  const handleSend = async () => {
    setError('')
    setIsSending(true)
    const res = await fetch(`/api/quotes/${quote.id}/send`, { method: 'POST' })
    setIsSending(false)
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Send failed'); return }
    router.refresh()
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-mono">{quote.quote_number}</p>
          <p className="text-sm text-gray-600">{quote.customers?.name ?? '—'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[quote.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {quote.status}
        </span>
      </div>

      {/* Quote Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Customer</label>
            <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500">
              {quote.customers?.name ?? '—'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valid Until</label>
            <input
              type="date"
              value={validUntil}
              onChange={e => setValidUntil(e.target.value)}
              disabled={!isDraft}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            disabled={!isDraft}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Line Items</h2>
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
              disabled={!isDraft}
              className="col-span-6 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-50"
            />
            <input
              type="number" min="0.01" step="0.01"
              value={item.quantity}
              onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
              disabled={!isDraft}
              className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-50"
            />
            <input
              type="number" min="0" step="0.01"
              value={item.unit_price}
              onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
              disabled={!isDraft}
              className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-50"
            />
            <div className="col-span-1 text-right text-sm font-medium text-gray-700">
              ${(item.quantity * item.unit_price).toFixed(2)}
            </div>
            {isDraft && (
              <button type="button" onClick={() => removeItem(i)}
                className="col-span-1 text-gray-300 hover:text-red-400 text-center transition text-lg leading-none">×</button>
            )}
          </div>
        ))}
        {isDraft && (
          <button
            type="button"
            onClick={() => setLineItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0, sort_order: prev.length }])}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg px-4 py-2 w-full transition"
          >
            + Add Row
          </button>
        )}
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <div className="text-right">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-xl font-bold">${subtotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {qboResult && <p className="text-green-600 text-sm">{qboResult}</p>}

      {/* Actions */}
      {isDraft && (
        <div className="flex gap-3 flex-wrap">
          <button type="button" onClick={handleSave} disabled={isSaving}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-200 text-black font-bold px-6 py-2.5 rounded-lg transition text-sm">
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
          {!confirmSend ? (
            <button type="button" onClick={() => setConfirmSend(true)}
              className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2.5 rounded-lg transition text-sm">
              Send to Customer
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600">Send quote to {quote.customers?.name}?</span>
              <button type="button" onClick={handleSend} disabled={isSending}
                className="bg-green-600 hover:bg-green-500 disabled:bg-green-300 text-white font-bold px-4 py-2 rounded-lg transition text-sm">
                {isSending ? 'Sending…' : 'Yes, Send'}
              </button>
              <button type="button" onClick={() => setConfirmSend(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg transition text-sm">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* QuickBooks push — visible on accepted quotes */}
      {isAccepted && (
        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={async () => {
              setIsPushingQBO(true)
              setQboResult('')
              setError('')
              const res = await fetch(`/api/qbo/push/${quote.id}`, { method: 'POST' })
              setIsPushingQBO(false)
              if (res.ok) {
                const d = await res.json()
                setQboResult(`Pushed to QuickBooks — Invoice ${d.invoiceId}`)
              } else {
                const d = await res.json().catch(() => ({}))
                setError(d.error ?? 'QuickBooks push failed')
              }
            }}
            disabled={isPushingQBO}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-bold px-5 py-2.5 rounded-lg transition text-sm"
          >
            {isPushingQBO ? 'Pushing…' : 'Push to QuickBooks'}
          </button>
          <p className="text-xs text-gray-400 mt-1.5">Creates a Draft invoice in QuickBooks Online.</p>
        </div>
      )}
    </div>
  )
}
