import type { Metadata } from "next";

import { NotFoundView } from "@/components/site/NotFoundView";
import { RootDocument } from "@/components/site/RootDocument";
import { fullTitle, rootMetadata, rootViewport } from "@/lib/root-metadata";

/**
 * 404 for a URL that matches no route at all (Next 16 `global-not-found`,
 * enabled in next.config.ts). The app has several root layouts — English
 * and Spanish public sites, HQ, login, quotes — so no single layout can
 * compose this page; it renders its own document. It cannot see the URL,
 * so it is English with a pointer to the Spanish homepage. A mistyped
 * `/es/...` URL never reaches it: `es/[...rest]` sends it to the Spanish
 * not-found inside the Spanish site.
 */
export const metadata: Metadata = {
  ...rootMetadata("en"),
  title: fullTitle("Page not found"),
  // Don't index 404 responses — they pollute organic indexing.
  robots: { index: false, follow: false },
};
export const viewport = rootViewport;

export default function GlobalNotFound() {
  return (
    <RootDocument locale="en">
      <NotFoundView locale="en" standalone />
    </RootDocument>
  );
}
