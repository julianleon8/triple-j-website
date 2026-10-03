import { notFound } from "next/navigation";

/**
 * Any `/es/...` URL no Spanish page claims. Sends it to es/not-found.tsx so
 * a mistyped Spanish link lands in Spanish, inside the Spanish site's header
 * and footer, instead of the English global 404.
 */
export default function SpanishCatchAll(): never {
  notFound();
}
