/**
 * Ribbed panel meshes from layout Surfaces. Ribs are real geometry, not a
 * normal map: no texture downloads, and the silhouette reads right at the
 * eave and against the sky.
 */

import { BufferGeometry, Float32BufferAttribute } from "three";

import { cross, evalPiecewise, type Surface, type Vec3 } from "@/lib/builder/geometry";

type Profile = { period: number; points: [number, number][] };

/** PBR panel: 12 in pitch, a trapezoid major rib and two stiffeners per pan. */
const PBR: Profile = {
  period: 1,
  points: [
    [0, 0.1],
    [0.04, 0.1],
    [0.14, 0],
    [0.36, 0],
    [0.39, 0.015],
    [0.42, 0],
    [0.58, 0],
    [0.61, 0.015],
    [0.64, 0],
    [0.86, 0],
    [0.96, 0.1],
    [1, 0.1],
  ],
};

/** Roll-up door curtain: 3 in slats, crowned outward. */
const SLAT: Profile = {
  period: 0.25,
  points: [
    [0, 0],
    [0.04, 0.03],
    [0.21, 0.03],
    [0.25, 0],
  ],
};

function depthAt(p: Profile, u: number): number {
  const t = (((u % p.period) + p.period) % p.period) / p.period;
  const pts = p.points;
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [t0, d0] = pts[i - 1];
      const [t1, d1] = pts[i];
      return t1 === t0 ? d1 : d0 + ((d1 - d0) * (t - t0)) / (t1 - t0);
    }
  }
  return pts[pts.length - 1][1];
}

const unit = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Triangles for one surface, appended to `out` as flat xyz triples. */
function appendSurface(s: Surface, out: number[]) {
  const profile = s.profile === "pbr" ? PBR : SLAT;
  const n = unit(cross(s.uAxis, s.vAxis));
  const point = (u: number, v: number, depth: number) => [
    s.origin[0] + s.uAxis[0] * u + s.vAxis[0] * v + n[0] * depth,
    s.origin[1] + s.uAxis[1] * u + s.vAxis[1] * v + n[1] * depth,
    s.origin[2] + s.uAxis[2] * u + s.vAxis[2] * v + n[2] * depth,
  ];

  const cuts = new Set<number>([0, s.uLen]);
  const periods = Math.ceil(s.uLen / profile.period);
  for (let k = 0; k <= periods; k++) {
    for (const [t] of profile.points) {
      const u = (k + t) * profile.period;
      if (u > 0 && u < s.uLen) cuts.add(Math.round(u * 1e4) / 1e4);
    }
  }
  for (const [u] of [...s.top, ...s.bottom]) if (u > 0 && u < s.uLen) cuts.add(u);
  for (const h of s.holes) {
    for (const u of [h.u0, h.u1]) if (u > 0 && u < s.uLen) cuts.add(u);
  }
  const us = [...cuts].sort((a, b) => a - b);

  for (let i = 0; i < us.length - 1; i++) {
    const ua = us[i];
    const ub = us[i + 1];
    if (ub - ua < 1e-4) continue;
    const mid = (ua + ub) / 2;
    const holes = s.holes.filter((h) => h.u0 <= mid && mid <= h.u1).sort((p, q) => p.v0 - q.v0);
    const topA = evalPiecewise(s.top, ua);
    const topB = evalPiecewise(s.top, ub);
    // Vertical pieces of this strip, as [bottomA, bottomB, topA, topB].
    const pieces: [number, number, number, number][] = [];
    let loA = evalPiecewise(s.bottom, ua);
    let loB = evalPiecewise(s.bottom, ub);
    for (const h of holes) {
      pieces.push([loA, loB, Math.min(h.v0, topA), Math.min(h.v0, topB)]);
      loA = Math.max(loA, h.v1);
      loB = Math.max(loB, h.v1);
    }
    pieces.push([loA, loB, topA, topB]);

    const da = depthAt(profile, ua);
    const db = depthAt(profile, ub);
    for (const [ba, bb, ta, tb] of pieces) {
      if (ta - ba < 1e-3 && tb - bb < 1e-3) continue;
      const p00 = point(ua, ba, da);
      const p10 = point(ub, bb, db);
      const p11 = point(ub, Math.max(bb, tb), db);
      const p01 = point(ua, Math.max(ba, ta), da);
      out.push(...p00, ...p10, ...p11, ...p00, ...p11, ...p01);
    }
  }
}

/** One merged, flat-shaded geometry for every surface given. */
export function panelGeometry(surfaces: readonly Surface[]): BufferGeometry {
  const positions: number[] = [];
  for (const s of surfaces) appendSurface(s, positions);
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(positions, 3));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}
