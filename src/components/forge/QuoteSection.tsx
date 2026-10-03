import { QuoteForm, QUOTE_LEDE_DEFAULT, type QuoteFormProps } from "@/components/sections/QuoteForm";

type Props = Pick<QuoteFormProps, "initialService" | "initialZip" | "initialMilitary" | "projectReference"> & {
  /** Service page: the service's name, e.g. "Carports". */
  serviceName?: string;
  /** Location page: the city name, e.g. "Temple". */
  city?: string;
};

/**
 * The shared, centred Forge quote section (#quote, card #quote-card). Every
 * Forge page except /contact and /partners closes with it. The lede says what
 * the page already filled in: the service, the city's ZIP, or the military box.
 */
export function QuoteSection({ serviceName, city, initialService, initialZip, initialMilitary, projectReference }: Props) {
  return (
    <QuoteForm
      lede={quoteLede({ serviceName, city, military: initialMilitary })}
      initialService={initialService}
      initialZip={initialZip}
      initialMilitary={initialMilitary}
      projectReference={projectReference}
    />
  );
}

export function quoteLede({ serviceName, city, military }: { serviceName?: string; city?: string; military?: boolean }): string {
  // "within 24 hours", not the design's "the same day": the same-day promise
  // belongs to /quote alone (Locked Decisions, response promise).
  if (military) {
    return "The military discount box is pre-checked on step two — verify the rest and we’ll be in touch within 24 hours with timeline and pricing.";
  }
  if (serviceName) {
    return `Two quick steps — ${serviceName.toLowerCase()} is already picked. A real Texas crew on the other end, not a form into a black hole.`;
  }
  if (city) {
    return `Two quick steps — your ${city} ZIP is already filled in. A real Texas crew on the other end, not a form into a black hole.`;
  }
  return QUOTE_LEDE_DEFAULT;
}
