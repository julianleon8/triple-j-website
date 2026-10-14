import type { SectionId } from "../store";

/** The builder's steps, in order. Visitors can jump to any of them. */
export const SECTIONS: readonly { id: SectionId; label: string }[] = [
  { id: "start", label: "Start" },
  { id: "size", label: "Size & roof" },
  { id: "walls", label: "Walls" },
  { id: "openings", label: "Doors & windows" },
  { id: "leans", label: "Lean-tos" },
  { id: "colors", label: "Colors" },
  { id: "site", label: "Frame & site" },
  { id: "review", label: "Review & quote" },
];
