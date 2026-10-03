import type { Metadata } from "next";

import { ThankYouPage } from "@/components/pages/ThankYouPage";
import { localeAlternates } from "@/i18n/metadata";
import { THANK_YOU } from "@/i18n/pages/thank-you";

const t = THANK_YOU.en.meta;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  // Don't index conversion-confirmation pages — they're not useful organic
  // landings and they pollute analytics.
  robots: { index: false, follow: false },
  alternates: localeAlternates("/thank-you", "en"),
};

export default async function Page({ searchParams }: PageProps<'/thank-you'>) {
  // ?from=quote is set by the /quote landing page, which promises "same day,
  // guaranteed within 24 hours". ThankYouPage's copy has to say the same thing.
  const fromQuotePage = (await searchParams).from === 'quote'

  return <ThankYouPage locale="en" fromQuotePage={fromQuotePage} />;
}
