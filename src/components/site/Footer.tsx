import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { FacebookIcon, InstagramIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { NAV_LINKS, SERVICES, SERVICE_CITIES, SITE } from "@/lib/site";
import { TrackedPhoneLink } from "@/components/site/TrackedPhone";

/**
 * Footer — magazine-bold brand column + 3 link columns.
 *
 * Brand column (col-span-2 on lg) carries:
 *   - Lion emblem
 *   - Big Barlow Condensed "TRIPLE J / METAL" wordmark with brand-blue accent
 *   - Locked tagline
 *   - Family signature line (Family-owned · Founded {established})
 *   - NAP (street, city, phone)
 *
 * Other columns are Services, Service Areas, Company — same as before
 * but tightened to fit the wider brand column.
 *
 * Doubles as local-SEO real estate via the structured address + city
 * + service link sets.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[color:var(--color-ink-900)] text-white/80 border-t border-white/5">
      <Container size="wide">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 py-20">
          {/* Col 1 — Magazine-bold brand lockup (spans 2 cols on lg) */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-4 group"
              aria-label={SITE.name}
            >
              <Image
                src="/images/logo-lion.png"
                alt="Triple J Metal lion emblem"
                width={64}
                height={64}
                className="h-14 w-14 sm:h-16 sm:w-16 object-contain shrink-0"
              />
              <div className="leading-none">
                <div className="font-display font-extrabold uppercase tracking-tight text-white text-4xl sm:text-5xl">
                  Triple J
                </div>
                <div className="font-display font-extrabold uppercase tracking-tight text-[color:var(--color-brand-400)] text-3xl sm:text-4xl mt-0.5">
                  Metal
                </div>
              </div>
            </Link>

            {/* Locked tagline — sits as the brand statement */}
            <p className="mt-6 text-base sm:text-lg font-semibold text-white/90 leading-snug max-w-md">
              Built right, built fast, built by Triple J.
            </p>

            {/* Family signature — short, non-flashy trust line */}
            <p className="mt-3 text-sm text-white/55 max-w-md">
              Family-owned · Founded {SITE.established} · {SITE.stats.projects}+
              jobs across Central Texas
            </p>

            {/* NAP block — local-SEO + real-business signal */}
            <address className="mt-6 not-italic text-sm text-white/70 space-y-2 max-w-xs">
              <div className="flex items-start gap-2.5">
                <PinIcon className="h-4 w-4 mt-0.5 shrink-0 text-[color:var(--color-brand-400)]" />
                <span>
                  {SITE.address.street}
                  <br />
                  {SITE.address.city}, {SITE.address.state} {SITE.address.zip}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneIcon className="h-4 w-4 shrink-0 text-[color:var(--color-brand-400)]" />
                <TrackedPhoneLink
                  surface="footer"
                  className="font-bold text-white text-base tabular-nums hover:text-[color:var(--color-brand-300)]"
                />
              </div>
            </address>

            {/* Social profile links — visible signal that pairs with
                LocalBusiness sameAs in OrganizationJsonLd.tsx. */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Triple J Metal on Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-white hover:border-[color:var(--color-brand-400)] transition-colors"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Triple J Metal on Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-white hover:border-[color:var(--color-brand-400)] transition-colors"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Col 2 — Services */}
          <div>
            <h3 className="text-[color:var(--color-brand-400)] font-bold text-xs tracking-[0.18em] uppercase">
              Services
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {SERVICES.map((s) => (
                <li key={s.title}>
                  <Link
                    href={s.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/services"
                  className="text-white/45 hover:text-white text-xs uppercase tracking-wider font-semibold"
                >
                  View all →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 — Service Cities */}
          <div>
            <h3 className="text-[color:var(--color-brand-400)] font-bold text-xs tracking-[0.18em] uppercase">
              Service Areas
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {SERVICE_CITIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/locations/${c.slug}`}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/locations"
                  className="text-white/45 hover:text-white text-xs uppercase tracking-wider font-semibold"
                >
                  View all →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 — Company / Quick Links */}
          <div>
            <h3 className="text-[color:var(--color-brand-400)] font-bold text-xs tracking-[0.18em] uppercase">
              Company
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/military"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Fort Cavazos Military
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/#quote"
                  className="inline-flex items-center gap-1 text-[color:var(--color-brand-300)] font-bold text-xs uppercase tracking-wider hover:text-white"
                >
                  Get a Free Quote →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal / bottom strip */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/45">
          <div>
            © {year} {SITE.legalName}. All rights reserved.
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-white/80 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white/80 transition-colors">
              Terms
            </Link>
            <Link href="/partners" className="hover:text-white/80 transition-colors">
              Partners
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
