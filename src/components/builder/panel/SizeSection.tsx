"use client";

import { useState } from "react";

import type { Roof } from "@/lib/builder/catalog";
import { dimensionLimits, fmt, frontEave, resizeDesign, ridgeHeight, type Dim, type DimLimit } from "@/lib/builder/rules";

import { useBuilder } from "../store";
import { ChoiceCards, Notice, SectionShell, Stepper } from "./controls";

/** A raised floor's reason shows under the control only this close to it; further up it reads as a contradiction. */
export const FLOOR_NOTE_FT = 2;

/** The reason to show under a control set to `value`, or null. */
export function floorNote(value: number, lim: DimLimit): string | null {
  return lim.reason && value - lim.min <= FLOOR_NOTE_FT ? lim.reason : null;
}

function RoofArt({ roof }: { roof: Roof }) {
  return (
    <svg viewBox="0 0 120 54" className="h-12 w-full" aria-hidden="true">
      {roof === "gable" ? (
        <path d="M8 26 L60 8 L112 26" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      ) : (
        <path d="M6 14 L114 19" fill="none" stroke="currentColor" strokeWidth="4" />
      )}
      <path d={roof === "gable" ? "M16 24 V50 M104 24 V50" : "M14 15 V50 M106 19 V50"} stroke="#788a9c" strokeWidth="4" />
      <path d="M4 51 H116" stroke="#c9d3dc" strokeWidth="2" />
    </svg>
  );
}

export function SizeSection() {
  const d = useBuilder((s) => s.design);
  const edit = useBuilder((s) => s.edit);
  const notify = useBuilder((s) => s.notify);
  const [notice, setNotice] = useState<string | null>(null);

  // Doors stay where the customer measures them from (rules.resizeDesign).
  const setDim = (dim: Dim) => (v: number) => {
    const r = edit((x) => resizeDesign(x, dim, v), dim);
    setNotice(r.ok ? null : r.issues[0].message);
  };
  const setRoof = (roof: Roof) => {
    const r = edit((x) => ({ ...x, roof }));
    setNotice(r.ok ? null : `${r.issues[0].message} Move or remove it first.`);
  };
  // The Stepper's own messages, except that a raised floor always names what
  // raised it: a number typed far below it lands there, out of the note's range.
  const onLimit = (label: string, lim: DimLimit) => (edge: "min" | "max") =>
    notify(
      edge === "min"
        ? (lim.reason ?? `${fmt(lim.min)} ft is the least the builder takes for ${label.toLowerCase()}.`)
        : `${fmt(lim.max)} ft is the most the builder takes for ${label.toLowerCase()}. For bigger, send your design and say so in the quote form.`,
    );

  const w = dimensionLimits(d, "width");
  const l = dimensionLimits(d, "length");
  const h = dimensionLimits(d, "height");
  const heightLabel = d.roof === "flat" ? "Height (back)" : "Eave height";
  const heightHelper =
    d.roof === "flat"
      ? `Clear height at the back. The roof slopes up to ${fmt(frontEave(d))} ft at the front.`
      : `Height at the eave. The ridge sits at ${fmt(ridgeHeight(d))} ft.`;

  return (
    <SectionShell id="size" title="Size and roof" lede="Width runs across the front. Length runs front to back.">
      <ChoiceCards<Roof>
        label="Roof"
        value={d.roof}
        onChange={setRoof}
        options={[
          { v: "flat", title: "Flat", sub: "Low single slope", art: <RoofArt roof="flat" /> },
          { v: "gable", title: "Gabled", sub: "3:12 pitch, ridge cap", art: <RoofArt roof="gable" /> },
        ]}
      />
      {notice ? <Notice>{notice}</Notice> : null}
      <Stepper
        label="Width"
        value={d.width}
        min={w.min}
        max={w.max}
        onChange={setDim("width")}
        reason={floorNote(d.width, w)}
        onLimit={onLimit("Width", w)}
      />
      <Stepper
        label="Length"
        value={d.length}
        min={l.min}
        max={l.max}
        onChange={setDim("length")}
        reason={floorNote(d.length, l)}
        onLimit={onLimit("Length", l)}
      />
      <Stepper
        label={heightLabel}
        value={d.height}
        min={h.min}
        max={h.max}
        onChange={setDim("height")}
        reason={floorNote(d.height, h)}
        onLimit={onLimit(heightLabel, h)}
        helper={heightHelper}
      />
    </SectionShell>
  );
}
