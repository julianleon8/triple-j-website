"use client";

import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { requestQuote, type QuoteRequest } from "@/lib/forge-quote";

export type ForgeOption = {
  label: string;
  title: string;
  body: string;
  price?: string;
  note?: string;
  img?: string;
  imgAlt?: string;
  /** What "Quote this →" preselects on the page's quote form. */
  quote?: QuoteRequest;
};

/**
 * Service-page option picker: heading and a vertical tab list on the left,
 * the selected option's card on the right, in a split grid that stacks on
 * phones. Arrow keys, Home and End move between tabs.
 */
export function OptionTabs({
  options,
  heading,
}: {
  options: readonly ForgeOption[];
  /** Eyebrow + heading + lede, rendered above the tabs. */
  heading: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const opt = options[active] ?? options[0];
  if (!opt) return null;

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = options.length - 1;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(32px,4vw,72px)]">
      <div>
        {heading}
        <div role="tablist" aria-orientation="vertical" onKeyDown={onKey} className="mt-8 flex flex-col gap-2.5">
          {options.map((o, i) => {
            const on = i === active;
            return (
              <button
                key={o.label}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={on}
                aria-controls={`${id}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(i)}
                className={`flex w-full cursor-pointer items-center gap-4 rounded-[10px] border px-[18px] py-4 text-left transition-colors duration-300 ease-forge ${
                  on
                    ? "border-forge-navy bg-forge-navy text-white"
                    : "border-forge-silver bg-white text-forge-navy hover:border-forge-steel"
                }`}
              >
                <span className={`font-forge-display text-[14px] font-bold ${on ? "text-forge-steel-light" : "text-forge-steel"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 font-forge-display text-[18px] font-bold">{o.label}</span>
                <span aria-hidden="true">→</span>
              </button>
            );
          })}
        </div>
      </div>
      <OptionCard option={opt} id={`${id}-panel`} labelledBy={`${id}-tab-${active}`} />
    </div>
  );
}

export function OptionCard({
  option,
  id,
  labelledBy,
}: {
  option: ForgeOption;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      className="overflow-hidden rounded-[12px] border border-forge-silver bg-white shadow-[var(--shadow-lifted)]"
    >
      {/* No photo → no image area. Never ship the striped placeholder. */}
      {option.img ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-forge-mist">
          <Image
            src={option.img}
            alt={option.imgAlt ?? option.title}
            fill
            sizes="(min-width: 900px) 640px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="p-[clamp(20px,2vw,32px)]">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-forge-slate">{option.label}</p>
        <h3 className="mt-2 font-forge-display text-[clamp(22px,.8vw_+_16px,28px)] font-bold leading-[1.2] text-forge-navy">
          {option.title}
        </h3>
        <p className="mt-3 text-[15px] leading-[1.65] text-forge-slate [text-wrap:pretty]">{option.body}</p>
        <div className="mt-[22px] flex flex-wrap items-center justify-between gap-3.5 border-t border-forge-mist pt-[18px]">
          <div className="flex flex-col gap-0.5">
            {option.price ? (
              <b className="font-forge-display text-[20px] font-bold tabular-nums text-forge-navy">{option.price}</b>
            ) : null}
            {option.note ? <span className="text-[12px] text-forge-slate">{option.note}</span> : null}
          </div>
          <a
            href="#quote"
            onClick={(e) => {
              if (requestQuote(option.quote ?? {})) e.preventDefault();
            }}
            className="inline-flex items-center gap-2 rounded-[6px] bg-forge-navy px-5 py-[13px] text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-forge-navy-raised"
          >
            Quote this <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
