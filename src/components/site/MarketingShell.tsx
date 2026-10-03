import type { ReactNode } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MobileCallBar } from "@/components/site/MobileCallBar";
import { GoogleAdsTag } from "@/components/seo/GoogleAdsTag";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { MarketingAttribution } from "@/components/site/MarketingAttribution";
import type { Locale } from "@/i18n/config";

/**
 * The public site's chrome, shared by the English `(marketing)` and the
 * Spanish `es` root layouts so the two can never drift apart.
 *
 * Scoped to LIGHT mode only (colorScheme + explicit bg/text) so the
 * iOS-PWA dark-mode-aware tokens used by /hq don't flip marketing
 * pages into white-on-white.
 *
 * The `marketing` class scopes the Barlow Condensed h1/h2/h3 rule in
 * globals.css to this tree ONLY, so HQ (iPhone PWA) headings inherit
 * the iOS stack instead of the magazine display face. Forge surfaces
 * (data-forge) step out of that rule.
 *
 * No PreFooterCta here: Forge pages end with their own quote section, and
 * the routes without one render PreFooterCta themselves (2026-10-02).
 */
export function MarketingShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <div
      className="marketing flex flex-1 flex-col bg-white text-forge-navy"
      style={{ colorScheme: "light" }}
    >
      <OrganizationJsonLd />
      <MarketingAttribution />
      <GoogleAdsTag />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
      <MobileCallBar />
    </div>
  );
}
