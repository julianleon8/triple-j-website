"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

const EASE = "cubic-bezier(.22,1,.36,1)";

/**
 * One-shot scroll reveal: fade + rise as the block enters the viewport.
 *
 * The server renders the block fully visible, so it reads with JS off and
 * nothing flashes. After hydration, a block that is still below the fold is
 * hidden and revealed when 8% of it enters view; a block already on screen is
 * left alone. Off under prefers-reduced-motion.
 *
 * `stagger` reveals the direct children one after another (90ms apart,
 * 22px rise, 700ms) instead of the block as a whole.
 */
export function ForgeReveal({
  children,
  as: Tag = "div",
  stagger = false,
  className,
  style,
  id,
}: {
  children: ReactNode;
  as?: ElementType;
  stagger?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    const targets: HTMLElement[] = stagger ? (Array.from(el.children) as HTMLElement[]) : [el];
    const rise = stagger ? 22 : 16;
    const dur = stagger ? 700 : 600;
    for (const t of targets) {
      t.style.opacity = "0";
      t.style.transform = `translateY(${rise}px)`;
    }
    const show = () => {
      targets.forEach((t, i) => {
        t.style.transition = `opacity ${dur}ms ${EASE} ${stagger ? i * 90 : 0}ms, transform ${dur}ms ${EASE} ${stagger ? i * 90 : 0}ms`;
        t.style.opacity = "1";
        t.style.transform = "none";
      });
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          show();
          io.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      for (const t of targets) {
        t.style.opacity = "";
        t.style.transform = "";
        t.style.transition = "";
      }
    };
  }, [stagger]);

  return (
    <Tag ref={ref} id={id} className={className} style={style}>
      {children}
    </Tag>
  );
}
