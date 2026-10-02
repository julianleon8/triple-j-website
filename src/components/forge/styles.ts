/**
 * Forge class maps — the variant → class tables behind the Forge primitives.
 *
 * Kept apart from the components so they can be unit-tested without
 * rendering (see styles.test.ts).
 * Every value is a literal string so Tailwind's scanner sees it.
 * Spec: docs/redesign-2026-10/forge-handoff/forge-design-system/readme.md
 */

export type ForgeButtonVariant = "white" | "navy" | "outlineDark" | "outlineLight" | "linkAccent";
export type ForgeButtonSize = "lg" | "md" | "sm" | "tap";

export const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-[6px] font-semibold leading-[1.55] whitespace-nowrap " +
  "transition-[background-color,border-color,color] duration-200 ease-forge " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export const buttonVariants: Record<ForgeButtonVariant, string> = {
  white: "bg-white text-forge-navy hover:bg-forge-silver",
  navy: "bg-forge-navy text-white hover:bg-forge-navy-raised",
  outlineDark: "border border-white/40 text-white hover:border-white hover:bg-white/[.08]",
  outlineLight: "border border-forge-silver bg-white text-forge-navy hover:border-forge-navy",
  // The one royal-blue exception (service-page "Related" row), owner-requested 2026-10-02.
  linkAccent: "bg-forge-link text-white shadow-[0_1px_2px_rgba(0,0,0,.08)] duration-150 hover:bg-forge-link-hover",
};

export const buttonSizes: Record<ForgeButtonSize, string> = {
  lg: "px-[26px] py-[15px] text-[16px]",
  md: "px-5 py-[13px] text-[15px]",
  sm: "px-[18px] py-[11px] text-[14px]",
  tap: "h-11 px-[18px] text-[14px]",
};

/** The trailing → is slate inside a white button and inherits everywhere else. */
export const buttonArrowClass: Record<ForgeButtonVariant, string> = {
  white: "text-forge-slate",
  navy: "",
  outlineDark: "",
  outlineLight: "",
  linkAccent: "",
};

export function buttonClass(
  variant: ForgeButtonVariant,
  size: ForgeButtonSize,
  fullWidth = false,
  extra = "",
): string {
  return [buttonBase, buttonVariants[variant], buttonSizes[size], fullWidth ? "w-full" : "", extra]
    .filter(Boolean)
    .join(" ");
}

// ── Selectable pills ────────────────────────────────────────────────────────

export type PillTone = "navy" | "olive";

export const pillBase =
  "inline-flex h-[42px] items-center justify-center rounded-[6px] border px-4 text-[14px] font-semibold " +
  "transition-colors duration-200 ease-forge cursor-pointer";

export const pillUnselected = "border-forge-silver bg-white text-forge-navy hover:border-forge-steel";

export const pillSelected: Record<PillTone, string> = {
  navy: "border-forge-navy bg-forge-navy text-white",
  olive: "border-forge-olive bg-forge-olive text-white",
};

export function pillClass(selected: boolean, tone: PillTone = "navy", extra = ""): string {
  return [pillBase, selected ? pillSelected[tone] : pillUnselected, extra].filter(Boolean).join(" ");
}

// ── Sections ────────────────────────────────────────────────────────────────

export type SectionTone = "white" | "fog" | "navy";
export type SectionPad = "default" | "sm" | "xs" | "none";

export const sectionTones: Record<SectionTone, string> = {
  white: "bg-white text-forge-navy",
  fog: "bg-forge-fog text-forge-navy",
  navy: "bg-forge-navy text-white",
};

export const sectionPads: Record<SectionPad, string> = {
  default: "py-[clamp(64px,7vw,104px)]",
  sm: "py-[clamp(48px,5vw,80px)]",
  xs: "py-8",
  none: "",
};

/** `data-tone` drives the focus-ring colour in globals.css (silver on navy). */
export function sectionDataTone(tone: SectionTone): "dark" | "light" {
  return tone === "navy" ? "dark" : "light";
}

// ── Type scale ──────────────────────────────────────────────────────────────

export const type = {
  h1: "font-forge-display font-black tracking-[.01em] leading-[1.04] text-[clamp(34px,4.4vw_+_6px,76px)] [text-wrap:balance]",
  h2: "font-forge-display font-black tracking-[.01em] leading-[1.05] text-[clamp(30px,3vw_+_12px,56px)]",
  h2Compact: "font-forge-display font-black tracking-[.01em] leading-[1.1] text-[clamp(26px,2.2vw_+_12px,44px)]",
  h3Card: "font-forge-display font-bold leading-[1.25] text-[19px]",
  lede: "text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.55] [text-wrap:pretty]",
  heroLede: "text-[clamp(16px,.4vw_+_14px,18px)] leading-[1.6] [text-wrap:pretty]",
  micro: "text-[11px] font-bold uppercase tracking-[.2em]",
  fieldLabel: "text-[11px] font-bold uppercase tracking-[.18em] text-forge-slate",
} as const;

/** 1360px container with the Forge gutter. */
export const containerClass = "mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]";

/** Split grid that stacks without breakpoints. */
export const splitClass = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-[clamp(32px,4vw,72px)]";

/** Card grid (300px min tracks). */
export const cardGridClass = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4";
