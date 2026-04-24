import Image from "next/image";
import type { Metadata } from "next";

import { Gallery } from "@/components/sections/Gallery";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { ServiceAreas } from "@/components/sections/ServiceAreas";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrustBar } from "@/components/sections/TrustBar";
import { WhyTripleJ } from "@/components/sections/WhyTripleJ";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, PhoneIcon } from "@/components/ui/icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Metal Carports, Garages & Barns in Temple, Central Texas",
  description:
    "Turnkey metal buildings welded or bolted on-site by Triple J Metal LLC — Temple, TX. Carports, garages, barns, RV covers with concrete pads. Same-week scheduling across Bell, Coryell, and McLennan counties. Call 254-346-7764.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Metal Carports, Garages & Barns in Central Texas — Triple J Metal",
    description:
      "Welded or bolted metal buildings built by our Temple TX crew — turnkey with concrete, same-week scheduling.",
    url: "/",
    type: "website",
  },
};

/**
 * Homepage.
 *
 * Section order:
 *   1. Hero            — Phase 1
 *   2. TrustBar        — Phase 2  (4-up stats, dark)
 *   3. Services        — Phase 2  (4-card grid)
 *   4. WhyTripleJ      — Phase 2  (welded vs bolted)
 *   5. HowItWorks      — Phase 2  (3-step, dark)
 *   6. Gallery         — Phase 3  (photo grid)
 *   7. Testimonials    — Phase 2  (placeholder reviews)
 *   8. ServiceAreas    — Phase 3  (5 city cards, link to /locations/[slug])
 *   9. QuoteForm       — Phase 3  (wired to POST /api/leads)
 */
export default function HomePage() {
  return (
    <>
      {/* ------------------------------------------------------------------
          1. HERO  (v2 — magazine-quality dark, blue/black/white + red pill)
          --------------------------------------------------------------
          Visual language locked: gradient-over-photo background (photo lib
          is limited; gradient does the magazine work). Strict palette:
          white text + brand-blue button + ONE red eyebrow pill. No
          additional accent colors. When better hero photos land in
          public/images/hero/, swap the `src` below — treatment stays.
          -------------------------------------------------------------- */}
      <section className="relative -mt-20 bg-black text-white overflow-hidden">
        {/* Background image with slow ken-burns motion */}
        <div className="absolute inset-0 bg-kenburns">
          <Image
            src="/images/red-iron-frame-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-55"
          />
        </div>
        {/* Diagonal gradient overlay — black-dominant left (where text
            sits), subtle brand-blue tint right. Pinned via .hero-gradient
            in globals.css. */}
        <div className="absolute inset-0 hero-gradient" />

        <Container size="wide" className="relative py-28 sm:py-36 lg:py-48">
          <div className="max-w-3xl">
            {/* Red eyebrow pill — single concentrated pop of red on the page.
                Hero entrance choreography: each element wears .hero-anim +
                a data-hero-step="N" — the timeline lives in globals.css. */}
            <span
              data-hero-step="1"
              className="hero-anim inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm"
            >
              Built in Texas
            </span>

            {/* Massive Barlow Condensed headline. Each "BUILT _____." line
                wrapped in its own block-span so they reveal in sequence
                (~120ms apart) for a rhythmic stagger. */}
            <h1 className="mt-6 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-white text-6xl sm:text-7xl md:text-8xl lg:text-9xl">
              <span data-hero-step="2" className="hero-anim block">
                Built right.
              </span>
              <span data-hero-step="3" className="hero-anim block">
                Built fast.
              </span>
              <span data-hero-step="4" className="hero-anim block">
                Built across
              </span>
              <span data-hero-step="5" className="hero-anim block">
                Central Texas.
              </span>
            </h1>

            <p
              data-hero-step="6"
              className="hero-anim mt-8 text-lg sm:text-xl leading-relaxed text-white/75 max-w-2xl"
            >
              Custom welded carports, garages, and barns — engineered, fabricated, and
              installed on your property by an in-house crew. No kits. No subs.
            </p>

            <div
              data-hero-step="7"
              className="hero-anim mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
            >
              <ButtonLink
                href="#quote"
                variant="primary"
                size="lg"
                icon={<ArrowRightIcon className="h-5 w-5" />}
                iconPosition="right"
              >
                Get a Free Quote
              </ButtonLink>
              {/* Ghost phone link — lower visual weight than the primary
                  button so the CTA hierarchy is clean. */}
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center gap-2 text-base font-semibold text-white/85 hover:text-white transition-colors"
              >
                <PhoneIcon className="h-5 w-5" />
                Call {SITE.phone}
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <p data-hero-step="8" className="hero-anim mt-10 text-sm text-white/55">
              Family-owned · Temple, TX · {SITE.stats.projects} projects · Founded{" "}
              {SITE.established}
            </p>
          </div>
        </Container>
      </section>

      <TrustBar />
      <Services />
      <WhyTripleJ />
      <HowItWorks />
      <Gallery />
      <Testimonials />
      <ServiceAreas />
      <QuoteForm />
    </>
  );
}
