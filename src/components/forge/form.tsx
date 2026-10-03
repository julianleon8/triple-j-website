"use client";

import { forwardRef, useId, type ComponentProps, type ReactNode } from "react";

import { useLocale } from "@/i18n/use-locale";

import { pillClass, type PillTone } from "./styles";

/** 11px/700/.18em slate uppercase label; "(optional)" in steel, no tracking. */
export function FieldLabel({
  children,
  optional = false,
  htmlFor,
  id,
  as = "label",
}: {
  children: ReactNode;
  optional?: boolean;
  htmlFor?: string;
  id?: string;
  /** Use "p" for a group label (pills), "label" for a single control. */
  as?: "label" | "p";
}) {
  const Tag = as;
  const locale = useLocale();
  return (
    <Tag
      id={id}
      htmlFor={as === "label" ? htmlFor : undefined}
      className="mb-2.5 block text-[11px] font-bold uppercase tracking-[.18em] text-forge-slate"
    >
      {children}
      {optional ? (
        <span className="font-medium normal-case tracking-normal text-forge-steel"> {locale === "es" ? "(opcional)" : "(optional)"}</span>
      ) : null}
    </Tag>
  );
}

export function FieldHelper({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[12px] leading-[1.45] text-forge-steel">{children}</p>;
}

const inputClass =
  "h-[46px] w-full rounded-[6px] border border-forge-silver bg-white px-3.5 text-[15px] text-forge-navy " +
  "placeholder:text-forge-steel outline-none transition-colors duration-200 focus:border-forge-navy";

export const TextInput = forwardRef<HTMLInputElement, ComponentProps<"input">>(function TextInput(
  { className = "", ...props },
  ref,
) {
  return <input ref={ref} className={`${inputClass} ${className}`} {...props} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(function TextArea(
  { className = "", ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={`min-h-20 w-full resize-y rounded-[6px] border border-forge-silver bg-white px-3.5 py-3 text-[15px] text-forge-navy placeholder:text-forge-steel outline-none transition-colors duration-200 focus:border-forge-navy ${className}`}
      {...props}
    />
  );
});

/** Bordered checkbox row; checked → navy border, fog background. */
export function CheckboxRow({
  checked,
  onChange,
  label,
  sub,
  name,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  sub?: ReactNode;
  name?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-[8px] border px-3.5 py-3 transition-colors duration-200 ${
        checked ? "border-forge-navy bg-forge-fog" : "border-forge-silver bg-white"
      }`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-[3px] size-4 flex-none accent-forge-navy"
      />
      <span className="text-[14px] leading-[1.45] text-forge-navy">
        {label}
        {sub ? <span className="block text-[12px] text-forge-steel">{sub}</span> : null}
      </span>
    </label>
  );
}

export type PillOption<V extends string> = { v: V; label: ReactNode };

/**
 * Single-choice pill group with radio semantics: role="radiogroup", each
 * pill role="radio" + aria-checked, arrow keys move the choice.
 * `allowDeselect` lets an optional group be cleared by tapping the choice again.
 */
export function PillGroup<V extends string>({
  label,
  optional,
  options,
  value,
  onChange,
  tone = "navy",
  tabular = false,
  allowDeselect = false,
  className = "",
}: {
  label?: ReactNode;
  optional?: boolean;
  options: readonly PillOption<V>[];
  value: V | "";
  onChange: (v: V | "") => void;
  tone?: PillTone;
  tabular?: boolean;
  allowDeselect?: boolean;
  className?: string;
}) {
  const id = useId();
  const current = options.findIndex((o) => o.v === value);
  return (
    <div className={className}>
      {label ? (
        <FieldLabel as="p" id={`${id}-label`} optional={optional}>
          {label}
        </FieldLabel>
      ) : null}
      <div
        role="radiogroup"
        aria-labelledby={label ? `${id}-label` : undefined}
        className="flex flex-wrap gap-2"
        onKeyDown={(e) => {
          if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) return;
          e.preventDefault();
          const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
          const next = (Math.max(current, 0) + d + options.length) % options.length;
          onChange(options[next].v);
          const btns = e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]");
          btns[next]?.focus();
        }}
      >
        {options.map((o, i) => {
          const on = o.v === value;
          return (
            <button
              key={o.v}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on || (current < 0 && i === 0) ? 0 : -1}
              onClick={() => onChange(on && allowDeselect ? "" : o.v)}
              className={pillClass(on, tone, tabular ? "tabular-nums" : "")}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** "Step N of 2 · label" + a 3px progress bar. */
export function StepProgress({ step, total = 2, label }: { step: number; total?: number; label: string }) {
  const pct = Math.round((step / total) * 100);
  const [stepWord, ofWord] = useLocale() === "es" ? ["Paso", "de"] : ["Step", "of"];
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[.18em] text-forge-steel">
        <span className="whitespace-nowrap">
          <span className="text-forge-navy">
            {stepWord} {step}
          </span>{" "}
          {ofWord} {total}
        </span>
        <span className="whitespace-nowrap">{label}</span>
      </div>
      <div
        role="progressbar"
        aria-label={`${stepWord} ${step} ${ofWord} ${total}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="relative h-[3px] overflow-hidden rounded-full bg-forge-mist"
      >
        <div
          className="absolute inset-y-0 left-0 bg-forge-navy transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** ✓ circle, Cinzel title, body, summary rows and a reset button. */
export function SuccessPanel({
  title,
  children,
  rows,
  resetLabel,
  onReset,
}: {
  title: ReactNode;
  children: ReactNode;
  rows?: readonly { k: string; v: ReactNode }[];
  resetLabel?: string;
  onReset?: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3.5 py-1.5" role="status">
      <span
        aria-hidden="true"
        className="inline-flex size-[52px] items-center justify-center rounded-full bg-forge-navy text-[22px] font-bold text-white"
      >
        ✓
      </span>
      <h3 className="mt-1 font-forge-display text-[clamp(24px,1vw_+_16px,30px)] font-black leading-[1.15] text-forge-navy">
        {title}
      </h3>
      <p className="m-0 max-w-[440px] text-[16px] leading-[1.6] text-forge-slate">{children}</p>
      {rows && rows.length ? (
        <dl className="m-0 mt-1.5 w-full border-t border-forge-mist">
          {rows.map((r) => (
            <div key={r.k} className="flex justify-between gap-4 border-b border-forge-mist py-3 text-[14px]">
              <dt className="text-forge-slate">{r.k}</dt>
              <dd className="m-0 text-right font-semibold text-forge-navy">{r.v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {onReset && resetLabel ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 h-[46px] cursor-pointer rounded-[6px] border border-forge-silver bg-white px-[18px] text-[14px] font-semibold text-forge-navy transition-colors hover:border-forge-navy"
        >
          {resetLabel}
        </button>
      ) : null}
    </div>
  );
}
