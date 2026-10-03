"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from "@/components/ui/icons";
import { UI, buildWord } from "@/i18n/copy/ui";
import { useLocale } from "@/i18n/use-locale";
import type { BuildItem } from "@/lib/forge-builds";

/**
 * Full-screen build viewer. role="dialog" aria-modal; Esc closes, ←/→ step
 * through `items` (the caller passes the filtered list), Tab is trapped, the
 * page scroll is locked, and focus returns to the card that opened it.
 */
export function ForgeLightbox({
  items,
  index,
  onIndex,
  onClose,
  onQuote,
  returnFocusTo,
}: {
  items: readonly BuildItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  onQuote?: (item: BuildItem) => void;
  returnFocusTo?: HTMLElement | null;
}) {
  const locale = useLocale();
  const t = UI[locale];
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = items[index];
  const n = items.length;

  const step = useCallback(
    (d: number) => {
      if (!n) return;
      onIndex((index + d + n) % n);
    },
    [index, n, onIndex],
  );

  useEffect(() => {
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      returnFocusTo?.focus();
    };
    // Mount/unmount only: re-running on every step would steal focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "Tab" && dialogRef.current) {
        const f = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button, a[href]"));
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  if (!item) return null;

  const roundBtn =
    "inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border border-white/30 bg-[rgba(0,24,42,.6)] text-white transition-colors hover:border-white";

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      data-forge=""
      data-tone="dark"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex flex-col bg-[rgba(0,12,22,.94)] font-sans text-white"
    >
      <div className="flex items-center justify-between gap-4 px-5 py-3.5">
        <span className="text-[13px] font-semibold tracking-[.2em] text-forge-steel-light tabular-nums" aria-live="polite">
          {index + 1} / {n}
        </span>
        <button
          ref={closeRef}
          type="button"
          aria-label={t.close}
          onClick={onClose}
          className="inline-flex size-11 cursor-pointer items-center justify-center rounded-[8px] border border-white/30 text-white transition-colors hover:border-white"
        >
          <CloseIcon width={20} height={20} />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center gap-3 px-3">
        <button
          type="button"
          aria-label={t.prevPhoto}
          onClick={(e) => {
            e.stopPropagation();
            step(-1);
          }}
          className={roundBtn}
        >
          <ArrowLeftIcon width={18} height={18} />
        </button>
        {/* Plain <img>: the lightbox shows the full photo at its natural ratio. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.img}
          alt={item.alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[calc(100vh_-_210px)] min-w-0 max-w-[min(1100px,calc(100%_-_112px))] rounded-[8px] object-contain shadow-[var(--shadow-lightbox)]"
        />
        <button
          type="button"
          aria-label={t.nextPhoto}
          onClick={(e) => {
            e.stopPropagation();
            step(1);
          }}
          className={roundBtn}
        >
          <ArrowRightIcon width={18} height={18} />
        </button>
      </div>
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto flex w-full max-w-[1140px] flex-wrap items-end justify-between gap-4 px-5 pt-[18px] pb-6"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-forge-steel-light">
            {buildWord(item.type, locale)} · {buildWord(item.city, locale)}
          </p>
          <h2 className="mt-1.5 font-forge-display text-[clamp(20px,2.4vw,28px)] font-bold leading-[1.2]">{item.title}</h2>
        </div>
        {onQuote ? (
          <button
            type="button"
            onClick={() => onQuote(item)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-[6px] bg-white px-[22px] py-3.5 text-[15px] font-semibold text-forge-navy transition-colors hover:bg-forge-silver"
          >
            {t.quoteLikeThis} <span aria-hidden="true" className="text-forge-slate">→</span>
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
