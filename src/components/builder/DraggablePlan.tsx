"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";

import { PlanView, planWallEnds } from "./PlanView";
import { dragTo, endDrag, startDrag, type DragSession } from "./drag";
import { useBuilder } from "./store";

/**
 * The plan with its doors and windows draggable along their walls, for
 * fingers as well as a mouse. Used in the Doors and windows step and as the
 * whole view where 3D isn't available.
 */
export function DraggablePlan({ className }: { className?: string }) {
  const design = useBuilder((s) => s.design);
  const selected = useBuilder((s) => s.selected);
  const blocking = useBuilder((s) => s.flash?.id ?? null);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ session: DragSession; u0: number; pointerId: number; toPlan: DOMMatrix } | null>(null);

  // A finger on a door drags the door, not the panel: stop the page from
  // panning before the browser commits to it (touch-action on an SVG <g> is ignored).
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const onTouch = (e: TouchEvent) => {
      if ((e.target as Element | null)?.closest?.("[data-plan-opening]")) e.preventDefault();
    };
    el.addEventListener("touchstart", onTouch, { passive: false });
    return () => el.removeEventListener("touchstart", onTouch);
  }, []);

  /**
   * The pointer, in feet along the opening's wall from its left corner,
   * through the screen-to-plan transform taken when the drag began, so the
   * panel scrolling under the pointer can't move it.
   */
  const alongWall = (id: string, e: { clientX: number; clientY: number }, toPlan: DOMMatrix): number | null => {
    const o = useBuilder.getState().design.openings.find((x) => x.id === id);
    if (!o) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(toPlan);
    const [ax, az, bx, bz] = planWallEnds(useBuilder.getState().design, o.wall);
    const len = Math.hypot(bx - ax, bz - az) || 1;
    return ((p.x - ax) * (bx - ax) + (p.y - az) * (bz - az)) / len;
  };

  const onGrab = (id: string, e: ReactPointerEvent<SVGGElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const ctm = svg.current?.getScreenCTM();
    if (!ctm) return;
    const toPlan = ctm.inverse();
    const u0 = alongWall(id, e, toPlan);
    if (u0 == null) return;
    const session = startDrag(id, "plan");
    if (!session) return;
    e.preventDefault();
    svg.current?.setPointerCapture(e.pointerId);
    drag.current = { session, u0, pointerId: e.pointerId, toPlan };
  };
  const onMove = (e: ReactPointerEvent<Element>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const u = alongWall(d.session.id, e, d.toPlan);
    if (u != null) dragTo(d.session, d.session.x0 + (u - d.u0));
  };
  const onEnd = (e: ReactPointerEvent<Element>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    drag.current = null;
    endDrag();
  };

  return (
    <div onPointerMove={onMove} onPointerUp={onEnd} onPointerCancel={onEnd} onLostPointerCapture={onEnd} className="contents">
      <PlanView design={design} className={className} interactive={{ selected, blocking, onGrab, svgRef: svg }} />
    </div>
  );
}
