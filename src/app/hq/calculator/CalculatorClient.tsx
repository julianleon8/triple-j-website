'use client'

import { useMemo, useState } from 'react'
import { calculate, defaultInputs, type CalculatorInputs } from '@/lib/quote-pricing'
import { CalculatorStep } from '../quotes/new/_components/CalculatorStep'

/**
 * Standalone client wrapper around CalculatorStep. Owns the inputs
 * state, runs `calculate(inputs)` on every change, renders the same
 * structured form + live preview the wizard does — minus the
 * Customer/Totals/Review/Send steps. Nothing persists.
 */
export function CalculatorClient() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs)
  const result = useMemo(() => calculate(inputs), [inputs])
  return <CalculatorStep inputs={inputs} onChange={setInputs} result={result} />
}
