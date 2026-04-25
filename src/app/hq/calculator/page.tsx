import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CalculatorClient } from './CalculatorClient'

/**
 * /hq/calculator — standalone estimator.
 *
 * Reuses the same engine as /hq/quotes/new (src/lib/quote-pricing.ts +
 * CalculatorStep) but does NOT commit to a draft quote in the DB. Useful
 * during phone calls: read the customer dimensions, read the price back,
 * decide whether to formalize.
 *
 * For converting an estimate into a real quote, the wizard at
 * /hq/quotes/new is still the path. (Follow-up: add a "Convert to quote"
 * button that pipes calculator state via session storage into the wizard.)
 */
export default function CalculatorPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link
        href="/hq/quotes"
        className="inline-flex items-center gap-1 text-[15px] font-medium text-(--brand-fg)"
      >
        <ArrowLeft size={18} strokeWidth={2} /> Quotes
      </Link>

      <header className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
        <h1 className="text-[24px] font-bold leading-tight text-(--text-primary)">
          Estimator
        </h1>
        <p className="mt-1 text-[14px] text-(--text-secondary)">
          Same engine as the quote wizard. Plug in dimensions, get a quoted price + internal margin estimate.
          Nothing here writes to the database — for a real quote, use{' '}
          <Link href="/hq/quotes/new" className="text-(--brand-fg) underline-offset-4 hover:underline">
            New Quote
          </Link>.
        </p>
      </header>

      <CalculatorClient />
    </div>
  )
}
