'use client'

import { useMemo } from 'react'
import { AlertTriangle, Info, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/hq/ui/Input'
import {
  calculate,
  defaultInputs,
  displayBuildingType,
  displayColumnTier,
  suggestColumnTier,
  type BuildingType,
  type CalculatorInputs,
  type CalculatorResult,
  type ColumnTier,
  type MarginBuffer,
  type RoofStyle,
  type RollupSize,
} from '@/lib/quote-pricing'

type Props = {
  /** Calculator state lives in the wizard so it survives step navigation. */
  inputs: CalculatorInputs
  onChange: (next: CalculatorInputs) => void
  /** Result of calculate(inputs). Wizard computes once + passes down. */
  result: CalculatorResult
}

const BUILDING_TYPES: { value: BuildingType; label: string }[] = [
  { value: 'carport',  label: 'Carport' },
  { value: 'garage',   label: 'Garage' },
  { value: 'barn',     label: 'Barn' },
  { value: 'rv_cover', label: 'RV Cover' },
]

const ROOF_STYLES: { value: RoofStyle; label: string }[] = [
  { value: 'gabled', label: 'Gabled' },
  { value: 'flat',   label: 'Flat' },
]

const ROLLUP_SIZES: RollupSize[] = ['9x8', '10x10', '12x12', '14x14', '16x14']

const MARGIN_BUFFERS: { value: MarginBuffer; label: string }[] = [
  { value: 0.10, label: '10%' },
  { value: 0.15, label: '15%' },
  { value: 0.20, label: '20%' },
]

export function CalculatorStep({ inputs, onChange, result }: Props) {
  const set = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) =>
    onChange({ ...inputs, [key]: value })

  const setNum = (key: 'width' | 'length' | 'height' | 'walkthroughDoors' | 'windows') =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      set(key, Math.max(0, Math.floor(parseFloat(e.target.value) || 0)))

  const suggestedTier = useMemo(() => suggestColumnTier(inputs.width), [inputs.width])

  return (
    <section className="space-y-5">
      <header>
        <h2 className="text-[22px] font-bold text-(--text-primary)">Calculator</h2>
        <p className="mt-0.5 text-[14px] text-(--text-secondary)">
          Pricing engine emits the line items. Pricing values are placeholders until the
          2025/2026 sheet is loaded — see <code className="text-[12px]">src/lib/quote-pricing.ts</code>.
        </p>
      </header>

      {/* ── Building type ─────────────────────────────────────────── */}
      <Group label="Building type">
        <ChipRow
          options={BUILDING_TYPES}
          value={inputs.buildingType}
          onChange={(v) => set('buildingType', v)}
        />
      </Group>

      {/* ── Roof style ────────────────────────────────────────────── */}
      <Group label="Roof style">
        <ChipRow
          options={ROOF_STYLES}
          value={inputs.roofStyle}
          onChange={(v) => set('roofStyle', v)}
        />
      </Group>

      {/* ── Dimensions ────────────────────────────────────────────── */}
      <Group label="Dimensions (ft)">
        <div className="grid grid-cols-3 gap-2">
          <Input
            label="Width"
            type="number"
            inputMode="numeric"
            value={String(inputs.width)}
            onChange={setNum('width')}
          />
          <Input
            label="Length"
            type="number"
            inputMode="numeric"
            value={String(inputs.length)}
            onChange={setNum('length')}
          />
          <Input
            label="Height"
            type="number"
            inputMode="numeric"
            value={String(inputs.height)}
            onChange={setNum('height')}
          />
        </div>
      </Group>

      {/* ── Material tier ─────────────────────────────────────────── */}
      <Group label={`Column tier — engine suggests ${displayColumnTier(suggestedTier)} for a ${inputs.width}' span`}>
        <ChipRow
          options={[
            { value: 'auto',     label: `Auto (${displayColumnTier(suggestedTier)})` },
            { value: '6_inch',   label: '6"' },
            { value: '8_inch',   label: '8"' },
            { value: '10_inch',  label: '10"' },
          ]}
          value={inputs.columnTier}
          onChange={(v) => set('columnTier', v as ColumnTier | 'auto')}
        />
      </Group>

      {/* ── Center post ───────────────────────────────────────────── */}
      <ToggleRow
        label="Center post"
        sub="Allowed when span permits — gives a small column-downsize credit"
        value={inputs.centerPost}
        onChange={(v) => set('centerPost', v)}
      />

      {/* ── Walls ─────────────────────────────────────────────────── */}
      <RepeaterGroup
        label="Walls"
        items={inputs.walls}
        emptyText="No walls. Add one for fully or partially enclosed builds."
        addLabel="Add wall"
        onAdd={() => set('walls', [...inputs.walls, { length: 0, height: inputs.height }])}
        onRemove={(i) => set('walls', inputs.walls.filter((_, idx) => idx !== i))}
        renderRow={(wall, i) => (
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Length (ft)"
              type="number"
              inputMode="numeric"
              value={String(wall.length)}
              onChange={(e) =>
                set(
                  'walls',
                  inputs.walls.map((w, idx) =>
                    idx === i ? { ...w, length: parseFloat(e.target.value) || 0 } : w,
                  ),
                )
              }
            />
            <Input
              label="Height (ft)"
              type="number"
              inputMode="numeric"
              value={String(wall.height)}
              onChange={(e) =>
                set(
                  'walls',
                  inputs.walls.map((w, idx) =>
                    idx === i ? { ...w, height: parseFloat(e.target.value) || 0 } : w,
                  ),
                )
              }
            />
          </div>
        )}
      />

      {/* ── Roll-up doors ─────────────────────────────────────────── */}
      <RepeaterGroup
        label="Roll-up doors"
        items={inputs.rollupDoors}
        emptyText="No roll-up doors."
        addLabel="Add roll-up door"
        onAdd={() => set('rollupDoors', [...inputs.rollupDoors, { size: '10x10', count: 1 }])}
        onRemove={(i) => set('rollupDoors', inputs.rollupDoors.filter((_, idx) => idx !== i))}
        renderRow={(door, i) => (
          <div className="grid grid-cols-[1fr_80px] gap-2 items-end">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                Size
              </p>
              <select
                value={door.size}
                onChange={(e) =>
                  set(
                    'rollupDoors',
                    inputs.rollupDoors.map((d, idx) =>
                      idx === i ? { ...d, size: e.target.value as RollupSize } : d,
                    ),
                  )
                }
                className="h-12 w-full rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 text-[15px] text-(--text-primary)"
              >
                {ROLLUP_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Input
              label="Count"
              type="number"
              inputMode="numeric"
              value={String(door.count)}
              onChange={(e) =>
                set(
                  'rollupDoors',
                  inputs.rollupDoors.map((d, idx) =>
                    idx === i ? { ...d, count: Math.max(0, Math.floor(parseFloat(e.target.value) || 0)) } : d,
                  ),
                )
              }
            />
          </div>
        )}
      />

      {/* ── Walk-through doors + windows ──────────────────────────── */}
      <Group label="Walk-through doors + windows">
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Walk-through doors"
            type="number"
            inputMode="numeric"
            value={String(inputs.walkthroughDoors)}
            onChange={setNum('walkthroughDoors')}
          />
          <Input
            label="Windows"
            type="number"
            inputMode="numeric"
            value={String(inputs.windows)}
            onChange={setNum('windows')}
          />
        </div>
      </Group>

      {/* ── Concrete pad ──────────────────────────────────────────── */}
      <ToggleRow
        label="Concrete pad"
        sub="4,000 PSI — sized to the structure unless customized"
        value={inputs.concretePad !== null}
        onChange={(v) =>
          set('concretePad', v ? { width: inputs.width, length: inputs.length, thicknessInches: 4 } : null)
        }
      />
      {inputs.concretePad !== null && (
        <div className="grid grid-cols-3 gap-2">
          <Input
            label="Pad W (ft)"
            type="number"
            inputMode="numeric"
            value={String(inputs.concretePad.width)}
            onChange={(e) => set('concretePad', { ...inputs.concretePad!, width: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Pad L (ft)"
            type="number"
            inputMode="numeric"
            value={String(inputs.concretePad.length)}
            onChange={(e) => set('concretePad', { ...inputs.concretePad!, length: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Thickness (in)"
            type="number"
            inputMode="numeric"
            value={String(inputs.concretePad.thicknessInches ?? 4)}
            onChange={(e) =>
              set('concretePad', {
                ...inputs.concretePad!,
                thicknessInches: parseFloat(e.target.value) || 4,
              })
            }
          />
        </div>
      )}

      {/* ── Custom add-ons ────────────────────────────────────────── */}
      <RepeaterGroup
        label="Custom add-ons"
        items={inputs.customAddons}
        emptyText="No custom add-ons. Use this for one-off items not on the standard sheet."
        addLabel="Add custom line"
        onAdd={() =>
          set('customAddons', [
            ...inputs.customAddons,
            { description: '', quantity: 1, unit_price: 0 },
          ])
        }
        onRemove={(i) =>
          set('customAddons', inputs.customAddons.filter((_, idx) => idx !== i))
        }
        renderRow={(addon, i) => (
          <div className="space-y-2">
            <Input
              label="Description"
              value={addon.description}
              onChange={(e) =>
                set(
                  'customAddons',
                  inputs.customAddons.map((a, idx) =>
                    idx === i ? { ...a, description: e.target.value } : a,
                  ),
                )
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Qty"
                type="number"
                inputMode="decimal"
                value={String(addon.quantity)}
                onChange={(e) =>
                  set(
                    'customAddons',
                    inputs.customAddons.map((a, idx) =>
                      idx === i ? { ...a, quantity: parseFloat(e.target.value) || 0 } : a,
                    ),
                  )
                }
              />
              <Input
                label="Unit price"
                type="number"
                inputMode="decimal"
                value={String(addon.unit_price)}
                onChange={(e) =>
                  set(
                    'customAddons',
                    inputs.customAddons.map((a, idx) =>
                      idx === i ? { ...a, unit_price: parseFloat(e.target.value) || 0 } : a,
                    ),
                  )
                }
              />
            </div>
          </div>
        )}
      />

      {/* ── Margin buffer ─────────────────────────────────────────── */}
      <Group label="Margin buffer">
        <ChipRow
          options={MARGIN_BUFFERS}
          value={inputs.marginBuffer}
          onChange={(v) => set('marginBuffer', v as MarginBuffer)}
        />
      </Group>

      {/* ── Live preview ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-4 space-y-3">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
          Preview
        </h3>

        {result.flags.length > 0 && (
          <ul className="space-y-1.5">
            {result.flags.map((f, i) => (
              <li
                key={i}
                className={`flex items-start gap-2 rounded-xl px-3 py-2 text-[13px] ${flagClass(f.level)}`}
              >
                {f.level === 'review' || f.level === 'warning' ? (
                  <AlertTriangle size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
                ) : (
                  <Info size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
                )}
                <span>{f.message}</span>
              </li>
            ))}
          </ul>
        )}

        <ul className="divide-y divide-(--border-subtle)">
          {[...result.derivedLineItems, ...result.customLineItems].map((line, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3 py-2 text-[13px]">
              <span className="text-(--text-secondary)">
                {line.description}
                {line.quantity !== 1 && (
                  <span className="ml-1 text-(--text-tertiary)">× {line.quantity}</span>
                )}
              </span>
              <span className="shrink-0 tabular-nums font-medium text-(--text-primary)">
                {fmtUSD(line.quantity * line.unit_price)}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-1 border-t border-(--border-subtle) pt-3 text-[14px]">
          <Row label="Subtotal (with buffer)" value={fmtUSD(result.subtotal)} bold />
          <Row label={`Buffer (${Math.round(result.marginBufferPct * 100)}%)`} value={fmtUSD(result.bufferAmount)} />
          <Row label="Final quoted price" value={fmtUSD(result.finalPrice)} bold accent />
        </div>

        <details className="border-t border-(--border-subtle) pt-3">
          <summary className="cursor-pointer text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
            Internal — material cost + margin
          </summary>
          <div className="mt-2 space-y-1 text-[13px]">
            <Row label="Estimated material cost" value={fmtUSD(result.internalMaterialCost)} />
            <Row
              label="Estimated gross margin"
              value={fmtUSD(result.estimatedGrossMargin)}
              accent
            />
            <Row
              label="Markup ratio"
              value={result.estimatedMarkupRatio ? `${result.estimatedMarkupRatio.toFixed(2)}×` : '—'}
            />
            <p className="mt-2 text-[11px] text-(--text-tertiary)">
              Material-cost ratios are placeholders until receipts have been categorized
              (Migration 020 + Phase 4.2 receipt-tagging). Gross margin excludes labor — labor
              tracking lands with Migration 018 (time_entries).
            </p>
          </div>
        </details>
      </div>
    </section>
  )
}

/* ─── Local helpers ──────────────────────────────────────────────────── */

function fmtUSD(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function flagClass(level: 'info' | 'warning' | 'review'): string {
  if (level === 'review') return 'bg-red-500/10 text-red-500 border border-red-500/20'
  if (level === 'warning') return 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
  return 'bg-(--brand-fg)/10 text-(--brand-fg) border border-(--brand-fg)/20'
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
        {label}
      </p>
      {children}
    </div>
  )
}

type ChipOption<V extends string | number> = { value: V; label: string }

function ChipRow<V extends string | number>({
  options, value, onChange,
}: {
  options: ChipOption<V>[]
  value: V
  onChange: (v: V) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-3.5 py-2 text-[13px] font-semibold tap-solid ${
              active
                ? 'bg-(--brand-fg) text-white'
                : 'border border-(--border-subtle) bg-(--surface-2) text-(--text-primary)'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function ToggleRow({
  label, sub, value, onChange,
}: {
  label: string
  sub?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-(--border-subtle) bg-(--surface-2) px-4 py-3">
      <div>
        <p className="text-[15px] font-semibold text-(--text-primary)">{label}</p>
        {sub && <p className="text-[12px] text-(--text-tertiary)">{sub}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 rounded-full transition-colors ${value ? 'bg-(--brand-fg)' : 'bg-(--surface-3)'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

function RepeaterGroup<T>({
  label, items, emptyText, addLabel, onAdd, onRemove, renderRow,
}: {
  label: string
  items: T[]
  emptyText: string
  addLabel: string
  onAdd: () => void
  onRemove: (i: number) => void
  renderRow: (item: T, i: number) => React.ReactNode
}) {
  return (
    <Group label={label}>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--border-strong) bg-(--surface-2) px-3 py-4 text-center">
          <p className="text-[13px] text-(--text-tertiary)">{emptyText}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="rounded-xl border border-(--border-subtle) bg-(--surface-2) p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">{renderRow(item, i)}</div>
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => onRemove(i)}
                  className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--surface-3) text-(--text-secondary) active:bg-red-500/20 active:text-red-500 transition-colors"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-2 text-[13px] font-semibold text-(--text-primary) tap-list"
      >
        <Plus size={14} strokeWidth={2} /> {addLabel}
      </button>
    </Group>
  )
}

function Row({
  label, value, bold, accent,
}: {
  label: string
  value: string
  bold?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={`${bold ? 'font-semibold text-(--text-primary)' : 'text-(--text-secondary)'}`}>
        {label}
      </span>
      <span
        className={`tabular-nums ${
          accent ? 'text-(--brand-fg)' : ''
        } ${bold ? 'font-bold' : ''} text-(--text-primary)`}
      >
        {value}
      </span>
    </div>
  )
}

/** Re-export for the wizard: a fresh inputs object. */
export { defaultInputs }
