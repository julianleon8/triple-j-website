'use client'

import { useState } from 'react'
import type { Locale } from '@/i18n/config'
import { QUOTES, quoteDate } from '@/i18n/copy/quotes'
import { SITE } from '@/lib/site'

type LineItem = {
  id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

type Quote = {
  id: string
  quote_number: string
  status: string
  total: number
  valid_until: string | null
  notes: string | null
  quote_line_items: LineItem[]
  customers: { name: string } | null
}

interface Props {
  quote: Quote
  token: string
  /** The customer's preferred_language (migration 034). */
  locale?: Locale
}

export default function QuoteAcceptView({ quote, token, locale = 'en' }: Props) {
  const q = QUOTES[locale]
  const t = q.accept
  const [status, setStatus] = useState(quote.status)
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)
  const [error, setError] = useState('')

  const handleAction = async (action: 'accept' | 'decline') => {
    setLoading(action)
    setError('')

    const res = await fetch(`/api/quotes/${token}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })

    const data = await res.json()
    setLoading(null)

    if (!res.ok) {
      setError(locale === 'en' && data.error ? data.error : t.error)
      return
    }

    setStatus(action === 'accept' ? 'accepted' : 'declined')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-yellow-500 rounded-t-2xl px-8 py-6">
          <h1 className="text-2xl font-bold text-black">Triple J Metal LLC</h1>
          <p className="text-black/70 text-sm mt-1">{SITE.address.city}, {SITE.address.state} · {SITE.phone}</p>
        </div>

        <div className="bg-white rounded-b-2xl shadow-sm border border-gray-200 border-t-0 px-8 py-8">

          {/* Quote header */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">{t.heading(quote.quote_number)}</h2>
            <p className="text-gray-500 text-sm">{t.preparedFor(quote.customers?.name ?? t.you)}</p>
            {quote.valid_until && (
              <p className="text-gray-400 text-xs mt-1">
                {t.validUntil} {quoteDate(quote.valid_until, locale)}
              </p>
            )}
          </div>

          {/* Status banner */}
          {status === 'accepted' && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-6 py-4">
              <p className="text-green-800 font-semibold">{t.acceptedTitle}</p>
              <p className="text-green-700 text-sm mt-1">{t.acceptedBody(SITE.phone)}</p>
            </div>
          )}
          {status === 'declined' && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-6 py-4">
              <p className="text-red-800 font-semibold">{t.declinedTitle}</p>
              <p className="text-red-700 text-sm mt-1">{t.declinedBody(SITE.phone)}</p>
            </div>
          )}

          {/* Line items */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">{q.table.description}</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2 w-16">{q.table.qty}</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2 w-24">{q.table.unit}</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2 w-24">{q.table.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {/* Ordered by sort_order in the page query — no client-side sort. */}
              {quote.quote_line_items
                .map(item => (
                  <tr key={item.id}>
                    <td className="py-3 text-gray-800">{item.description}</td>
                    <td className="py-3 text-center text-gray-500">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-500">${item.unit_price.toFixed(2)}</td>
                    <td className="py-3 text-right font-medium">${item.total_price.toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200">
                <td colSpan={3} className="pt-4 text-right font-bold text-gray-900">{q.table.total}</td>
                <td className="pt-4 text-right font-bold text-gray-900 text-lg">${quote.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Notes */}
          {quote.notes && (
            <div className="bg-gray-50 rounded-xl px-5 py-4 mb-6">
              <p className="text-sm text-gray-600">{quote.notes}</p>
            </div>
          )}

          {/* Accept / Decline buttons */}
          {status === 'sent' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleAction('accept')}
                disabled={loading !== null}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-green-300 text-white font-bold py-3 rounded-xl transition text-base"
              >
                {loading === 'accept' ? t.processing : t.accept}
              </button>
              <button
                onClick={() => handleAction('decline')}
                disabled={loading !== null}
                className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-bold py-3 rounded-xl transition text-base"
              >
                {loading === 'decline' ? t.processing : t.decline}
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <p className="text-center text-xs text-gray-400 mt-8">
            {t.questions} <a href={SITE.phoneHref} className="underline">{SITE.phone}</a>
          </p>
        </div>
      </div>
    </div>
  )
}
