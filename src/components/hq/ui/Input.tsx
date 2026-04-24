'use client'

import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label: string
  hint?: string
  error?: string
}

/**
 * Floating-label outlined input. Shared primitive for HQ forms.
 *
 * - Label starts centered and floats up to the top-left on focus or when
 *   the field has a value. Draws over the border so the input frame looks
 *   "notched" — standard iOS Materials pattern.
 * - `type="date"` renders native iOS wheel picker (Safari/Chrome on iPhone).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id, value, defaultValue, onFocus, onBlur, onChange, ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [focused, setFocused] = useState(false)
  const [internalValue, setInternalValue] = useState<string>(
    typeof value === 'string' ? value : typeof defaultValue === 'string' ? defaultValue : '',
  )
  const controlled = value !== undefined
  const hasValue = controlled
    ? typeof value === 'string'
      ? value.length > 0
      : value != null && String(value).length > 0
    : internalValue.length > 0

  const floated = focused || hasValue

  return (
    <div className={`relative ${className ?? ''}`}>
      <input
        ref={ref}
        id={inputId}
        value={value}
        defaultValue={defaultValue}
        onFocus={(e) => { setFocused(true); onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); onBlur?.(e) }}
        onChange={(e) => {
          if (!controlled) setInternalValue(e.target.value)
          onChange?.(e)
        }}
        placeholder=" "
        className={`block w-full rounded-xl border bg-(--surface-2) px-3.5 pb-2 pt-5 text-[16px] text-(--text-primary) outline-none transition-colors ${
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-(--border-subtle) focus:border-(--brand-fg)'
        }`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
        {...rest}
      />
      <label
        htmlFor={inputId}
        className={`pointer-events-none absolute left-3 bg-(--surface-2) px-1 transition-all ${
          floated
            ? `top-1.5 text-[11px] font-medium ${
                error ? 'text-red-500' : focused ? 'text-(--brand-fg)' : 'text-(--text-tertiary)'
              }`
            : 'top-3.5 text-[15px] text-(--text-secondary)'
        }`}
      >
        {label}
      </label>
      {error ? (
        <p id={`${inputId}-err`} className="mt-1 px-1 text-[12px] text-red-500">{error}</p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 px-1 text-[12px] text-(--text-tertiary)">{hint}</p>
      ) : null}
    </div>
  )
})
