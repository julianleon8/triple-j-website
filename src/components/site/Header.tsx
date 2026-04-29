"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  CloseIcon,
  MenuIcon,
  PhoneIcon,
} from "@/components/ui/icons";
import { NAV_LINKS, SITE } from "@/lib/site";
import {
  TrackedPhoneButtonLink,
  TrackedPhoneLink,
  TrackedPhoneNumber,
} from "@/components/site/TrackedPhone";

/**
 * Site header — magazine treatment.
 *
 * Behavior:
 *  - On `/` (homepage), the header is **transparent over the dark
 *    hero** at scrollY≈0. After scrolling past ~80px, it transitions
 *    to a dark backdrop-blur sticky bar.
 *  - On every other route, the header stays dark+blur from the start
 *    so it remains visible over light content (text pages, list pages).
 *  - Top thin bar simplified to phone + "Same-Week Installs" badge
 *    (was phone + hours + address).
 *  - Wordmark is a Barlow Condensed lockup — "TRIPLE J" with a
 *    brand-blue "METAL" accent. Subline shows service region.
 *  - Active link gets a brand-blue underline.
 *  - Mobile: hamburger opens a full-screen drawer.
 */
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Transparent state only applies on the homepage at the top of the page.
  // Anywhere else, the header is dark+blur from load.
  const transparent = isHome && !scrolled;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top thin bar — phone + Same-Week Installs badge.
          Hides on scroll OR when in transparent-over-hero mode. */}
      <div
        className={`bg-[color:var(--color-ink-950)] text-white text-[13px] overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          scrolled || transparent ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
        }`}
      >
        <Container size="wide">
          <div className="flex h-10 items-center justify-between gap-6">
            <TrackedPhoneLink
              surface="header_topbar"
              mode="children-only"
              className="flex items-center gap-1.5 text-white/85 hover:text-white"
            >
              <PhoneIcon className="h-3.5 w-3.5" />
              <span className="font-semibold tracking-tight tabular-nums">
                <TrackedPhoneNumber />
              </span>
            </TrackedPhoneLink>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-brand-600)]/20 border border-[color:var(--color-brand-400)]/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[color:var(--color-brand-300)]">
              <span aria-hidden="true">⚡</span>
              Same-Week Installs · Central Texas
            </span>
          </div>
        </Container>
      </div>

      {/* Main nav */}
      <div
        className={`relative z-50 border-b transition-all duration-300 ease-out ${
          transparent
            ? "bg-transparent border-transparent"
            : scrolled
              ? "bg-[color:var(--color-ink-900)]/85 backdrop-blur-md border-white/10 shadow-lg shadow-black/20"
              : "bg-[color:var(--color-ink-900)] border-white/10"
        }`}
      >
        <Container size="wide">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? "h-16" : "h-20"
            }`}
          >
            {/* Logo lockup — magazine treatment */}
            <Link
              href="/"
              aria-label={SITE.name}
              className="flex items-center gap-3 shrink-0 group"
            >
              <Image
                src="/images/logo-lion.png"
                alt=""
                width={44}
                height={44}
                priority
                className={`transition-all duration-300 shrink-0 ${
                  scrolled ? "h-9 w-9" : "h-11 w-11"
                } object-contain`}
              />
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-display font-extrabold uppercase tracking-tight text-white text-2xl leading-none whitespace-nowrap">
                  Triple J{" "}
                  <span className="text-[color:var(--color-brand-400)]">
                    Metal
                  </span>
                </span>
                <span className="text-white/45 text-[10px] font-semibold mt-1.5 tracking-[0.2em] uppercase">
                  Central Texas
                </span>
              </div>
            </Link>

            {/* Desktop nav — active gets brand-blue underline */}
            <nav
              aria-label="Primary"
              className="hidden lg:flex items-center gap-1"
            >
              {NAV_LINKS.map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className="group relative px-3.5 py-2 text-[15px] font-medium text-white/85 hover:text-white transition-colors"
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={`absolute left-3.5 right-3.5 -bottom-0.5 h-[2px] bg-[color:var(--color-brand-400)] rounded-full origin-center transition-transform duration-300 ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right side: phone + CTA */}
            <div className="flex items-center gap-3">
              <TrackedPhoneLink
                surface="header_dropdown"
                mode="children-only"
                className="hidden md:flex items-center gap-2 text-white font-semibold text-[15px] px-3 py-2 hover:text-[color:var(--color-brand-300)] transition-colors"
              >
                <PhoneIcon className="h-4 w-4" />
                <span className="tabular-nums">
                  <TrackedPhoneNumber />
                </span>
              </TrackedPhoneLink>
              <ButtonLink
                href="/#quote"
                variant="primary"
                size="md"
                className="hidden sm:inline-flex"
              >
                Get a Free Quote
              </ButtonLink>

              {/* Mobile hamburger */}
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-md text-white hover:bg-white/10"
              >
                {mobileOpen ? (
                  <CloseIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-x-0 top-0 bottom-0 z-40 bg-[color:var(--color-ink-900)] pt-20 transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        aria-hidden={!mobileOpen}
      >
        <Container size="wide">
          <nav
            aria-label="Mobile"
            className="flex flex-col py-6 divide-y divide-white/10"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-4 text-2xl font-display font-extrabold uppercase tracking-tight text-white hover:text-[color:var(--color-brand-300)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <ButtonLink
              href="/#quote"
              variant="primary"
              size="lg"
              onClick={() => setMobileOpen(false)}
            >
              Get a Free Quote
            </ButtonLink>
            <TrackedPhoneButtonLink
              surface="header_drawer"
              variant="outline-dark"
              size="lg"
              icon={<PhoneIcon className="h-5 w-5" />}
            />
          </div>
        </Container>
      </div>
    </header>
  );
}
