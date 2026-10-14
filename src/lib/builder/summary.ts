/**
 * The design in words: the review list in the builder, the lead message the
 * owner gets by email and in HQ, and the screen-reader description of the
 * 3D view. One wording, everywhere.
 */

import {
  CONCRETE_LABEL,
  FRAME_LABEL,
  OPENING_KIND_LABEL,
  ROOF_LABEL,
  SIDES,
  SIDE_LABEL,
  USE_LABEL,
  WALL_STATE_LABEL,
  builderColor,
  openingSpec,
  type Side,
} from "./catalog";
import type { Design } from "./design";
import { fmt, frontEave, leanOuterHeight, wallState } from "./rules";

export type SummaryRow = { k: string; v: string };

export function sizeLabel(d: Design): string {
  return `${d.width}×${d.length} ft`;
}

function heightLabel(d: Design): string {
  if (d.roof === "flat") return `${d.height} ft at the back, ${fmt(frontEave(d))} ft at the front`;
  return `${d.height} ft eave`;
}

export function wallsLabel(d: Design): string {
  const states = SIDES.map((s) => wallState(d, s));
  if (states.every((s) => s === "open")) return "All open";
  if (states.every((s) => s === "enclosed")) return "Fully enclosed";
  return SIDES.map((s) => `${SIDE_LABEL[s]} ${WALL_STATE_LABEL[wallState(d, s)].toLowerCase()}`).join(" · ");
}

export function openingLines(d: Design): string[] {
  const groups = new Map<string, { label: string; walls: Side[] }>();
  for (const o of d.openings) {
    const spec = openingSpec(o.spec);
    const label =
      spec.kind === "walk"
        ? `walk door (${spec.label})`
        : `${spec.label} ${OPENING_KIND_LABEL[spec.kind].toLowerCase()}`;
    const g = groups.get(o.spec) ?? { label, walls: [] };
    g.walls.push(o.wall);
    groups.set(o.spec, g);
  }
  return [...groups.values()].map(({ label, walls }) => {
    const where = [...new Set(walls)].map((w) => SIDE_LABEL[w].toLowerCase()).join(", ");
    return `${walls.length} × ${label}, ${where}`;
  });
}

export function leanLines(d: Design): string[] {
  return d.leanTos.map((l) => {
    const side = l.side === "back" ? "Back" : SIDE_LABEL[l.side];
    return `${side}: ${l.depth} ft deep, ${l.walls}, ${fmt(leanOuterHeight(d, l.depth))} ft at the low edge`;
  });
}

export function colorsLabel(d: Design): string {
  const parts = [`Roof ${builderColor(d.colors.roof).name}`];
  const anyWall = SIDES.some((s) => wallState(d, s) !== "open") || d.leanTos.some((l) => l.walls === "enclosed");
  // Wainscot is drawn, and offered, on enclosed walls only.
  const anyEnclosed = SIDES.some((s) => wallState(d, s) === "enclosed") || d.leanTos.some((l) => l.walls === "enclosed");
  if (anyWall) parts.push(`Walls ${builderColor(d.colors.walls).name}`);
  parts.push(`Trim ${builderColor(d.colors.trim).name}`);
  if (anyEnclosed && d.colors.wainscot) parts.push(`Wainscot ${builderColor(d.colors.wainscot).name}`);
  return parts.join(" · ");
}

export function frameLabel(d: Design): string {
  const frame = d.frame === "unsure" ? "Welded or bolted (not decided)" : FRAME_LABEL[d.frame];
  const base = `${frame} · 14-gauge`;
  return d.heavyDuty ? `${base} · heavy-duty upgrade (11-gauge columns)` : base;
}

export function concreteLabel(d: Design): string {
  if (d.concrete === "yes") return "Pour a pad · 3,000 PSI standard, priced separately";
  return CONCRETE_LABEL[d.concrete];
}

export function summaryRows(d: Design): SummaryRow[] {
  return [
    { k: "Building", v: `${USE_LABEL[d.use]} · ${sizeLabel(d)}` },
    { k: "Roof", v: `${ROOF_LABEL[d.roof]} · ${heightLabel(d)}` },
    { k: "Frame", v: frameLabel(d) },
    { k: "Walls", v: wallsLabel(d) },
    { k: "Doors & windows", v: openingLines(d).join(" · ") || "None" },
    { k: "Lean-tos", v: leanLines(d).join(" · ") || "None" },
    { k: "Colors", v: colorsLabel(d) },
    { k: "Concrete", v: concreteLabel(d) },
  ];
}

/** The lead's `message`: the design, then the link that reopens it in 3D. */
export function leadMessage(d: Design, link: string, notes?: string): string {
  const lines = [
    "Designed in the 3D builder:",
    ...summaryRows(d).map((r) => `${r.k}: ${r.v}`),
    "",
    `Open the design in 3D: ${link}`,
  ];
  if (notes?.trim()) lines.push("", `Customer notes:\n${notes.trim()}`);
  return lines.join("\n");
}

/** One sentence for the canvas's accessible description. */
export function describeDesign(d: Design): string {
  const openings = openingLines(d);
  return [
    `${USE_LABEL[d.use]}, ${sizeLabel(d)}, ${ROOF_LABEL[d.roof].toLowerCase()}, ${heightLabel(d)}.`,
    `Walls: ${wallsLabel(d).toLowerCase()}.`,
    openings.length ? `Openings: ${openings.join("; ")}.` : "",
    d.leanTos.length ? `Lean-tos: ${leanLines(d).join("; ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
