import type { Metadata } from "next";

import { NotFoundView } from "@/components/site/NotFoundView";
import { fullTitle } from "@/lib/root-metadata";

/** A Spanish page's `notFound()` (unknown slug or URL), inside the Spanish site. */
export const metadata: Metadata = {
  title: fullTitle("Página no encontrada"),
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundView locale="es" />;
}
