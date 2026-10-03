"use client";

import { useState } from "react";

import { SHARED } from "@/i18n/copy/shared";
import { useLocale } from "@/i18n/use-locale";
import { requestQuote } from "@/lib/forge-quote";

import { PillGroup } from "./form";

/**
 * Steel + install floors from dev/sales-pack-2026-04-30.md (carport 20×20
 * $3,000; garage 30×30 $5,500; barn $6,500). Never improvise a price here.
 */
export const MILITARY_BASES = [
  { v: "carport", label: "Carport", base: 3000 },
  { v: "garage", label: "Garage", base: 5500 },
  { v: "barn", label: "Barn", base: 6500 },
] as const;

type Kind = (typeof MILITARY_BASES)[number]["v"];

export function militarySavings(base: number, pct: number): number {
  return Math.round(base * (pct / 100));
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** "See what 7% means": pick a build, see the discount on its base price. */
export function MilitaryCalculator({ pct }: { pct: number }) {
  const t = SHARED[useLocale()].military;
  const [kind, setKind] = useState<Kind>("carport");
  const pick = MILITARY_BASES.find((b) => b.v === kind) ?? MILITARY_BASES[0];
  return (
    <div className="mt-[22px] rounded-[10px] border border-forge-silver bg-white p-[18px]">
      <PillGroup
        label={t.see(pct)}
        tone="olive"
        options={MILITARY_BASES.map((b) => ({ v: b.v, label: t.kinds[b.v] }))}
        value={kind}
        onChange={(v) => v && setKind(v)}
      />
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2" aria-live="polite">
        <span className="text-[14px] text-forge-slate">
          {t.on} <b className="text-forge-navy tabular-nums">{usd(pick.base)}</b> {t.base(t.kinds[pick.v])}
        </span>
        <span className="font-forge-display text-[clamp(26px,1.2vw_+_18px,34px)] font-black tabular-nums text-forge-olive">
          {usd(militarySavings(pick.base, pct))} {t.back}
        </span>
      </div>
      <p className="mt-2 text-[12px] text-forge-slate">
        {t.fine(pct)}
      </p>
      <a
        href="#quote"
        onClick={(e) => {
          if (requestQuote({ service: kind, military: true })) e.preventDefault();
        }}
        className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-forge-navy px-5 py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-forge-navy-raised"
      >
        {t.cta} <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
