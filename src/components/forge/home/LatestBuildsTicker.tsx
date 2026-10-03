"use client";

import { useEffect, useRef } from "react";

import { UI, buildWord } from "@/i18n/copy/ui";
import { useLocale } from "@/i18n/use-locale";

type TickerItem = { id: string; title: string; city: string };

/**
 * "Latest builds" ticker pinned to the bottom of the homepage hero: real
 * active gallery items, newest first, looped. Drifts at 40px/s and speeds up
 * with scroll velocity (up to +520px/s); pauses while the hero is off screen;
 * static under prefers-reduced-motion. Transforms are written to the DOM from
 * one rAF loop.
 */
export function LatestBuildsTicker({ items }: { items: readonly TickerItem[] }) {
  const locale = useLocale();
  const barRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const track = trackRef.current;
    if (!bar || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = true;
    const io = new IntersectionObserver((e) => {
      visible = e.some((x) => x.isIntersecting);
    });
    io.observe(bar);

    let raf = 0;
    let x = 0;
    let vel = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000));
      lastT = now;
      const y = window.scrollY;
      vel += ((y - lastY) / dt - vel) * 0.12;
      lastY = y;
      if (!visible) return;
      const half = track.scrollWidth / 2;
      if (!half) return;
      x = (x + (40 + Math.min(Math.abs(vel) * 0.5, 520)) * dt) % half;
      track.style.transform = `translate3d(${(-x).toFixed(2)}px,0,0)`;
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  if (!items.length) return null;
  // Two copies make a seamless loop; the second is hidden from assistive tech.
  const loop = [...items, ...items];
  return (
    <div
      ref={barRef}
      className="relative flex items-center overflow-hidden border-t border-forge-silver/[.22] bg-[rgba(0,24,42,.72)] text-[14px] text-white/88 backdrop-blur-[6px]"
    >
      <b className="relative z-[1] flex-none border-r border-forge-slate bg-forge-navy py-3.5 pr-[22px] pl-[clamp(20px,3vw,40px)] text-[12px] font-bold uppercase tracking-[.2em] text-forge-silver">
        {UI[locale].latestBuilds}
      </b>
      <div ref={trackRef} className="flex gap-11 whitespace-nowrap pl-7 will-change-transform">
        {loop.map((t, i) => (
          <span key={`${t.id}-${i}`} aria-hidden={i >= items.length ? true : undefined} className="flex-none">
            {t.title}
            <em className="ml-1.5 not-italic text-forge-steel">{buildWord(t.city, locale)}</em>
          </span>
        ))}
      </div>
    </div>
  );
}
