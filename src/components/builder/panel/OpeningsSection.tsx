"use client";

import { useEffect, useState } from "react";

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
import type { Opening } from "@/lib/builder/design";
import { fmt, openingRange, placeOpening, slideOpening, wallState, wallsForOpening } from "@/lib/builder/rules";

import { DraggablePlan } from "../DraggablePlan";
import { useBuilder } from "../store";
import { Notice, SectionShell, Stepper, focusHeading, textAction } from "./controls";

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
        edit((x) => ({ ...x, openings: [...x.openings, o] }));
        select(o.id);
        setNotice(null);
        return;
      }
    }
    setNotice({ text: `No enclosed wall has room for a ${OPENING_KIND_LABEL[kind].toLowerCase()}. Enclose another wall or make the building bigger.` });
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

  function remove(o: Opening) {
    edit((x) => ({ ...x, openings: x.openings.filter((y) => y.id !== o.id) }));
    if (selected === o.id) select(null);
    if (cardNotice?.id === o.id) setCardNotice(null);
    focusHeading();
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
      lede="Add them here, then drag them along the wall in the 3D view or on the plan below. Tap one to select it."
    >
      <div className="grid grid-cols-3 gap-2">
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
        return (
          <div
            key={o.id}
            data-opening={o.id}
            role="group"
            aria-label={`${OPENING_KIND_LABEL[spec.kind]} ${spec.label}, ${SIDE_LABEL[o.wall].toLowerCase()} wall, ${fmt(o.x)} ft from the left corner`}
            onFocusCapture={() => select(o.id)}
            onClick={() => select(o.id)}
            className={`relative flex flex-col gap-4 rounded-[10px] border-2 p-4 transition-colors ${
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
                aria-label={`Remove ${OPENING_KIND_LABEL[spec.kind].toLowerCase()} ${spec.label} from the ${SIDE_LABEL[o.wall].toLowerCase()} wall, ${fmt(o.x)} ft from the left corner`}
                onClick={(e) => {
                  e.stopPropagation();
                  remove(o);
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
                label="From the left corner"
                value={o.x}
                min={range.min}
                max={range.max}
                step={0.5}
                onChange={(x) => update(o, { x })}
                onLimit={(edge) => {
                  const { blocked } = slideOpening(d, o, edge === "min" ? range.min - 0.5 : range.max + 0.5);
                  if (blocked) notify(blocked.message, { flash: blocked.by });
                }}
                helper={`Measured to the ${spec.kind === "window" ? "window" : "door"}'s left edge, standing outside the ${SIDE_LABEL[o.wall].toLowerCase()} wall.`}
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
