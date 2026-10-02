import type { ReactNode } from "react";

import { Eyebrow } from "./Eyebrow";
import { type } from "./styles";

type Props = {
  eyebrow?: ReactNode;
  /** First headline line — states. */
  line1: ReactNode;
  /** Second line — answers. Slate on light, steel gradient on dark. */
  line2?: ReactNode;
  /** Keep both lines on one run of text instead of breaking after line1. */
  inline?: boolean;
  lede?: ReactNode;
  /** Tailwind max-width class for the lede. */
  ledeMax?: string;
  tone?: "light" | "dark";
  eyebrowTone?: "light" | "dark" | "military" | "militaryDark";
  align?: "start" | "center";
  size?: "h2" | "compact";
  as?: "h1" | "h2";
  balance?: boolean;
  className?: string;
  ledeClassName?: string;
};

export function SectionHeading({
  eyebrow,
  line1,
  line2,
  inline = false,
  lede,
  ledeMax = "max-w-[560px]",
  tone = "light",
  eyebrowTone,
  align = "start",
  size = "h2",
  as: Tag = "h2",
  balance = false,
  className = "",
  ledeClassName = "",
}: Props) {
  const dark = tone === "dark";
  const centered = align === "center";
  return (
    <div className={`${centered ? "flex flex-col items-center text-center" : ""} ${className}`}>
      {eyebrow ? (
        <Eyebrow tone={eyebrowTone ?? (dark ? "dark" : "light")} align={align}>
          {eyebrow}
        </Eyebrow>
      ) : null}
      <Tag
        className={`${eyebrow ? "mt-4" : "m-0"} ${size === "compact" ? type.h2Compact : type.h2} ${
          dark ? "text-white" : "text-forge-navy"
        } ${balance ? "[text-wrap:balance]" : ""}`}
      >
        {line1}
        {line2 ? (
          <>
            {inline ? " " : <br />}
            <span className={dark ? "forge-steel-text" : "text-forge-slate"}>{line2}</span>
          </>
        ) : null}
      </Tag>
      {lede ? (
        <p
          className={`mt-4 ${type.lede} ${ledeMax} ${dark ? "text-white/80" : "text-forge-slate"} ${ledeClassName}`}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}
