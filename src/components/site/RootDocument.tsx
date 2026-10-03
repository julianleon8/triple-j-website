import type { ReactNode } from "react";
import { Barlow_Condensed, Cinzel, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "@/app/globals.css";

import { ServiceWorkerRegistrar } from "@/components/hq/ServiceWorkerRegistrar";
import { HTML_LANG, type Locale } from "@/i18n/config";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "optional",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "optional",
});

// Forge headline face (2026-10 redesign). `swap`, not `optional`: Cinzel is the
// brand lettering, and `optional` would leave first visits on Georgia.
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
});

/**
 * The `<html>` + `<body>` every root layout renders. There is one root
 * layout per document language (2026-10-03): `(marketing)`, `hq`, `(auth)`,
 * `quotes` and `offline` in English, `es` in Spanish. Only `lang` differs;
 * fonts, global CSS, the service worker and analytics are the same for all.
 */
export function RootDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html
      lang={HTML_LANG[locale]}
      className={`${barlowCondensed.variable} ${inter.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegistrar />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
