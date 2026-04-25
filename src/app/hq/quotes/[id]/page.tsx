export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { QUOTE_STATUS_CLASS } from '@/lib/pipeline'
import { QuoteDetailActions } from './components/QuoteDetailActions'
import QuoteEditor from './components/QuoteEditor'

type LineItem = {
  id?: string
  description: string
  quantity: number
  unit_price: number
  sort_order: number
}

type QuoteRow = {
  id: string
  quote_number: string
  status: string
  valid_until: string | null
  notes: string | null
  subtotal: number | null
  tax_rate: number | null
  tax_amount: number | null
  total: number
  sent_at: string | null
  accepted_at: string | null
  customers: { id: string; name: string; email: string | null } | null
  quote_line_items: LineItem[]
}

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = getAdminClient()

  const { data: quoteRaw, error } = await db
    .from('quotes')
    .select('*, customers(id, name, email), quote_line_items(*)')
    .eq('id', id)
    .single()

  if (error || !quoteRaw) notFound()
  const quote = quoteRaw as QuoteRow

  const { data: customers } = await db
    .from('customers')
    .select('id, name, email')
    .order('name')

  const statusClass = QUOTE_STATUS_CLASS[quote.status] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link href="/hq/quotes" className="inline-flex items-center gap-1 text-[15px] font-medium text-(--brand-fg)">
        <ArrowLeft size={18} strokeWidth={2} /> Quotes
      </Link>

      <header className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-mono text-(--text-tertiary)">{quote.quote_number}</p>
            <h1 className="mt-1 text-[24px] font-bold leading-tight text-(--text-primary)">
              {quote.customers?.name ?? 'Unknown customer'}
            </h1>
            {quote.customers?.email && (
              <p className="mt-0.5 text-[14px] text-(--text-secondary)">{quote.customers.email}</p>
            )}
          </div>
          <div className="text-right">
            <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusClass}`}>
              {quote.status}
            </span>
            <p className="mt-2 text-[22px] font-bold tabular-nums text-(--text-primary)">
              {formatUSD(Number(quote.total ?? 0))}
            </p>
          </div>
        </div>

        <QuoteDetailActions
          id={quote.id}
          status={quote.status}
          customerHasEmail={!!quote.customers?.email}
        />
      </header>

      {/* Inline editor / line items — QuoteEditor already handles draft edit + QBO push */}
      <QuoteEditor
        quote={{
          id: quote.id,
          quote_number: quote.quote_number,
          status: quote.status,
          valid_until: quote.valid_until,
          notes: quote.notes,
          total: Number(quote.total ?? 0),
          customers: quote.customers,
          quote_line_items: quote.quote_line_items,
        }}
        customers={customers ?? []}
      />
    </div>
  )
}

function formatUSD(n: number): string {
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
