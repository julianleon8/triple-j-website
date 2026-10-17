import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StateCreator } from "zustand/vanilla";

import { BuilderApp, PHONE_LAYOUT, ViewportControls, stepScroll, viewAfter } from "@/components/builder/BuilderApp";
import { PriceLine } from "@/components/builder/PriceLine";
import { canPickOpening, useBuilder } from "@/components/builder/store";

import { PRESETS, type Design } from "./design";
import { priceBasis, priceHint } from "./price";
import { designFromHash, designHash, encodeDesign, hasDesignHash, hashChange, parseDraftAhead, restoreDesign, shareUrl } from "./share";

const garage = PRESETS.garage;
const carport = PRESETS.carport;
const with_ = (d: Design, patch: Partial<Design>): Design => ({ ...structuredClone(d), ...patch });

// The quote form on Review only needs a router to leave for /thank-you.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }) }));
// zustand's server render reads a store's first state; here it reads the live
// one, so a test can put the builder on a step and render it there.
vi.mock("zustand", async () => {
  const { useSyncExternalStore } = await import("react");
  const { createStore } = await import("zustand/vanilla");
  const bind = (init: StateCreator<unknown>) => {
    const api = createStore(init);
    const read = (pick: (s: unknown) => unknown) => () => pick(api.getState());
    const useBound = (pick = (s: unknown) => s) => useSyncExternalStore(api.subscribe, read(pick), read(pick));
    return Object.assign(useBound, api);
  };
  return { create: (init?: StateCreator<unknown>) => (init ? bind(init) : bind) };
});

const initial = useBuilder.getState();
beforeEach(() => useBuilder.setState(initial, true));

/** The opening tag of the first element carrying `attr`. */
const tagWith = (html: string, attr: string) => html.match(new RegExp(`<[a-z]+[^>]*${attr}[^>]*>`))?.[0] ?? "";

describe("the design in the address bar", () => {
  it("writes #d=<design> and reads it back", () => {
    const hash = designHash(garage);
    expect(hash).toBe(`#d=${encodeDesign(garage)}`);
    expect(hasDesignHash(hash)).toBe(true);
    expect(designFromHash(hash)).toEqual(garage);
    expect(shareUrl("https://www.triplejmetaltx.com/", garage)).toBe(`https://www.triplejmetaltx.com/build${hash}`);
  });

  it("opens a link someone sent on Review, and keeps it as this browser's draft", () => {
    expect(restoreDesign(designHash(garage), null)).toEqual({ design: garage, shared: true, badLink: false });
    expect(restoreDesign(designHash(garage), encodeDesign(carport))).toMatchObject({ design: garage, shared: true });
  });

  it("treats an address that matches the draft as a reload of this browser's own design", () => {
    expect(restoreDesign(designHash(garage), encodeDesign(garage))).toEqual({ design: garage, shared: false, badLink: false });
  });

  it("restores this tab's newer draft when it left before the address caught up", () => {
    // Edited from the garage to a wider one, then reloaded within the address's 400 ms.
    const wider = with_(garage, { width: 36 });
    const ahead = { from: designHash(garage), to: encodeDesign(wider) };
    expect(restoreDesign(designHash(garage), encodeDesign(wider), ahead)).toEqual({ design: wider, shared: false, badLink: false });
    // The same address without the note is a link someone sent.
    expect(restoreDesign(designHash(garage), encodeDesign(wider), null)).toMatchObject({ design: garage, shared: true });
  });

  it("doesn't let the note speak for another address, or for a draft another tab wrote since", () => {
    const wider = with_(garage, { width: 36 });
    const ahead = { from: designHash(garage), to: encodeDesign(wider) };
    expect(restoreDesign(designHash(carport), encodeDesign(wider), ahead)).toMatchObject({ design: carport, shared: true });
    expect(restoreDesign(designHash(garage), encodeDesign(carport), ahead)).toMatchObject({ design: garage, shared: true });
  });

  it("reads the note back only when it is one", () => {
    expect(parseDraftAhead(JSON.stringify({ from: "#d=a", to: "b" }))).toEqual({ from: "#d=a", to: "b" });
    for (const raw of [null, "", "nope", "{}", JSON.stringify({ from: 1, to: "b" })]) expect(parseDraftAhead(raw)).toBeNull();
  });

  it("still restores the saved draft on plain /build", () => {
    expect(restoreDesign("", encodeDesign(carport))).toEqual({ design: carport, shared: false, badLink: false });
    expect(restoreDesign("", null)).toEqual({ design: null, shared: false, badLink: false });
    expect(restoreDesign("#main", null)).toEqual({ design: null, shared: false, badLink: false });
  });

  it("flags a cut-off link and falls back to the draft", () => {
    const cut = designHash(garage).slice(0, 30);
    expect(restoreDesign(cut, encodeDesign(carport))).toEqual({ design: carport, shared: false, badLink: true });
    expect(restoreDesign("#d=", null)).toEqual({ design: null, shared: false, badLink: true });
  });

  it("ignores the page's own writes, so replacing the address never loops", () => {
    const own = designHash(garage);
    expect(hashChange(own, own)).toEqual({ kind: "none" });
    expect(hashChange("", "")).toEqual({ kind: "none" });
    expect(hashChange("#main", own)).toEqual({ kind: "none" });
  });

  it("opens a different link pasted into the tab, and flags one it can't read", () => {
    expect(hashChange(designHash(carport), designHash(garage))).toEqual({ kind: "open", design: carport });
    expect(hashChange("#d=nope", designHash(garage))).toEqual({ kind: "bad" });
  });
});

describe("the price line before a frame is chosen", () => {
  const anchor = (d: Design) => {
    const hint = priceHint(d);
    if (hint.kind !== "anchor") throw new Error("expected a standard size");
    return hint.anchor;
  };

  it("says the bolted price is the one shown, rather than calling the building bolted", () => {
    const d = with_(carport, { frame: "unsure" });
    expect(priceBasis(d, anchor(d))).toContain("bolted price shown, steel + install, before tax");
    const html = renderToStaticMarkup(createElement(PriceLine, { design: d }));
    expect(html).toContain("bolted price shown");
    expect(html).not.toContain("bolted, steel");
  });

  it("names the frame once one is chosen, with the same numbers", () => {
    const bolted = with_(carport, { frame: "bolted" });
    const welded = with_(carport, { frame: "welded" });
    expect(priceBasis(bolted, anchor(bolted))).toContain("· bolted, steel + install, before tax");
    expect(priceBasis(welded, anchor(welded))).toContain("· welded, steel + install, before tax");
    expect(priceHint(with_(carport, { frame: "unsure" }))).toEqual(priceHint(bolted));
  });
});

describe("the step bar", () => {
  const strip = { left: 0, right: 360 };

  it("leaves a step alone when it already sits clear of both fades", () => {
    expect(stepScroll(strip, { left: 100, right: 200 })).toBe(0);
    expect(stepScroll(strip, { left: 40, right: 320 })).toBe(0);
  });

  it("scrolls a step cut off on the right fully into view, with room for the fade", () => {
    expect(stepScroll(strip, { left: 300, right: 400 })).toBe(80);
  });

  it("scrolls back for a step cut off on the left", () => {
    expect(stepScroll(strip, { left: -50, right: 50 })).toBe(-90);
    expect(stepScroll({ left: 20, right: 380 }, { left: 30, right: 120 }, 16)).toBe(-6);
  });
});

describe("the camera view buttons", () => {
  it("keep the view on after a re-frame, which keeps the angle", () => {
    expect(viewAfter("front", "fit")).toBe("front");
    expect(viewAfter(null, "fit")).toBe(null);
    expect(viewAfter("front", "top")).toBe("top");
    expect(viewAfter(null, "back")).toBe("back");
  });

  it("show the view the camera is on, call the back view Rear, and keep the ✓ room on the toggles", () => {
    useBuilder.setState({ frameOnly: false, showPerson: true });
    const html = renderToStaticMarkup(createElement(ViewportControls, { stage: { current: null } }));
    expect(html).toContain(">Rear<");
    expect(html).not.toContain(">Back<");
    // The camera opens on the 3D angle; that button alone is pressed, and turns navy.
    expect(html.match(/aria-pressed="true"[^>]*>3D</g)).toHaveLength(1);
    for (const label of ["Front", "Side", "Rear", "Top"]) expect(html).toMatch(new RegExp(`aria-pressed="false"[^>]*>${label}<`));
    expect(tagWith(html, 'aria-pressed="true"')).toContain("aria-pressed:bg-forge-navy");
    // Both toggles always hold a ✓; the one that is off keeps it invisible.
    expect(html).toMatch(/aria-pressed="false"[^>]*><span aria-hidden="true" class="invisible">✓<\/span>Frame only/);
    expect(html).toMatch(/aria-pressed="true"[^>]*><span aria-hidden="true">✓<\/span>Person/);
  });

  it("keep clear of the notch and home bar while the panel is away", () => {
    const shown = renderToStaticMarkup(createElement(ViewportControls, { stage: { current: null } }));
    const full = renderToStaticMarkup(createElement(ViewportControls, { stage: { current: null }, full: true }));
    expect(shown).not.toContain("safe-area-inset");
    expect(full).toContain("bottom-[max(12px,env(safe-area-inset-bottom))]");
    // The size moves up, out of the corner Edit design takes.
    expect(full).toContain("bottom-[calc(max(12px,env(safe-area-inset-bottom))+52px)]");
  });

  it("mark the four controls laid over the 3D view, so the camera frames clear of them", () => {
    for (const full of [false, true]) {
      const html = renderToStaticMarkup(createElement(ViewportControls, { stage: { current: null }, full }));
      const marked = html.match(/<[a-z]+ [^>]*data-scene-overlay="true"[^>]*>/g) ?? [];
      expect(marked).toHaveLength(4);
      // Undo/Redo, the Camera views group, the Frame only / Person chips, the size badge.
      expect(marked.some((t) => t.includes('aria-label="Camera views"'))).toBe(true);
      expect(marked.some((t) => t.startsWith("<p "))).toBe(true);
    }
  });
});

describe("a door tapped in 3D while the panel is put away", () => {
  it("is picked on the Doors and windows step, or whenever the panel shows", () => {
    expect(canPickOpening({ panelHidden: true, section: "openings" })).toBe(true);
    expect(canPickOpening({ panelHidden: false, section: "colors" })).toBe(true);
  });

  it("is left to the camera on any other step, so the hidden panel keeps its step", () => {
    for (const section of ["start", "size", "walls", "leans", "colors", "site", "review"] as const) {
      expect(canPickOpening({ panelHidden: true, section }), section).toBe(false);
    }
  });
});

describe("the builder shell", () => {
  const render = () => renderToStaticMarkup(createElement(BuilderApp));
  const PRICE_BAR = "pb-[max(12px,env(safe-area-inset-bottom))]";

  it("gives the dark header a light focus ring, as on the site header", () => {
    expect(render()).toMatch(/<header data-tone="dark"/);
  });

  it("shows the price bar on every step but Review, where the price card already shows it", () => {
    useBuilder.setState({ section: "size" });
    expect(render()).toContain(PRICE_BAR);
    useBuilder.setState({ section: "review" });
    expect(render()).not.toContain(PRICE_BAR);
  });

  it("offers a Hide panel button on phones only, tied to the panel it hides", () => {
    const html = render();
    const hide = html.match(/<button[^>]*>(?:(?!<\/button>).)*Hide panel<\/button>/)?.[0] ?? "";
    expect(hide).toContain('aria-expanded="true"');
    expect(hide).toContain('aria-controls="builder-panel"');
    // Hidden by default, shown under the same queries the panel uses for phones.
    expect(hide).toMatch(/class="hidden /);
    expect(hide).toContain("[@media(max-width:767px)_and_(orientation:portrait)]:flex");
    expect(hide).toContain("[@media(orientation:landscape)_and_(max-height:540px)_and_(max-width:1023px)]:flex");
    expect(html).toMatch(/<aside id="builder-panel"/);
    // The panel starts out, so the way back is not on screen yet.
    expect(html).not.toContain("Edit design");
  });

  it("shows the panel at once when it comes back, so its Hide panel button can take focus", () => {
    const aside = tagWith(render(), 'id="builder-panel"');
    expect(aside).toContain("transition-[margin]");
    // Visibility waits out the slide only on the way out.
    expect(aside).not.toContain("visibility");
    expect(aside).not.toContain("invisible");
  });

  it("gives the Walls plan the whole row on a narrow phone, so its wall names stay readable", () => {
    useBuilder.setState({ section: "walls" });
    const html = render();
    expect(html).toContain('<div class="@container">');
    expect(html).toContain("@min-[330px]:grid-cols-[minmax(0,1fr)_auto]");
  });

  it("detects phones with the same two queries the layout's classes use", () => {
    expect(PHONE_LAYOUT).toBe("(max-width: 767px) and (orientation: portrait), (orientation: landscape) and (max-height: 540px) and (max-width: 1023px)");
    const src = readFileSync("src/components/builder/BuilderApp.tsx", "utf8");
    expect(src).toContain("[@media(max-width:767px)_and_(orientation:portrait)]:");
    expect(src).toContain("[@media(orientation:landscape)_and_(max-height:540px)_and_(max-width:1023px)]:");
  });
});
