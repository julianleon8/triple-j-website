"use client";

import { useEffect, useRef } from "react";
import { Info, TriangleAlert, X } from "lucide-react";

import { useBuilder } from "./store";

/** Amber, not red: the site keeps red out of its UI. 5:1 on white. */
export const WARN = "#b45309";
const SHOW_MS = { error: 7000, info: 4500 } as const;

/**
 * What the builder just refused, or a short note, over the 3D view where the
 * visitor is looking. Visual only: the live region in BuilderApp reads the
 * same text aloud.
 */
export function BuilderToast() {
  const toast = useBuilder((s) => s.toast);
  const dismiss = useBuilder((s) => s.dismissToast);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ref.current?.animate(
        [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 180, easing: "cubic-bezier(.22,1,.36,1)" },
      );
    }
    const seq = toast.seq;
    const t = setTimeout(() => {
      if (useBuilder.getState().toast?.seq === seq) dismiss();
    }, SHOW_MS[toast.tone]);
    return () => clearTimeout(t);
  }, [toast, dismiss]);

  if (!toast) return null;
  const error = toast.tone === "error";
  const Icon = error ? TriangleAlert : Info;
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-[60px] z-20 flex justify-center">
      <div
        ref={ref}
        className="pointer-events-auto flex w-full max-w-[480px] items-start gap-2.5 rounded-[10px] border border-l-[5px] py-2.5 pl-3 pr-1 shadow-[0_8px_28px_rgba(0,24,42,.22)]"
        style={{ borderColor: error ? WARN : "#00182a", background: error ? "#fffaf2" : "#ffffff" }}
      >
        <Icon aria-hidden="true" className="mt-[1px] size-5 flex-none" strokeWidth={2.2} style={{ color: error ? WARN : "#00182a" }} />
        <p className="m-0 min-w-0 flex-1 py-px text-[14px] font-semibold leading-[1.4] text-forge-navy">{toast.text}</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss message"
          className="-my-1.5 inline-flex size-10 flex-none cursor-pointer items-center justify-center rounded-[6px] text-forge-slate hover:text-forge-navy"
        >
          <X aria-hidden="true" className="size-4" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
