import { QuoteForm, type QuoteFormProps } from "@/components/sections/QuoteForm";
import type { Locale } from "@/i18n/config";
import { QUOTE_FORM } from "@/i18n/copy/quote-form";

type Props = Pick<QuoteFormProps, "initialService" | "initialZip" | "initialMilitary" | "projectReference"> & {
  /** Service page: the service's name, e.g. "Carports". */
  serviceName?: string;
  /** Location page: the city name, e.g. "Temple". */
  city?: string;
  /** The page's language. */
  locale?: Locale;
};

/**
 * The shared, centred Forge quote section (#quote, card #quote-card). Every
 * Forge page except /contact and /partners closes with it. The lede says what
 * the page already filled in: the service, the city's ZIP, or the military box.
 */
export function QuoteSection({ serviceName, city, initialService, initialZip, initialMilitary, projectReference, locale = "en" }: Props) {
  return (
    <QuoteForm
      lede={quoteLede({ serviceName, city, military: initialMilitary }, locale)}
      initialService={initialService}
      initialZip={initialZip}
      initialMilitary={initialMilitary}
      projectReference={projectReference}
    />
  );
}

export function quoteLede(
  { serviceName, city, military }: { serviceName?: string; city?: string; military?: boolean },
  locale: Locale = "en",
): string {
  const t = QUOTE_FORM[locale];
  // "within 24 hours", not the design's "the same day": the same-day promise
  // belongs to /quote alone (Locked Decisions, response promise).
  if (military) return t.ledeMilitary;
  if (serviceName) return t.ledeService(serviceName);
  if (city) return t.ledeCity(city);
  return t.ledeDefault;
}
