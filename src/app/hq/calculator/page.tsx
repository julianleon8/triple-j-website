import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CalculatorClient } from './CalculatorClient'

/**
 * /hq/calculator — standalone estimator.
 *
 * Runs src/lib/quote-pricing.ts over CalculatorStep and commits nothing to
 * the database. Useful during phone calls: read the customer dimensions,
 * read the price back, decide whether to formalize.
 *
 * There is no "convert to quote" path any more — quote building left HQ
 * (the pricing engine is still full of TODO_PRICING placeholders). This
 * screen is a scratchpad, and the number it produces is a starting point.
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
          Plug in dimensions, get a quoted price + internal margin estimate. Nothing here writes to
          the database, and the pricing engine is still provisional — treat the number as a starting
          point, not a commitment.
        </p>
      </header>

      <CalculatorClient />
    </div>
  )
}
