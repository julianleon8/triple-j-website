import type { ReactNode } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MobileCallBar } from "@/components/site/MobileCallBar";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";

/**
 * Layout for the public marketing site.
 * Wraps the homepage, services, gallery, locations, about, contact.
 * Dashboard / login / setup / customer-facing quotes DO NOT use this layout.
 *
 * Scoped to LIGHT mode only (colorScheme + explicit bg/text) so the
 * iOS-PWA dark-mode-aware tokens used by /hq don't flip marketing
 * pages into white-on-white. Dark-mode-aware public site is a Phase C
 * rework gated on inspiration screenshots.
 */
export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="bg-white text-[color:var(--color-ink-900)] flex-1 flex flex-col"
      style={{ colorScheme: "light" }}
    >
      <OrganizationJsonLd />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileCallBar />
    </div>
  );
}
