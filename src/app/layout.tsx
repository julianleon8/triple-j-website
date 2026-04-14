import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { SITE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} | Metal Carports & Buildings in Central Texas`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Triple J Metal builds custom welded metal carports, garages, and barns in under 48 hours. Serving Temple, Belton, Killeen, Harker Heights and all of Central Texas. Call 254-346-7764.",
  keywords: [
    "metal carports central texas",
    "carport builders temple tx",
    "welded carports texas",
    "metal building installation central texas",
    "carports with concrete belton tx",
    "turnkey carports killeen",
    "custom metal buildings temple tx",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
