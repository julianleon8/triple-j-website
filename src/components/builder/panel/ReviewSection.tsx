"use client";

import { PillGroup } from "@/components/forge/form";
import { USES, USE_LABEL, type Use } from "@/lib/builder/catalog";
import { designIssues } from "@/lib/builder/rules";
import { summaryRows } from "@/lib/builder/summary";

import { BuilderQuoteForm } from "../BuilderQuoteForm";
import { PlanView } from "../PlanView";
import { PriceLine } from "../PriceLine";
import { ShareButton } from "../ShareButton";
import { useBuilder } from "../store";
import { Notice, SectionShell } from "./controls";

export function ReviewSection() {
  const d = useBuilder((s) => s.design);
  const edit = useBuilder((s) => s.edit);
  const issues = designIssues(d);
  return (
    <SectionShell
      id="review"
      title="Review and send"
      lede="This is a concept design. We confirm sizes, framing and price for your site before anything is ordered."
    >
      <PillGroup<Use>
        label="What is it for?"
        value={d.use}
        onChange={(v) => v && edit((x) => ({ ...x, use: v }))}
        options={USES.map((u) => ({ v: u, label: USE_LABEL[u] }))}
      />
      <dl className="m-0 border-t border-forge-mist">
        {summaryRows(d).map((r) => (
          <div key={r.k} className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 border-b border-forge-mist py-2.5 text-[13px]">
            <dt className="text-forge-slate">{r.k}</dt>
            <dd className="m-0 font-semibold leading-[1.45] text-forge-navy">{r.v}</dd>
          </div>
        ))}
      </dl>
      <div className="rounded-[10px] border border-forge-silver p-3">
        <PlanView design={d} className="h-[280px] w-full" />
      </div>
      <div className="flex items-start justify-between gap-4 rounded-[10px] bg-forge-fog p-4">
        <PriceLine design={d} detailed />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] leading-[1.45] text-forge-slate">Send the link to anyone. It opens this exact design.</p>
        <ShareButton />
      </div>
      {issues.length ? (
        <Notice>
          Fix this before sending: {issues.map((i) => i.message).join(" ")}
        </Notice>
      ) : null}
      <BuilderQuoteForm design={d} />
    </SectionShell>
  );
}
