import { describe, expect, it } from "vitest";

import { BUILDER_COLORS, LIMITS, USES } from "./catalog";
import { PRESETS, designSchema, type Design } from "./design";
import { frameLines, layoutBuilding, type Vec3 } from "./geometry";
import { formatPrice, priceHint } from "./price";
import {
  canAddLean,
  designIssues,
  dimensionLimits,
  maxLeanDepth,
  normalizeDesign,
  openingRange,
  placeOpening,
  wallTopAt,
} from "./rules";
import { decodeDesign, designFromHash, encodeDesign, shareUrl } from "./share";
import { leadMessage, summaryRows } from "./summary";

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
    expect(dimensionLimits(d, "height")).toMatchObject({ min: 13, reason: expect.stringMatching(/needs 13 ft/) });
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

  it("states the concrete spec the way the vault does", () => {
    const row = summaryRows(carport).find((r) => r.k === "Concrete");
    expect(row?.v).toContain("3,000 PSI standard");
    expect(row?.v).not.toContain("4,000");
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

  it("gives a back lean-to a ledger to hang its rafters on", () => {
    const d = with_(garage, { leanTos: [{ side: "back", depth: 10, walls: "open" }] });
    const ledger = layoutBuilding(d).members.find((m) => m.mat === "frame" && m.a[2] === m.b[2] && Math.abs(m.a[2] + 15 - 1 / 6) < 0.01 && m.a[0] < -14 && m.b[0] > 14);
    expect(ledger).toBeTruthy();
  });
});
