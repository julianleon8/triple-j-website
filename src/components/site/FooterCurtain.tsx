"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Homepage footer "curtain": the footer's content rises from
 * -(span × depth) to its resting place as the footer scrolls into view, so
 * the page reads as lifting off it. The footer clips the overflow. Transforms
 * are written straight to the DOM from one rAF-throttled scroll listener — no
 * React re-render per frame. Homepage only; off under prefers-reduced-motion.
 */
export function FooterCurtain({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = usePathname() === "/";

  useEffect(() => {
    if (!enabled) return;
    const inner = ref.current;
    const footer = inner?.closest("footer");
    if (!inner || !footer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let lastY = Number.NaN;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const top = footer.getBoundingClientRect().top;
      const span = Math.min(footer.offsetHeight, vh) || 1;
      const p = Math.max(0, Math.min(1, (vh - top) / span));
      const depth = 0.55 * (window.innerWidth >= 900 ? 1 : 0.75);
      const y = -(1 - p) * span * depth;
      if (y !== lastY) {
        inner.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`;
        lastY = y;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      inner.style.transform = "";
    };
  }, [enabled]);

  return (
    <div ref={ref} className={`${enabled ? "will-change-transform" : ""} ${className}`}>
      {children}
    </div>
  );
}
