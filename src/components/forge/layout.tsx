import type { ComponentProps, ReactNode } from "react";

import {
  containerClass,
  sectionDataTone,
  sectionPads,
  sectionTones,
  type SectionPad,
  type SectionTone,
} from "./styles";

export function ForgeContainer({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`${containerClass} ${className}`} {...props} />;
}

type SectionProps = Omit<ComponentProps<"section">, "children"> & {
  tone?: SectionTone;
  pad?: SectionPad;
  /** Wrap children in the 1360px container (default true). */
  contained?: boolean;
  containerClassName?: string;
  children: ReactNode;
};

/**
 * A full-width Forge band. Sets `data-forge` (escapes the legacy unlayered
 * heading rules) and `data-tone` (silver focus ring on navy).
 */
export function ForgeSection({
  tone = "white",
  pad = "default",
  contained = true,
  className = "",
  containerClassName = "",
  children,
  ...props
}: SectionProps) {
  return (
    <section
      data-forge=""
      data-tone={sectionDataTone(tone)}
      className={`${sectionTones[tone]} ${sectionPads[pad]} ${className}`}
      {...props}
    >
      {contained ? <ForgeContainer className={containerClassName}>{children}</ForgeContainer> : children}
    </section>
  );
}
