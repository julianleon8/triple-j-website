"use client";

/**
 * The Triple J lion with FRONT, BACK, LEFT or RIGHT under it, printed faint
 * on the ground outside each side (placement: lib/builder/groundMarks.ts).
 * Decorative: it has no handlers, so taps and drags go straight through to
 * the building and the camera, and it stays out of the box the camera frames.
 */

import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, MeshBasicMaterial, MultiplyBlending, PlaneGeometry, SRGBColorSpace } from "three";

import { SIDES, type Side } from "@/lib/builder/catalog";
import type { Layout } from "@/lib/builder/geometry";
import { MARK_PX, groundMarks } from "@/lib/builder/groundMarks";

const LION = "/images/logo-lion.png";
/** Brand navy and steel (globals.css --color-navy, --color-steel). */
const NAVY_HEX = "#00182a";
const NAVY = [0x00, 0x18, 0x2a];
const STEEL = [0x78, 0x8a, 0x9c];
/** How strongly a mark prints: a watermark, under the building, the person and the shadows. */
const OPACITY = 0.38;
/** The lion's square on the drawing, px. */
const LION_BOX = { x: 48, y: 8, size: 416 };
/** The side's name: bold caps, tracked out 0.2 em as the builder's caps labels are, as large as fits. */
const WORD = { baseline: 536, maxWidth: 448, maxPx: 104, track: 0.2 };
const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export function GroundMarks({ layout }: { layout: Layout }) {
  const marks = useMemo(() => groundMarks(layout.bounds), [layout]);
  const materials = useMarkMaterials();
  const plane = useMemo(() => new PlaneGeometry(1, 1), []);
  useEffect(() => () => plane.dispose(), [plane]);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => invalidate(), [invalidate, marks, materials]);
  if (!materials) return null;
  return (
    <>
      {marks.map((m) => (
        <mesh
          key={m.side}
          geometry={plane}
          material={materials[m.side]}
          position={m.position}
          rotation={m.rotation}
          scale={[m.width, m.depth, 1]}
        />
      ))}
    </>
  );
}

/**
 * One material per side, once the lion and the font have loaded. Multiplied
 * into the ground like ink, so a mark darkens with it in shadow instead of
 * glowing there; a hair above it and drawn over it, so the two never flicker.
 */
function useMarkMaterials(): Record<Side, MeshBasicMaterial> | null {
  const gl = useThree((s) => s.gl);
  const [materials, setMaterials] = useState<Record<Side, MeshBasicMaterial> | null>(null);
  useEffect(() => {
    let live = true;
    const made: MeshBasicMaterial[] = [];
    drawMarks()
      .then((drawn) => {
        if (!live) return;
        // Seen at a low angle across the ground, a mark stays sharp.
        const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
        const entries = SIDES.map((side) => {
          const map = new CanvasTexture(drawn[side]);
          map.colorSpace = SRGBColorSpace;
          map.anisotropy = anisotropy;
          const m = new MeshBasicMaterial({
            map,
            transparent: true,
            opacity: OPACITY,
            blending: MultiplyBlending,
            premultipliedAlpha: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1,
          });
          made.push(m);
          return [side, m] as const;
        });
        setMaterials(Object.fromEntries(entries) as Record<Side, MeshBasicMaterial>);
      })
      .catch(() => {
        // Decorative: without it the ground is plain.
      });
    return () => {
      live = false;
      for (const m of made) {
        m.map?.dispose();
        m.dispose();
      }
    };
  }, [gl]);
  return materials;
}

/** Each side's drawing: the lion in navy and steel over the side's name in navy. */
async function drawMarks(): Promise<Record<Side, HTMLCanvasElement>> {
  // A logo that won't load leaves the names alone.
  const lion = await tonedLion().catch(() => null);
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-inter").trim();
  const font = (px: number) => `700 ${px}px ${family ? `${family}, ` : ""}${SANS}`;
  const words = SIDES.map((s) => s.toUpperCase());
  try {
    await document.fonts.load(font(WORD.maxPx), words.join(""));
  } catch {
    // The system sans stands in.
  }

  const canvas = () => {
    const c = document.createElement("canvas");
    c.width = MARK_PX.w;
    c.height = MARK_PX.h;
    return c;
  };
  const measure = canvas().getContext("2d");
  if (!measure) throw new Error("No 2D canvas");
  /** Each letter's width and the word's, tracked. */
  const widths = (ctx: CanvasRenderingContext2D, word: string, px: number) => {
    const each = [...word].map((ch) => ctx.measureText(ch).width);
    return { each, total: each.reduce((a, b) => a + b, 0) + WORD.track * px * (each.length - 1) };
  };
  // One size for all four, so the longest name fits.
  measure.font = font(100);
  const longest = Math.max(...words.map((w) => widths(measure, w, 100).total));
  const px = Math.min(WORD.maxPx, Math.floor((100 * WORD.maxWidth) / longest));

  const out = {} as Record<Side, HTMLCanvasElement>;
  SIDES.forEach((side, i) => {
    const c = canvas();
    const ctx = c.getContext("2d");
    out[side] = c;
    if (!ctx) return;
    if (lion) ctx.drawImage(lion, LION_BOX.x, LION_BOX.y);
    ctx.font = font(px);
    ctx.fillStyle = NAVY_HEX;
    ctx.textBaseline = "alphabetic";
    const word = words[i];
    const { each, total } = widths(ctx, word, px);
    let x = (c.width - total) / 2;
    [...word].forEach((ch, j) => {
      ctx.fillText(ch, x, WORD.baseline);
      x += each[j] + WORD.track * px;
    });
  });
  return out;
}

/**
 * The lion in two brand tones: its dark parts navy, its light parts steel and
 * fainter, so the face and mane still read inside the dark ring.
 */
async function tonedLion(): Promise<HTMLCanvasElement> {
  const img = new Image();
  img.src = LION;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = c.height = LION_BOX.size;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No 2D canvas");
  ctx.drawImage(img, 0, 0, c.width, c.height);
  const pixels = ctx.getImageData(0, 0, c.width, c.height);
  const d = pixels.data;
  for (let i = 0; i < d.length; i += 4) {
    const light = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
    for (let k = 0; k < 3; k++) d[i + k] = NAVY[k] + (STEEL[k] - NAVY[k]) * light;
    d[i + 3] *= 1 - 0.55 * light;
  }
  ctx.putImageData(pixels, 0, 0);
  return c;
}
