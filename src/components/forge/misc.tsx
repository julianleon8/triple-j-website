import type { ComponentProps, ReactNode } from "react";

/** 44×44 icon button. `onDark` = white outline on navy; `onLight` = silver outline. */
export function ForgeIconButton({
  tone = "onDark",
  round = false,
  className = "",
  children,
  type = "button",
  ...props
}: ComponentProps<"button"> & { tone?: "onDark" | "onLight"; round?: boolean; children: ReactNode }) {
  const toneCls =
    tone === "onDark"
      ? "border-white/30 text-white hover:border-white"
      : "border-forge-silver bg-white text-forge-navy hover:border-forge-navy";
  return (
    <button
      type={type}
      className={`inline-flex size-11 flex-none cursor-pointer items-center justify-center border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
        round ? "rounded-full bg-[rgba(0,24,42,.6)]" : tone === "onDark" ? "rounded-[8px]" : "rounded-[6px]"
      } ${toneCls} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Map frame with a lazy Google Maps embed and a navy callout in the corner.
 */
export function MapBand({
  src,
  title,
  callout,
}: {
  src: string;
  title: string;
  callout: ReactNode;
}) {
  return (
    <div className="relative h-[clamp(320px,36vw,460px)] overflow-hidden rounded-[12px] border border-forge-silver bg-forge-mist">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 size-full border-0"
      />
      <div className="absolute bottom-4 left-4 max-w-[calc(100%-32px)] rounded-[10px] bg-forge-navy px-[18px] py-4 text-white shadow-[var(--shadow-float-dark)]">
        {callout}
      </div>
    </div>
  );
}
