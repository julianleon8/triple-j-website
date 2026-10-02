"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";

import type { BuildItem } from "@/lib/forge-builds";

/**
 * A gallery build as a card. Always a real link to /gallery/[id] so it is
 * crawlable; when `onOpen` is given, a plain click opens the lightbox instead
 * (modified clicks still open the page in a new tab).
 */
export function BuildCard({
  item,
  variant = "compact",
  onOpen,
  sizes = "(min-width: 1200px) 320px, (min-width: 640px) 45vw, 100vw",
}: {
  item: BuildItem;
  variant?: "compact" | "gallery";
  onOpen?: (trigger: HTMLElement) => void;
  sizes?: string;
}) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onOpen || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onOpen(e.currentTarget);
  };
  const gallery = variant === "gallery";
  return (
    <Link
      href={`/gallery/${item.id}`}
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-[12px] border border-forge-silver bg-white text-forge-navy transition-[border-color,box-shadow] duration-300 ease-forge hover:border-forge-steel hover:shadow-[var(--shadow-card-hover)]"
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-forge-slate">
        <Image
          src={item.img}
          alt={item.alt}
          fill
          sizes={sizes}
          className="object-cover"
          unoptimized={item.img.startsWith("/")}
        />
      </span>
      <span className={`flex w-full items-end justify-between gap-3 ${gallery ? "px-[18px] pt-4 pb-[18px]" : "px-4 pt-3.5 pb-4"}`}>
        <span className="block min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-[.2em] text-forge-slate">
            {item.type} · {item.city}
          </span>
          <span
            className={`mt-1.5 block font-forge-display font-bold leading-[1.25] ${gallery ? "text-[19px]" : "text-[17px]"}`}
          >
            {item.title}
          </span>
        </span>
        {gallery ? (
          <span className="flex-none text-[13px] font-semibold text-forge-slate">
            View <span aria-hidden="true">→</span>
          </span>
        ) : null}
      </span>
    </Link>
  );
}
