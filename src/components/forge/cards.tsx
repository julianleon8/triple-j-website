import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/** Two-digit Cinzel numeral, "01". */
export function numeral(i: number): string {
  return String(i + 1).padStart(2, "0");
}

/** White card with a "01 ———" numeral row, Cinzel title and slate body. */
export function FeatureCard({
  index,
  title,
  children,
  tone = "white",
}: {
  index: number;
  title: ReactNode;
  children: ReactNode;
  /** `fog` is the Partners offer card (fog on white). */
  tone?: "white" | "fog";
}) {
  return (
    <div
      className={`flex flex-col gap-2.5 rounded-[12px] border border-forge-silver px-6 pt-6 pb-[26px] ${
        tone === "fog" ? "bg-forge-fog" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="font-forge-display text-[14px] font-bold text-forge-steel">{numeral(index)}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-forge-mist" />
      </div>
      <h3 className="mt-1.5 font-forge-display text-[19px] font-bold leading-[1.25] text-forge-navy">{title}</h3>
      <p className="m-0 text-[15px] leading-[1.6] text-forge-slate [text-wrap:pretty]">{children}</p>
    </div>
  );
}

/**
 * Numbered list row used in navy bands ("How we work", "Why a local crew"):
 * a 44px numeral column (Cinzel 700 15px steel), Cinzel title, body.
 * Place inside a container with a matching top border.
 */
export function NumberedRow({
  index,
  title,
  children,
  tone = "dark",
  pad = "md",
}: {
  index: number;
  title: ReactNode;
  children: ReactNode;
  tone?: "dark" | "light";
  /** `md` 22px rows (About), `sm` 20px rows (locations). */
  pad?: "md" | "sm";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`grid grid-cols-[44px_minmax(0,1fr)] gap-3 border-b ${pad === "sm" ? "py-5" : "py-[22px]"} ${
        dark ? "border-forge-silver/[.18]" : "border-forge-mist"
      }`}
    >
      <span className="pt-0.5 font-forge-display text-[15px] font-bold text-forge-steel">{numeral(index)}</span>
      <div>
        <h3 className={`m-0 font-forge-display text-[19px] font-bold ${dark ? "text-white" : "text-forge-navy"}`}>{title}</h3>
        <p className={`mt-1.5 text-[15px] leading-[1.6] [text-wrap:pretty] ${dark ? "text-white/75" : "text-forge-slate"}`}>
          {children}
        </p>
      </div>
    </div>
  );
}

/** Photo tile with a bottom-up scrim, Cinzel title, sub and "Explore … →". */
export function PhotoCard({
  href,
  img,
  imgPosition,
  title,
  sub,
  cta,
}: {
  href: string;
  img: string;
  imgPosition?: string;
  title: string;
  sub?: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[12px] border border-forge-silver bg-forge-slate p-[22px] text-white"
    >
      <Image
        src={img}
        alt=""
        fill
        sizes="(min-width: 900px) 440px, 100vw"
        className="object-cover"
        style={{ objectPosition: imgPosition ?? "50% 50%" }}
      />
      <span aria-hidden="true" className="absolute inset-0" style={{ background: "var(--scrim-photo-card)" }} />
      <span className="relative font-forge-display text-[24px] font-black leading-[1.1]">{title}</span>
      {sub ? <span className="relative mt-1.5 text-[14px] text-white/82">{sub}</span> : null}
      <span className="relative mt-3.5 text-[14px] font-semibold text-forge-silver group-hover:text-white">
        {cta} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

/** Navy spec panel: header, k/v rows, footnote. */
export function SpecSheet({
  title,
  rows,
  footnote,
}: {
  title: string;
  rows: readonly { k: string; v: string }[];
  footnote?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-forge-silver/[.22] bg-forge-navy-raised">
      <p className="border-b border-forge-silver/[.16] px-[22px] py-[18px] text-[11px] font-bold uppercase tracking-[.2em] text-forge-silver">
        {title}
      </p>
      <dl className="m-0">
        {rows.map((r) => (
          <div
            key={r.k}
            className="grid grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)] gap-4 border-b border-forge-silver/[.12] px-[22px] py-4"
          >
            <dt className="text-[13px] text-forge-steel-light">{r.k}</dt>
            <dd className="m-0 text-[15px] font-semibold text-white">{r.v}</dd>
          </div>
        ))}
      </dl>
      {footnote ? <p className="px-[22px] py-4 text-[12px] leading-[1.5] text-forge-steel-light">{footnote}</p> : null}
    </div>
  );
}

/** 28×2 steel bars (24×2 tan on the military page) before each line. */
export function RuleList({
  items,
  tone = "steel",
  className = "",
  itemClassName = "text-[15px]",
}: {
  items: readonly ReactNode[];
  tone?: "steel" | "tan";
  className?: string;
  itemClassName?: string;
}) {
  return (
    <ul className={`m-0 flex list-none flex-col gap-3 p-0 ${className}`}>
      {items.map((t, i) => (
        <li key={i} className={`flex items-center gap-3 ${itemClassName}`}>
          <span
            aria-hidden="true"
            className={`h-[2px] flex-none ${tone === "tan" ? "w-6 bg-forge-tan" : "w-7 bg-forge-steel"}`}
          />
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Underlined text link: 1px silver underline that darkens to navy. */
export function UnderlineLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const cls = `border-b border-forge-silver pb-0.5 text-[15px] font-semibold text-forge-navy transition-colors duration-200 hover:border-forge-navy ${className}`;
  if (/^(tel:|mailto:|https?:)|#/.test(href)) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
