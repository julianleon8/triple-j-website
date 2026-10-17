/**
 * Builder layout: a Design turned into framing members, panel surfaces and
 * opening placements, in feet. Pure data with no three.js, so the counts and
 * bounds are unit-tested; src/components/builder/scene turns it into meshes.
 *
 * Axes: x runs left → right seen from the front, y is up, z runs back → front
 * (the front wall faces +z). The origin is the middle of the footprint at
 * grade. The frame is built the way the crew builds it: posts, then
 * receivers (plain C-channels) on top of the posts all the way around, then
 * purlins (C-channels with their edges turned in) cut to fit and slotted
 * inside the receivers, tops flush, so the roof steel sits on both. A frame
 * line inside the building gets a double receiver: two back to back, so the
 * purlins of both bays slot in. A storage room's inner wall stands on a frame
 * line of its own.
 */

import {
  FLAT_PITCH,
  GABLE_PITCH,
  LEAN_ATTACH_DROP,
  LEAN_PITCH,
  MAX_BAY_FT,
  OPENING_SPECS,
  PARTIAL_WALL_FT,
  RECEIVER_DEPTH,
  SIDES,
  WAINSCOT_FT,
  openingSpec,
  type OpeningKind,
  type OpeningSpec,
  type Side,
  type WallState,
} from "./catalog";
import type { Design, LeanTo } from "./design";
import { gutterEdges, partitionAt, wallLength, wallState, wallTopAt } from "./rules";

export type Vec3 = [number, number, number];

/** "ridge" is the ridge cap, painted the roof color unless the customer picks one. */
export type MemberMat = "frame" | "trim" | "ridge";
/**
 * "box" is solid (posts, trim); "c" a plain C-channel (a receiver); "lipped"
 * a C with its edges turned in (a purlin); "gutter" a K-style gutter.
 */
export type MemberProfile = "box" | "c" | "lipped" | "gutter";
/**
 * A member from `a` to `b`: `d` deep toward `up` (default: world up), `w`
 * wide across. A channel is `d` deep and `w` across its flanges, and its
 * open side faces `open`. A gutter is `d` tall and `w` wide, open at the
 * top, its front facing (b − a) × up.
 */
export type Member = { a: Vec3; b: Vec3; w: number; d: number; mat: MemberMat; up?: Vec3; profile?: MemberProfile; open?: Vec3 };

export type SurfaceMat = "roof" | "wall" | "wainscot" | "rollup";
export type Hole = { u0: number; u1: number; v0: number; v1: number };
/**
 * A ribbed panel region. Points are origin + u·uAxis + v·vAxis; ribs run along
 * v and the outward face is uAxis × vAxis. `bottom` and `top` are piecewise-
 * linear v(u) as breakpoints sorted by u.
 */
export type Surface = {
  key: string;
  mat: SurfaceMat;
  profile: "pbr" | "slat";
  origin: Vec3;
  uAxis: Vec3;
  vAxis: Vec3;
  uLen: number;
  bottom: [number, number][];
  top: [number, number][];
  holes: Hole[];
};

export type OpeningPlacement = {
  id: string;
  kind: OpeningKind;
  side: Side;
  /** Bottom-left corner of the opening on the wall face, seen from outside. */
  origin: Vec3;
  uAxis: Vec3;
  normal: Vec3;
  w: number;
  h: number;
};

/** A door drawn into the design that is not one of its doors (the storage room's walk door): not picked, not dragged. */
export type FixedDoor = {
  key: string;
  /** Bottom-left corner on the face it is seen from, as for an opening. */
  origin: Vec3;
  uAxis: Vec3;
  normal: Vec3;
  w: number;
  h: number;
  /** Thickness of the wall it stands in, back from that face. */
  thick: number;
};

export type Layout = {
  base: number;
  slab: { x0: number; x1: number; z0: number; z1: number; t: number } | null;
  members: Member[];
  surfaces: Surface[];
  openings: OpeningPlacement[];
  fixedDoors: FixedDoor[];
  bounds: { min: Vec3; max: Vec3 };
};

// Section sizes, feet. Drafts until the crew signs them off (docs/3D-BUILDER.md).
export const COL = 1 / 3; // 4 in square tube posts
/**
 * Receiver: a plain C-channel, 8 in deep (Julian: 7 or 8). Its bottom flange
 * is notched around each post, so the post runs up inside it and the top
 * flange rests on the post: receiver top flush with the post top, bolted
 * through the web.
 */
export const REC_D = RECEIVER_DEPTH;
export const REC_B = 2.5 / 12;
/** Roof purlin: 6 in, edges turned in, slotted inside the receivers. */
export const PUR_D = 6 / 12;
export const PUR_B = 2 / 12;
/** Wall purlin: 4 in, as deep as the posts it runs between. */
const WALL_PUR_D = 4 / 12;
const WALL_PUR_B = 2 / 12;
/** Drawn wall thickness of the channels: 14 gauge is 0.075 in; a hair more so it reads on screen. */
export const STEEL_T = 0.1 / 12;
/** The turned-in edge of a purlin. */
export const PUR_LIP = 0.75 / 12;
const OVERHANG = 0.5;
/** Most between roof purlins, center to center (the 26×25's were about 4 ft 4 in). */
const PURLIN_SPACING = 4.5;
/** The top purlin's edge this far off the ridge or the main wall. */
const PURLIN_TOP_GAP = 2 / 12;
const GIRT_SPACING = 4;
/** A wall purlin's middle stays this far under the receiver, so the two don't touch. */
const GIRT_CLEAR = 0.25;
const END_POST_SPACING = 10;
/** Header (and window sill) depth framing an opening. */
const OPENING_HEAD = 0.35;
/** Less room than this between an opening and the receiver, and the receiver is the header. */
const MIN_HEADER = 0.15;
const FASCIA_D = 0.42;
const FASCIA_W = 0.08;
/** Corner trim: square, standing just outside the corner it covers. */
const CORNER_TRIM = 0.3;
/** Air between the top of a corner trim and the roof panel over it. */
const TRIM_CLEAR = 0.02;
/** PBR major rib height: 1¼ in, on the 26-gauge PBR every roof and wall gets. */
export const RIB = 1.25 / 12;
/** K-style gutter, 5 in across the top and 4 in tall, hung just under the top of the fascia. */
export const GUTTER_W = 5 / 12;
export const GUTTER_H = 4 / 12;
const GUTTER_DROP = 0.03;
/** Downspout, 2 × 3 in: 2 in out from the wall, 3 in along it. */
export const DOWNSPOUT_D = 2 / 12;
export const DOWNSPOUT_W = 3 / 12;
/** A downspout's middle this far from a corner with trim on it; with none, it runs down the corner post. */
const DOWNSPOUT_INSET = 0.5;
export const SLAB_T = 1 / 3;
const SLAB_MARGIN = 0.25;
/** Air between panels and the steel behind them, so the two never flicker through each other. */
const GAP = 0.04;
/** Out past a wall's ribs, from its line: where a downspout runs down a sheeted wall. */
const PAST_RIBS = GAP + RIB + 0.02;
/**
 * A lean-to's roof end at an open corner (a side lean-to meeting a front or
 * back one): just past its end wall's ribs, not out over the corner square.
 */
const SHEET_OUT = PAST_RIBS;

const CHANNEL = {
  rec: { d: REC_D, w: REC_B, profile: "c" },
  pur: { d: PUR_D, w: PUR_B, profile: "lipped" },
  wall: { d: WALL_PUR_D, w: WALL_PUR_B, profile: "lipped" },
} as const;
type Channel = (kind: keyof typeof CHANNEL, a: Vec3, b: Vec3, open: Vec3, up?: Vec3) => void;

/**
 * Receiver lines across a run, in order: an end line opens inward, a line
 * inside the run is a double receiver opening both ways. `webs` are where the
 * receivers' backs sit, from one end to the other.
 */
function receiverLines(webs: number[]): { at: number; dir: 1 | -1 }[] {
  const out: { at: number; dir: 1 | -1 }[] = [];
  const sign = webs[1] > webs[0] ? 1 : -1;
  webs.forEach((at, i) => {
    if (i > 0) out.push({ at, dir: (-sign) as 1 | -1 });
    if (i < webs.length - 1) out.push({ at, dir: sign as 1 | -1 });
  });
  return out;
}

/** The stretches between receiver backs, where purlins run, each end stopping at a web. */
function bays(webs: number[]): [number, number][] {
  const sign = webs[1] > webs[0] ? 1 : -1;
  return webs.slice(0, -1).map((at, i) => [at + sign * STEEL_T, webs[i + 1] - sign * STEEL_T] as [number, number]);
}

/** Purlin stations between `first` and `last`, no gap wider than PURLIN_SPACING; the ends themselves are excluded. */
function stations(first: number, last: number): number[] {
  const gaps = Math.max(1, Math.ceil((last - first) / PURLIN_SPACING - 1e-9));
  return Array.from({ length: gaps - 1 }, (_, i) => first + ((last - first) * (i + 1)) / gaps);
}

// ── small vector helpers ──────────────────────────────────────────────────

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Frame lines from front to back, no bay wider than MAX_BAY_FT. */
export function frameLines(length: number): number[] {
  const n = Math.max(1, Math.ceil(length / MAX_BAY_FT));
  const span = length - COL;
  return Array.from({ length: n + 1 }, (_, i) => length / 2 - COL / 2 - (i * span) / n);
}

/** Where the storage room's inner wall stands (z), or null with no storage room. */
export function partitionZ(d: Design): number | null {
  if (!d.storage) return null;
  const L = d.length / 2;
  return d.storage.end === "back" ? -L + d.storage.depth : L - d.storage.depth;
}

/**
 * The main building's frame lines, front to back. A storage room's inner wall
 * is a frame line of its own, and the bays each side of it are spread the way
 * frameLines spreads a whole building's.
 */
export function buildingFrameLines(d: Design): number[] {
  const zp = partitionZ(d);
  if (zp === null) return frameLines(d.length);
  const L = d.length / 2;
  const run = (from: number, to: number, len: number) => {
    const n = Math.max(1, Math.ceil(len / MAX_BAY_FT));
    return Array.from({ length: n + 1 }, (_, i) => from + ((to - from) * i) / n);
  };
  return [...run(L - COL / 2, zp, L - zp), ...run(zp, -L + COL / 2, zp + L).slice(1)];
}

/** `count` evenly spaced values from a to b inclusive. */
function spread(a: number, b: number, count: number): number[] {
  if (count <= 1) return [(a + b) / 2];
  return Array.from({ length: count }, (_, i) => a + ((b - a) * i) / (count - 1));
}

/** Pieces of [lo, hi] left after removing the gaps. */
function segments(lo: number, hi: number, gaps: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  let start = lo;
  for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) {
    if (g1 <= start || g0 >= hi) continue;
    if (g0 > start) out.push([start, g0]);
    start = Math.max(start, g1);
  }
  if (start < hi) out.push([start, hi]);
  return out.filter(([a, b]) => b - a > 0.05);
}

/**
 * Corner trim centered on (x, z), from `bottom` up to just under the roof.
 * It stands outside the walls, where a sloped roof is already lower than over
 * the corner itself, so it stops under the lowest point of the roof over it;
 * `roofUnder` is the roof's underside there.
 */
function cornerTrim(member: (m: Member) => void, x: number, z: number, bottom: number, roofUnder: (x: number, z: number) => number) {
  const r = CORNER_TRIM / 2;
  const top = Math.min(...[-r, r].flatMap((dx) => [-r, r].map((dz) => roofUnder(x + dx, z + dz)))) - TRIM_CLEAR;
  member({ a: [x, bottom, z], b: [x, top, z], w: CORNER_TRIM, d: CORNER_TRIM, mat: "trim" });
}

/**
 * A K-style gutter hung on a fascia, `a` to `b` along the top of its outer
 * face, the gutter's front toward `out`, with a downspout from it to each
 * point in `drops` (where the downspout meets the ground, on the line it runs
 * down). Each leaves the gutter's bottom, elbows back to that line, runs down
 * it and kicks out at the foot.
 */
function gutterRun(member: (m: Member) => void, a0: Vec3, b0: Vec3, out: Vec3, drops: Vec3[]) {
  const shift = add(scale(out, GUTTER_W / 2 + 0.01), [0, -GUTTER_DROP - GUTTER_H / 2, 0]);
  let a = add(a0, shift);
  let b = add(b0, shift);
  // The gutter's front faces (b − a) × up.
  if (dot(cross(sub(b, a), [0, 1, 0]), out) < 0) [a, b] = [b, a];
  member({ a, b, w: GUTTER_W, d: GUTTER_H, mat: "trim", profile: "gutter" });
  const run = sub(b, a);
  const len = Math.hypot(run[0], run[1], run[2]);
  const t = scale(run, 1 / len);
  const level = norm([t[0], 0, t[2]]);
  // End caps.
  for (const [p, dir] of [
    [a, -1],
    [b, 1],
  ] as const) {
    member({ a: p, b: add(p, scale(t, dir * 0.03)), w: GUTTER_W, d: GUTTER_H, mat: "trim" });
  }
  for (const g of drops) {
    // Measured level, so a gutter that follows a slope still finds the spot over the drop.
    const along = Math.min(len, Math.max(0, dot(sub(g, a), level) / dot(t, level)));
    const c = add(a, scale(t, along));
    const top: Vec3 = [c[0], c[1] - GUTTER_H / 2, c[2]];
    const outlet: Vec3 = [c[0], top[1] - 0.3, c[2]];
    const back = Math.hypot(g[0] - c[0], g[2] - c[2]);
    const elbow: Vec3 = [g[0], outlet[1] - back, g[2]];
    const foot: Vec3 = [g[0], g[1] + 0.5, g[2]];
    const kick: Vec3 = [g[0] + out[0] * 0.4, g[1] + 0.12, g[2] + out[2] * 0.4];
    // Joints overlap a little, so a bend shows no gap.
    const lap = DOWNSPOUT_D / 2;
    const piece = (p: Vec3, q: Vec3, lapP: number, lapQ: number) => {
      const u = norm(sub(q, p));
      member({ a: add(p, scale(u, -lapP)), b: add(q, scale(u, lapQ)), w: DOWNSPOUT_D, d: DOWNSPOUT_W, mat: "trim", up: level });
    };
    piece(top, outlet, 0, lap);
    piece(outlet, elbow, lap, lap);
    piece(elbow, foot, lap, lap);
    piece(foot, kick, lap, 0);
  }
}

// ── wall frames ───────────────────────────────────────────────────────────

type WallFrame = { origin: Vec3; uAxis: Vec3; normal: Vec3; len: number };

/** Outer face of each main wall; u runs from its left corner seen from outside. */
function wallFrame(d: Design, side: Side, base: number): WallFrame {
  const W = d.width / 2;
  const L = d.length / 2;
  switch (side) {
    case "front":
      return { origin: [-W, base, L + GAP], uAxis: [1, 0, 0], normal: [0, 0, 1], len: d.width };
    case "back":
      return { origin: [W, base, -L - GAP], uAxis: [-1, 0, 0], normal: [0, 0, -1], len: d.width };
    case "left":
      return { origin: [-W - GAP, base, -L], uAxis: [0, 0, 1], normal: [-1, 0, 0], len: d.length };
    case "right":
      return { origin: [W + GAP, base, L], uAxis: [0, 0, -1], normal: [1, 0, 0], len: d.length };
  }
}

const wallPoint = (f: WallFrame, u: number, v: number, out = 0): Vec3 =>
  add(add(add(f.origin, scale(f.uAxis, u)), [0, v, 0]), scale(f.normal, out));

/** Where posts and wall purlins sit from a wall's panel face: their middle, half a post inside the wall line. */
const INSIDE = -COL / 2 - GAP;
/**
 * How far the storage room's inner wall reaches each way from its middle: the
 * double receiver on it, air, then the panel and its ribs.
 */
const PARTITION_FACE = REC_B + GAP + RIB + 0.03;

/**
 * The framing inside a wall line around one opening at `x`: jambs each side,
 * a header and, under a window, a sill. A roll-up's jambs run all the way up
 * inside the receiver, for reinforcement; a walk door's and a window's stop
 * at the header. An opening that comes up close under the receiver gets a
 * shallower header, or none: the receiver is its header. `topAt` is the
 * wall's eave line, `recUnder` the receiver's bottom along it.
 */
function frameOpening(
  member: (m: Member) => void,
  f: WallFrame,
  inside: number,
  x: number,
  s: OpeningSpec,
  topAt: (u: number) => number,
  recUnder: (u: number) => number,
) {
  const across: [number, number] = [x - COL - 0.02, x + s.w + COL + 0.02];
  const headD = Math.min(OPENING_HEAD, Math.min(recUnder(across[0]), recUnder(across[1])) - (s.sill + s.h));
  const header = headD >= MIN_HEADER;
  for (const u of [x - COL / 2 - 0.02, x + s.w + COL / 2 + 0.02]) {
    const jambTop = s.kind === "rollup" || !header ? topAt(u) - STEEL_T : s.sill + s.h + headD;
    member({ a: wallPoint(f, u, 0, inside), b: wallPoint(f, u, jambTop, inside), w: COL, d: COL, mat: "frame", up: f.normal });
  }
  if (header) {
    const headV = s.sill + s.h + headD / 2;
    member({ a: wallPoint(f, across[0], headV, inside), b: wallPoint(f, across[1], headV, inside), w: COL, d: headD, mat: "frame" });
  }
  if (s.sill > 0) {
    const sillV = s.sill - OPENING_HEAD / 2;
    member({ a: wallPoint(f, across[0], sillV, inside), b: wallPoint(f, across[1], sillV, inside), w: COL, d: OPENING_HEAD, mat: "frame" });
  }
}

// ── the layout ────────────────────────────────────────────────────────────

export function layoutBuilding(d: Design): Layout {
  const members: Member[] = [];
  const surfaces: Surface[] = [];
  const openings: OpeningPlacement[] = [];
  const fixedDoors: FixedDoor[] = [];
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  const grow = (p: Vec3) => {
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], p[i]);
      max[i] = Math.max(max[i], p[i]);
    }
  };
  const member = (m: Member) => {
    members.push(m);
    grow(m.a);
    grow(m.b);
  };
  const channel: Channel = (kind, a, b, open, up) => {
    const c = CHANNEL[kind];
    member({ a, b, w: c.w, d: c.d, mat: "frame", profile: c.profile, open, up });
  };
  const surface = (s: Surface) => {
    surfaces.push(s);
    for (const [u, v] of [...s.top, ...s.bottom]) grow(add(add(s.origin, scale(s.uAxis, u)), scale(s.vAxis, v)));
  };

  const hasSlab = d.concrete !== "unsure";
  const base = hasSlab ? SLAB_T : 0;
  const W = d.width / 2;
  const L = d.length / 2;
  const h = d.height;
  const xc = W - COL / 2;
  const zs = buildingFrameLines(d);
  const zp = partitionZ(d);
  const gable = d.roof === "gable";
  const gutters = gutterEdges(d);
  const gutterOn = (roof: "main" | "lean", side: Side) => gutters.some((g) => g.roof === roof && g.side === side);
  const leanOn = (side: Side) => d.leanTos.some((l) => l.side === side);
  const sheeted = (side: Side) => ["enclosed", "partial"].includes(wallState(d, side));

  // Column top (eave) at z, relative to the slab. The receivers' top flanges
  // rest on the columns, so this is also the top of the steel at the eave.
  const eave = (z: number) => (gable ? h : h + (z + L) * FLAT_PITCH);

  // Top of the receivers and purlins (where the roof steel sits) and the
  // underside of the roof panels, relative to the slab.
  const cosG = 1 / Math.hypot(1, GABLE_PITCH);
  const sinG = GABLE_PITCH * cosG;
  const steelTop = (x: number, z: number) => (gable ? h + (W - Math.abs(x)) * GABLE_PITCH : eave(z));
  const roofUnderAt = (x: number, z: number) => steelTop(x, z) + (gable ? GAP / cosG : GAP);

  // ── columns, headers, roof framing ──
  // A side-wall door or window may span a frame line. The column is then
  // framed out around it, as the crew would: it stops at the opening's header
  // (and starts again under a window's sill), and the opening's own jambs
  // carry it (see the wall loop below).
  for (const z of zs) {
    for (const sx of [-1, 1]) {
      const side: Side = sx < 0 ? "left" : "right";
      const u = sx < 0 ? z + L : L - z;
      const spans = d.openings
        .filter((o) => o.wall === side && wallState(d, side) === "enclosed")
        .map((o) => ({ o, s: openingSpec(o.spec) }))
        .filter(({ o, s }) => u > o.x - COL && u < o.x + s.w + COL);
      const top = eave(z) - STEEL_T; // up inside the receiver, under its top flange
      if (!spans.length) {
        member({ a: [sx * xc, base, z], b: [sx * xc, base + top, z], w: COL, d: COL, mat: "frame" });
        continue;
      }
      const head = Math.max(...spans.map(({ s }) => s.sill + s.h + OPENING_HEAD));
      const sill = Math.min(...spans.map(({ s }) => s.sill - OPENING_HEAD));
      if (head < top) member({ a: [sx * xc, base + head, z], b: [sx * xc, base + top, z], w: COL, d: COL, mat: "frame" });
      if (sill > 0.3) member({ a: [sx * xc, base, z], b: [sx * xc, base + sill, z], w: COL, d: COL, mat: "frame" });
    }
  }
  // Receivers along both sides, top flange resting on the posts, backs flush
  // with the posts' outer faces, open toward the middle.
  for (const sx of [-1, 1]) {
    const x = sx * (W - REC_B / 2);
    channel("rec", [x, base + eave(-L) - REC_D / 2, -L], [x, base + eave(L) - REC_D / 2, L], [-sx, 0, 0]);
  }
  // Receiver lines across the building: the front and back ends, and a
  // double receiver on every frame line in between, the storage room's included.
  const webs = [L, ...zs.slice(1, -1), -L];

  if (gable) {
    // Peaked receivers follow the roof, top edge on the roof line, from each
    // corner up to the ridge. Purlins run the length between them, a couple
    // of inches off the ridge at the top: no ridge beam.
    for (const { at, dir } of receiverLines(webs)) {
      const zc = at + dir * (REC_B / 2);
      for (const sx of [-1, 1]) {
        const n: Vec3 = [sx * sinG, cosG, 0];
        const drop = scale(n, -REC_D / 2);
        channel("rec", add([sx * W, base + steelTop(W, 0), zc], drop), add([0, base + steelTop(0, 0), zc], drop), [0, 0, dir], n);
      }
    }
    const run = W / cosG; // eave edge to ridge, along the roof
    for (const sx of [-1, 1]) {
      const n: Vec3 = [sx * sinG, cosG, 0];
      const upSlope: Vec3 = [-sx * cosG, sinG, 0];
      for (const s of stations(REC_B / 2, run - PURLIN_TOP_GAP - PUR_B / 2).concat(run - PURLIN_TOP_GAP - PUR_B / 2)) {
        const x = sx * (W - s * cosG);
        const c = add([x, base + steelTop(x, 0), 0], scale(n, -PUR_D / 2));
        for (const [z0, z1] of bays(webs)) channel("pur", [c[0], c[1], z0], [c[0], c[1], z1], upSlope, n);
      }
    }
  } else {
    // Flat: front and back receivers run level across the width; purlins
    // span from side receiver to side receiver, following the slope. A
    // storage room's inner wall gets a level double receiver too, and the
    // purlins are spread over each side of it.
    const lines = zp === null ? [L, -L] : [L, zp, -L];
    for (const { at, dir } of receiverLines(lines)) {
      const zc = at + dir * (REC_B / 2);
      const y = base + eave(at) - REC_D / 2;
      channel("rec", [-W, y, zc], [W, y, zc], [0, 0, dir]);
    }
    for (let i = 0; i < lines.length - 1; i++) {
      for (const z of stations(lines[i + 1] + REC_B / 2, lines[i] - REC_B / 2)) {
        const y = base + steelTop(0, z) - PUR_D / 2;
        channel("pur", [-(W - STEEL_T), y, z], [W - STEEL_T, y, z], [0, 0, 1]);
      }
    }
  }

  // ── roof panels and roof trim ──
  if (gable) {
    const yr = base + roofUnderAt(0, 0);
    const vLen = (W + OVERHANG) / cosG;
    const span = d.length + 2 * OVERHANG;
    const flat = (len: number): [number, number][] => [
      [0, len],
      [span, len],
    ];
    surface({
      key: "roof-r",
      mat: "roof",
      profile: "pbr",
      origin: [0, yr, -L - OVERHANG],
      uAxis: [0, 0, 1],
      vAxis: [cosG, -sinG, 0],
      uLen: span,
      bottom: flat(0),
      top: flat(vLen),
      holes: [],
    });
    surface({
      key: "roof-l",
      mat: "roof",
      profile: "pbr",
      origin: [0, yr, L + OVERHANG],
      uAxis: [0, 0, -1],
      vAxis: [-cosG, -sinG, 0],
      uLen: span,
      bottom: flat(0),
      top: flat(vLen),
      holes: [],
    });
    const xe = W + OVERHANG;
    const yEdge = base + roofUnderAt(xe, 0) + RIB + 0.02 - FASCIA_D / 2;
    const yPeak = yr + RIB + 0.02 - FASCIA_D / 2;
    for (const sx of [-1, 1]) {
      const side: Side = sx < 0 ? "left" : "right";
      member({ a: [sx * (xe + FASCIA_W / 2), yEdge, -L - OVERHANG], b: [sx * (xe + FASCIA_W / 2), yEdge, L + OVERHANG], w: FASCIA_W, d: FASCIA_D, mat: "trim" });
      if (gutterOn("main", side)) {
        // A downspout at each end, down the corner post, or clear of the
        // corner's trim and of a front or back lean-to's roof.
        const drops = ([-1, 1] as const).map((sz): Vec3 => {
          const end: Side = sz > 0 ? "front" : "back";
          const onSheet = sheeted(side) || d.storage?.end === end;
          const inset = onSheet || sheeted(end) || leanOn(end) ? DOWNSPOUT_INSET : COL / 2;
          return [sx * (W + (onSheet ? PAST_RIBS : 0) + DOWNSPOUT_D / 2), base, sz * (L - inset)];
        });
        const xf = sx * (xe + FASCIA_W);
        const yTop = yEdge + FASCIA_D / 2;
        gutterRun(member, [xf, yTop, -L - OVERHANG], [xf, yTop, L + OVERHANG], [sx, 0, 0], drops);
      }
      for (const sz of [-1, 1]) {
        const z = sz * (L + OVERHANG + FASCIA_W / 2);
        member({ a: [sx * xe, yEdge, z], b: [0, yPeak, z], w: FASCIA_W, d: FASCIA_D, mat: "trim" });
      }
      // Ridge cap: one bent flange down each slope.
      const n: Vec3 = [sx * sinG, cosG, 0];
      const s = 0.28;
      const c = add([sx * s * cosG, yr - s * sinG, 0], scale(n, RIB + 0.03));
      member({ a: [c[0], c[1], -L - OVERHANG], b: [c[0], c[1], L + OVERHANG], w: 0.6, d: 0.04, mat: "ridge", up: n });
    }
  } else {
    const sinF = FLAT_PITCH / Math.hypot(1, FLAT_PITCH);
    const cosF = 1 / Math.hypot(1, FLAT_PITCH);
    const zf = L + OVERHANG;
    const yFront = base + eave(zf) + GAP;
    const uLen = d.width + 2 * OVERHANG;
    const vLen = (d.length + 2 * OVERHANG) / cosF;
    surface({
      key: "roof",
      mat: "roof",
      profile: "pbr",
      origin: [-W - OVERHANG, yFront, zf],
      uAxis: [1, 0, 0],
      vAxis: [0, -sinF, -cosF],
      uLen,
      bottom: [
        [0, 0],
        [uLen, 0],
      ],
      top: [
        [0, vLen],
        [uLen, vLen],
      ],
      holes: [],
    });
    const fy = (z: number) => base + eave(z) + GAP + RIB + 0.02 - FASCIA_D / 2;
    const xe = W + OVERHANG;
    for (const sz of [-1, 1]) {
      const z = sz * (zf + FASCIA_W / 2);
      member({ a: [-xe, fy(sz * zf), z], b: [xe, fy(sz * zf), z], w: FASCIA_W, d: FASCIA_D, mat: "trim" });
    }
    for (const sx of [-1, 1]) {
      const x = sx * (xe + FASCIA_W / 2);
      member({ a: [x, fy(-zf), -zf], b: [x, fy(zf), zf], w: FASCIA_W, d: FASCIA_D, mat: "trim" });
    }
    if (gutterOn("main", "back")) {
      // The low edge drains to the back: a downspout at each corner.
      const onSheet = sheeted("back");
      const drops = ([-1, 1] as const).map((sx): Vec3 => {
        const side: Side = sx < 0 ? "left" : "right";
        const inset = onSheet || sheeted(side) || leanOn(side) ? DOWNSPOUT_INSET : COL / 2;
        return [sx * (W - inset), base, -(L + (onSheet ? PAST_RIBS : 0) + DOWNSPOUT_D / 2)];
      });
      const zb = -(zf + FASCIA_W);
      const yTop = fy(-zf) + FASCIA_D / 2;
      gutterRun(member, [-xe, yTop, zb], [xe, yTop, zb], [0, 0, -1], drops);
    }
  }

  // ── main walls ──
  const roofUnderOnWall = (f: WallFrame, u: number) => {
    const p = wallPoint(f, u, 0);
    return roofUnderAt(p[0], p[2]);
  };
  const breaks = (side: Side, len: number): number[] =>
    gable && (side === "front" || side === "back") ? [0, len / 2, len] : [0, len];

  /**
   * Stretches of a wall and how each is closed. `key` names its panels
   * (`wall-<key>`, `wainscot-<key>`); its wall purlins run across `girts`,
   * between post faces.
   */
  type Stretch = { key: string; u0: number; u1: number; state: WallState; girts: [number, number] };

  /**
   * Panels from `u0` to `u1` along a wall frame, meeting the roof at the
   * breakpoints `us` and standing on `bottom`, with the wainscot under them
   * and the trim along its top when there is one. Holes are in the frame's u.
   */
  const wallPanels = (key: string, f: WallFrame, u0: number, u1: number, us: number[], bottom: number, holes: Hole[], wainscot: number) => {
    const len = u1 - u0;
    const at = [u0, ...us.filter((u) => u > u0 + 1e-9 && u < u1 - 1e-9), u1];
    const top = at.map((u) => [u - u0, roofUnderOnWall(f, u)] as [number, number]);
    const local = holes.filter((hl) => hl.u1 > u0 && hl.u0 < u1).map((hl) => ({ ...hl, u0: hl.u0 - u0, u1: hl.u1 - u0 }));
    const panel = { profile: "pbr" as const, origin: wallPoint(f, u0, 0), uAxis: f.uAxis, vAxis: [0, 1, 0] as Vec3, uLen: len };
    surface({ key: `wall-${key}`, mat: "wall", ...panel, bottom: at.map((u) => [u - u0, bottom]), top, holes: local });
    if (!wainscot) return;
    surface({
      key: `wainscot-${key}`,
      mat: "wainscot",
      ...panel,
      bottom: [
        [0, 0],
        [len, 0],
      ],
      top: [
        [0, wainscot],
        [len, wainscot],
      ],
      holes: local,
    });
    // Transition trim, broken where a door passes through it.
    const gaps = local.filter((hl) => hl.v0 < wainscot && hl.v1 > wainscot).map((hl) => [hl.u0, hl.u1] as [number, number]);
    for (const [a, b] of segments(0, len, gaps)) {
      member({ a: wallPoint(f, u0 + a, wainscot, RIB + 0.03), b: wallPoint(f, u0 + b, wainscot, RIB + 0.03), w: 0.06, d: 0.12, mat: "trim" });
    }
  };

  /**
   * Wall purlins behind a wall's panels, from `from` up every 4 ft, between
   * the posts (across `span`) and as deep as they are, open side down, clear
   * of the receiver over `lowEave`. They stop at each opening's jambs.
   */
  const wallGirts = (f: WallFrame, from: number, lowEave: number, span: [number, number], holes: Hole[], out: number) => {
    for (let v = from; v < lowEave - REC_D - GIRT_CLEAR; v += GIRT_SPACING) {
      const gaps = holes
        .filter((hl) => hl.v0 - OPENING_HEAD < v && hl.v1 + OPENING_HEAD > v)
        .map((hl) => [hl.u0 - COL - 0.04, hl.u1 + COL + 0.04] as [number, number]);
      for (const [u0, u1] of segments(span[0], span[1], gaps)) {
        channel("wall", wallPoint(f, u0, v, out), wallPoint(f, u1, v, out), [0, -1, 0], scale(f.normal, -1));
      }
    }
  };

  /**
   * One stretch of a main wall: its panels and the wall purlins behind them.
   * Under wainscot the first wall purlin sits at its top edge: that is what
   * the wainscot fastens to.
   */
  const wallStretch = (side: Side, f: WallFrame, st: Stretch, holes: Hole[], lowEave: number) => {
    const wainscot = st.state === "enclosed" && d.colors.wainscot ? WAINSCOT_FT : 0;
    let bottom: number;
    if (st.state === "enclosed") bottom = wainscot;
    // Level bottom 3 ft under the lowest eave, so a partial gable end also
    // closes the whole triangle, and its girt stays behind the panel.
    else if (st.state === "partial") bottom = Math.max(0, lowEave - PARTIAL_WALL_FT);
    else bottom = h; // gable end: the triangle above the eave
    wallPanels(st.key, f, st.u0, st.u1, breaks(side, wallLength(d, side)), bottom, holes, wainscot);
    const girtFrom =
      st.state === "enclosed" ? (wainscot ? wainscot : 3.5) : st.state === "partial" ? Math.max(0.5, lowEave - PARTIAL_WALL_FT + 0.5) : lowEave + 1;
    wallGirts(f, girtFrom, lowEave, st.girts, holes, INSIDE);
  };

  for (const side of SIDES) {
    const state = wallState(d, side);
    // A side wall that isn't enclosed is still closed in, ground to eave,
    // along the storage room: that stretch, out past its inner wall's face.
    const p = state === "enclosed" ? null : partitionAt(d, side);
    if (state === "open" && p === null) continue;
    const f = wallFrame(d, side, base);
    const len = wallLength(d, side);
    const eaveLine = breaks(side, len).map((u) => [u, wallTopAt(d, side, u)] as [number, number]);
    const lowEave = Math.min(...eaveLine.map(([, v]) => v));
    const on = d.openings.filter((o) => o.wall === side);
    const holes: Hole[] = on.map((o) => {
      const s = openingSpec(o.spec);
      return { u0: o.x, u1: o.x + s.w, v0: s.sill, v1: s.sill + s.h };
    });
    let stretches: Stretch[] = [{ key: side, u0: 0, u1: len, state, girts: [COL, len - COL] }];
    if (p !== null && d.storage) {
      // The left wall runs back → front and the right wall front → back, so
      // the room starts at one's left corner and ends at the other's right.
      const atStart = (side === "left") === (d.storage.end === "back");
      const edge = atStart ? p + PARTITION_FACE : p - PARTITION_FACE;
      const room: Stretch = atStart
        ? { key: `storage-${side}`, u0: 0, u1: edge, state: "enclosed", girts: [COL, p - COL / 2] }
        : { key: `storage-${side}`, u0: edge, u1: len, state: "enclosed", girts: [p + COL / 2, len - COL] };
      const rest: Stretch = atStart
        ? { key: side, u0: edge, u1: len, state, girts: [p + COL / 2, len - COL] }
        : { key: side, u0: 0, u1: edge, state, girts: [COL, p - COL / 2] };
      stretches = [room, rest].filter((x) => x.state !== "open");
      // Trim down the edge of the room's sheeting, where the open wall begins.
      const t = wallPoint(f, edge, 0, 0.06);
      cornerTrim(member, t[0], t[2], base, (x, z) => base + roofUnderAt(x, z));
    }
    for (const st of stretches) wallStretch(side, f, st, holes, lowEave);

    // The bottom of the receiver along the top of this wall, which hangs
    // from the eave line; on a gable end it follows the slope.
    const sloped = gable && (side === "front" || side === "back");
    const recUnder = (u: number) => wallTopAt(d, side, u) - (sloped ? REC_D / cosG : REC_D);
    // End-wall posts on enclosed ends, up inside the end receiver.
    if (state === "enclosed" && (side === "front" || side === "back")) {
      const n = Math.ceil(len / END_POST_SPACING);
      for (let i = 1; i < n; i++) {
        const u = (len * i) / n;
        if (holes.some((hl) => u > hl.u0 - COL - 0.5 && u < hl.u1 + COL + 0.5)) continue;
        member({ a: wallPoint(f, u, 0, INSIDE), b: wallPoint(f, u, wallTopAt(d, side, u) - STEEL_T, INSIDE), w: COL, d: COL, mat: "frame", up: f.normal });
      }
    }

    // Openings: placements for the scene; a framed opening inside the wall
    // line (frameOpening); red-iron trim jambs outside around roll-ups, as on
    // the jobsite photos.
    for (const o of on) {
      const s = openingSpec(o.spec);
      openings.push({ id: o.id, kind: s.kind, side, origin: wallPoint(f, o.x, s.sill), uAxis: f.uAxis, normal: f.normal, w: s.w, h: s.h });
      frameOpening(member, f, INSIDE, o.x, s, (u) => wallTopAt(d, side, u), recUnder);
      if (s.kind === "rollup") {
        const out = RIB + 0.06;
        for (const u of [o.x - 0.15, o.x + s.w + 0.15]) {
          member({ a: wallPoint(f, u, 0, out), b: wallPoint(f, u, s.h + 0.3, out), w: 0.3, d: 0.2, mat: "frame", up: f.normal });
        }
        member({ a: wallPoint(f, o.x - 0.3, s.h + 0.15, out), b: wallPoint(f, o.x + s.w + 0.3, s.h + 0.15, out), w: 0.2, d: 0.3, mat: "frame" });
      }
    }
  }

  // Corner trim wherever a wall meets a corner.
  const corners: [Side, Side, number, number][] = [
    ["front", "left", -1, 1],
    ["front", "right", 1, 1],
    ["back", "right", 1, -1],
    ["back", "left", -1, -1],
  ];
  for (const [s1, s2, sx, sz] of corners) {
    const states = [wallState(d, s1), wallState(d, s2)].filter((s) => s === "enclosed" || s === "partial");
    if (!states.length) continue;
    const bottomV = states.includes("enclosed") ? 0 : Math.max(0, eave(sz * L) - PARTIAL_WALL_FT);
    cornerTrim(member, sx * (W + GAP + 0.06), sz * (L + GAP + 0.06), base + bottomV, (x, z) => base + roofUnderAt(x, z));
  }

  // ── storage room ──
  // Its inner wall stands on a frame line of its own (posts each side, a
  // double receiver over it, the purlins of both bays slotted in: see above),
  // framed between like an end wall: posts no more than 10 ft apart, up
  // inside the receiver, and wall purlins. Panels on both faces run up to the
  // roof, around a walk door in the middle.
  if (zp !== null && d.storage) {
    const toRest = d.storage.end === "back" ? 1 : -1; // out of the room
    const mid: WallFrame = { origin: [-W, base, zp], uAxis: [1, 0, 0], normal: [0, 0, toRest], len: d.width };
    const topAt = (u: number) => steelTop(u - W, zp);
    const recUnder = (u: number) => topAt(u) - (gable ? REC_D / cosG : REC_D);
    const door = openingSpec("walk");
    const doorX = (d.width - door.w) / 2;
    const holes: Hole[] = [{ u0: doorX, u1: doorX + door.w, v0: door.sill, v1: door.sill + door.h }];
    const wainscot = d.colors.wainscot ? WAINSCOT_FT : 0;
    const us = gable ? [0, W, d.width] : [0, d.width];
    const faces: WallFrame[] = [toRest, -toRest].map((n) => ({
      origin: [-n * W, base, zp + n * (REC_B + GAP)],
      uAxis: [n, 0, 0],
      normal: [0, 0, n],
      len: d.width,
    }));
    faces.forEach((f, i) => wallPanels(i === 0 ? "partition-out" : "partition-in", f, 0, d.width, us, wainscot, holes, wainscot));
    const lowTop = Math.min(topAt(0), topAt(d.width));
    wallGirts(mid, wainscot || 3.5, lowTop, [COL, d.width - COL], holes, 0);
    const n = Math.ceil(d.width / END_POST_SPACING);
    for (let i = 1; i < n; i++) {
      const u = (d.width * i) / n;
      if (holes.some((hl) => u > hl.u0 - COL - 0.5 && u < hl.u1 + COL + 0.5)) continue;
      member({ a: wallPoint(mid, u, 0), b: wallPoint(mid, u, topAt(u) - STEEL_T), w: COL, d: COL, mat: "frame", up: mid.normal });
    }
    frameOpening(member, mid, 0, doorX, door, topAt, recUnder);
    // Drawn as seen from the rest of the building.
    fixedDoors.push({ key: "storage-door", origin: wallPoint(faces[0], doorX, door.sill), uAxis: faces[0].uAxis, normal: faces[0].normal, w: door.w, h: door.h, thick: 2 * (REC_B + GAP) });
  }

  // ── lean-tos ──
  for (const lean of d.leanTos) layoutLean(d, lean, { base, eave, member, channel, surface, zs, gutterOn, leanOn });

  // ── slab ──
  let slab: Layout["slab"] = null;
  if (hasSlab) {
    let x0 = -W - SLAB_MARGIN;
    let x1 = W + SLAB_MARGIN;
    let z0 = -L - SLAB_MARGIN;
    let z1 = L + SLAB_MARGIN;
    // One rectangle under it all, an open corner between two lean-tos included.
    for (const l of d.leanTos) {
      if (l.side === "left") x0 -= l.depth;
      if (l.side === "right") x1 += l.depth;
      if (l.side === "back") z0 -= l.depth;
      if (l.side === "front") z1 += l.depth;
    }
    slab = { x0, x1, z0, z1, t: SLAB_T };
    grow([x0, 0, z0]);
    grow([x1, 0, z1]);
  }
  grow([min[0], 0, min[2]]);

  return { base, slab, members, surfaces, openings, fixedDoors, bounds: { min, max } };
}

type LeanCtx = {
  base: number;
  eave: (z: number) => number;
  member: (m: Member) => void;
  channel: Channel;
  surface: (s: Surface) => void;
  /** The main building's frame lines (buildingFrameLines). */
  zs: number[];
  gutterOn: (roof: "main" | "lean", side: Side) => boolean;
  leanOn: (side: Side) => boolean;
};

/**
 * A lean-to is framed like the main building: posts along its outer edge, a
 * receiver along the top of them, receivers running out from the main
 * building on each frame line (doubles inside the run), and purlins slotted
 * between them, tops flush, the top one a couple of inches off the main wall.
 * Where a side lean-to meets a front or back one, the corner square between
 * them stays open: no roof and no posts there, each roof stopping just past
 * its own end wall, and each lean-to keeping its own end walls and framing.
 */
function layoutLean(d: Design, lean: LeanTo, { base, eave, member, channel, surface, zs, gutterOn, leanOn }: LeanCtx) {
  const W = d.width / 2;
  const L = d.length / 2;
  const depth = lean.depth;
  const cosA = 1 / Math.hypot(1, LEAN_PITCH);
  const sinA = LEAN_PITCH * cosA;
  const tuck = 0.2; // panels start this far under the main eave
  // e runs out from the main wall face; z (or x) along the wall it hangs from.
  /** Top of the lean-to's steel e out from the main wall, where the roof sheets sit; its posts stop just under it. */
  const steelTop = (z: number, e: number) => eave(z) - LEAN_ATTACH_DROP - e * LEAN_PITCH;
  const underY = (z: number, e: number) => base + steelTop(z, e) + GAP / cosA;
  const isSide = lean.side === "left" || lean.side === "right";
  // Steel running along the main wall stays outside its sheeting, ribs and
  // all. A storage room sheets a stretch of each side wall.
  const sheeted = ["enclosed", "partial"].includes(wallState(d, lean.side)) || (isSide && d.storage !== null);
  const clear = sheeted ? GAP + RIB + 0.03 : 0;
  // The top purlin, a couple of inches off the main wall at its lowest corner.
  const first = clear + PURLIN_TOP_GAP + PUR_D * sinA + (PUR_B / 2) * cosA;
  const outer = depth - REC_B / 2; // the outer receiver
  const purlinEs = [first, ...stations(first, outer)];
  const eEdge = depth + OVERHANG;
  const enclosed = lean.walls === "enclosed";
  // Downspouts run down the end posts, or clear of the corner trim on an
  // enclosed lean-to, just past its ribs.
  const dropInset = enclosed ? DOWNSPOUT_INSET : COL / 2;
  const dropOut = depth + (enclosed ? PAST_RIBS : 0) + DOWNSPOUT_D / 2;

  if (isSide) {
    const sx = lean.side === "left" ? -1 : 1;
    const X = (e: number) => sx * (W + e);
    const n: Vec3 = [sx * sinA, cosA, 0];
    const upSlope: Vec3 = [-sx * cosA, sinA, 0];
    const eo = depth - COL / 2;
    zs.forEach((z, i) => {
      // No post in front of a roll-up on the wall this lean-to covers: the
      // receiver spans it. Its end posts always stand, so each corner is held up.
      const end = i === 0 || i === zs.length - 1;
      if (end || !inDrivePath(d, lean.side, sx < 0 ? z + L : L - z))
        member({ a: [X(eo), base, z], b: [X(eo), base + steelTop(z, depth) - STEEL_T, z], w: COL, d: COL, mat: "frame" });
    });
    // Along the outer posts, top flange resting on them, open toward the building.
    channel("rec", [X(outer), base + steelTop(-L, depth) - REC_D / 2, -L], [X(outer), base + steelTop(L, depth) - REC_D / 2, L], [-sx, 0, 0]);
    // Out from the main building on each frame line.
    const webs = [L, ...zs.slice(1, -1), -L];
    for (const { at, dir } of receiverLines(webs)) {
      const zc = at + dir * (REC_B / 2);
      const drop = scale(n, -REC_D / 2);
      channel("rec", add([X(0), base + steelTop(zc, 0), zc], drop), add([X(depth), base + steelTop(zc, depth), zc], drop), [0, 0, dir], n);
    }
    for (const e of purlinEs) {
      for (const [z0, z1] of bays(webs)) {
        const at = (z: number): Vec3 => add([X(e), base + steelTop(z, e), z], scale(n, -PUR_D / 2));
        channel("pur", at(z0), at(z1), upSlope, n);
      }
    }

    // The roof runs the length of the wall and out over its ends, except into an open corner.
    const zLo = leanOn("back") ? -L - SHEET_OUT : -L - OVERHANG;
    const zHi = leanOn("front") ? L + SHEET_OUT : L + OVERHANG;
    // Roof plane: u along the main wall, v down the slope, normal up.
    const slope = d.roof === "flat" ? FLAT_PITCH : 0;
    const zA = sx < 0 ? zHi : zLo;
    const uDir = sx < 0 ? -1 : 1;
    const uAxis = norm([0, uDir * slope, uDir]);
    const vAxis = norm([sx, -LEAN_PITCH, 0]);
    const uLen = (zHi - zLo) * Math.hypot(1, slope);
    const vLen = (depth + OVERHANG + tuck) / cosA;
    surface({
      key: `lean-${lean.side}-roof`,
      mat: "roof",
      profile: "pbr",
      origin: [X(-tuck), underY(zA, -tuck), zA],
      uAxis,
      vAxis,
      uLen,
      bottom: [
        [0, 0],
        [uLen, 0],
      ],
      top: [
        [0, vLen],
        [uLen, vLen],
      ],
      holes: [],
    });
    // Fascia along the low edge and rake boards on both ends.
    const fy = (z: number, e: number) => underY(z, e) + RIB + 0.02 - FASCIA_D / 2;
    const xEdge = X(eEdge + FASCIA_W / 2);
    member({ a: [xEdge, fy(zLo, eEdge), zLo], b: [xEdge, fy(zHi, eEdge), zHi], w: FASCIA_W, d: FASCIA_D, mat: "trim" });
    for (const [z, sz] of [
      [zLo, -1],
      [zHi, 1],
    ] as const) {
      const zt = z + sz * (FASCIA_W / 2);
      member({ a: [X(-tuck), fy(z, -tuck), zt], b: [X(eEdge), fy(z, eEdge), zt], w: FASCIA_W, d: FASCIA_D, mat: "trim" });
    }
    if (gutterOn("lean", lean.side)) {
      const xf = X(eEdge + FASCIA_W);
      const top = (z: number) => fy(z, eEdge) + FASCIA_D / 2;
      const drops = ([-1, 1] as const).map((sz): Vec3 => [X(dropOut), base, sz * (L - dropInset)]);
      gutterRun(member, [xf, top(zLo), zLo], [xf, top(zHi), zHi], [sx, 0, 0], drops);
    }

    if (enclosed) {
      const xo = X(depth + GAP);
      // Outer wall, seen from outside: u runs back → front on the left, front → back on the right.
      const outer: WallFrame =
        sx < 0
          ? { origin: [xo, base, -L], uAxis: [0, 0, 1], normal: [-1, 0, 0], len: d.length }
          : { origin: [xo, base, L], uAxis: [0, 0, -1], normal: [1, 0, 0], len: d.length };
      const zAt = (u: number) => (sx < 0 ? -L + u : L - u);
      // Wall purlins run between post faces, and stop outside the main wall's sheeting.
      const fromMain: [number, number] = [clear, depth - COL];
      const toMain: [number, number] = [COL, depth - clear];
      leanWalls(d, { surface, member, channel }, [
        { key: `lean-${lean.side}-outer`, f: outer, topAt: (u) => underY(zAt(u), depth) - base, span: [COL, d.length - COL] },
        {
          key: `lean-${lean.side}-front`,
          f: { origin: [sx < 0 ? X(depth) : X(0), base, L + GAP], uAxis: [1, 0, 0], normal: [0, 0, 1], len: depth },
          topAt: (u) => underY(L, sx < 0 ? depth - u : u) - base,
          span: sx < 0 ? toMain : fromMain,
        },
        {
          key: `lean-${lean.side}-back`,
          f: { origin: [sx < 0 ? X(0) : X(depth), base, -L - GAP], uAxis: [-1, 0, 0], normal: [0, 0, -1], len: depth },
          topAt: (u) => underY(-L, sx < 0 ? u : depth - u) - base,
          span: sx < 0 ? fromMain : toMain,
        },
      ]);
      for (const sz of [-1, 1]) {
        cornerTrim(member, X(depth + 0.06), sz * (L + 0.06), base, (x, z) => underY(z, sx * x - W));
      }
    }
    return;
  }

  // Front or back lean-to: runs across the width outside that end wall. The
  // front one is the back one turned around.
  const sz = lean.side === "front" ? 1 : -1;
  const Z = (e: number) => sz * (L + e);
  const zW = sz * L;
  const n: Vec3 = [0, cosA, sz * sinA];
  const upSlope: Vec3 = [0, sinA, -sz * cosA];
  const eo = depth - COL / 2;
  const xs = spread(-(W - COL / 2), W - COL / 2, Math.max(1, Math.ceil(d.width / MAX_BAY_FT)) + 1);
  xs.forEach((x, i) => {
    // Clear of a roll-up's drive path, measured along the end wall from its
    // left corner seen from outside; the end posts always stand.
    const end = i === 0 || i === xs.length - 1;
    if (end || !inDrivePath(d, lean.side, sz < 0 ? W - x : x + W))
      member({ a: [x, base, Z(eo)], b: [x, base + steelTop(zW, depth) - STEEL_T, Z(eo)], w: COL, d: COL, mat: "frame" });
  });
  // Along the outer posts, top flange resting on them, open toward the building.
  const yOuter = base + steelTop(zW, depth) - REC_D / 2;
  channel("rec", [-W, yOuter, Z(outer)], [W, yOuter, Z(outer)], [0, 0, -sz]);
  // Along the main end wall, outside its sheeting, open toward the lean-to:
  // the end frame has posts only at its corners, so the receivers running out
  // need something to land on.
  const yLedger = base + steelTop(zW, clear) - REC_D / 2;
  channel("rec", [-W, yLedger, Z(clear + REC_B / 2)], [W, yLedger, Z(clear + REC_B / 2)], [0, 0, sz]);
  // Out from that receiver over each post line.
  const webs = [-W, ...xs.slice(1, -1), W];
  for (const { at, dir } of receiverLines(webs)) {
    const xc = at + dir * (REC_B / 2);
    const drop = scale(n, -REC_D / 2);
    channel("rec", add([xc, base + steelTop(zW, clear), Z(clear)], drop), add([xc, base + steelTop(zW, depth), Z(depth)], drop), [dir, 0, 0], n);
  }
  for (const e of stations(clear + REC_B / 2, outer)) {
    const c = add([0, base + steelTop(zW, e), Z(e)], scale(n, -PUR_D / 2));
    for (const [x0, x1] of bays(webs)) channel("pur", [x0, c[1], c[2]], [x1, c[1], c[2]], upSlope, n);
  }
  // Across the width and out over the corners, except into an open corner.
  const xLo = leanOn("left") ? -W - SHEET_OUT : -W - OVERHANG;
  const xHi = leanOn("right") ? W + SHEET_OUT : W + OVERHANG;
  const uLen = xHi - xLo;
  const vLen = (depth + OVERHANG + tuck) / cosA;
  surface({
    key: `lean-${lean.side}-roof`,
    mat: "roof",
    profile: "pbr",
    // u runs left to right behind the building and right to left in front, so the panel faces up.
    origin: [sz < 0 ? xLo : xHi, underY(zW, -tuck), Z(-tuck)],
    uAxis: [-sz, 0, 0],
    vAxis: norm([0, -LEAN_PITCH, sz]),
    uLen,
    bottom: [
      [0, 0],
      [uLen, 0],
    ],
    top: [
      [0, vLen],
      [uLen, vLen],
    ],
    holes: [],
  });
  const fy = (e: number) => underY(zW, e) + RIB + 0.02 - FASCIA_D / 2;
  member({ a: [xLo, fy(eEdge), Z(eEdge + FASCIA_W / 2)], b: [xHi, fy(eEdge), Z(eEdge + FASCIA_W / 2)], w: FASCIA_W, d: FASCIA_D, mat: "trim" });
  for (const x of [xLo - FASCIA_W / 2, xHi + FASCIA_W / 2]) {
    member({ a: [x, fy(-tuck), Z(-tuck)], b: [x, fy(eEdge), Z(eEdge)], w: FASCIA_W, d: FASCIA_D, mat: "trim" });
  }
  if (gutterOn("lean", lean.side)) {
    const zf = Z(eEdge + FASCIA_W);
    const top = fy(eEdge) + FASCIA_D / 2;
    const drops = ([-1, 1] as const).map((sx): Vec3 => [sx * (W - dropInset), base, Z(dropOut)]);
    gutterRun(member, [xLo, top, zf], [xHi, top, zf], [0, 0, sz], drops);
  }
  if (enclosed) {
    const zo = Z(depth + GAP);
    leanWalls(d, { surface, member, channel }, [
      {
        key: `lean-${lean.side}-outer`,
        f: { origin: [-sz * W, base, zo], uAxis: [sz, 0, 0], normal: [0, 0, sz], len: d.width },
        topAt: () => underY(zW, depth) - base,
        span: [COL, d.width - COL],
      },
      // The end walls. Seen from outside, u runs away from the building on
      // one of them and toward it on the other.
      ...([-1, 1] as const).map((sx) => {
        const away = sx === -sz;
        return {
          key: `lean-${lean.side}-${sx < 0 ? "left" : "right"}`,
          f: { origin: [sx * (W + GAP), base, away ? zW : zo] as Vec3, uAxis: [0, 0, -sx] as Vec3, normal: [sx, 0, 0] as Vec3, len: depth },
          topAt: (u: number) => underY(zW, away ? u : depth - u) - base,
          span: (away ? [clear, depth - COL] : [COL + GAP, depth + GAP - clear]) as [number, number],
        };
      }),
    ]);
    for (const sx of [-1, 1]) {
      cornerTrim(member, sx * (W + 0.06), Z(depth + 0.06), base, (_x, z) => underY(zW, sz * z - L));
    }
  }
}

/**
 * Enclosed lean-to walls: straight-topped panels with an optional wainscot,
 * and wall purlins behind them across `span` (between post faces), framed
 * like the main walls: the first at the wainscot's top edge, or 3 ft 6 in.
 */
function leanWalls(
  d: Design,
  { surface, member, channel }: Pick<LeanCtx, "surface" | "member" | "channel">,
  walls: { key: string; f: WallFrame; topAt: (u: number) => number; span: [number, number] }[],
) {
  const wainscot = d.colors.wainscot ? WAINSCOT_FT : 0;
  for (const { key, f, topAt, span } of walls) {
    const lowTop = Math.min(topAt(0), topAt(f.len));
    for (let v = wainscot || 3.5; v < lowTop - GAP - REC_D - GIRT_CLEAR; v += GIRT_SPACING) {
      channel("wall", wallPoint(f, span[0], v, -COL / 2 - GAP), wallPoint(f, span[1], v, -COL / 2 - GAP), [0, -1, 0], scale(f.normal, -1));
    }
    const ends = [0, f.len];
    surface({
      key,
      mat: "wall",
      profile: "pbr",
      origin: f.origin,
      uAxis: f.uAxis,
      vAxis: [0, 1, 0],
      uLen: f.len,
      bottom: ends.map((u) => [u, wainscot]),
      top: ends.map((u) => [u, topAt(u)]),
      holes: [],
    });
    if (wainscot) {
      surface({
        key: `${key}-wainscot`,
        mat: "wainscot",
        profile: "pbr",
        origin: f.origin,
        uAxis: f.uAxis,
        vAxis: [0, 1, 0],
        uLen: f.len,
        bottom: ends.map((u) => [u, 0]),
        top: ends.map((u) => [u, wainscot]),
        holes: [],
      });
      member({ a: wallPoint(f, 0, wainscot, RIB + 0.03), b: wallPoint(f, f.len, wainscot, RIB + 0.03), w: 0.06, d: 0.12, mat: "trim" });
    }
  }
}

/** Piecewise-linear lookup over sorted breakpoints. */
export function evalPiecewise(points: [number, number][], u: number): number {
  if (u <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [u1, v1] = points[i];
    if (u <= u1) {
      const [u0, v0] = points[i - 1];
      return u1 === u0 ? v1 : v0 + ((v1 - v0) * (u - u0)) / (u1 - u0);
    }
  }
  return points[points.length - 1][1];
}

/**
 * How far from `target` the camera has to stand, looking from azimuth `theta`
 * and polar angle `phi` (three.js spherical angles: phi 0 is overhead), to
 * see every corner of the box from `min` to `max`. `tan` holds the tangents
 * of the half-angles of the view left clear of the buttons over it: across,
 * above the middle and below it.
 */
export function framingDistance(
  min: Vec3,
  max: Vec3,
  target: Vec3,
  theta: number,
  phi: number,
  tan: { across: number; up: number; down: number },
): number {
  const { back, right, up } = cameraAxes(theta, phi);
  let dist = 0;
  for (const x of [min[0], max[0]]) {
    for (const y of [min[1], max[1]]) {
      for (const z of [min[2], max[2]]) {
        const q: Vec3 = [x - target[0], y - target[1], z - target[2]];
        const v = dot(q, up);
        const need = Math.max(Math.abs(dot(q, right)) / tan.across, v > 0 ? v / tan.up : -v / tan.down);
        dist = Math.max(dist, dot(q, back) + need);
      }
    }
  }
  return dist;
}

/** A rectangle on screen, in CSS px from the 3D view's top-left corner. */
export type ScreenRect = { left: number; top: number; right: number; bottom: number };

/** The camera's axes for azimuth `theta` and polar angle `phi`: back toward the camera, then right and up on screen. */
function cameraAxes(theta: number, phi: number): { back: Vec3; right: Vec3; up: Vec3 } {
  const back: Vec3 = [Math.sin(phi) * Math.sin(theta), Math.cos(phi), Math.sin(phi) * Math.cos(theta)];
  const right: Vec3 = [Math.cos(theta), 0, -Math.sin(theta)];
  return { back, right, up: cross(back, right) };
}

/**
 * Where the box from `min` to `max` lands in a `w` × `h` px view, with the
 * camera `dist` back from `target` at azimuth `theta` and polar angle `phi`;
 * `tanV`: the tangent of half the vertical field of view.
 */
export function screenBounds(min: Vec3, max: Vec3, target: Vec3, theta: number, phi: number, dist: number, tanV: number, w: number, h: number): ScreenRect {
  const { back, right, up } = cameraAxes(theta, phi);
  const out: ScreenRect = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
  for (const x of [min[0], max[0]]) {
    for (const y of [min[1], max[1]]) {
      for (const z of [min[2], max[2]]) {
        const q: Vec3 = [x - target[0], y - target[1], z - target[2]];
        const depth = Math.max(dist - dot(q, back), 1e-6);
        const sx = ((1 + dot(q, right) / (depth * tanV * (w / h))) / 2) * w;
        const sy = ((1 - dot(q, up) / (depth * tanV)) / 2) * h;
        out.left = Math.min(out.left, sx);
        out.right = Math.max(out.right, sx);
        out.top = Math.min(out.top, sy);
        out.bottom = Math.max(out.bottom, sy);
      }
    }
  }
  return out;
}

/**
 * How far back the camera stands to frame the box as large as it fits in a
 * `w` × `h` px view, `side` px in from each side and clear of the controls
 * laid over the view (`overlays`, with `air` px kept from each). A control
 * clears a band the full width of the view, from its edge to its far side.
 * A control that stays out of the middle third, like the size badge in a
 * corner, clears its band only if the building would otherwise reach it: on
 * a wide, short view a band for it would shrink the building for nothing.
 */
export function framingClearOf(
  min: Vec3,
  max: Vec3,
  target: Vec3,
  theta: number,
  phi: number,
  tanV: number,
  w: number,
  h: number,
  overlays: readonly ScreenRect[],
  { side, air }: { side: number; air: number },
): number {
  // The share of the half-view left clear; never under a quarter, on a very small canvas.
  const share = (px: number, of: number) => Math.max(0.25, 1 - (2 * px) / Math.max(of, 1));
  const counted = new Set(overlays.filter((r) => r.right > w / 3 && r.left < (2 * w) / 3));
  for (;;) {
    let top = air;
    let bottom = air;
    for (const r of counted) {
      if (r.top + r.bottom < h) top = Math.max(top, r.bottom + air);
      else bottom = Math.max(bottom, h - r.top + air);
    }
    const dist = framingDistance(min, max, target, theta, phi, {
      across: tanV * (w / Math.max(h, 1)) * share(side, w),
      up: tanV * share(top, h),
      down: tanV * share(bottom, h),
    });
    const b = screenBounds(min, max, target, theta, phi, dist, tanV, w, h);
    const reached = overlays.filter(
      (r) => !counted.has(r) && r.left - air < b.right && r.right + air > b.left && r.top - air < b.bottom && r.bottom + air > b.top,
    );
    if (!reached.length) return dist;
    for (const r of reached) counted.add(r);
  }
}

/** The longest time step, in seconds, the camera takes in one frame after a pause. */
export const MAX_CAMERA_STEP = 1 / 20;
/** A time step longer than this, in seconds, follows a pause rather than a slow frame. */
export const CAMERA_PAUSE = 0.25;

/**
 * The time step the camera moves by. The 3D view draws only on demand, so the
 * first frame after a pause reports the whole pause as its step, and the
 * camera would make nearly all of its move in that one frame: that step is
 * capped, so every move eases in. A slow frame mid-move is not a pause: a
 * phone drawing under 20 frames a second keeps its real step, so its glide
 * ends on time rather than in slow motion.
 */
export function steadyStep(delta: number): number {
  return delta > CAMERA_PAUSE ? MAX_CAMERA_STEP : delta;
}

/**
 * The x, in px, at which to centre a label `w` px wide that points at
 * `anchor` in a view `of` px wide: on the anchor, or moved in just far enough
 * to stay `edge` px from both sides; centred when it is wider than that.
 */
export function keepLabelInside(anchor: number, w: number, of: number, edge: number): number {
  const half = w / 2 + edge;
  if (of < 2 * half) return of / 2;
  return Math.min(Math.max(anchor, half), of - half);
}

/** Whether `from` (a camera, say) is out in front of the wall an opening is on, where its face can be seen. */
export function openingFaces(o: Pick<OpeningPlacement, "origin" | "normal">, from: Vec3): boolean {
  return dot([from[0] - o.origin[0], from[1] - o.origin[1], from[2] - o.origin[2]], o.normal) > 0;
}

/** Roll-up specs, for the scene's door surfaces. */
export const ROLLUP_IDS = OPENING_SPECS.filter((s) => s.kind === "rollup").map((s) => s.id);

/** Whether `u` along a main wall falls within 1 ft of a roll-up door on it: no lean-to post goes there but its end posts. */
function inDrivePath(d: Design, wall: Side, u: number): boolean {
  return d.openings.some((o) => {
    if (o.wall !== wall) return false;
    const s = openingSpec(o.spec);
    return s.kind === "rollup" && u > o.x - 1 && u < o.x + s.w + 1;
  });
}
