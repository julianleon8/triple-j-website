import { ExtrudeGeometry, Shape, Vector2, type BufferGeometry } from "three";

import { PUR_LIP, STEEL_T } from "@/lib/builder/geometry";

const cache = new Map<string, BufferGeometry>();

/**
 * A channel's cross-section extruded one foot along x (−0.5 to 0.5), at its
 * real size: `d` deep along y, `w` across its flanges along z, open toward
 * +z. A plain C is a receiver; with `lips` its edges turn in, a purlin. One
 * geometry per size, shared by every member of that size (gutterGeometry too).
 */
export function channelGeometry(d: number, w: number, lips: boolean): BufferGeometry {
  const key = `${d}:${w}:${lips}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const t = STEEL_T;
  const hy = d / 2;
  const hz = w / 2;
  // The outline in (z, y), traced once around: back (web) at z = −hz,
  // flanges reaching to +hz, lips turning back toward the middle.
  const pts: [number, number][] = lips
    ? [
        [hz - t, hy - PUR_LIP],
        [hz, hy - PUR_LIP],
        [hz, hy],
        [-hz, hy],
        [-hz, -hy],
        [hz, -hy],
        [hz, -hy + PUR_LIP],
        [hz - t, -hy + PUR_LIP],
        [hz - t, -hy + t],
        [-hz + t, -hy + t],
        [-hz + t, hy - t],
        [hz - t, hy - t],
      ]
    : [
        [hz, hy],
        [-hz, hy],
        [-hz, -hy],
        [hz, -hy],
        [hz, -hy + t],
        [-hz + t, -hy + t],
        [-hz + t, hy - t],
        [hz, hy - t],
      ];
  // Shape x is −z so that, once the extrusion (+Z) is turned to run along +x
  // (a quarter turn about y), the open side faces +z.
  const shape = new Shape(pts.map(([z, y]) => new Vector2(-z, y)));
  const geo = new ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, steps: 1 });
  geo.rotateY(Math.PI / 2);
  geo.translate(-0.5, 0, 0);
  geo.computeBoundingSphere();
  cache.set(key, geo);
  return geo;
}

/** Gutter sheet, drawn a little heavier than its real 0.027 in so it reads on screen. */
const GUTTER_T = 0.06 / 12;

/**
 * A K-style gutter's cross-section extruded one foot along x, like a
 * channel: `d` tall along y, `w` across the top along z, its flat back at
 * −z and its front, the ogee face, toward +z, open at the top.
 */
export function gutterGeometry(d: number, w: number): BufferGeometry {
  const key = `gutter:${d}:${w}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const hy = d / 2;
  const hz = w / 2;
  // The sheet's middle line in (z, y), from the top of the back, down and
  // across the narrower bottom, then up the front: a cove, a flat face
  // leaning out, an ogee, and a bead turned back in at the top.
  const line: [number, number][] = [
    [-hz, hy],
    [-hz, -hy],
    [-hz + 0.62 * w, -hy],
    [-hz + 0.7 * w, -hy + 0.12 * d],
    [-hz + 0.74 * w, -hy + 0.32 * d],
    [-hz + 0.86 * w, -hy + 0.44 * d],
    [hz - 0.03 * w, -hy + 0.62 * d],
    [hz, hy - 0.12 * d],
    [hz, hy],
    [hz - 0.1 * w, hy],
  ];
  const pts = thicken(line, GUTTER_T);
  const shape = new Shape(pts.map(([z, y]) => new Vector2(-z, y)));
  const geo = new ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, steps: 1 });
  geo.rotateY(Math.PI / 2);
  geo.translate(-0.5, 0, 0);
  geo.computeBoundingSphere();
  cache.set(key, geo);
  return geo;
}

/** A closed outline `t` thick around an open polyline: out along one side, back along the other, mitred at each bend. */
function thicken(line: [number, number][], t: number): [number, number][] {
  const normal = (a: [number, number], b: [number, number]): [number, number] => {
    const dz = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dz, dy) || 1;
    return [-dy / l, dz / l];
  };
  const offsets = line.map((p, i) => {
    const n0 = i > 0 ? normal(line[i - 1], p) : null;
    const n1 = i < line.length - 1 ? normal(p, line[i + 1]) : null;
    const a = n0 ?? n1!;
    const b = n1 ?? n0!;
    const m = [a[0] + b[0], a[1] + b[1]];
    const ml = Math.hypot(m[0], m[1]) || 1;
    const miter: [number, number] = [m[0] / ml, m[1] / ml];
    const k = t / 2 / Math.max(0.3, miter[0] * a[0] + miter[1] * a[1]);
    return [miter[0] * k, miter[1] * k] as [number, number];
  });
  const left = line.map(([z, y], i) => [z + offsets[i][0], y + offsets[i][1]] as [number, number]);
  const right = line.map(([z, y], i) => [z - offsets[i][0], y - offsets[i][1]] as [number, number]);
  return [...left, ...right.reverse()];
}
