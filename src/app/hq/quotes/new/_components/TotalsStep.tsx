'use client'

import { Input } from '@/components/hq/ui/Input'

type Props = {
  subtotal: number
  taxRate: number
  onTaxRateChange: (rate: number) => void
  taxAmount: number
  total: number
  validUntil: string
  onValidUntilChange: (iso: string) => void
  notes: string
  onNotesChange: (notes: string) => void
}

export function TotalsStep(props: Props) {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-[22px] font-bold text-(--text-primary)">Totals & validity</h2>
        <p className="mt-0.5 text-[14px] text-(--text-secondary)">
          Default tax is 8.25% (Texas). Metal structures are often exempt — zero it if so.
        </p>
      </header>

      <div className="rounded-xl border border-(--border-subtle) bg-(--surface-2) p-4">
        <Row label="Subtotal" value={formatUSD(props.subtotal)} />
        <div className="mt-3">
          <Input
            label="Tax rate"
            type="number"
            inputMode="decimal"
            step="0.0001"
            value={String(props.taxRate)}
            onChange={(e) => props.onTaxRateChange(parseFloat(e.target.value) || 0)}
            hint="Decimal format · 0.0825 = 8.25%"
          />
        </div>
        <div className="mt-3 space-y-1">
          <Row label={`Tax (${(props.taxRate * 100).toFixed(2)}%)`} value={formatUSD(props.taxAmount)} />
          <div className="h-px bg-(--border-subtle)" />
          <Row label="Total" value={formatUSD(props.total)} bold />
        </div>
      </div>

      <Input
        label="Valid until"
        type="date"
        value={props.validUntil}
        onChange={(e) => props.onValidUntilChange(e.target.value)}
      />

      <div>
        <label className="block px-1 text-[12px] font-medium text-(--text-tertiary)">
          Notes (optional)
        </label>
        <textarea
          value={props.notes}
          onChange={(e) => props.onNotesChange(e.target.value)}
          rows={3}
          placeholder="Payment terms, install specifics, special instructions…"
          className="mt-1 block w-full rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3.5 py-3 text-[16px] text-(--text-primary) outline-none focus:border-(--brand-fg) resize-none"
        />
      </div>
    </section>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-1">
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
