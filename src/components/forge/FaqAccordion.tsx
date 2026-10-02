"use client";

import { useId, useState } from "react";

export type Faq = { q: string; a: string };

/**
 * Single-open FAQ list; the first item starts open. Questions are buttons
 * with aria-expanded/aria-controls. No FAQPage JSON-LD (locked out 2026-09-07).
 */
export function FaqAccordion({ faqs }: { faqs: readonly Faq[] }) {
  const [open, setOpen] = useState(0);
  const id = useId();
  return (
    <div className="border-t border-forge-silver">
      {faqs.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.q} className="border-b border-forge-silver">
            <h3 className="m-0">
              <button
                type="button"
                id={`${id}-q-${i}`}
                aria-expanded={on}
                aria-controls={`${id}-a-${i}`}
                onClick={() => setOpen(on ? -1 : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-5 bg-transparent py-[22px] text-left text-forge-navy"
              >
                <span className="font-forge-display text-[clamp(17px,.4vw_+_15px,20px)] font-bold leading-[1.3]">{f.q}</span>
                <span
                  aria-hidden="true"
                  className="inline-flex size-[34px] flex-none items-center justify-center rounded-full border border-forge-silver text-[18px]"
                >
                  {on ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div id={`${id}-a-${i}`} role="region" aria-labelledby={`${id}-q-${i}`} hidden={!on}>
              <p className="m-0 pr-[54px] pb-[22px] text-[15px] leading-[1.65] text-forge-slate [text-wrap:pretty]">{f.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
