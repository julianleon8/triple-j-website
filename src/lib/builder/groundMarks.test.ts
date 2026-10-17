import { Euler, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import type { Side } from "./catalog";
import { PRESETS, type Design, type LeanTo } from "./design";
import { cross, layoutBuilding, type Layout, type Vec3 } from "./geometry";
import { MARK_MARGIN, MARK_MAX, MARK_MIN, MARK_PX, MARK_SHARE, groundMarks, type GroundMark } from "./groundMarks";

const with_ = (d: Design, patch: Partial<Design>): Design => ({ ...structuredClone(d), ...patch });
const bounds = (min: Vec3, max: Vec3): Layout["bounds"] => ({ min, max });
const bySide = (marks: GroundMark[]) => Object.fromEntries(marks.map((m) => [m.side, m])) as Record<Side, GroundMark>;
const OUT: Record<Side, Vec3> = { front: [0, 0, 1], back: [0, 0, -1], left: [-1, 0, 0], right: [1, 0, 0] };

/** Where a mark's local axes land in the world, as the scene turns its plane. */
function axes(m: GroundMark) {
  const e = new Euler(...m.rotation);
  const at = (x: number, y: number, z: number) => new Vector3(x, y, z).applyEuler(e).toArray();
  return { right: at(1, 0, 0), top: at(0, 1, 0), face: at(0, 0, 1) };
}

function expectVec(got: number[], want: number[], where: string) {
  got.forEach((g, i) => expect(g, `${where} [${i}]`).toBeCloseTo(want[i], 9));
}

/** The mark's rectangle on the ground, [x0, x1, z0, z1]. */
function rect(m: GroundMark): [number, number, number, number] {
  const [x, , z] = m.position;
  const [hx, hz] = m.side === "front" || m.side === "back" ? [m.width / 2, m.depth / 2] : [m.depth / 2, m.width / 2];
  return [x - hx, x + hx, z - hz, z + hz];
}

/** Every point the layout puts steel or sheeting at, and the slab's corners, on the ground plane. */
function footprintPoints(lay: Layout): [number, number][] {
  const pts: [number, number][] = [];
  for (const m of lay.members) pts.push([m.a[0], m.a[2]], [m.b[0], m.b[2]]);
  for (const s of lay.surfaces)
    for (const [u, v] of [...s.top, ...s.bottom]) pts.push([s.origin[0] + u * s.uAxis[0] + v * s.vAxis[0], s.origin[2] + u * s.uAxis[2] + v * s.vAxis[2]]);
  if (lay.slab) pts.push([lay.slab.x0, lay.slab.z0], [lay.slab.x1, lay.slab.z1]);
  return pts;
}

const DESIGNS: [string, Design][] = [
  ["carport", PRESETS.carport],
  ["rv cover", PRESETS.rv_cover],
  ["garage", PRESETS.garage],
  ["barn, both side lean-tos", PRESETS.barn],
  ["garage, enclosed left and back lean-tos", with_(PRESETS.garage, { leanTos: [{ side: "left", depth: 12, walls: "enclosed" }, { side: "back", depth: 10, walls: "enclosed" }] })],
  ["rv cover, right lean-to, no slab", with_(PRESETS.rv_cover, { concrete: "unsure", leanTos: [{ side: "right", depth: 16, walls: "open" }] })],
];

describe("ground marks", () => {
  it("puts one mark on each side, named for it", () => {
    const marks = groundMarks(layoutBuilding(PRESETS.carport).bounds);
    expect(marks.map((m) => [m.side, m.label])).toEqual([
      ["front", "FRONT"],
      ["back", "BACK"],
      ["left", "LEFT"],
      ["right", "RIGHT"],
    ]);
  });

  it("sits just past everything on its side, centered on it, and clear of the other marks", () => {
    for (const [name, d] of DESIGNS) {
      const lay = layoutBuilding(d);
      const { min, max } = lay.bounds;
      const pts = footprintPoints(lay);
      const marks = groundMarks(lay.bounds);
      for (const m of marks) {
        const where = `${name}: ${m.side}`;
        const [x0, x1, z0, z1] = rect(m);
        // The near edge, measured outward from the outermost point of the building on this side.
        const near = { front: z0, back: -z1, left: -x1, right: x0 }[m.side];
        const outermost = Math.max(...pts.map(([x, z]) => x * OUT[m.side][0] + z * OUT[m.side][2]));
        expect(near - outermost, where).toBeGreaterThanOrEqual(MARK_MARGIN - 1e-9);
        expect(near - outermost, where).toBeLessThan(MARK_MARGIN + 0.5);
        // Centered along the side.
        if (m.side === "front" || m.side === "back") expect(m.position[0], where).toBeCloseTo((min[0] + max[0]) / 2, 9);
        else expect(m.position[2], where).toBeCloseTo((min[2] + max[2]) / 2, 9);
        // Just over the ground, which sits at -0.01.
        expect(m.position[1], where).toBeGreaterThan(-0.01);
        expect(m.position[1], where).toBeLessThan(0.1);
        for (const o of marks) {
          if (o === m) continue;
          const [a0, a1, b0, b1] = rect(o);
          expect(x1 <= a0 || a1 <= x0 || z1 <= b0 || b1 <= z0, `${where} overlaps ${o.side}`).toBe(true);
        }
      }
    }
  });

  it("lies flat, face up, its top toward the building, reading left to right for someone outside looking in", () => {
    const marks = groundMarks(bounds([-11, 0, -16], [13, 14, 16]));
    for (const m of marks) {
      const n = OUT[m.side];
      const { right, top, face } = axes(m);
      expectVec(face, [0, 1, 0], `${m.side} face`);
      // The tops of the letters point at the building; their bottoms away from it.
      expectVec(top, [-n[0], 0, -n[2]], `${m.side} top`);
      // Facing the building (-n), the viewer's right is (-n) × up.
      expectVec(right, cross([-n[0], 0, -n[2]], [0, 1, 0]), `${m.side} right`);
    }
    // Spelled out for the front: someone in front, facing the building, has +x on their right.
    expectVec(axes(bySide(marks).front).right, [1, 0, 0], "front right");
    expectVec(axes(bySide(marks).left).right, [0, 0, 1], "left right");
  });

  it("scales with its side and stays between the smallest and the largest size", () => {
    // 24 ft across the front and back, 32 along the sides.
    const mid = bySide(groundMarks(bounds([-12, 0, -16], [12, 10, 16])));
    expect(mid.front.width).toBeCloseTo(24 * MARK_SHARE, 9);
    expect(mid.left.width).toBe(MARK_MAX);
    for (const m of Object.values(mid)) expect(m.depth).toBeCloseTo((m.width * MARK_PX.h) / MARK_PX.w, 9);

    // Smaller than anything sold, so the floor shows.
    const small = groundMarks(bounds([-5, 0, -5], [5, 8, 5]));
    for (const m of small) expect(m.width).toBe(MARK_MIN);
    const big = groundMarks(layoutBuilding(with_(PRESETS.rv_cover, { width: 40, length: 100 })).bounds);
    for (const m of big) expect(m.width).toBe(MARK_MAX);

    // A longer side, a larger mark, until it reaches the largest size.
    const widths = [14, 18, 22, 26, 30].map((w) => bySide(groundMarks(bounds([-w / 2, 0, -10], [w / 2, 10, 10]))).front.width);
    for (let i = 1; i < widths.length; i++) expect(widths[i]).toBeGreaterThanOrEqual(widths[i - 1]);
    expect(widths[0]).toBeLessThan(widths[widths.length - 1]);
  });

  it("moves out past a lean-to on its side, and leaves the far side where it was", () => {
    const base = bySide(groundMarks(layoutBuilding(PRESETS.carport).bounds));
    const cases: [LeanTo["side"], Side, 0 | 2, -1 | 1][] = [
      ["left", "right", 0, -1],
      ["right", "left", 0, 1],
      ["back", "front", 2, -1],
    ];
    for (const [side, opposite, axis, dir] of cases) {
      const lean: LeanTo = { side, depth: 12, walls: "open" };
      const marks = bySide(groundMarks(layoutBuilding(with_(PRESETS.carport, { leanTos: [lean] })).bounds));
      const moved = (marks[side].position[axis] - base[side].position[axis]) * dir;
      expect(moved, side).toBeGreaterThanOrEqual(lean.depth - 1e-9);
      expect(marks[opposite].position[axis], `${opposite} with a ${side} lean-to`).toBeCloseTo(base[opposite].position[axis], 9);
    }
  });
});
