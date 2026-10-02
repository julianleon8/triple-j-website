import Image from "next/image";
import Link from "next/link";

import { ForgeButtonLink } from "@/components/forge/ForgeButton";
import { ForgeReveal } from "@/components/forge/ForgeReveal";
import { QuoteRequestButton } from "@/components/forge/QuoteRequestButton";
import { SectionHeading } from "@/components/forge/SectionHeading";

/**
 * Homepage service cards. "From $X" figures are the steel + install floors
 * from dev/sales-pack-2026-04-30.md (carport 20×20 $3,000; garage 30×30
 * $5,500; barn $6,500, Decisions 2026-10-01). Never improvise a price here.
 */
const SERVICE_CARDS = [
  {
    eyebrow: "Carports & RV Covers",
    headline: "Welded or bolted, residential or ranch.",
    blurb:
      "Single, double, triple, custom spans — or extra-tall clearance for RVs, boats and trailers. Built and installed by our crew, usually within the week.",
    img: "/images/carport-gable-residential.jpg",
    price: "3,000",
    href: "/services/carports",
  },
  {
    eyebrow: "Garages",
    headline: "Enclosed shop space — your spec, our crew.",
    blurb:
      "30×30 bolted steel-and-install base starts here. Walls, roll-up doors, walk-throughs, and insulation are quoted on top per your spec.",
    img: "/images/metal-garage-green.jpg",
    price: "5,500",
    href: "/services/metal-garages",
  },
  {
    eyebrow: "Barns",
    headline: "Pole, equipment, hay — built to span.",
    blurb: "Long clear-spans for ag and ranch use. Welded red-iron primary, sheet on the skin.",
    img: "/images/carport-concrete-rural.jpg",
    price: "6,500",
    href: "/services/barns",
  },
] as const;

export function ServicesBand() {
  return (
    <section
      id="services"
      data-forge=""
      data-tone="dark"
      aria-labelledby="services-heading"
      className="overflow-clip bg-forge-navy py-[clamp(64px,7vw,104px)] text-white"
    >
      <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
        <ForgeReveal className="max-w-[760px]">
          <SectionHeading
            tone="dark"
            eyebrow="What we build"
            headingId="services-heading"
            line1="Welded or bolted."
            line2="Built whole, by us."
            lede="Every structure is sold welded, bolted, or turnkey — with turnkey, site prep, concrete and installation sit on one contract. No kits, no subcontractors."
            ledeMax="max-w-[640px]"
          />
        </ForgeReveal>
        <ForgeReveal stagger className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
          {SERVICE_CARDS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex flex-col overflow-hidden rounded-[12px] border border-forge-silver/[.22] bg-forge-navy-raised transition-colors duration-300 hover:border-forge-silver/50"
            >
              <span className="relative block aspect-[5/4] overflow-hidden bg-forge-slate">
                <Image src={s.img} alt={s.headline} fill sizes="(min-width: 1200px) 320px, (min-width: 640px) 45vw, 100vw" className="object-cover" />
              </span>
              <span className="flex flex-1 flex-col px-5 pt-[18px] pb-5">
                <span className="text-[11px] font-semibold uppercase tracking-[.2em] text-forge-silver">{s.eyebrow}</span>
                <span className="mt-2 font-forge-display text-[20px] font-bold leading-[1.2] tracking-[.01em] text-white">{s.headline}</span>
                <span className="mt-2.5 text-[14px] leading-[1.55] text-white/72">{s.blurb}</span>
                <span className="mt-auto flex items-center justify-between gap-3 border-t border-forge-silver/[.18] pt-3.5 text-[13px]">
                  <span className="leading-[1.4] text-forge-silver">
                    From <b className="whitespace-nowrap text-white tabular-nums">${s.price}</b>{" "}
                    <span className="whitespace-nowrap">steel + install</span>
                  </span>
                  <span className="whitespace-nowrap font-semibold text-forge-silver">See builds →</span>
                </span>
              </span>
            </Link>
          ))}

          <div className="relative flex min-h-full flex-col overflow-hidden rounded-[12px] border border-forge-silver/45 bg-forge-slate">
            <Image
              src="/images/metal-fence-ranch-wire.webp"
              alt="Metal ranch fencing built by Triple J Metal"
              fill
              sizes="(min-width: 1200px) 320px, (min-width: 640px) 45vw, 100vw"
              className="object-cover object-[60%_50%]"
            />
            <div aria-hidden="true" className="absolute inset-0" style={{ background: "var(--scrim-photo-card-strong)" }} />
            <div className="relative flex flex-1 flex-col justify-end p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-forge-silver">Now quoting fencing</p>
              <h3 className="mt-2 font-forge-display text-[clamp(24px,1.2vw_+_14px,30px)] font-black leading-[1.1] tracking-[.01em] text-white">
                Metal fences. Gates. <span className="forge-steel-text">A better boundary.</span>
              </h3>
              <p className="mt-2.5 text-[14px] leading-[1.55] text-white/80">
                Privacy, pipe and ranch, and ornamental metal fencing for Temple, Belton, Killeen and nearby.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <ForgeButtonLink href="/services/metal-fencing" variant="white" size="md" arrow>
                  Explore fencing &amp; gates
                </ForgeButtonLink>
                <QuoteRequestButton request={{ service: "fencing", target: "quote-card" }} variant="outlineDark" size="md">
                  Get a fencing quote
                </QuoteRequestButton>
              </div>
            </div>
          </div>
        </ForgeReveal>
      </div>
    </section>
  );
}
