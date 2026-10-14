/**
 * Builder layout: a Design turned into framing members, panel surfaces and
 * opening placements, in feet. Pure data with no three.js, so the counts and
 * bounds are unit-tested; src/components/builder/scene turns it into meshes.
 *
 * Axes: x runs left → right seen from the front, y is up, z runs back → front
 * (the front wall faces +z). The origin is the middle of the footprint at
 * grade. The main frame follows the jobsite photos: square-tube columns at
 * each frame line, eave headers, gable rafters with a ridge beam and
 * lengthwise purlins, or, on a flat roof, cross purlins over sloped headers.
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

export type MemberMat = "frame" | "trim";
/** A box from `a` to `b`: `d` deep toward `up` (default: world up), `w` wide across. */
export type Member = { a: Vec3; b: Vec3; w: number; d: number; mat: MemberMat; up?: Vec3 };

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

// Section sizes, feet.
export const COL = 1 / 3; // 4 in square tube
const BEAM_D = 0.5; // 4×6 headers and rafters
const BEAM_W = 1 / 3;
const PURLIN_D = 1 / 3;
const PURLIN_W = 1 / 6;
const OVERHANG = 0.5;
const PURLIN_SPACING = 4;
const GIRT_SPACING = 4;
const END_POST_SPACING = 10;
/** Header (and window sill) depth framing an opening. */
const OPENING_HEAD = 0.35;
const FASCIA_D = 0.42;
const FASCIA_W = 0.08;
const RIB = 0.1; // panel rib height
export const SLAB_T = 1 / 3;
const SLAB_MARGIN = 0.25;
/** Air between panels and the steel behind them, so the two never flicker through each other. */
const GAP = 0.04;
/** Column top to the underside of the roof panels. */
const ROOF_LIFT = BEAM_D + PURLIN_D + GAP;
/** Rafter centerline to the underside of the roof panels, measured square to the roof. */
const PANEL_OFF = BEAM_D / 2 + PURLIN_D + GAP;

// ── small vector helpers ──────────────────────────────────────────────────

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
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

  // Column top (eave) at z, relative to the slab.
  const eave = (z: number) => (gable ? h : h + (z + L) * FLAT_PITCH);

  // Underside of the roof panels, relative to the slab.
  const cosG = 1 / Math.hypot(1, GABLE_PITCH);
  const ridgeC = h + BEAM_D / 2 + xc * GABLE_PITCH; // rafter centerline at the ridge
  const roofUnderAt = (x: number, z: number) =>
    gable ? ridgeC + PANEL_OFF / cosG - Math.abs(x) * GABLE_PITCH : eave(z) + ROOF_LIFT;

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
      const top = eave(z);
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
  for (const sx of [-1, 1]) {
    member({
      a: [sx * xc, base + eave(-L) + BEAM_D / 2, -L],
      b: [sx * xc, base + eave(L) + BEAM_D / 2, L],
      w: BEAM_W,
      d: BEAM_D,
      mat: "frame",
    });
  }

  if (gable) {
    const top = base + ridgeC;
    for (const z of zs) {
      for (const sx of [-1, 1]) {
        member({ a: [sx * xc, base + h + BEAM_D / 2, z], b: [0, top, z], w: BEAM_W, d: BEAM_D, mat: "frame" });
      }
    }
    member({ a: [0, top, -L], b: [0, top, L], w: BEAM_W, d: BEAM_D, mat: "frame" });
    const slope = xc / cosG;
    const count = Math.max(2, Math.ceil(slope / PURLIN_SPACING) + 1);
    for (const sx of [-1, 1]) {
      const n: Vec3 = [sx * GABLE_PITCH * cosG, cosG, 0];
      for (const t of spread(0.04, 0.92, count)) {
        const x = sx * xc * (1 - t);
        const y = base + h + BEAM_D / 2 + xc * t * GABLE_PITCH;
        const off = scale(n, BEAM_D / 2 + PURLIN_D / 2);
        member({ a: add([x, y, -L], off), b: add([x, y, L], off), w: PURLIN_W, d: PURLIN_D, mat: "frame", up: n });
      }
    }
  } else {
    const count = Math.ceil(d.length / PURLIN_SPACING) + 1;
    for (const z of spread(-L + 0.1, L - 0.1, count)) {
      const y = base + eave(z) + BEAM_D + PURLIN_D / 2;
      member({ a: [-W, y, z], b: [W, y, z], w: PURLIN_W, d: PURLIN_D, mat: "frame" });
    }
  }

  // ── roof panels and roof trim ──
  if (gable) {
    const yr = base + ridgeC + PANEL_OFF / cosG;
    const vLen = (W + OVERHANG) / cosG;
    const sinG = GABLE_PITCH * cosG;
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
      member({ a: [c[0], c[1], -L - OVERHANG], b: [c[0], c[1], L + OVERHANG], w: 0.6, d: 0.04, mat: "trim", up: n });
    }
  } else {
    const sinF = FLAT_PITCH / Math.hypot(1, FLAT_PITCH);
    const cosF = 1 / Math.hypot(1, FLAT_PITCH);
    const zf = L + OVERHANG;
    const yFront = base + eave(zf) + ROOF_LIFT;
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
    const fy = (z: number) => base + eave(z) + ROOF_LIFT + RIB + 0.02 - FASCIA_D / 2;
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

    // Girts behind the panels; they stop at each opening's jambs.
    const inside = -COL / 2 - GAP;
    const girtFrom = state === "enclosed" ? 3.5 : state === "partial" ? Math.max(0.5, lowEave - PARTIAL_WALL_FT + 0.5) : lowEave + 1;
    for (let v = girtFrom; v < lowEave - 0.4; v += GIRT_SPACING) {
      const gaps = holes
        .filter((hl) => hl.v0 - OPENING_HEAD < v && hl.v1 + OPENING_HEAD > v)
        .map((hl) => [hl.u0 - COL - 0.04, hl.u1 + COL + 0.04] as [number, number]);
      for (const [u0, u1] of segments(COL, len - COL, gaps)) {
        member({ a: wallPoint(f, u0, v, -PURLIN_W / 2 - GAP), b: wallPoint(f, u1, v, -PURLIN_W / 2 - GAP), w: PURLIN_W, d: PURLIN_D, mat: "frame" });
      }
    }
    // End-wall posts on enclosed ends. On a flat roof they run up to the
    // purlins, since there is no end rafter to meet.
    if (state === "enclosed" && (side === "front" || side === "back")) {
      const n = Math.ceil(len / END_POST_SPACING);
      for (let i = 1; i < n; i++) {
        const u = (len * i) / n;
        if (holes.some((hl) => u > hl.u0 - COL - 0.5 && u < hl.u1 + COL + 0.5)) continue;
        const postTop = wallTopAt(d, side, u) + (gable ? 0 : BEAM_D);
        member({ a: wallPoint(f, u, 0, inside), b: wallPoint(f, u, postTop, inside), w: COL, d: COL, mat: "frame", up: f.normal });
      }
    }

    // Openings: placements for the scene; a framed opening (jambs, header and,
    // under a window, a sill) inside the wall line; red-iron trim jambs outside
    // around roll-ups, as on the jobsite photos.
    for (const o of on) {
      const s = openingSpec(o.spec);
      openings.push({ id: o.id, kind: s.kind, side, origin: wallPoint(f, o.x, s.sill), uAxis: f.uAxis, normal: f.normal, w: s.w, h: s.h });
      const headV = s.sill + s.h + OPENING_HEAD / 2;
      for (const u of [o.x - COL / 2 - 0.02, o.x + s.w + COL / 2 + 0.02]) {
        member({ a: wallPoint(f, u, 0, inside), b: wallPoint(f, u, s.sill + s.h + OPENING_HEAD, inside), w: COL, d: COL, mat: "frame", up: f.normal });
      }
      const across: [number, number] = [o.x - COL - 0.02, o.x + s.w + COL + 0.02];
      member({ a: wallPoint(f, across[0], headV, inside), b: wallPoint(f, across[1], headV, inside), w: COL, d: OPENING_HEAD, mat: "frame" });
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
    const x = sx * (W + GAP + 0.06);
    const z = sz * (L + GAP + 0.06);
    const topV = roofUnderAt(sx * W, sz * L);
    const bottomV = states.includes("enclosed") ? 0 : Math.max(0, eave(sz * L) - PARTIAL_WALL_FT);
    member({ a: [x, base + bottomV, z], b: [x, base + topV, z], w: 0.3, d: 0.3, mat: "trim" });
  }

  // ── lean-tos ──
  for (const lean of d.leanTos) layoutLean(d, lean, { base, eave, member, surface });

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
  surface: (s: Surface) => void;
};

function layoutLean(d: Design, lean: LeanTo, { base, eave, member, surface }: LeanCtx) {
  const W = d.width / 2;
  const L = d.length / 2;
  const depth = lean.depth;
  const cosA = 1 / Math.hypot(1, LEAN_PITCH);
  const tuck = 0.2; // panels start this far under the main eave
  // Horizontal distance e out from the main wall face; t along the attached wall.
  const innerC = (z: number) => eave(z) - LEAN_ATTACH_DROP;
  const rafterY = (z: number, e: number) => innerC(z) + BEAM_D / 2 - (e + COL / 2) * LEAN_PITCH;
  const underY = (z: number, e: number) => base + rafterY(z, e) + PANEL_OFF / cosA;

  if (lean.side === "left" || lean.side === "right") {
    const sx = lean.side === "left" ? -1 : 1;
    const X = (e: number) => sx * (W + e);
    const eo = depth - COL / 2;
    const zs = frameLines(d.length);
    for (const z of zs) {
      member({ a: [X(eo), base, z], b: [X(eo), base + rafterY(z, eo) - BEAM_D / 2, z], w: COL, d: COL, mat: "frame" });
      member({ a: [X(-COL / 2), base + rafterY(z, -COL / 2), z], b: [X(eo), base + rafterY(z, eo), z], w: BEAM_W, d: BEAM_D, mat: "frame" });
    }
    member({ a: [X(eo), base + rafterY(-L, eo), -L], b: [X(eo), base + rafterY(L, eo), L], w: BEAM_W, d: BEAM_D, mat: "frame" });
    const count = Math.max(2, Math.ceil(depth / PURLIN_SPACING) + 1);
    for (const e of spread(0.4, eo - 0.2, count)) {
      const y = (z: number) => base + rafterY(z, e) + (BEAM_D / 2 + PURLIN_D / 2) / cosA;
      member({ a: [X(e), y(-L), -L], b: [X(e), y(L), L], w: PURLIN_W, d: PURLIN_D, mat: "frame" });
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
      leanWalls(d, surface, member, [
        { key: `lean-${lean.side}-outer`, f: outer, topAt: (u) => underY(zAt(u), depth) - base },
        {
          key: `lean-${lean.side}-front`,
          f: { origin: [sx < 0 ? X(depth) : X(0), base, L + GAP], uAxis: [1, 0, 0], normal: [0, 0, 1], len: depth },
          topAt: (u) => underY(L, sx < 0 ? depth - u : u) - base,
        },
        {
          key: `lean-${lean.side}-back`,
          f: { origin: [sx < 0 ? X(0) : X(depth), base, -L - GAP], uAxis: [-1, 0, 0], normal: [0, 0, -1], len: depth },
          topAt: (u) => underY(-L, sx < 0 ? u : depth - u) - base,
        },
      ]);
      for (const sz of [-1, 1]) {
        const z = sz * (L + 0.06);
        member({ a: [X(depth + 0.06), base, z], b: [X(depth + 0.06), underY(sz * L, depth), z], w: 0.3, d: 0.3, mat: "trim" });
      }
    }
    return;
  }

  // Back lean-to: runs across the width behind the back wall.
  const Z = (e: number) => -L - e;
  const zBack = -L;
  const eo = depth - COL / 2;
  const xs = spread(-(W - COL / 2), W - COL / 2, Math.max(1, Math.ceil(d.width / MAX_BAY_FT)) + 1);
  const ry = (e: number) => rafterY(zBack, e);
  for (const x of xs) {
    member({ a: [x, base, Z(eo)], b: [x, base + ry(eo) - BEAM_D / 2, Z(eo)], w: COL, d: COL, mat: "frame" });
    member({ a: [x, base + ry(-COL / 2), Z(-COL / 2)], b: [x, base + ry(eo), Z(eo)], w: BEAM_W, d: BEAM_D, mat: "frame" });
  }
  member({ a: [-W, base + ry(eo), Z(eo)], b: [W, base + ry(eo), Z(eo)], w: BEAM_W, d: BEAM_D, mat: "frame" });
  // Ledger along the main end wall: the end frame has columns only at its
  // corners, so the inner ends of the rafters need something to sit on.
  member({ a: [-(W - COL / 2), base + ry(-COL / 2), Z(-COL / 2)], b: [W - COL / 2, base + ry(-COL / 2), Z(-COL / 2)], w: BEAM_W, d: BEAM_D, mat: "frame" });
  const count = Math.max(2, Math.ceil(depth / PURLIN_SPACING) + 1);
  for (const e of spread(0.4, eo - 0.2, count)) {
    const y = base + ry(e) + (BEAM_D / 2 + PURLIN_D / 2) / cosA;
    member({ a: [-W, y, Z(e)], b: [W, y, Z(e)], w: PURLIN_W, d: PURLIN_D, mat: "frame" });
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
    leanWalls(d, surface, member, [
      { key: "lean-back-outer", f: { origin: [W, base, zo], uAxis: [-1, 0, 0], normal: [0, 0, -1], len: d.width }, topAt: () => underY(zBack, depth) - base },
      { key: "lean-back-left", f: { origin: [-W - GAP, base, zo], uAxis: [0, 0, 1], normal: [-1, 0, 0], len: depth }, topAt: (u) => underY(zBack, depth - u) - base },
      { key: "lean-back-right", f: { origin: [W + GAP, base, -L], uAxis: [0, 0, -1], normal: [1, 0, 0], len: depth }, topAt: (u) => underY(zBack, u) - base },
    ]);
    for (const sx of [-1, 1]) {
      const z = Z(depth + 0.06);
      member({ a: [sx * (W + 0.06), base, z], b: [sx * (W + 0.06), underY(zBack, depth), z], w: 0.3, d: 0.3, mat: "trim" });
    }
  }
}

/** Enclosed lean-to walls: straight-topped panels with an optional wainscot. */
function leanWalls(
  d: Design,
  surface: (s: Surface) => void,
  member: (m: Member) => void,
  walls: { key: string; f: WallFrame; topAt: (u: number) => number }[],
) {
  const wainscot = d.colors.wainscot ? WAINSCOT_FT : 0;
  for (const { key, f, topAt } of walls) {
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

/** Roll-up specs, for the scene's door surfaces. */
export const ROLLUP_IDS = OPENING_SPECS.filter((s) => s.kind === "rollup").map((s) => s.id);
