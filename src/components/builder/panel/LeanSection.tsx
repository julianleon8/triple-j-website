"use client";

import { useState } from "react";

import { PillGroup } from "@/components/forge/form";
import { LEAN_MIN_OUTER, LEAN_SIDES, LIMITS, SIDE_LABEL, type LeanSide } from "@/lib/builder/catalog";
import type { LeanTo } from "@/lib/builder/design";
import { canAddLean, fmt, leanOuterHeight, maxLeanDepth } from "@/lib/builder/rules";

import { useBuilder } from "../store";
import { Helper, Notice, PRICED_IN_QUOTE, SectionShell, Stepper, focusHeading, textAction } from "./controls";

export function LeanSection() {
  const d = useBuilder((s) => s.design);
  const edit = useBuilder((s) => s.edit);
  const notify = useBuilder((s) => s.notify);
  const [notice, setNotice] = useState<string | null>(null);

  function add(side: LeanSide) {
    const can = canAddLean(d, side);
    if (!can.ok) {
      setNotice(can.reason);
      notify(can.reason);
      return;
    }
    const depth = Math.max(LIMITS.leanDepth.min, Math.min(10, maxLeanDepth(d, side)));
    const r = edit((x) => ({ ...x, leanTos: [...x.leanTos, { side, depth, walls: "open" }] }));
    setNotice(r.ok ? null : r.issues[0].message);
  }
  function update(side: LeanSide, patch: Partial<LeanTo>) {
    const r = edit((x) => ({ ...x, leanTos: x.leanTos.map((l) => (l.side === side ? { ...l, ...patch } : l)) }), `lean-${side}`);
    setNotice(r.ok ? null : r.issues[0].message);
  }
  function remove(side: LeanSide) {
    edit((x) => ({ ...x, leanTos: x.leanTos.filter((l) => l.side !== side) }));
    setNotice(null);
    focusHeading();
  }

  return (
    <SectionShell
      id="leans"
      title="Lean-tos"
      lede={`One per side, up to four. Each runs the full length of its side, hangs 1 ft under the main eave and slopes 2:12 to keep at least ${LEAN_MIN_OUTER} ft clear at its low edge. Where two meet, the corner stays open.`}
    >
      <Helper>{PRICED_IN_QUOTE}</Helper>
      {notice ? <Notice>{notice}</Notice> : null}
      {LEAN_SIDES.map((side) => {
        const lean = d.leanTos.find((l) => l.side === side);
        const label = SIDE_LABEL[side];
        const name = label.toLowerCase();
        const max = maxLeanDepth(d, side);
        if (!lean) {
          const can = canAddLean(d, side);
          return (
            <div key={side} className="flex items-center justify-between gap-4 rounded-[10px] border border-forge-silver p-4">
              <div className="min-w-0">
                <p className="font-forge-display text-[17px] font-bold text-forge-navy">{label}</p>
                {can.ok ? null : (
                  <p id={`lean-why-${side}`} className="mt-1 text-[12px] leading-[1.45] text-forge-slate">
                    {can.reason}
                  </p>
                )}
              </div>
              {/* aria-disabled keeps it reachable, so its reason is too. */}
              <button
                type="button"
                aria-disabled={!can.ok || undefined}
                aria-describedby={can.ok ? undefined : `lean-why-${side}`}
                aria-label={`Add ${name} lean-to`}
                onClick={() => add(side)}
                className="h-11 flex-none cursor-pointer rounded-[6px] border border-forge-navy bg-white px-4 text-[14px] font-semibold text-forge-navy transition-colors hover:bg-forge-fog aria-disabled:cursor-not-allowed aria-disabled:border-forge-silver aria-disabled:text-forge-slate aria-disabled:hover:bg-white"
              >
                + Add
              </button>
            </div>
          );
        }
        return (
          <div key={side} role="group" aria-label={`${label} lean-to`} className="flex flex-col gap-4 rounded-[10px] border-2 border-forge-navy p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-forge-display text-[17px] font-bold text-forge-navy">{label} lean-to</p>
              <button type="button" onClick={() => remove(side)} aria-label={`Remove ${name} lean-to`} className={textAction}>
                Remove
              </button>
            </div>
            <Stepper
              label="Depth"
              value={lean.depth}
              min={LIMITS.leanDepth.min}
              max={Math.max(LIMITS.leanDepth.min, max)}
              onChange={(depth) => update(side, { depth })}
              onLimit={(edge) =>
                notify(
                  edge === "min"
                    ? `${LIMITS.leanDepth.min} ft is the shallowest lean-to the builder takes.`
                    : max < LIMITS.leanDepth.max
                      ? `Any deeper and the lean-to would drop below ${LEAN_MIN_OUTER} ft clear at its low edge. Raise the main eave to go deeper.`
                      : `${LIMITS.leanDepth.max} ft is the deepest lean-to the builder takes. For deeper, send your design and say so in the quote form.`,
                )
              }
              helper={`${fmt(leanOuterHeight(d, lean.depth, side))} ft clear at the low edge.`}
            />
            <PillGroup
              label="Walls"
              value={lean.walls}
              onChange={(v) => v && update(side, { walls: v })}
              options={[
                { v: "open", label: "Open" },
                { v: "enclosed", label: "Enclosed" },
              ]}
            />
          </div>
        );
      })}
    </SectionShell>
  );
}
