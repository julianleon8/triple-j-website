import { describe, expect, it } from "vitest";

import { COLOR_SLUGS, GABLE_PITCH, LEAN_ATTACH_DROP, LEAN_PITCH, LEAN_SIDES, USES } from "./catalog";
import { PRESETS, designSchema, type Design } from "./design";
import {
  COL,
  DOWNSPOUT_D,
  DOWNSPOUT_W,
  PUR_D,
  REC_B,
  REC_D,
  STEEL_T,
  buildingFrameLines,
  cross,
  evalPiecewise,
  layoutBuilding,
  partitionZ,
  type Surface,
  type Vec3,
} from "./geometry";
import {
  canAddLean,
  canAddStorage,
  designIssues,
  dimensionLimits,
  gutterEdges,
  newStorageDepth,
  normalizeDesign,
  placeOpening,
  resizeDesign,
  slideOpening,
  wallState,
} from "./rules";
import { decodeDesign, encodeDesign } from "./share";
import { describeDesign, guttersLabel, insulationLabel, leadMessage, leanLines, summaryRows } from "./summary";

const garage = PRESETS.garage;
const carport = PRESETS.carport;
const with_ = (d: Design, patch: Partial<Design>): Design => ({ ...structuredClone(d), ...patch });

type Lay = ReturnType<typeof layoutBuilding>;
type M = Lay["members"][number];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const receivers = (lay: Lay) => lay.members.filter((m) => m.profile === "c");
const roofPurlins = (lay: Lay) => lay.members.filter((m) => m.profile === "lipped" && m.d === PUR_D);
const wallPurlins = (lay: Lay) => lay.members.filter((m) => m.profile === "lipped" && m.d !== PUR_D);
const posts = (lay: Lay) =>
  lay.members.filter((m) => m.mat === "frame" && !m.profile && m.w === COL && m.d === COL && m.a[0] === m.b[0] && m.a[2] === m.b[2]);
const gutters = (lay: Lay) => lay.members.filter((m) => m.profile === "gutter");
const downspouts = (lay: Lay) => lay.members.filter((m) => m.mat === "trim" && m.w === DOWNSPOUT_D && m.d === DOWNSPOUT_W);
/** A channel's top edge over the point p on its center line. */
const top = (m: M, p: Vec3): Vec3 => {
  const n = m.up ?? [0, 1, 0];
  return [p[0] + (n[0] * m.d) / 2, p[1] + (n[1] * m.d) / 2, p[2] + (n[2] * m.d) / 2];
};
/** The underside of a roof panel at (x, z), or null where the panel isn't over that point. */
function roofAt(s: Surface, x: number, z: number): number | null {
  const [ux, , uz] = s.uAxis;
  const [vx, , vz] = s.vAxis;
  const det = ux * vz - uz * vx;
  if (Math.abs(det) < 1e-9) return null;
  const px = x - s.origin[0];
  const pz = z - s.origin[2];
  const u = (px * vz - vx * pz) / det;
  const v = (ux * pz - uz * px) / det;
  if (u < -1e-9 || u > s.uLen + 1e-9) return null;
  if (v < evalPiecewise(s.bottom, u) - 1e-9 || v > evalPiecewise(s.top, u) + 1e-9) return null;
  return s.origin[1] + u * s.uAxis[1] + v * s.vAxis[1];
}
/** Where a surface's two ends fall along z. */
const zSpan = (s: Surface) => [s.origin[2], s.origin[2] + s.uAxis[2] * s.uLen].sort((a, b) => a - b);

describe("add-ons in the design", () => {
  const { storage: _s, gutters: _g, insulation: _i, ...old } = garage;

  it("default to none, so a link shared before they existed opens as it was sent", () => {
    expect(designSchema.parse(old)).toEqual(garage);
    expect(designSchema.parse(old)).toMatchObject({ storage: null, gutters: false, insulation: false });
    // The old link's JSON has none of the fields.
    expect(JSON.parse(atob(encodeDesign(old as Design).replace(/-/g, "+").replace(/_/g, "/")))).not.toHaveProperty("storage");
    expect(decodeDesign(encodeDesign(old as Design))).toEqual(normalizeDesign(garage));
  });

  it("go through a share link and back", () => {
    const d = with_(garage, { storage: { end: "front", depth: 12 }, gutters: true, insulation: true });
    expect(designIssues(d)).toEqual([]);
    expect(decodeDesign(encodeDesign(d))).toEqual(d);
  });

  it("refuse a storage room under 6 ft or on a side, and a fifth lean-to", () => {
    expect(designSchema.safeParse({ ...garage, storage: { end: "back", depth: 5 } }).success).toBe(false);
    expect(designSchema.safeParse({ ...garage, storage: { end: "left", depth: 10 } }).success).toBe(false);
    const five = [...LEAN_SIDES, "left"].map((side) => ({ side, depth: 8, walls: "open" }));
    expect(designSchema.safeParse({ ...garage, leanTos: five }).success).toBe(false);
  });

  it("are left off every starting point", () => {
    for (const use of USES) expect(PRESETS[use]).toMatchObject({ storage: null, gutters: false, insulation: false });
    expect(COLOR_SLUGS).toContain(garage.colors.trim);
  });
});

describe("storage room limits", () => {
  it("starts 10 ft deep, less on a building too short for that", () => {
    expect(newStorageDepth(garage)).toBe(10);
    expect(newStorageDepth(with_(carport, { length: 14 }))).toBe(8);
    expect(newStorageDepth(with_(carport, { length: 12 }))).toBe(6);
    expect(canAddStorage(garage).ok).toBe(true);
    expect(canAddStorage(with_(garage, { storage: { end: "back", depth: 10 } }))).toEqual({ ok: false, reason: "There is already a storage room." });
  });

  it("leaves at least 6 ft of the building, and shortening the building stops there and says why", () => {
    const d = with_(carport, { storage: { end: "back", depth: 10 } });
    expect(designIssues(d)).toEqual([]);
    expect(designIssues(with_(d, { length: 15 }))).toEqual([
      { code: "storage-depth", message: "A 10 ft storage room leaves less than 6 ft of the building. Make the room smaller or the building longer." },
    ]);
    expect(dimensionLimits(d, "length")).toEqual({
      min: 16,
      max: 100,
      reason: "Shorter than 16 ft, the 10 ft storage room at the back would leave less than 6 ft of the building.",
    });
    // Never shortened to fit: the length stops instead.
    expect(normalizeDesign(with_(d, { length: 12 })).storage).toEqual({ end: "back", depth: 10 });
  });

  it("counts its end wall as enclosed, so doors and windows go on it; the side walls keep their own setting", () => {
    const d = with_(carport, { storage: { end: "back", depth: 10 } });
    expect(wallState(d, "back")).toBe("enclosed");
    expect(wallState(d, "left")).toBe("open");
    const door = placeOpening(d, "r8x8", ["back"]);
    expect(door).toMatchObject({ wall: "back" });
    expect(designIssues(with_(d, { openings: [door!] }))).toEqual([]);
    expect(placeOpening(d, "walk", ["left", "right"])).toBeNull();
    // The setting under it is kept, for when the room goes.
    expect(wallState(with_(d, { storage: null }), "back")).toBe("open");
  });

  it("keeps a side-wall door a foot clear of the storage room's wall", () => {
    // 30 ft long: a 10 ft room at the back meets the left wall (which runs from the back) 10 ft along it.
    const d = with_(garage, { storage: { end: "back", depth: 10 }, openings: [{ id: "a", spec: "walk", wall: "left", x: 9.5 }] });
    expect(designIssues(d)).toMatchObject([{ code: "storage-wall", openingId: "a" }]);
    const clear = with_(d, { openings: [{ id: "a", spec: "walk", wall: "left", x: 11 }] });
    expect(designIssues(clear)).toEqual([]);
    expect(slideOpening(clear, clear.openings[0], 9.5)).toEqual({ x: 11, blocked: { message: "The walk door stays 1 ft from the storage room's wall." } });
    // A new door that would land across it goes to the nearest spot a foot clear:
    // a 15 ft room's wall is 15 ft along the right wall too, which runs from the front.
    expect(placeOpening(with_(garage, { storage: { end: "back", depth: 15 }, openings: [] }), "walk", ["right"])).toMatchObject({ wall: "right", x: 11 });
  });
});

describe("doors and the storage room", () => {
  it("keep a door inside a back room where it is as the length changes; the others keep their distance from the front", () => {
    // 30 long, a 10 ft room at the back: the left wall runs from the back, the right from the front.
    const d = with_(garage, {
      storage: { end: "back", depth: 10 },
      openings: [
        { id: "a", spec: "walk", wall: "left", x: 4 }, // in the room
        { id: "b", spec: "walk", wall: "right", x: 24 }, // in the room
        { id: "c", spec: "win3x3", wall: "right", x: 4 }, // in front of it
      ],
    });
    expect(designIssues(d)).toEqual([]);
    for (const length of [24, 33, 36, 39, 40]) {
      const r = normalizeDesign(resizeDesign(d, "length", length));
      expect(designIssues(r), `${length} ft`).toEqual([]);
      expect(r.openings.map((o) => o.x)).toEqual([4, 24 + length - 30, 4]);
    }
    // A room at the front is measured from the front already: its doors keep that distance.
    const front = with_(garage, { storage: { end: "front", depth: 10 }, openings: [{ id: "a", spec: "walk", wall: "left", x: 24 }] });
    expect(normalizeDesign(resizeDesign(front, "length", 40)).openings[0].x).toBe(34);
  });

  it("let a side-wall door be dragged or typed through the storage room's wall, into the room and back out", () => {
    // 30 long, a 10 ft room at the back: its wall is 10 ft along the left wall, which runs from the back.
    const d = with_(garage, { storage: { end: "back", depth: 10 }, openings: [{ id: "a", spec: "walk", wall: "left", x: 15 }] });
    const o = d.openings[0];
    const stays = { message: "The walk door stays 1 ft from the storage room's wall." };
    // Up to its wall, the door stops a foot clear.
    expect(slideOpening(d, o, 9)).toEqual({ x: 11, blocked: stays });
    // Taken past it, the door goes through, to the nearest spot that fits inside.
    expect(slideOpening(d, o, 7)).toEqual({ x: 6, blocked: stays });
    expect(slideOpening(d, o, 3)).toEqual({ x: 3, blocked: null });
    // And back out.
    const inside = with_(d, { openings: [{ ...o, x: 3 }] });
    expect(slideOpening(inside, inside.openings[0], 12)).toEqual({ x: 12, blocked: null });
    // With no room for it on the far side, it stops as before.
    const full = with_(garage, {
      storage: { end: "back", depth: 6 },
      openings: [o, { id: "b", spec: "walk", wall: "left", x: 1 }],
    });
    expect(slideOpening(full, o, 2)).toEqual({ x: 7, blocked: stays });
  });

  it("need room for the room's walk door under its inner wall's receiver, and lowering the eave stops there", () => {
    // A flat roof is lowest at the back: a 6 ft room there puts its inner wall at 7 ft 3 in on a 7 ft building.
    const d = with_(PRESETS.rv_cover, { height: 7, storage: { end: "back", depth: 6 } });
    expect(designIssues(d)).toEqual([
      {
        code: "storage-door",
        message: "The storage room's walk door needs 7.3 ft of height at the room's inner wall; it is 7.2 ft there. Raise the eave to fit it.",
      },
    ]);
    const ok = with_(d, { height: 8 });
    expect(designIssues(ok)).toEqual([]);
    expect(dimensionLimits(ok, "height")).toMatchObject({ min: 8, reason: "Lower than 8 ft at the back, the storage room's walk door wouldn't fit in its inner wall." });
    // Drawn, the door's top stays under the double receiver.
    const lay = layoutBuilding(ok);
    const door = lay.fixedDoors[0];
    const zp = partitionZ(ok)!;
    const recs = receivers(lay).filter((m) => m.a[2] === m.b[2] && Math.abs(m.a[2] - zp) < REC_B);
    expect(recs).toHaveLength(2);
    for (const m of recs) expect(m.a[1] - REC_D / 2).toBeGreaterThanOrEqual(door.origin[1] + door.h - 1e-9);
    // A gable's inner wall rises to the ridge, so there is room even at 7 ft.
    expect(designIssues(with_(carport, { height: 7, storage: { end: "back", depth: 6 } }))).toEqual([]);
  });
});

describe("storage room in 3D", () => {
  const room = with_(carport, { storage: { end: "back", depth: 8 } }); // 20×20 open gable
  const lay = layoutBuilding(room);
  const W = room.width / 2;
  const L = room.length / 2;
  const zp = -L + 8;

  it("stands its inner wall across the building, paneled on both faces up to the roof, a walk door in the middle", () => {
    expect(partitionZ(room)).toBe(zp);
    const [out, inside] = ["wall-partition-out", "wall-partition-in"].map((k) => lay.surfaces.find((s) => s.key === k)!);
    for (const [face, toward] of [
      [out, 1],
      [inside, -1],
    ] as const) {
      expect(face.mat).toBe("wall");
      expect(face.uLen).toBe(room.width);
      // Outside the double receiver, facing away from it.
      expect(toward * (face.origin[2] - zp)).toBeGreaterThan(REC_B);
      expect(Math.sign(cross(face.uAxis, face.vAxis)[2])).toBe(toward);
      // Up to the roof's underside: at the eave on each side, at the ridge in the middle.
      const [, eaveTop] = face.top[0];
      expect(eaveTop - room.height).toBeGreaterThan(0);
      expect(eaveTop - room.height).toBeLessThan(0.1);
      expect(evalPiecewise(face.top, W) - eaveTop).toBeCloseTo(W * GABLE_PITCH);
      expect(face.bottom.every(([, v]) => v === 0)).toBe(true);
      expect(face.holes).toEqual([{ u0: W - 1.5, u1: W + 1.5, v0: 0, v1: 80 / 12 }]);
    }
    // The door is drawn, not one of the design's doors.
    expect(lay.openings).toEqual([]);
    expect(lay.fixedDoors).toMatchObject([{ key: "storage-door", w: 3, h: 80 / 12, normal: [0, 0, 1] }]);
    expect(layoutBuilding(carport).fixedDoors).toEqual([]);
  });

  it("closes in its end wall to the roof and its stretch of each open side wall from the ground up", () => {
    const back = lay.surfaces.find((s) => s.key === "wall-back")!;
    expect(back.bottom.every(([, v]) => v === 0)).toBe(true);
    expect(back.top).toHaveLength(3); // the gable triangle too
    for (const side of ["left", "right"]) {
      const s = lay.surfaces.find((x) => x.key === `wall-storage-${side}`)!;
      expect(s.bottom.every(([, v]) => v === 0)).toBe(true);
      expect(s.top.every(([, v]) => v > room.height)).toBe(true);
      // From the back corner to just past the inner wall's face.
      const [z0, z1] = zSpan(s);
      expect(z0).toBeCloseTo(-L);
      expect(z1).toBeGreaterThan(zp + REC_B);
      expect(z1).toBeLessThan(zp + 0.5);
      // The rest of the wall stays open.
      expect(lay.surfaces.some((x) => x.key === `wall-${side}`)).toBe(false);
    }
    // A partial side wall keeps its top 3 ft past the room; along the room it goes to the ground.
    const partial = layoutBuilding(with_(room, { walls: { ...room.walls, left: "partial" } }));
    const rest = partial.surfaces.find((s) => s.key === "wall-left")!;
    expect(rest.bottom.every(([, v]) => v === room.height - 3)).toBe(true);
    expect(zSpan(rest)[0]).toBeGreaterThan(zp);
    expect(zSpan(rest)[1]).toBeCloseTo(L);
    expect(partial.surfaces.find((s) => s.key === "wall-storage-left")?.bottom[0][1]).toBe(0);
  });

  it("gives its walls wainscot when the design has it", () => {
    const keys = layoutBuilding(with_(room, { colors: { ...room.colors, wainscot: "Black" } })).surfaces.map((s) => s.key);
    expect(keys).toEqual(expect.arrayContaining(["wainscot-partition-out", "wainscot-partition-in", "wainscot-storage-left", "wainscot-storage-right", "wainscot-back"]));
  });

  it("frames the inner wall like an end wall, on a frame line of its own: posts no more than 10 ft apart, a double receiver, wall purlins", () => {
    const wide = with_(carport, { width: 40, length: 30, height: 12, storage: { end: "back", depth: 10 } });
    const wl = layoutBuilding(wide);
    const wW = wide.width / 2;
    const wzp = -wide.length / 2 + 10;
    expect(buildingFrameLines(wide).some((z) => Math.abs(z - wzp) < 1e-9)).toBe(true);
    // Posts across it, the side posts and the door's jambs among them.
    const across = posts(wl).filter((m) => Math.abs(m.a[2] - wzp) < 1e-9);
    const xs = across.map((m) => m.a[0]).sort((a, b) => a - b);
    expect(xs[0]).toBeCloseTo(-(wW - COL / 2));
    expect(xs.at(-1)).toBeCloseTo(wW - COL / 2);
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeLessThanOrEqual(10);
    // The ones between run up inside the receiver, under its top flange.
    const roofLine = (x: number) => wl.base + wide.height + (wW - Math.abs(x)) * GABLE_PITCH;
    for (const m of across.filter((p) => Math.abs(p.a[0]) > 2 && Math.abs(p.a[0]) < wW - 1)) {
      expect(Math.max(m.a[1], m.b[1])).toBeCloseTo(roofLine(m.a[0]) - STEEL_T, 6);
    }
    // A double receiver over it, one each way, on both slopes, top edge on the roof line.
    const recs = receivers(wl).filter((m) => m.a[2] === m.b[2] && Math.abs(m.a[2] - wzp) < REC_B);
    expect(recs).toHaveLength(4);
    expect(new Set(recs.map((m) => m.open![2]))).toEqual(new Set([1, -1]));
    for (const m of recs) for (const p of [m.a, m.b]) expect(top(m, p)[1]).toBeCloseTo(roofLine(top(m, p)[0]), 6);
    // The purlins of both bays slot into it.
    const ends = roofPurlins(wl)
      .flatMap((m) => [m.a[2], m.b[2]])
      .filter((z) => Math.abs(z - wzp) < 1);
    expect(new Set(ends.map((z) => z.toFixed(6)))).toEqual(new Set([(wzp + STEEL_T).toFixed(6), (wzp - STEEL_T).toFixed(6)]));
    // Wall purlins across it, under the receiver, broken for the door.
    const girts = wallPurlins(wl).filter((m) => Math.abs(m.a[2] - wzp) < 1e-9 && Math.abs(m.b[2] - wzp) < 1e-9);
    expect(girts.length).toBeGreaterThan(0);
    for (const m of girts) expect(Math.max(m.a[1], m.b[1]) + 1 / 12).toBeLessThan(wl.base + wide.height - REC_D);
    const low = girts.filter((m) => m.a[1] < wl.base + 80 / 12);
    expect(low.some((m) => Math.min(m.a[0], m.b[0]) < 0 && Math.max(m.a[0], m.b[0]) > 0)).toBe(false);
  });

  it("gets a level double receiver on a flat roof, the purlins spread each side of it", () => {
    const d = with_(PRESETS.rv_cover, { storage: { end: "front", depth: 12 } });
    const fl = layoutBuilding(d);
    const fzp = partitionZ(d)!;
    const recs = receivers(fl).filter((m) => m.a[2] === m.b[2] && Math.abs(m.a[2] - fzp) < REC_B);
    expect(recs).toHaveLength(2);
    for (const m of recs) expect(m.a[1]).toBeCloseTo(m.b[1]);
    for (const m of roofPurlins(fl)) expect(Math.abs(m.a[2] - fzp)).toBeGreaterThan(REC_B + PUR_D / 2);
  });
});

describe("gutters", () => {
  it("are left off unless chosen", () => {
    for (const use of USES) expect(gutters(layoutBuilding(PRESETS[use]))).toEqual([]);
    expect(gutterEdges(garage)).toEqual([]);
  });

  it("run along both long sides of a gable in the trim color, facing out, a downspout to the ground at each end", () => {
    const d = with_(garage, { gutters: true });
    const lay = layoutBuilding(d);
    const W = d.width / 2;
    expect(gutterEdges(d)).toEqual([
      { roof: "main", side: "left" },
      { roof: "main", side: "right" },
    ]);
    const g = gutters(lay);
    expect(g).toHaveLength(2);
    for (const m of g) {
      expect(m.mat).toBe("trim");
      expect(m.a[0]).toBe(m.b[0]); // along the eave
      expect(Math.abs(m.a[0])).toBeGreaterThan(W + 0.5); // out past the roof's edge
      expect(dot(cross(sub(m.b, m.a), [0, 1, 0]), [Math.sign(m.a[0]), 0, 0])).toBeGreaterThan(0);
      // Just under the roof's edge.
      expect(m.a[1]).toBeLessThan(lay.base + d.height + 0.2);
      expect(m.a[1]).toBeGreaterThan(lay.base + d.height - 0.5);
    }
    const ds = downspouts(lay);
    expect(ds.filter((m) => Math.min(m.a[1], m.b[1]) < lay.base + 0.2)).toHaveLength(4);
    // Down the enclosed walls, outside their ribs.
    for (const m of ds.filter((p) => p.a[0] === p.b[0] && p.a[2] === p.b[2] && Math.abs(p.a[1] - p.b[1]) > 2)) {
      expect(Math.abs(m.a[0]) - DOWNSPOUT_D / 2).toBeGreaterThan(W + 0.14);
      expect(Math.abs(m.a[0])).toBeLessThan(W + 0.5);
    }
  });

  it("go on a flat roof's low edge, at the back, only", () => {
    const d = with_(PRESETS.rv_cover, { gutters: true });
    const g = gutters(layoutBuilding(d));
    expect(gutterEdges(d)).toEqual([{ roof: "main", side: "back" }]);
    expect(g).toHaveLength(1);
    expect(g[0].a[2]).toBe(g[0].b[2]);
    expect(g[0].a[2]).toBeLessThan(-d.length / 2 - 0.5);
  });

  it("move to a lean-to's low outer edge: a main eave over a lean-to drains onto it", () => {
    const barn = with_(PRESETS.barn, { gutters: true }); // gable, 12 ft lean-tos left and right
    expect(gutterEdges(barn)).toEqual([
      { roof: "lean", side: "left" },
      { roof: "lean", side: "right" },
    ]);
    const g = gutters(layoutBuilding(barn));
    expect(g).toHaveLength(2);
    for (const m of g) expect(Math.abs(m.a[0])).toBeGreaterThan(barn.width / 2 + 12 + 0.5);

    const d = with_(carport, { gutters: true, leanTos: [{ side: "back", depth: 10, walls: "open" }] });
    expect(gutterEdges(d)).toEqual([
      { roof: "main", side: "left" },
      { roof: "main", side: "right" },
      { roof: "lean", side: "back" },
    ]);
    const lay = layoutBuilding(d);
    const back = gutters(lay).find((m) => m.a[2] === m.b[2])!;
    expect(back.a[2]).toBeLessThan(-d.length / 2 - 10 - 0.5);
    expect(back.a[1]).toBeLessThan(lay.base + d.height - LEAN_ATTACH_DROP - 10 * LEAN_PITCH + 0.2);
    // The main eaves' downspouts come down clear of the lean-to's roof.
    const leanRoof = lay.surfaces.find((s) => s.key === "lean-back-roof")!;
    const mainDrops = downspouts(lay).filter((p) => p.a[0] === p.b[0] && p.a[2] === p.b[2] && Math.abs(p.a[1] - p.b[1]) > 2 && Math.abs(p.a[2]) < d.length / 2);
    expect(mainDrops).toHaveLength(4);
    for (const m of mainDrops) {
      for (const dz of [-DOWNSPOUT_W / 2, DOWNSPOUT_W / 2]) for (const dx of [-DOWNSPOUT_D / 2, DOWNSPOUT_D / 2]) {
        expect(roofAt(leanRoof, m.a[0] + dx, m.a[2] + dz)).toBeNull();
      }
    }
    // A flat roof with a back lean-to drains onto it: that lean-to's edge takes the gutter.
    expect(gutterEdges(with_(PRESETS.rv_cover, { gutters: true, leanTos: [{ side: "back", depth: 8, walls: "open" }] }))).toEqual([
      { roof: "lean", side: "back" },
    ]);
  });

  it("follow a side lean-to's edge down a flat roof's slope", () => {
    const d = with_(PRESETS.rv_cover, { gutters: true, leanTos: [{ side: "right", depth: 8, walls: "open" }] });
    const lean = gutters(layoutBuilding(d)).find((m) => m.a[0] > d.width / 2 + 8)!;
    expect(lean.a[2]).not.toBe(lean.b[2]);
    // Higher at the front, like the main roof's eave.
    const [front, back] = lean.a[2] > lean.b[2] ? [lean.a, lean.b] : [lean.b, lean.a];
    expect(front[1]).toBeGreaterThan(back[1]);
  });
});

describe("front lean-to", () => {
  /** A member, z mirrored by `flip`, as text: its ends in either order, its section and paint. */
  const key = (m: M, flip: number) => {
    const n = (v: number) => (Math.abs(v) < 5e-5 ? 0 : v).toFixed(4);
    const ends = [m.a, m.b].map((p) => [n(p[0]), n(p[1]), n(flip * p[2])].join(",")).sort();
    return `${m.mat}|${m.profile ?? "box"}|${n(m.w)}|${n(m.d)}|${ends.join("|")}`;
  };

  it("is the back one turned around", () => {
    for (const walls of ["open", "enclosed"] as const) {
      const front = layoutBuilding(with_(carport, { gutters: true, leanTos: [{ side: "front", depth: 10, walls }] }));
      const back = layoutBuilding(with_(carport, { gutters: true, leanTos: [{ side: "back", depth: 10, walls }] }));
      expect(front.members.map((m) => key(m, 1)).sort()).toEqual(back.members.map((m) => key(m, -1)).sort());
      expect(front.slab!.z1).toBeCloseTo(-back.slab!.z0);
    }
  });

  it("is framed flush like the others: a receiver outside the front wall's sheeting, receivers and purlins on its roof line", () => {
    const d = with_(garage, { openings: [], leanTos: [{ side: "front", depth: 10, walls: "open" }] });
    const lay = layoutBuilding(d);
    const L = d.length / 2;
    const steel = (z: number) => lay.base + d.height - LEAN_ATTACH_DROP - (z - L) * LEAN_PITCH;
    const ledger = receivers(lay).find((m) => !m.up && m.a[2] === m.b[2] && m.a[2] > L && m.a[2] < L + 1);
    expect(ledger?.open).toEqual([0, 0, 1]);
    const web = ledger!.a[2] - REC_B / 2;
    expect(web).toBeGreaterThanOrEqual(L + 0.14 - 1e-9);
    expect(top(ledger!, ledger!.a)[1]).toBeCloseTo(steel(web), 6);
    const purlins = roofPurlins(lay).filter((m) => m.a[2] > L);
    expect(purlins.length).toBeGreaterThan(0);
    for (const m of purlins) {
      expect(top(m, m.a)[1]).toBeCloseTo(steel(top(m, m.a)[2]), 6);
      expect(m.a[2] - PUR_D).toBeGreaterThan(web);
    }
    const out = receivers(lay).filter((m) => m.up && m.a[2] > L);
    expect(out.length).toBeGreaterThan(0);
    for (const m of out) for (const p of [m.a, m.b]) expect(top(m, p)[1]).toBeCloseTo(steel(top(m, p)[2]), 6);
    const outer = posts(lay).filter((m) => Math.abs(m.a[2] - (L + 10 - COL / 2)) < 1e-9);
    expect(outer.length).toBeGreaterThan(1);
    for (const m of outer) expect(Math.max(m.a[1], m.b[1])).toBeCloseTo(steel(L + 10) - STEEL_T, 6);
  });

  it("keeps its posts out of a front roll-up's drive path, and front doors under its roof", () => {
    // 30 wide: posts at each corner and the middle; a 12×12 at 9 ft spans the middle.
    const d = with_(garage, { height: 14, openings: [{ id: "a", spec: "r12x12", wall: "front", x: 9 }], leanTos: [{ side: "front", depth: 10, walls: "open" }] });
    expect(designIssues(d)).toEqual([]);
    const L = d.length / 2;
    const outer = posts(layoutBuilding(d)).filter((m) => Math.abs(m.a[2] - (L + 10 - COL / 2)) < 1e-9);
    expect(outer.map((m) => Math.round(m.a[0])).sort((a, b) => a - b)).toEqual([-15, 15]);
    const issue = designIssues(with_(d, { height: 13 })).find((i) => i.openingId === "a");
    expect(issue?.message).toMatch(/lean-to on that side leaves 12 ft below its roof/);
  });

  it("always keeps each lean-to's end posts, so an open corner is held up beside roll-ups", () => {
    // Roll-ups near the front-left corner on both walls: their drive paths reach the lean-tos' end posts there.
    const d = with_(garage, {
      height: 14,
      openings: [
        { id: "a", spec: "r10x10", wall: "front", x: 1 },
        { id: "b", spec: "r10x10", wall: "left", x: 19 },
      ],
      leanTos: [
        { side: "front", depth: 10, walls: "open" },
        { side: "left", depth: 10, walls: "open" },
      ],
    });
    expect(designIssues(d)).toEqual([]);
    const ps = posts(layoutBuilding(d));
    const W = d.width / 2;
    const L = d.length / 2;
    const at = (x: number, z: number) => ps.some((m) => Math.abs(m.a[0] - x) < 1e-9 && Math.abs(m.a[2] - z) < 1e-9);
    expect(at(-(W - COL / 2), L + 10 - COL / 2)).toBe(true); // the front lean-to's left end
    expect(at(-(W + 10 - COL / 2), L - COL / 2)).toBe(true); // the left lean-to's front end
  });

  it("hangs from a flat roof's high front eave, so it can go deeper there", () => {
    const rv = PRESETS.rv_cover; // 14 ft at the back, 15 ft 8 in at the front
    expect(canAddLean(with_(rv, { height: 8 }), "back").ok).toBe(false);
    expect(canAddLean(with_(rv, { height: 8 }), "front").ok).toBe(true);
  });
});

describe("lean-tos on all four sides", () => {
  const four = with_(carport, { height: 12, gutters: true, leanTos: LEAN_SIDES.map((side) => ({ side, depth: 8, walls: "enclosed" as const })) });
  const lay = layoutBuilding(four);
  const W = four.width / 2;
  const L = four.length / 2;

  it("fit together, one per side", () => {
    expect(designIssues(four)).toEqual([]);
    for (const side of LEAN_SIDES) expect(canAddLean(four, side)).toEqual({ ok: false, reason: "There is already a lean-to on that side." });
  });

  it("leave each corner square open: no roof and no post there", () => {
    const roofs = lay.surfaces.filter((s) => s.mat === "roof");
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        // Kept back from the main walls by the inches each roof runs past its end wall.
        for (const fx of [0.05, 0.5, 0.95]) {
          for (const fz of [0.05, 0.5, 0.95]) {
            const x = sx * (W + 0.25 + fx * 7.7);
            const z = sz * (L + 0.25 + fz * 7.7);
            expect(roofs.filter((s) => roofAt(s, x, z) !== null).map((s) => s.key), `${x}, ${z}`).toEqual([]);
          }
        }
        const inside = posts(lay).filter((m) => sx * m.a[0] + COL / 2 > W + 1e-6 && sz * m.a[2] + COL / 2 > L + 1e-6);
        expect(inside).toEqual([]);
        // The gutters stop at the corner too.
        for (const m of gutters(lay)) for (const p of [m.a, m.b]) expect(sx * p[0] > W + 0.5 && sz * p[2] > L + 0.5).toBe(false);
      }
    }
  });

  it("frame each lean-to on its own, no two posts in one place, each with its own end walls", () => {
    const ps = posts(lay);
    expect(ps).toHaveLength(4 + 4 * 2);
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const apart = Math.abs(ps[i].a[0] - ps[j].a[0]) >= COL - 1e-9 || Math.abs(ps[i].a[2] - ps[j].a[2]) >= COL - 1e-9;
        expect(apart, `${ps[i].a} and ${ps[j].a}`).toBe(true);
      }
    }
    const keys = lay.surfaces.map((s) => s.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "lean-left-front",
        "lean-left-back",
        "lean-right-front",
        "lean-right-back",
        "lean-front-left",
        "lean-front-right",
        "lean-back-left",
        "lean-back-right",
      ]),
    );
    expect(gutters(lay)).toHaveLength(4);
    expect(lay.slab).toMatchObject({ x0: -W - 8 - 0.25, x1: W + 8 + 0.25, z0: -L - 8 - 0.25, z1: L + 8 + 0.25 });
  });
});

describe("summary of the add-ons", () => {
  const rows = (d: Design) => Object.fromEntries(summaryRows(d).map((r) => [r.k, r.v]));

  it("lists the storage room, gutters and insulation, and None when left off", () => {
    expect(rows(garage)).toMatchObject({ "Storage room": "None", Gutters: "None", Insulation: "None" });
    const d = with_(garage, { storage: { end: "back", depth: 10 }, gutters: true, insulation: true });
    expect(rows(d)).toMatchObject({
      "Storage room": "10 ft deep at the back, closed in, with a walk door",
      Gutters: "K-style, with downspouts, on both eaves · Burnished Slate, like the trim",
      Insulation: "Fiberglass, on the roof and the closed walls",
    });
    const msg = leadMessage(d, "https://example.com/build#d=x");
    expect(msg).toContain("Storage room: 10 ft deep at the back, closed in, with a walk door");
    expect(msg).toContain("Gutters: K-style, with downspouts");
    expect(msg).toContain("Insulation: Fiberglass");
    expect(describeDesign(d)).toMatch(/Storage room: 10 ft deep at the back.*Gutters: K-style/);
    expect(describeDesign(d)).not.toMatch(/Fiberglass/); // not drawn, so not described
  });

  it("names where the gutters go", () => {
    expect(guttersLabel(with_(PRESETS.barn, { gutters: true }))).toBe("K-style, with downspouts, on the left and right lean-tos · Black, like the trim");
    expect(guttersLabel(with_(PRESETS.rv_cover, { gutters: true }))).toMatch(/^K-style, with downspouts, on the back eave · /);
    expect(guttersLabel(with_(garage, { gutters: true, leanTos: [{ side: "left", depth: 8, walls: "open" }] }))).toMatch(/on the right eave and the left lean-to · /);
  });

  it("insulates the roof alone on an open carport, and the closed walls too once there are some", () => {
    expect(insulationLabel(with_(carport, { insulation: true }))).toBe("Fiberglass, on the roof");
    expect(insulationLabel(with_(carport, { insulation: true, storage: { end: "front", depth: 8 } }))).toBe("Fiberglass, on the roof and the closed walls");
  });

  it("lists lean-tos front, back, left, right, a front one's low edge measured from the eave it hangs from", () => {
    const d = with_(carport, {
      leanTos: [
        { side: "left", depth: 8, walls: "open" },
        { side: "front", depth: 10, walls: "open" },
      ],
    });
    expect(leanLines(d)).toEqual(["Front: 10 ft deep, open, 7.3 ft at the low edge", "Left side: 8 ft deep, open, 7.7 ft at the low edge"]);
    // On a flat roof the front is the high side.
    expect(leanLines(with_(PRESETS.rv_cover, { leanTos: [{ side: "front", depth: 10, walls: "open" }] }))).toEqual([
      "Front: 10 ft deep, open, 13 ft at the low edge",
    ]);
  });
});
