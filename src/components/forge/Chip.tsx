import Link from "next/link";
import type { ReactNode } from "react";

/** 36px neighborhood chip; `linked` = navy border + 600, hover mist. */
export function Chip({
  children,
  href,
  size = "md",
}: {
  children: ReactNode;
  href?: string;
  /** `md` 36px/14px (location coverage), `sm` 34px/13px (contact service area). */
  size?: "md" | "sm";
}) {
  const dims = size === "sm" ? "h-[34px] px-3.5 text-[13px]" : "h-9 px-3.5 text-[14px]";
  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center rounded-full border border-forge-navy bg-white font-semibold text-forge-navy transition-colors duration-200 hover:bg-forge-mist ${dims}`}
      >
        {children}
      </Link>
    );
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border border-forge-silver bg-white font-medium ${
        size === "sm" ? "text-forge-slate" : "text-forge-navy"
      } ${dims}`}
    >
      {children}
    </span>
  );
}

/** 38px county toggle chip with a `+` / `✓` glyph; selected = navy fill. */
export function ToggleChip({
  selected,
  onToggle,
  children,
}: {
  selected: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`inline-flex h-[38px] cursor-pointer items-center gap-2 rounded-full border px-3.5 text-[14px] font-semibold transition-colors duration-200 ${
        selected
          ? "border-forge-navy bg-forge-navy text-white"
          : "border-forge-silver bg-white text-forge-navy hover:border-forge-steel"
      }`}
    >
      <span aria-hidden="true" className="text-[13px]">
        {selected ? "✓" : "+"}
      </span>
      {children}
    </button>
  );
}
