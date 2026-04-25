'use client'

import type { WizardCustomer, WizardLineItem } from './QuoteWizard'

type Props = {
  customer: WizardCustomer | null
  lineItems: WizardLineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  validUntil: string
  notes: string
}

export function ReviewStep(props: Props) {
  const validItems = props.lineItems.filter((i) => i.description.trim())

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-[22px] font-bold text-(--text-primary)">Review & send</h2>
        <p className="mt-0.5 text-[14px] text-(--text-secondary)">
          Save as a draft or send this quote now. Sending delivers an email with the accept link.
        </p>
      </header>

      <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
              Recipient
            </h3>
            <p className="mt-1 text-[17px] font-semibold text-(--text-primary)">
              {props.customer?.name ?? '—'}
            </p>
            {props.customer?.email ? (
              <p className="mt-0.5 text-[13px] text-(--text-secondary)">{props.customer.email}</p>
            ) : (
              <p className="mt-0.5 text-[13px] text-red-500">
                No email on file — you can still save as draft.
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[13px] text-(--text-tertiary)">Valid until</p>
            <p className="mt-1 text-[15px] font-semibold text-(--text-primary)">
              {formatDate(props.validUntil)}
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-(--border-subtle)">
          <table className="w-full text-[13px]">
            <thead className="bg-(--surface-3) text-(--text-tertiary)">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Item</th>
                <th className="px-3 py-2 text-right font-semibold">Qty</th>
                <th className="px-3 py-2 text-right font-semibold">Unit</th>
                <th className="px-3 py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle)">
              {validItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-(--text-tertiary)">
                    No line items yet.
                  </td>
                </tr>
              ) : (
                validItems.map((i, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 text-(--text-primary)">{i.description}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-(--text-primary)">{i.quantity}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-(--text-primary)">{formatUSD(i.unit_price)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium text-(--text-primary)">
                      {formatUSD(i.quantity * i.unit_price)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <dl className="mt-4 space-y-1">
          <Row label="Subtotal" value={formatUSD(props.subtotal)} />
          <Row label={`Tax (${(props.taxRate * 100).toFixed(2)}%)`} value={formatUSD(props.taxAmount)} />
          <div className="h-px bg-(--border-subtle)" />
          <Row label="Total" value={formatUSD(props.total)} bold />
        </dl>

        {props.notes && (
          <div className="mt-4">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">Notes</h4>
            <p className="mt-1 whitespace-pre-wrap text-[14px] text-(--text-primary)">{props.notes}</p>
          </div>
        )}
      </div>
    </section>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={`text-[14px] ${bold ? 'font-semibold text-(--text-primary)' : 'text-(--text-secondary)'}`}>
        {label}
      </span>
      <span className={`tabular-nums ${bold ? 'text-[18px] font-bold text-(--text-primary)' : 'text-[15px] text-(--text-primary)'}`}>
        {value}
      </span>
    </div>
  )
}

function formatUSD(n: number): string {
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
