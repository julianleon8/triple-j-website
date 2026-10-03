import type { ReactNode } from "react";

import { MarketingShell } from "@/components/site/MarketingShell";
import { RootDocument } from "@/components/site/RootDocument";
import { rootMetadata, rootViewport } from "@/lib/root-metadata";

export const metadata = rootMetadata("en");
export const viewport = rootViewport;

/**
 * Root layout for the English public site: homepage, services, gallery,
 * locations, about, contact. Its Spanish twin is src/app/es/layout.tsx; HQ,
 * login and customer quote pages have root layouts of their own.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <RootDocument locale="en">
      <MarketingShell locale="en">{children}</MarketingShell>
    </RootDocument>
  );
}
