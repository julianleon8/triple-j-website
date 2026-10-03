import type { Metadata, Viewport } from "next";

import type { Locale } from "@/i18n/config";
import { OG_LOCALE } from "@/i18n/config";
import { SITE } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";

/**
 * `title.template` only reaches child segments, never a page in the root
 * layout's own segment (`/`, `/es`, the 404s, /offline). Those pages spell
 * the suffix out through this.
 */
export function fullTitle(title: string): { absolute: string } {
  return { absolute: `${title} | ${SITE.name}` };
}

/**
 * Document-level metadata shared by every root layout. The app has one root
 * layout per `<html lang>` (2026-10-03): `(marketing)` and the owner/customer
 * shells in English, `es/` in Spanish. Each exports `rootMetadata(locale)`
 * so a page inherits the same defaults whichever tree it lives in.
 *
 * No default canonical: every public page sets its own (via
 * `localeAlternates`), and a site-wide `/` default only ever pointed HQ,
 * login and quote pages at the homepage.
 */
export const rootViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Forge navy in both schemes: the header is navy either way. HQ sets its
  // own (#0b0d0f) in src/app/hq/layout.tsx.
  themeColor: "#00182a",
};

const COPY = {
  en: {
    title: `${SITE.name} | Metal Carports & Buildings in Central Texas`,
    description: `${SITE.name} builds welded or bolted metal carports, garages, and barns across Central Texas. Concrete available, same-week scheduling. Serving Temple, Belton, Killeen & more. Call ${SITE.phone}.`,
    keywords: [
      "metal carports central texas",
      "carport builders temple tx",
      "welded carports texas",
      "bolted carports texas",
      "metal building installation central texas",
      "carports with concrete belton tx",
      "turnkey carports killeen",
      "metal buildings temple tx",
    ],
    ogAlt: `${SITE.name} — metal carports, garages, and barns in Central Texas`,
    twitter: "Welded or bolted metal buildings in Central Texas — built by our Temple, TX crew, concrete available.",
  },
  es: {
    title: `${SITE.name} | Cocheras y edificios metálicos en el centro de Texas`,
    description: `${SITE.name} construye cocheras, garajes y graneros metálicos, soldados o atornillados, en el centro de Texas. Concreto disponible, instalación en la misma semana. Temple, Belton, Killeen y más. Llama al ${SITE.phone}.`,
    keywords: [
      "cocheras metálicas temple tx",
      "cocheras metálicas centro de texas",
      "carports metálicos texas",
      "garajes metálicos killeen",
      "graneros metálicos texas",
      "cocheras soldadas",
      "cocheras con losa de concreto belton tx",
      "edificios metálicos temple tx",
    ],
    ogAlt: `${SITE.name} — cocheras, garajes y graneros metálicos en el centro de Texas`,
    twitter: "Edificios metálicos soldados o atornillados en el centro de Texas — construidos por nuestro equipo de Temple, TX, con concreto disponible.",
  },
} satisfies Record<Locale, unknown>;

export function rootMetadata(locale: Locale): Metadata {
  const c = COPY[locale];
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: c.title, template: `%s | ${SITE.name}` },
    description: c.description,
    keywords: c.keywords,
    openGraph: {
      type: "website",
      // No alternateLocale here: only a page with a Spanish twin may claim one
      // (ogLocale() in src/i18n/metadata.ts); legal and HQ pages have none.
      locale: OG_LOCALE[locale],
      siteName: SITE.name,
      images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: c.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE.name,
      description: c.twitter,
      images: ["/og-default.jpg"],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Triple J",
    },
    applicationName: "Triple J Metal HQ",
    formatDetection: { telephone: true },
  };
}
