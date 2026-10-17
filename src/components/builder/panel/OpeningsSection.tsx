"use client";

import { useEffect, useRef, useState } from "react";

import { FieldLabel, PillGroup } from "@/components/forge/form";
import {
  MAX_OPENINGS,
  OPENING_KIND_LABEL,
  OPENING_SPECS,
  SIDES,
  SIDE_LABEL,
  openingSpec,
  type OpeningKind,
  type Side,
} from "@/lib/builder/catalog";
import type { Design, Opening } from "@/lib/builder/design";
import {
  openingName,
  openingPosition,
  openingRange,
  placeOpening,
  positionFrom,
  shownPosition,
  shownRange,
  slideOpening,
  storedPosition,
  wallState,
  wallsForOpening,
} from "@/lib/builder/rules";

import { DraggablePlan } from "../DraggablePlan";
import { useBuilder } from "../store";
import { Notice, SectionShell, Stepper, focusHeading, textAction } from "./controls";

/**
 * After a removal the next card slides up, its Remove button right under the
 * thumb: a second tap this soon is a double tap, not a second removal.
 */
export const REMOVE_GUARD_MS = 500;

/** Whether a Remove tapped at `at` is the second half of a double tap on the removal at `last` (event times, in ms). */
export function doubleTap(at: number, last: number): boolean {
  return at - last < REMOVE_GUARD_MS;
}

/** The card that takes focus after one is removed: the next, else the one before, else none (the add buttons do). */
export function focusAfterRemoval(ids: readonly string[], removed: string): string | null {
  const i = ids.indexOf(removed);
  if (i < 0) return null;
  return ids[i + 1] ?? ids[i - 1] ?? null;
}

const wallName = (side: Side) => `${SIDE_LABEL[side].toLowerCase()} wall`;

/** What the position field measures: "Measured from the front corner to the door's nearest edge." */
export function positionHelper(side: Side, thing: "door" | "window"): string {
  const seen = side === "front" || side === "back" ? ", as seen from the front," : "";
  return `Measured ${positionFrom(side)}${seen} to the ${thing}'s nearest edge.`;
}

/** Where each kind of opening goes first. */
const PREFERRED: Record<OpeningKind, Side[]> = {
  rollup: ["front", "back", "left", "right"],
  walk: ["right", "left", "front", "back"],
  window: ["left", "right", "back", "front"],
};
const FIRST_CHOICE: Record<OpeningKind, string[]> = {
  rollup: ["r10x10", "r8x8"],
  walk: ["walk"],
  window: ["win3x3"],
};
const ROLLUPS = OPENING_SPECS.filter((s) => s.kind === "rollup");

/**
 * Said when a new door or window lands on a wall other than the one the
 * customer would expect (the first enclosed one it prefers), or null.
 */
export function placedElsewhere(d: Design, kind: OpeningKind, o: Opening): string | null {
  const expected = PREFERRED[kind].find((s) => wallState(d, s) === "enclosed");
  if (!expected || o.wall === expected) return null;
  return `No room on the ${wallName(expected)}, so ${openingName(o).replace(/^The /, "the ")} went on the ${wallName(o.wall)}.`;
}

/** Said when no enclosed wall has room for a new door or window. */
export function noRoomFor(kind: OpeningKind): string {
  return `No enclosed wall has room for a ${OPENING_KIND_LABEL[kind].toLowerCase()}. Enclose another wall, make the building bigger, or ask for it in the quote form.`;
}

export function OpeningsSection() {
  const d = useBuilder((s) => s.design);
  const edit = useBuilder((s) => s.edit);
  const select = useBuilder((s) => s.select);
  const selected = useBuilder((s) => s.selected);
  const setSection = useBuilder((s) => s.setSection);
  const notify = useBuilder((s) => s.notify);
  const [notice, setNoticeState] = useState<{ text: string; toWalls?: boolean } | null>(null);
  const [cardNotice, setCardNoticeState] = useState<{ id: string; text: string } | null>(null);
  // Shown here, over the 3D view and read out (refused edits already are, by the store).
  const setNotice = (n: { text: string; toWalls?: boolean } | null) => {
    setNoticeState(n);
    if (n) notify(n.text);
  };
  const setCardNotice = (n: { id: string; text: string } | null) => setCardNoticeState(n);
  /** When the last Remove went through, for the double-tap guard. */
  const removedAt = useRef(-Infinity);
  /** Focus moved by script after a removal: the card it lands on isn't selected for it. */
  const refocusing = useRef(false);
  const addRow = useRef<HTMLDivElement>(null);

  const anyEnclosed = SIDES.some((s) => wallState(d, s) === "enclosed");

  function add(kind: OpeningKind) {
    if (d.openings.length >= MAX_OPENINGS) {
      setNotice({ text: `${MAX_OPENINGS} doors and windows is the most the builder takes. Note the rest when you ask for your quote.` });
      return;
    }
    if (!anyEnclosed) {
      setNotice({ text: "Doors and windows go in enclosed walls. Enclose a wall first.", toWalls: true });
      return;
    }
    for (const spec of FIRST_CHOICE[kind]) {
      const o = placeOpening(d, spec, PREFERRED[kind]);
      if (o) {
        if (!edit((x) => ({ ...x, openings: [...x.openings, o] })).ok) return;
        select(o.id);
        setNotice(null);
        const elsewhere = placedElsewhere(d, kind, o);
        if (elsewhere) notify(elsewhere, { tone: "info" });
        return;
      }
    }
    setNotice({ text: noRoomFor(kind) });
  }

  function update(o: Opening, patch: Partial<Opening>) {
    const r = edit((x) => ({ ...x, openings: x.openings.map((y) => (y.id === o.id ? { ...y, ...patch } : y)) }), `opening-${o.id}`);
    setCardNotice(r.ok ? null : { id: o.id, text: r.issues[0].message });
  }

  function move(o: Opening, wall: Side) {
    if (wall === o.wall) return;
    const others = { ...d, openings: d.openings.filter((x) => x.id !== o.id) };
    const spot = placeOpening(others, o.spec, [wall]);
    if (!spot) {
      const text = `There isn't room on the ${SIDE_LABEL[wall].toLowerCase()} wall.`;
      notify(text);
      return setCardNotice({ id: o.id, text });
    }
    update(o, { wall, x: spot.x });
  }

  function resize(o: Opening, spec: string) {
    // Tried in place first, quietly: if it doesn't fit there, it moves.
    const r = edit((x) => ({ ...x, openings: x.openings.map((y) => (y.id === o.id ? { ...y, spec } : y)) }), undefined, { quiet: true });
    if (r.ok) return setCardNotice(null);
    // Same wall, new spot that fits the new size.
    const others = { ...d, openings: d.openings.filter((x) => x.id !== o.id) };
    const spot = placeOpening(others, spec, [o.wall]);
    if (spot) {
      edit((x) => ({ ...x, openings: x.openings.map((y) => (y.id === o.id ? { ...y, spec, x: spot.x } : y)) }));
      setCardNotice(null);
    } else {
      notify(r.issues[0].message, { flash: o.id });
      setCardNotice({ id: o.id, text: r.issues[0].message });
    }
  }

  /** `at`: the tap's event time, for the double-tap guard. */
  function remove(o: Opening, at: number) {
    if (doubleTap(at, removedAt.current)) return;
    const next = focusAfterRemoval(d.openings.map((x) => x.id), o.id);
    if (!edit((x) => ({ ...x, openings: x.openings.filter((y) => y.id !== o.id) })).ok) return;
    removedAt.current = at;
    if (selected === o.id) select(null);
    if (cardNotice?.id === o.id) setCardNotice(null);
    // The pressed button is gone. Focus goes where the eye does: the card that
    // took its place (or the one above, after the last), or the add buttons once none are left.
    requestAnimationFrame(() => {
      const el = next
        ? document.querySelector<HTMLElement>(`[data-opening="${next}"]`)
        : addRow.current?.querySelector<HTMLElement>("button");
      if (!el) return focusHeading();
      refocusing.current = true;
      el.focus({ preventScroll: true });
      refocusing.current = false;
      el.scrollIntoView({ block: "nearest" });
    });
  }

  // A door tapped in the 3D view scrolls its card into view. One frame later,
  // because opening this step scrolls the panel to its top first. Not while
  // it's being dragged on the plan: the plan would scroll out from under the finger.
  useEffect(() => {
    if (!selected || useBuilder.getState().dragFrom === "plan") return;
    const id = requestAnimationFrame(() =>
      document.querySelector(`[data-opening="${selected}"]`)?.scrollIntoView({ block: "nearest" }),
    );
    return () => cancelAnimationFrame(id);
  }, [selected]);

  return (
    <SectionShell
      id="openings"
      title="Doors and windows"
      lede="Add them here. Drag one along its wall in the 3D view or on the plan below, or set the distance in its card. Tap one to select it."
    >
      <div ref={addRow} className="grid grid-cols-3 gap-2">
        {(["rollup", "walk", "window"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => add(k)}
            className="flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border border-forge-navy bg-white px-2 text-[13px] font-semibold text-forge-navy transition-colors hover:bg-forge-fog"
          >
            <span aria-hidden="true">+</span> {OPENING_KIND_LABEL[k]}
          </button>
        ))}
      </div>
      {notice ? (
        <Notice action={notice.toWalls ? { label: "Go to walls", onClick: () => setSection("walls") } : undefined}>{notice.text}</Notice>
      ) : null}
      {d.openings.length ? (
        <div>
          <DraggablePlan className="h-[220px] w-full rounded-[10px] border border-forge-mist" />
          <p className="mt-2 text-[12px] leading-[1.45] text-forge-slate">Drag a door or window along its wall. Front is at the bottom.</p>
        </div>
      ) : null}

      {d.openings.length === 0 ? (
        <p className="text-[14px] leading-[1.55] text-forge-slate">
          {anyEnclosed ? "No doors or windows yet." : "This build has no enclosed walls, so it has no doors or windows. That's normal for a carport."}
        </p>
      ) : null}

      {d.openings.map((o) => {
        const spec = openingSpec(o.spec);
        const range = openingRange(d, o);
        const on = selected === o.id;
        const walls = wallsForOpening(d, o);
        // Shown and typed the way a customer measures it (positionFrom); stored as the left edge seen from outside.
        const from = positionFrom(o.wall);
        const at = shownPosition(d, o, o.x);
        const shown = shownRange(d, o, range);
        const where = openingPosition(d, o);
        return (
          <div
            key={o.id}
            data-opening={o.id}
            role="group"
            tabIndex={-1}
            aria-label={`${OPENING_KIND_LABEL[spec.kind]} ${spec.label}, ${wallName(o.wall)}, ${where}`}
            onFocusCapture={() => {
              if (!refocusing.current) select(o.id);
            }}
            onClick={() => select(o.id)}
            // scroll-mt-4: scrolled to the top of the panel, its Selected badge (above the border) stays in view.
            className={`relative flex scroll-mt-4 flex-col gap-4 rounded-[10px] border-2 p-4 transition-colors ${
              on ? "border-[#1e6bd6] bg-[#f2f7fe] shadow-[0_0_0_3px_rgba(30,107,214,.18)]" : "border-forge-silver bg-white"
            }`}
          >
            {/* On the border, so selecting a card never moves the control under the pointer. */}
            {on ? (
              <p className="absolute -top-[11px] left-3.5 m-0 inline-flex items-center rounded-full bg-[#1e6bd6] px-2 py-[3px] text-[10px] font-bold uppercase leading-none tracking-[.14em] text-white">
                Selected
              </p>
            ) : null}
            <div className="flex items-start justify-between gap-3">
              <p className="font-forge-display text-[17px] font-bold leading-[1.2] text-forge-navy">
                {OPENING_KIND_LABEL[spec.kind]}
                <span className="ml-2 font-sans text-[13px] font-semibold text-forge-slate">{spec.label}</span>
              </p>
              <button
                type="button"
                aria-label={`Remove ${OPENING_KIND_LABEL[spec.kind].toLowerCase()} ${spec.label} from the ${wallName(o.wall)}, ${where}`}
                onClick={(e) => {
                  e.stopPropagation();
                  remove(o, e.timeStamp);
                }}
                className={textAction}
              >
                Remove
              </button>
            </div>
            {spec.kind === "rollup" ? (
              <PillGroup
                label="Size (W × H, ft)"
                value={o.spec}
                tabular
                onChange={(v) => v && resize(o, v)}
                options={ROLLUPS.map((r) => ({ v: r.id, label: r.label }))}
              />
            ) : null}
            <PillGroup<Side>
              label="Wall"
              value={o.wall}
              onChange={(v) => v && move(o, v)}
              options={walls.map((w) => ({ v: w, label: SIDE_LABEL[w] }))}
            />
            <div>
              <Stepper
                label={from.replace(/^f/, "F")}
                value={at}
                min={shown.min}
                max={shown.max}
                step={0.5}
                onChange={(v) => update(o, { x: storedPosition(d, o, v) })}
                onLimit={(edge) => {
                  const past = edge === "min" ? shown.min - 0.5 : shown.max + 0.5;
                  const { blocked } = slideOpening(d, o, storedPosition(d, o, past));
                  if (blocked) notify(blocked.message, { flash: blocked.by });
                }}
                helper={positionHelper(o.wall, spec.kind === "window" ? "window" : "door")}
              />
            </div>
            {cardNotice?.id === o.id ? <Notice>{cardNotice.text}</Notice> : null}
          </div>
        );
      })}
      {d.openings.length ? (
        <FieldLabel as="p">
          {d.openings.length} of {MAX_OPENINGS} · walls keep 1 ft at each corner and between openings
        </FieldLabel>
      ) : null}
    </SectionShell>
  );
}
