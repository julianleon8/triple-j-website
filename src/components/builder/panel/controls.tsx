"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

import { FieldLabel } from "@/components/forge/form";
import { BUILDER_COLORS, builderColor } from "@/lib/builder/catalog";

import { useBuilder, type SectionId } from "../store";
import { SECTIONS } from "./sections";

/**
 * Heading, lede, body and the Back / Next row every section shares. The
 * heading takes focus when the step changes (BuilderApp), so keyboard and
 * screen-reader users land at the top of the new step, not on <body>.
 */
export function SectionShell({ id, title, lede, children }: { id: SectionId; title: string; lede?: ReactNode; children: ReactNode }) {
  const setSection = useBuilder((s) => s.setSection);
  const i = SECTIONS.findIndex((s) => s.id === id);
  const prev = SECTIONS[i - 1];
  const next = SECTIONS[i + 1];
  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-6 sm:px-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate">
          Step {i + 1} of {SECTIONS.length}
        </p>
        <h2
          data-section-heading=""
          tabIndex={-1}
          // Focused by script on a step change: an underline, not the boxed Forge ring.
          style={{ outline: "none" }}
          className="mt-1.5 font-forge-display text-[26px] font-black leading-[1.1] tracking-[.01em] text-forge-navy decoration-forge-silver decoration-2 underline-offset-[6px] focus-visible:underline"
        >
          {title}
        </h2>
        {lede ? <p className="mt-2 text-[14px] leading-[1.55] text-forge-slate">{lede}</p> : null}
      </div>
      {children}
      {next || prev ? (
        <div className="mt-2 flex gap-3">
          {prev ? (
            <button
              type="button"
              onClick={() => setSection(prev.id)}
              className="h-11 cursor-pointer rounded-[6px] border border-forge-silver bg-white px-[18px] text-[14px] font-semibold text-forge-slate transition-colors hover:border-forge-navy"
            >
              ← Back
            </button>
          ) : null}
          {next ? (
            <button
              type="button"
              onClick={() => setSection(next.id)}
              className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-forge-navy bg-white px-[18px] text-[14px] font-semibold text-forge-navy transition-colors hover:bg-forge-fog"
            >
              Next: {next.label} <span aria-hidden="true">→</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// Disabled with aria-disabled, never `disabled`: a button that disables itself
// under a keyboard user's finger drops their focus to <body>.
const stepBtn =
  "inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-[6px] border border-forge-silver bg-white text-[20px] font-semibold text-forge-navy transition-colors hover:border-forge-navy aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:border-forge-silver";

/**
 * A feet value: − / typed number / + and a slider, bounded by min/max. When
 * the floor is raised by something the customer added, `reason` says what.
 */
export function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  helper,
  reason,
  unit = "ft",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  helper?: ReactNode;
  reason?: string | null;
  unit?: string;
}) {
  const id = useId();
  // What's typed, only while the field is being edited; otherwise the value shows.
  const [draft, setDraft] = useState<string | null>(null);
  const commit = (raw: string) => {
    setDraft(null);
    const n = Number(raw);
    if (!Number.isFinite(n) || raw.trim() === "") return;
    const snapped = Math.round(n / step) * step;
    const v = Math.min(max, Math.max(min, snapped));
    if (v !== value) onChange(v);
  };
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={stepBtn}
          aria-label={`Decrease ${label.toLowerCase()}`}
          aria-disabled={atMin || undefined}
          onClick={() => !atMin && onChange(Math.max(min, value - step))}
        >
          −
        </button>
        <div className="relative flex-1">
          <input
            id={id}
            inputMode="decimal"
            value={draft ?? String(value)}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
            }}
            className="h-11 w-full rounded-[6px] border border-forge-silver bg-white pl-3.5 pr-10 text-center text-[17px] font-semibold tabular-nums text-forge-navy outline-none focus:border-forge-navy"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-forge-slate">{unit}</span>
        </div>
        <button
          type="button"
          className={stepBtn}
          aria-label={`Increase ${label.toLowerCase()}`}
          aria-disabled={atMax || undefined}
          onClick={() => !atMax && onChange(Math.min(max, value + step))}
        >
          +
        </button>
      </div>
      <input
        type="range"
        aria-label={`${label} slider`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-forge-navy"
      />
      <div className="mt-0.5 flex justify-between text-[11px] tabular-nums text-forge-slate">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
      {reason ? <Helper>{reason}</Helper> : helper ? <Helper>{helper}</Helper> : null}
    </div>
  );
}

/**
 * The radio-group keyboard pattern: arrows move the choice and the focus,
 * Home/End jump to the ends. `cols` makes Up/Down move a whole row in a grid.
 */
function radioKeys(e: KeyboardEvent<HTMLDivElement>, current: number, pick: (i: number) => void, grid = false) {
  const buttons = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]")];
  const count = buttons.length;
  if (!count) return;
  let cols = 1;
  if (grid) {
    const top = buttons[0].offsetTop;
    cols = Math.max(1, buttons.filter((b) => b.offsetTop === top).length);
  }
  const from = Math.max(current, 0);
  let next: number;
  switch (e.key) {
    case "ArrowRight":
      next = (from + 1) % count;
      break;
    case "ArrowLeft":
      next = (from - 1 + count) % count;
      break;
    case "ArrowDown":
      next = grid ? Math.min(count - 1, from + cols) : (from + 1) % count;
      break;
    case "ArrowUp":
      next = grid ? Math.max(0, from - cols) : (from - 1 + count) % count;
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = count - 1;
      break;
    default:
      return;
  }
  e.preventDefault();
  pick(next);
  buttons[next]?.focus();
}

/** Big two-to-four-way choice with an illustration. */
export function ChoiceCards<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: { v: V; title: string; sub?: string; art?: ReactNode }[];
  onChange: (v: V) => void;
}) {
  const id = useId();
  const current = options.findIndex((o) => o.v === value);
  return (
    <div>
      <FieldLabel as="p" id={id}>
        {label}
      </FieldLabel>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className="grid grid-cols-2 gap-3"
        onKeyDown={(e) => radioKeys(e, current, (i) => onChange(options[i].v))}
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
              onClick={() => onChange(o.v)}
              className={`relative flex cursor-pointer flex-col items-start gap-1 rounded-[10px] border-2 p-3 text-left transition-colors ${
                on ? "border-forge-navy bg-forge-fog" : "border-forge-silver bg-white hover:border-forge-steel"
              }`}
            >
              {on ? (
                <span aria-hidden="true" className="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-full bg-forge-navy text-[12px] font-bold text-white">
                  ✓
                </span>
              ) : null}
              {o.art ? <span className="mb-1 block w-full text-forge-navy">{o.art}</span> : null}
              <span className="font-forge-display text-[16px] font-bold leading-[1.2] text-forge-navy">{o.title}</span>
              {o.sub ? <span className="text-[12px] leading-[1.4] text-forge-slate">{o.sub}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Panel color swatches, with names, as a radio group: one Tab stop, arrows to choose. */
export function SwatchGrid({
  label,
  value,
  onChange,
  allowNone = false,
}: {
  label: string;
  value: string | null;
  onChange: (slug: string | null) => void;
  allowNone?: boolean;
}) {
  const id = useId();
  const current = value ? builderColor(value).name : "None";
  const choices: (string | null)[] = [...(allowNone ? [null] : []), ...BUILDER_COLORS.map((c) => c.slug)];
  const index = choices.indexOf(value);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel as="p" id={id}>
          {label}
        </FieldLabel>
        <span className="mb-2.5 text-[13px] font-semibold text-forge-navy">{current}</span>
      </div>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-2"
        onKeyDown={(e) => radioKeys(e, index, (i) => onChange(choices[i]), true)}
      >
        {choices.map((slug, i) => {
          const on = slug === value;
          const tabIndex = on || (index < 0 && i === 0) ? 0 : -1;
          if (slug === null) {
            return (
              <button
                key="none"
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={tabIndex}
                title="None"
                onClick={() => onChange(null)}
                className={`flex aspect-square cursor-pointer items-center justify-center rounded-[8px] border-2 bg-white text-[11px] font-semibold text-forge-slate ${
                  on ? "border-forge-navy" : "border-forge-silver hover:border-forge-steel"
                }`}
              >
                None
              </button>
            );
          }
          const c = builderColor(slug);
          return (
            <button
              key={slug}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={c.name}
              tabIndex={tabIndex}
              title={c.name}
              onClick={() => onChange(slug)}
              className={`relative aspect-square cursor-pointer rounded-[8px] border-2 ${
                on ? "border-forge-navy" : "border-forge-silver hover:border-forge-steel"
              }`}
              style={{
                background: c.metallic ? `linear-gradient(135deg, ${c.hex}, #f2f2f0 55%, ${c.hex})` : c.hex,
                boxShadow: on ? "inset 0 0 0 2px #fff" : undefined,
              }}
            >
              {on ? (
                <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-forge-navy text-[10px] font-bold text-white">
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * An inline notice: a reason something is blocked, with an optional fix.
 * Visual only; the store's live region (BuilderApp) reads refusals aloud.
 */
export function Notice({ children, action }: { children: ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="rounded-[8px] border border-forge-silver bg-forge-fog px-3.5 py-3 text-[13px] leading-[1.5] text-forge-navy">
      {children}
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-1 flex min-h-11 cursor-pointer items-center text-[13px] font-semibold text-forge-navy underline decoration-forge-silver underline-offset-4 hover:decoration-forge-navy"
        >
          {action.label} →
        </button>
      ) : null}
    </div>
  );
}

/** Helper text under a control. Slate, not Forge's steel: at 12px steel fails WCAG AA on white. */
export function Helper({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[12px] leading-[1.45] text-forge-slate">{children}</p>;
}

/** A small text action (Remove) with a full 44px hit area. */
export const textAction =
  "-my-3 -mr-2 inline-flex min-h-11 cursor-pointer items-center px-2 text-[13px] font-semibold text-forge-slate underline decoration-forge-silver underline-offset-4 hover:text-forge-navy";

/** After a removal the pressed button is gone; put focus back at the top of the step. */
export function focusHeading() {
  requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-section-heading]")?.focus({ preventScroll: true }));
}
