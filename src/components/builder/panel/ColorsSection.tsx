"use client";

import { SIDES, sameOnScreen } from "@/lib/builder/catalog";
import { wallState } from "@/lib/builder/rules";

import { useBuilder } from "../store";
import { Helper, SectionShell, SwatchGrid } from "./controls";

export function ColorsSection() {
  const d = useBuilder((s) => s.design);
  const edit = useBuilder((s) => s.edit);
  const set = (key: keyof typeof d.colors) => (slug: string | null) =>
    edit((x) => ({ ...x, colors: { ...x.colors, [key]: key === "wainscot" || key === "ridge" ? slug : (slug ?? x.colors[key]) } }));

  const anyWall = SIDES.some((s) => wallState(d, s) !== "open") || d.leanTos.some((l) => l.walls === "enclosed");
  const anyEnclosed = SIDES.some((s) => wallState(d, s) === "enclosed") || d.leanTos.some((l) => l.walls === "enclosed");
  // A picked color that draws the same as another one (Alamo and Polar White).
  const shown = [d.colors.roof, anyWall ? d.colors.walls : null, d.colors.trim, d.roof === "gable" ? d.colors.ridge : null, anyEnclosed ? d.colors.wainscot : null];
  const twins = shown.map((slug) => (slug ? sameOnScreen(slug) : [])).find((g) => g.length > 1);

  return (
    <SectionShell
      id="colors"
      title="Colors"
      lede="Standard Line panels, 26-gauge, with a 40-year painted finish. Screen colors are approximate, so ask to see a sample before you order."
    >
      <SwatchGrid label="Roof" value={d.colors.roof} onChange={set("roof")} />
      {anyWall ? <SwatchGrid label="Walls" value={d.colors.walls} onChange={set("walls")} /> : null}
      <SwatchGrid label="Trim & roll-up doors" value={d.colors.trim} onChange={set("trim")} />
      {d.roof === "gable" ? (
        <div>
          <SwatchGrid label="Ridge cap" value={d.colors.ridge} onChange={set("ridge")} allowNone noneLabel="Match roof" />
          <Helper>The trim along the peak. It matches the roof unless you pick another color.</Helper>
        </div>
      ) : null}
      {anyEnclosed ? (
        <SwatchGrid label="Wainscot (bottom 3 ft)" value={d.colors.wainscot} onChange={set("wainscot")} allowNone />
      ) : null}
      {twins ? (
        <p className="text-[12px] leading-[1.5] text-forge-slate">
          {twins.map((c) => c.name).join(" and ")} look the same on screen. Ask to see a sample of each.
        </p>
      ) : null}
      <p className="text-[12px] leading-[1.5] text-forge-slate">
        Concealed-fastener Premium Line colors are available on request.
      </p>
    </SectionShell>
  );
}
