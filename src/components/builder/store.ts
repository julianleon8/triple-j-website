"use client";

/**
 * Builder state shared by the controls and the 3D scene. The scene renders in
 * its own React reconciler, so it reads this store directly rather than
 * through context.
 */

import { create } from "zustand";

import { DEFAULT_DESIGN, type Design } from "@/lib/builder/design";
import { designIssues, normalizeDesign, type Issue } from "@/lib/builder/rules";

export type ViewName = "iso" | "front" | "back" | "left" | "right" | "top";
export type SectionId = "start" | "size" | "walls" | "openings" | "leans" | "colors" | "site" | "review";

const HISTORY_LIMIT = 50;
/** Edits to the same control this close together are one undo step (a slider drag). */
const COALESCE_MS = 800;

type Result = { ok: true } | { ok: false; issues: Issue[] };

type BuilderState = {
  design: Design;
  past: Design[];
  future: Design[];
  lastKey: string | null;
  lastAt: number;
  edits: number;
  section: SectionId;
  frameOnly: boolean;
  showPerson: boolean;
  selected: string | null;
  /** The latest message for screen readers; `seq` changes so a repeat is read again. */
  announcement: { text: string; seq: number };
  /** A shared link that could not be opened (malformed, cut off, or from an older version). */
  badLink: boolean;
  /** A request for the camera; `seq` changes on every request so the same view can be asked for twice. */
  camera: { view: ViewName | "fit"; seq: number };

  /** Apply an edit. Refused, with the reasons, if it would leave something that can't be built. */
  edit: (fn: (d: Design) => Design, key?: string) => Result;
  /** Swap in a whole design (a preset or a shared link). Undoable. */
  load: (d: Design) => void;
  undo: () => void;
  redo: () => void;
  setSection: (s: SectionId) => void;
  setFrameOnly: (on: boolean) => void;
  setShowPerson: (on: boolean) => void;
  select: (id: string | null) => void;
  look: (view: ViewName | "fit") => void;
  announce: (text: string) => void;
  dismissBadLink: () => void;
};

const same = (a: Design, b: Design) => JSON.stringify(a) === JSON.stringify(b);

export const useBuilder = create<BuilderState>()((set, get) => ({
  design: DEFAULT_DESIGN,
  past: [],
  future: [],
  lastKey: null,
  lastAt: 0,
  edits: 0,
  section: "start",
  frameOnly: false,
  showPerson: true,
  selected: null,
  camera: { view: "iso", seq: 0 },
  announcement: { text: "", seq: 0 },
  badLink: false,

  edit(fn, key) {
    const { design, past, lastKey, lastAt, edits } = get();
    const next = normalizeDesign(fn(structuredClone(design)));
    if (same(next, design)) return { ok: true };
    const before = new Set(designIssues(design).map((i) => i.message));
    const fresh = designIssues(next).filter((i) => !before.has(i.message));
    if (fresh.length) {
      get().announce(fresh[0].message);
      return { ok: false, issues: fresh };
    }
    const now = Date.now();
    const coalesce = key != null && key === lastKey && now - lastAt < COALESCE_MS;
    set({
      design: next,
      past: coalesce ? past : [...past, design].slice(-HISTORY_LIMIT),
      future: [],
      lastKey: key ?? null,
      lastAt: now,
      edits: edits + 1,
    });
    return { ok: true };
  },

  load(d) {
    const { design, past, edits } = get();
    const next = normalizeDesign(d);
    if (same(next, design)) return;
    set({
      design: next,
      past: [...past, design].slice(-HISTORY_LIMIT),
      future: [],
      lastKey: null,
      selected: null,
      edits: edits + 1,
      camera: { view: "fit", seq: get().camera.seq + 1 },
    });
  },

  undo() {
    const { past, design, future } = get();
    const prev = past.at(-1);
    if (!prev) return;
    set({ design: prev, past: past.slice(0, -1), future: [design, ...future], lastKey: null, selected: null });
  },

  redo() {
    const { past, design, future } = get();
    const next = future[0];
    if (!next) return;
    set({ design: next, past: [...past, design], future: future.slice(1), lastKey: null, selected: null });
  },

  setSection: (section) => set({ section }),
  setFrameOnly: (frameOnly) => set({ frameOnly }),
  setShowPerson: (showPerson) => set({ showPerson }),
  select: (selected) => set({ selected }),
  look: (view) => set({ camera: { view, seq: get().camera.seq + 1 } }),
  announce: (text) => set({ announcement: { text, seq: get().announcement.seq + 1 } }),
  dismissBadLink: () => set({ badLink: false }),
}));
