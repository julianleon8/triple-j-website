import type { ReactNode } from "react";

type Tone = "light" | "dark" | "military" | "militaryDark";

const toneClass: Record<Tone, string> = {
  light: "text-forge-slate",
  dark: "text-forge-silver",
  military: "text-forge-olive forge-eyebrow--military",
  militaryDark: "text-forge-tan forge-eyebrow--military",
};

/**
 * 12px Inter 600 uppercase label with a 32×2 steel rule before it (and a
 * mirrored one after it when centred). `light` sits on white/fog, `dark` on
 * navy or photo, `military` uses olive text and a tan rule.
 */
export function Eyebrow({
  children,
  tone = "light",
  align = "start",
  as: Tag = "p",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  align?: "start" | "center";
  as?: "p" | "span" | "div";
  className?: string;
}) {
  return (
    <Tag
      className={`forge-eyebrow m-0 ${toneClass[tone]} ${align === "center" ? "forge-eyebrow--center" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
