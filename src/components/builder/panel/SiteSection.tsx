"use client";

import { CheckboxRow, FieldLabel, PillGroup } from "@/components/forge/form";
import { CONCRETE, CONCRETE_LABEL, FRAMES, FRAME_LABEL, type Concrete, type Frame } from "@/lib/builder/catalog";

import { useBuilder } from "../store";
import { Helper, PRICED_IN_QUOTE, SectionShell } from "./controls";

export function SiteSection() {
  const d = useBuilder((s) => s.design);
  const edit = useBuilder((s) => s.edit);
  return (
    <SectionShell id="site" title="Frame and site" lede="Welded or bolted by the same crew, with same-week scheduling once your build is approved.">
      <div>
        <PillGroup<Frame>
          label="Frame"
          value={d.frame}
          onChange={(v) => v && edit((x) => ({ ...x, frame: v }))}
          options={FRAMES.map((f) => ({ v: f, label: FRAME_LABEL[f] }))}
        />
        <Helper>Welded is permanent and runs about 10% more. Bolted can be moved later.</Helper>
      </div>
      <CheckboxRow
        checked={d.heavyDuty}
        onChange={(heavyDuty) => edit((x) => ({ ...x, heavyDuty }))}
        label="Heavy-duty upgrade"
        sub="11-gauge columns, welded to the receivers and purlins. The rest of the frame stays 14-gauge."
      />
      <div>
        <FieldLabel as="p">Add-ons</FieldLabel>
        <div className="flex flex-col gap-3">
          <CheckboxRow
            checked={d.gutters}
            onChange={(gutters) => edit((x) => ({ ...x, gutters }))}
            label="Gutters and downspouts"
            sub={
              <>
                K-style, in your trim color, on every edge the roof drains off.
                <span className="mt-1 block">{PRICED_IN_QUOTE}</span>
              </>
            }
          />
          <CheckboxRow
            checked={d.insulation}
            onChange={(insulation) => edit((x) => ({ ...x, insulation }))}
            label="Fiberglass insulation"
            sub={
              <>
                Covers the roof and any closed walls. Not shown in 3D.
                <span className="mt-1 block">{PRICED_IN_QUOTE}</span>
              </>
            }
          />
        </div>
      </div>
      <div>
        <PillGroup<Concrete>
          label="Concrete pad"
          value={d.concrete}
          onChange={(v) => v && edit((x) => ({ ...x, concrete: v }))}
          options={CONCRETE.map((c) => ({ v: c, label: CONCRETE_LABEL[c] }))}
        />
        <Helper>3,000 PSI standard, 4,000 PSI on request. Concrete is priced separately on the same contract.</Helper>
      </div>
      <p className="text-[13px] leading-[1.55] text-forge-slate">
        Building permits? We&apos;ll talk you through it.
      </p>
    </SectionShell>
  );
}
