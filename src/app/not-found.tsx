import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { ForgeButtonLink } from "@/components/forge/ForgeButton";
import { Eyebrow } from "@/components/forge/Eyebrow";
import { buttonClass, type } from "@/components/forge/styles";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SITE } from "@/lib/site";

/**
 * Sitewide 404 page.
 *
 * Caught by Next 16's app router whenever:
 *   - A user types a URL that doesn't match any route, OR
 *   - A dynamic route handler calls `notFound()` (e.g. /locations/[slug]
 *     for an unknown slug, /services/[slug], /blog/[slug], /quotes/[token]).
 *
 * Without this file, Next ships its default unstyled 404 — no header,
 * no footer, no brand, no recovery links. For a contractor running paid
 * ads, every typo'd or stale-indexed URL becomes a hard bounce.
 *
 * Rendered at the root level → it does NOT inherit the (marketing)
 * route group's layout (which adds Header / Footer / chrome). We
 * intentionally render minimal chrome here — three explicit recovery
 * links to the highest-converting surfaces.
 *
 * The /hq route group also short-circuits to this on bad slugs, but
 * since /hq is auth-gated and only the owner sees it, the same minimal
 * shell works for both audiences.
 */

export const metadata: Metadata = {
  title: "Page not found",
  // Don't index 404 responses — they pollute organic indexing.
  robots: { index: false, follow: false },
};

// The quote link goes to /quote, the dedicated quote page (it pointed at
// /contact, which is now a message form); its line follows the response lock.
const RECOVERY_LINKS = [
  {
    label: "Browse our metal building services",
    href: "/services",
    description: "Carports, garages, barns, RV covers, lean-tos, and house additions.",
  },
  {
    label: "Find your city's service page",
    href: "/locations",
    description: "Same-week installs across Bell, McLennan, Coryell, and Williamson counties.",
  },
  {
    label: "Get a free quote",
    href: "/quote",
    description: "Two quick steps — we call you back within 24 hours. Or call us directly.",
  },
] as const;

export default function NotFound() {
  return (
    <div data-forge="" className="flex min-h-screen flex-col bg-forge-fog text-forge-navy" style={{ colorScheme: "light" }}>
      {/* Slim brand bar — no full Header (which is a client component
          that pulls in extra deps). Lighter footprint, same recovery
          quality. */}
      <header data-forge="" data-tone="dark" className="border-b border-forge-silver/15 bg-forge-navy text-white">
        <div className="mx-auto flex h-[72px] w-full max-w-[1360px] items-center justify-between px-[clamp(20px,3vw,40px)]">
          <Link
            href="/"
            aria-label={`${SITE.name} home`}
            className="inline-flex items-center gap-3 font-forge-display text-[22px] font-black text-white"
          >
            <Image src="/images/logo-lion.png" alt="" width={40} height={40} className="size-10 flex-none object-contain" />
            {SITE.name}
          </Link>
          <a href={SITE.phoneHref} className="text-[15px] font-semibold tabular-nums text-white/85 transition-colors hover:text-white">
            {SITE.phone}
          </a>
        </div>
      </header>

      <main className="flex-1 py-[clamp(64px,8vw,112px)]">
        <div className="mx-auto w-full max-w-[760px] px-[clamp(20px,3vw,40px)]">
          <div className="flex flex-col items-center text-center">
            <Eyebrow align="center">404 — Page not found</Eyebrow>
            <h1 className={`mt-[18px] ${type.h2} text-forge-navy`}>That page isn&rsquo;t here.</h1>
            <p className={`mx-auto mt-5 max-w-[560px] ${type.lede} text-forge-slate`}>
              The link may have been retired, mistyped, or was part of an
              old deploy. Pick one of the routes below — or call us directly
              and we&rsquo;ll get you to the right place.
            </p>
          </div>

          <ul className="mt-12 flex flex-col gap-3">
            {RECOVERY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-start justify-between gap-4 rounded-[12px] border border-forge-silver bg-white px-6 py-5 transition-colors duration-200 hover:border-forge-steel"
                >
                  <div>
                    <p className="font-forge-display text-[19px] font-bold text-forge-navy">{link.label}</p>
                    <p className="mt-1 text-[14px] text-forge-slate">{link.description}</p>
                  </div>
                  <ArrowRightIcon className="mt-1 h-5 w-5 shrink-0 text-forge-steel transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-forge-navy" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <ForgeButtonLink href="/" variant="navy" size="lg">
              Back to home
            </ForgeButtonLink>
            <a href={SITE.phoneHref} className={buttonClass("outlineLight", "lg")}>
              Call <span className="tabular-nums">{SITE.phone}</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
