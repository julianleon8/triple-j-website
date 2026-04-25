'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Send } from 'lucide-react'
import { useHaptics } from '@/lib/hq/haptics'
import { CustomerStep } from './CustomerStep'
import { CalculatorStep, defaultInputs } from './CalculatorStep'
import { TotalsStep } from './TotalsStep'
import { ReviewStep } from './ReviewStep'
import { calculate, type CalculatorInputs } from '@/lib/quote-pricing'

export type WizardCustomer = { id: string; name: string; email: string | null }
export type WizardLineItem = {
  description: string
  quantity: number
  unit_price: number
}

type Step = 1 | 2 | 3 | 4

export function QuoteWizard({ customers: initialCustomers }: { customers: WizardCustomer[] }) {
  const router = useRouter()
  const haptics = useHaptics()
  const [customers, setCustomers] = useState<WizardCustomer[]>(initialCustomers)
  const [step, setStep] = useState<Step>(1)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [calcInputs, setCalcInputs] = useState<CalculatorInputs>(defaultInputs)
  const [taxRate, setTaxRate] = useState(0.0825)
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculator runs on every input change. Cheap (pure function over <50 line items).
  const calcResult = useMemo(() => calculate(calcInputs), [calcInputs])

  // Wizard line-item shape for downstream steps + the /api/quotes payload.
  const lineItems: WizardLineItem[] = useMemo(
    () =>
      [...calcResult.derivedLineItems, ...calcResult.customLineItems].map((line) => ({
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
      })),
    [calcResult],
  )

  const subtotal = calcResult.finalPrice
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  const selectedCustomer = customers.find((c) => c.id === customerId) ?? null

  function canAdvance(from: Step): boolean {
    if (from === 1) return customerId !== null
    if (from === 2) return lineItems.length > 0 && calcInputs.width > 0 && calcInputs.length > 0
    if (from === 3) return Boolean(validUntil)
    return false
  }

  function goTo(next: Step) {
    setStep(next)
    setError(null)
    haptics.tap()
  }

  async function saveDraft(): Promise<string | null> {
    if (!customerId) return null
    setSubmitting(true)
    setError(null)

    // Pack calculator state + internal-cost / margin / flags into
    // internal_notes as a JSON blob. Stays out of customer view (notes is
    // the customer-facing field). Future migration normalizes — see
    // docs/QUOTE-CALCULATOR.md and DATA-MODEL-AUDIT-2026-04-24.md.
    const calculatorPayload = {
      kind: 'calculator',
      version: 1,
      inputs: calcInputs,
      result: {
        internalMaterialCost: calcResult.internalMaterialCost,
        marginBufferPct: calcResult.marginBufferPct,
        bufferAmount: calcResult.bufferAmount,
        finalPrice: calcResult.finalPrice,
        estimatedGrossMargin: calcResult.estimatedGrossMargin,
        estimatedMarkupRatio: calcResult.estimatedMarkupRatio,
        flags: calcResult.flags,
        suggestedColumnTier: calcResult.suggestedColumnTier,
      },
    }

    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customerId,
        valid_until: validUntil,
        notes: notes || undefined,
        internal_notes: JSON.stringify(calculatorPayload),
        line_items: lineItems
          .filter((i) => i.description.trim())
          .map((i, idx) => ({
            description: i.description.trim(),
            quantity: i.quantity,
            unit_price: i.unit_price,
            sort_order: idx,
          })),
      }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg = typeof body.error === 'string' ? body.error : 'Failed to save draft'
      setError(msg)
      haptics.error()
      return null
    }
    const body = await res.json() as { id: string }
    return body.id
  }

  async function handleSaveDraft() {
    const id = await saveDraft()
    if (!id) return
    haptics.success()
    router.push(`/hq/quotes/${id}`)
  }

  async function handleSendNow() {
    const id = await saveDraft()
    if (!id) return
    setSubmitting(true)
    const res = await fetch(`/api/quotes/${id}/send`, { method: 'POST' })
    setSubmitting(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg = typeof body.error === 'string' ? body.error : 'Saved as draft but failed to send'
      setError(msg)
      haptics.error()
      router.push(`/hq/quotes/${id}`)
      return
    }
    haptics.success()
    router.push(`/hq/quotes/${id}`)
  }

  const progressPct = step * 25
  const advanceDisabled = !canAdvance(step) || submitting

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between px-1">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={`h-2 w-2 rounded-full transition-colors ${
                  n === step ? 'bg-(--brand-fg)' : n < step ? 'bg-(--brand-fg)/40' : 'bg-(--surface-3)'
                }`}
              />
            ))}
          </div>
          <span className="text-[12px] font-semibold text-(--text-tertiary)">Step {step} of 4</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-(--surface-3)">
          <div
            className="h-full bg-(--brand-fg) transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Step body (slide animation via keyframe) */}
      <div key={step} className="step-slide-in">
        {step === 1 && (
          <CustomerStep
            customers={customers}
            customerId={customerId}
            onSelect={setCustomerId}
            onCreated={(c) => {
              setCustomers((prev) => [c, ...prev])
              setCustomerId(c.id)
            }}
          />
        )}
        {step === 2 && (
          <CalculatorStep
            inputs={calcInputs}
            onChange={setCalcInputs}
            result={calcResult}
          />
        )}
        {step === 3 && (
          <TotalsStep
            subtotal={subtotal}
            taxRate={taxRate}
            onTaxRateChange={setTaxRate}
            taxAmount={taxAmount}
            total={total}
            validUntil={validUntil}
            onValidUntilChange={setValidUntil}
            notes={notes}
            onNotesChange={setNotes}
          />
        )}
        {step === 4 && (
          <ReviewStep
            customer={selectedCustomer}
            lineItems={lineItems}
            subtotal={subtotal}
            taxRate={taxRate}
            taxAmount={taxAmount}
            total={total}
            validUntil={validUntil}
            notes={notes}
          />
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-500">
          {error}
        </p>
      )}

      {/* Footer nav */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => goTo(Math.max(1, step - 1) as Step)}
          disabled={step === 1 || submitting}
          className="inline-flex items-center gap-1 rounded-xl border border-(--border-subtle) bg-(--surface-2) px-4 py-3 text-[15px] font-semibold text-(--text-primary) tap-list disabled:opacity-40"
        >
          <ArrowLeft size={16} strokeWidth={2} /> Back
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={() => goTo((step + 1) as Step)}
            disabled={advanceDisabled}
            className="ml-auto inline-flex items-center gap-1 rounded-xl bg-(--brand-fg) px-4 py-3 text-[15px] font-semibold text-white tap-solid disabled:opacity-40"
          >
            Next <ArrowRight size={16} strokeWidth={2} />
          </button>
        ) : (
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={submitting}
              className="rounded-xl border border-(--border-subtle) bg-(--surface-2) px-4 py-3 text-[15px] font-semibold text-(--text-primary) tap-list disabled:opacity-60"
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={handleSendNow}
              disabled={submitting || !selectedCustomer?.email}
              title={!selectedCustomer?.email ? 'Customer has no email on file' : undefined}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-3 text-[15px] font-semibold text-white tap-solid disabled:opacity-40"
            >
              <Send size={16} strokeWidth={2} /> {submitting ? 'Sending…' : 'Send now'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
