/**
 * A dimensioned top view of a design, as plain SVG. No client code, so it
 * renders in HQ's server components as well as in the builder, where it is
 * also the whole view on a device without WebGL.
 */

import type { PointerEvent as ReactPointerEvent, Ref } from "react";

import { OPENING_KIND_LABEL, SIDE_LABEL, openingSpec, type Side } from "@/lib/builder/catalog";
import type { Design } from "@/lib/builder/design";
import { COL, buildingFrameLines, partitionZ } from "@/lib/builder/geometry";
import { openingPosition, wallState } from "@/lib/builder/rules";

type Tone = "light" | "dark";

const PALETTE: Record<Tone, { ink: string; muted: string; fill: string; lean: string; room: string; bg: string }> = {
  light: {
    ink: "#00182a",
    muted: "#788a9c",
    fill: "#f4f6f8",
    lean: "#ffffff",
    room: "#e4e9ee",
    bg: "#ffffff",
  },
  dark: {
    ink: "#e3e9ee",
    muted: "#8b9aa8",
    fill: "rgba(255,255,255,.05)",
    lean: "rgba(255,255,255,.02)",
    room: "rgba(255,255,255,.11)",
    bg: "transparent",
  },
};

const SHORT: Record<string, string> = { walk: "Walk door", win3x3: "Window" };
/** Same meanings as the 3D view: blue is selected, amber is in the way. */
const SELECTED = "#1e6bd6";
const BLOCKING = "#d97706";
/** Amber dark enough for text on white (5:1). */
const BLOCKING_TEXT = "#b45309";

/** A wall's two ends in plan (x, z), from its left corner as seen from outside. */
export function planWallEnds(d: Design, side: Side): [number, number, number, number] {
  const W = d.width / 2;
  const L = d.length / 2;
  const ends: Record<Side, [number, number, number, number]> = {
    front: [-W, L, W, L],
    back: [W, -L, -W, -L],
    left: [-W, -L, -W, L],
    right: [W, L, W, -L],
  };
  return ends[side];
}

/**
 * The draggable plan's label: each door and window where a customer measures
 * it, "Roll-up door 10×10, front wall, 4 ft from the left side".
 */
export function planLabel(d: Design): string {
  const said = d.openings.map((o) => {
    const spec = openingSpec(o.spec);
    return `. ${OPENING_KIND_LABEL[spec.kind]} ${spec.label}, ${SIDE_LABEL[o.wall].toLowerCase()} wall, ${openingPosition(d, o)}`;
  });
  return `${planName(d)}${said.join("")}`;
}

/** "Plan view, 30 by 30 feet, front at the bottom, storage room at the back". */
function planName(d: Design): string {
  const room = d.storage ? `, storage room at the ${d.storage.end}` : "";
  return `Plan view, ${d.width} by ${d.length} feet, front at the bottom${room}`;
}

/** Draggable doors and windows, in the builder only (HQ's plan is a picture). */
export type PlanInteraction = {
  selected: string | null;
  blocking: string | null;
  onGrab: (id: string, e: ReactPointerEvent<SVGGElement>) => void;
  svgRef: Ref<SVGSVGElement>;
};

/**
 * `labels={false}` drops all text, for thumbnails too small to read it;
 * `labels="sides"` keeps only the wall names, for the Walls step's small plan.
 */
export function PlanView({
  design: d,
  tone = "light",
  className,
  labels: labelMode = true,
  interactive,
}: {
  design: Design;
  tone?: Tone;
  className?: string;
  labels?: boolean | "sides";
  interactive?: PlanInteraction;
}) {
  const c = PALETTE[tone];
  const labels = labelMode === true;
  const sides = labelMode === "sides";
  const W = d.width / 2;
  const L = d.length / 2;
  const lean = (side: string) => d.leanTos.find((l) => l.side === side)?.depth ?? 0;
  const x0 = -W - lean("left");
  const x1 = W + lean("right");
  const z0 = -L - lean("back");
  const z1 = L + lean("front");
  const size = Math.max(x1 - x0, z1 - z0);
  const font = Math.max(1.4, size * 0.055);
  // Wall names read at about 12px in a plan 120px tall and 200px wide, whatever its shape.
  const sideFont = Math.max((z1 - z0) / 7, (x1 - x0) / 14);
  const pad = labels ? font * 4 : sides ? sideFont * 1.6 : Math.max(0.35, size * 0.012) * 3;
  const vb = `${x0 - pad} ${z0 - pad} ${x1 - x0 + pad * 2} ${z1 - z0 + pad * (sides ? 2 : 2.2)}`;
  const thick = Math.max(0.35, size * 0.012);
  const thin = thick / 3;

  const ends: Record<Side, [number, number, number, number]> = {
    front: planWallEnds(d, "front"),
    back: planWallEnds(d, "back"),
    left: planWallEnds(d, "left"),
    right: planWallEnds(d, "right"),
  };
  const along = (side: Side, u: number): [number, number] => {
    const [ax, az, bx, bz] = ends[side];
    const len = Math.hypot(bx - ax, bz - az);
    return [ax + ((bx - ax) * u) / len, az + ((bz - az) * u) / len];
  };

  const columns = buildingFrameLines(d).flatMap((z) => [-1, 1].map((sx) => [sx * (W - COL / 2), z] as [number, number]));
  // The storage room: from its end wall to its inner wall at zp, a walk door in the middle of that.
  const zp = partitionZ(d);
  const room = d.storage && zp !== null ? { zEnd: d.storage.end === "back" ? -L : L, zp, door: openingSpec("walk").w / 2 } : null;

  return (
    <svg
      ref={interactive?.svgRef}
      viewBox={vb}
      className={className}
      role="img"
      aria-label={interactive ? planLabel(d) : planName(d)}
      style={{ background: c.bg }}
    >
      {d.leanTos.map((l) => {
        // Side lean-tos run the length, front and back ones the width: an open corner where two meet.
        const r =
          l.side === "left"
            ? { x: -W - l.depth, y: -L, w: l.depth, h: d.length }
            : l.side === "right"
              ? { x: W, y: -L, w: l.depth, h: d.length }
              : l.side === "back"
                ? { x: -W, y: -L - l.depth, w: d.width, h: l.depth }
                : { x: -W, y: L, w: d.width, h: l.depth };
        return (
          <g key={l.side}>
            <rect
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              fill={c.lean}
              stroke={c.ink}
              strokeWidth={l.walls === "enclosed" ? thick : thin}
              strokeDasharray={l.walls === "enclosed" ? undefined : `${thick * 2} ${thick * 1.5}`}
            />
            {labels ? (
              <text
                x={r.x + r.w / 2}
                y={r.y + r.h / 2}
                fill={c.muted}
                fontSize={font * 0.8}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={l.side === "back" || l.side === "front" ? undefined : `rotate(-90 ${r.x + r.w / 2} ${r.y + r.h / 2})`}
              >
                Lean-to · {l.depth} ft
              </text>
            ) : null}
          </g>
        );
      })}

      <rect x={-W} y={-L} width={d.width} height={d.length} fill={c.fill} />
      {room ? (
        <rect x={-W} y={Math.min(room.zEnd, room.zp)} width={d.width} height={Math.abs(room.zp - room.zEnd)} fill={c.room} />
      ) : null}

      {(["front", "back", "left", "right"] as const).map((side) => {
        const state = wallState(d, side);
        const [ax, az, bx, bz] = ends[side];
        const heavy = state === "enclosed" || state === "partial";
        return (
          <line
            key={side}
            x1={ax}
            y1={az}
            x2={bx}
            y2={bz}
            stroke={heavy ? c.ink : c.muted}
            strokeWidth={heavy ? thick : thin}
            strokeDasharray={state === "partial" || state === "gable" ? `${thick * 2.5} ${thick * 1.5}` : undefined}
            strokeLinecap="square"
          />
        );
      })}

      {room ? (
        <g stroke={c.ink} strokeLinecap="square">
          {/* Its stretch of each side wall is closed in, whatever the rest of that wall is. */}
          {[-W, W].map((x) => (
            <line key={x} x1={x} y1={room.zEnd} x2={x} y2={room.zp} strokeWidth={thick} />
          ))}
          {/* The inner wall, broken for the walk door. */}
          <line x1={-W} y1={room.zp} x2={-room.door} y2={room.zp} strokeWidth={thick} />
          <line x1={room.door} y1={room.zp} x2={W} y2={room.zp} strokeWidth={thick} />
          <line x1={-room.door} y1={room.zp} x2={room.door} y2={room.zp} strokeWidth={thin} />
        </g>
      ) : null}
      {room && labels ? (
        <text
          x={0}
          y={(room.zEnd + room.zp) / 2}
          fill={c.muted}
          fontSize={font * 0.8}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          Storage · {d.storage?.depth} ft
        </text>
      ) : null}

      {columns.map(([x, z], i) => (
        <rect key={i} x={x - COL} y={z - COL} width={COL * 2} height={COL * 2} fill={c.ink} />
      ))}

      {d.openings.map((o) => {
        const spec = openingSpec(o.spec);
        const [ax, az] = along(o.wall, o.x);
        const [bx, bz] = along(o.wall, o.x + spec.w);
        const [mx, mz] = along(o.wall, o.x + spec.w / 2);
        const out = font * 1.25;
        // Labels sit just inside the wall, clear of the dimensions outside it.
        const offset: Record<Side, [number, number]> = {
          front: [0, -out],
          back: [0, out],
          left: [out, 0],
          right: [-out, 0],
        };
        const [ox, oz] = offset[o.wall];
        const vertical = o.wall === "left" || o.wall === "right";
        const mark = interactive?.blocking === o.id ? BLOCKING : interactive?.selected === o.id ? SELECTED : null;
        return (
          <g
            key={o.id}
            data-plan-opening={interactive ? o.id : undefined}
            onPointerDown={interactive ? (e) => interactive.onGrab(o.id, e) : undefined}
            style={interactive ? { cursor: "grab" } : undefined}
          >
            {mark ? (
              <line x1={ax} y1={az} x2={bx} y2={bz} stroke={mark} strokeWidth={thick * 3.2} strokeLinecap="round" opacity={0.9} />
            ) : null}
            <line
              x1={ax}
              y1={az}
              x2={bx}
              y2={bz}
              stroke={c.bg === "transparent" ? "#14181c" : c.bg}
              strokeWidth={thick * 1.6}
            />
            <line x1={ax} y1={az} x2={bx} y2={bz} stroke={c.ink} strokeWidth={thin} />
            {interactive ? (
              // A fat invisible line, 32 screen pixels whatever the plan's scale,
              // reaching past the ends: a finger-sized target for a thin mark.
              <line
                x1={ax}
                y1={az}
                x2={bx}
                y2={bz}
                stroke="transparent"
                strokeWidth={32}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                pointerEvents="stroke"
              />
            ) : null}
            {labels ? (
              <text
                x={mx + ox}
                y={mz + oz}
                fill={mark === BLOCKING ? BLOCKING_TEXT : (mark ?? c.ink)}
                fontWeight={mark ? 700 : undefined}
                fontSize={font * 0.8}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={vertical ? `rotate(-90 ${mx + ox} ${mz + oz})` : undefined}
              >
                {SHORT[o.spec] ?? spec.label}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* Dimensions */}
      {labels ? (
        <>
          <text x={0} y={z1 + pad * 0.62} fill={c.ink} fontSize={font} fontWeight={600} textAnchor="middle">
            {d.width} ft
          </text>
          <text
            x={0}
            y={z1 + pad * 1.15}
            fill={c.muted}
            fontSize={font * 0.75}
            textAnchor="middle"
            letterSpacing={font * 0.12}
          >
            FRONT
          </text>
          <text
            x={x1 + pad * 0.55}
            y={0}
            fill={c.ink}
            fontSize={font}
            fontWeight={600}
            textAnchor="middle"
            transform={`rotate(-90 ${x1 + pad * 0.55} 0)`}
          >
            {d.length} ft
          </text>
        </>
      ) : null}

      {sides ? (
        <g fill={c.ink} fontSize={sideFont} fontWeight={700} letterSpacing={sideFont * 0.08} textAnchor="middle">
          {(
            [
              ["FRONT", 0, z1 + pad / 2],
              ["BACK", 0, z0 - pad / 2],
              ["LEFT", x0 - pad / 2, 0],
              ["RIGHT", x1 + pad / 2, 0],
            ] as const
          ).map(([name, x, y]) => (
            <text
              key={name}
              x={x}
              y={y}
              dominantBaseline="middle"
              transform={name === "LEFT" || name === "RIGHT" ? `rotate(-90 ${x} ${y})` : undefined}
            >
              {name}
            </text>
          ))}
        </g>
      ) : null}
    </svg>
  );
}
