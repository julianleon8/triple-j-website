import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    default: "Triple J Metal LLC | Metal Carports Central Texas",
    template: "%s | Triple J Metal LLC",
  },
  description:
    "Triple J Metal LLC builds and installs welded and bolted metal carports, garages, and barns across Central Texas. Based in Temple, TX. Call 254-346-7764.",
  keywords: [
    "metal carports central texas",
    "carport builders temple tx",
    "welded carports texas",
    "metal building installation central texas",
    "cheap carports texas",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Triple J Metal LLC",
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
