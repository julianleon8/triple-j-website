import { describe, expect, it } from "vitest";

import { planLabel, planWallEnds } from "@/components/builder/PlanView";
import {
  REMOVE_GUARD_MS,
  doubleTap,
  focusAfterRemoval,
  noRoomFor,
  placedElsewhere,
  positionHelper,
} from "@/components/builder/panel/OpeningsSection";
import { FLOOR_NOTE_FT, floorNote } from "@/components/builder/panel/SizeSection";

import { SIDES, openingSpec, type Side } from "./catalog";
import { PRESETS, type Design, type Opening } from "./design";
import {
  designIssues,
  dimensionLimits,
  normalizeDesign,
  openingRange,
  positionFrom,
  resizeDesign,
  shownPosition,
  shownRange,
  slideOpening,
  storedPosition,
  wallLength,
} from "./rules";

const garage = PRESETS.garage;
const with_ = (d: Design, patch: Partial<Design>): Design => ({ ...structuredClone(d), ...patch });

// Not square, so a wall mixed up with its neighbour shows.
const shop = with_(garage, { width: 24, length: 40, openings: [] });
const walk = (wall: Side, x: number): Opening => ({ id: "a", spec: "walk", wall, x });

describe("where a door reads on each wall", () => {
  it("measures side walls from the front corner and the front and back from the left side", () => {
    expect(positionFrom("left")).toBe("from the front corner");
    expect(positionFrom("right")).toBe("from the front corner");
    expect(positionFrom("front")).toBe("from the left side");
    expect(positionFrom("back")).toBe("from the left side");
  });

  it("shows the stored left edge as-is on the front and right walls", () => {
    expect(shownPosition(shop, walk("front", 2), 2)).toBe(2);
    expect(shownPosition(shop, walk("right", 2), 2)).toBe(2);
    expect(storedPosition(shop, walk("front", 2), 6.5)).toBe(6.5);
    expect(storedPosition(shop, walk("right", 2), 6.5)).toBe(6.5);
  });

  it("flips the left and back walls, which run the other way from outside", () => {
    // Left wall, 40 ft: a 3 ft door 2 ft from the back corner is 35 ft from the front.
    expect(shownPosition(shop, walk("left", 2), 2)).toBe(35);
    expect(storedPosition(shop, walk("left", 2), 35)).toBe(2);
    // Back wall, 24 ft: 2 ft from its left corner seen from outside is 19 ft from the left side seen from the front.
    expect(shownPosition(shop, walk("back", 2), 2)).toBe(19);
    expect(storedPosition(shop, walk("back", 2), 19)).toBe(2);
  });

  it.each(SIDES)("round-trips every half-foot step on the %s wall", (wall) => {
    const len = wallLength(shop, wall);
    for (let x = 1; x + 3 <= len - 1; x += 0.5) {
      const o = walk(wall, x);
      expect(storedPosition(shop, o, shownPosition(shop, o, x))).toBe(x);
      expect(shownPosition(shop, o, storedPosition(shop, o, x))).toBe(x);
    }
  });

  it.each(SIDES)("matches the plan: the %s wall's distance from where a customer measures", (wall) => {
    // The corner each wall is measured from, in plan (front at +z, left at -x).
    const W = shop.width / 2;
    const L = shop.length / 2;
    const from: Record<Side, [number, number]> = { front: [-W, L], back: [-W, -L], left: [-W, L], right: [W, L] };
    const [ax, az, bx, bz] = planWallEnds(shop, wall);
    const len = Math.hypot(bx - ax, bz - az);
    const at = (u: number) => [ax + ((bx - ax) * u) / len, az + ((bz - az) * u) / len];
    const o = walk(wall, 5);
    const ends = [at(o.x), at(o.x + openingSpec(o.spec).w)];
    const nearest = Math.min(...ends.map(([x, z]) => Math.hypot(x - from[wall][0], z - from[wall][1])));
    expect(shownPosition(shop, o, o.x)).toBeCloseTo(nearest);
  });

  it("swaps a range's ends on the left and back walls", () => {
    const d = with_(shop, { openings: [walk("left", 4)] });
    const r = openingRange(d, d.openings[0]);
    expect(r).toEqual({ min: 1, max: 36 });
    expect(shownRange(d, d.openings[0], r)).toEqual({ min: 1, max: 36 });
    const off = with_(shop, { openings: [walk("back", 4), { id: "b", spec: "walk", wall: "back", x: 14 }] });
    const rb = openingRange(off, off.openings[0]);
    expect(rb).toEqual({ min: 1, max: 10 });
    // 24 - x - 3: stored 1 → 20, stored 10 → 11.
    expect(shownRange(off, off.openings[0], rb)).toEqual({ min: 11, max: 20 });
  });

  it("stops a typed distance past the end with the same refusal as a drag", () => {
    const d = with_(shop, { openings: [walk("left", 4)] });
    const o = d.openings[0];
    const shown = shownRange(d, o, openingRange(d, o));
    // One step under the shown minimum is one step past the stored maximum.
    const { blocked } = slideOpening(d, o, storedPosition(d, o, shown.min - 0.5));
    expect(blocked?.message).toBe("The walk door stays 1 ft from the corner.");
  });

  it("labels the plan with each opening where a customer measures it", () => {
    const d = with_(shop, { openings: [walk("left", 2), { id: "b", spec: "r10x10", wall: "back", x: 4 }] });
    expect(planLabel(d)).toBe(
      "Plan view, 24 by 40 feet, front at the bottom. Walk door 36 in × 80 in, left side wall, 35 ft from the front corner. Roll-up door 10×10, back wall, 10 ft from the left side",
    );
  });

  it("says what the card's distance field measures", () => {
    expect(positionHelper("left", "door")).toBe("Measured from the front corner to the door's nearest edge.");
    expect(positionHelper("back", "window")).toBe("Measured from the left side, as seen from the front, to the window's nearest edge.");
  });
});

describe("removing a door or window", () => {
  it("ignores a second Remove that comes within half a second", () => {
    expect(doubleTap(1000, -Infinity)).toBe(false);
    expect(doubleTap(1000 + REMOVE_GUARD_MS - 1, 1000)).toBe(true);
    expect(doubleTap(1000 + REMOVE_GUARD_MS, 1000)).toBe(false);
  });

  it("hands focus to the next card, else the one before, else none", () => {
    expect(focusAfterRemoval(["a", "b", "c"], "a")).toBe("b");
    expect(focusAfterRemoval(["a", "b", "c"], "b")).toBe("c");
    expect(focusAfterRemoval(["a", "b", "c"], "c")).toBe("b");
    expect(focusAfterRemoval(["a"], "a")).toBeNull();
    expect(focusAfterRemoval(["a"], "z")).toBeNull();
  });
});

describe("adding a door or window", () => {
  it("says so when a door lands on a wall other than the first one tried", () => {
    const o: Opening = { id: "o5", spec: "r16x16", wall: "back", x: 7 };
    expect(placedElsewhere(garage, "rollup", o)).toBe("No room on the front wall, so the 16×16 roll-up door went on the back wall.");
    expect(placedElsewhere(garage, "rollup", { ...o, wall: "front" })).toBeNull();
  });

  it("expects the first enclosed wall, skipping open ones", () => {
    const d = with_(garage, { walls: { ...garage.walls, right: "open" } });
    const o: Opening = { id: "o5", spec: "walk", wall: "front", x: 4 };
    expect(placedElsewhere(d, "walk", o)).toBe("No room on the left side wall, so the walk door went on the front wall.");
    expect(placedElsewhere(d, "walk", { ...o, wall: "left" })).toBeNull();
  });

  it("ends the dead end with a way out", () => {
    expect(noRoomFor("rollup")).toBe(
      "No enclosed wall has room for a roll-up door. Enclose another wall, make the building bigger, or ask for it in the quote form.",
    );
  });
});

describe("door refusals name wall height", () => {
  it("says how tall the wall is where a door sits", () => {
    const d = with_(garage, { height: 16, openings: [{ id: "a", spec: "r16x16", wall: "left", x: 7 }] });
    expect(designIssues(d)[0].message).toBe(
      "The 16×16 roll-up door needs 17 ft of wall height where it sits; the wall is 16 ft tall there.",
    );
  });
});

describe("the Size step's minimum notes", () => {
  it("names the floor and what won't fit under it", () => {
    // Two alike on one wall are named together: which gives out first is nothing a customer can tell apart.
    expect(dimensionLimits(garage, "height").reason).toBe(
      "Lower than a 10 ft eave, the two 10×10 roll-up doors on the front wall won't fit.",
    );
    expect(dimensionLimits(garage, "width").reason).toBe("Narrower than 30 ft, the two 10×10 roll-up doors on the front wall won't fit.");
    expect(dimensionLimits(PRESETS.barn, "width").reason).toBe(
      "Narrower than 25 ft, the 12×12 roll-up door on the front wall won't fit.",
    );
    expect(dimensionLimits(PRESETS.barn, "height").reason).toBe(
      "Lower than an 11 ft eave, the 12×12 roll-up door on the front wall won't fit.",
    );
  });

  it("names one door alone on its wall in the singular, and three alike together", () => {
    const one = with_(garage, { openings: [garage.openings[0], garage.openings[2]] });
    expect(dimensionLimits(one, "height").reason).toBe("Lower than a 10 ft eave, the 10×10 roll-up door on the front wall won't fit.");
    const walks = with_(shop, {
      height: 8,
      openings: [walk("right", 2), { ...walk("right", 10), id: "b" }, { ...walk("right", 20), id: "c" }],
    });
    expect(dimensionLimits(walks, "height").reason).toBe("Lower than an 8 ft eave, the three walk doors on the right side wall won't fit.");
  });

  it("never reads as a contradiction", () => {
    for (const d of Object.values(PRESETS)) {
      for (const dim of ["width", "length", "height"] as const) {
        const { reason } = dimensionLimits(d, dim);
        if (reason) expect(reason).not.toMatch(/is the minimum|there is/);
      }
    }
  });

  it("names a shorter building and a crowded wall", () => {
    const d = with_(shop, {
      openings: [
        { id: "a", spec: "walk", wall: "right", x: 1 },
        { id: "b", spec: "walk", wall: "right", x: 5 },
        { id: "c", spec: "walk", wall: "right", x: 30 },
      ],
    });
    expect(dimensionLimits(d, "length")).toMatchObject({
      min: 13,
      reason: "Shorter than 13 ft, the doors and windows on the right side wall won't all fit.",
    });
  });

  it("names the back of a flat roof", () => {
    const d = with_(PRESETS.rv_cover, {
      height: 14,
      walls: { ...PRESETS.rv_cover.walls, back: "enclosed" },
      openings: [{ id: "a", spec: "r10x10", wall: "back", x: 5 }],
    });
    expect(dimensionLimits(d, "height").reason).toBe("Lower than 11 ft at the back, the 10×10 roll-up door on the back wall won't fit.");
  });

  it("names a lean-to roof that would cut through a door", () => {
    const d = with_(garage, {
      height: 15,
      leanTos: [{ side: "left", depth: 6, walls: "open" }],
      openings: [{ id: "a", spec: "r12x12", wall: "left", x: 9 }],
    });
    expect(dimensionLimits(d, "height")).toMatchObject({
      min: 14,
      reason: "Lower than a 14 ft eave, the 12×12 roll-up door on the left side wall won't fit under the lean-to.",
    });
  });

  it("names a lean-to that would drop too low", () => {
    const d = with_(PRESETS.carport, { height: 12, leanTos: [{ side: "left", depth: 16, walls: "open" }] });
    expect(dimensionLimits(d, "height").reason).toBe(
      "Lower than an 11 ft eave, the 16 ft lean-to on the left side would drop below 7 ft at its low edge.",
    );
  });

  it("shows the note only near the floor", () => {
    const lim = { min: 10, max: 20, reason: "Lower than a 10 ft eave, the 10×10 roll-up door on the front wall won't fit." };
    expect(floorNote(10, lim)).toBe(lim.reason);
    expect(floorNote(10 + FLOOR_NOTE_FT, lim)).toBe(lim.reason);
    expect(floorNote(10 + FLOOR_NOTE_FT + 1, lim)).toBeNull();
    expect(floorNote(10, { ...lim, reason: null })).toBeNull();
  });
});

describe("resizing the building", () => {
  it("keeps every door and window the same distance from where a customer measures it", () => {
    const d = with_(shop, {
      openings: [
        { id: "f", spec: "walk", wall: "front", x: 3 },
        { id: "b", spec: "walk", wall: "back", x: 4 },
        { id: "l", spec: "win3x3", wall: "left", x: 6 },
        { id: "r", spec: "win3x3", wall: "right", x: 5 },
      ],
    });
    const shown = (x: Design) => Object.fromEntries(x.openings.map((o) => [o.id, shownPosition(x, o, o.x)]));
    const before = shown(d);
    // Every size that still has room for them where they are.
    for (const width of [21, 30, 40]) expect(shown(normalizeDesign(resizeDesign(d, "width", width))), `width ${width}`).toEqual(before);
    for (const length of [35, 50, 100]) expect(shown(normalizeDesign(resizeDesign(d, "length", length))), `length ${length}`).toEqual(before);
    expect(shown(normalizeDesign(resizeDesign(d, "height", 14)))).toEqual(before);
  });

  it("keeps the garage's left window 13.5 ft from the front corner as it gets longer", () => {
    const longer = normalizeDesign(resizeDesign(garage, "length", 40));
    const win = longer.openings.find((o) => o.id === "d4")!;
    expect(shownPosition(longer, win, win.x)).toBe(13.5);
  });

  it("still slides a door back onto a wall that gets too short for where it was", () => {
    const d = with_(shop, { openings: [{ id: "l", spec: "walk", wall: "left", x: 2 }] });
    // 2 ft from the back corner is 35 ft from the front: 20 ft long, it stops at the back corner.
    const shorter = normalizeDesign(resizeDesign(d, "length", 20));
    expect(shorter.openings[0].x).toBe(1);
    expect(designIssues(shorter)).toEqual([]);
  });

  it("rounds and bounds the size as the store would", () => {
    expect(resizeDesign(shop, "width", 24.4).width).toBe(24);
    expect(resizeDesign(shop, "width", 400).width).toBe(40);
  });
});
