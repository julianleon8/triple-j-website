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
import { fmt, frontEave, gutterEdges, leanOuterHeight, positionFrom, shownPosition, wallState } from "./rules";

/** Where one door or window sits, in words. Owned by rules.ts, next to the measuring it words; offered here with the rest of the wording. */
export { openingPosition } from "./rules";

/** `lines`: the same list as `v`, one item each, for a place with room to stack them. */
export type SummaryRow = { k: string; v: string; lines?: string[] };

const AND = new Intl.ListFormat("en", { type: "conjunction" });

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

/**
 * One line per size per wall, with every spot that size sits at, measured as
 * rules.openingPosition measures one:
 * "1 × walk door (36 in × 80 in), right side, 4 ft from the front corner",
 * "2 × 10×10 roll-up door, front, 4 ft and 16 ft from the left side".
 */
export function openingLines(d: Design): string[] {
  const groups = new Map<string, { label: string; wall: Side; at: number[] }>();
  for (const o of d.openings) {
    const spec = openingSpec(o.spec);
    const label =
      spec.kind === "walk"
        ? `walk door (${spec.label})`
        : `${spec.label} ${OPENING_KIND_LABEL[spec.kind].toLowerCase()}`;
    const key = `${o.wall}:${o.spec}`;
    const g = groups.get(key) ?? { label, wall: o.wall, at: [] };
    g.at.push(shownPosition(d, o, o.x));
    groups.set(key, g);
  }
  return [...groups.values()]
    .sort((a, b) => SIDES.indexOf(a.wall) - SIDES.indexOf(b.wall))
    .map(({ label, wall, at }) => {
      const where = AND.format(at.sort((a, b) => a - b).map((n) => `${fmt(n)} ft`));
      return `${at.length} × ${label}, ${SIDE_LABEL[wall].toLowerCase()}, ${where} ${positionFrom(wall)}`;
    });
}

export function leanLines(d: Design): string[] {
  return [...d.leanTos]
    .sort((a, b) => SIDES.indexOf(a.side) - SIDES.indexOf(b.side))
    .map((l) => `${SIDE_LABEL[l.side]}: ${l.depth} ft deep, ${l.walls}, ${fmt(leanOuterHeight(d, l.depth, l.side))} ft at the low edge`);
}

/** "10 ft deep at the back, closed in, with a walk door". */
export function storageLabel(d: Design): string {
  if (!d.storage) return "None";
  return `${d.storage.depth} ft deep at the ${d.storage.end}, closed in, with a walk door`;
}

/** "K-style, with downspouts, on both eaves · Charcoal, like the trim". */
export function guttersLabel(d: Design): string {
  const edges = gutterEdges(d);
  if (!edges.length) return "None";
  const main = edges.filter((e) => e.roof === "main").map((e) => e.side);
  const leans = edges.filter((e) => e.roof === "lean").map((e) => e.side);
  const parts = [
    ...(main.length === 2 ? ["both eaves"] : main.map((s) => `the ${s} eave`)),
    ...(leans.length ? [`the ${AND.format(leans)} ${leans.length === 1 ? "lean-to" : "lean-tos"}`] : []),
  ];
  return `K-style, with downspouts, on ${AND.format(parts)} · ${builderColor(d.colors.trim).name}, like the trim`;
}

/** Fiberglass on the roof and on every wall that is closed in. */
export function insulationLabel(d: Design): string {
  if (!d.insulation) return "None";
  return hasWallPanels(d) ? "Fiberglass, on the roof and the closed walls" : "Fiberglass, on the roof";
}

/** Any wall with panels on it: an open wall has none. */
function hasWallPanels(d: Design): boolean {
  return SIDES.some((s) => wallState(d, s) !== "open") || d.leanTos.some((l) => l.walls === "enclosed");
}

export function colorsLabel(d: Design): string {
  const parts = [`Roof ${builderColor(d.colors.roof).name}`];
  const anyWall = hasWallPanels(d);
  // Wainscot is drawn, and offered, on enclosed walls only.
  const anyEnclosed = SIDES.some((s) => wallState(d, s) === "enclosed") || d.leanTos.some((l) => l.walls === "enclosed");
  if (anyWall) parts.push(`Walls ${builderColor(d.colors.walls).name}`);
  parts.push(`Trim ${builderColor(d.colors.trim).name}`);
  // Only worth a line when it differs: by default the ridge cap matches the roof.
  if (d.roof === "gable" && d.colors.ridge && d.colors.ridge !== d.colors.roof) parts.push(`Ridge cap ${builderColor(d.colors.ridge).name}`);
  if (anyEnclosed && d.colors.wainscot) parts.push(`Wainscot ${builderColor(d.colors.wainscot).name}`);
  return parts.join(" · ");
}

export function frameLabel(d: Design): string {
  const frame = d.frame === "unsure" ? "Welded or bolted (not decided)" : FRAME_LABEL[d.frame];
  const base = `${frame} · 14-gauge`;
  return d.heavyDuty ? `${base} · heavy-duty upgrade (11-gauge columns)` : base;
}

/** Every panel is 26-gauge PBR: the only panel Triple J builds with. */
export function panelsLabel(d: Design): string {
  return hasWallPanels(d) ? "26-gauge PBR, roof and walls" : "26-gauge PBR roof";
}

export function concreteLabel(d: Design): string {
  if (d.concrete === "yes") return "Pour a pad · 3,000 PSI standard, priced separately";
  return CONCRETE_LABEL[d.concrete];
}

export function summaryRows(d: Design): SummaryRow[] {
  const openings = openingLines(d);
  const leans = leanLines(d);
  return [
    { k: "Building", v: `${USE_LABEL[d.use]} · ${sizeLabel(d)}` },
    { k: "Roof", v: `${ROOF_LABEL[d.roof]} · ${heightLabel(d)}` },
    { k: "Frame", v: frameLabel(d) },
    { k: "Walls", v: wallsLabel(d) },
    { k: "Panels", v: panelsLabel(d) },
    { k: "Storage room", v: storageLabel(d) },
    { k: "Doors & windows", v: openings.join(" · ") || "None", lines: openings },
    { k: "Lean-tos", v: leans.join(" · ") || "None", lines: leans },
    { k: "Colors", v: colorsLabel(d) },
    { k: "Gutters", v: guttersLabel(d) },
    { k: "Insulation", v: insulationLabel(d) },
    { k: "Concrete", v: concreteLabel(d) },
  ];
}

/** Starts the line of a lead message that carries the 3D link. */
const DESIGN_LINK_LINE = "Open the design in 3D: ";

/** The lead's `message`: the design, then the link that reopens it in 3D. */
export function leadMessage(d: Design, link: string, notes?: string): string {
  const lines = [
    "Designed in the 3D builder:",
    ...summaryRows(d).map((r) => `${r.k}: ${r.v}`),
    "",
    `${DESIGN_LINK_LINE}${link}`,
  ];
  if (notes?.trim()) lines.push("", `Customer notes:\n${notes.trim()}`);
  return lines.join("\n");
}

/**
 * A lead message without its 3D link line, for a place that already shows the
 * link on its own (the owner alert's "3D design" row). The stored message
 * keeps the line for HQ.
 */
export function withoutDesignLink(message: string): string {
  const lines = message.split("\n");
  const i = lines.findIndex((l) => l.startsWith(DESIGN_LINK_LINE));
  if (i < 0) return message;
  // Take the blank line above it too, so no gap is left behind.
  const from = i > 0 && lines[i - 1].trim() === "" ? i - 1 : i;
  lines.splice(from, i - from + 1);
  return lines.join("\n").trim();
}

/** One sentence for the canvas's accessible description. */
export function describeDesign(d: Design): string {
  const openings = openingLines(d);
  return [
    `${USE_LABEL[d.use]}, ${sizeLabel(d)}, ${ROOF_LABEL[d.roof].toLowerCase()}, ${heightLabel(d)}.`,
    `Walls: ${wallsLabel(d).toLowerCase()}.`,
    d.storage ? `Storage room: ${storageLabel(d)}.` : "",
    openings.length ? `Openings: ${openings.join("; ")}.` : "",
    d.leanTos.length ? `Lean-tos: ${leanLines(d).join("; ")}.` : "",
    d.gutters ? `Gutters: ${guttersLabel(d)}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
