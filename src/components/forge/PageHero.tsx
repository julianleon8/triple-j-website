import Image from "next/image";
import type { ReactNode } from "react";

import { Eyebrow } from "./Eyebrow";
import { FactStrip, type Fact } from "./FactStrip";
import { type } from "./styles";

type Common = {
  breadcrumb: ReactNode;
  eyebrow?: ReactNode;
  eyebrowTone?: "dark" | "militaryDark";
  /** h1 line 1 */
  h1a: ReactNode;
  /** h1 line 2, in the steel gradient */
  h1b?: ReactNode;
  lede?: ReactNode;
  /** Buttons row */
  actions?: ReactNode;
  /** Rendered above the h1 (e.g. the military badges) instead of the eyebrow. */
  above?: ReactNode;
  /** Rendered after the actions (e.g. an eligibility line). */
  after?: ReactNode;
  /** Tailwind max-width for the content column. */
  contentMax?: string;
  ledeMax?: string;
};

type PhotoProps = Common & {
  variant?: "photo";
  image: { src: string; alt: string; position?: string };
  scrim?: "page" | "military";
  facts?: readonly Fact[];
  size?: "page" | "military";
  /** Bottom padding of the content column when there is no fact strip. */
  bottomPad?: string;
};

type PlainProps = Common & {
  variant: "plain";
  /** Right-hand slot on the plain navy header (e.g. the gallery CTA). */
  aside?: ReactNode;
};

function HeroCopy({
  eyebrow,
  eyebrowTone = "dark",
  h1a,
  h1b,
  lede,
  actions,
  above,
  after,
  ledeMax = "max-w-[620px]",
}: Common) {
  return (
    <>
      {above}
      {eyebrow ? <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow> : null}
      <h1 className={`${above || eyebrow ? "mt-[18px]" : ""} ${type.h1} text-white`}>
        {h1a}
        {h1b ? (
          <>
            <br />
            <span className="forge-steel-text">{h1b}</span>
          </>
        ) : null}
      </h1>
      {lede ? <p className={`mt-5 ${ledeMax} ${type.heroLede} text-white/86`}>{lede}</p> : null}
      {actions ? <div className="mt-[30px] flex flex-wrap gap-3">{actions}</div> : null}
      {after}
    </>
  );
}

/**
 * Inner-page hero. `photo` (default): full-bleed jobsite photo under a navy
 * scrim, content bottom-aligned, optional fact strip pinned to the bottom.
 * `plain`: a navy band with no photo (Gallery, Contact).
 */
export function PageHero(props: PhotoProps | PlainProps) {
  if (props.variant === "plain") {
    const { breadcrumb, aside, contentMax = "max-w-[760px]" } = props;
    return (
      <section
        data-forge=""
        data-tone="dark"
        className="bg-forge-navy pt-[clamp(24px,3vw,40px)] pb-[clamp(48px,5vw,72px)] text-white"
      >
        <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
          {breadcrumb}
          <div className="mt-[clamp(32px,4vw,56px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <div className={contentMax}>
              <HeroCopy {...props} ledeMax={props.ledeMax ?? "max-w-[600px]"} />
            </div>
            {aside}
          </div>
        </div>
      </section>
    );
  }

  const {
    breadcrumb,
    image,
    scrim = "page",
    facts,
    size = "page",
    contentMax = "max-w-[780px]",
    bottomPad,
  } = props;
  const hasFacts = Boolean(facts && facts.length);
  return (
    <section
      data-forge=""
      data-tone="dark"
      className={`relative flex flex-col overflow-hidden bg-forge-navy text-white ${
        size === "military" ? "min-h-[clamp(580px,52vw,720px)]" : "min-h-[clamp(560px,50vw,700px)]"
      }`}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: image.position ?? "50% 50%" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: scrim === "military" ? "var(--scrim-hero-military)" : "var(--scrim-hero-page)" }}
      />
      <div
        className={`relative mx-auto flex w-full max-w-[1360px] flex-1 flex-col px-[clamp(20px,3vw,40px)] pt-[clamp(24px,3vw,40px)] ${
          bottomPad ?? (hasFacts ? "pb-[clamp(40px,5vw,72px)]" : "pb-[clamp(48px,5vw,80px)]")
        }`}
      >
        {breadcrumb}
        <div className={`mt-auto pt-[clamp(40px,6vw,88px)] ${contentMax}`}>
          <HeroCopy {...props} />
        </div>
      </div>
      {hasFacts ? <FactStrip facts={facts!} /> : null}
    </section>
  );
}
