import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PRESETS, type Design } from "@/lib/builder/design";
import { designIssues } from "@/lib/builder/rules";

import { useBuilder } from "./store";

const garage = PRESETS.garage;

beforeEach(() =>
  useBuilder.setState({ design: structuredClone(PRESETS.carport), past: [], future: [], lastKey: null, toast: null, flash: null }),
);
afterEach(() => vi.useRealTimers());

describe("store.edit", () => {
  it("refuses an edit that creates a new problem, and says why", () => {
    const r = useBuilder.getState().edit((d) => ({ ...d, openings: [{ id: "a", spec: "walk", wall: "front", x: 5 }] }));
    expect(r.ok).toBe(false);
    expect(useBuilder.getState().design.openings).toEqual([]);
    expect(useBuilder.getState().announcement.text).toMatch(/needs the front wall enclosed/);
  });

  it("lets a design opened with a problem be edited toward a fix", () => {
    // A 16×16 roll-up on a 10 ft side wall: needs 17 ft. Each step up keeps the same problem.
    const broken: Design = { ...structuredClone(garage), openings: [{ id: "a", spec: "r16x16", wall: "left", x: 7 }] };
    useBuilder.setState({ design: broken });
    for (let h = 11; h <= 17; h++) {
      expect(useBuilder.getState().edit((d) => ({ ...d, height: h }), "height").ok).toBe(true);
    }
    expect(designIssues(useBuilder.getState().design)).toEqual([]);
  });

  it("merges a slider drag into one undo step", () => {
    const { edit } = useBuilder.getState();
    edit((d) => ({ ...d, width: 21 }), "width");
    edit((d) => ({ ...d, width: 22 }), "width");
    edit((d) => ({ ...d, width: 23 }), "width");
    expect(useBuilder.getState().past).toHaveLength(1);
    useBuilder.getState().undo();
    expect(useBuilder.getState().design.width).toBe(20);
  });
});

describe("on-screen messages", () => {
  it("shows a refusal over the 3D view and lights up the opening it is about", () => {
    useBuilder.getState().edit((d) => ({ ...d, openings: [{ id: "a", spec: "walk", wall: "front", x: 5 }] }));
    const { toast, flash, announcement } = useBuilder.getState();
    expect(toast).toMatchObject({ tone: "error", text: announcement.text });
    expect(flash?.id).toBe("a");
  });

  it("stops lighting it up after a moment", () => {
    vi.useFakeTimers();
    useBuilder.getState().notify("In the way", { flash: "d2" });
    expect(useBuilder.getState().flash?.id).toBe("d2");
    vi.advanceTimersByTime(2000);
    expect(useBuilder.getState().flash).toBeNull();
    expect(useBuilder.getState().toast?.text).toBe("In the way");
  });
});

describe("dragging", () => {
  it("keeps a whole drag as one undo step, pauses included", () => {
    vi.useFakeTimers();
    useBuilder.setState({ design: structuredClone(garage) });
    const move = (x: number) =>
      useBuilder.getState().edit((d) => ({ ...d, openings: d.openings.map((o) => (o.id === "d3" ? { ...o, x } : o)) }), "drag-d3-1", { merge: true });
    move(5);
    vi.advanceTimersByTime(3000);
    move(6);
    vi.advanceTimersByTime(3000);
    move(7);
    expect(useBuilder.getState().past).toHaveLength(1);
    useBuilder.getState().undo();
    expect(useBuilder.getState().design.openings.find((o) => o.id === "d3")?.x).toBe(4);
  });
});

describe("quiet edits", () => {
  it("refuses without a message, for a try that has a fallback", () => {
    const r = useBuilder.getState().edit((d) => ({ ...d, openings: [{ id: "a", spec: "walk", wall: "front", x: 5 }] }), undefined, { quiet: true });
    expect(r.ok).toBe(false);
    expect(useBuilder.getState().toast).toBeNull();
    expect(useBuilder.getState().flash).toBeNull();
  });
});
