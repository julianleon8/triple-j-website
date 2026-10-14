"use client";

import { useState } from "react";

import type { Roof } from "@/lib/builder/catalog";
import { dimensionLimits, fmt, frontEave, ridgeHeight, type Dim } from "@/lib/builder/rules";

import { useBuilder } from "../store";
import { ChoiceCards, Notice, SectionShell, Stepper } from "./controls";

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
  const [notice, setNotice] = useState<string | null>(null);

  const setDim = (dim: Dim) => (v: number) => {
    const r = edit((x) => ({ ...x, [dim]: v }), dim);
    setNotice(r.ok ? null : r.issues[0].message);
  };
  const setRoof = (roof: Roof) => {
    const r = edit((x) => ({ ...x, roof }));
    setNotice(r.ok ? null : `${r.issues[0].message} Move or remove it first.`);
  };

  const w = dimensionLimits(d, "width");
  const l = dimensionLimits(d, "length");
  const h = dimensionLimits(d, "height");
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
      <Stepper label="Width" value={d.width} min={w.min} max={w.max} onChange={setDim("width")} reason={w.reason} />
      <Stepper label="Length" value={d.length} min={l.min} max={l.max} onChange={setDim("length")} reason={l.reason} />
      <Stepper
        label={d.roof === "flat" ? "Height (back)" : "Eave height"}
        value={d.height}
        min={h.min}
        max={h.max}
        onChange={setDim("height")}
        reason={h.reason}
        helper={heightHelper}
      />
    </SectionShell>
  );
}
