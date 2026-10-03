import { ForgeReveal } from "@/components/forge/ForgeReveal";
import { QuoteSection } from "@/components/forge/QuoteSection";
import { SectionHeading } from "@/components/forge/SectionHeading";
import { BuildsStrip } from "@/components/forge/home/BuildsStrip";
import { HomeHero } from "@/components/forge/home/HomeHero";
import { ServicesBand } from "@/components/forge/home/ServicesBand";
import type { Locale } from "@/i18n/config";
import { HOME } from "@/i18n/pages/home";
import type { BuildItem } from "@/lib/forge-builds";

/**
 * Homepage (Forge, 2026-10-02): Hero (navy) → Builds (white) → Services
 * (navy) → Quote (fog) → Footer (navy). Rendered by `/` and `/es`; the route
 * files fetch the builds (gallery-revalidate.test.ts wants that fetch in
 * a page.tsx).
 */
export function HomePage({ locale, builds }: { locale: Locale; builds: readonly BuildItem[] }) {
  const t = HOME[locale].builds;
  return (
    <>
      <HomeHero builds={builds.slice(0, 16)} locale={locale} />
      {builds.length ? (
        <BuildsStrip
          items={builds.slice(0, 8)}
          header={
            <ForgeReveal className="max-w-[720px]">
              <SectionHeading
                eyebrow={t.eyebrow}
                headingId="builds-heading"
                line1={t.line1}
                line2={t.line2}
                lede={t.lede}
                ledeMax="max-w-[600px]"
              />
            </ForgeReveal>
          }
        />
      ) : null}
      <ServicesBand locale={locale} />
      <QuoteSection locale={locale} />
    </>
  );
}
