import { beforeEach, describe, expect, it } from "vitest";

import { PRESETS, type Design } from "@/lib/builder/design";
import { designIssues } from "@/lib/builder/rules";

import { useBuilder } from "./store";

const garage = PRESETS.garage;

beforeEach(() => useBuilder.setState({ design: structuredClone(PRESETS.carport), past: [], future: [] }));

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
