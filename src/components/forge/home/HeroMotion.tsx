"use client";

import { useEffect } from "react";

/**
 * The homepage hero's only scroll motion (owner, 2026-10-02: everything is
 * visible at load; no pinned reveal). As the hero scrolls away its photo
 * zooms from 1.06 to 1.16 and the "Scroll" cue fades out. Written straight to
 * the DOM from a rAF-throttled listener, so React never re-renders per frame.
 * Off under prefers-reduced-motion.
 */
export function HeroMotion({ heroId }: { heroId: string }) {
  useEffect(() => {
    const hero = document.getElementById(heroId);
    const img = hero?.querySelector<HTMLElement>("[data-hero-img]");
    const cue = hero?.querySelector<HTMLElement>("[data-hero-cue]");
    if (!hero || !img) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const h = hero.offsetHeight || 1;
      const p = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / h));
      img.style.transform = `scale(${(1.06 + 0.1 * p).toFixed(4)})`;
      if (cue) cue.style.opacity = String(Math.max(0, 1 - p / 0.12).toFixed(3));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [heroId]);
  return null;
}
