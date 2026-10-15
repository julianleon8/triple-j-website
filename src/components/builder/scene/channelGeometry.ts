import { ExtrudeGeometry, Shape, Vector2, type BufferGeometry } from "three";

import { PUR_LIP, STEEL_T } from "@/lib/builder/geometry";

const cache = new Map<string, BufferGeometry>();

/**
 * A channel's cross-section extruded one foot along x (−0.5 to 0.5), at its
 * real size: `d` deep along y, `w` across its flanges along z, open toward
 * +z. A plain C is a receiver; with `lips` its edges turn in, a purlin. One
 * geometry per size, shared by every member of that size.
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
