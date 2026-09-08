import { notFound } from 'next/navigation'

/**
 * Quote building left HQ. The pricing math in src/lib/quote-pricing.ts is still
 * full of TODO_PRICING placeholders, so the four-step wizard is not trusted to
 * produce a number anyone should send to a customer.
 *
 * The route 404s; the wizard's components are deliberately kept on disk and
 * still type-check, so this is one file away from coming back if the pricing
 * ever gets finished. Do not delete _components/ — that is the decision.
 */
export default function NewQuotePage() {
  notFound()
}
