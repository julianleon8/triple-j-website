/**
 * Ground marks: the Triple J lion with the side's name under it, printed
 * faint on the ground just outside each side of the building, so the visitor
 * can always tell the front from the back. Where each one goes, in feet, from
 * the layout; src/components/builder/scene/GroundMarks.tsx draws them.
 *
 * Each mark reads upright to someone standing outside its side, looking at
 * the building: the lion is nearest the building and the bottom of the
 * letters faces away from it. Seen from above, the FRONT mark is upright in
 * the front view, LEFT in the left view, and so on.
 */

import { SIDES, type Side } from "./catalog";
import type { Layout, Vec3 } from "./geometry";

/** A mark's drawing, in px: the lion over the side's name. */
export const MARK_PX = { w: 512, h: 552 } as const;
/**
 * Air between the outermost part of the building on a side (roof edge, slab,
 * lean-to) and its mark. With the drawing's own margin the lion starts about
 * 2 ft past the roof edge, 2.5 ft past the wall.
 */
export const MARK_MARGIN = 1.5;
/**
 * A mark is this share of its side's length across, kept within MARK_MIN and
 * MARK_MAX. Any larger, or further out, and the names nearest the camera
 * drop out of the opening 3D view, which frames the building alone.
 */
export const MARK_SHARE = 0.3;
export const MARK_MIN = 5;
export const MARK_MAX = 9;
/** Just over the ground (at -0.01), so the two never flicker through each other. */
export const MARK_LIFT = 0.02;

export type GroundMark = {
  side: Side;
  label: string;
  /** Middle of the mark. */
  position: Vec3;
  /**
   * Turns a 1×1 plane (drawing top along +y, face along +z) flat on the
   * ground, its top toward the building: a three.js Euler, laid flat about x
   * and then turned about the vertical.
   */
  rotation: [number, number, number, "YXZ"];
  /** Along the side. */
  width: number;
  /** Out from the side. */
  depth: number;
};

/** Each side's outward direction on the ground, [x, z]. The front wall faces +z. */
const OUT: Record<Side, [number, number]> = { front: [0, 1], back: [0, -1], left: [-1, 0], right: [1, 0] };

/**
 * The four marks around a building's bounds: the ground it covers with its
 * walls, roof overhang, slab and lean-tos. Each sits centered on its side,
 * MARK_MARGIN past the outermost of those.
 */
export function groundMarks({ min, max }: Layout["bounds"]): GroundMark[] {
  const cx = (min[0] + max[0]) / 2;
  const cz = (min[2] + max[2]) / 2;
  const spanX = max[0] - min[0];
  const spanZ = max[2] - min[2];
  return SIDES.map((side) => {
    const [nx, nz] = OUT[side];
    const along = nx === 0 ? spanX : spanZ;
    const width = Math.min(MARK_MAX, Math.max(MARK_MIN, along * MARK_SHARE));
    const depth = (width * MARK_PX.h) / MARK_PX.w;
    // Middle of the footprint to the middle of the mark.
    const out = (nx === 0 ? spanZ : spanX) / 2 + MARK_MARGIN + depth / 2;
    return {
      side,
      label: side.toUpperCase(),
      position: [cx + nx * out, MARK_LIFT, cz + nz * out],
      rotation: [-Math.PI / 2, Math.atan2(nx, nz), 0, "YXZ"],
      width,
      depth,
    };
  });
}
