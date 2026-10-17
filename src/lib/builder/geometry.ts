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
 * purlins of both bays slot in.
 */

import {
  FLAT_PITCH,
  GABLE_PITCH,
  LEAN_ATTACH_DROP,
  LEAN_PITCH,
  MAX_BAY_FT,
  OPENING_SPECS,
  PARTIAL_WALL_FT,
  WAINSCOT_FT,
  openingSpec,
  type OpeningKind,
  type Side,
} from "./catalog";
import type { Design, LeanTo } from "./design";
import { wallLength, wallState, wallTopAt } from "./rules";

export type Vec3 = [number, number, number];

/** "ridge" is the ridge cap, painted the roof color unless the customer picks one. */
export type MemberMat = "frame" | "trim" | "ridge";
/** "box" is solid (posts, trim); "c" a plain C-channel (a receiver); "lipped" a C with its edges turned in (a purlin). */
export type MemberProfile = "box" | "c" | "lipped";
/**
 * A member from `a` to `b`: `d` deep toward `up` (default: world up), `w`
 * wide across. A channel is `d` deep and `w` across its flanges, and its
 * open side faces `open`.
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

export type Layout = {
  base: number;
  slab: { x0: number; x1: number; z0: number; z1: number; t: number } | null;
  members: Member[];
  surfaces: Surface[];
  openings: OpeningPlacement[];
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
export const REC_D = 8 / 12;
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
const RIB = 0.1; // panel rib height
export const SLAB_T = 1 / 3;
const SLAB_MARGIN = 0.25;
/** Air between panels and the steel behind them, so the two never flicker through each other. */
const GAP = 0.04;

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

// ── the layout ────────────────────────────────────────────────────────────

export function layoutBuilding(d: Design): Layout {
  const members: Member[] = [];
  const surfaces: Surface[] = [];
  const openings: OpeningPlacement[] = [];
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
  const zs = frameLines(d.length);
  const gable = d.roof === "gable";

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
  // double receiver on every frame line in between.
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
    // span from side receiver to side receiver, following the slope.
    for (const { at, dir } of receiverLines([L, -L])) {
      const zc = at + dir * (REC_B / 2);
      const y = base + eave(at) - REC_D / 2;
      channel("rec", [-W, y, zc], [W, y, zc], [0, 0, dir]);
    }
    for (const z of stations(-L + REC_B / 2, L - REC_B / 2)) {
      const y = base + steelTop(0, z) - PUR_D / 2;
      channel("pur", [-(W - STEEL_T), y, z], [W - STEEL_T, y, z], [0, 0, 1]);
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
      member({ a: [sx * (xe + FASCIA_W / 2), yEdge, -L - OVERHANG], b: [sx * (xe + FASCIA_W / 2), yEdge, L + OVERHANG], w: FASCIA_W, d: FASCIA_D, mat: "trim" });
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
  }

  // ── main walls ──
  const roofUnderOnWall = (f: WallFrame, u: number) => {
    const p = wallPoint(f, u, 0);
    return roofUnderAt(p[0], p[2]);
  };
  const breaks = (side: Side, len: number): number[] =>
    gable && (side === "front" || side === "back") ? [0, len / 2, len] : [0, len];

  for (const side of ["front", "back", "left", "right"] as const) {
    const state = wallState(d, side);
    if (state === "open") continue;
    const f = wallFrame(d, side, base);
    const len = wallLength(d, side);
    const us = breaks(side, len);
    const top = us.map((u) => [u, roofUnderOnWall(f, u)] as [number, number]);
    const eaveLine = us.map((u) => [u, wallTopAt(d, side, u)] as [number, number]);
    const on = d.openings.filter((o) => o.wall === side);
    const holes: Hole[] = on.map((o) => {
      const s = openingSpec(o.spec);
      return { u0: o.x, u1: o.x + s.w, v0: s.sill, v1: s.sill + s.h };
    });
    const wainscot = state === "enclosed" && d.colors.wainscot ? WAINSCOT_FT : 0;
    const lowEave = Math.min(...eaveLine.map(([, v]) => v));
    let bottom: [number, number][];
    if (state === "enclosed") bottom = us.map((u) => [u, wainscot]);
    // Level bottom 3 ft under the lowest eave, so a partial gable end also
    // closes the whole triangle, and its girt stays behind the panel.
    else if (state === "partial") bottom = us.map((u) => [u, Math.max(0, lowEave - PARTIAL_WALL_FT)]);
    else bottom = us.map((u) => [u, h]); // gable end: the triangle above the eave
    surface({ key: `wall-${side}`, mat: "wall", profile: "pbr", origin: f.origin, uAxis: f.uAxis, vAxis: [0, 1, 0], uLen: len, bottom, top, holes });
    if (wainscot) {
      surface({
        key: `wainscot-${side}`,
        mat: "wainscot",
        profile: "pbr",
        origin: f.origin,
        uAxis: f.uAxis,
        vAxis: [0, 1, 0],
        uLen: len,
        bottom: [
          [0, 0],
          [len, 0],
        ],
        top: [
          [0, wainscot],
          [len, wainscot],
        ],
        holes,
      });
      // Transition trim, broken where a door passes through it.
      const gaps = holes.filter((hl) => hl.v0 < wainscot && hl.v1 > wainscot).map((hl) => [hl.u0, hl.u1] as [number, number]);
      for (const [u0, u1] of segments(0, len, gaps)) {
        member({ a: wallPoint(f, u0, wainscot, RIB + 0.03), b: wallPoint(f, u1, wainscot, RIB + 0.03), w: 0.06, d: 0.12, mat: "trim" });
      }
    }

    // The bottom of the receiver along the top of this wall, which hangs
    // from the eave line; on a gable end it follows the slope.
    const sloped = gable && (side === "front" || side === "back");
    const recUnder = (u: number) => wallTopAt(d, side, u) - (sloped ? REC_D / cosG : REC_D);

    // Wall purlins behind the panels, between the posts and as deep as they
    // are, open side down, clear of the receiver; they stop at each opening's
    // jambs. Under wainscot the first sits at its top edge: that is what the
    // wainscot fastens to.
    const inside = -COL / 2 - GAP;
    const girtFrom =
      state === "enclosed" ? (wainscot ? wainscot : 3.5) : state === "partial" ? Math.max(0.5, lowEave - PARTIAL_WALL_FT + 0.5) : lowEave + 1;
    for (let v = girtFrom; v < lowEave - REC_D - GIRT_CLEAR; v += GIRT_SPACING) {
      const gaps = holes
        .filter((hl) => hl.v0 - OPENING_HEAD < v && hl.v1 + OPENING_HEAD > v)
        .map((hl) => [hl.u0 - COL - 0.04, hl.u1 + COL + 0.04] as [number, number]);
      for (const [u0, u1] of segments(COL, len - COL, gaps)) {
        channel("wall", wallPoint(f, u0, v, inside), wallPoint(f, u1, v, inside), [0, -1, 0], scale(f.normal, -1));
      }
    }
    // End-wall posts on enclosed ends, up inside the end receiver.
    if (state === "enclosed" && (side === "front" || side === "back")) {
      const n = Math.ceil(len / END_POST_SPACING);
      for (let i = 1; i < n; i++) {
        const u = (len * i) / n;
        if (holes.some((hl) => u > hl.u0 - COL - 0.5 && u < hl.u1 + COL + 0.5)) continue;
        member({ a: wallPoint(f, u, 0, inside), b: wallPoint(f, u, wallTopAt(d, side, u) - STEEL_T, inside), w: COL, d: COL, mat: "frame", up: f.normal });
      }
    }

    // Openings: placements for the scene; a framed opening (jambs, header and,
    // under a window, a sill) inside the wall line; red-iron trim jambs outside
    // around roll-ups, as on the jobsite photos. A roll-up's jambs run all the
    // way up inside the receiver, for reinforcement; a walk door's and a
    // window's stop at the header. An opening that comes up close under the
    // receiver gets a shallower header, or none: the receiver is its header.
    for (const o of on) {
      const s = openingSpec(o.spec);
      openings.push({ id: o.id, kind: s.kind, side, origin: wallPoint(f, o.x, s.sill), uAxis: f.uAxis, normal: f.normal, w: s.w, h: s.h });
      const across: [number, number] = [o.x - COL - 0.02, o.x + s.w + COL + 0.02];
      const headD = Math.min(OPENING_HEAD, Math.min(recUnder(across[0]), recUnder(across[1])) - (s.sill + s.h));
      const header = headD >= MIN_HEADER;
      for (const u of [o.x - COL / 2 - 0.02, o.x + s.w + COL / 2 + 0.02]) {
        const jambTop = s.kind === "rollup" || !header ? wallTopAt(d, side, u) - STEEL_T : s.sill + s.h + headD;
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

  // ── lean-tos ──
  for (const lean of d.leanTos) layoutLean(d, lean, { base, eave, member, channel, surface });

  // ── slab ──
  let slab: Layout["slab"] = null;
  if (hasSlab) {
    let x0 = -W - SLAB_MARGIN;
    let x1 = W + SLAB_MARGIN;
    let z0 = -L - SLAB_MARGIN;
    const z1 = L + SLAB_MARGIN;
    for (const l of d.leanTos) {
      if (l.side === "left") x0 -= l.depth;
      if (l.side === "right") x1 += l.depth;
      if (l.side === "back") z0 -= l.depth;
    }
    slab = { x0, x1, z0, z1, t: SLAB_T };
    grow([x0, 0, z0]);
    grow([x1, 0, z1]);
  }
  grow([min[0], 0, min[2]]);

  return { base, slab, members, surfaces, openings, bounds: { min, max } };
}

type LeanCtx = {
  base: number;
  eave: (z: number) => number;
  member: (m: Member) => void;
  channel: Channel;
  surface: (s: Surface) => void;
};

/**
 * A lean-to is framed like the main building: posts along its outer edge, a
 * receiver along the top of them, receivers running out from the main
 * building on each frame line (doubles inside the run), and purlins slotted
 * between them, tops flush, the top one a couple of inches off the main wall.
 */
function layoutLean(d: Design, lean: LeanTo, { base, eave, member, channel, surface }: LeanCtx) {
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
  // Steel running along the main wall stays outside its sheeting, ribs and all.
  const sheeted = ["enclosed", "partial"].includes(wallState(d, lean.side));
  const clear = sheeted ? GAP + RIB + 0.03 : 0;
  // The top purlin, a couple of inches off the main wall at its lowest corner.
  const first = clear + PURLIN_TOP_GAP + PUR_D * sinA + (PUR_B / 2) * cosA;
  const outer = depth - REC_B / 2; // the outer receiver
  const purlinEs = [first, ...stations(first, outer)];

  if (lean.side === "left" || lean.side === "right") {
    const sx = lean.side === "left" ? -1 : 1;
    const X = (e: number) => sx * (W + e);
    const n: Vec3 = [sx * sinA, cosA, 0];
    const upSlope: Vec3 = [-sx * cosA, sinA, 0];
    const eo = depth - COL / 2;
    const zs = frameLines(d.length);
    for (const z of zs) {
      // No post in front of a roll-up on the wall this lean-to covers: the receiver spans it.
      if (!inDrivePath(d, lean.side, sx < 0 ? z + L : L - z))
        member({ a: [X(eo), base, z], b: [X(eo), base + steelTop(z, depth) - STEEL_T, z], w: COL, d: COL, mat: "frame" });
    }
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

    // Roof plane: u along the main wall, v down the slope, normal up.
    const zA = sx < 0 ? L + OVERHANG : -L - OVERHANG;
    const uDir = sx < 0 ? -1 : 1;
    const uAxis = norm([0, uDir * (d.roof === "flat" ? FLAT_PITCH : 0), uDir]);
    const vAxis = norm([sx, -LEAN_PITCH, 0]);
    const uLen = (d.length + 2 * OVERHANG) * Math.hypot(1, d.roof === "flat" ? FLAT_PITCH : 0);
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
    const eEdge = depth + OVERHANG;
    const fy = (z: number, e: number) => underY(z, e) + RIB + 0.02 - FASCIA_D / 2;
    const xEdge = X(eEdge + FASCIA_W / 2);
    member({ a: [xEdge, fy(-L - OVERHANG, eEdge), -L - OVERHANG], b: [xEdge, fy(L + OVERHANG, eEdge), L + OVERHANG], w: FASCIA_W, d: FASCIA_D, mat: "trim" });
    for (const sz of [-1, 1]) {
      const z = sz * (L + OVERHANG);
      const zt = z + sz * (FASCIA_W / 2);
      member({ a: [X(-tuck), fy(z, -tuck), zt], b: [X(eEdge), fy(z, eEdge), zt], w: FASCIA_W, d: FASCIA_D, mat: "trim" });
    }

    if (lean.walls === "enclosed") {
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

  // Back lean-to: runs across the width behind the back wall.
  const Z = (e: number) => -L - e;
  const zBack = -L;
  const n: Vec3 = [0, cosA, -sinA];
  const upSlope: Vec3 = [0, sinA, cosA];
  const eo = depth - COL / 2;
  const xs = spread(-(W - COL / 2), W - COL / 2, Math.max(1, Math.ceil(d.width / MAX_BAY_FT)) + 1);
  for (const x of xs) {
    if (!inDrivePath(d, "back", W - x))
      member({ a: [x, base, Z(eo)], b: [x, base + steelTop(zBack, depth) - STEEL_T, Z(eo)], w: COL, d: COL, mat: "frame" });
  }
  // Along the outer posts, top flange resting on them, open toward the building.
  const yOuter = base + steelTop(zBack, depth) - REC_D / 2;
  channel("rec", [-W, yOuter, Z(outer)], [W, yOuter, Z(outer)], [0, 0, 1]);
  // Along the main end wall, outside its sheeting, open toward the lean-to:
  // the end frame has posts only at its corners, so the receivers running out
  // need something to land on.
  const yLedger = base + steelTop(zBack, clear) - REC_D / 2;
  channel("rec", [-W, yLedger, Z(clear + REC_B / 2)], [W, yLedger, Z(clear + REC_B / 2)], [0, 0, -1]);
  // Out from that receiver over each post line.
  const webs = [-W, ...xs.slice(1, -1), W];
  for (const { at, dir } of receiverLines(webs)) {
    const xc = at + dir * (REC_B / 2);
    const drop = scale(n, -REC_D / 2);
    channel("rec", add([xc, base + steelTop(zBack, clear), Z(clear)], drop), add([xc, base + steelTop(zBack, depth), Z(depth)], drop), [dir, 0, 0], n);
  }
  for (const e of [...stations(clear + REC_B / 2, outer)]) {
    const c = add([0, base + steelTop(zBack, e), Z(e)], scale(n, -PUR_D / 2));
    for (const [x0, x1] of bays(webs)) channel("pur", [x0, c[1], c[2]], [x1, c[1], c[2]], upSlope, n);
  }
  const uLen = d.width + 2 * OVERHANG;
  const vLen = (depth + OVERHANG + tuck) / cosA;
  surface({
    key: "lean-back-roof",
    mat: "roof",
    profile: "pbr",
    origin: [-W - OVERHANG, underY(zBack, -tuck), Z(-tuck)],
    uAxis: [1, 0, 0],
    vAxis: norm([0, -LEAN_PITCH, -1]),
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
  const eEdge = depth + OVERHANG;
  const fy = (e: number) => underY(zBack, e) + RIB + 0.02 - FASCIA_D / 2;
  member({ a: [-W - OVERHANG, fy(eEdge), Z(eEdge + FASCIA_W / 2)], b: [W + OVERHANG, fy(eEdge), Z(eEdge + FASCIA_W / 2)], w: FASCIA_W, d: FASCIA_D, mat: "trim" });
  for (const sx of [-1, 1]) {
    const x = sx * (W + OVERHANG + FASCIA_W / 2);
    member({ a: [x, fy(-tuck), Z(-tuck)], b: [x, fy(eEdge), Z(eEdge)], w: FASCIA_W, d: FASCIA_D, mat: "trim" });
  }
  if (lean.walls === "enclosed") {
    const zo = Z(depth + GAP);
    leanWalls(d, { surface, member, channel }, [
      {
        key: "lean-back-outer",
        f: { origin: [W, base, zo], uAxis: [-1, 0, 0], normal: [0, 0, -1], len: d.width },
        topAt: () => underY(zBack, depth) - base,
        span: [COL, d.width - COL],
      },
      {
        key: "lean-back-left",
        f: { origin: [-W - GAP, base, zo], uAxis: [0, 0, 1], normal: [-1, 0, 0], len: depth },
        topAt: (u) => underY(zBack, depth - u) - base,
        span: [COL + GAP, depth + GAP - clear],
      },
      {
        key: "lean-back-right",
        f: { origin: [W + GAP, base, -L], uAxis: [0, 0, -1], normal: [1, 0, 0], len: depth },
        topAt: (u) => underY(zBack, u) - base,
        span: [clear, depth - COL],
      },
    ]);
    for (const sx of [-1, 1]) {
      cornerTrim(member, sx * (W + 0.06), Z(depth + 0.06), base, (_x, z) => underY(zBack, -L - z));
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

/** Whether `u` along a main wall falls within 1 ft of a roll-up door on it: no lean-to post goes there. */
function inDrivePath(d: Design, wall: Side, u: number): boolean {
  return d.openings.some((o) => {
    if (o.wall !== wall) return false;
    const s = openingSpec(o.spec);
    return s.kind === "rollup" && u > o.x - 1 && u < o.x + s.w + 1;
  });
}
