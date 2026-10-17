"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";

import { ROOF_LABEL, SIDES, USES, USE_LABEL, openingSpec, type OpeningKind, type Use } from "@/lib/builder/catalog";
import { PRESETS, type Design } from "@/lib/builder/design";
import { normalizeDesign, wallState } from "@/lib/builder/rules";
import { wallsLabel } from "@/lib/builder/summary";
import { capture } from "@/lib/analytics";

import { useBuilder } from "../store";
import { WARN } from "../Toast";
import { SectionShell } from "./controls";

const PHOTO: Record<Use, string> = {
  carport: "/images/carport-gable-residential.jpg",
  rv_cover: "/images/carport-concrete-rural.jpg",
  garage: "/images/metal-garage-green.jpg",
  barn: "/images/red-iron-frame-hero.jpg",
};

/**
 * What a starting point comes with beyond the frame and roof, read from the
 * preset itself so a card never promises more or less than it loads.
 */
export function presetIncludes(d: Design): string[] {
  const count = (kind: OpeningKind) => d.openings.filter((o) => openingSpec(o.spec).kind === kind).length;
  const item = (n: number, one: string, many: string) => (n === 0 ? [] : [n === 1 ? one : `${n} ${many}`]);
  const enclosed = SIDES.some((s) => wallState(d, s) === "enclosed") || d.leanTos.some((l) => l.walls === "enclosed");
  return [
    ...item(d.leanTos.length, "lean-to", "lean-tos"),
    ...item(count("rollup"), "roll-up door", "roll-up doors"),
    ...item(count("walk"), "walk door", "walk doors"),
    ...item(count("window"), "window", "windows"),
    ...(d.colors.wainscot && enclosed ? ["wainscot"] : []),
  ];
}

// As the store holds them, so an untouched preset compares equal.
const START = Object.fromEntries(USES.map((u) => [u, JSON.stringify(normalizeDesign(PRESETS[u]))])) as Record<Use, string>;

/**
 * What a tap on a starting point does: the current one just moves on; another
 * one loads at once while the design is still its untouched starting point,
 * and asks first once the customer has changed something.
 */
export function startChoice(d: Design, u: Use): "continue" | "load" | "ask" {
  if (u === d.use) return "continue";
  return JSON.stringify(d) === START[d.use] ? "load" : "ask";
}

/** "Start over as a Barn? This replaces your design." */
export function startOverQuestion(u: Use): string {
  const label = USE_LABEL[u];
  return `Start over as ${/^(?:[AEIOU]|RV)/.test(label) ? "an" : "a"} ${label}? This replaces your design.`;
}

export function StartSection() {
  const use = useBuilder((s) => s.design.use);
  const load = useBuilder((s) => s.load);
  const setSection = useBuilder((s) => s.setSection);
  const notify = useBuilder((s) => s.notify);
  // The starting point waiting on "Start over" or "Keep my design".
  const [asking, setAsking] = useState<Use | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const keepBtn = useRef<HTMLButtonElement>(null);
  const questionId = useId();

  // The safe choice takes focus, and scrolls into view below the card.
  useEffect(() => {
    if (asking) keepBtn.current?.focus();
  }, [asking]);

  function start(u: Use, replacing: boolean) {
    load(PRESETS[u]);
    capture("builder_preset_selected", { use: u });
    if (replacing) notify(`Started over from ${USE_LABEL[u]}. Undo brings your design back.`, { tone: "info" });
    setAsking(null);
    setSection("size");
  }

  function pick(u: Use) {
    const choice = startChoice(useBuilder.getState().design, u);
    if (choice === "ask") return setAsking(u);
    if (choice === "load") start(u, false);
    else setSection("size");
  }

  function keep() {
    const u = asking;
    setAsking(null);
    list.current?.querySelector<HTMLButtonElement>(`[data-use="${u}"]`)?.focus();
  }

  return (
    <SectionShell
      id="start"
      title="What are you building?"
      lede="Pick a starting point. Every size, wall, door and color can change after."
    >
      <div ref={list} className="grid gap-3">
        {USES.map((u) => {
          const p = PRESETS[u];
          const on = u === use;
          const extras = presetIncludes(p);
          const walls = wallsLabel(p);
          const label = USE_LABEL[u];
          return (
            <Fragment key={u}>
              <button
                type="button"
                data-use={u}
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
                  <span className="block font-forge-display text-[18px] font-bold leading-[1.2] text-forge-navy">{label}</span>
                  <span className="mt-0.5 block text-[12px] leading-[1.4] text-forge-slate">
                    {p.width}×{p.length} · {ROOF_LABEL[p.roof].toLowerCase()} · {p.height} ft
                    {extras.length ? ` · ${walls.toLowerCase()}` : null}
                  </span>
                  <span className="mt-0.5 block text-[12px] font-medium leading-[1.4] text-forge-navy">
                    {extras.length ? `Includes ${extras.join(", ")}` : walls}
                  </span>
                </span>
                <span aria-hidden="true" className={`pr-1 text-[16px] ${on ? "text-forge-navy" : "text-forge-steel"}`}>
                  {on ? "✓" : "→"}
                </span>
              </button>
              {asking === u ? (
                <div
                  role="group"
                  aria-labelledby={questionId}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") keep();
                  }}
                  className="rounded-[10px] border border-l-[5px] px-3.5 py-3"
                  style={{ borderColor: WARN, background: "#fffaf2" }}
                >
                  <p id={questionId} className="text-[14px] font-medium leading-[1.5] text-forge-navy">
                    {startOverQuestion(u)}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => start(u, true)}
                      className="h-11 flex-1 cursor-pointer whitespace-nowrap rounded-[6px] border border-forge-navy bg-forge-navy px-4 text-[14px] font-semibold text-white transition-colors hover:bg-forge-navy-raised"
                    >
                      Start over
                    </button>
                    <button
                      ref={keepBtn}
                      type="button"
                      onClick={keep}
                      className="h-11 flex-1 cursor-pointer whitespace-nowrap rounded-[6px] border border-forge-silver bg-white px-4 text-[14px] font-semibold text-forge-navy transition-colors hover:border-forge-navy"
                    >
                      Keep my design
                    </button>
                  </div>
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </SectionShell>
  );
}
