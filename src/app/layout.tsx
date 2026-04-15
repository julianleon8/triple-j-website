import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";

import "./globals.css";

import { SITE } from "@/lib/site";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} | Metal Carports & Buildings in Central Texas`,
    template: `%s | ${SITE.name}`,
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
