import type { Metadata } from "next";

import { ThankYouPage } from "@/components/pages/ThankYouPage";
import { localeAlternates } from "@/i18n/metadata";
import { THANK_YOU } from "@/i18n/pages/thank-you";

const t = THANK_YOU.es.meta;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  // Same as /thank-you: a conversion-confirmation page is never indexed.
  robots: { index: false, follow: false },
  alternates: localeAlternates("/thank-you", "es"),
};

export default async function Page({ searchParams }: PageProps<'/es/gracias'>) {
  // The quote form sends Spanish submissions here with ?from=quote preserved.
  const fromQuotePage = (await searchParams).from === 'quote'

  return <ThankYouPage locale="es" fromQuotePage={fromQuotePage} />;
}
