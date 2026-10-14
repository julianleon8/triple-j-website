"use client";

import { useState } from "react";

import { PillGroup } from "@/components/forge/form";
import { SIDES, SIDE_LABEL, WALL_STATE_LABEL, type Side, type WallState } from "@/lib/builder/catalog";
import { wallState, wallStatesFor } from "@/lib/builder/rules";

import { PlanView } from "../PlanView";
import { useBuilder } from "../store";
import { Notice, SectionShell } from "./controls";

type Pending = { sides: Side[]; state: WallState; count: number };

export function WallsSection() {
  const d = useBuilder((s) => s.design);
  const edit = useBuilder((s) => s.edit);
  const announce = useBuilder((s) => s.announce);
  const [pending, setPending] = useState<Pending | null>(null);

  function apply(sides: Side[], state: WallState, dropOpenings: boolean) {
    edit((x) => ({
      ...x,
      walls: { ...x.walls, ...Object.fromEntries(sides.map((s) => [s, state])) },
      openings: dropOpenings ? x.openings.filter((o) => !sides.includes(o.wall)) : x.openings,
    }));
    setPending(null);
  }

  function request(sides: Side[], state: WallState) {
    const affected = state === "enclosed" ? 0 : d.openings.filter((o) => sides.includes(o.wall)).length;
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
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-[10px] border border-forge-silver bg-white p-3">
        <PlanView design={d} labels={false} className="h-[120px] w-full" />
        <div className="flex flex-col gap-2">
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

      {pending ? (
        <Notice action={{ label: `Remove ${pending.count === 1 ? "it" : "them"} and change the wall`, onClick: () => apply(pending.sides, pending.state, true) }}>
          {pendingMessage(pending.count, pending.sides)}
        </Notice>
      ) : null}

      {SIDES.map((side) => (
        <PillGroup<WallState>
          key={side}
          label={SIDE_LABEL[side]}
          value={wallState(d, side)}
          onChange={(v) => v && request([side], v)}
          options={wallStatesFor(d, side).map((s) => ({ v: s, label: WALL_STATE_LABEL[s] }))}
        />
      ))}
    </SectionShell>
  );
}

function pendingMessage(count: number, sides: Side[]): string {
  const where = sides.length === 1 ? `the ${SIDE_LABEL[sides[0]].toLowerCase()} wall` : "those walls";
  return count === 1
    ? `A door or window sits in ${where}. It needs an enclosed wall.`
    : `${count} doors and windows sit in ${where}. They need an enclosed wall.`;
}
