import { describe, it, expect } from 'vitest'
import {
  calculate,
  defaultInputs,
  suggestColumnTier,
  displayColumnTier,
  displayBuildingType,
  type CalculatorInputs,
} from './quote-pricing'

// NOTE: the dollar constants in quote-pricing.ts are still TODO_PRICING
// placeholders. These tests deliberately assert *relationships and invariants*
// (margin math, monotonicity, flag conditions) rather than specific totals, so
// they keep protecting the engine when the real numbers land.

const inputs = (over: Partial<CalculatorInputs> = {}): CalculatorInputs => ({
  ...defaultInputs(),
  ...over,
})

describe('suggestColumnTier', () => {
  it('picks a tier by clear span, at the boundaries', () => {
    expect(suggestColumnTier(20)).toBe('6_inch')
    expect(suggestColumnTier(30)).toBe('6_inch')
    expect(suggestColumnTier(31)).toBe('8_inch')
    expect(suggestColumnTier(40)).toBe('8_inch')
    expect(suggestColumnTier(41)).toBe('10_inch')
  })
})

describe('display helpers', () => {
  it('formats tiers and building types', () => {
    expect(displayColumnTier('6_inch')).toBe('6"')
    expect(displayColumnTier('10_inch')).toBe('10"')
    expect(displayBuildingType('rv_cover')).toBe('RV Cover')
    expect(displayBuildingType('barn')).toBe('Barn')
  })
})

describe('calculate — margin math', () => {
  it('reports a finalPrice equal to subtotal', () => {
    const r = calculate(inputs())
    expect(r.finalPrice).toBe(r.subtotal)
  })

  it('derives bufferAmount as subtotal minus the pre-buffer price', () => {
    const r = calculate(inputs({ marginBuffer: 0.15 }))
    expect(r.bufferAmount).toBeCloseTo(r.subtotal - r.subtotal / 1.15, 2)
  })

  it('carries the requested buffer through to the result', () => {
    expect(calculate(inputs({ marginBuffer: 0.2 })).marginBufferPct).toBe(0.2)
  })

  it('prices higher at a larger buffer for identical inputs', () => {
    const low = calculate(inputs({ marginBuffer: 0.1 })).finalPrice
    const high = calculate(inputs({ marginBuffer: 0.2 })).finalPrice
    expect(high).toBeGreaterThan(low)
  })

  it('keeps gross margin consistent with cost and price', () => {
    const r = calculate(inputs())
    expect(r.estimatedGrossMargin).toBeCloseTo(r.finalPrice - r.internalMaterialCost, 2)
  })

  it('returns a null markup ratio rather than dividing by zero', () => {
    const r = calculate(inputs())
    if (r.internalMaterialCost === 0) {
      expect(r.estimatedMarkupRatio).toBeNull()
    } else {
      expect(r.estimatedMarkupRatio).toBeCloseTo(r.finalPrice / r.internalMaterialCost, 4)
    }
  })
})

describe('calculate — sizing', () => {
  it('costs more as the building gets bigger', () => {
    const small = calculate(inputs({ width: 20, length: 20 })).finalPrice
    const large = calculate(inputs({ width: 30, length: 40 })).finalPrice
    expect(large).toBeGreaterThan(small)
  })

  it('resolves the column tier automatically when set to auto', () => {
    expect(calculate(inputs({ width: 35, columnTier: 'auto' })).resolved.resolvedColumnTier)
      .toBe('8_inch')
  })

  it('honors a manual tier override but flags the disagreement', () => {
    const r = calculate(inputs({ width: 20, columnTier: '10_inch' }))
    expect(r.resolved.resolvedColumnTier).toBe('10_inch')
    expect(r.flags.some(f => f.level === 'warning')).toBe(true)
  })
})

describe('calculate — review flags', () => {
  it('flags non-standard dimensions', () => {
    const r = calculate(inputs({ width: 23, length: 37 }))
    expect(r.flags.some(f => /custom dimensions/i.test(f.message))).toBe(true)
  })

  it('does not flag standard multiples of five', () => {
    const r = calculate(inputs({ width: 20, length: 30 }))
    expect(r.flags.some(f => /custom dimensions/i.test(f.message))).toBe(false)
  })

  it('flags a wide span with no center post', () => {
    const r = calculate(inputs({ width: 40, centerPost: false }))
    expect(r.flags.some(f => /without a center post/i.test(f.message))).toBe(true)
  })

  it('clears that flag once a center post is added', () => {
    const r = calculate(inputs({ width: 40, centerPost: true }))
    expect(r.flags.some(f => /without a center post/i.test(f.message))).toBe(false)
  })
})

describe('calculate — line items', () => {
  it('passes custom addons through untouched', () => {
    const r = calculate(inputs({
      customAddons: [{ description: 'Gutter package', quantity: 1, unit_price: 450 }],
    }))
    expect(r.customLineItems).toHaveLength(1)
    expect(r.customLineItems[0].description).toBe('Gutter package')
  })

  it('produces at least one derived line item for a bare carport', () => {
    expect(calculate(inputs()).derivedLineItems.length).toBeGreaterThan(0)
  })

  it('adds cost for rollup doors', () => {
    const without = calculate(inputs()).finalPrice
    const withDoor = calculate(inputs({
      rollupDoors: [{ size: '10x10', count: 1 }],
    })).finalPrice
    expect(withDoor).toBeGreaterThan(without)
  })
})
