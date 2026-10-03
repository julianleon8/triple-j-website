import type { ReactNode } from "react";

import { MarketingShell } from "@/components/site/MarketingShell";
import { RootDocument } from "@/components/site/RootDocument";
import { rootMetadata, rootViewport } from "@/lib/root-metadata";

export const metadata = rootMetadata("es");
export const viewport = rootViewport;

/**
 * Root layout for the Spanish public site (`/es`, 2026-10-03). Its own root
 * layout so the document says `<html lang="es">`; the chrome is the same
 * MarketingShell the English site uses.
 */
export default function SpanishLayout({ children }: { children: ReactNode }) {
  return (
    <RootDocument locale="es">
      <MarketingShell locale="es">{children}</MarketingShell>
    </RootDocument>
  );
}
