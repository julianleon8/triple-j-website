import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { sliderKey, sliderValue, touchIntent } from "@/components/builder/panel/controls";
import { presetIncludes, startChoice, startOverQuestion } from "@/components/builder/panel/StartSection";

import { builderColor, sameOnScreen, USES } from "./catalog";
import { PRESETS, type Design } from "./design";
import { normalizeDesign } from "./rules";
import { wallsLabel } from "./summary";

describe("slider keys", () => {
  it("moves one step on an arrow and ten on PageUp/PageDown", () => {
    expect(sliderKey("ArrowRight", 10, 7, 20, 1)).toBe(11);
    expect(sliderKey("ArrowDown", 10, 7, 20, 1)).toBe(9);
    expect(sliderKey("PageUp", 10, 7, 20, 1)).toBe(20);
    expect(sliderKey("PageDown", 18, 7, 20, 1)).toBe(8);
  });

  it("moves a 0.5 ft door slider 5 ft on PageUp/PageDown", () => {
    expect(sliderKey("PageUp", 4, 1, 19, 0.5)).toBe(9);
    expect(sliderKey("PageDown", 9.5, 1, 19, 0.5)).toBe(4.5);
    expect(sliderKey("ArrowLeft", 9.5, 1, 19, 0.5)).toBe(9);
  });

  it("stops at the ends, and Home/End jump to them", () => {
    expect(sliderKey("PageUp", 16, 7, 20, 1)).toBe(20);
    expect(sliderKey("PageDown", 9, 7, 20, 1)).toBe(7);
    expect(sliderKey("Home", 12, 7, 20, 1)).toBe(7);
    expect(sliderKey("End", 12, 7, 20, 1)).toBe(20);
  });

  it("leaves every other key alone", () => {
    expect(sliderKey("Tab", 12, 7, 20, 1)).toBeNull();
    expect(sliderKey("a", 12, 7, 20, 1)).toBeNull();
  });
});

describe("typed fields", () => {
  it("use 16px text or more, so an iPhone does not zoom in on a tap", () => {
    const src = readFileSync(new URL("../../components/builder/panel/controls.tsx", import.meta.url), "utf8");
    // A tag opening its own line (not one named in a comment), up to its
    // self-closing end: the props hold arrow functions, so not the first ">".
    const inputs = src.match(/^\s*<(?:input|textarea)\b[\s\S]*?\/>/gm) ?? [];
    expect(inputs.length).toBeGreaterThan(0);
    for (const tag of inputs) {
      const sizes = [...tag.matchAll(/text-\[(\d+)px\]/g)].map((m) => Number(m[1]));
      expect(sizes.length, tag).toBeGreaterThan(0);
      for (const px of sizes) expect(px, tag).toBeGreaterThanOrEqual(16);
    }
  });
});

describe("slider position", () => {
  it("snaps to the step and stays in range", () => {
    expect(sliderValue(0, 7, 20, 1)).toBe(7);
    expect(sliderValue(1, 7, 20, 1)).toBe(20);
    expect(sliderValue(0.5, 7, 20, 1)).toBe(14);
    expect(sliderValue(-0.3, 7, 20, 1)).toBe(7);
    expect(sliderValue(1.4, 7, 20, 1)).toBe(20);
    expect(sliderValue(0.26, 1, 19, 0.5)).toBe(5.5);
  });
});

describe("a finger on a slider", () => {
  it("waits until it has moved far enough to tell", () => {
    expect(touchIntent(0, 0)).toBeNull();
    expect(touchIntent(6, 4)).toBeNull();
  });

  it("scrolls the page on an up-or-down swipe, even a slanted one", () => {
    // The eave jumped 10 to 13 ft on a thumb scrolling past it.
    expect(touchIntent(3, 40)).toBe("scroll");
    expect(touchIntent(-12, -20)).toBe("scroll");
    expect(touchIntent(15, 15)).toBe("scroll");
  });

  it("drags only when the move is mostly sideways", () => {
    expect(touchIntent(12, 2)).toBe("drag");
    expect(touchIntent(-20, 8)).toBe("drag");
  });
});

describe("starting point cards", () => {
  it("say what each starting point comes with", () => {
    expect(presetIncludes(PRESETS.garage)).toEqual(["2 roll-up doors", "walk door", "window", "wainscot"]);
    expect(presetIncludes(PRESETS.barn)).toEqual(["2 lean-tos", "roll-up door", "walk door", "wainscot"]);
  });

  it("show the walls when there is nothing else, as on the carport", () => {
    expect(presetIncludes(PRESETS.carport)).toEqual([]);
    expect(wallsLabel(PRESETS.carport)).toBe("All open");
    expect(presetIncludes(PRESETS.rv_cover)).toEqual([]);
  });

  it("leave out a wainscot that has no enclosed wall to show on", () => {
    const d: Design = { ...structuredClone(PRESETS.carport), colors: { ...PRESETS.carport.colors, wainscot: "Black" } };
    expect(presetIncludes(d)).toEqual([]);
  });
});

describe("tapping a starting point", () => {
  const edited = (d: Design): Design => normalizeDesign({ ...structuredClone(d), height: d.height + 3 });

  it("moves on from the current one", () => {
    expect(startChoice(normalizeDesign(PRESETS.garage), "garage")).toBe("continue");
    expect(startChoice(edited(PRESETS.garage), "garage")).toBe("continue");
  });

  it("loads another one at once while the design is untouched", () => {
    for (const u of USES) {
      const other = USES.find((x) => x !== u)!;
      expect(startChoice(normalizeDesign(PRESETS[u]), other)).toBe("load");
    }
    // The store's first design, before any normalizing.
    expect(startChoice(PRESETS.carport, "barn")).toBe("load");
  });

  it("asks first once the customer has changed something", () => {
    expect(startChoice(edited(PRESETS.carport), "barn")).toBe("ask");
    const recolored = normalizeDesign({ ...structuredClone(PRESETS.garage), colors: { ...PRESETS.garage.colors, roof: "Black" } });
    expect(startChoice(recolored, "carport")).toBe("ask");
  });

  it("asks in plain words before replacing the design", () => {
    expect(startOverQuestion("barn")).toBe("Start over as a Barn? This replaces your design.");
    expect(startOverQuestion("rv_cover")).toBe("Start over as an RV & boat cover? This replaces your design.");
    expect(startOverQuestion("garage")).toBe("Start over as a Garage & shop? This replaces your design.");
  });

  it("goes back to one tap when a change is undone by hand", () => {
    const back = normalizeDesign({ ...edited(PRESETS.carport), height: PRESETS.carport.height });
    expect(startChoice(back, "barn")).toBe("load");
  });
});

describe("white panel colors", () => {
  it("keep Brilliant White apart from Alamo and Polar White", () => {
    // Alamo and Polar White swatches measure the same; Brilliant White is brighter.
    expect(builderColor("Alamo-White").hex).toBe(builderColor("Polar-White").hex);
    expect(builderColor("Brilliant-White").hex).not.toBe(builderColor("Alamo-White").hex);
  });

  it("measure what their swatch images measure", () => {
    expect(builderColor("Alamo-White").hex).toBe("#e8e9d9");
    expect(builderColor("Polar-White").hex).toBe("#e8e9d9");
    expect(builderColor("Brilliant-White").hex).toBe("#eff2eb");
  });

  it("name the colors that look the same on screen, so the Colors step can say so", () => {
    expect(sameOnScreen("Polar-White").map((c) => c.name)).toEqual(["Alamo White", "Polar White"]);
    expect(sameOnScreen("Alamo-White").map((c) => c.slug)).toEqual(["Alamo-White", "Polar-White"]);
    expect(sameOnScreen("Brilliant-White").map((c) => c.slug)).toEqual(["Brilliant-White"]);
    expect(sameOnScreen("Black").map((c) => c.slug)).toEqual(["Black"]);
  });
});
