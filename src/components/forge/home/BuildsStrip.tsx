"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

import { ForgeIconButton } from "@/components/forge/misc";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import type { BuildItem } from "@/lib/forge-builds";

/**
 * The homepage's horizontal builds strip: snap-scrolling cards that bleed to
 * the viewport edges, prev/next buttons on desktop, and a drift — the track
 * eases in from the right as the section scrolls into view. Off under
 * prefers-reduced-motion.
 */
export function BuildsStrip({ items, header }: { items: readonly BuildItem[]; header: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const strip = stripRef.current;
    const track = trackRef.current;
    if (!section || !strip || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const desktop = window.innerWidth >= 900;
      const overflow = Math.max(0, track.scrollWidth - strip.clientWidth);
      const drift = Math.min(overflow * (desktop ? 0.35 : 0.25), desktop ? 480 : 300);
      const top = section.getBoundingClientRect().top;
      const q = Math.max(0, Math.min(1, (vh - top) / (vh * 0.9)));
      const eased = 1 - Math.pow(1 - q, 2);
      track.style.transform = `translate3d(${((1 - eased) * drift).toFixed(2)}px,0,0)`;
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
      track.style.transform = "";
    };
  }, []);

  const by = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: el.clientWidth * 0.8 * dir, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="gallery"
      data-forge=""
      data-tone="light"
      aria-labelledby="builds-heading"
      className="scroll-mt-20 bg-white py-[clamp(40px,7vw,104px)] text-forge-navy"
    >
      <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          {header}
          <div className="flex items-center gap-[18px]">
            <Link
              href="/gallery"
              className="border-b border-forge-silver pb-0.5 text-[15px] font-semibold text-forge-navy transition-colors hover:border-forge-navy"
            >
              See the full gallery →
            </Link>
            <div className="hidden gap-2 min-[900px]:flex">
              <ForgeIconButton tone="onLight" aria-label="Previous builds" onClick={() => by(-1)}>
                <ArrowLeftIcon width={18} height={18} />
              </ForgeIconButton>
              <ForgeIconButton tone="onLight" aria-label="Next builds" onClick={() => by(1)}>
                <ArrowRightIcon width={18} height={18} />
              </ForgeIconButton>
            </div>
          </div>
        </div>
        <div
          ref={stripRef}
          className="forge-no-scrollbar -mx-[clamp(20px,3vw,40px)] mt-10 snap-x snap-mandatory overflow-x-auto px-[clamp(20px,3vw,40px)] pt-1 pb-3"
        >
          <ul ref={trackRef} className="m-0 flex list-none gap-4 p-0">
            {items.map((b) => (
              <li key={b.id} className="flex-[0_0_min(380px,80vw)] snap-start">
                <Link
                  href={`/gallery/${b.id}`}
                  className="flex h-full flex-col overflow-hidden rounded-[12px] border border-forge-silver bg-forge-mist transition-[border-color,box-shadow] duration-300 ease-forge hover:border-forge-steel hover:shadow-[var(--shadow-card-hover)]"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-forge-slate">
                    <Image
                      src={b.img}
                      alt={b.alt}
                      fill
                      sizes="(min-width: 640px) 380px, 80vw"
                      className="object-cover"
                      unoptimized={b.img.startsWith("/")}
                    />
                  </span>
                  <span className="block flex-1 bg-white px-[18px] pt-4 pb-[18px]">
                    <span className="block text-[11px] font-semibold uppercase tracking-[.2em] text-forge-steel">{b.city}</span>
                    <span className="mt-1.5 block font-forge-display text-[18px] font-bold leading-[1.2] tracking-[.01em] text-forge-navy">
                      {b.title}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
