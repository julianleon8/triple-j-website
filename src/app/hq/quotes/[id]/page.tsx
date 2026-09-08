export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { QUOTE_STATUS_CLASS, MUTED_STATUS_CLASS } from '@/lib/pipeline'
import { QuoteDetailActions } from './components/QuoteDetailActions'
import { QboPushButton } from './components/QboPushButton'

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
  customers: { id: string; name: string; email: string | null; phone: string | null } | null
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
    .select('*, customers(id, name, email, phone), quote_line_items(*)')
    .eq('id', id)
    .single()

  if (error || !quoteRaw) notFound()
  const quote = quoteRaw as QuoteRow

  const statusClass = QUOTE_STATUS_CLASS[quote.status] ?? MUTED_STATUS_CLASS
  const lineItems = [...(quote.quote_line_items ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  )
  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link href="/hq/quotes" className="inline-flex items-center gap-1 text-[15px] font-medium text-(--brand-fg)">
        <ArrowLeft size={18} strokeWidth={2} /> Quotes
      </Link>

      <header className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-mono text-(--text-tertiary)">{quote.quote_number}</p>
            <h1 className="mt-1 font-display text-[28px] font-bold uppercase leading-none tracking-[0.02em] text-(--text-primary)">
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
          customerHasPhone={!!quote.customers?.phone}
        />
      </header>

      {/* Read-only line items. Quotes are tracked here, not built here — the
          pricing math in src/lib/quote-pricing.ts is still full of
          TODO_PRICING placeholders, so the editor that used to live at this
          spot was removed rather than restyled. */}
      <section className="rounded-md border border-(--border-subtle) bg-(--surface-2) p-4">
        <h2 className="font-display text-[14px] font-bold uppercase tracking-[0.06em] text-(--text-secondary)">
          Line items
        </h2>

        {lineItems.length === 0 ? (
          <p className="mt-3 text-[15px] text-(--text-tertiary)">No line items on this quote.</p>
        ) : (
          <ul className="mt-3 divide-y divide-(--border-subtle)">
            {lineItems.map((item, i) => (
              <li key={item.id ?? i} className="flex items-baseline justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-[15px] text-(--text-primary)">{item.description}</p>
                  <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-(--text-tertiary)">
                    {item.quantity} × {formatUSD(item.unit_price)}
                  </p>
                </div>
                <p className="shrink-0 text-[15px] font-bold tabular-nums text-(--text-primary)">
                  {formatUSD(item.quantity * item.unit_price)}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex items-baseline justify-between border-t border-(--border-subtle) pt-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-(--text-tertiary)">
            Total
          </span>
          <span className="text-[20px] font-bold tabular-nums text-(--text-primary)">
            {formatUSD(subtotal)}
          </span>
        </div>
      </section>

      {(quote.valid_until || quote.notes) && (
        <section className="rounded-md border border-(--border-subtle) bg-(--surface-2) p-4">
          <dl className="space-y-3">
            {quote.valid_until && (
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.04em] text-(--text-tertiary)">
                  Valid until
                </dt>
                <dd className="mt-0.5 text-[15px] text-(--text-primary)">{quote.valid_until}</dd>
              </div>
            )}
            {quote.notes && (
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.04em] text-(--text-tertiary)">
                  Notes
                </dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-[15px] text-(--text-primary)">
                  {quote.notes}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {quote.status === 'accepted' && <QboPushButton id={quote.id} />}
    </div>
  )
}

function formatUSD(n: number): string {
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
