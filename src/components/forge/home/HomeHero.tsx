import Image from "next/image";
import Link from "next/link";

import { ForgeButtonLink } from "@/components/forge/ForgeButton";
import type { Locale } from "@/i18n/config";
import { HOME } from "@/i18n/pages/home";
import { localizeHref } from "@/i18n/routes";
import type { BuildItem } from "@/lib/forge-builds";

import { HeroMotion } from "./HeroMotion";
import { LatestBuildsTicker } from "./LatestBuildsTicker";

/** Inline links in the hero lede: underlined so they read as links on the photo. */
const HERO_LINK =
  "underline decoration-white/50 underline-offset-4 transition-colors duration-200 hover:decoration-white";

/** The Rogers 23×35 carport (Locked Decisions, hero photo). */
const HERO_PHOTO =
  "https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/items/f548bede-4068-4f8a-9f45-541bec33c5c4/1790436675921.jpg";

/**
 * Homepage hero. Centred, under a radial navy scrim, sitting beneath the
 * transparent header. Everything is visible at load (owner, 2026-10-02); the
 * only motion is the photo's zoom on scroll and the Latest builds ticker.
 */
export function HomeHero({ builds, locale }: { builds: readonly BuildItem[]; locale: Locale }) {
  const t = HOME[locale].hero;
  return (
    <section
      id="forge-hero"
      data-forge=""
      data-tone="dark"
      className="relative -mt-[72px] flex min-h-[max(560px,calc(100svh_-_72px))] flex-col overflow-clip bg-forge-navy text-white min-[900px]:-mt-[84px] min-[900px]:min-h-[max(600px,100svh)]"
    >
      <Image
        data-hero-img=""
        src={HERO_PHOTO}
        alt={t.imgAlt}
        fill
        priority
        sizes="100vw"
        className="origin-[50%_40%] object-cover object-[40%_50%] will-change-transform min-[900px]:object-center"
        style={{ transform: "scale(1.06)" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "var(--scrim-hero-home)" }} />

      <div className="relative flex flex-1 flex-col items-center justify-center px-5 pt-[108px] pb-16 text-center min-[900px]:pt-[120px]">
        <p className="m-0 inline-flex items-center gap-3.5 text-[clamp(11px,.3vw_+_9px,13px)] font-semibold uppercase tracking-[.22em] text-forge-silver">
          <span aria-hidden="true" className="h-[2px] w-[clamp(20px,3vw,48px)] bg-[linear-gradient(90deg,transparent,#788a9c)]" />
          {t.kicker}
          <span aria-hidden="true" className="h-[2px] w-[clamp(20px,3vw,48px)] bg-[linear-gradient(90deg,#788a9c,transparent)]" />
        </p>
        <h1 className="mt-[22px] font-forge-display text-[clamp(35px,7.4vw,104px)] font-black leading-[1.02] tracking-[.01em] text-white">
          <span className="block">{t.h1[0]}</span>
          <span className="block">{t.h1[1]}</span>
          {/* Padding keeps descenders and the gradient from clipping. */}
          <span className="-mx-[.14em] -mt-[.06em] -mb-[.2em] block px-[.14em] pt-[.06em] pb-[.2em]">
            <span className="forge-steel-text">{t.h1[2]}</span>
          </span>
        </h1>
        <p className="mx-auto mt-[22px] max-w-[560px] text-[clamp(16px,.4vw_+_14px,18px)] leading-[1.55] text-white/86">
          {t.lede.before}{" "}
          <Link href={localizeHref("/blog/welded-vs-bolted-metal-buildings-central-texas", locale)} className={HERO_LINK}>
            {t.lede.welded}
          </Link>{" "}
          {t.lede.middle}{" "}
          <Link href={localizeHref("/about", locale)} className={HERO_LINK}>
            {t.lede.crew}
          </Link>
          {t.lede.after}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
            {t.quote}
          </ForgeButtonLink>
          <ForgeButtonLink href="#gallery" variant="outlineDark" size="lg">
            {t.builds}
          </ForgeButtonLink>
        </div>
        <div
          data-hero-cue=""
          aria-hidden="true"
          className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[.22em] text-forge-silver"
        >
          <span>{t.scroll}</span>
          <span className="h-[34px] w-px bg-[linear-gradient(180deg,#c9d3dc,transparent)]" />
        </div>
      </div>

      <LatestBuildsTicker items={builds.map((b) => ({ id: b.id, title: b.title, city: b.city }))} />
      <HeroMotion heroId="forge-hero" />
    </section>
  );
}
