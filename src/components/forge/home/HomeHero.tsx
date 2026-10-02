import Image from "next/image";

import { ForgeButtonLink } from "@/components/forge/ForgeButton";
import type { BuildItem } from "@/lib/forge-builds";

import { HeroMotion } from "./HeroMotion";
import { LatestBuildsTicker } from "./LatestBuildsTicker";

/** The Rogers 23×35 carport (Locked Decisions, hero photo). */
const HERO_PHOTO =
  "https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/items/f548bede-4068-4f8a-9f45-541bec33c5c4/1790436675921.jpg";

/**
 * Homepage hero. Centred, under a radial navy scrim, sitting beneath the
 * transparent header. Everything is visible at load (owner, 2026-10-02); the
 * only motion is the photo's zoom on scroll and the Latest builds ticker.
 */
export function HomeHero({ builds }: { builds: readonly BuildItem[] }) {
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
        alt="23×35 carport with gutters built by Triple J Metal in Rogers, Texas"
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
          Family-owned · Temple, Texas
          <span aria-hidden="true" className="h-[2px] w-[clamp(20px,3vw,48px)] bg-[linear-gradient(90deg,#788a9c,transparent)]" />
        </p>
        <h1 className="mt-[22px] font-forge-display text-[clamp(35px,7.4vw,104px)] font-black leading-[1.02] tracking-[.01em] text-white">
          <span className="block">Built right.</span>
          <span className="block">Built fast.</span>
          {/* Padding keeps descenders and the gradient from clipping. */}
          <span className="-mx-[.14em] -mt-[.06em] -mb-[.2em] block px-[.14em] pt-[.06em] pb-[.2em]">
            <span className="forge-steel-text">Built by Triple J.</span>
          </span>
        </h1>
        <p className="mx-auto mt-[22px] max-w-[560px] text-[clamp(16px,.4vw_+_14px,18px)] leading-[1.55] text-white/86">
          Carports, garages, barns and patios, welded or bolted on your property by our own Central Texas crew.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ForgeButtonLink href="#quote" variant="white" size="lg" arrow>
            Get a Free Quote
          </ForgeButtonLink>
          <ForgeButtonLink href="#gallery" variant="outlineDark" size="lg">
            See Our Builds
          </ForgeButtonLink>
        </div>
        <div
          data-hero-cue=""
          aria-hidden="true"
          className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[.22em] text-forge-silver"
        >
          <span>Scroll</span>
          <span className="h-[34px] w-px bg-[linear-gradient(180deg,#c9d3dc,transparent)]" />
        </div>
      </div>

      <LatestBuildsTicker items={builds.map((b) => ({ id: b.id, title: b.title, city: b.city }))} />
      <HeroMotion heroId="forge-hero" />
    </section>
  );
}
