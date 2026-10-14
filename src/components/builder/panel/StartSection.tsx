"use client";

import Image from "next/image";

import { ROOF_LABEL, USES, USE_LABEL, type Use } from "@/lib/builder/catalog";
import { PRESETS } from "@/lib/builder/design";
import { wallsLabel } from "@/lib/builder/summary";
import { capture } from "@/lib/analytics";

import { useBuilder } from "../store";
import { SectionShell } from "./controls";

const PHOTO: Record<Use, string> = {
  carport: "/images/carport-gable-residential.jpg",
  rv_cover: "/images/carport-concrete-rural.jpg",
  garage: "/images/metal-garage-green.jpg",
  barn: "/images/red-iron-frame-hero.jpg",
};

export function StartSection() {
  const use = useBuilder((s) => s.design.use);
  const load = useBuilder((s) => s.load);
  const setSection = useBuilder((s) => s.setSection);
  const announce = useBuilder((s) => s.announce);
  const edited = useBuilder((s) => s.past.length > 0);

  function pick(u: Use) {
    // The current pick just moves on; it never wipes the design.
    if (u !== use) {
      load(PRESETS[u]);
      capture("builder_preset_selected", { use: u });
      if (edited) announce(`Started over from ${USE_LABEL[u]}. Undo brings your design back.`);
    }
    setSection("size");
  }

  return (
    <SectionShell
      id="start"
      title="What are you building?"
      lede="Pick a starting point. Every size, wall, door and color can change after."
    >
      <div className="grid gap-3">
        {USES.map((u) => {
          const p = PRESETS[u];
          const on = u === use;
          return (
            <button
              key={u}
              type="button"
              onClick={() => pick(u)}
              aria-pressed={on}
              className={`flex cursor-pointer items-center gap-4 rounded-[10px] border-2 p-2.5 text-left transition-colors ${
                on ? "border-forge-navy bg-forge-fog" : "border-forge-silver bg-white hover:border-forge-steel"
              }`}
            >
              <span className="relative h-[62px] w-[82px] flex-none overflow-hidden rounded-[6px]">
                <Image src={PHOTO[u]} alt="" fill sizes="82px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-forge-display text-[18px] font-bold leading-[1.2] text-forge-navy">{USE_LABEL[u]}</span>
                <span className="mt-0.5 block text-[12px] leading-[1.4] text-forge-slate">
                  {p.width}×{p.length} · {ROOF_LABEL[p.roof].toLowerCase()} · {p.height} ft · {wallsLabel(p).toLowerCase()}
                </span>
              </span>
              <span aria-hidden="true" className={`pr-1 text-[16px] ${on ? "text-forge-navy" : "text-forge-steel"}`}>
                {on ? "✓" : "→"}
              </span>
            </button>
          );
        })}
      </div>
      {edited ? (
        <p className="text-[13px] leading-[1.5] text-forge-slate">
          A different starting point replaces your design. Undo, at the top of the 3D view, brings it back.
        </p>
      ) : null}
    </SectionShell>
  );
}
