import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
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
  weight: ["400", "500", "600"],
  display: "optional",
});

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e6bd6" },
    { media: "(prefers-color-scheme: dark)",  color: "#000000" },
  ],
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
    "Triple J Metal builds welded or bolted metal carports, garages, and barns across Central Texas. Turnkey concrete included, same-week scheduling. Serving Temple, Belton, Killeen & more. Call 254-346-7764.",
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
      "Welded or bolted metal buildings in Central Texas — built turnkey with concrete by our Temple, TX crew.",
    images: ["/og-default.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Triple J",
  },
  applicationName: "Triple J Metal HQ",
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
      className={`${barlowCondensed.variable} ${inter.variable} h-full antialiased`}
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
