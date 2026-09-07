import { SITE } from "@/lib/site";
import Image from "next/image";
import type { Metadata } from "next";
import { Gallery } from "@/components/sections/Gallery";
import { Crew } from "@/components/sections/Crew";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { ServiceAreas } from "@/components/sections/ServiceAreas";
import { Services } from "@/components/sections/Services";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Metal Carports, Garages & Barns in Temple, Central Texas",
  description:
    `Turnkey metal buildings welded or bolted on-site by ${SITE.name} — Temple, TX. Carports, garages, barns, RV covers with concrete pads. Same-week scheduling across Bell, Coryell, and McLennan counties. Call ${SITE.phone}.`,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Metal Carports, Garages & Barns in Central Texas — Triple J Metal",
    description:
      "Welded or bolted metal buildings built by our Temple TX crew — turnkey with concrete, same-week scheduling.",
    url: "/",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <section className="relative -mt-20 overflow-hidden bg-ink-900 text-white">
        <Image
          src="/images/red-iron-frame-hero.jpg"
          alt="Red iron framing on a Triple J Metal construction site in Central Texas"
          fill priority sizes="100vw" className="object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 hero-scrim" />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <Container size="wide" className="relative pt-36 pb-16 sm:pt-44 sm:pb-24 lg:pt-48 lg:pb-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">Family-owned · Temple, Texas</p>
            <h1 className="mt-6 font-display text-6xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-[88px]">
              Your land.<br />Your plans.<br /><span className="text-brand-300">Our steel.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85">
              Carports, garages, barns, and patios. Welded or bolted,
              built on your property by our Central Texas crew.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[400px]:flex-row">
              <ButtonLink href="#gallery" size="lg" variant="secondary">Explore Our Builds</ButtonLink>
              <ButtonLink href="#quote" size="lg">Get a Free Quote</ButtonLink>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/20 pt-5 text-sm text-white/80">
            <span>Welded or bolted</span><span>Our own crew</span><span>Same-week scheduling</span>
          </div>
        </Container>
      </section>
      <Gallery />
      <Services />
      <Crew />
      <HowItWorks />
      <ServiceAreas />
      <QuoteForm />
    </>
  );
}
