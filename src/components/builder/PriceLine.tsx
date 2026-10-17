"use client";

import type { Design } from "@/lib/builder/design";
import { formatPrice, priceBasis, priceHint } from "@/lib/builder/price";

/**
 * The sales-pack starting price for the closest standard build, always with
 * its basis. Never a total: add-ons are quoted on top.
 */
export function PriceLine({ design: d, detailed = false }: { design: Design; detailed?: boolean }) {
  const hint = priceHint(d);
  if (hint.kind === "custom") {
    return (
      <div>
        <p className="font-forge-display text-[20px] font-bold leading-[1.15] text-forge-navy">Custom size</p>
        <p className="mt-0.5 text-[12px] leading-[1.4] text-forge-slate">Priced from your design, with no obligation.</p>
      </div>
    );
  }
  const welded = d.frame === "welded";
  const basis = priceBasis(d, hint.anchor);
  return (
    <div>
      <p className="font-forge-display text-[20px] font-bold leading-[1.15] tabular-nums text-forge-navy">
        From {formatPrice(welded ? hint.welded : hint.bolted)}
      </p>
      <p className="mt-0.5 text-[12px] leading-[1.4] text-forge-slate">{hint.exact ? basis : `Closest standard size: ${basis}`}</p>
      {detailed ? (
        <p className="mt-2 text-[12px] leading-[1.5] text-forge-slate">
          {welded ? "" : `Welded from ${formatPrice(hint.welded)}. `}
          Walls, doors, windows, lean-tos, colored panels, the heavy-duty upgrade, extra height and concrete are quoted on top. Your quote covers the whole design.
        </p>
      ) : null}
    </div>
  );
}
