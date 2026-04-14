import type { ReactNode } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MobileCallBar } from "@/components/site/MobileCallBar";

/**
 * Layout for the public marketing site.
 * Wraps the homepage, services, gallery, locations, about, contact.
 * Dashboard / login / setup / customer-facing quotes DO NOT use this layout.
 */
export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileCallBar />
    </>
  );
}
