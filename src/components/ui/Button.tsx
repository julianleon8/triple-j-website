import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline-dark";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  children: ReactNode;
  className?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-tight " +
  "transition-all duration-200 rounded-md whitespace-nowrap " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-[color:var(--color-brand-600)] text-white " +
    "hover:bg-[color:var(--color-brand-700)] " +
    "shadow-sm hover:shadow-md " +
    "focus-visible:ring-[color:var(--color-brand-600)]",
  secondary:
    "bg-white text-[color:var(--color-ink-900)] " +
    "border border-[color:var(--color-ink-200)] " +
    "hover:bg-[color:var(--color-ink-50)] " +
    "focus-visible:ring-[color:var(--color-ink-400)]",
  ghost:
    "bg-transparent text-[color:var(--color-ink-900)] " +
    "hover:bg-[color:var(--color-ink-50)] " +
    "focus-visible:ring-[color:var(--color-ink-400)]",
  "outline-dark":
    "bg-transparent text-white border border-white/30 " +
    "hover:bg-white/10 hover:border-white/60 " +
    "focus-visible:ring-white/70",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

// --- Link variant -----------------------------------------------------------

type LinkButtonProps = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children">;

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  className = "",
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && iconPosition === "left" ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
      {icon && iconPosition === "right" ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
    </Link>
  );
}

// --- Native <button> variant -----------------------------------------------

type ButtonProps = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children">;

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && iconPosition === "left" ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
      {icon && iconPosition === "right" ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
    </button>
  );
}
