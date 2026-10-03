"use client";

import type { ReactNode } from "react";

import { requestQuote, type QuoteRequest } from "@/lib/forge-quote";

import { buttonClass, type ForgeButtonSize, type ForgeButtonVariant } from "./styles";

/**
 * A Forge button that preselects the page's quote form and scrolls to it. It
 * is a plain link to #quote, so it still jumps there without JS; on a page
 * with no quote section it opens /quote with the service preselected.
 */
export function QuoteRequestButton({
  request,
  variant = "navy",
  size = "md",
  fullWidth = false,
  arrow = false,
  className = "",
  children,
}: {
  request: QuoteRequest;
  variant?: ForgeButtonVariant;
  size?: ForgeButtonSize;
  fullWidth?: boolean;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href="#quote"
      onClick={(e) => {
        e.preventDefault();
        if (!requestQuote(request)) {
          const q = request.service ? `?service=${request.service}` : "";
          window.location.href = `/quote${q}`;
        }
      }}
      className={buttonClass(variant, size, fullWidth, className)}
    >
      {children}
      {arrow ? (
        <span aria-hidden="true" className={variant === "white" ? "text-forge-slate" : ""}>
          →
        </span>
      ) : null}
    </a>
  );
}
