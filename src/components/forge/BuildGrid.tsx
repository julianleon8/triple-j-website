"use client";

import { useState } from "react";

import { localizeHref } from "@/i18n/routes";
import { useLocale } from "@/i18n/use-locale";
import type { BuildItem } from "@/lib/forge-builds";
import { quoteServiceForGalleryType, requestQuote } from "@/lib/forge-quote";

import { BuildCard } from "./BuildCard";
import { ForgeLightbox } from "./ForgeLightbox";

/**
 * A grid of build cards wired to the lightbox. "Quote a build like this"
 * preselects the matching service on the page's quote form, or opens /quote
 * when the page has none.
 */
export function BuildGrid({
  items,
  variant = "compact",
  className = "mt-9 grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4",
  sizes,
}: {
  items: readonly BuildItem[];
  variant?: "compact" | "gallery";
  className?: string;
  sizes?: string;
}) {
  const locale = useLocale();
  const [open, setOpen] = useState<number | null>(null);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);

  return (
    <>
      <div className={className}>
        {items.map((item, i) => (
          <BuildCard
            key={item.id}
            item={item}
            variant={variant}
            sizes={sizes}
            onOpen={(el) => {
              setTrigger(el);
              setOpen(i);
            }}
          />
        ))}
      </div>
      {open !== null ? (
        <ForgeLightbox
          items={items}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          returnFocusTo={trigger}
          onQuote={(item) => {
            const service = quoteServiceForGalleryType(item.type);
            setOpen(null);
            // Wait a frame so the scroll lock is released before scrolling.
            requestAnimationFrame(() => {
              if (!requestQuote({ service })) window.location.href = localizeHref(`/quote?service=${service}`, locale);
            });
          }}
        />
      ) : null}
    </>
  );
}
