import Link from "next/link";
import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
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
    href: "/contact",
    description: "Same-day callback. Or call us directly.",
  },
] as const;

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col bg-white text-[color:var(--color-ink-900)]"
      style={{ colorScheme: "light" }}
    >
      {/* Slim brand bar — no full Header (which is a client component
          that pulls in extra deps). Lighter footprint, same recovery
          quality. */}
      <header className="border-b border-[color:var(--color-ink-100)] bg-[color:var(--color-ink-900)] text-white">
        <Container size="wide">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="font-display font-extrabold uppercase tracking-tight text-xl text-white"
            >
              Triple J{" "}
              <span className="text-[color:var(--color-brand-400)]">Metal</span>
            </Link>
            <a
              href={SITE.phoneHref}
              className="text-sm font-semibold tabular-nums text-white/85 hover:text-white"
            >
              {SITE.phone}
            </a>
          </div>
        </Container>
      </header>

      <main className="flex-1 py-20 md:py-28">
        <Container size="narrow">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-600)]">
              404 — Page not found
            </p>
            <h1 className="mt-4 font-display font-extrabold uppercase tracking-tight text-5xl md:text-6xl leading-[1.05]">
              That page isn&rsquo;t here.
            </h1>
            <p className="mt-5 text-lg text-[color:var(--color-ink-600)] max-w-xl mx-auto leading-relaxed">
              The link may have been retired, mistyped, or was part of an
              old deploy. Pick one of the routes below — or call us directly
              and we&rsquo;ll get you to the right place.
            </p>
          </div>

          <ul className="mt-12 space-y-3">
            {RECOVERY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-start justify-between gap-4 rounded-2xl border border-[color:var(--color-ink-200)] bg-white px-5 py-5 hover:border-[color:var(--color-brand-400)] hover:bg-[color:var(--color-ink-50)] transition-colors"
                >
                  <div>
                    <p className="text-lg font-semibold text-[color:var(--color-ink-900)] group-hover:text-[color:var(--color-brand-600)]">
                      {link.label}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--color-ink-600)]">
                      {link.description}
                    </p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 mt-1 shrink-0 text-[color:var(--color-ink-400)] group-hover:text-[color:var(--color-brand-600)] transition-colors" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3">
            <ButtonLink href="/" variant="primary" size="lg">
              Back to home
            </ButtonLink>
            <ButtonLink href={SITE.phoneHref} variant="outline-dark" size="lg" className="!border-[color:var(--color-ink-300)] !text-[color:var(--color-ink-800)] hover:!bg-[color:var(--color-ink-50)] hover:!border-[color:var(--color-ink-500)]">
              Call {SITE.phone}
            </ButtonLink>
          </div>
        </Container>
      </main>
    </div>
  );
}
