import type { Metadata } from "next";

import { BuilderApp } from "@/components/builder/BuilderApp";
import { MarketingAttribution } from "@/components/site/MarketingAttribution";

/**
 * The 3D builder. Live but unlisted: no menu link, no sitemap entry and
 * noindex until the owner and the crew approve the draft ruleset in
 * src/lib/builder/catalog.ts (owner's call, 2026-10-14). Going public means
 * removing `robots` below and adding the links; see Locked Decisions.
 */
export const metadata: Metadata = {
  title: "3D Builder",
  description:
    "Design your carport, RV cover, garage or barn in 3D, welded or bolted, then send it to Triple J Metal for a free quote.",
  alternates: { canonical: "/build" },
  robots: { index: false, follow: false },
};

export default function BuildPage() {
  return (
    <>
      <MarketingAttribution />
      <BuilderApp />
    </>
  );
}
