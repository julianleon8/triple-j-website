"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";

import { useReveal } from "@/lib/use-reveal";

type RevealProps = {
  children: ReactNode;
  /** Stagger delay in ms applied to the transition. Default 0. */
  delay?: number;
  /** Render-as element. Default `div`. */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

/**
 * Wrapper that scroll-reveals its content with a fade + slide-up.
 * Server-component-safe to host (this component itself is client-only,
 * but server components can render it as a child).
 *
 * Stagger pattern — wrap each item in `<Reveal delay={i * 80}>` to get
 * a cascading reveal across a list. Each item observes itself, so cards
 * in a tall grid still reveal as the user scrolls past them.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  style,
}: RevealProps) {
  const ref = useReveal<HTMLElement>();
  const mergedStyle: CSSProperties = {
    ...style,
    ["--reveal-delay" as string]: `${delay}ms`,
  };
  return (
    <Tag
      ref={ref}
      className={className ? `reveal ${className}` : "reveal"}
      style={mergedStyle}
    >
      {children}
    </Tag>
  );
}
