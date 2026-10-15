/**
 * Dragging a door or window along its wall, shared by the 3D view and the
 * plan. Each surface turns the pointer into feet along the wall; this moves
 * the opening there in half-foot steps, stops it at a corner, a neighbour or
 * a wall that gets too low, and says which.
 */

import { slideOpening } from "@/lib/builder/rules";

import { useBuilder } from "./store";

export type DragSession = {
  id: string;
  /** Left edge when the drag began, in feet from the wall's left corner. */
  x0: number;
  /** One undo step per drag. */
  key: string;
  /** The last reason shown, so holding against a stop doesn't repeat it. */
  lastBlock: string | null;
};

let count = 0;

/** Null when the opening is gone (removed elsewhere since the pointer went down). */
export function startDrag(id: string, from: "plan" | "scene"): DragSession | null {
  const s = useBuilder.getState();
  const o = s.design.openings.find((x) => x.id === id);
  if (!o) return null;
  s.select(id);
  s.setDragging(id, from);
  count += 1;
  return { id, x0: o.x, key: `drag-${id}-${count}`, lastBlock: null };
}

/** Move the dragged opening toward `target` (its left edge, in feet along the wall). */
export function dragTo(session: DragSession, target: number) {
  const s = useBuilder.getState();
  const o = s.design.openings.find((x) => x.id === session.id);
  if (!o) return;
  const { x, blocked } = slideOpening(s.design, o, target);
  if (x !== o.x) {
    s.edit((d) => ({ ...d, openings: d.openings.map((y) => (y.id === o.id ? { ...y, x } : y)) }), session.key, { merge: true });
  }
  const block = blocked?.message ?? null;
  if (blocked && block !== session.lastBlock) s.notify(blocked.message, { flash: blocked.by });
  session.lastBlock = block;
}

export function endDrag() {
  useBuilder.getState().setDragging(null);
}
