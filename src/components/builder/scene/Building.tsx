"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  BackSide,
  BoxGeometry,
  DoubleSide,
  FrontSide,
  Matrix4,
  MeshStandardMaterial,
  Vector3,
  type InstancedMesh,
  type Side,
} from "three";
import { useThree, type ThreeEvent } from "@react-three/fiber";

import { FRAME_HEX, builderColor } from "@/lib/builder/catalog";
import type { Design } from "@/lib/builder/design";
import type { Layout, Member, OpeningPlacement, Surface } from "@/lib/builder/geometry";

import { useBuilder } from "../store";
import { panelGeometry } from "./panelGeometry";

const UNDERSIDE = "#c3c8cb";
const CONCRETE = "#b1ada4";
const DOOR_SLAB = "#ecebe6";
const WINDOW_FRAME = "#efefeb";
const GLASS = "#33434e";
const HIGHLIGHT = "#00182a";

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
  const invalidate = useThree((s) => s.invalidate);
  // The canvas only draws on demand, and removing meshes alone does not ask for a frame.
  useEffect(() => invalidate(), [invalidate, layout, frameOnly, selected, design.colors]);
  const roof = paintFor(design.colors.roof);
  const walls = paintFor(design.colors.walls);
  const trim = paintFor(design.colors.trim);
  const wainscot = paintFor(design.colors.wainscot ?? design.colors.walls);

  const roofMat = usePaint(roof.hex, { metallic: roof.metallic });
  const wallMat = usePaint(walls.hex, { metallic: walls.metallic });
  const wainscotMat = usePaint(wainscot.hex, { metallic: wainscot.metallic });
  const trimMat = usePaint(trim.hex, { metallic: trim.metallic, roughness: 0.42 });
  const doorMat = usePaint(trim.hex, { metallic: trim.metallic, side: DoubleSide, roughness: 0.45 });
  const insideMat = usePaint(UNDERSIDE, { metallic: true, side: BackSide, roughness: 0.55 });
  const frameMat = usePaint(FRAME_HEX, { roughness: 0.62 });

  const bySurface = useMemo(() => {
    const pick = (mat: Surface["mat"]) => layout.surfaces.filter((s) => s.mat === mat);
    return { roof: pick("roof"), wall: pick("wall"), wainscot: pick("wainscot") };
  }, [layout]);
  const frame = useMemo(() => layout.members.filter((m) => m.mat === "frame"), [layout]);
  const trimMembers = useMemo(() => layout.members.filter((m) => m.mat === "trim"), [layout]);

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
          {layout.openings.map((o) => (
            <OpeningMesh key={o.id} o={o} doorMat={doorMat} trimMat={trimMat} selected={selected === o.id} />
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

function OpeningMesh({
  o,
  doorMat,
  trimMat,
  selected,
}: {
  o: OpeningPlacement;
  doorMat: MeshStandardMaterial;
  trimMat: MeshStandardMaterial;
  selected: boolean;
}) {
  const matrix = useOpeningMatrix(o);
  const select = useBuilder((s) => s.select);
  const setSection = useBuilder((s) => s.setSection);
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    select(o.id);
    setSection("openings");
  };
  const slabMat = usePaint(DOOR_SLAB, { roughness: 0.6 });
  const frameMat = usePaint(WINDOW_FRAME, { roughness: 0.6 });
  const glassMat = useMemo(() => new MeshStandardMaterial({ color: GLASS, metalness: 0.2, roughness: 0.06, envMapIntensity: 0.9 }), []);
  useEffect(() => () => glassMat.dispose(), [glassMat]);
  const rollup = useMemo(() => (o.kind === "rollup" ? panelGeometry([rollupSurface(o)]) : null), [o]);
  useEffect(() => () => rollup?.dispose(), [rollup]);

  const { w, h } = o;
  return (
    <group matrix={matrix} matrixAutoUpdate={false} onClick={onClick}>
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
      {selected ? <Highlight w={w} h={h} floor={o.kind !== "window"} /> : null}
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

/** An outline around the selected opening. Doors stand on the floor, so their outline stops there; a window gets all four sides. */
function Highlight({ w, h, floor }: { w: number; h: number; floor: boolean }) {
  const t = 0.14;
  const pad = 0.45;
  const z = 0.3;
  const low = floor ? 0.1 : -pad;
  const sideH = h + pad - low;
  const mat = useMemo(() => new MeshStandardMaterial({ color: HIGHLIGHT, emissive: HIGHLIGHT, roughness: 0.4 }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <>
      <mesh position={[-pad, low + sideH / 2, z]} material={mat}>
        <boxGeometry args={[t, sideH, t]} />
      </mesh>
      <mesh position={[w + pad, low + sideH / 2, z]} material={mat}>
        <boxGeometry args={[t, sideH, t]} />
      </mesh>
      <mesh position={[w / 2, h + pad, z]} material={mat}>
        <boxGeometry args={[w + 2 * pad, t, t]} />
      </mesh>
      <mesh position={[w / 2, low, z]} material={mat}>
        <boxGeometry args={[w + 2 * pad, t, t]} />
      </mesh>
    </>
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
