"use client";

/**
 * The 3D view. Loaded only on /build, client-side, so three.js never reaches
 * any other page. It renders on demand: nothing redraws while the visitor
 * isn't touching the model, which keeps phones cool.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { Canvas, useThree, type RootState } from "@react-three/fiber";
import { CameraControls, CameraControlsImpl } from "@react-three/drei";
import {
  BackSide,
  Box3,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  PMREMGenerator,
  PlaneGeometry,
  Scene as Scene3,
  ShaderMaterial,
  Spherical,
  Vector3,
  type DirectionalLight,
  type PerspectiveCamera,
} from "three";

import { framingClearOf, layoutBuilding, steadyStep, type Layout, type ScreenRect, type Vec3 } from "@/lib/builder/geometry";
import { deselectOnEscape, useBuilder, type ViewName } from "../store";
import { Building, Person, personSpot } from "./Building";
import { GroundMarks } from "./GroundMarks";

const HORIZON = "#dfe7ec";
const ZENITH = "#9ec0db";
const GROUND = "#8b9471";

export default function Scene() {
  useEffect(() => {
    window.addEventListener("keydown", deselectOnEscape);
    return () => window.removeEventListener("keydown", deselectOnEscape);
  }, []);
  return (
    <Canvas
      frameloop="demand"
      shadows="percentage"
      dpr={[1, 2]}
      gl={{ antialias: true, toneMapping: NeutralToneMapping, powerPreference: "high-performance" }}
      camera={{ fov: 35, near: 0.5, far: 4000, position: [45, 30, 60] }}
      onPointerMissed={() => useBuilder.getState().select(null)}
    >
      <Contents />
    </Canvas>
  );
}

function Contents() {
  const design = useBuilder((s) => s.design);
  const showPerson = useBuilder((s) => s.showPerson);
  const layout = useMemo(() => layoutBuilding(design), [design]);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => invalidate(), [invalidate, showPerson]);
  return (
    <>
      <Sky />
      <fog attach="fog" args={[HORIZON, 320, 1300]} />
      <hemisphereLight args={["#e6eef5", "#7d7a62", 0.75]} />
      <Sun layout={layout} />
      <SkyReflections />
      <Ground />
      <GroundMarks layout={layout} />
      <Building design={design} layout={layout} />
      {showPerson ? <Person layout={layout} /> : null}
      <CameraRig layout={layout} />
    </>
  );
}

/**
 * What metal panels reflect: a bright overcast sky, a lighter horizon band and
 * warm ground bounce, baked once into an environment map. Built from plain
 * emissive panels so no HDR file or image loader ships with the builder.
 */
function SkyReflections() {
  const gl = useThree((s) => s.gl);
  const target = useMemo(() => {
    const room = new Scene3();
    room.background = new Color(HORIZON);
    const plane = new PlaneGeometry(1, 1);
    const panels: [string, number, [number, number, number], [number, number, number], [number, number]][] = [
      ["#ffffff", 2.4, [0, 60, 0], [Math.PI / 2, 0, 0], [160, 160]],
      ["#dbe6ef", 1.1, [0, 12, -90], [0, 0, 0], [220, 24]],
      ["#dbe6ef", 1.1, [0, 12, 90], [0, Math.PI, 0], [220, 24]],
      ["#a9a37f", 0.6, [0, -30, 0], [-Math.PI / 2, 0, 0], [300, 300]],
    ];
    const materials = panels.map(([color, intensity, position, rotation, [sx, sy]]) => {
      const mat = new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side: DoubleSide });
      const mesh = new Mesh(plane, mat);
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      mesh.scale.set(sx, sy, 1);
      room.add(mesh);
      return mat;
    });
    const pmrem = new PMREMGenerator(gl);
    const baked = pmrem.fromScene(room, 0.04);
    pmrem.dispose();
    plane.dispose();
    materials.forEach((m) => m.dispose());
    return baked;
  }, [gl]);
  useEffect(() => () => target.dispose(), [target]);
  return <primitive object={target.texture} attach="environment" />;
}

function boundsOf(layout: Layout) {
  const min = new Vector3(...layout.bounds.min);
  const max = new Vector3(...layout.bounds.max);
  const center = min.clone().add(max).multiplyScalar(0.5);
  const radius = max.clone().sub(min).length() / 2;
  return { min, max, center, radius };
}

function Sun({ layout }: { layout: Layout }) {
  const ref = useRef<DirectionalLight>(null);
  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => {
    const light = ref.current;
    if (!light) return;
    const { center, radius } = boundsOf(layout);
    const dist = radius * 2 + 60;
    const dir = new Vector3(0.55, 1, 0.72).normalize();
    light.position.copy(center).addScaledVector(dir, dist);
    light.target.position.copy(center);
    light.target.updateMatrixWorld();
    const cam = light.shadow.camera;
    const r = radius + 8;
    cam.left = -r;
    cam.right = r;
    cam.top = r;
    cam.bottom = -r;
    cam.near = 1;
    cam.far = dist * 2;
    cam.updateProjectionMatrix();
    invalidate();
  }, [layout, invalidate]);
  return (
    <directionalLight
      ref={ref}
      castShadow
      intensity={2.1}
      color="#fff3e0"
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.05}
    />
  );
}

/** A gradient dome; fog carries the ground into its horizon. */
function Sky() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        side: BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { zenith: { value: new Color(ZENITH) }, horizon: { value: new Color(HORIZON) } },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 zenith;
          uniform vec3 horizon;
          varying vec3 vDir;
          void main() {
            float t = clamp(vDir.y * 1.8, 0.0, 1.0);
            gl_FragColor = vec4(mix(horizon, zenith, pow(t, 0.75)), 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh material={material} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[1800, 32, 16]} />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
      <circleGeometry args={[1600, 64]} />
      <meshStandardMaterial color={GROUND} roughness={1} metalness={0} envMapIntensity={0.6} />
    </mesh>
  );
}

/** Azimuth and polar angle (radians) for each named view. */
const VIEWS: Record<ViewName, [number, number]> = {
  iso: [0.62, 1.13],
  front: [0, 1.45],
  back: [Math.PI, 1.45],
  left: [-Math.PI / 2, 1.45],
  right: [Math.PI / 2, 1.45],
  top: [0, 0.02],
};

/**
 * Room kept clear over the 3D view, in CSS px, until the controls over it can
 * be measured: the view buttons along its top and the chips and size badge
 * along its bottom are 36 px tall, 12 px in from the edge, plus a little air.
 */
const CLEAR_TOP = 56;
const CLEAR_BOTTOM = 56;
const CLEAR_SIDE = 16;
/** Air kept between the building and a measured control. */
const CLEAR_AIR = 8;
/** Marks the controls laid over the 3D view, so the camera can frame clear of them. */
const OVERLAY = "[data-scene-overlay]";

/**
 * The controls over the 3D view, measured, so a row of view buttons that
 * wraps on a narrow phone is cleared too; until they are on screen, the
 * one-row layout's bands across the top and bottom.
 */
function overlaysOver({ size, gl }: RootState): ScreenRect[] {
  const view = gl.domElement.getBoundingClientRect();
  const measured = [...document.querySelectorAll<HTMLElement>(OVERLAY)]
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.height > 0)
    .map((r) => ({ left: r.left - view.left, right: r.right - view.left, top: r.top - view.top, bottom: r.bottom - view.top }));
  if (measured.length) return measured;
  return [
    { left: 0, right: size.width, top: 0, bottom: CLEAR_TOP - CLEAR_AIR },
    { left: 0, right: size.width, top: size.height - (CLEAR_BOTTOM - CLEAR_AIR), bottom: size.height },
  ];
}

/**
 * Frame the building at the angle the camera is heading to. camera-controls'
 * own fitToBox snaps to the nearest axis, which would undo the 3D view, so the
 * distance is worked out here: near enough to fill the view, far enough that
 * every corner of the building stays clear of the buttons over it.
 */
function fitBox(c: CameraControls, box: Box3, smooth: boolean, state: RootState) {
  const cam = c.camera as PerspectiveCamera;
  const center = box.getCenter(new Vector3());
  const target: Vec3 = [center.x, center.y * 0.85, center.z];
  const { theta, phi } = c.getSpherical(new Spherical(), true);
  const tanV = Math.tan((cam.fov * Math.PI) / 360);
  const { width, height } = state.size;
  const dist = framingClearOf(box.min.toArray(), box.max.toArray(), target, theta, phi, tanV, width, height, overlaysOver(state), {
    side: CLEAR_SIDE,
    air: CLEAR_AIR,
  });
  void c.setTarget(...target, smooth);
  void c.dollyTo(Math.min(dist, 440), smooth);
}

/** Camera moves ease in after a pause, without slowing on a slow phone (geometry.steadyStep). */
class SteadyControls extends CameraControlsImpl {
  override update(delta: number): boolean {
    return super.update(steadyStep(delta));
  }
}

function CameraRig({ layout }: { layout: Layout }) {
  const ref = useRef<CameraControls>(null);
  const get = useThree((s) => s.get);
  const camera = useBuilder((s) => s.camera);
  const reduced = useReducedMotion();
  const box = useMemo(() => {
    const { min, max } = boundsOf(layout);
    const b = new Box3(min, max);
    const [px, , pz] = personSpot(layout);
    return b.expandByPoint(new Vector3(px + 1, 6, pz + 1));
  }, [layout]);
  const latestBox = useRef(box);
  const firstRun = useRef(true);
  /** Size of the building when the camera last framed it. */
  const framed = useRef<Vector3 | null>(null);

  useLayoutEffect(() => {
    latestBox.current = box;
  }, [box]);

  // Named views and explicit refits.
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const smooth = !firstRun.current && !reduced;
    firstRun.current = false;
    if (camera.view !== "fit") {
      const [az, polar] = VIEWS[camera.view];
      void c.rotateTo(az, polar, smooth);
    }
    fitBox(c, latestBox.current, smooth, get());
    framed.current = latestBox.current.getSize(new Vector3());
  }, [camera, reduced, get]);

  // A building that grows or shrinks noticeably is re-framed, keeping the angle.
  useEffect(() => {
    const size = box.getSize(new Vector3());
    const prev = framed.current;
    if (!prev) return;
    const change = Math.max(...[size.x / prev.x, size.y / prev.y, size.z / prev.z].map((r) => Math.abs(Math.log(r))));
    if (change < 0.08) return;
    const t = setTimeout(() => {
      if (ref.current) fitBox(ref.current, box, !reduced, get());
      framed.current = size;
    }, 350);
    return () => clearTimeout(t);
  }, [box, reduced, get]);

  return (
    <CameraControls
      ref={ref}
      impl={SteadyControls}
      makeDefault
      minDistance={6}
      maxDistance={450}
      maxPolarAngle={Math.PI / 2 - 0.05}
      // Seconds to catch up. A spin, the wheel or a pinch, by mouse or finger,
      // eases after the pointer and glides to a stop once it lets go, so the
      // building has some weight; a named view takes a moment longer.
      smoothTime={reduced ? 0 : 0.3}
      draggingSmoothTime={reduced ? 0 : 0.22}
      dollyToCursor
    />
  );
}

const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
/** Camera moves jump instead of gliding when the visitor asks for less motion. */
function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
}
