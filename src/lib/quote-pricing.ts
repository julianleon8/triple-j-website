/**
 * Quote calculator engine.
 *
 * Pure logic. Takes structured calculator inputs (building type, dims,
 * doors, windows, etc.) → emits an itemized price breakdown PLUS an
 * internal material-cost estimate for margin tracking.
 *
 * ⚠ ALL PRICE CONSTANTS BELOW ARE PLACEHOLDERS UNTIL THE 2025/2026
 * PRICING SHEET IS PASTED IN. Search for "TODO_PRICING" in this file
 * to find every line that needs the real number. The structure is
 * stable; updating prices is a value-only edit.
 *
 * See docs/QUOTE-CALCULATOR.md for the runbook.
 */

/* ─── Types ──────────────────────────────────────────────────────────── */

export type BuildingType = 'carport' | 'garage' | 'barn' | 'rv_cover'
export type RoofStyle = 'flat' | 'gabled'
export type ColumnTier = '6_inch' | '8_inch' | '10_inch'
export type RollupSize = '9x8' | '10x10' | '12x12' | '14x14' | '16x14'
export type MarginBuffer = 0.10 | 0.15 | 0.20

export type WallSection = {
  /** Wall length in feet (e.g. one full side). */
  length: number
  /** Wall height in feet. */
  height: number
}

export type RollupDoor = {
  size: RollupSize
  count: number
}

export type ConcretePad = {
  width: number
  length: number
  /** Inches. Defaults to 4. */
  thicknessInches?: number
}

export type CustomAddon = {
  description: string
  quantity: number
  unit_price: number
}

export type CalculatorInputs = {
  buildingType: BuildingType
  roofStyle: RoofStyle
  width: number              // ft
  length: number             // ft
  height: number             // ft (eave for gabled, deck for flat)
  /** 'auto' = derived from span via suggestColumnTier. */
  columnTier: ColumnTier | 'auto'
  centerPost: boolean
  walls: WallSection[]
  rollupDoors: RollupDoor[]
  walkthroughDoors: number
  windows: number
  concretePad: ConcretePad | null
  customAddons: CustomAddon[]
  marginBuffer: MarginBuffer
}

export type LineItemCategory =
  | 'frame' | 'roof' | 'wall' | 'door' | 'window' | 'concrete'
  | 'addon' | 'surcharge' | 'discount'

export type CalculatorLineItem = {
  description: string
  /** Quantity as displayed on the invoice — for "30x40 frame" it's 1, for "10x10 doors" it's count. */
  quantity: number
  /** Customer-facing unit price (already includes margin buffer when applicable). */
  unit_price: number
  /** Internal-only material cost per unit (does NOT include margin buffer or labor). */
  internal_cost: number
  category: LineItemCategory
}

export type CalculatorFlag = {
  level: 'info' | 'warning' | 'review'
  message: string
}

export type CalculatorResult = {
  /** Echo of inputs after auto-resolution (e.g. resolved column tier). */
  resolved: CalculatorInputs & { resolvedColumnTier: ColumnTier }
  /** Engine-derived line items (frame, doors, walls, etc.). */
  derivedLineItems: CalculatorLineItem[]
  /** Pass-through user-entered custom add-ons. */
  customLineItems: CalculatorLineItem[]
  /** Sum of all line-item totals (customer-facing, with margin buffer baked in). */
  subtotal: number
  /** Sum of internal material costs across derived lines. Excludes addons (those are user-priced). */
  internalMaterialCost: number
  /** Margin buffer percentage used (already applied to unit_price values). */
  marginBufferPct: MarginBuffer
  /** subtotal − (subtotal / (1 + bufferPct)) — the dollars the buffer added. */
  bufferAmount: number
  /** Final customer-facing price (= subtotal — buffer is already in). */
  finalPrice: number
  /** finalPrice − internalMaterialCost. Excludes labor (not yet tracked). */
  estimatedGrossMargin: number
  /** finalPrice ÷ internalMaterialCost when > 0; for sanity-checking. */
  estimatedMarkupRatio: number | null
  /** Flags for review (height surcharge, custom dims, manual tier override, etc.). */
  flags: CalculatorFlag[]
  /** What the engine would have suggested if columnTier was 'auto'. */
  suggestedColumnTier: ColumnTier
}

/* ─── Pricing config (PLACEHOLDER) ───────────────────────────────────── */

/**
 * Per-square-foot base rate by building type × roof style × column tier.
 * Customer-facing price BEFORE margin buffer (the engine multiplies by
 * (1 + marginBuffer) at calc time).
 *
 * TODO_PRICING: replace every value with the real 2025/2026 number.
 */
const BASE_RATE_PER_SQFT: Record<BuildingType, Record<RoofStyle, Record<ColumnTier, number>>> = {
  carport: {
    flat:   { '6_inch': 8,  '8_inch': 10, '10_inch': 12 },
    gabled: { '6_inch': 10, '8_inch': 12, '10_inch': 14 },
  },
  garage: {
    flat:   { '6_inch': 14, '8_inch': 16, '10_inch': 18 },
    gabled: { '6_inch': 16, '8_inch': 18, '10_inch': 20 },
  },
  barn: {
    flat:   { '6_inch': 12, '8_inch': 14, '10_inch': 16 },
    gabled: { '6_inch': 14, '8_inch': 16, '10_inch': 18 },
  },
  rv_cover: {
    flat:   { '6_inch': 9,  '8_inch': 11, '10_inch': 13 },
    gabled: { '6_inch': 11, '8_inch': 13, '10_inch': 15 },
  },
}

/**
 * Internal material cost as a fraction of the base rate.
 * Triple J's actual cost ≈ this × the customer-facing line item price.
 *
 * TODO_PRICING: replace with real per-category material-cost ratios
 * once receipts have been categorized (Migration 020 enables this).
 */
const MATERIAL_COST_RATIO: Record<LineItemCategory, number> = {
  frame:     0.55,
  roof:      0.55,
  wall:      0.50,
  door:      0.65,
  window:    0.50,
  concrete:  0.65,
  addon:     0.60,
  surcharge: 0.60,
  discount:  0.00,
}

/** Heights above this trigger the height surcharge. */
const HEIGHT_SURCHARGE_STARTS_AT_FT = 12   // CONFIRMED from prompt
/** Per-foot dollar amount over the threshold. */
const HEIGHT_SURCHARGE_PER_FT = 400        // CONFIRMED from prompt

/**
 * Roll-up door pricing by size.
 * TODO_PRICING: replace with real numbers.
 */
const ROLLUP_DOOR_PRICE: Record<RollupSize, number> = {
  '9x8':   850,
  '10x10': 1100,
  '12x12': 1450,
  '14x14': 1900,
  '16x14': 2200,
}

/** Walk-through door (3'×7' standard). TODO_PRICING. */
const WALKTHROUGH_DOOR_PRICE = 600

/** Window (standard sliding window, ~3'×3'). TODO_PRICING. */
const WINDOW_PRICE = 350

/** Wall: per linear foot, height-multiplied. TODO_PRICING. */
const WALL_PER_LINEAR_FT = 18  // dollars per foot of wall length, per foot of height

/** Concrete pad: per square foot at standard 4" thickness. TODO_PRICING. */
const CONCRETE_PER_SQFT_4IN = 8

/** Tier-suggestion thresholds (max clear span in feet). */
const TIER_MAX_SPAN: Record<ColumnTier, number> = {
  '6_inch':  30,
  '8_inch':  40,
  '10_inch': 999, // anything bigger needs 10" or engineer
}

/* ─── Pure helpers ──────────────────────────────────────────────────── */

export function suggestColumnTier(spanFt: number): ColumnTier {
  if (spanFt <= TIER_MAX_SPAN['6_inch']) return '6_inch'
  if (spanFt <= TIER_MAX_SPAN['8_inch']) return '8_inch'
  return '10_inch'
}

export function displayBuildingType(t: BuildingType): string {
  return t === 'rv_cover' ? 'RV Cover' :
    t === 'carport' ? 'Carport' :
    t === 'garage' ? 'Garage' : 'Barn'
}

export function displayColumnTier(t: ColumnTier): string {
  return t === '6_inch' ? '6"' : t === '8_inch' ? '8"' : '10"'
}

function isStandardDimension(ft: number): boolean {
  // Standard sheet sizes: multiples of 5 between 12 and 60.
  return ft % 5 === 0 && ft >= 12 && ft <= 60
}

/* ─── Engine ────────────────────────────────────────────────────────── */

export function calculate(inputs: CalculatorInputs): CalculatorResult {
  const flags: CalculatorFlag[] = []
  const derivedLineItems: CalculatorLineItem[] = []
  const buffer = inputs.marginBuffer
  const bufferMult = 1 + buffer

  // ── Resolve column tier ──────────────────────────────────────────
  const suggestedTier = suggestColumnTier(inputs.width)
  const resolvedTier = inputs.columnTier === 'auto' ? suggestedTier : inputs.columnTier
  if (inputs.columnTier !== 'auto' && resolvedTier !== suggestedTier) {
    flags.push({
      level: 'warning',
      message:
        `Manual column tier ${displayColumnTier(resolvedTier)} differs from ` +
        `engine-suggested ${displayColumnTier(suggestedTier)} for a ${inputs.width}' span.`,
    })
  }

  // ── Custom-dimension flag ────────────────────────────────────────
  if (!isStandardDimension(inputs.width) || !isStandardDimension(inputs.length)) {
    flags.push({
      level: 'review',
      message:
        `Custom dimensions ${inputs.width}'×${inputs.length}' not on the standard sheet — ` +
        `manual price-confirmation with manufacturer recommended.`,
    })
  }

  // ── Span-without-center-post flag ────────────────────────────────
  if (!inputs.centerPost && inputs.width > 30) {
    flags.push({
      level: 'review',
      message:
        `${inputs.width}' span without a center post — confirm structural design with manufacturer ` +
        `before quoting.`,
    })
  }

  // ── Base structure ───────────────────────────────────────────────
  const sqft = inputs.width * inputs.length
  const baseRate = BASE_RATE_PER_SQFT[inputs.buildingType][inputs.roofStyle][resolvedTier]
  const baseTotal = baseRate * sqft
  derivedLineItems.push(addLine({
    description:
      `${inputs.width}'×${inputs.length}'×${inputs.height}' ${inputs.roofStyle} ` +
      `${displayBuildingType(inputs.buildingType)} — ${displayColumnTier(resolvedTier)} columns`,
    quantity: 1,
    base_unit_price: baseTotal,
    category: 'frame',
  }, bufferMult))

  // ── Center-post savings (if checked) ─────────────────────────────
  // For spans >24', a center post lets us downsize columns. Treat it
  // as a small line-item credit. Placeholder amount.
  if (inputs.centerPost && inputs.width > 24) {
    derivedLineItems.push(addLine({
      description: 'Center post — column downsize credit',
      quantity: 1,
      base_unit_price: -250, // TODO_PRICING
      category: 'discount',
    }, bufferMult))
  }

  // ── Height surcharge (>12') ──────────────────────────────────────
  if (inputs.height > HEIGHT_SURCHARGE_STARTS_AT_FT) {
    const extraFt = inputs.height - HEIGHT_SURCHARGE_STARTS_AT_FT
    derivedLineItems.push(addLine({
      description: `Height surcharge — ${inputs.height}' total (+${extraFt}' over standard)`,
      quantity: extraFt,
      base_unit_price: HEIGHT_SURCHARGE_PER_FT,
      category: 'surcharge',
    }, bufferMult))
    flags.push({
      level: 'info',
      message: `Height ${inputs.height}' triggers +$${HEIGHT_SURCHARGE_PER_FT}/ft surcharge.`,
    })
  }

  // ── Walls ─────────────────────────────────────────────────────────
  for (const wall of inputs.walls) {
    if (wall.length <= 0 || wall.height <= 0) continue
    const wallTotal = wall.length * wall.height * WALL_PER_LINEAR_FT
    derivedLineItems.push(addLine({
      description: `Wall — ${wall.length}'×${wall.height}'`,
      quantity: 1,
      base_unit_price: wallTotal,
      category: 'wall',
    }, bufferMult))
  }

  // ── Roll-up doors ────────────────────────────────────────────────
  for (const door of inputs.rollupDoors) {
    if (door.count <= 0) continue
    derivedLineItems.push(addLine({
      description: `Roll-up door — ${door.size}`,
      quantity: door.count,
      base_unit_price: ROLLUP_DOOR_PRICE[door.size],
      category: 'door',
    }, bufferMult))
  }

  // ── Walk-through doors ───────────────────────────────────────────
  if (inputs.walkthroughDoors > 0) {
    derivedLineItems.push(addLine({
      description: 'Walk-through door (3\'×7\')',
      quantity: inputs.walkthroughDoors,
      base_unit_price: WALKTHROUGH_DOOR_PRICE,
      category: 'door',
    }, bufferMult))
  }

  // ── Windows ──────────────────────────────────────────────────────
  if (inputs.windows > 0) {
    derivedLineItems.push(addLine({
      description: 'Window (~3\'×3\')',
      quantity: inputs.windows,
      base_unit_price: WINDOW_PRICE,
      category: 'window',
    }, bufferMult))
  }

  // ── Concrete pad ────────────────────────────────────────────────
  if (inputs.concretePad) {
    const padSqft = inputs.concretePad.width * inputs.concretePad.length
    const thickness = inputs.concretePad.thicknessInches ?? 4
    const thicknessMult = thickness / 4 // linear adjustment for thickness
    const padTotal = padSqft * CONCRETE_PER_SQFT_4IN * thicknessMult
    derivedLineItems.push(addLine({
      description:
        `${inputs.concretePad.width}'×${inputs.concretePad.length}' concrete pad ` +
        `(${thickness}" thick, 4,000 PSI)`,
      quantity: 1,
      base_unit_price: padTotal,
      category: 'concrete',
    }, bufferMult))
  }

  // ── Custom add-ons (user-priced; buffer NOT applied to user prices) ──
  const customLineItems: CalculatorLineItem[] = inputs.customAddons
    .filter((a) => a.description.trim())
    .map((a) => ({
      description: a.description.trim(),
      quantity: a.quantity || 1,
      unit_price: a.unit_price || 0,
      internal_cost: (a.unit_price || 0) * MATERIAL_COST_RATIO.addon,
      category: 'addon' as const,
    }))

  // ── Aggregates ───────────────────────────────────────────────────
  const allLines = [...derivedLineItems, ...customLineItems]
  const subtotal = allLines.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const internalMaterialCost = allLines.reduce(
    (s, i) => s + i.quantity * i.internal_cost,
    0,
  )
  // Buffer dollar amount = subtotal − pre-buffer subtotal
  const preBufferSubtotal = subtotal / bufferMult
  const bufferAmount = subtotal - preBufferSubtotal
  const finalPrice = subtotal
  const estimatedGrossMargin = finalPrice - internalMaterialCost
  const estimatedMarkupRatio =
    internalMaterialCost > 0 ? finalPrice / internalMaterialCost : null

  return {
    resolved: { ...inputs, resolvedColumnTier: resolvedTier },
    derivedLineItems,
    customLineItems,
    subtotal,
    internalMaterialCost,
    marginBufferPct: buffer,
    bufferAmount,
    finalPrice,
    estimatedGrossMargin,
    estimatedMarkupRatio,
    flags,
    suggestedColumnTier: suggestedTier,
  }
}

/** Build one line item, applying buffer to unit_price + setting internal_cost from base. */
function addLine(
  args: {
    description: string
    quantity: number
    base_unit_price: number
    category: LineItemCategory
  },
  bufferMult: number,
): CalculatorLineItem {
  const ratio = MATERIAL_COST_RATIO[args.category]
  return {
    description: args.description,
    quantity: args.quantity,
    unit_price: round2(args.base_unit_price * bufferMult),
    internal_cost: round2(args.base_unit_price * ratio),
    category: args.category,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/* ─── Defaults for fresh calculator state ───────────────────────────── */

export function defaultInputs(): CalculatorInputs {
  return {
    buildingType: 'carport',
    roofStyle: 'gabled',
    width: 20,
    length: 20,
    height: 10,
    columnTier: 'auto',
    centerPost: false,
    walls: [],
    rollupDoors: [],
    walkthroughDoors: 0,
    windows: 0,
    concretePad: null,
    customAddons: [],
    marginBuffer: 0.15,
  }
}
