import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Cinzel, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

import { SITE } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";
import { ServiceWorkerRegistrar } from "@/components/hq/ServiceWorkerRegistrar";

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

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Forge navy in both schemes: the header is navy either way. HQ sets its
  // own (#0b0d0f) in src/app/hq/layout.tsx.
  themeColor: "#00182a",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE.name} | Metal Carports & Buildings in Central Texas`,
    template: `%s | ${SITE.name}`,
  },
  alternates: {
    canonical: "/",
  },
  description:
    `${SITE.name} builds welded or bolted metal carports, garages, and barns across Central Texas. Concrete available, same-week scheduling. Serving Temple, Belton, Killeen & more. Call ${SITE.phone}.`,
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
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE.name,
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — metal carports, garages, and barns in Central Texas`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description:
      "Welded or bolted metal buildings in Central Texas — built by our Temple, TX crew, concrete available.",
    images: ["/og-default.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Triple J",
  },
  // The public site's name. The owner app's own name, "Triple J Metal HQ",
  // is set in src/app/hq/layout.tsx and the PWA manifest.
  applicationName: SITE.name,
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
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
