"use client";

import { useState } from "react";

import { FieldLabel, PillGroup } from "@/components/forge/form";
import {
  LIMITS,
  SIDES,
  SIDE_LABEL,
  STORAGE_ENDS,
  STORAGE_MIN_REST,
  WALL_STATE_LABEL,
  type Side,
  type StorageEnd,
  type WallState,
} from "@/lib/builder/catalog";
import type { Design, Storage } from "@/lib/builder/design";
import { canAddStorage, maxStorageDepth, newStorageDepth, wallState, wallStatesFor } from "@/lib/builder/rules";

import { PlanView } from "../PlanView";
import { useBuilder } from "../store";
import { Helper, Notice, PRICED_IN_QUOTE, SectionShell, Stepper, focusHeading, textAction } from "./controls";

type Pending = { sides: Side[]; state: WallState; count: number };

/**
 * The design with these walls set, and the doors and windows the change
 * would leave on a wall that isn't enclosed. The storage room's end wall
 * stays enclosed whatever it is set to, so its doors stay.
 */
function withWalls(x: Design, sides: Side[], state: WallState) {
  const next: Design = { ...x, walls: { ...x.walls, ...Object.fromEntries(sides.map((s) => [s, state])) } };
  return { next, stranded: x.openings.filter((o) => sides.includes(o.wall) && wallState(next, o.wall) !== "enclosed") };
}

export function WallsSection() {
  const d = useBuilder((s) => s.design);
  const edit = useBuilder((s) => s.edit);
  const announce = useBuilder((s) => s.announce);
  const [pending, setPending] = useState<Pending | null>(null);

  function apply(sides: Side[], state: WallState, dropOpenings: boolean) {
    edit((x) => {
      const { next, stranded } = withWalls(x, sides, state);
      return dropOpenings ? { ...next, openings: x.openings.filter((o) => !stranded.includes(o)) } : next;
    });
    setPending(null);
  }

  function request(sides: Side[], state: WallState) {
    const affected = withWalls(d, sides, state).stranded.length;
    if (affected) {
      setPending({ sides, state, count: affected });
      announce(pendingMessage(affected, sides));
    } else apply(sides, state, false);
  }

  return (
    <SectionShell
      id="walls"
      title="Walls"
      lede="Leave it open, close the top, or enclose it. Doors and windows go in enclosed walls."
    >
      {/* The wall names are sized for a plan about 200px wide. Beside the
          buttons on a narrow phone it would be 140px and they would shrink to
          8px, so there the plan takes the whole row and the buttons go under it. */}
      <div className="@container">
        <div className="grid grid-cols-1 items-center gap-3 rounded-[10px] border border-forge-silver bg-white p-3 @min-[330px]:grid-cols-[minmax(0,1fr)_auto] @min-[330px]:gap-4">
          <PlanView design={d} labels="sides" className="h-[120px] w-full" />
          <div className="grid grid-cols-2 gap-2 @min-[330px]:grid-cols-1">
            <button
              type="button"
              onClick={() => request([...SIDES], "open")}
              className="h-10 cursor-pointer rounded-[6px] border border-forge-silver bg-white px-3 text-[13px] font-semibold text-forge-navy hover:border-forge-navy"
            >
              Open all
            </button>
            <button
              type="button"
              onClick={() => request([...SIDES], "enclosed")}
              className="h-10 cursor-pointer rounded-[6px] border border-forge-silver bg-white px-3 text-[13px] font-semibold text-forge-navy hover:border-forge-navy"
            >
              Enclose all
            </button>
          </div>
        </div>
      </div>

      {pending ? (
        <Notice action={{ label: `Remove ${pending.count === 1 ? "it" : "them"} and change the wall`, onClick: () => apply(pending.sides, pending.state, true) }}>
          {pendingMessage(pending.count, pending.sides)}
        </Notice>
      ) : null}

      {SIDES.map((side) =>
        d.storage?.end === side ? (
          <div key={side}>
            <FieldLabel as="p">{SIDE_LABEL[side]}</FieldLabel>
            <p className="text-[14px] leading-[1.5] text-forge-navy">Enclosed. It&apos;s the storage room&apos;s end wall.</p>
          </div>
        ) : (
          <PillGroup<WallState>
            key={side}
            label={SIDE_LABEL[side]}
            value={wallState(d, side)}
            onChange={(v) => v && request([side], v)}
            options={wallStatesFor(d, side).map((s) => ({ v: s, label: WALL_STATE_LABEL[s] }))}
          />
        ),
      )}

      <StorageRoom />
    </SectionShell>
  );
}

function pendingMessage(count: number, sides: Side[]): string {
  const where = sides.length === 1 ? `the ${SIDE_LABEL[sides[0]].toLowerCase()} wall` : "those walls";
  return count === 1
    ? `A door or window sits in ${where}. It needs an enclosed wall.`
    : `${count} doors and windows sit in ${where}. They need an enclosed wall.`;
}

/**
 * The end wall a storage room leaves: back to its own setting, unless doors
 * or windows went in while the room enclosed it. Then it stays enclosed, so
 * they stay.
 */
function wallsAfterRoom(x: Design, end: StorageEnd): Design["walls"] {
  return x.openings.some((o) => o.wall === end) ? { ...x.walls, [end]: "enclosed" } : x.walls;
}

/** Add, move, size or remove the storage room. */
function StorageRoom() {
  const d = useBuilder((s) => s.design);
  const edit = useBuilder((s) => s.edit);
  const notify = useBuilder((s) => s.notify);
  const [notice, setNotice] = useState<string | null>(null);
  const room = d.storage;
  const max = maxStorageDepth(d);

  /** At the end the customer picks; a refusal says why, so they can try the other end. */
  function add(end: StorageEnd) {
    const can = canAddStorage(d);
    if (!can.ok) {
      setNotice(can.reason);
      notify(can.reason);
      return;
    }
    const r = edit((x) => ({ ...x, storage: { end, depth: newStorageDepth(x) } }));
    setNotice(r.ok ? null : r.issues[0].message);
  }
  function update(patch: Partial<Storage>, key: string) {
    const r = edit((x) => {
      if (!x.storage) return x;
      const next = { ...x.storage, ...patch };
      return { ...x, walls: next.end === x.storage.end ? x.walls : wallsAfterRoom(x, x.storage.end), storage: next };
    }, key);
    setNotice(r.ok ? null : r.issues[0].message);
  }
  function remove() {
    edit((x) => (x.storage ? { ...x, walls: wallsAfterRoom(x, x.storage.end), storage: null } : x));
    setNotice(null);
    focusHeading();
  }

  return (
    <div
      role="group"
      aria-label="Storage room"
      className={`flex flex-col gap-4 rounded-[10px] p-4 ${room ? "border-2 border-forge-navy" : "border border-forge-silver"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-forge-display text-[17px] font-bold text-forge-navy">Storage room</p>
          <p className="mt-1 text-[12px] leading-[1.45] text-forge-slate">
            A closed room across the full width at one end, with a walk door into it.
          </p>
          <Helper>{PRICED_IN_QUOTE}</Helper>
        </div>
        {room ? (
          <button type="button" onClick={remove} aria-label="Remove storage room" className={textAction}>
            Remove
          </button>
        ) : null}
      </div>
      {room ? null : (
        <div className="grid grid-cols-2 gap-2">
          {(["back", "front"] as const).map((end) => (
            <button
              key={end}
              type="button"
              onClick={() => add(end)}
              aria-label={`Add a storage room at the ${end}`}
              className="h-11 cursor-pointer rounded-[6px] border border-forge-navy bg-white px-3 text-[14px] font-semibold text-forge-navy transition-colors hover:bg-forge-fog"
            >
              + At the {end}
            </button>
          ))}
        </div>
      )}
      {notice ? <Notice>{notice}</Notice> : null}
      {room ? (
        <>
          <PillGroup<StorageEnd>
            label="End"
            value={room.end}
            onChange={(v) => v && update({ end: v }, "storage-end")}
            options={STORAGE_ENDS.map((e) => ({ v: e, label: SIDE_LABEL[e] }))}
          />
          <Stepper
            label="Depth"
            value={room.depth}
            min={LIMITS.storageDepth.min}
            max={Math.max(LIMITS.storageDepth.min, max)}
            onChange={(depth) => update({ depth }, "storage-depth")}
            onLimit={(edge) =>
              notify(
                edge === "min"
                  ? `${LIMITS.storageDepth.min} ft is the smallest storage room the builder takes.`
                  : `Any deeper and less than ${STORAGE_MIN_REST} ft of the building would be left. Make the building longer to go deeper.`,
              )
            }
            helper={`${d.length - room.depth} ft of the building is left outside it.`}
          />
        </>
      ) : null}
    </div>
  );
}
