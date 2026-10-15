/**
 * The builder's design: one versioned, serializable object that the 3D view,
 * the plan drawing, the share link, the lead row and HQ all read. Nothing in
 * here knows about React or three.js.
 */

import { z } from "zod";

import {
  COLOR_SLUGS,
  CONCRETE,
  FRAMES,
  LEAN_SIDES,
  LIMITS,
  MAX_OPENINGS,
  OPENING_SPEC_IDS,
  ROOFS,
  SIDES,
  USES,
  WALL_STATES,
  type Use,
} from "./catalog";

const int = (r: { min: number; max: number }) => z.number().int().min(r.min).max(r.max);
const wallState = z.enum(WALL_STATES);
const color = z.enum(COLOR_SLUGS);

export const openingSchema = z.object({
  id: z.string().regex(/^[a-z0-9]{1,12}$/),
  spec: z.enum(OPENING_SPEC_IDS),
  wall: z.enum(SIDES),
  /** Left edge, in feet from the wall's left corner as seen from outside. */
  x: z.number().min(0).max(LIMITS.length.max),
});

export const leanToSchema = z.object({
  side: z.enum(LEAN_SIDES),
  depth: int(LIMITS.leanDepth),
  walls: z.enum(["open", "enclosed"]),
});

export const designSchema = z.object({
  v: z.literal(1),
  use: z.enum(USES),
  width: int(LIMITS.width),
  length: int(LIMITS.length),
  height: int(LIMITS.height),
  roof: z.enum(ROOFS),
  frame: z.enum(FRAMES),
  heavyDuty: z.boolean(),
  walls: z.object({ front: wallState, back: wallState, left: wallState, right: wallState }),
  openings: z.array(openingSchema).max(MAX_OPENINGS),
  leanTos: z.array(leanToSchema).max(2),
  /** `ridge` null: the ridge cap matches the roof, as the crew trims it unless asked otherwise. */
  colors: z.object({ roof: color, walls: color, trim: color, wainscot: color.nullable(), ridge: color.nullable().default(null) }),
  concrete: z.enum(CONCRETE),
}).refine((d) => new Set(d.openings.map((o) => o.id)).size === d.openings.length, {
  message: "Each door and window needs its own id.",
  path: ["openings"],
});

export type Design = z.infer<typeof designSchema>;
export type Opening = z.infer<typeof openingSchema>;
export type LeanTo = z.infer<typeof leanToSchema>;

const OPEN = { front: "open", back: "open", left: "open", right: "open" } as const;

/** Starting points, one per use. Every one is a sales-pack size. */
export const PRESETS: Record<Use, Design> = {
  carport: {
    v: 1,
    use: "carport",
    width: 20,
    length: 20,
    height: 10,
    roof: "gable",
    frame: "unsure",
    heavyDuty: false,
    walls: { ...OPEN },
    openings: [],
    leanTos: [],
    colors: { roof: "Pewter-Gray", walls: "Light-Stone", trim: "Charcoal", wainscot: null, ridge: null },
    concrete: "yes",
  },
  rv_cover: {
    v: 1,
    use: "rv_cover",
    width: 20,
    length: 40,
    height: 14,
    roof: "flat",
    frame: "unsure",
    heavyDuty: false,
    walls: { ...OPEN },
    openings: [],
    leanTos: [],
    colors: { roof: "Galvalume", walls: "Polar-White", trim: "Galvalume", wainscot: null, ridge: null },
    concrete: "yes",
  },
  garage: {
    v: 1,
    use: "garage",
    width: 30,
    length: 30,
    height: 10,
    roof: "gable",
    frame: "unsure",
    heavyDuty: false,
    walls: { front: "enclosed", back: "enclosed", left: "enclosed", right: "enclosed" },
    openings: [
      { id: "d1", spec: "r10x10", wall: "front", x: 4 },
      { id: "d2", spec: "r10x10", wall: "front", x: 16 },
      { id: "d3", spec: "walk", wall: "right", x: 4 },
      { id: "d4", spec: "win3x3", wall: "left", x: 13.5 },
    ],
    leanTos: [],
    colors: { roof: "Burnished-Slate", walls: "Light-Stone", trim: "Burnished-Slate", wainscot: "Burnished-Slate", ridge: null },
    concrete: "yes",
  },
  barn: {
    v: 1,
    use: "barn",
    width: 30,
    length: 40,
    height: 12,
    roof: "gable",
    frame: "unsure",
    heavyDuty: false,
    walls: { front: "enclosed", back: "enclosed", left: "enclosed", right: "enclosed" },
    openings: [
      { id: "d1", spec: "r12x12", wall: "front", x: 9 },
      { id: "d2", spec: "walk", wall: "back", x: 13.5 },
    ],
    leanTos: [
      { side: "left", depth: 12, walls: "open" },
      { side: "right", depth: 12, walls: "open" },
    ],
    colors: { roof: "Black", walls: "Polar-White", trim: "Black", wainscot: "Black", ridge: null },
    concrete: "unsure",
  },
};

export const DEFAULT_DESIGN: Design = PRESETS.carport;

export function cloneDesign(d: Design): Design {
  return structuredClone(d);
}
