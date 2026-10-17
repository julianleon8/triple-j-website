/**
 * Builder rules: what fits where. Pure functions over a Design, shared by the
 * controls (to bound inputs and explain why), the 3D layout and the server
 * check on /api/leads.
 *
 * A change is never allowed to silently delete something the customer chose.
 * Doors and windows slide along their wall to stay in bounds; a dimension can
 * only shrink as far as what is on the walls still fits, and the control says
 * why it stops.
 */

import {
  FLAT_PITCH,
  GABLE_PITCH,
  LEAN_ATTACH_DROP,
  LEAN_MIN_OUTER,
  LEAN_PITCH,
  LIMITS,
  OPENING_EDGE_MARGIN,
  OPENING_GAP,
  OPENING_KIND_LABEL,
  SIDE_LABEL,
  openingSpec,
  type LeanSide,
  type Side,
  type WallState,
} from "./catalog";
import type { Design, Opening } from "./design";

// ── Wall geometry ─────────────────────────────────────────────────────────

export function wallLength(d: Design, side: Side): number {
  return side === "front" || side === "back" ? d.width : d.length;
}

/** Main eave (top of the columns) at the front of a flat roof; `height` is at the back. */
export function frontEave(d: Design): number {
  return d.roof === "flat" ? d.height + d.length * FLAT_PITCH : d.height;
}

export function ridgeHeight(d: Design): number {
  return d.roof === "gable" ? d.height + (d.width / 2) * GABLE_PITCH : frontEave(d);
}

/**
 * Height of the eave line on a wall, `u` feet from its left corner (seen from
 * outside). Gable ends rise to the ridge; a flat roof's side walls rise toward
 * the front. Doors and windows must fit under this line.
 */
export function wallTopAt(d: Design, side: Side, u: number): number {
  if (d.roof === "flat") {
    const p = FLAT_PITCH;
    if (side === "front") return frontEave(d);
    if (side === "back") return d.height;
    if (side === "left") return d.height + u * p; // u runs back → front
    return d.height + (d.length - u) * p; // right: u runs front → back
  }
  if (side === "left" || side === "right") return d.height;
  return d.height + Math.min(u, d.width - u) * GABLE_PITCH;
}

/** The eave line is linear or a tent, so its minimum over a span is at an end. */
export function minWallTop(d: Design, side: Side, u0: number, u1: number): number {
  return Math.min(wallTopAt(d, side, u0), wallTopAt(d, side, u1));
}

/** A `gable` closure only exists on the front and back of a gable roof. */
export function wallState(d: Design, side: Side): WallState {
  const s = d.walls[side];
  if (s === "gable" && (d.roof === "flat" || side === "left" || side === "right")) return "open";
  return s;
}

export function wallStatesFor(d: Design, side: Side): WallState[] {
  return d.roof === "gable" && (side === "front" || side === "back")
    ? ["open", "gable", "partial", "enclosed"]
    : ["open", "partial", "enclosed"];
}

// ── Lean-tos ──────────────────────────────────────────────────────────────

/** Deepest lean-to the main eave allows while keeping LEAN_MIN_OUTER clear at its low edge. */
export function maxLeanDepth(d: Design): number {
  const room = Math.floor((d.height - LEAN_ATTACH_DROP - LEAN_MIN_OUTER) / LEAN_PITCH);
  return Math.min(LIMITS.leanDepth.max, room);
}

export function leanOuterHeight(d: Design, depth: number): number {
  return d.height - LEAN_ATTACH_DROP - depth * LEAN_PITCH;
}

export function canAddLean(d: Design, side: LeanSide): { ok: true } | { ok: false; reason: string } {
  if (d.leanTos.some((l) => l.side === side)) return { ok: false, reason: "There is already a lean-to on that side." };
  if (d.leanTos.length >= 2) return { ok: false, reason: "Two lean-tos is the most the builder draws. Ask us about more." };
  if (side === "back" && d.leanTos.length > 0)
    return { ok: false, reason: "A back lean-to can't share corners with a side lean-to." };
  if (side !== "back" && d.leanTos.some((l) => l.side === "back"))
    return { ok: false, reason: "Remove the back lean-to first. It can't share corners with a side lean-to." };
  if (maxLeanDepth(d) < LIMITS.leanDepth.min) {
    const need = Math.ceil(LEAN_ATTACH_DROP + LEAN_MIN_OUTER + LIMITS.leanDepth.min * LEAN_PITCH);
    return { ok: false, reason: `A lean-to needs at least ${need} ft of eave height on the main building.` };
  }
  return { ok: true };
}

// ── Doors and windows ─────────────────────────────────────────────────────

/** "The 10×10 roll-up door", "The walk door": the start of a sentence about one opening. */
export function openingName(o: Pick<Opening, "spec">): string {
  const spec = openingSpec(o.spec);
  return spec.kind === "walk" ? "The walk door" : `The ${spec.label} ${OPENING_KIND_LABEL[spec.kind].toLowerCase()}`;
}

// Where a customer measures a door from: on the side walls, the front
// corner; on the front and back, the left side as seen from the front. The
// stored x is the left edge seen from outside that wall, which on the left
// and back walls runs the other way. Only what is shown and typed converts.

const measuredBackwards = (side: Side) => side === "left" || side === "back";

/** "from the front corner" on a side wall, "from the left side" on the front and back. */
export function positionFrom(side: Side): string {
  return side === "left" || side === "right" ? "from the front corner" : "from the left side";
}

/** The distance a customer reads for an opening whose stored left edge is at `x`. */
export function shownPosition(d: Design, o: Pick<Opening, "wall" | "spec">, x: number): number {
  return measuredBackwards(o.wall) ? wallLength(d, o.wall) - x - openingSpec(o.spec).w : x;
}

/** The stored left edge for a distance the customer typed. The flip undoes itself. */
export function storedPosition(d: Design, o: Pick<Opening, "wall" | "spec">, shown: number): number {
  return shownPosition(d, o, shown);
}

/**
 * Where an opening sits, the way a customer measures it: "4 ft from the front
 * corner" on a side wall, "3 ft from the left side" on the front or back. The
 * one wording for the Doors and windows cards, the plan, the 3D label and the
 * summary.
 */
export function openingPosition(d: Design, o: Pick<Opening, "wall" | "spec" | "x">): string {
  return `${fmt(shownPosition(d, o, o.x))} ft ${positionFrom(o.wall)}`;
}

/** A stored range (openingRange) as the customer reads it; on the left and back walls its ends swap. */
export function shownRange(
  d: Design,
  o: Pick<Opening, "wall" | "spec">,
  r: { min: number; max: number },
): { min: number; max: number } {
  const a = shownPosition(d, o, r.min);
  const b = shownPosition(d, o, r.max);
  return { min: Math.min(a, b), max: Math.max(a, b) };
}

/** Wall height an opening needs: its top edge plus header room. */
export function heightNeeded(o: Opening): number {
  const s = openingSpec(o.spec);
  return s.sill + s.h + s.headroom;
}

const round05 = (n: number) => Math.round(n * 2) / 2;

/**
 * Slide each wall's openings, keeping their order, until they sit inside the
 * wall with the edge margin and gap. Returns a new list in the original order.
 * Openings that cannot all fit are left overlapping; designIssues reports it.
 */
export function packOpenings(d: Design): Opening[] {
  const next = d.openings.map((o) => ({ ...o, x: round05(o.x) }));
  for (const side of ["front", "back", "left", "right"] as const) {
    const on = next.filter((o) => o.wall === side).sort((a, b) => a.x - b.x);
    if (!on.length) continue;
    const len = wallLength(d, side);
    let floor = OPENING_EDGE_MARGIN;
    for (const o of on) {
      o.x = Math.max(o.x, floor);
      floor = o.x + openingSpec(o.spec).w + OPENING_GAP;
    }
    let ceiling = len - OPENING_EDGE_MARGIN;
    for (let i = on.length - 1; i >= 0; i--) {
      const o = on[i];
      const w = openingSpec(o.spec).w;
      o.x = Math.max(OPENING_EDGE_MARGIN, Math.min(o.x, ceiling - w));
      ceiling = o.x - OPENING_GAP;
    }
  }
  return next;
}

export type Issue = { code: string; message: string; openingId?: string; leanSide?: LeanSide };

/** The same problem keeps the same key as numbers change, so an edit that only moves an existing problem toward a fix is not a new one. */
export function issueKey(i: Issue): string {
  return `${i.code}:${i.openingId ?? i.leanSide ?? ""}`;
}

/**
 * Where a lean-to's rafters meet this main wall, if one is attached to it. A
 * door or window must stay below it, or the lean-to roof would cut through it.
 * On a gable end the lean-to hangs from the eave, not the rising rake.
 */
function leanCeilingAt(d: Design, side: Side, u: number): number {
  if (!d.leanTos.some((l) => l.side === side)) return Infinity;
  const gableEnd = d.roof === "gable" && (side === "front" || side === "back");
  return (gableEnd ? d.height : wallTopAt(d, side, u)) - LEAN_ATTACH_DROP;
}

/** The highest a door or window may reach over [u0, u1]: the eave line, or a lean-to's roof. */
export function openingCeiling(d: Design, side: Side, u0: number, u1: number): number {
  return Math.min(minWallTop(d, side, u0, u1), leanCeilingAt(d, side, u0), leanCeilingAt(d, side, u1));
}

function openingIssues(d: Design): Issue[] {
  const issues: Issue[] = [];
  for (const o of d.openings) {
    const spec = openingSpec(o.spec);
    const name = openingName(o);
    const len = wallLength(d, o.wall);
    if (wallState(d, o.wall) !== "enclosed") {
      issues.push({ code: "wall-not-enclosed", openingId: o.id, message: `${name} needs the ${SIDE_LABEL[o.wall].toLowerCase()} wall enclosed.` });
      continue;
    }
    if (o.x < OPENING_EDGE_MARGIN - 1e-6 || o.x + spec.w > len - OPENING_EDGE_MARGIN + 1e-6) {
      issues.push({ code: "off-wall", openingId: o.id, message: `${name} doesn't fit on the ${SIDE_LABEL[o.wall].toLowerCase()} wall.` });
      continue;
    }
    const top = openingCeiling(d, o.wall, o.x, o.x + spec.w);
    if (heightNeeded(o) > top + 1e-6) {
      // Available height rounds down, so it never reads as "needs 13 ft; the wall is 13 ft tall".
      const there = fmt(Math.floor(top * 10) / 10);
      const byLean = top < minWallTop(d, o.wall, o.x, o.x + spec.w) - 1e-6;
      issues.push({
        code: "too-tall",
        openingId: o.id,
        message: byLean
          ? `${name} needs ${fmt(heightNeeded(o))} ft of wall height; the lean-to on that side leaves ${there} ft below its roof.`
          : `${name} needs ${fmt(heightNeeded(o))} ft of wall height where it sits; the wall is ${there} ft tall there.`,
      });
    }
  }
  for (const side of ["front", "back", "left", "right"] as const) {
    const on = d.openings.filter((o) => o.wall === side).sort((a, b) => a.x - b.x);
    for (let i = 1; i < on.length; i++) {
      const prev = on[i - 1];
      if (prev.x + openingSpec(prev.spec).w + OPENING_GAP > on[i].x + 1e-6) {
        issues.push({ code: "overlap", openingId: on[i].id, message: `Two openings on the ${SIDE_LABEL[side].toLowerCase()} wall are too close together.` });
      }
    }
  }
  return issues;
}

function leanIssues(d: Design): Issue[] {
  const issues: Issue[] = [];
  const sides = d.leanTos.map((l) => l.side);
  if (new Set(sides).size !== sides.length) issues.push({ code: "lean-duplicate", message: "Only one lean-to per side." });
  if (sides.includes("back") && sides.length > 1)
    issues.push({ code: "lean-corner", message: "A back lean-to can't share corners with a side lean-to." });
  const max = maxLeanDepth(d);
  for (const l of d.leanTos) {
    if (l.depth > max)
      issues.push({
        code: "lean-depth",
        leanSide: l.side,
        message: `A ${l.depth} ft lean-to drops below ${LEAN_MIN_OUTER} ft clear at its low edge. Raise the main eave or shorten it.`,
      });
  }
  return issues;
}

/** Everything wrong with a design, in plain words. Empty means it can be quoted. */
export function designIssues(d: Design): Issue[] {
  return [...openingIssues(d), ...leanIssues(d)];
}

// ── Normalising and bounding edits ────────────────────────────────────────

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Clamp numbers into range and slide openings back onto their walls. */
export function normalizeDesign(d: Design): Design {
  const next: Design = {
    ...d,
    width: clamp(Math.round(d.width), LIMITS.width.min, LIMITS.width.max),
    length: clamp(Math.round(d.length), LIMITS.length.min, LIMITS.length.max),
    height: clamp(Math.round(d.height), LIMITS.height.min, LIMITS.height.max),
  };
  // Catalog range only. A lean-to too deep for the eave is reported, never
  // shortened, so lowering the eave stops at what the lean-to needs.
  next.leanTos = d.leanTos.map((l) => ({
    ...l,
    depth: clamp(Math.round(l.depth), LIMITS.leanDepth.min, LIMITS.leanDepth.max),
  }));
  next.openings = packOpenings(next);
  return next;
}

export type Dim = "width" | "length" | "height";
export type DimLimit = { min: number; max: number; reason: string | null };

/**
 * The design at a new width, length or height. Doors and windows keep the
 * distance a customer reads for them (shownPosition: from the front corner,
 * from the left side), so on the left and back walls, whose stored edge
 * counts from the far end, they move with the change. Not yet normalised.
 */
export function resizeDesign(d: Design, dim: Dim, value: number): Design {
  const to = clamp(Math.round(value), LIMITS[dim].min, LIMITS[dim].max);
  const by = to - d[dim];
  const wall: Side | null = dim === "width" ? "back" : dim === "length" ? "left" : null;
  return {
    ...d,
    [dim]: to,
    openings: wall && by ? d.openings.map((o) => (o.wall === wall ? { ...o, x: o.x + by } : o)) : d.openings,
  };
}

/**
 * How far each dimension can move from here. The floor rises above the
 * catalog minimum only because of something the customer added, and `reason`
 * names it, in terms of the floor: "Narrower than 25 ft, the 12×12 roll-up
 * door on the front wall won't fit."
 */
export function dimensionLimits(d: Design, dim: Dim): DimLimit {
  const base = LIMITS[dim];
  const ok = (v: number) => designIssues(normalizeDesign(resizeDesign(d, dim, v))).length === 0;
  if (!ok(d[dim])) return { min: base.min, max: base.max, reason: null };
  let min = d[dim];
  while (min > base.min && ok(min - 1)) min--;
  let reason: string | null = null;
  if (min > base.min) {
    const below = normalizeDesign(resizeDesign(d, dim, min - 1));
    const blocked = designIssues(below)[0];
    reason = blocked ? `${belowFloor(d, dim, min)}, ${whatStops(below, blocked)}.` : null;
  }
  return { min, max: base.max, reason };
}

/** A dimension just under its floor, as the Size step names it: "Lower than an 11 ft eave". */
function belowFloor(d: Design, dim: Dim, min: number): string {
  if (dim === "width") return `Narrower than ${min} ft`;
  if (dim === "length") return `Shorter than ${min} ft`;
  if (d.roof === "flat") return `Lower than ${min} ft at the back`;
  return `Lower than ${[8, 11, 18].includes(min) ? "an" : "a"} ${min} ft eave`;
}

const COUNT_WORD = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/**
 * What gives out under the floor, to end that sentence: "the 10×10 roll-up
 * door on the front wall won't fit". Doors alike on one wall are named
 * together, "the two 10×10 roll-up doors": which of them gives out first is
 * nothing a customer can tell apart.
 */
function whatStops(d: Design, i: Issue): string {
  const o = d.openings.find((x) => x.id === i.openingId);
  if (o) {
    const wall = `the ${SIDE_LABEL[o.wall].toLowerCase()} wall`;
    if (i.code === "overlap") return `the doors and windows on ${wall} won't all fit`;
    const w = openingSpec(o.spec).w;
    const underLean = i.code === "too-tall" && openingCeiling(d, o.wall, o.x, o.x + w) < minWallTop(d, o.wall, o.x, o.x + w) - 1e-6;
    const alike = d.openings.filter((x) => x.wall === o.wall && x.spec === o.spec).length;
    const name = openingName(o).replace(/^The /, "");
    const who = alike > 1 ? `the ${COUNT_WORD[alike] ?? alike} ${name.replace(/door$/, "doors").replace(/window$/, "windows")}` : `the ${name}`;
    return `${who} on ${wall} won't fit${underLean ? " under the lean-to" : ""}`;
  }
  const l = d.leanTos.find((x) => x.side === i.leanSide);
  if (i.code === "lean-depth" && l) {
    const where = l.side === "back" ? "the back" : `the ${l.side} side`;
    return `the ${l.depth} ft lean-to on ${where} would drop below ${LEAN_MIN_OUTER} ft at its low edge`;
  }
  return i.message.replace(/\.$/, "").replace(/^\w/, (c) => c.toLowerCase());
}

/**
 * The best spot for a new opening: the valid position nearest the middle of
 * the first wall (in preference order) that has room. Null when none do.
 */
export function placeOpening(d: Design, specId: string, walls: readonly Side[]): Opening | null {
  const spec = openingSpec(specId);
  const id = nextOpeningId(d);
  for (const wall of walls) {
    if (wallState(d, wall) !== "enclosed") continue;
    const len = wallLength(d, wall);
    const mid = (len - spec.w) / 2;
    const candidates: number[] = [];
    for (let x = OPENING_EDGE_MARGIN; x + spec.w <= len - OPENING_EDGE_MARGIN + 1e-6; x += 0.5) candidates.push(x);
    candidates.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
    for (const x of candidates) {
      const trial: Design = { ...d, openings: [...d.openings, { id, spec: specId, wall, x }] };
      if (!openingIssues(trial).some((i) => i.openingId === id || i.code === "overlap")) return { id, spec: specId, wall, x };
    }
  }
  return null;
}

/** A fresh id, one past the highest in use, so a removed opening's id never comes back. */
export function nextOpeningId(d: Design): string {
  const used = d.openings.map((o) => Number(/^o(\d+)$/.exec(o.id)?.[1] ?? 0));
  return `o${Math.max(0, ...used) + 1}`;
}

/** Walls an opening could move to right now. */
export function wallsForOpening(d: Design, o: Opening): Side[] {
  return (["front", "back", "left", "right"] as const).filter((w) => {
    if (wallState(d, w) !== "enclosed") return false;
    if (w === o.wall) return true;
    const others = { ...d, openings: d.openings.filter((x) => x.id !== o.id) };
    return placeOpening(others, o.spec, [w]) !== null;
  });
}

/**
 * Valid left-edge range for an opening on its wall: between its neighbours
 * and, on a sloped eave line, where the wall is tall enough. Walks outward
 * from where it sits in half-foot steps.
 */
export function openingRange(d: Design, o: Opening): { min: number; max: number } {
  const spec = openingSpec(o.spec);
  const len = wallLength(d, o.wall);
  const need = heightNeeded(o);
  const siblings = d.openings.filter((x) => x.wall === o.wall && x.id !== o.id);
  let lo = OPENING_EDGE_MARGIN;
  let hi = len - OPENING_EDGE_MARGIN - spec.w;
  for (const s of siblings) {
    const sw = openingSpec(s.spec).w;
    if (s.x + sw <= o.x) lo = Math.max(lo, s.x + sw + OPENING_GAP);
    else if (s.x >= o.x + spec.w) hi = Math.min(hi, s.x - OPENING_GAP - spec.w);
  }
  const fits = (x: number) => x >= lo - 1e-6 && x <= hi + 1e-6 && openingCeiling(d, o.wall, x, x + spec.w) >= need - 1e-6;
  if (!fits(o.x)) return { min: o.x, max: o.x };
  let min = o.x;
  while (fits(min - 0.5)) min -= 0.5;
  let max = o.x;
  while (fits(max + 0.5)) max += 0.5;
  return { min, max };
}

/** What stops a door or window, and which opening, if one is in the way. */
export type SlideBlock = { message: string; by?: string };

/**
 * Where a dragged door or window lands: the target snapped to half a foot and
 * held inside the stretch it can reach without jumping a neighbour. When it
 * is held back, `blocked` says why.
 */
export function slideOpening(d: Design, o: Opening, target: number): { x: number; blocked: SlideBlock | null } {
  const want = round05(target);
  if (!fitsAt(d, o, o.x)) {
    // It doesn't fit where it is (an old link, a building made smaller):
    // any spot on the wall that fits is a fix, so take the nearest one.
    const spec = openingSpec(o.spec);
    const len = wallLength(d, o.wall);
    let best: number | null = null;
    for (let x = OPENING_EDGE_MARGIN; x + spec.w <= len - OPENING_EDGE_MARGIN + 1e-6; x += 0.5) {
      if (fitsAt(d, o, x) && (best === null || Math.abs(x - want) < Math.abs(best - want))) best = x;
    }
    if (best === null) return { x: o.x, blocked: { message: `${openingName(o)} doesn't fit anywhere on the ${SIDE_LABEL[o.wall].toLowerCase()} wall.` } };
    return { x: best, blocked: best === want ? null : slideBlock(d, { ...o, x: best }, want > best ? 1 : -1) };
  }
  const { min, max } = openingRange(d, o);
  if (want >= min - 1e-6 && want <= max + 1e-6) return { x: want, blocked: null };
  const dir = want < min ? -1 : 1;
  const x = dir < 0 ? min : max;
  return { x, blocked: slideBlock(d, { ...o, x }, dir) };
}

/** Whether an opening fits with its left edge at x: on the wall, clear of its neighbours, under the wall's height there. */
function fitsAt(d: Design, o: Opening, x: number): boolean {
  const spec = openingSpec(o.spec);
  if (x < OPENING_EDGE_MARGIN - 1e-6 || x + spec.w > wallLength(d, o.wall) - OPENING_EDGE_MARGIN + 1e-6) return false;
  for (const s of d.openings) {
    if (s.id === o.id || s.wall !== o.wall) continue;
    const sw = openingSpec(s.spec).w;
    if (x < s.x + sw + OPENING_GAP - 1e-6 && s.x < x + spec.w + OPENING_GAP - 1e-6) return false;
  }
  return openingCeiling(d, o.wall, x, x + spec.w) >= heightNeeded(o) - 1e-6;
}

/** Why an opening at `o.x` can't go another half foot in `dir`. */
function slideBlock(d: Design, o: Opening, dir: -1 | 1): SlideBlock {
  const spec = openingSpec(o.spec);
  const name = openingName(o);
  const next = o.x + dir * 0.5;
  if (next < OPENING_EDGE_MARGIN - 1e-6 || next + spec.w > wallLength(d, o.wall) - OPENING_EDGE_MARGIN + 1e-6) {
    return { message: `${name} stays ${fmt(OPENING_EDGE_MARGIN)} ft from the corner.` };
  }
  const ahead = d.openings
    .filter((s) => s.wall === o.wall && s.id !== o.id && (dir > 0 ? s.x >= o.x + spec.w : s.x + openingSpec(s.spec).w <= o.x))
    .sort((a, b) => (dir > 0 ? a.x - b.x : b.x - a.x))[0];
  if (ahead) {
    const tooClose =
      dir > 0 ? next + spec.w + OPENING_GAP > ahead.x + 1e-6 : ahead.x + openingSpec(ahead.spec).w + OPENING_GAP > next + 1e-6;
    if (tooClose) {
      const other = openingName(ahead);
      const pair =
        other === name
          ? `the two ${name.replace(/^The /, "").replace(/door$/, "doors").replace(/window$/, "windows")}`
          : `${name.replace(/^The /, "the ")} and ${other.replace(/^The /, "the ")}`;
      return { message: `Keep ${fmt(OPENING_GAP)} ft of wall between ${pair}.`, by: ahead.id };
    }
  }
  const top = openingCeiling(d, o.wall, next, next + spec.w);
  const there = fmt(Math.floor(top * 10) / 10);
  const byLean = top < minWallTop(d, o.wall, next, next + spec.w) - 1e-6;
  return {
    message: byLean
      ? `${name} needs ${fmt(heightNeeded(o))} ft of wall height; past here the lean-to leaves ${there} ft below its roof.`
      : `${name} needs ${fmt(heightNeeded(o))} ft of wall height; past here the wall is ${there} ft tall.`,
  };
}

export function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
}
