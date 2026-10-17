import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StateCreator } from "zustand/vanilla";

import { BuilderQuoteForm, EMPTY_CONTACT, contactProblems, sendHint, useContactDraft } from "@/components/builder/BuilderQuoteForm";
import {
  THANKS_NAME_KEY,
  ThanksGreeting,
  firstNameOf,
  nameStore,
  stashThanksName,
  takeThanksName,
} from "@/components/site/ThanksGreeting";

import { PRESETS, type Design, type Opening } from "./design";
import { openingPosition } from "./rules";
import { leadMessage, openingLines, openingPosition as summaryPosition, summaryRows, withoutDesignLink } from "./summary";

const garage = PRESETS.garage;
const with_ = (d: Design, patch: Partial<Design>): Design => ({ ...structuredClone(d), ...patch });
const at = (id: string, spec: Opening["spec"], wall: Opening["wall"], x: number): Opening => ({ id, spec, wall, x });

// The form only needs a router to leave for /thank-you.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }) }));
// zustand's server render reads a store's first state. Here it reads the live
// one, as the browser does when the form mounts again on a later visit to Review.
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

describe("where each door and window sits, in words", () => {
  it("measures side walls from the front corner and the front and back from the left side", () => {
    // 30×30: the left wall and the back run the other way in the data.
    expect(openingPosition(garage, at("a", "walk", "right", 4))).toBe("4 ft from the front corner");
    expect(openingPosition(garage, at("a", "walk", "left", 4))).toBe("23 ft from the front corner");
    expect(openingPosition(garage, at("a", "walk", "front", 3))).toBe("3 ft from the left side");
    expect(openingPosition(garage, at("a", "walk", "back", 3))).toBe("24 ft from the left side");
  });

  it("offers the same wording from summary.ts, with the rest of the design in words", () => {
    expect(summaryPosition).toBe(openingPosition);
    expect(summaryPosition(garage, at("a", "walk", "left", 4))).toBe("23 ft from the front corner");
  });

  it("names every opening's spot on the review list", () => {
    expect(openingLines(garage)).toEqual([
      "2 × 10×10 roll-up door, front, 4 ft and 16 ft from the left side",
      "1 × 3×3 window, left side, 13.5 ft from the front corner",
      "1 × walk door (36 in × 80 in), right side, 4 ft from the front corner",
    ]);
  });

  it("says each spot exactly as the Doors and windows cards, the plan and the 3D label do", () => {
    // One owner (rules.openingPosition): every opening alone on its wall reads the same on Review.
    for (const wall of ["front", "back", "left", "right"] as const) {
      const o = at("a", "walk", wall, 5);
      const d = with_(garage, { openings: [o] });
      expect(openingLines(d)).toEqual([`1 × walk door (36 in × 80 in), ${wall === "left" || wall === "right" ? `${wall} side` : wall}, ${openingPosition(d, o)}`]);
    }
  });

  it("keeps each spot when there are several of a kind, nearest first, one line per wall", () => {
    const d = with_(garage, {
      openings: [
        at("a", "win3x3", "left", 4),
        at("b", "win3x3", "left", 20),
        at("c", "win3x3", "right", 10),
      ],
    });
    expect(openingLines(d)).toEqual([
      "2 × 3×3 window, left side, 7 ft and 23 ft from the front corner",
      "1 × 3×3 window, right side, 10 ft from the front corner",
    ]);
  });

  it("stacks the openings one per line on Review and keeps the joined text for the lead", () => {
    const row = summaryRows(garage).find((r) => r.k === "Doors & windows");
    expect(row?.lines).toEqual(openingLines(garage));
    expect(row?.v).toBe(openingLines(garage).join(" · "));
    const none = summaryRows(with_(garage, { openings: [] })).find((r) => r.k === "Doors & windows");
    expect(none).toMatchObject({ v: "None", lines: [] });
  });

  it("puts the positions in the lead text Julian gets", () => {
    const msg = leadMessage(garage, "https://example.com/build#d=x");
    expect(msg).toContain("1 × walk door (36 in × 80 in), right side, 4 ft from the front corner");
    expect(msg).toContain("2 × 10×10 roll-up door, front, 4 ft and 16 ft from the left side");
  });
});

describe("the lead message without its 3D link line", () => {
  const link = "https://example.com/build#d=x";

  it("drops the link line and the gap above it, and keeps the design and the notes", () => {
    const shown = withoutDesignLink(leadMessage(garage, link, "Gate on the north side"));
    expect(shown).not.toContain(link);
    expect(shown).not.toContain("Open the design in 3D");
    expect(shown).not.toMatch(/\n\n\n/);
    expect(shown).toContain("Concrete: ");
    expect(shown).toContain("\n\nCustomer notes:\nGate on the north side");
  });

  it("leaves a message with no link line alone", () => {
    expect(withoutDesignLink("Need a 20×20 carport")).toBe("Need a 20×20 carport");
  });
});

describe("what stops the builder's contact form from sending", () => {
  const ok = { name: "Ray Smith", phone: "254-555-0100", email: "", zip: "76541" };

  it("passes a complete form", () => {
    expect(contactProblems(ok)).toEqual({ fields: [], message: "" });
  });

  it("names what's missing, in form order", () => {
    expect(contactProblems({ ...ok, phone: "", zip: "" })).toEqual({
      fields: ["phone", "zip"],
      message: "Add your phone and ZIP to send.",
    });
    expect(contactProblems({ name: "", phone: "", email: "", zip: "" }).fields).toEqual(["name", "phone", "zip"]);
  });

  it("asks for the rest of a half-typed phone or ZIP", () => {
    expect(contactProblems({ ...ok, phone: "254 555", zip: "765" }).message).toBe(
      "Add your full phone number and 5-digit ZIP to send.",
    );
  });

  it("says it in one line under the form, with the design's problem after the contact's", () => {
    expect(sendHint("", false)).toBe("");
    expect(sendHint("Add your ZIP to send.", false)).toBe("Add your ZIP to send.");
    expect(sendHint("", true)).toBe("Fix the design first: see the note above.");
    expect(sendHint("Add your ZIP to send.", true)).toBe("Add your ZIP to send. Fix the design first: see the note above.");
  });

  it("flags an email that can't be right, but not a blank one", () => {
    expect(contactProblems({ ...ok, email: "ray@" })).toEqual({
      fields: ["email"],
      message: "Check your email, or leave it blank.",
    });
    expect(contactProblems({ ...ok, email: "  " }).fields).toEqual([]);
  });
});

describe("the builder's contact form between steps", () => {
  afterEach(() => useContactDraft.getState().clear());
  const form = () => renderToStaticMarkup(createElement(BuilderQuoteForm, { design: garage }));
  /** The opening tag of the field with this id. */
  const tag = (html: string, id: string) => html.match(new RegExp(`<(?:input|textarea)[^>]*id="${id}"[^>]*>`))?.[0] ?? "";

  it("keeps what was typed when the form is shown again", () => {
    useContactDraft.getState().set({ name: "Ray Smith", zip: "76541" });
    useContactDraft.getState().set({ notes: "Gate code 1234", military: true });
    expect(useContactDraft.getState().c).toEqual({
      ...EMPTY_CONTACT,
      name: "Ray Smith",
      zip: "76541",
      notes: "Gate code 1234",
      military: true,
    });
    const html = form();
    expect(tag(html, "bq-name")).toContain('value="Ray Smith"');
    expect(tag(html, "bq-zip")).toContain('value="76541"');
    expect(html).toContain(">Gate code 1234</textarea>");
  });

  it("empties after a send", () => {
    useContactDraft.getState().set({ name: "Ray Smith" });
    useContactDraft.getState().markSent();
    expect(useContactDraft.getState().sent).toBe(true);
    useContactDraft.getState().clear();
    expect(useContactDraft.getState()).toMatchObject({ c: EMPTY_CONTACT, sent: false });
  });

  it("confirms the military discount under the box, only when it is ticked", () => {
    expect(form()).not.toContain("Military discount noted");
    useContactDraft.getState().set({ military: true });
    expect(form()).toContain("Military discount noted: 7% off your install.");
  });

  it("keeps one alert in the page for a press of Send, and nothing in it before one", () => {
    const html = form();
    expect(html.match(/role="alert"/g)).toHaveLength(1);
    expect(html).toContain('<div role="alert" class="sr-only"></div>');
  });

  it("keeps Send pressable and every field at 16px so phones don't zoom in", () => {
    const html = form();
    expect(html.match(/<button type="submit"[^>]*>/)?.[0]).not.toContain('disabled=""');
    for (const id of ["bq-name", "bq-phone", "bq-email", "bq-zip", "bq-notes"]) {
      expect(tag(html, id)).toContain("text-[16px]!");
    }
    expect(tag(html, "bq-notes")).toMatch(/field-sizing-content.*max-h-\[320px\]/);
  });
});

describe("the first name on the thank-you page", () => {
  let store: Map<string, string>;
  beforeEach(() => {
    store = new Map();
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("takes the first word, trimmed and capped", () => {
    expect(firstNameOf("  Ray   Smith ")).toBe("Ray");
    expect(firstNameOf("Ray, Jr.")).toBe("Ray");
    expect(firstNameOf("   ")).toBeNull();
    expect(firstNameOf("A".repeat(45))).toBe("A".repeat(30));
  });

  it("stores the first name only, under its own key", () => {
    stashThanksName("Ray Smith");
    expect(THANKS_NAME_KEY).not.toBe("tj_ec_user_data");
    expect([...store.entries()]).toEqual([[THANKS_NAME_KEY, "Ray"]]);
  });

  it("reads it once and removes it, so a later visit doesn't greet the wrong person", () => {
    stashThanksName("Ray Smith");
    expect(takeThanksName()).toBe("Ray");
    expect(store.has(THANKS_NAME_KEY)).toBe(false);
    expect(takeThanksName()).toBeNull();
  });

  it("clears an old name when the next sender's name is blank", () => {
    stashThanksName("Ray");
    stashThanksName("  ");
    expect(store.has(THANKS_NAME_KEY)).toBe(false);
  });

  it("adds the name once the page is on screen, and keeps it through a second subscribe", () => {
    stashThanksName("Ray Smith");
    const s = nameStore();
    expect(s.get()).toBeNull();
    const onChange = vi.fn();
    s.subscribe(onChange);
    expect(s.get()).toBe("Ray");
    expect(onChange).toHaveBeenCalledTimes(1);
    s.subscribe(onChange);
    expect(s.get()).toBe("Ray");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("server-renders the plain greeting and leaves the name for the browser", () => {
    stashThanksName("Ray");
    expect(renderToStaticMarkup(createElement(ThanksGreeting))).toBe("Got it.");
    expect(store.get(THANKS_NAME_KEY)).toBe("Ray");
  });

  it("works without storage", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    });
    expect(() => stashThanksName("Ray")).not.toThrow();
    expect(takeThanksName()).toBeNull();
  });
});
