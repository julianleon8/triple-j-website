"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { ChevronDownIcon, CloseIcon, MenuIcon, PhoneIcon } from "@/components/ui/icons";
import { TrackedPhoneLink, TrackedPhoneNumber } from "@/components/site/TrackedPhone";
import { scrollToId } from "@/lib/forge-quote";
import { AREAS_HREF, MEGA_AREAS, MEGA_GUIDES, MEGA_MORE_SERVICES, MEGA_SERVICES, NAV_LINKS, SITE } from "@/lib/site";

/**
 * The page-specific call to action. Contact and Partners have their own
 * forms; everywhere else the button scrolls to the page's quote section, or
 * opens /quote on a page without one.
 */
export function headerCta(pathname: string): { label: string; short: string; href: string; target: string | null } {
  if (pathname === "/contact") return { label: "Send a Message", short: "Message", href: "#message", target: "message" };
  if (pathname === "/partners") return { label: "Partner Inquiry", short: "Inquire", href: "#inquire", target: "inquire" };
  return { label: "Get a Free Quote", short: "Free Quote", href: "/quote", target: "quote" };
}

/** Plain <a> click handler: scroll to the in-page target when it exists. */
export function onCtaClick(target: string | null, after?: () => void) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    after?.();
    if (!target) return;
    if (document.getElementById(target)) {
      e.preventDefault();
      scrollToId(target);
    }
  };
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/services") {
    return pathname.startsWith("/services") || pathname.startsWith("/locations") || pathname === "/military";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

const navLinkCls = "border-b-2 py-2 transition-colors duration-200 hover:text-white";

/**
 * Forge header. Sticky navy bar (84px, 72px under 900px) with the lion and
 * Cinzel wordmark, a Services mega menu, and a route-aware CTA. On the
 * homepage it starts transparent over the hero and turns navy after 40px.
 * It hides on scroll-down past 140px and returns on scroll-up, never while a
 * menu is open. Under 900px a call button and a full-height menu sheet
 * replace the nav.
 */
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const cta = headerCta(pathname);

  // Menus remember the path they were opened on; navigating closes them.
  const [mega, setMega] = useState<{ path: string; keyboard: boolean } | null>(null);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const megaOpen = mega?.path === pathname;
  const menuOpen = menuPath === pathname;

  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const firstMegaLink = useRef<HTMLAnchorElement>(null);
  const anyOpen = useRef(false);
  useEffect(() => {
    anyOpen.current = megaOpen || menuOpen;
  }, [megaOpen, menuOpen]);

  const closeMega = () => setMega(null);
  const closeMenu = () => setMenuPath(null);

  // Scroll state: one listener, state only flips at thresholds.
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const read = () => {
      raf = 0;
      const y = window.scrollY;
      setAtTop(y <= 40);
      if (anyOpen.current || y < 140) {
        setHidden(false);
        last = y;
        return;
      }
      if (y - last > 6) {
        setHidden(true);
        last = y;
      } else if (last - y > 6) {
        setHidden(false);
        last = y;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    raf = requestAnimationFrame(read);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Keyboard-opened mega: move focus into the panel.
  useEffect(() => {
    if (megaOpen && mega?.keyboard) firstMegaLink.current?.focus();
  }, [megaOpen, mega?.keyboard]);

  // Esc closes either menu; the mobile sheet also traps Tab and locks scroll.
  useEffect(() => {
    if (!megaOpen && !menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (megaOpen) {
          setMega(null);
          triggerRef.current?.focus();
        }
        if (menuOpen) {
          setMenuPath(null);
          menuBtnRef.current?.focus();
        }
        return;
      }
      if (menuOpen && e.key === "Tab" && headerRef.current) {
        const f = Array.from(
          headerRef.current.querySelectorAll<HTMLElement>("[data-menu-focus] a[href], [data-menu-focus] button"),
        ).filter((el) => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    let prevOverflow = "";
    if (menuOpen) {
      prevOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      if (menuOpen) document.documentElement.style.overflow = prevOverflow;
    };
  }, [megaOpen, menuOpen]);

  const transparent = isHome && atTop && !megaOpen && !menuOpen;
  const shift = hidden && !megaOpen && !menuOpen;

  return (
    <header
      ref={headerRef}
      data-forge=""
      data-tone="dark"
      onMouseLeave={closeMega}
      className="sticky top-0 z-50 w-full transition-transform duration-[350ms] ease-forge motion-reduce:transition-none"
      style={{ transform: shift ? "translateY(-100%)" : undefined }}
    >
      <div
        data-menu-focus=""
        className={`relative z-[2] border-b transition-[background-color,border-color] duration-300 ease-out ${
          transparent ? "border-transparent bg-transparent" : "border-forge-silver/[.16] bg-forge-navy"
        }`}
      >
        <div className="mx-auto flex h-[72px] w-full max-w-[1360px] items-center justify-between px-[clamp(20px,3vw,40px)] min-[900px]:h-[84px]">
          <Link
            href="/"
            aria-label={`${SITE.name} home`}
            className="flex items-center gap-3 whitespace-nowrap font-forge-display text-[clamp(19px,1vw_+_8px,22px)] font-black text-white"
          >
            <Image
              src="/images/logo-lion.png"
              alt=""
              width={44}
              height={44}
              priority
              className="size-[38px] flex-none object-contain min-[900px]:size-11"
            />
            {SITE.name}
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label="Primary"
            className="mx-6 hidden items-center gap-[clamp(18px,2vw,30px)] text-[15px] font-medium text-white/86 min-[900px]:flex"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              const underline = active ? "border-forge-silver" : "border-transparent";
              if (link.href === "/services") {
                return (
                  <button
                    key={link.href}
                    ref={triggerRef}
                    type="button"
                    aria-expanded={megaOpen}
                    aria-controls="forge-mega"
                    onMouseEnter={() => setMega({ path: pathname, keyboard: false })}
                    onClick={(e) =>
                      setMega(megaOpen ? null : { path: pathname, keyboard: e.detail === 0 })
                    }
                    className={`${navLinkCls} ${underline} inline-flex cursor-pointer items-center gap-1.5 bg-transparent`}
                  >
                    {link.label}
                    <ChevronDownIcon
                      width={14}
                      height={14}
                      aria-hidden="true"
                      className={`transition-transform duration-300 ease-forge ${megaOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={closeMega}
                  className={`${navLinkCls} ${underline}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right cluster */}
          <div onMouseEnter={closeMega} className="hidden items-center gap-[18px] min-[900px]:flex">
            <TrackedPhoneLink
              surface="header"
              mode="children-only"
              className="hidden items-center gap-2 whitespace-nowrap text-[15px] font-semibold text-white min-[1180px]:flex"
            >
              <PhoneIcon width={16} height={16} aria-hidden="true" />
              <TrackedPhoneNumber className="tabular-nums" />
            </TrackedPhoneLink>
            <a
              href={cta.href}
              onClick={onCtaClick(cta.target)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-[6px] bg-white px-[18px] py-[11px] text-[14px] font-semibold leading-[1.55] text-forge-navy transition-colors duration-200 hover:bg-forge-silver"
            >
              {cta.label}
            </a>
          </div>

          {/* Mobile: call + menu */}
          <div className="flex items-center gap-2.5 min-[900px]:hidden">
            <TrackedPhoneLink
              surface="header_mobile"
              mode="children-only"
              aria-label={`Call ${SITE.phone}`}
              className="inline-flex size-11 items-center justify-center rounded-[8px] border border-white/30 text-white"
            >
              <PhoneIcon width={18} height={18} aria-hidden="true" />
            </TrackedPhoneLink>
            <button
              ref={menuBtnRef}
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="forge-mobile-menu"
              onClick={() => setMenuPath(menuOpen ? null : pathname)}
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-[8px] border border-white/30 bg-transparent text-white"
            >
              {menuOpen ? <CloseIcon width={20} height={20} /> : <MenuIcon width={20} height={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mega menu (≥900px). Always in the DOM so the links are crawlable. */}
      <div
        id="forge-mega"
        hidden={!megaOpen}
        className="absolute inset-x-0 top-full z-[1] border-b border-forge-silver/[.16] bg-forge-navy text-white shadow-[var(--shadow-mega)] max-[899px]:!hidden"
      >
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[minmax(0,1.3fr)_minmax(0,.9fr)_minmax(0,1fr)] gap-[clamp(24px,3vw,48px)] px-[clamp(20px,3vw,40px)] pt-7 pb-8">
          <div>
            <p className="mb-3.5 text-[11px] font-bold uppercase tracking-[.2em] text-forge-steel-light">What we build</p>
            <div className="flex flex-col gap-1.5">
              {MEGA_SERVICES.map((m, i) => (
                <Link
                  key={m.href}
                  ref={i === 0 ? firstMegaLink : undefined}
                  href={m.href}
                  onClick={closeMega}
                  className="-mx-2 flex items-center gap-3.5 rounded-[8px] p-2 transition-colors duration-200 hover:bg-forge-navy-raised"
                >
                  <span className="relative h-[54px] w-[72px] flex-none overflow-hidden rounded-[6px] bg-forge-slate">
                    <Image src={m.img} alt="" fill sizes="72px" className="object-cover" style={{ objectPosition: m.pos }} />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-forge-display text-[17px] font-bold">{m.label}</span>
                    <span className="text-[13px] text-forge-steel-light">{m.sub}</span>
                  </span>
                </Link>
              ))}
            </div>
            <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-x-4 border-t border-forge-silver/[.14] p-0 pt-2.5">
              {MEGA_MORE_SERVICES.map((m) => (
                <li key={m.href}>
                  <Link href={m.href} onClick={closeMega} className={megaTextLink}>
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/services"
              onClick={closeMega}
              className="mt-1.5 inline-flex items-center gap-1.5 py-1 text-[14px] font-semibold text-forge-silver transition-colors duration-200 hover:text-white"
            >
              All services <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="flex flex-col gap-7">
            <div>
              <p className="mb-3.5 text-[11px] font-bold uppercase tracking-[.2em] text-forge-steel-light">
                Colors &amp; panels
              </p>
              <div className="flex flex-col border-t border-forge-silver/[.14]">
                {MEGA_GUIDES.map((m) => (
                  <Link key={m.href} href={m.href} onClick={closeMega} className={megaRow}>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-forge-display text-[17px] font-bold">{m.label}</span>
                      <span className="text-[13px] text-forge-steel-light">{m.sub}</span>
                    </span>
                    <span aria-hidden="true" className="text-forge-steel">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <Link
                href={AREAS_HREF}
                onClick={closeMega}
                className="mb-3.5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-forge-silver transition-colors duration-200 hover:text-white"
              >
                Service areas <span aria-hidden="true">→</span>
              </Link>
              <div className="flex flex-col border-t border-forge-silver/[.14]">
                {MEGA_AREAS.map((m) => (
                  <Link key={m.href} href={m.href} onClick={closeMega} className={megaRow}>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-forge-display text-[17px] font-bold">{m.label}</span>
                      <span className="text-[13px] text-forge-steel-light">{m.sub}</span>
                    </span>
                    <span aria-hidden="true" className="text-forge-steel">
                      →
                    </span>
                  </Link>
                ))}
              </div>
              <p className="mt-3.5 text-[13px] leading-[1.5] text-forge-steel-light">
                Plus Killeen, Harker Heights, Waco and more — within ~90 minutes of Temple.
              </p>
              <Link
                href={AREAS_HREF}
                onClick={closeMega}
                className="mt-1.5 inline-flex items-center gap-1.5 py-1 text-[14px] font-semibold text-forge-silver transition-colors duration-200 hover:text-white"
              >
                All service areas <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <Link
            href="/military"
            onClick={closeMega}
            className="relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[12px] border border-forge-silver/[.22] bg-forge-slate p-5"
          >
            <Image src="/images/carport-truck-concrete-hero.jpg" alt="" fill sizes="400px" className="object-cover" />
            <span aria-hidden="true" className="absolute inset-0" style={{ background: "var(--scrim-mega-military)" }} />
            <span className="relative text-[11px] font-bold uppercase tracking-[.2em] text-forge-tan">
              Fort Cavazos · 7% off
            </span>
            <span className="relative mt-2 font-forge-display text-[22px] font-black leading-[1.15]">
              Same-week installs for PCS families.
            </span>
            <span className="relative mt-2.5 text-[14px] font-semibold text-forge-silver">See the military page →</span>
          </Link>
        </div>
      </div>

      {/* Mobile menu sheet (<900px) */}
      <div
        id="forge-mobile-menu"
        data-menu-focus=""
        hidden={!menuOpen}
        className="absolute inset-x-0 top-full z-[1] h-[calc(100dvh_-_72px)] overflow-y-auto overscroll-contain bg-forge-navy px-5 pt-2 pb-8 text-white min-[900px]:!hidden"
      >
        <Link href="/services" onClick={closeMenu} className={`${mobileGroupLink} mt-2`}>
          Services <span aria-hidden="true">→</span>
        </Link>
        <nav aria-label="Mobile services" className="flex flex-col">
          {MEGA_SERVICES.map((m) => (
            <Link key={m.href} href={m.href} onClick={closeMenu} className={mobileRow}>
              {m.label}
            </Link>
          ))}
          <div className="grid grid-cols-2 gap-x-4">
            {MEGA_MORE_SERVICES.map((m) => (
              <Link key={m.href} href={m.href} onClick={closeMenu} className={mobileSubRow}>
                {m.label}
              </Link>
            ))}
          </div>
        </nav>
        <p className="mt-6 mb-1.5 text-[11px] font-bold uppercase tracking-[.2em] text-forge-steel-light">Colors &amp; panels</p>
        <nav aria-label="Mobile colors and panels" className="flex flex-col">
          {MEGA_GUIDES.map((m) => (
            <Link key={m.href} href={m.href} onClick={closeMenu} className={mobileRow}>
              {m.label}
            </Link>
          ))}
        </nav>
        <Link href={AREAS_HREF} onClick={closeMenu} className={`${mobileGroupLink} mt-6`}>
          Service areas <span aria-hidden="true">→</span>
        </Link>
        <nav aria-label="Mobile service areas" className="flex flex-col">
          {MEGA_AREAS.map((m) => (
            <Link key={m.href} href={m.href} onClick={closeMenu} className={mobileRow}>
              {m.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 mb-1.5 text-[11px] font-bold uppercase tracking-[.2em] text-forge-steel-light">Company</p>
        <nav aria-label="Mobile company" className="flex flex-col">
          {NAV_LINKS.filter((l) => l.href !== "/services").map((l) => (
            <Link key={l.href} href={l.href} onClick={closeMenu} className={mobileRow}>
              {l.label}
            </Link>
          ))}
          <Link
            href="/military"
            onClick={closeMenu}
            className="flex items-center justify-between gap-3 py-3.5 font-forge-display text-[22px] font-bold"
          >
            Fort Cavazos Military
            <span className="font-sans text-[11px] font-bold uppercase tracking-[.14em] text-forge-tan">7% off</span>
          </Link>
        </nav>
        <div className="mt-5 flex flex-col gap-3">
          <a
            href={cta.href}
            onClick={onCtaClick(cta.target, closeMenu)}
            className="inline-flex items-center justify-center rounded-[6px] bg-white px-[26px] py-[15px] text-[16px] font-semibold text-forge-navy"
          >
            {cta.label}
          </a>
          <TrackedPhoneLink
            surface="header_drawer"
            mode="children-only"
            className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-white/30 px-[26px] py-[15px] text-[16px] font-semibold text-white"
          >
            Call <TrackedPhoneNumber className="tabular-nums" />
          </TrackedPhoneLink>
        </div>
      </div>
    </header>
  );
}

const mobileRow = "border-b border-forge-silver/[.16] py-3.5 font-forge-display text-[22px] font-bold";

/** Mobile sheet: the quieter rows for the rest of the services, under the three main ones. */
const mobileSubRow =
  "border-b border-forge-silver/[.16] py-3.5 text-[15px] font-medium leading-tight text-forge-silver transition-colors duration-200 hover:text-white";

/** Mega menu: a text row with an arrow (Colors & panels, Service areas). */
const megaRow =
  "flex items-center justify-between gap-3 border-b border-forge-silver/[.14] py-3.5 transition-colors duration-200 hover:text-forge-silver";

/** Mega menu: a small text link in the "more services" grid. */
const megaTextLink =
  "inline-flex py-1.5 text-[14px] text-forge-steel-light transition-colors duration-200 hover:text-white";

/** Mobile sheet group heading that is itself a link (44px tap target). */
const mobileGroupLink =
  "mb-1.5 flex min-h-11 items-center justify-between text-[11px] font-bold uppercase tracking-[.2em] text-forge-silver transition-colors duration-200 hover:text-white";
