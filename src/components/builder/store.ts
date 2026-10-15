"use client";

/**
 * Builder state shared by the controls and the 3D scene. The scene renders in
 * its own React reconciler, so it reads this store directly rather than
 * through context.
 */

import { create } from "zustand";

import { DEFAULT_DESIGN, type Design } from "@/lib/builder/design";
import { designIssues, issueKey, normalizeDesign, type Issue } from "@/lib/builder/rules";

export type ViewName = "iso" | "front" | "back" | "left" | "right" | "top";
export type SectionId = "start" | "size" | "walls" | "openings" | "leans" | "colors" | "site" | "review";

const HISTORY_LIMIT = 50;
/** Edits to the same control this close together are one undo step (a slider drag). */
const COALESCE_MS = 800;

type Result = { ok: true } | { ok: false; issues: Issue[] };

/** How long an opening that is in the way stays lit in the 3D view. */
export const FLASH_MS = 1400;

export type Toast = { text: string; tone: "error" | "info"; seq: number };

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
  /** The same message, on screen over the 3D view. */
  toast: Toast | null;
  /** An opening to light up because it is what's in the way. */
  flash: { id: string; seq: number } | null;
  /** The opening being dragged, and where: on the plan the panel must not scroll under the finger. */
  dragging: string | null;
  dragFrom: "plan" | "scene" | null;
  /** A shared link that could not be opened (malformed, cut off, or from an older version). */
  badLink: boolean;
  /** A request for the camera; `seq` changes on every request so the same view can be asked for twice. */
  camera: { view: ViewName | "fit"; seq: number };

  /**
   * Apply an edit. Refused, with the reasons, if it would leave something that
   * can't be built. Edits sharing a `key` close together are one undo step;
   * `merge` keeps a whole drag as one step however long it pauses; `quiet`
   * refuses without saying so, for a try that has a fallback.
   */
  edit: (fn: (d: Design) => Design, key?: string, opts?: { merge?: boolean; quiet?: boolean }) => Result;
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
  /** Say it on screen and to screen readers, and light up what's in the way. */
  notify: (text: string, opts?: { tone?: Toast["tone"]; flash?: string }) => void;
  dismissToast: () => void;
  setDragging: (id: string | null, from?: "plan" | "scene") => void;
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
  toast: null,
  flash: null,
  dragging: null,
  dragFrom: null,
  badLink: false,

  edit(fn, key, opts) {
    const { design, past, lastKey, lastAt, edits } = get();
    const next = normalizeDesign(fn(structuredClone(design)));
    if (same(next, design)) return { ok: true };
    // Refused only for a problem the design did not already have: a design
    // opened with a problem (an old link or draft) can still be edited toward a fix.
    const before = new Set(designIssues(design).map(issueKey));
    const fresh = designIssues(next).filter((i) => !before.has(issueKey(i)));
    if (fresh.length) {
      if (!opts?.quiet) get().notify(fresh[0].message, { flash: fresh[0].openingId });
      return { ok: false, issues: fresh };
    }
    const now = Date.now();
    const coalesce = key != null && key === lastKey && (opts?.merge || now - lastAt < COALESCE_MS);
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
  notify(text, opts) {
    const seq = get().announcement.seq + 1;
    set({
      announcement: { text, seq },
      toast: { text, tone: opts?.tone ?? "error", seq },
      ...(opts?.flash ? { flash: { id: opts.flash, seq } } : {}),
    });
    if (opts?.flash) {
      setTimeout(() => {
        if (get().flash?.seq === seq) set({ flash: null });
      }, FLASH_MS);
    }
  },
  dismissToast: () => set({ toast: null }),
  setDragging: (dragging, from) => set({ dragging, dragFrom: dragging ? (from ?? "scene") : null }),
  dismissBadLink: () => set({ badLink: false }),
}));
