'use client'

import { useEffect, useState } from 'react'
import { LayoutTemplate, Plus, Trash2, X } from 'lucide-react'
import type { WizardLineItem } from './QuoteWizard'
import { Input } from '@/components/hq/ui/Input'

type Template = { id: string; name: string; line_items: WizardLineItem[] }

type Props = {
  lineItems: WizardLineItem[]
  onChange: (items: WizardLineItem[]) => void
  subtotal: number
}

export function ItemsStep({ lineItems, onChange, subtotal }: Props) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesLoaded, setTemplatesLoaded] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    if (!showTemplates || templatesLoaded) return
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/quote-templates')
      if (!res.ok) return
      const data = await res.json() as Template[]
      if (!cancelled) {
        setTemplates(data)
        setTemplatesLoaded(true)
      }
    })()
    return () => { cancelled = true }
  }, [showTemplates, templatesLoaded])

  function addCustom() {
    onChange([...lineItems, { description: '', quantity: 1, unit_price: 0 }])
  }

  function updateItem(index: number, patch: Partial<WizardLineItem>) {
    onChange(lineItems.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function removeItem(index: number) {
    onChange(lineItems.filter((_, i) => i !== index))
  }

  function applyTemplate(t: Template) {
    const cleaned = lineItems.filter((i) => i.description.trim())
    onChange([
      ...cleaned,
      ...t.line_items.map((li) => ({
        description: li.description,
        quantity: Number(li.quantity) || 1,
        unit_price: Number(li.unit_price) || 0,
      })),
    ])
    setShowTemplates(false)
  }

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-[22px] font-bold text-(--text-primary)">Line items</h2>
        <p className="mt-0.5 text-[14px] text-(--text-secondary)">
          Pick from a template or add custom lines.
        </p>
      </header>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowTemplates((v) => !v)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-2) px-3 py-2.5 text-[14px] font-semibold text-(--text-primary) tap-list"
        >
          <LayoutTemplate size={16} strokeWidth={2} /> {showTemplates ? 'Hide templates' : 'Templates'}
        </button>
        <button
          type="button"
          onClick={addCustom}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-(--brand-fg) px-3 py-2.5 text-[14px] font-semibold text-white tap-solid"
        >
          <Plus size={16} strokeWidth={2} /> Add line
        </button>
      </div>

      {showTemplates && (
        <div className="overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-2)">
          <div className="flex items-center justify-between border-b border-(--border-subtle) px-4 py-2">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
              Templates
            </span>
            <button
              type="button"
              aria-label="Close templates"
              onClick={() => setShowTemplates(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-(--surface-3) text-(--text-secondary)"
            >
              <X size={12} strokeWidth={2} />
            </button>
          </div>
          {!templatesLoaded ? (
            <p className="px-4 py-3 text-[13px] text-(--text-tertiary)">Loading…</p>
          ) : templates.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-(--text-tertiary)">No templates yet.</p>
          ) : (
            <ul className="divide-y divide-(--border-subtle)">
              {templates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="flex w-full flex-col gap-0.5 px-4 py-3 text-left tap-list"
                  >
                    <span className="text-[15px] font-semibold text-(--text-primary)">{t.name}</span>
                    <span className="text-[12px] text-(--text-tertiary)">
                      {t.line_items.length} line{t.line_items.length === 1 ? '' : 's'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {lineItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--border-strong) bg-(--surface-2) px-4 py-10 text-center">
          <p className="text-[14px] text-(--text-secondary)">No line items yet.</p>
          <p className="mt-1 text-[13px] text-(--text-tertiary)">Use Templates or Add line to get started.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {lineItems.map((item, i) => {
            const rowTotal = item.quantity * item.unit_price
            return (
              <li key={i} className="rounded-xl border border-(--border-subtle) bg-(--surface-2) p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      label="Description"
                      value={item.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Qty"
                        type="number"
                        inputMode="decimal"
                        value={String(item.quantity)}
                        onChange={(e) => updateItem(i, { quantity: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        label="Unit price"
                        type="number"
                        inputMode="decimal"
                        value={String(item.unit_price)}
                        onChange={(e) => updateItem(i, { unit_price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove line"
                    onClick={() => removeItem(i)}
                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--surface-3) text-(--text-secondary) active:bg-red-500/20 active:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-end text-[13px]">
                  <span className="text-(--text-tertiary)">Line total</span>
                  <span className="ml-2 font-semibold tabular-nums text-(--text-primary)">
                    {formatUSD(rowTotal)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="sticky bottom-2 mt-4 rounded-xl border border-(--border-subtle) bg-(--surface-1)/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
            Subtotal
          </span>
          <span className="text-[20px] font-bold tabular-nums text-(--text-primary)">
            {formatUSD(subtotal)}
          </span>
        </div>
      </div>
    </section>
  )
}

function formatUSD(n: number): string {
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
