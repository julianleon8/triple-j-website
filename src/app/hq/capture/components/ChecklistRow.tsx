'use client'

import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import type { FieldKey } from '@/lib/hq/capture-draft'

export type RowSpec = {
  key: FieldKey
  label: string
  inputMode: 'tel' | 'numeric' | 'email' | 'text'
  placeholder: string
  /** Chips offered instead of free text — service and concrete are closed sets. */
  options?: { value: string; label: string }[]
}

/**
 * One checklist row: a label, and either the value or the word ADD.
 *
 * Tapping opens an editor in place rather than a sheet. The operator is on a
 * call; a sheet animating over the list costs a beat and hides the other six
 * rows, which are the reminder of what still needs asking.
 */
export function ChecklistRow({
  spec,
  value,
  editing,
  emphasized,
  onOpen,
  onChange,
  onCommit,
  onCaret,
  autoFocusCaret,
}: {
  spec: RowSpec
  value: string
  editing: boolean
  emphasized?: boolean
  onOpen: () => void
  onChange: (v: string) => void
  onCommit: () => void
  onCaret: (pos: number | null) => void
  autoFocusCaret: number | null
}) {
  const ref = useRef<HTMLInputElement>(null)
  const filled = value.trim() !== ''

  useEffect(() => {
    if (!editing) return
    const el = ref.current
    if (!el) return
    el.focus()
    // Restoring the caret is the whole point of the localStorage mirror — the
    // operator was mid-word when the call arrived.
    if (autoFocusCaret != null) {
      try {
        el.setSelectionRange(autoFocusCaret, autoFocusCaret)
      } catch {
        /* number inputs refuse setSelectionRange in some browsers */
      }
    }
  }, [editing, autoFocusCaret])

  return (
    <div
      className={`relative border-b border-(--border-subtle) last:border-b-0 ${
        emphasized ? 'bg-(--surface-3)' : ''
      }`}
    >
      {emphasized && (
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-(--brand-fg)" />
      )}

      {editing ? (
        <div className="px-4 py-2.5">
          <label
            htmlFor={`cap-${spec.key}`}
            className="block font-display text-[13px] font-semibold uppercase tracking-[0.1em] text-(--brand-fg)"
          >
            {spec.label}
          </label>
          {spec.options ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {spec.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value)
                    onCommit()
                  }}
                  className={`tap-solid rounded-sm border px-3 py-2 font-display text-[15px] font-semibold uppercase tracking-[0.04em] ${
                    value === o.value
                      ? 'border-(--brand-fg) bg-(--brand-fg) text-(--text-on-brand)'
                      : 'border-(--border-strong) text-(--text-primary)'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          ) : (
            <input
              ref={ref}
              id={`cap-${spec.key}`}
              value={value}
              inputMode={spec.inputMode}
              enterKeyHint="done"
              autoComplete="off"
              placeholder={spec.placeholder}
              onChange={(e) => {
                onChange(e.target.value)
                onCaret(e.target.selectionStart)
              }}
              onSelect={(e) => onCaret((e.target as HTMLInputElement).selectionStart)}
              onBlur={onCommit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCommit()
              }}
              className="mt-1 w-full bg-transparent text-[19px] font-semibold text-(--text-primary) tabular-nums outline-none placeholder:text-(--text-tertiary)"
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="tap-list flex min-h-[60px] w-full items-center justify-between gap-3 px-4 py-2 text-left"
        >
          <span
            className={`font-display text-[16px] font-semibold uppercase tracking-[0.06em] ${
              filled ? 'text-(--text-secondary)' : 'text-(--text-tertiary)'
            }`}
          >
            {spec.label}
          </span>
          {filled ? (
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[17px] text-(--text-primary) tabular-nums">{value}</span>
              <Check size={20} strokeWidth={2.5} className="shrink-0 text-(--brand-fg)" aria-hidden />
            </span>
          ) : (
            <span className="shrink-0 font-display text-[16px] font-bold uppercase tracking-[0.08em] text-(--brand-fg)">
              Add
            </span>
          )}
        </button>
      )}
    </div>
  )
}
