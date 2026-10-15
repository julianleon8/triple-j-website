"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  BackSide,
  BoxGeometry,
  DoubleSide,
  FrontSide,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Plane,
  Vector3,
  type Ray,
  type InstancedMesh,
  type Side,
} from "three";
import { useThree, type RootState, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import { FRAME_HEX, OPENING_KIND_LABEL, builderColor, openingSpec } from "@/lib/builder/catalog";
import type { Design } from "@/lib/builder/design";
import type { Layout, Member, OpeningPlacement, Surface } from "@/lib/builder/geometry";
import { fmt } from "@/lib/builder/rules";

import { dragTo, endDrag, startDrag, type DragSession } from "../drag";
import { useBuilder } from "../store";
import { panelGeometry } from "./panelGeometry";

const UNDERSIDE = "#c3c8cb";
const CONCRETE = "#b1ada4";
const DOOR_SLAB = "#ecebe6";
const WINDOW_FRAME = "#efefeb";
const GLASS = "#33434e";
/** Selected: the site's link blue on a white halo, readable on any wall color. */
const SELECTED = "#1e6bd6";
/** In the way: amber, like the warning message that names it. */
const BLOCKING = "#f59e0b";

function usePaint(hex: string, opts: { metallic?: boolean; side?: Side; roughness?: number } = {}) {
  const { metallic = false, side = FrontSide, roughness } = opts;
  const mat = useMemo(() => {
    const m = new MeshStandardMaterial({
      color: hex,
      metalness: metallic ? 0.75 : 0.3,
      roughness: roughness ?? (metallic ? 0.32 : 0.5),
      envMapIntensity: 0.6,
      side,
    });
    // Thin sheets cast from both faces, or the sun shines straight through a roof.
    m.shadowSide = DoubleSide;
    return m;
  }, [hex, metallic, side, roughness]);
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

const paintFor = (slug: string) => builderColor(slug);

export function Building({ design, layout }: { design: Design; layout: Layout }) {
  const frameOnly = useBuilder((s) => s.frameOnly);
  const selected = useBuilder((s) => s.selected);
  const flash = useBuilder((s) => s.flash?.id ?? null);
  const dragging = useBuilder((s) => s.dragging);
  const invalidate = useThree((s) => s.invalidate);
  // The canvas only draws on demand, and removing meshes alone does not ask for a frame.
  useEffect(() => invalidate(), [invalidate, layout, frameOnly, selected, flash, dragging, design.colors]);
  const roof = paintFor(design.colors.roof);
  const walls = paintFor(design.colors.walls);
  const trim = paintFor(design.colors.trim);
  const wainscot = paintFor(design.colors.wainscot ?? design.colors.walls);
  const ridge = paintFor(design.colors.ridge ?? design.colors.roof);

  const roofMat = usePaint(roof.hex, { metallic: roof.metallic });
  const wallMat = usePaint(walls.hex, { metallic: walls.metallic });
  const wainscotMat = usePaint(wainscot.hex, { metallic: wainscot.metallic });
  const trimMat = usePaint(trim.hex, { metallic: trim.metallic, roughness: 0.42 });
  const ridgeMat = usePaint(ridge.hex, { metallic: ridge.metallic, roughness: 0.42 });
  const doorMat = usePaint(trim.hex, { metallic: trim.metallic, side: DoubleSide, roughness: 0.45 });
  const insideMat = usePaint(UNDERSIDE, { metallic: true, side: BackSide, roughness: 0.55 });
  const frameMat = usePaint(FRAME_HEX, { roughness: 0.62 });

  const bySurface = useMemo(() => {
    const pick = (mat: Surface["mat"]) => layout.surfaces.filter((s) => s.mat === mat);
    return { roof: pick("roof"), wall: pick("wall"), wainscot: pick("wainscot") };
  }, [layout]);
  const frame = useMemo(() => layout.members.filter((m) => m.mat === "frame"), [layout]);
  const trimMembers = useMemo(() => layout.members.filter((m) => m.mat === "trim"), [layout]);
  const ridgeMembers = useMemo(() => layout.members.filter((m) => m.mat === "ridge"), [layout]);

  return (
    <group>
      {layout.slab ? <Slab slab={layout.slab} /> : null}
      <Members members={frame} material={frameMat} />
      {frameOnly ? null : (
        <>
          <Panels surfaces={bySurface.roof} outside={roofMat} inside={insideMat} />
          <Panels surfaces={bySurface.wall} outside={wallMat} inside={insideMat} />
          <Panels surfaces={bySurface.wainscot} outside={wainscotMat} inside={insideMat} />
          <Members members={trimMembers} material={trimMat} />
          {ridgeMembers.length ? <Members members={ridgeMembers} material={ridgeMat} /> : null}
          {layout.openings.map((o) => (
            <OpeningMesh
              key={o.id}
              o={o}
              doorMat={doorMat}
              trimMat={trimMat}
              selected={selected === o.id}
              blocking={flash === o.id}
              dragging={dragging === o.id}
            />
          ))}
        </>
      )}
    </group>
  );
}

// ── framing: one instanced draw call per material ──

const UNIT_BOX = new BoxGeometry(1, 1, 1);

function Members({ members, material }: { members: Member[]; material: MeshStandardMaterial }) {
  const ref = useRef<InstancedMesh>(null);
  // Capacity grows in steps, so a slider drag rarely rebuilds the mesh.
  const capacity = Math.max(64, Math.ceil(members.length / 64) * 64);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new Matrix4();
    const a = new Vector3();
    const b = new Vector3();
    const x = new Vector3();
    const y = new Vector3();
    const z = new Vector3();
    const up = new Vector3();
    members.forEach((mem, i) => {
      a.fromArray(mem.a);
      b.fromArray(mem.b);
      x.subVectors(b, a);
      const len = x.length() || 1e-3;
      x.divideScalar(len);
      if (mem.up) up.fromArray(mem.up);
      else if (Math.abs(x.y) > 0.99) up.set(0, 0, 1);
      else up.set(0, 1, 0);
      z.crossVectors(x, up).normalize();
      y.crossVectors(z, x);
      m.makeBasis(x.multiplyScalar(len), y.multiplyScalar(mem.d), z.multiplyScalar(mem.w));
      m.setPosition((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
      mesh.setMatrixAt(i, m);
    });
    mesh.count = members.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [members, capacity]);
  return (
    <instancedMesh
      key={capacity}
      ref={ref}
      args={[UNIT_BOX, material, capacity]}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}

// ── panels ──

function Panels({
  surfaces,
  outside,
  inside,
}: {
  surfaces: Surface[];
  outside: MeshStandardMaterial;
  inside: MeshStandardMaterial;
}) {
  const geo = useMemo(() => (surfaces.length ? panelGeometry(surfaces) : null), [surfaces]);
  useEffect(() => () => geo?.dispose(), [geo]);
  if (!geo) return null;
  return (
    <>
      <mesh geometry={geo} material={outside} castShadow receiveShadow />
      <mesh geometry={geo} material={inside} receiveShadow />
    </>
  );
}

function Slab({ slab }: { slab: NonNullable<Layout["slab"]> }) {
  const mat = usePaint(CONCRETE, { roughness: 0.92 });
  return (
    <mesh
      position={[(slab.x0 + slab.x1) / 2, slab.t / 2, (slab.z0 + slab.z1) / 2]}
      material={mat}
      receiveShadow
    >
      <boxGeometry args={[slab.x1 - slab.x0, slab.t, slab.z1 - slab.z0]} />
    </mesh>
  );
}

// ── doors and windows ──

/** Places children in the opening's own frame: x along the wall, y up, z out of the wall. */
function useOpeningMatrix(o: OpeningPlacement) {
  return useMemo(() => {
    const u = new Vector3(...o.uAxis);
    const n = new Vector3(...o.normal);
    const m = new Matrix4().makeBasis(u, new Vector3(0, 1, 0), n);
    m.setPosition(...o.origin);
    return m;
  }, [o]);
}

/**
 * The camera and the cursor for a drag: "drag" holds the camera still and
 * shows a closed hand; "hover" an open one; "idle" gives both back.
 */
function setGrab(get: () => RootState, state: "idle" | "hover" | "drag") {
  const { controls, gl } = get();
  if (controls) (controls as unknown as { enabled: boolean }).enabled = state !== "drag";
  gl.domElement.style.cursor = state === "drag" ? "grabbing" : state === "hover" ? "grab" : "";
}

/**
 * One door or window. Press and drag slides it along its wall: the pointer's
 * ray meets the wall's plane, and the distance moved along the wall is the
 * distance the opening moves. The camera holds still for the drag.
 */
function OpeningMesh({
  o,
  doorMat,
  trimMat,
  selected,
  blocking,
  dragging,
}: {
  o: OpeningPlacement;
  doorMat: MeshStandardMaterial;
  trimMat: MeshStandardMaterial;
  selected: boolean;
  blocking: boolean;
  dragging: boolean;
}) {
  const matrix = useOpeningMatrix(o);
  const get = useThree((s) => s.get);
  const drag = useRef<{ session: DragSession; plane: Plane; hit0: Vector3; u: Vector3; stop: () => void } | null>(null);
  const hovered = useRef(false);
  const normal = useMemo(() => new Vector3(...o.normal), [o]);
  // Only walls and roof with no handlers sit between the pointer and an
  // opening, so they hide nothing from it. A wall facing away from the camera
  // is behind the building: its openings can't be grabbed or hovered.
  const hidden = (ray: Ray) => ray.direction.dot(normal) >= 0;

  /** End the drag, however it ends. Safe to call twice. */
  const finish = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    d.stop();
    endDrag();
    setGrab(get, hovered.current ? "hover" : "idle");
  };

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (hidden(e.ray)) return;
    // On a touch screen the first tap only selects (onClick), so a finger
    // that lands on a door can still turn or pinch the view. Once it's
    // selected, it drags.
    if (e.pointerType !== "mouse" && !selected) return;
    const plane = new Plane().setFromNormalAndCoplanarPoint(normal, new Vector3(...o.origin));
    const hit0 = e.ray.intersectPlane(plane, new Vector3());
    if (!hit0) return;
    const session = startDrag(o.id, "scene");
    if (!session) return;
    e.stopPropagation();
    useBuilder.getState().setSection("openings");
    const target = e.target as Element;
    const pointerId = e.pointerId;
    target.setPointerCapture(pointerId);
    // The 3D library doesn't pass pointercancel or a lost capture on to the
    // object, so listen on the canvas itself; a second finger hands the
    // gesture back to the camera.
    const el = (get().events.connected ?? get().gl.domElement) as HTMLElement;
    const onEnd = (ev: PointerEvent) => ev.pointerId === pointerId && finish();
    const onSecond = (ev: PointerEvent) => ev.pointerId !== pointerId && finish();
    el.addEventListener("pointerup", onEnd);
    el.addEventListener("pointercancel", onEnd);
    el.addEventListener("lostpointercapture", onEnd);
    el.addEventListener("pointerdown", onSecond);
    const stop = () => {
      el.removeEventListener("pointerup", onEnd);
      el.removeEventListener("pointercancel", onEnd);
      el.removeEventListener("lostpointercapture", onEnd);
      el.removeEventListener("pointerdown", onSecond);
      try {
        target.releasePointerCapture(pointerId);
      } catch {
        // Already released.
      }
    };
    drag.current = { session, plane, hit0, u: new Vector3(...o.uAxis), stop };
    setGrab(get, "drag");
  };
  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current;
    if (!d) return;
    e.stopPropagation();
    // The button came up somewhere we didn't hear about.
    if (e.buttons === 0) return finish();
    const hit = e.ray.intersectPlane(d.plane, new Vector3());
    if (hit) dragTo(d.session, d.session.x0 + hit.sub(d.hit0).dot(d.u));
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6 || hidden(e.ray)) return;
    e.stopPropagation();
    const s = useBuilder.getState();
    s.select(o.id);
    s.setSection("openings");
  };
  // A drag cut short (the opening removed, Frame only turned on) gives the camera back.
  useEffect(
    () => () => {
      const d = drag.current;
      if (d) {
        d.stop();
        endDrag();
      }
      setGrab(get, "idle");
    },
    [get],
  );
  const slabMat = usePaint(DOOR_SLAB, { roughness: 0.6 });
  const frameMat = usePaint(WINDOW_FRAME, { roughness: 0.6 });
  const glassMat = useMemo(() => new MeshStandardMaterial({ color: GLASS, metalness: 0.2, roughness: 0.06, envMapIntensity: 0.9 }), []);
  useEffect(() => () => glassMat.dispose(), [glassMat]);
  const rollup = useMemo(() => (o.kind === "rollup" ? panelGeometry([rollupSurface(o)]) : null), [o]);
  useEffect(() => () => rollup?.dispose(), [rollup]);

  const { w, h } = o;
  return (
    <group
      matrix={matrix}
      matrixAutoUpdate={false}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onClick={onClick}
      onPointerOver={(e) => {
        hovered.current = !hidden(e.ray) && e.pointerType === "mouse";
        // Mid-drag the cursor and the camera belong to the drag.
        if (!useBuilder.getState().dragging && hovered.current) setGrab(get, "hover");
      }}
      onPointerOut={() => {
        hovered.current = false;
        if (!useBuilder.getState().dragging) setGrab(get, "idle");
      }}
    >
      {o.kind === "rollup" && rollup ? (
        <>
          <mesh geometry={rollup} material={doorMat} castShadow receiveShadow />
          {/* Bottom bar */}
          <mesh position={[w / 2, 0.12, -0.08]} material={trimMat}>
            <boxGeometry args={[w, 0.24, 0.12]} />
          </mesh>
        </>
      ) : null}
      {o.kind === "walk" ? (
        <>
          <mesh position={[w / 2, h / 2, -0.04]} material={slabMat} castShadow>
            <boxGeometry args={[w - 0.08, h - 0.04, 0.14]} />
          </mesh>
          <mesh position={[w - 0.35, 3.1, 0.08]} material={trimMat}>
            <sphereGeometry args={[0.09, 12, 8]} />
          </mesh>
          <Casing w={w} h={h} material={trimMat} sill={false} />
        </>
      ) : null}
      {o.kind === "window" ? (
        <>
          <mesh position={[w / 2, h / 2, -0.06]} material={glassMat}>
            <boxGeometry args={[w - 0.1, h - 0.1, 0.04]} />
          </mesh>
          <mesh position={[w / 2, h / 2, 0.02]} material={frameMat}>
            <boxGeometry args={[0.12, h - 0.1, 0.12]} />
          </mesh>
          <Casing w={w} h={h} material={frameMat} sill />
        </>
      ) : null}
      {selected || blocking ? <Outline w={w} h={h} floor={o.kind !== "window"} color={blocking ? BLOCKING : SELECTED} /> : null}
      {selected ? <Tag o={o} dragging={dragging} /> : null}
    </group>
  );
}

/** A roll-up curtain in the opening's own frame, slats running across. */
function rollupSurface(o: OpeningPlacement): Surface {
  // u runs up, v runs right-to-left so u × v points out of the wall (+z).
  return {
    key: `rollup-${o.id}`,
    mat: "rollup",
    profile: "slat",
    origin: [o.w, 0, -0.14],
    uAxis: [0, 1, 0],
    vAxis: [-1, 0, 0],
    uLen: o.h,
    bottom: [
      [0, 0],
      [o.h, 0],
    ],
    top: [
      [0, o.w],
      [o.h, o.w],
    ],
    holes: [],
  };
}

function Casing({ w, h, material, sill }: { w: number; h: number; material: MeshStandardMaterial; sill: boolean }) {
  const t = 0.2;
  const z = 0.1;
  return (
    <>
      <mesh position={[-t / 2, h / 2, z]} material={material} castShadow>
        <boxGeometry args={[t, h + t * (sill ? 2 : 1), 0.12]} />
      </mesh>
      <mesh position={[w + t / 2, h / 2, z]} material={material} castShadow>
        <boxGeometry args={[t, h + t * (sill ? 2 : 1), 0.12]} />
      </mesh>
      <mesh position={[w / 2, h + t / 2, z]} material={material} castShadow>
        <boxGeometry args={[w + 2 * t, t, 0.12]} />
      </mesh>
      {sill ? (
        <mesh position={[w / 2, -t / 2, z + 0.03]} material={material} castShadow>
          <boxGeometry args={[w + 2 * t, t, 0.18]} />
        </mesh>
      ) : null}
    </>
  );
}

/**
 * The outline on the selected opening (blue) or the one in the way (amber):
 * a white halo under a colored band and a tinted fill, unlit, so it reads on
 * a black wall and a white one alike. Doors stand on the floor, so their
 * outline stops there; a window gets all four sides.
 */
function Outline({ w, h, floor, color }: { w: number; h: number; floor: boolean; color: string }) {
  const pad = 0.38;
  const low = floor ? 0.08 : -pad;
  const mats = useMemo(
    () => ({
      halo: new MeshBasicMaterial({ color: "#ffffff", toneMapped: false }),
      band: new MeshBasicMaterial({ color, toneMapped: false }),
      fill: new MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity: 0.18, depthWrite: false }),
    }),
    [color],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  // Thin plates, the band in front of the halo, so both show from any angle.
  const frame = (t: number, z: number, mat: MeshBasicMaterial, key: string) => {
    const sideH = h + pad - low;
    const depth = 0.05;
    return (
      <group key={key}>
        <mesh position={[-pad, low + sideH / 2, z]} material={mat}>
          <boxGeometry args={[t, sideH + t, depth]} />
        </mesh>
        <mesh position={[w + pad, low + sideH / 2, z]} material={mat}>
          <boxGeometry args={[t, sideH + t, depth]} />
        </mesh>
        <mesh position={[w / 2, h + pad, z]} material={mat}>
          <boxGeometry args={[w + 2 * pad + t, t, depth]} />
        </mesh>
        {floor ? null : (
          <mesh position={[w / 2, low, z]} material={mat}>
            <boxGeometry args={[w + 2 * pad + t, t, depth]} />
          </mesh>
        )}
      </group>
    );
  };
  return (
    <>
      {frame(0.5, 0.3, mats.halo, "halo")}
      {frame(0.28, 0.36, mats.band, "band")}
      <mesh position={[w / 2, h / 2, 0.24]} material={mats.fill} renderOrder={2}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </>
  );
}

/**
 * A label over the selected opening: what it is and how to move it, then,
 * mid-drag, where it is. Pointer-only and hidden from assistive tech: the
 * Doors and windows step has the same controls for keyboards.
 */
function Tag({ o, dragging }: { o: OpeningPlacement; dragging: boolean }) {
  const x = useBuilder((s) => s.design.openings.find((y) => y.id === o.id)?.x);
  const spec = useBuilder((s) => s.design.openings.find((y) => y.id === o.id)?.spec);
  if (x == null || !spec) return null;
  const sp = openingSpec(spec);
  const name = sp.kind === "walk" ? "Walk door" : `${OPENING_KIND_LABEL[sp.kind]} ${sp.label}`;
  const remove = () => {
    const s = useBuilder.getState();
    s.edit((d) => ({ ...d, openings: d.openings.filter((y) => y.id !== o.id) }));
    s.select(null);
    s.notify(`${name} removed. Undo brings it back.`, { tone: "info" });
  };
  return (
    <Html position={[o.w / 2, o.h + 1.7, 0.36]} center zIndexRange={[30, 10]} style={{ pointerEvents: "none" }}>
      <div
        aria-hidden="true"
        className="flex items-center gap-1 whitespace-nowrap rounded-full py-1 pl-3 pr-1 text-[12px] font-semibold leading-none text-white shadow-[0_4px_14px_rgba(0,24,42,.3)]"
        style={{ background: SELECTED }}
      >
        <span>{name}</span>
        <span className="font-medium text-white">· {dragging ? `${fmt(x)} ft from the left corner` : "Drag to move"}</span>
        {dragging ? null : (
          <button
            type="button"
            tabIndex={-1}
            // The label sits over the canvas: keep this press from also grabbing a door or turning the camera.
            onPointerDown={(e) => e.stopPropagation()}
            onClick={remove}
            className="ml-1 inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-[15px] text-white hover:bg-white/20"
            style={{ pointerEvents: "auto" }}
            title={`Remove ${name.toLowerCase()}`}
          >
            ×
          </button>
        )}
      </div>
    </Html>
  );
}

/** Where the scale figure stands: just in front of the front-right corner. */
export function personSpot(layout: Layout): [number, number, number] {
  return [layout.bounds.max[0] - 3.5, 0, layout.bounds.max[2] + 3];
}

/** A 5 ft 11 in figure for scale. */
export function Person({ layout }: { layout: Layout }) {
  const mat = usePaint("#8f99a2", { roughness: 0.85 });
  const [x, , z] = personSpot(layout);
  return (
    <group position={[x, 0, z]} rotation={[0, -0.5, 0]}>
      {[-0.27, 0.27].map((dx) => (
        <mesh key={`l${dx}`} position={[dx, 1.45, 0]} material={mat} castShadow>
          <capsuleGeometry args={[0.24, 2.4, 4, 10]} />
        </mesh>
      ))}
      <mesh position={[0, 3.95, 0]} material={mat} castShadow>
        <capsuleGeometry args={[0.55, 1.5, 4, 14]} />
      </mesh>
      {[-0.78, 0.78].map((dx) => (
        <mesh key={`a${dx}`} position={[dx, 3.75, 0]} rotation={[0, 0, dx > 0 ? 0.08 : -0.08]} material={mat} castShadow>
          <capsuleGeometry args={[0.17, 2.0, 4, 10]} />
        </mesh>
      ))}
      <mesh position={[0, 5.5, 0]} material={mat} castShadow>
        <sphereGeometry args={[0.42, 18, 14]} />
      </mesh>
    </group>
  );
}
