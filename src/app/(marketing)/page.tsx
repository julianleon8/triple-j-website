import { SITE } from "@/lib/site";
import type { Metadata } from "next";

import { ForgeReveal } from "@/components/forge/ForgeReveal";
import { QuoteSection } from "@/components/forge/QuoteSection";
import { SectionHeading } from "@/components/forge/SectionHeading";
import { BuildsStrip } from "@/components/forge/home/BuildsStrip";
import { HomeHero } from "@/components/forge/home/HomeHero";
import { ServicesBand } from "@/components/forge/home/ServicesBand";
import { getBuilds } from "@/lib/forge-builds";

export const metadata: Metadata = {
  title: "Metal Carports, Garages & Barns, Temple TX",
  description:
    `Welded or bolted metal carports, garages, barns and RV covers from ${SITE.name}, Temple TX. Concrete available, same-week scheduling. Call ${SITE.phone}.`,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Metal Carports, Garages & Barns in Central Texas — Triple J Metal",
    description:
      "Welded or bolted metal buildings built by our Temple TX crew — concrete available, same-week scheduling.",
    url: "/",
    type: "website",
  },
};

// The builds strip and ticker read live gallery_items; refresh hourly so a
// job published in HQ shows up without a deploy.
export const revalidate = 3600;

/**
 * Homepage (Forge, 2026-10-02): Hero (navy) → Builds (white) → Services
 * (navy) → Quote (fog) → Footer (navy).
 */
export default async function HomePage() {
  const builds = await getBuilds({ order: "newest" });
  return (
    <>
      <HomeHero builds={builds.slice(0, 16)} />
      {builds.length ? (
        <BuildsStrip
          items={builds.slice(0, 8)}
          header={
            <ForgeReveal className="max-w-[720px]">
              <SectionHeading
                eyebrow="Our builds"
                headingId="builds-heading"
                line1="Real jobs, real addresses."
                line2="Built down the road."
                lede="Every photo is a Triple J crew job in Central Texas, pulled straight from our live gallery with the title and city we filed it under."
                ledeMax="max-w-[600px]"
              />
            </ForgeReveal>
          }
        />
      ) : null}
      <ServicesBand />
      <QuoteSection />
    </>
  );
}
