import { describe, expect, it } from "vitest";

import { BUILDER_COLORS, FLAT_PITCH, GABLE_PITCH, LEAN_ATTACH_DROP, LEAN_PITCH, LIMITS, USES } from "./catalog";
import { PRESETS, designSchema, type Design } from "./design";
import { COL, PUR_D, REC_B, REC_D, RIB, STEEL_T, cross, frameLines, layoutBuilding, type Vec3 } from "./geometry";
import { PBR } from "@/components/builder/scene/panelGeometry";
import { formatPrice, priceHint } from "./price";
import {
  canAddLean,
  designIssues,
  dimensionLimits,
  maxLeanDepth,
  normalizeDesign,
  openingRange,
  placeOpening,
  slideOpening,
  wallTopAt,
} from "./rules";
import { decodeDesign, designFromHash, encodeDesign, shareUrl } from "./share";
import { colorsLabel, leadMessage, summaryRows } from "./summary";

const garage = PRESETS.garage;
const carport = PRESETS.carport;
const with_ = (d: Design, patch: Partial<Design>): Design => ({ ...structuredClone(d), ...patch });

describe("presets", () => {
  it.each(USES)("%s parses and has nothing to fix", (use) => {
    const d = PRESETS[use];
    expect(designSchema.parse(d)).toEqual(d);
    expect(designIssues(d)).toEqual([]);
  });

  it("only uses colors the catalog has screen values for", () => {
    const slugs = new Set(BUILDER_COLORS.map((c) => c.slug));
    for (const d of Object.values(PRESETS)) {
      for (const c of Object.values(d.colors)) if (c) expect(slugs.has(c)).toBe(true);
    }
  });
});

describe("wall heights", () => {
  it("rises to the ridge on a gable end and stays at the eave on the sides", () => {
    expect(wallTopAt(garage, "front", 0)).toBe(10);
    expect(wallTopAt(garage, "front", 15)).toBe(10 + 15 * 0.25);
    expect(wallTopAt(garage, "left", 7)).toBe(10);
  });

  it("puts a flat roof's stated height at the back and rises toward the front", () => {
    const rv = PRESETS.rv_cover;
    expect(wallTopAt(rv, "back", 5)).toBe(14);
    expect(wallTopAt(rv, "front", 5)).toBeCloseTo(14 + 40 * (0.5 / 12));
    expect(wallTopAt(rv, "left", 0)).toBe(14); // left wall starts at the back
    expect(wallTopAt(rv, "right", 40)).toBe(14); // right wall ends at the back
  });
});

describe("doors and windows", () => {
  it("slides openings back onto a shorter wall instead of dropping them", () => {
    const deep = with_(garage, { openings: [{ id: "a", spec: "walk", wall: "right", x: 25 }] });
    const d = normalizeDesign(with_(deep, { length: 20 }));
    expect(d.openings).toEqual([{ id: "a", spec: "walk", wall: "right", x: 16 }]);
    expect(designIssues(d)).toEqual([]);
  });

  it("stops the width where the front doors stop fitting, and says why", () => {
    const lim = dimensionLimits(garage, "width");
    expect(lim.min).toBeGreaterThan(LIMITS.width.min);
    expect(lim.reason).toMatch(/roll-up door|too close|doesn't fit/);
    expect(designIssues(normalizeDesign(with_(garage, { width: lim.min })))).toEqual([]);
    expect(designIssues(normalizeDesign(with_(garage, { width: lim.min - 1 })))).not.toEqual([]);
  });

  it("stops the eave where a roll-up on a side wall needs its header room", () => {
    const d = with_(garage, { height: 14, openings: [{ id: "a", spec: "r12x12", wall: "left", x: 9 }] });
    expect(designIssues(d)).toEqual([]);
    expect(dimensionLimits(d, "height")).toMatchObject({
      min: 13,
      reason: "Lower than a 13 ft eave, the 12×12 roll-up door on the left side wall won't fit.",
    });
  });

  it("refuses an opening on a wall that isn't enclosed", () => {
    expect(placeOpening(carport, "walk", ["front", "back", "left", "right"])).toBeNull();
    const issues = designIssues(with_(carport, { openings: [{ id: "a", spec: "walk", wall: "front", x: 5 }] }));
    expect(issues[0].code).toBe("wall-not-enclosed");
  });

  it("centres a new opening and keeps clear of its neighbours", () => {
    const o = placeOpening(garage, "walk", ["back"]);
    expect(o).toMatchObject({ wall: "back", x: 13.5 });
    const crowded = placeOpening(garage, "r10x10", ["front"]);
    expect(crowded).toBeNull(); // two 10×10s already fill the gable end
  });

  it("limits sliding on a gable end to where the roof is high enough", () => {
    const d = with_(garage, { openings: [{ id: "a", spec: "r10x10", wall: "front", x: 10 }] });
    const r = openingRange(d, d.openings[0]);
    // 10 ft eave + 3:12: an 11 ft need is met 4 ft in from either corner.
    expect(r).toEqual({ min: 4, max: 16 });
  });
});

describe("lean-tos", () => {
  it("caps depth by what keeps 7 ft clear at the low edge", () => {
    expect(maxLeanDepth(with_(carport, { height: 10 }))).toBe(12);
    expect(maxLeanDepth(with_(carport, { height: 8 }))).toBeLessThan(LIMITS.leanDepth.min);
    expect(canAddLean(with_(carport, { height: 8 }), "left").ok).toBe(false);
  });

  it("never shortens a lean-to when the eave drops; the eave stops instead", () => {
    const d = with_(carport, { height: 12, leanTos: [{ side: "left", depth: 16, walls: "open" }] });
    expect(designIssues(d)).toEqual([]);
    expect(normalizeDesign(with_(d, { height: 10 })).leanTos[0].depth).toBe(16);
    expect(dimensionLimits(d, "height").min).toBe(11);
  });

  it("keeps a back lean-to off the side lean-tos' corners", () => {
    expect(canAddLean(PRESETS.barn, "back").ok).toBe(false);
  });
});

describe("share links", () => {
  it("round-trips every preset", () => {
    for (const d of Object.values(PRESETS)) expect(decodeDesign(encodeDesign(d))).toEqual(normalizeDesign(d));
  });

  it("reads the design from a URL fragment", () => {
    const url = shareUrl("https://www.triplejmetaltx.com/", garage);
    expect(url.startsWith("https://www.triplejmetaltx.com/build#d=")).toBe(true);
    expect(designFromHash(url.slice(url.indexOf("#")))).toEqual(garage);
  });

  it("rejects junk, out-of-range values and duplicate opening ids", () => {
    expect(decodeDesign("not-base64!")).toBeNull();
    expect(decodeDesign(encodeDesign({ ...garage, width: 999 } as Design))).toBeNull();
    const twins = with_(garage, {
      openings: [
        { id: "d1", spec: "walk", wall: "front", x: 2 },
        { id: "d1", spec: "walk", wall: "back", x: 2 },
      ],
    });
    expect(decodeDesign(encodeDesign(twins))).toBeNull();
  });

  it("still opens a well-formed design that breaks a rule, so the problem can be shown and fixed", () => {
    const doorOnOpenWall = with_(carport, { openings: [{ id: "a", spec: "walk", wall: "front", x: 5 }] });
    const opened = decodeDesign(encodeDesign(doorOnOpenWall));
    expect(opened?.openings).toHaveLength(1);
    expect(designIssues(opened!)[0].code).toBe("wall-not-enclosed");
  });
});

describe("price hint", () => {
  it("quotes the sheet price for a standard size, with welded at +10%", () => {
    const hint = priceHint(with_(carport, { roof: "flat" }));
    expect(hint).toMatchObject({ kind: "anchor", exact: true, bolted: 3000, welded: 3300 });
  });

  it("names the closest standard size when the design is between sizes", () => {
    const hint = priceHint(with_(carport, { roof: "flat", width: 22, length: 24 }));
    expect(hint).toMatchObject({ kind: "anchor", exact: false, anchor: { w: 20, l: 25 }, bolted: 3800 });
  });

  it("breaks a footprint tie by floor area: a 30×40 is closest to a 30×30", () => {
    expect(priceHint(PRESETS.barn)).toMatchObject({ kind: "anchor", exact: false, anchor: { w: 30, l: 30 }, bolted: 7000 });
  });

  it("uses the 14 ft RV price for a tall 20×40", () => {
    expect(priceHint(PRESETS.rv_cover)).toMatchObject({ exact: true, bolted: 8300 });
  });

  it("shows no price when nothing on the sheet is close", () => {
    expect(priceHint(with_(garage, { width: 40, length: 100 }))).toEqual({ kind: "custom" });
  });

  it("formats dollars", () => {
    expect(formatPrice(29500)).toBe("$29,500");
  });
});

describe("summary", () => {
  it("writes the lead message with every row and the 3D link", () => {
    const msg = leadMessage(garage, "https://example.com/build#d=x", "Gate on the north side");
    for (const row of summaryRows(garage)) expect(msg).toContain(`${row.k}: ${row.v}`);
    expect(msg).toContain("Open the design in 3D: https://example.com/build#d=x");
    expect(msg).toContain("Customer notes:\nGate on the north side");
    expect(msg).toContain("2 × 10×10 roll-up door, front");
  });

  it("names the panels 26-gauge PBR, walls only when there are any", () => {
    expect(summaryRows(garage).find((r) => r.k === "Panels")?.v).toBe("26-gauge PBR, roof and walls");
    const open = with_(carport, { walls: { front: "open", back: "open", left: "open", right: "open" }, leanTos: [] });
    expect(summaryRows(open).find((r) => r.k === "Panels")?.v).toBe("26-gauge PBR roof");
    for (const d of [garage, open]) expect(summaryRows(d).map((r) => r.v).join(" ")).not.toContain("29");
  });

  it("states the concrete spec the way the vault does", () => {
    const row = summaryRows(carport).find((r) => r.k === "Concrete");
    expect(row?.v).toContain("3,000 PSI standard");
    expect(row?.v).not.toContain("4,000");
  });
});

describe("panels", () => {
  it("draws 26-gauge PBR: a 1¼ in major rib every 12 in, two stiffeners per pan", () => {
    expect(RIB * 12).toBeCloseTo(1.25);
    expect(PBR.period).toBe(1);
    expect(Math.max(...PBR.points.map(([, d]) => d))).toBeCloseTo(RIB);
    const stiffeners = PBR.points.filter(([, d], i, p) => d > 0 && d < RIB && d > p[i - 1][1] && d > p[i + 1][1]);
    expect(stiffeners).toHaveLength(2);
  });
});

describe("layout", () => {
  const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  it("adds a frame line for every 25 ft of length", () => {
    expect(frameLines(20)).toHaveLength(2);
    expect(frameLines(25)).toHaveLength(2);
    expect(frameLines(40)).toHaveLength(3); // the 20×40's center post
    expect(frameLines(100)).toHaveLength(5);
  });

  it("puts two columns on every frame line", () => {
    const columns = layoutBuilding(carport).members.filter((m) => m.mat === "frame" && m.a[0] === m.b[0] && m.a[2] === m.b[2]);
    expect(columns).toHaveLength(4);
  });

  it("faces every panel outward: roofs up, walls away from the middle", () => {
    for (const use of USES) {
      const lay = layoutBuilding(PRESETS[use]);
      for (const s of lay.surfaces) {
        const n = cross(s.uAxis, s.vAxis);
        if (s.mat === "roof") expect(n[1]).toBeGreaterThan(0.9);
        else {
          const centre: Vec3 = [s.origin[0] + s.uAxis[0] * (s.uLen / 2), 0, s.origin[2] + s.uAxis[2] * (s.uLen / 2)];
          expect(dot(n, centre)).toBeGreaterThan(0);
        }
      }
    }
  });

  it("cuts a hole for every door and window, in the wall and its wainscot", () => {
    const lay = layoutBuilding(garage);
    const front = lay.surfaces.find((s) => s.key === "wall-front");
    expect(front?.holes).toHaveLength(2);
    expect(lay.surfaces.find((s) => s.key === "wainscot-front")?.holes).toHaveLength(2);
    expect(lay.openings).toHaveLength(garage.openings.length);
  });

  it("draws no wall panels on an open carport", () => {
    expect(layoutBuilding(carport).surfaces.map((s) => s.mat)).toEqual(["roof", "roof"]);
  });

  it("sizes the slab to the footprint plus lean-tos, and drops it when concrete is undecided", () => {
    const d = with_(carport, { leanTos: [{ side: "left", depth: 10, walls: "open" }] });
    const slab = layoutBuilding(d).slab!;
    expect(slab.x1 - slab.x0).toBeCloseTo(20 + 10 + 0.5);
    expect(slab.z1 - slab.z0).toBeCloseTo(20 + 0.5);
    expect(layoutBuilding(with_(d, { concrete: "unsure" })).slab).toBeNull();
  });

  it("keeps the whole building above grade and inside its bounds", () => {
    for (const use of USES) {
      const { bounds, members } = layoutBuilding(PRESETS[use]);
      expect(bounds.min[1]).toBeGreaterThanOrEqual(0);
      for (const m of members) for (const p of [m.a, m.b]) expect(p[1]).toBeGreaterThanOrEqual(-1e-9);
      expect(bounds.max[1]).toBeLessThan(PRESETS[use].height + 10);
    }
  });
});

describe("framing around openings and lean-tos", () => {
  it("frames a side-wall window out around the frame-line column instead of running the column through it", () => {
    // Garage preset: 30 long, so a column at z = 0; the left-wall window spans z -1.5..1.5.
    const lay = layoutBuilding(garage);
    const leftColumnsAtMid = lay.members.filter(
      (m) => m.mat === "frame" && m.a[0] < -14 && m.a[0] === m.b[0] && Math.abs(m.a[2]) < 0.01 && m.a[2] === m.b[2],
    );
    // Above the head and under the sill, never through the glass (sill 3.5 to top 6.5).
    for (const m of leftColumnsAtMid) {
      const [lo, hi] = [Math.min(m.a[1], m.b[1]), Math.max(m.a[1], m.b[1])];
      expect(hi <= lay.base + 3.5 || lo >= lay.base + 6.5).toBe(true);
    }
    expect(leftColumnsAtMid.length).toBe(2);
  });

  it("keeps doors below a lean-to's roof on the wall it hangs from", () => {
    const d = with_(garage, {
      openings: [{ id: "a", spec: "r10x10", wall: "back", x: 10 }],
      leanTos: [{ side: "back", depth: 10, walls: "open" }],
    });
    const issue = designIssues(d).find((i) => i.openingId === "a");
    expect(issue?.message).toMatch(/lean-to on that side leaves 9 ft/);
    expect(designIssues(with_(d, { leanTos: [] }))).toEqual([]);
  });

  it("closes the whole gable triangle on a partial end wall", () => {
    const wide = with_(carport, { width: 40, walls: { ...carport.walls, front: "partial" } });
    const front = layoutBuilding(wide).surfaces.find((s) => s.key === "wall-front")!;
    expect(new Set(front.bottom.map(([, v]) => v))).toEqual(new Set([wide.height - 3]));
  });

});

describe("lean-to posts", () => {
  it("keeps a post out of the drive path of a roll-up on the wall the lean-to covers", () => {
    // 30 ft long: frame line at z = 0. A 10×10 on the right wall at x = 10 spans z -5..5.
    const d = with_(garage, {
      height: 12,
      openings: [{ id: "a", spec: "r10x10", wall: "right", x: 10 }],
      leanTos: [{ side: "right", depth: 10, walls: "open" }],
    });
    expect(designIssues(d)).toEqual([]);
    const outerPosts = layoutBuilding(d).members.filter(
      (m) => m.mat === "frame" && m.a[0] > 24 && m.a[0] === m.b[0] && m.a[2] === m.b[2] && m.a[1] < m.b[1],
    );
    expect(outerPosts.map((m) => Math.round(m.a[2]))).not.toContain(0);
    expect(outerPosts).toHaveLength(2);
  });
});

describe("dragging a door or window", () => {
  const d1 = garage.openings.find((o) => o.id === "d1")!;
  const d3 = garage.openings.find((o) => o.id === "d3")!;

  it("lands on the nearest half foot inside its reach", () => {
    expect(slideOpening(garage, d3, 7.3)).toEqual({ x: 7.5, blocked: null });
  });

  it("stops at the next door and names it", () => {
    const r = slideOpening(garage, d1, 9);
    expect(r.x).toBe(5);
    expect(r.blocked?.by).toBe("d2");
    expect(r.blocked?.message).toBe("Keep 1 ft of wall between the two 10×10 roll-up doors.");
    const mixed = with_(garage, { openings: [d1, { id: "w", spec: "walk", wall: "front", x: 16 }] });
    expect(slideOpening(mixed, d1, 9).blocked?.message).toBe("Keep 1 ft of wall between the 10×10 roll-up door and the walk door.");
  });

  it("stops where the gable end gets too low, and says how tall it is there", () => {
    const r = slideOpening(garage, d1, 1);
    expect(r.x).toBe(4);
    expect(r.blocked?.by).toBeUndefined();
    expect(r.blocked?.message).toMatch(/needs 11 ft of wall height; past here the wall is 10\.8 ft tall/);
  });

  it("lets a door that doesn't fit where it sits jump to the nearest spot that does", () => {
    // An old link: d1 at 1 ft on the gable end, where the wall is too low for a 10×10.
    const stuck = { ...d1, x: 1 };
    const d = with_(garage, { openings: [stuck, ...garage.openings.filter((o) => o.id !== "d1")] });
    expect(designIssues(d).some((i) => i.openingId === "d1")).toBe(true);
    const r = slideOpening(d, stuck, 2);
    expect(r.x).toBe(4);
    expect(r.blocked?.message).toMatch(/past here the wall is/);
  });

  it("stops a foot from the corner", () => {
    const r = slideOpening(garage, d3, -6);
    expect(r.x).toBe(1);
    expect(r.blocked?.message).toMatch(/stays 1 ft from the corner/);
  });
});

describe("ridge cap color", () => {
  it("matches the roof unless picked, and old links read that way", () => {
    const { ridge: _ridge, ...oldColors } = garage.colors;
    expect(designSchema.parse({ ...garage, colors: oldColors }).colors.ridge).toBeNull();
    expect(colorsLabel(garage)).not.toMatch(/Ridge cap/);
  });

  it("is listed only when it differs on a gabled roof", () => {
    expect(colorsLabel(with_(garage, { colors: { ...garage.colors, ridge: "Black" } }))).toMatch(/Ridge cap Black/);
    expect(colorsLabel(with_(garage, { colors: { ...garage.colors, ridge: garage.colors.roof } }))).not.toMatch(/Ridge cap/);
    const flat = PRESETS.rv_cover;
    expect(colorsLabel(with_(flat, { colors: { ...flat.colors, ridge: "Black" } }))).not.toMatch(/Ridge cap/);
  });

  it("is drawn as its own piece on a gabled roof only", () => {
    expect(layoutBuilding(garage).members.filter((m) => m.mat === "ridge")).toHaveLength(2);
    expect(layoutBuilding(PRESETS.rv_cover).members.filter((m) => m.mat === "ridge")).toHaveLength(0);
  });
});

describe("posts, receivers, purlins", () => {
  type Lay = ReturnType<typeof layoutBuilding>;
  type M = Lay["members"][number];
  const receivers = (lay: Lay) => lay.members.filter((m) => m.profile === "c");
  const roofPurlins = (lay: Lay) => lay.members.filter((m) => m.profile === "lipped" && m.d === PUR_D);
  const wallPurlins = (lay: Lay) => lay.members.filter((m) => m.profile === "lipped" && m.d !== PUR_D);
  const posts = (lay: Lay) =>
    lay.members.filter((m) => m.mat === "frame" && !m.profile && m.w === COL && m.d === COL && m.a[0] === m.b[0] && m.a[2] === m.b[2]);
  /** A channel's top edge over the point p on its center line. */
  const top = (m: M, p: Vec3): Vec3 => {
    const n = m.up ?? [0, 1, 0];
    return [p[0] + (n[0] * m.d) / 2, p[1] + (n[1] * m.d) / 2, p[2] + (n[2] * m.d) / 2];
  };
  /** The main roof's steel line at (x, z): the eave on the posts, up to the ridge on a gable. */
  const roofLine = (d: Design, lay: Lay, x: number, z: number) =>
    lay.base + (d.roof === "gable" ? d.height + (d.width / 2 - Math.abs(x)) * GABLE_PITCH : d.height + (z + d.length / 2) * FLAT_PITCH);
  /** Purlin ends wanted: one on each side of every receiver web inside the run. */
  const endsAtWebs = (d: Design) => {
    const L = d.length / 2;
    const webs = [L, ...frameLines(d.length).slice(1, -1), -L];
    return new Set(
      webs
        .flatMap((w) => [w - STEEL_T, w + STEEL_T])
        .filter((z) => Math.abs(z) < L)
        .map((z) => z.toFixed(6)),
    );
  };

  it("rests each receiver's top flange on the posts: the posts run up inside it, the tops flush", () => {
    for (const d of [carport, garage, PRESETS.rv_cover]) {
      const lay = layoutBuilding(d);
      const W = d.width / 2;
      const sides = receivers(lay).filter((m) => m.a[0] === m.b[0] && Math.abs(m.a[0]) < W);
      expect(sides).toHaveLength(2);
      for (const m of sides) {
        for (const p of [m.a, m.b]) expect(top(m, p)[1]).toBeCloseTo(roofLine(d, lay, W, p[2]), 6);
        expect(Math.abs(m.a[0]) + REC_B / 2).toBeCloseTo(W);
        expect(Math.sign(m.open![0])).toBe(-Math.sign(m.a[0])); // open toward the middle
      }
      const lines = frameLines(d.length);
      const cols = posts(lay).filter(
        (m) => Math.abs(Math.abs(m.a[0]) - (W - COL / 2)) < 1e-9 && lines.some((z) => Math.abs(m.a[2] - z) < 1e-9) && Math.max(m.a[1], m.b[1]) > lay.base + d.height / 2,
      );
      expect(cols.length).toBeGreaterThanOrEqual(4);
      // Each stops just under the top flange: inside the receiver, not under it.
      for (const m of cols) expect(Math.max(m.a[1], m.b[1])).toBeCloseTo(roofLine(d, lay, W, m.a[2]) - STEEL_T, 6);
    }
  });

  it("sets every sloped receiver's top edge on the roof line, eave to ridge, doubles included", () => {
    for (const d of [carport, garage, with_(carport, { length: 40 }), with_(carport, { width: 40, length: 60 })]) {
      const lay = layoutBuilding(d);
      const W = d.width / 2;
      const sloped = receivers(lay).filter((m) => m.up && Math.abs(m.a[0]) <= W && Math.abs(m.b[0]) <= W);
      expect(sloped).toHaveLength(2 * 2 * (frameLines(d.length).length - 1));
      for (const m of sloped) {
        for (const p of [m.a, m.b]) {
          const t = top(m, p);
          expect(t[1]).toBeCloseTo(roofLine(d, lay, t[0], t[2]), 6);
        }
      }
    }
  });

  it("slots the roof purlins inside the receivers: tops on the roof line, each end at a receiver's web, no ridge beam", () => {
    for (const d of [carport, garage, PRESETS.barn, with_(carport, { width: 40, length: 60 })]) {
      const lay = layoutBuilding(d);
      const W = d.width / 2;
      const purlins = roofPurlins(lay).filter((m) => Math.abs(m.a[0]) <= W);
      expect(purlins.length).toBeGreaterThan(0);
      for (const m of purlins) {
        for (const p of [m.a, m.b]) {
          const t = top(m, p);
          expect(t[1]).toBeCloseTo(roofLine(d, lay, t[0], t[2]), 6);
        }
      }
      expect(new Set(purlins.flatMap((m) => [m.a[2], m.b[2]]).map((z) => z.toFixed(6)))).toEqual(endsAtWebs(d));
      // Nothing runs along the ridge itself.
      expect(lay.members.filter((m) => m.mat === "frame" && Math.abs(m.a[0]) < 0.01 && Math.abs(m.b[0]) < 0.01 && m.a[2] !== m.b[2])).toEqual([]);
    }
  });

  it("puts three purlins on each slope of a 26 wide, about 4 ft 4 in apart, as on the jobsite photos", () => {
    const lay = layoutBuilding(with_(carport, { width: 26, length: 25 }));
    const right = roofPurlins(lay).filter((m) => m.a[0] > 0);
    expect(right).toHaveLength(3);
    const xs = right.map((m) => m.a[0]).sort((a, b) => b - a);
    const eaveX = 13 - REC_B / 2;
    const gaps = [eaveX - xs[0], xs[0] - xs[1], xs[1] - xs[2]].map((g) => g / Math.cos(Math.atan(GABLE_PITCH)));
    for (const g of gaps) expect(g).toBeLessThanOrEqual(4.5 + 1e-6);
    expect(gaps[0]).toBeGreaterThan(4);
  });

  it("gives a frame line inside the building a double receiver, one opening each way", () => {
    const lay = layoutBuilding(with_(carport, { length: 40 })); // frame line at z = 0
    const mid = receivers(lay).filter((m) => m.a[2] === m.b[2] && Math.abs(m.a[2]) < REC_B);
    expect(mid).toHaveLength(4); // two receivers, both slopes
    expect(new Set(mid.map((m) => m.open![2]))).toEqual(new Set([1, -1]));
    // Purlins stop at the webs on both sides of it.
    const ends = roofPurlins(lay).flatMap((m) => [m.a[2], m.b[2]]).filter((z) => Math.abs(z) < 1);
    expect(new Set(ends.map((z) => z.toFixed(6)))).toEqual(new Set([STEEL_T.toFixed(6), (-STEEL_T).toFixed(6)]));
  });

  it("frames a flat roof with level end receivers on the posts and purlins from side receiver to side receiver", () => {
    const d = PRESETS.rv_cover;
    const lay = layoutBuilding(d);
    const L = d.length / 2;
    const ends = receivers(lay).filter((m) => m.a[2] === m.b[2]);
    expect(ends).toHaveLength(2);
    for (const m of ends) {
      expect(m.a[1]).toBeCloseTo(m.b[1]);
      expect(top(m, m.a)[1]).toBeCloseTo(roofLine(d, lay, 0, Math.sign(m.a[2]) * L), 6);
    }
    const purlins = roofPurlins(lay);
    expect(purlins.length).toBeGreaterThanOrEqual(Math.ceil(d.length / 4.5) - 1);
    for (const m of purlins) {
      expect(Math.abs(m.a[0])).toBeCloseTo(d.width / 2 - STEEL_T);
      expect(m.a[2]).toBe(m.b[2]);
      expect(top(m, m.a)[1]).toBeCloseTo(roofLine(d, lay, 0, m.a[2]), 6);
    }
  });

  it("puts a wall purlin at the top of the wainscot for it to fasten to", () => {
    const lay = layoutBuilding(garage); // wainscot on, 3 ft
    expect(wallPurlins(lay).some((m) => Math.abs(m.a[1] - (lay.base + 3)) < 1e-9)).toBe(true);
    const plain = layoutBuilding(with_(garage, { colors: { ...garage.colors, wainscot: null } }));
    expect(wallPurlins(plain).some((m) => Math.abs(m.a[1] - (lay.base + 3)) < 1e-9)).toBe(false);
  });

  it("keeps every wall purlin under the receiver at the top of the wall", () => {
    for (const d of [garage, with_(garage, { height: 12 }), with_(garage, { height: 8 }), PRESETS.barn]) {
      const lay = layoutBuilding(d);
      const purlins = wallPurlins(lay);
      expect(purlins.length).toBeGreaterThan(0);
      // 2 in flanges: 1 in above the middle.
      for (const m of purlins) expect(Math.max(m.a[1], m.b[1]) + 1 / 12).toBeLessThan(lay.base + d.height - REC_D);
    }
  });

  it("runs a roll-up's jambs all the way up inside the receiver; a walk door's stop at its header", () => {
    const lay = layoutBuilding(garage);
    const L = garage.length / 2;
    // Front-wall jambs of d1 (x = 4 to 14 from the left corner, i.e. world x -11 to -1).
    const jambs = lay.members.filter(
      (m) => m.profile === undefined && m.mat === "frame" && m.a[0] === m.b[0] && m.a[2] === m.b[2] && Math.abs(m.a[2] - (L - COL / 2)) < 0.1 && m.a[0] > -12 && m.a[0] < -10.5,
    );
    expect(jambs).toHaveLength(1);
    const u = jambs[0].a[0] + garage.width / 2;
    expect(Math.max(jambs[0].a[1], jambs[0].b[1])).toBeCloseTo(lay.base + wallTopAt(garage, "front", u) - STEEL_T);
    // The walk door on the right wall: jambs stop near 80 in + header.
    const walkJambs = lay.members.filter((m) => m.profile === undefined && m.a[0] === m.b[0] && m.a[2] === m.b[2] && m.a[0] > 14.5 && m.a[0] < 15 && m.a[2] > 7 && m.a[2] < 11.5);
    expect(walkJambs.length).toBeGreaterThan(0);
    for (const m of walkJambs) expect(Math.max(m.a[1], m.b[1])).toBeLessThan(lay.base + 8);
  });

  it("lets the receiver be the header when an opening comes up under it", () => {
    // A 3×3 window tops out at 6 ft 6 in; on a 7 ft wall the receiver comes down to 6 ft 4 in.
    const d = with_(garage, { height: 7, openings: [{ id: "w", spec: "win3x3", wall: "right", x: 4 }] });
    const lay = layoutBuilding(d);
    const x = d.width / 2 - COL / 2;
    const here = lay.members.filter((m) => m.mat === "frame" && !m.profile && Math.abs(m.a[0] - x) < 1e-6 && Math.abs(m.b[0] - x) < 1e-6);
    expect(here.filter((m) => m.a[2] !== m.b[2] && m.a[1] > lay.base + 6.5)).toEqual([]);
    const jambs = here.filter((m) => m.a[2] === m.b[2] && m.a[2] > 7.5 && m.a[2] < 11.5);
    expect(jambs).toHaveLength(2);
    for (const m of jambs) expect(Math.max(m.a[1], m.b[1])).toBeCloseTo(lay.base + d.height - STEEL_T);
  });

  it("frames a side lean-to the same way, its top purlin clear of the main wall's sheeting", () => {
    const d = PRESETS.barn; // 12 ft open lean-tos on both sides, main walls enclosed
    const lay = layoutBuilding(d);
    const W = d.width / 2;
    const depth = 12;
    const steel = (x: number) => lay.base + d.height - LEAN_ATTACH_DROP - (Math.abs(x) - W) * LEAN_PITCH;
    const purlins = roofPurlins(lay).filter((m) => m.a[0] > W);
    expect(purlins.length).toBeGreaterThan(0);
    for (const m of purlins) {
      for (const p of [m.a, m.b]) {
        const t = top(m, p);
        expect(t[1]).toBeCloseTo(steel(t[0]), 6);
      }
    }
    expect(new Set(purlins.flatMap((m) => [m.a[2], m.b[2]]).map((z) => z.toFixed(6)))).toEqual(endsAtWebs(d));
    // Receivers: the ones running out sit on the roof line; the outer one rests on the outer posts.
    const recs = receivers(lay).filter((m) => Math.max(m.a[0], m.b[0]) > W + 1);
    expect(recs.filter((m) => !m.up)).toHaveLength(1);
    for (const m of recs) {
      for (const p of [m.a, m.b]) {
        const t = top(m, p);
        expect(t[1]).toBeCloseTo(m.up ? steel(t[0]) : steel(W + depth), 6);
      }
    }
    const outerPosts = posts(lay).filter((m) => Math.abs(m.a[0] - (W + depth - COL / 2)) < 1e-9);
    expect(outerPosts.length).toBeGreaterThan(0);
    for (const m of outerPosts) expect(Math.max(m.a[1], m.b[1])).toBeCloseTo(steel(W + depth) - STEEL_T, 6);
    // The main wall's sheet is 0.04 ft out with 0.1 ft ribs; no purlin corner reaches into it.
    const corners = (m: M): number[] => {
      const n = m.up!;
      const ax = m.b[2] > m.a[2] ? ([0, 0, 1] as Vec3) : ([0, 0, -1] as Vec3);
      const wv = cross(ax, n);
      return [-1, 1].flatMap((s) => [-1, 1].map((t) => m.a[0] + (n[0] * s * m.d) / 2 + (wv[0] * t * m.w) / 2));
    };
    const innermost = Math.min(...purlins.flatMap(corners)) - W;
    expect(innermost).toBeGreaterThanOrEqual(0.14 - 1e-9);
    expect(innermost).toBeLessThan(0.4); // still a couple of inches off it
  });

  it("hangs a back lean-to's wall-side receiver outside the main wall's sheeting, purlins flush with it", () => {
    const d = with_(garage, { leanTos: [{ side: "back", depth: 10, walls: "open" }] });
    const lay = layoutBuilding(d);
    const L = d.length / 2;
    const steel = (z: number) => lay.base + d.height - LEAN_ATTACH_DROP - (-L - z) * LEAN_PITCH;
    const ledger = receivers(lay).find((m) => !m.up && m.a[2] === m.b[2] && m.a[2] < -L && m.a[2] > -L - 1);
    expect(ledger?.open).toEqual([0, 0, -1]);
    const web = ledger!.a[2] + REC_B / 2; // the back, away from the open side
    expect(web).toBeLessThanOrEqual(-L - 0.14 + 1e-9);
    expect(top(ledger!, ledger!.a)[1]).toBeCloseTo(steel(web), 6);
    const purlins = roofPurlins(lay).filter((m) => m.a[2] < -L);
    expect(purlins.length).toBeGreaterThan(0);
    for (const m of purlins) {
      const t = top(m, m.a);
      expect(t[1]).toBeCloseTo(steel(t[2]), 6);
      expect(m.a[2] + PUR_D).toBeLessThan(web); // clear of the ledger
    }
  });

  it("frames an enclosed lean-to's walls like the main walls, a wall purlin at the top of the wainscot", () => {
    const d = with_(PRESETS.barn, { leanTos: [{ side: "right", depth: 12, walls: "enclosed" }] });
    const lay = layoutBuilding(d);
    const W = d.width / 2;
    const lean = wallPurlins(lay).filter((m) => Math.max(m.a[0], m.b[0]) > W + 1);
    expect(lean.some((m) => Math.abs(m.a[1] - (lay.base + 3)) < 1e-9)).toBe(true);
    // The outer wall's run the whole length.
    expect(lean.some((m) => m.a[0] === m.b[0] && Math.abs(m.a[2] - m.b[2]) > d.length - 1)).toBe(true);
    const outerSteel = lay.base + d.height - LEAN_ATTACH_DROP - 12 * LEAN_PITCH;
    for (const m of lean) expect(Math.max(m.a[1], m.b[1]) + 1 / 12).toBeLessThan(outerSteel - REC_D);
  });
});
