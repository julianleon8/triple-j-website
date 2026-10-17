import { beforeEach, describe, expect, it } from "vitest";

import { deselectOnEscape, useBuilder } from "@/components/builder/store";

import { PRESETS, type Design, type LeanTo } from "./design";
import {
  MAX_CAMERA_STEP,
  cross,
  evalPiecewise,
  framingClearOf,
  framingDistance,
  keepLabelInside,
  layoutBuilding,
  openingFaces,
  screenBounds,
  steadyStep,
  type Layout,
  type ScreenRect,
  type Surface,
  type Vec3,
} from "./geometry";

const with_ = (d: Design, patch: Partial<Design>): Design => ({ ...structuredClone(d), ...patch });
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const ENCLOSED = { front: "enclosed", back: "enclosed", left: "enclosed", right: "enclosed" } as const;
const PARTIAL = { front: "partial", back: "partial", left: "partial", right: "partial" } as const;
const leans = (walls: LeanTo["walls"]): LeanTo[] => [
  { side: "left", depth: 12, walls },
  { side: "back", depth: 10, walls },
];

/** Gable and flat roofs, every wall state that gets corner trim, and enclosed and open lean-tos on all three sides. */
const DESIGNS: [string, Design][] = [
  ["garage", PRESETS.garage],
  ["barn", PRESETS.barn],
  ["partial gable", with_(PRESETS.carport, { walls: { ...PARTIAL } })],
  ["one enclosed side", with_(PRESETS.carport, { walls: { front: "open", back: "open", left: "open", right: "enclosed" } })],
  ["enclosed flat", with_(PRESETS.rv_cover, { walls: { ...ENCLOSED } })],
  ["partial flat", with_(PRESETS.rv_cover, { walls: { ...PARTIAL } })],
  ["gable, enclosed lean-tos", with_(PRESETS.garage, { leanTos: leans("enclosed") })],
  ["gable, right enclosed lean-to", with_(PRESETS.garage, { leanTos: [{ side: "right", depth: 14, walls: "enclosed" }] })],
  ["flat, enclosed lean-tos", with_(PRESETS.rv_cover, { walls: { ...ENCLOSED }, leanTos: leans("enclosed") })],
  ["flat, open lean-tos", with_(PRESETS.rv_cover, { walls: { ...ENCLOSED }, leanTos: leans("open") })],
];

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

const cornerTrims = (lay: Layout) => lay.members.filter((m) => m.mat === "trim" && m.a[0] === m.b[0] && m.a[2] === m.b[2]);

describe("corner trim", () => {
  it("stops just under the roof over it, at every corner of the trim, so none shows through the roof", () => {
    for (const [name, d] of DESIGNS) {
      const lay = layoutBuilding(d);
      const roofs = lay.surfaces.filter((s) => s.mat === "roof");
      const trims = cornerTrims(lay);
      expect(trims.length, name).toBeGreaterThan(0);
      for (const t of trims) {
        const top = Math.max(t.a[1], t.b[1]);
        const r = t.w / 2;
        // The roof's underside at each corner of the trim's square, measured from the trim's top.
        const gaps = [-r, r].flatMap((dx) =>
          [-r, r].flatMap((dz) => roofs.map((s) => roofAt(s, t.a[0] + dx, t.a[2] + dz)).filter((y): y is number => y != null).map((y) => y - top)),
        );
        const where = `${name}: trim at ${t.a[0].toFixed(2)}, ${t.a[2].toFixed(2)}`;
        // Nothing cuts through the top of it. A trim on the main building may
        // rise past a lean-to roof well below its top, on up to the main eave.
        expect(gaps.filter((g) => g <= 0 && g > -0.5), where).toEqual([]);
        // A roof is right over it: under it, and close.
        const over = gaps.filter((g) => g > 0);
        expect(over.length, where).toBeGreaterThan(0);
        expect(Math.min(...over), where).toBeLessThan(0.1);
      }
    }
  });
});

describe("framing the camera", () => {
  const FOV = 35;
  const tanV = Math.tan((FOV * Math.PI) / 360);
  /** Azimuth and polar angle of the named views, as in the scene. */
  const VIEWS: Record<string, [number, number]> = { iso: [0.62, 1.13], front: [0, 1.45], right: [Math.PI / 2, 1.45], back: [Math.PI, 1.45], top: [0, 0.02] };
  const CANVASES: [string, number, number][] = [
    ["phone", 390, 371],
    ["small phone", 360, 300],
    ["phone sideways", 405, 334],
    ["desktop", 1000, 844],
  ];

  /** How far in from each edge of the canvas, in px, the box's nearest corner lands. */
  function margins(min: Vec3, max: Vec3, target: Vec3, theta: number, phi: number, dist: number, w: number, h: number) {
    const back: Vec3 = [Math.sin(phi) * Math.sin(theta), Math.cos(phi), Math.sin(phi) * Math.cos(theta)];
    const right: Vec3 = [Math.cos(theta), 0, -Math.sin(theta)];
    const up = cross(back, right);
    const out = { top: Infinity, bottom: Infinity, left: Infinity, right: Infinity };
    for (const x of [min[0], max[0]])
      for (const y of [min[1], max[1]])
        for (const z of [min[2], max[2]]) {
          const q: Vec3 = [x - target[0], y - target[1], z - target[2]];
          const depth = dist - dot(q, back);
          const nx = dot(q, right) / (depth * tanV * (w / h));
          const ny = dot(q, up) / (depth * tanV);
          out.top = Math.min(out.top, ((1 - ny) / 2) * h);
          out.bottom = Math.min(out.bottom, ((1 + ny) / 2) * h);
          out.left = Math.min(out.left, ((1 + nx) / 2) * w);
          out.right = Math.min(out.right, ((1 - nx) / 2) * w);
        }
    return out;
  }

  /** The tangents the scene passes for a canvas with these clearances, in px. */
  const tangents = (w: number, h: number, clear: { top: number; bottom: number; side: number }) => {
    const share = (px: number, of: number) => Math.max(0.25, 1 - (2 * px) / of);
    return { across: tanV * (w / h) * share(clear.side, w), up: tanV * share(clear.top, h), down: tanV * share(clear.bottom, h) };
  };

  it("keeps every named view clear of the buttons along the top and bottom, and still fills the view", () => {
    const clear = { top: 56, bottom: 56, side: 16 };
    for (const [name, d] of DESIGNS.slice(0, 6)) {
      const { min, max } = layoutBuilding(d).bounds;
      const target: Vec3 = [(min[0] + max[0]) / 2, ((min[1] + max[1]) / 2) * 0.85, (min[2] + max[2]) / 2];
      for (const [canvas, w, h] of CANVASES) {
        for (const [view, [theta, phi]] of Object.entries(VIEWS)) {
          const dist = framingDistance(min, max, target, theta, phi, tangents(w, h, clear));
          const m = margins(min, max, target, theta, phi, dist, w, h);
          const where = `${name}, ${view} view on a ${canvas}`;
          expect(m.top, where).toBeGreaterThanOrEqual(clear.top - 0.01);
          expect(m.bottom, where).toBeGreaterThanOrEqual(clear.bottom - 0.01);
          expect(Math.min(m.left, m.right), where).toBeGreaterThanOrEqual(clear.side - 0.01);
          // Full: the building reaches right up to one of those limits.
          const slack = Math.min(m.top - clear.top, m.bottom - clear.bottom, m.left - clear.side, m.right - clear.side);
          expect(slack, where).toBeLessThan(0.5);
        }
      }
    }
  });

  it("stands back further when the view buttons wrap to two rows, even on a small phone held sideways", () => {
    const { min, max } = layoutBuilding(PRESETS.garage).bounds;
    const target: Vec3 = [(min[0] + max[0]) / 2, ((min[1] + max[1]) / 2) * 0.85, (min[2] + max[2]) / 2];
    const [theta, phi] = VIEWS.top;
    const [w, h] = [320, 319];
    const one = framingDistance(min, max, target, theta, phi, tangents(w, h, { top: 56, bottom: 56, side: 16 }));
    const two = framingDistance(min, max, target, theta, phi, tangents(w, h, { top: 96, bottom: 56, side: 16 }));
    expect(two).toBeGreaterThan(one);
    expect(margins(min, max, target, theta, phi, two, w, h).top).toBeGreaterThanOrEqual(96 - 0.01);
  });
});

describe("framing the camera clear of the controls over the 3D view", () => {
  const FOV = 35;
  const tanV = Math.tan((FOV * Math.PI) / 360);
  const VIEWS: Record<string, [number, number]> = { iso: [0.62, 1.13], front: [0, 1.45], right: [Math.PI / 2, 1.45], top: [0, 0.02] };
  const OPTS = { side: 16, air: 8 };
  const rect = (left: number, top: number, w: number, h: number): ScreenRect => ({ left, top, right: left + w, bottom: top + h });

  /** The controls as BuilderApp lays them out: `full` is the panel put away, with Edit design in the corner and the size badge raised over it. */
  function controls(w: number, h: number, full: boolean): ScreenRect[] {
    const out = [
      rect(12, 12, 78, 36), // Undo / Redo
      { left: 100, top: 12, right: w - 12, bottom: 48 }, // the view buttons' group, as wide as its box
      rect(12, h - 48, 187, 36), // Frame only / Person
    ];
    if (full) out.push(rect(w - 117, h - 64 - 27, 105, 27), rect(w - 144, h - 56, 132, 44));
    else out.push(rect(w - 117, h - 39, 105, 27));
    return out;
  }

  const CANVASES: [string, number, number, boolean][] = [
    ["phone", 390, 371, false],
    ["phone, panel away", 390, 788, true],
    ["phone sideways", 405, 334, false],
    ["phone sideways, panel away", 844, 334, true],
    ["desktop", 1000, 844, false],
    ["wide desktop", 1500, 844, false],
  ];

  const target = (min: Vec3, max: Vec3): Vec3 => [(min[0] + max[0]) / 2, ((min[1] + max[1]) / 2) * 0.85, (min[2] + max[2]) / 2];

  it("keeps every corner of the building off every control, and in from the sides", () => {
    for (const [name, d] of DESIGNS.slice(0, 6)) {
      const { min, max } = layoutBuilding(d).bounds;
      for (const [canvas, w, h, full] of CANVASES) {
        const overlays = controls(w, h, full);
        for (const [view, [theta, phi]] of Object.entries(VIEWS)) {
          const dist = framingClearOf(min, max, target(min, max), theta, phi, tanV, w, h, overlays, OPTS);
          const b = screenBounds(min, max, target(min, max), theta, phi, dist, tanV, w, h);
          const where = `${name}, ${view} view, ${canvas}`;
          expect(b.left, where).toBeGreaterThanOrEqual(16 - 0.01);
          expect(w - b.right, where).toBeGreaterThanOrEqual(16 - 0.01);
          for (const r of overlays) {
            const apart = b.right <= r.left + 0.01 || b.left >= r.right - 0.01 || b.bottom <= r.top + 0.01 || b.top >= r.bottom - 0.01;
            expect(apart, `${where}: overlaps ${JSON.stringify(r)}`).toBe(true);
          }
        }
      }
    }
  });

  it("doesn't shrink the barn for the size badge in the corner when the panel is put away on a phone held sideways", () => {
    const { min, max } = layoutBuilding(PRESETS.barn).bounds;
    const [w, h] = [844, 334];
    const [theta, phi] = VIEWS.iso;
    const t = target(min, max);
    const near = framingClearOf(min, max, t, theta, phi, tanV, w, h, controls(w, h, true), OPTS);
    // Every control taken as a band across the whole view, as before: the raised badge took 99 px off the bottom.
    const share = (px: number) => 1 - (2 * px) / h;
    const banded = framingDistance(min, max, t, theta, phi, { across: tanV * (w / h) * (1 - 32 / w), up: tanV * share(56), down: tanV * share(99) });
    expect(near).toBeLessThan(banded * 0.85);
    // Top view too.
    const [tt, tp] = VIEWS.top;
    expect(framingClearOf(min, max, t, tt, tp, tanV, w, h, controls(w, h, true), OPTS)).toBeLessThan(
      framingDistance(min, max, t, tt, tp, { across: tanV * (w / h) * (1 - 32 / w), up: tanV * share(56), down: tanV * share(99) }) * 0.9,
    );
  });

  it("still clears a corner control the building reaches, as the chips under a desktop's top view", () => {
    const { min, max } = layoutBuilding(PRESETS.garage).bounds;
    const [w, h] = [1500, 844];
    const [theta, phi] = VIEWS.top;
    const chips = rect(12, h - 48, 187, 36);
    const dist = framingClearOf(min, max, target(min, max), theta, phi, tanV, w, h, [chips], OPTS);
    const b = screenBounds(min, max, target(min, max), theta, phi, dist, tanV, w, h);
    expect(b.bottom <= chips.top || b.left >= chips.right).toBe(true);
  });
});

describe("the camera's time step", () => {
  it("caps the first step after a pause, so a move eases in", () => {
    expect(steadyStep(4)).toBe(MAX_CAMERA_STEP);
    expect(steadyStep(0.5)).toBe(MAX_CAMERA_STEP);
  });

  it("keeps a slow phone's real step mid-move, so its glide doesn't run in slow motion", () => {
    expect(steadyStep(1 / 60)).toBe(1 / 60);
    expect(steadyStep(0.15)).toBe(0.15);
  });
});

describe("the door and window label in 3D", () => {
  it("sits over its door, and slides in from a side of the view rather than run off it", () => {
    expect(keepLabelInside(200, 180, 400, 8)).toBe(200);
    expect(keepLabelInside(380, 180, 400, 8)).toBe(400 - 98);
    expect(keepLabelInside(-20, 180, 400, 8)).toBe(98);
    // Wider than the view: centred.
    expect(keepLabelInside(10, 500, 400, 8)).toBe(200);
  });

  const lay = layoutBuilding(PRESETS.garage);
  const front = lay.openings.find((o) => o.side === "front")!;
  const right = lay.openings.find((o) => o.side === "right")!;

  it("shows only while its wall faces the camera", () => {
    expect(openingFaces(front, [10, 12, 60])).toBe(true);
    expect(openingFaces(front, [10, 12, -60])).toBe(false);
    expect(openingFaces(right, [60, 12, 0])).toBe(true);
    expect(openingFaces(right, [-60, 12, 0])).toBe(false);
  });

  it("hides on every wall from straight overhead, where walls are seen edge on", () => {
    for (const o of lay.openings) expect(openingFaces(o, [0, 90, 1.8]), o.side).toBe(false);
  });
});

describe("letting go of a door or window", () => {
  beforeEach(() => useBuilder.setState({ design: structuredClone(PRESETS.garage), section: "openings", selected: "d1", dragging: null }));

  const key = (k: string, target: object | null = null, defaultPrevented = false) =>
    ({ key: k, target: target as EventTarget | null, defaultPrevented });

  it("keeps it selected on the Doors and windows step, and lets go on leaving it", () => {
    useBuilder.getState().setSection("openings");
    expect(useBuilder.getState().selected).toBe("d1");
    useBuilder.getState().setSection("colors");
    expect(useBuilder.getState().selected).toBeNull();
  });

  it("keeps a door picked in 3D from another step, which opens the Doors and windows step", () => {
    useBuilder.setState({ section: "review", selected: null });
    const s = useBuilder.getState();
    s.select("d2");
    s.setSection("openings");
    expect(useBuilder.getState()).toMatchObject({ section: "openings", selected: "d2" });
  });

  it("lets go on Escape", () => {
    deselectOnEscape(key("Escape"));
    expect(useBuilder.getState().selected).toBeNull();
  });

  it("lets go on Escape from a slider or a button", () => {
    deselectOnEscape(key("Escape", { tagName: "INPUT", type: "range" }));
    expect(useBuilder.getState().selected).toBeNull();
    useBuilder.setState({ selected: "d1" });
    deselectOnEscape(key("Escape", { tagName: "BUTTON" }));
    expect(useBuilder.getState().selected).toBeNull();
  });

  it("leaves Escape to a text field", () => {
    for (const target of [{ tagName: "INPUT", type: "text" }, { tagName: "INPUT", type: "number" }, { tagName: "TEXTAREA" }, { tagName: "DIV", isContentEditable: true }]) {
      deselectOnEscape(key("Escape", target));
      expect(useBuilder.getState().selected, target.tagName).toBe("d1");
    }
  });

  it("ignores other keys, an Escape something else already used, and Escape mid-drag", () => {
    deselectOnEscape(key("Enter"));
    deselectOnEscape(key("Escape", null, true));
    expect(useBuilder.getState().selected).toBe("d1");
    useBuilder.setState({ dragging: "d1" });
    deselectOnEscape(key("Escape"));
    expect(useBuilder.getState().selected).toBe("d1");
  });
});
