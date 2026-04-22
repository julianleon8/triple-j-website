import Image from "next/image";

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
          1. HERO
          -------------------------------------------------------------- */}
      <section className="relative bg-[color:var(--color-ink-900)] text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/red-iron-frame-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--color-ink-950)]/85 via-[color:var(--color-ink-900)]/60 to-[color:var(--color-ink-900)]" />
        </div>

        <Container size="wide" className="relative py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-brand-400)]/40 bg-[color:var(--color-brand-600)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-brand-300)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-brand-400)]" />
              Built in Under 48 Hours
            </span>
            <h1 className="mt-6 text-white">
              Custom Metal Buildings in{" "}
              <span className="text-[color:var(--color-brand-300)]">
                Central Texas
              </span>{" "}
              — Built in Under 48 Hours
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/75 max-w-2xl">
              Welded red-iron carports, garages, and barns — site prep and
              concrete included. One company, one contract, one weekend. Serving
              all of Central Texas from Temple.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <ButtonLink
                href="#quote"
                variant="primary"
                size="lg"
                icon={<ArrowRightIcon className="h-5 w-5" />}
                iconPosition="right"
              >
                Get a Free Quote
              </ButtonLink>
              <ButtonLink
                href={SITE.phoneHref}
                variant="outline-dark"
                size="lg"
                icon={<PhoneIcon className="h-5 w-5" />}
              >
                Call {SITE.phone}
              </ButtonLink>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <ButtonLink href="/locations" variant="outline-dark" size="sm">
                Service locations
              </ButtonLink>
              <ButtonLink href="/services/colors" variant="outline-dark" size="sm">
                Color chart
              </ButtonLink>
              <ButtonLink href="/services/pbr-vs-pbu-panels" variant="outline-dark" size="sm">
                PBR vs PBU guide
              </ButtonLink>
            </div>
            <p className="mt-6 text-sm text-white/50">
              Family-owned · Temple, TX · {SITE.stats.projects} projects completed
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
