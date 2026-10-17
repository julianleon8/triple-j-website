/**
 * The builder's only price: the sales-pack starting price for the standard
 * build closest to the design. It is a floor for a bare frame and roof, never
 * a total, and always shown with its basis (owner's call, 2026-10-14).
 *
 * Every figure is copied from dev/sales-pack-2026-04-30.md, the canonical
 * price sheet: steel + install, bolted, 10 ft unless noted, before tax.
 * Welded is bolted × 1.10 (Locked Decisions → Pricing). Change a price there
 * first, then here. Never add a size the sheet doesn't list.
 */

import type { Roof } from "./catalog";
import type { Design } from "./design";

export type PriceAnchor = { w: number; l: number; roof: Roof; h: number; price: number };

export const PRICE_ANCHORS: readonly PriceAnchor[] = [
  { w: 20, l: 20, roof: "flat", h: 10, price: 3000 },
  { w: 20, l: 20, roof: "gable", h: 10, price: 4000 },
  { w: 20, l: 25, roof: "flat", h: 10, price: 3800 },
  { w: 20, l: 30, roof: "flat", h: 10, price: 4300 },
  { w: 20, l: 40, roof: "flat", h: 10, price: 6500 },
  { w: 20, l: 40, roof: "flat", h: 14, price: 8300 },
  { w: 20, l: 40, roof: "gable", h: 10, price: 8000 },
  { w: 25, l: 25, roof: "flat", h: 10, price: 4000 },
  { w: 25, l: 25, roof: "gable", h: 10, price: 5200 },
  { w: 25, l: 50, roof: "flat", h: 10, price: 8000 },
  { w: 30, l: 30, roof: "flat", h: 10, price: 5500 },
  { w: 30, l: 30, roof: "gable", h: 10, price: 7000 },
  { w: 40, l: 100, roof: "flat", h: 10, price: 29500 },
];

export const WELDED_FACTOR = 1.1;

/** Beyond this footprint difference a "closest" size stops meaning anything. */
const MAX_AREA_DRIFT = 0.35;

export type PriceHint =
  | { kind: "anchor"; anchor: PriceAnchor; exact: boolean; bolted: number; welded: number }
  | { kind: "custom" };

const sorted = (a: number, b: number): [number, number] => (a <= b ? [a, b] : [b, a]);

export function priceHint(d: Design): PriceHint {
  const [dw, dl] = sorted(d.width, d.length);
  const area = dw * dl;
  let best: { a: PriceAnchor; score: number } | null = null;
  for (const a of PRICE_ANCHORS) {
    if (a.roof !== d.roof) continue;
    const [aw, al] = sorted(a.w, a.l);
    // Footprint first; ties go to the closer floor area (a 30×40 is nearer a
    // 30×30 than a 20×40), then to the closer height.
    const drift = Math.abs(aw * al - area) / area;
    const score = Math.abs(dw - aw) + Math.abs(dl - al) + drift / 10 + Math.abs(d.height - a.h) / 1000;
    if (!best || score < best.score) best = { a, score };
  }
  if (!best) return { kind: "custom" };
  const a = best.a;
  if (Math.abs(a.w * a.l - area) / area > MAX_AREA_DRIFT) return { kind: "custom" };
  const [aw, al] = sorted(a.w, a.l);
  const exact = aw === dw && al === dl && a.h === d.height;
  return { kind: "anchor", anchor: a, exact, bolted: a.price, welded: Math.round(a.price * WELDED_FACTOR) };
}

/**
 * What a starting price is for: the standard size, the frame and what it
 * covers. Until a frame is chosen the bolted price shows, and says so.
 */
export function priceBasis(d: Design, a: PriceAnchor): string {
  const frame = d.frame === "welded" ? "welded" : d.frame === "bolted" ? "bolted" : "bolted price shown";
  return `${a.w}×${a.l} ${a.roof === "gable" ? "gabled" : "flat"} roof · ${a.h} ft · ${frame}, steel + install, before tax`;
}

export function formatPrice(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}
