'use client'

import { useHaptics } from '@/lib/hq/haptics'

type Option = { key: string; label: string; count?: number }

type Props = {
  value: string
  onChange: (key: string) => void
  options: Option[]
  className?: string
  ariaLabel?: string
}

/**
 * iOS-style pill group (single-select). Use for binary/few-way filters where
 * the set is fixed and known — Leads tab uses (New · Hot · All · Done).
 */
export function SegmentedControl({ value, onChange, options, className, ariaLabel }: Props) {
  const { tap } = useHaptics()
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex w-full rounded-xl bg-(--surface-3) p-0.5 ${className ?? ''}`}
    >
      {options.map((opt) => {
        const active = opt.key === value
        return (
          <button
            key={opt.key}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => {
              if (active) return
              tap()
              onChange(opt.key)
            }}
            className={`flex-1 rounded-[10px] px-2 py-1.5 text-[13px] font-semibold transition-colors ${
              active
                ? 'bg-(--surface-1) text-(--text-primary) shadow-sm'
                : 'text-(--text-secondary)'
            }`}
          >
            <span>{opt.label}</span>
            {typeof opt.count === 'number' && (
              <span className="ml-1 text-[11px] text-(--text-tertiary)">{opt.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
