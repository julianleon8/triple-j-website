"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  ClockIcon,
  CloseIcon,
  MenuIcon,
  PhoneIcon,
  PinIcon,
} from "@/components/ui/icons";
import { NAV_LINKS, SITE } from "@/lib/site";

/**
 * Site header.
 *
 * Structure:
 *  - Top thin bar (dark): phone · hours · address
 *  - Main nav (white → dark-tinted on scroll): logo, nav links, CTA
 *  - Sticky. Shrinks + top-bar collapses after ~40px scroll.
 *  - Mobile: hamburger opens a full-screen drawer.
 *
 * Designed to match the WolfSteel-inspired direction: confident,
 * contractor-premium, phone always reachable.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top thin bar — hides on scroll */}
      <div
        className={`bg-[color:var(--color-ink-950)] text-white/80 text-[13px] overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
        }`}
      >
        <Container size="wide">
          <div className="flex h-10 items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <a
                href={SITE.phoneHref}
                className="flex items-center gap-1.5 hover:text-white"
              >
                <PhoneIcon className="h-3.5 w-3.5" />
                <span className="font-semibold tracking-tight">
                  {SITE.phone}
                </span>
              </a>
              <span className="hidden sm:flex items-center gap-1.5 text-white/60">
                <ClockIcon className="h-3.5 w-3.5" />
                {SITE.hours}
              </span>
            </div>
            <span className="hidden md:flex items-center gap-1.5 text-white/60">
              <PinIcon className="h-3.5 w-3.5" />
              {SITE.address.street}, {SITE.address.city}, {SITE.address.state}
            </span>
          </div>
        </Container>
      </div>

      {/* Main nav */}
      <div
        className={`border-b transition-all duration-300 ease-out ${
          scrolled
            ? "bg-[color:var(--color-ink-900)]/95 backdrop-blur border-white/10"
            : "bg-[color:var(--color-ink-900)] border-white/10"
        }`}
      >
        <Container size="wide">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? "h-16" : "h-20"
            }`}
          >
            {/* Logo */}
            <Link
              href="/"
              aria-label={SITE.name}
              className="flex items-center gap-3 shrink-0"
            >
              <Image
                src="/images/logo-lion.png"
                alt=""
                width={44}
                height={44}
                priority
                className={`transition-all duration-300 ${
                  scrolled ? "h-9 w-9" : "h-11 w-11"
                } object-contain`}
              />
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-white font-extrabold tracking-tight text-[17px]">
                  Triple J Metal
                </span>
                <span className="text-white/50 text-[11px] font-medium mt-0.5 tracking-wider uppercase">
                  Temple · Central Texas
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav
              aria-label="Primary"
              className="hidden lg:flex items-center gap-1"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-2 text-[15px] font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side: phone + CTA */}
            <div className="flex items-center gap-3">
              <a
                href={SITE.phoneHref}
                className="hidden md:flex items-center gap-2 text-white font-semibold text-[15px] px-3 py-2 hover:text-[color:var(--color-brand-300)] transition-colors"
              >
                <PhoneIcon className="h-4 w-4" />
                <span className="tabular-nums">{SITE.phone}</span>
              </a>
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
                className="py-4 text-lg font-semibold text-white hover:text-[color:var(--color-brand-300)]"
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
            <ButtonLink
              href={SITE.phoneHref}
              variant="outline-dark"
              size="lg"
              icon={<PhoneIcon className="h-5 w-5" />}
            >
              Call {SITE.phone}
            </ButtonLink>
          </div>
        </Container>
      </div>
    </header>
  );
}
