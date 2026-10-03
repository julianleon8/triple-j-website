import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import {
  buttonArrowClass,
  buttonClass,
  type ForgeButtonSize,
  type ForgeButtonVariant,
} from "./styles";

type CommonProps = {
  variant?: ForgeButtonVariant;
  size?: ForgeButtonSize;
  /** Trailing → (aria-hidden; slate inside a white button). */
  arrow?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

function Arrow({ variant }: { variant: ForgeButtonVariant }) {
  return (
    <span aria-hidden="true" className={buttonArrowClass[variant]}>
      →
    </span>
  );
}

type ButtonProps = CommonProps & Omit<ComponentProps<"button">, "className" | "children">;

export function ForgeButton({
  variant = "navy",
  size = "md",
  arrow = false,
  fullWidth = false,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, fullWidth, className)} {...props}>
      {children}
      {arrow ? <Arrow variant={variant} /> : null}
    </button>
  );
}

type LinkProps = CommonProps &
  Omit<ComponentProps<"a">, "className" | "children" | "href"> & {
    href: string;
    prefetch?: boolean;
  };

/**
 * A link styled as a Forge button.
 *
 * Hash links (`#quote`, `/#quote`), `tel:`, `mailto:` and absolute URLs render
 * a plain <a>. Android in-app browsers (Messenger, Marketplace) swallow
 * <Link>'s router-driven scroll, so an in-page jump must be a plain anchor
 * (Locked Decisions, 2026-09-30). Everything else routes through <Link>.
 */
export function ForgeButtonLink({
  variant = "white",
  size = "md",
  arrow = false,
  fullWidth = false,
  className = "",
  children,
  href,
  prefetch,
  ...props
}: LinkProps) {
  const cls = buttonClass(variant, size, fullWidth, className);
  const content = (
    <>
      {children}
      {arrow ? <Arrow variant={variant} /> : null}
    </>
  );
  if (isPlainAnchor(href)) {
    return (
      <a href={href} className={cls} {...props}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} prefetch={prefetch} className={cls} {...props}>
      {content}
    </Link>
  );
}

export function isPlainAnchor(href: string): boolean {
  return href.includes("#") || /^(tel:|mailto:|sms:|https?:)/.test(href);
}
