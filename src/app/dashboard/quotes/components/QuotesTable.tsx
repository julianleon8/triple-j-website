'use client'

import Link from 'next/link'

type Quote = {
  id: string
  quote_number: string
  status: string
  total: number
  valid_until: string | null
  sent_at: string | null
  customers: { name: string } | null
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
}

export default function QuotesTable({ quotes }: { quotes: Quote[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
          <tr>
            {['Quote #', 'Customer', 'Status', 'Total', 'Valid Until', 'Sent'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {quotes.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                No quotes yet. Click &ldquo;New Quote&rdquo; to create one.
              </td>
            </tr>
          )}
          {quotes.map(quote => (
            <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/dashboard/quotes/${quote.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                  {quote.quote_number}
                </Link>
              </td>
              <td className="px-4 py-3 font-semibold">{quote.customers?.name ?? '—'}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[quote.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {quote.status}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold">
                ${quote.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {quote.valid_until
                  ? new Date(quote.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
              </td>
              <td className="px-4 py-3 text-gray-400">
                {quote.sent_at
                  ? new Date(quote.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
