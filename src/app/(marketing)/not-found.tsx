import type { Metadata } from "next";

import { NotFoundView } from "@/components/site/NotFoundView";
import { fullTitle } from "@/lib/root-metadata";

/** An English page's `notFound()` (unknown slug), inside the site chrome. */
export const metadata: Metadata = {
  title: fullTitle("Page not found"),
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundView locale="en" />;
}
