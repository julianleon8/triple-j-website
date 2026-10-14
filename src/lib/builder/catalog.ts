/**
 * 3D builder catalog: what a customer can choose, and the shop rules that
 * bound those choices.
 *
 * Every limit here is a DRAFT (ruleset `tj-v1-draft`) taken from the sales
 * pack and the jobsite photos, pending the owner's and the crew's sign-off. Change a
 * number here and the whole builder follows: controls, validation, the 3D
 * model, the plan drawing and the server check on /api/leads.
 *
 * Units are feet throughout.
 */

import { PANEL_COLORS } from "@/lib/colors";

export const RULESET_VERSION = "tj-v1-draft";

export const LIMITS = {
  width: { min: 12, max: 40 },
  length: { min: 12, max: 100 },
  /** Eave height. Flat roofs: at the low (back) edge, so it is the clearance. */
  height: { min: 7, max: 20 },
  leanDepth: { min: 6, max: 16 },
} as const;

/** 25×25 is sold as a clear span with no center post; 20×40 flat has one. */
export const MAX_BAY_FT = 25;
/** A "flat" roof is a low single slope, high at the front, draining to the back. */
export const FLAT_PITCH = 0.5 / 12;
export const GABLE_PITCH = 3 / 12;
export const LEAN_PITCH = 2 / 12;
/** A lean-to hangs this far below the main eave on its side. */
export const LEAN_ATTACH_DROP = 1;
/** Clear height at a lean-to's low edge. */
export const LEAN_MIN_OUTER = 7;
/** Doors and windows keep this far from a corner, and from each other. */
export const OPENING_EDGE_MARGIN = 1;
export const OPENING_GAP = 1;
export const WAINSCOT_FT = 3;
/** A partial wall is closed from the eave down this far. */
export const PARTIAL_WALL_FT = 3;
export const MAX_OPENINGS = 24;

export const SIDES = ["front", "back", "left", "right"] as const;
export type Side = (typeof SIDES)[number];
export const SIDE_LABEL: Record<Side, string> = {
  front: "Front",
  back: "Back",
  left: "Left side",
  right: "Right side",
};

/** `gable` closes only the triangle above the eave (front and back of a gable roof). */
export const WALL_STATES = ["open", "gable", "partial", "enclosed"] as const;
export type WallState = (typeof WALL_STATES)[number];
export const WALL_STATE_LABEL: Record<WallState, string> = {
  open: "Open",
  gable: "Gable end",
  partial: `Partial · top ${PARTIAL_WALL_FT} ft`,
  enclosed: "Enclosed",
};

export const ROOFS = ["flat", "gable"] as const;
export type Roof = (typeof ROOFS)[number];
export const ROOF_LABEL: Record<Roof, string> = { flat: "Flat roof", gable: "Gabled roof" };

/** One-to-one with `leads.service_type`. */
export const USES = ["carport", "rv_cover", "garage", "barn"] as const;
export type Use = (typeof USES)[number];
export const USE_LABEL: Record<Use, string> = {
  carport: "Carport",
  rv_cover: "RV & boat cover",
  garage: "Garage & shop",
  barn: "Barn",
};

export const FRAMES = ["welded", "bolted", "unsure"] as const;
export type Frame = (typeof FRAMES)[number];
export const FRAME_LABEL: Record<Frame, string> = { welded: "Welded", bolted: "Bolted", unsure: "Not sure yet" };

/** Same values as `leads.needs_concrete`. */
export const CONCRETE = ["yes", "already_have", "unsure"] as const;
export type Concrete = (typeof CONCRETE)[number];
export const CONCRETE_LABEL: Record<Concrete, string> = {
  yes: "Pour a pad",
  already_have: "Already have one",
  unsure: "Not sure yet",
};

export const LEAN_SIDES = ["left", "right", "back"] as const;
export type LeanSide = (typeof LEAN_SIDES)[number];

// ── Doors and windows ─────────────────────────────────────────────────────

export type OpeningKind = "rollup" | "walk" | "window";

export type OpeningSpec = {
  id: string;
  kind: OpeningKind;
  /** Short size label, e.g. "10×10". */
  label: string;
  w: number;
  h: number;
  /** Height of the bottom edge above the floor. */
  sill: number;
  /** Wall needed above the top edge: a roll-up's drum and header, a door or window header. */
  headroom: number;
};

/** Roll-up sizes from the crew's handwritten price sheet; 12×14 from the sales pack. */
export const OPENING_SPECS: readonly OpeningSpec[] = [
  { id: "r8x8", kind: "rollup", label: "8×8", w: 8, h: 8, sill: 0, headroom: 1 },
  { id: "r10x10", kind: "rollup", label: "10×10", w: 10, h: 10, sill: 0, headroom: 1 },
  { id: "r12x12", kind: "rollup", label: "12×12", w: 12, h: 12, sill: 0, headroom: 1 },
  { id: "r12x14", kind: "rollup", label: "12×14", w: 12, h: 14, sill: 0, headroom: 1 },
  { id: "r14x14", kind: "rollup", label: "14×14", w: 14, h: 14, sill: 0, headroom: 1 },
  { id: "r16x16", kind: "rollup", label: "16×16", w: 16, h: 16, sill: 0, headroom: 1 },
  { id: "walk", kind: "walk", label: "36 in × 80 in", w: 3, h: 80 / 12, sill: 0, headroom: 0.5 },
  { id: "win3x3", kind: "window", label: "3×3", w: 3, h: 3, sill: 3.5, headroom: 0.5 },
] as const;

export const OPENING_SPEC_IDS = OPENING_SPECS.map((s) => s.id) as [string, ...string[]];

export const OPENING_KIND_LABEL: Record<OpeningKind, string> = {
  rollup: "Roll-up door",
  walk: "Walk door",
  window: "Window",
};

export function openingSpec(id: string): OpeningSpec {
  const spec = OPENING_SPECS.find((s) => s.id === id);
  if (!spec) throw new Error(`Unknown opening spec: ${id}`);
  return spec;
}

// ── Colors ────────────────────────────────────────────────────────────────

/**
 * Screen colors for the Standard Line (26 & 29-gauge exposed fastener), the
 * panels the builder draws. Averaged from the centre of each swatch image that
 * /services/colors shows (getSwatchUrl), 2026-10-14. Names come from
 * src/lib/colors.ts, which stays the one owner of the catalog.
 */
const SWATCH_HEX: Record<string, string> = {
  "Alamo-White": "#e8e9d9",
  "Ash-Gray": "#aeab98",
  Black: "#0c0b09",
  "Brite-Red": "#a92229",
  Brown: "#4e321d",
  "Brilliant-White": "#eff2eb",
  Burgundy: "#462222",
  "Burnished-Slate": "#484536",
  Charcoal: "#65655d",
  "Copper-Penny": "#bf7c33",
  "Fern-Green": "#133b23",
  "Gallery-Blue": "#1a4a5e",
  Galvalume: "#c7c5c4",
  "Hunter-Green": "#135031",
  "Light-Stone": "#d3c79f",
  "Ocean-Blue": "#3e6167",
  "Pewter-Gray": "#8b8c7e",
  "Polar-White": "#e8e9d9",
  "Rustic-Red": "#843526",
  Tan: "#ba9c76",
  Taupe: "#9b937c",
};

export type BuilderColor = { slug: string; name: string; hex: string; metallic: boolean };

export const BUILDER_COLORS: readonly BuilderColor[] = PANEL_COLORS.filter((c) => c.line === "Turnium").map(
  (c) => ({
    slug: c.slug,
    name: c.name,
    hex: SWATCH_HEX[c.slug] ?? "#9aa0a6",
    metallic: c.slug === "Galvalume",
  }),
);

export const COLOR_SLUGS = BUILDER_COLORS.map((c) => c.slug) as [string, ...string[]];

export function builderColor(slug: string): BuilderColor {
  return BUILDER_COLORS.find((c) => c.slug === slug) ?? BUILDER_COLORS[0];
}

/** Red iron, the frame color in every gallery photo. Not a customer choice. */
export const FRAME_HEX = "#5a2a1f";
