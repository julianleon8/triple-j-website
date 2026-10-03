import { bilingual, INTL_LOCALE, type Locale } from "@/i18n/config";

/**
 * Words on the documents a customer gets for a quote: the email, the SMS,
 * the PDF and the accept page. The customer's `preferred_language`
 * (migration 034) picks the side. Line items, notes and totals are typed in
 * HQ and show as typed. Money keeps US format ($1,234.00) in both languages.
 */
export const QUOTES = bilingual(
  {
    email: {
      subject: (n: string) => `Your Quote ${n} from Triple J Metal`,
      preview: (n: string, name: string) => `Your quote ${n} from Triple J Metal — ${name}`,
      heading: (n: string) => `Quote ${n}`,
      intro: (name: string, legal: string) =>
        `Hi ${name}, here is your quote from ${legal}. Review the details below and click the button to accept or decline.`,
      button: "Review & Accept Quote",
      validUntil: "This quote is valid until",
      textTitle: (n: string, legal: string) => `Quote ${n} — ${legal}`,
      textHi: (name: string) => `Hi ${name},`,
      textIntro: (legal: string) => `Here is your quote from ${legal}. Review and accept online:`,
      textItems: "LINE ITEMS",
      textValid: "Valid until:",
      textNotes: "Notes:",
    },
    sms: (n: string, name: string, total: string, url: string) =>
      `Triple J Metal — Quote ${n} for ${name}: ${total}. Review + accept: ${url}. Reply STOP to opt out.`,
    table: { description: "Description", qty: "Qty", unit: "Unit", total: "Total", subtotal: "Subtotal", tax: "Tax", taxRate: "Tax (8.25%)" },
    pdf: {
      quote: "Quote",
      validUntil: "Valid until",
      quoteFor: "Quote for",
      notes: "Notes",
      generated: "Generated",
      subject: (n: string, name: string) => `Quote ${n} for ${name}`,
    },
    accept: {
      heading: (n: string) => `Quote ${n}`,
      preparedFor: (name: string) => `Prepared for ${name}`,
      you: "you",
      validUntil: "Valid until",
      acceptedTitle: "You have accepted this quote.",
      acceptedBody: (phone: string) => `We'll be in touch soon to schedule your installation. Call us anytime at ${phone}.`,
      declinedTitle: "You have declined this quote.",
      declinedBody: (phone: string) => `If you change your mind or have questions, call us at ${phone}.`,
      accept: "Accept Quote",
      decline: "Decline",
      processing: "Processing…",
      error: "Something went wrong. Please try again.",
      questions: "Questions? Call or text",
      notFoundTitle: "Quote Not Found",
      notFoundBody: "This quote link is invalid or has expired.",
      notFoundHelp: "Need help? Call",
    },
  },
  {
    email: {
      subject: (n: string) => `Tu cotización ${n} de Triple J Metal`,
      preview: (n: string, name: string) => `Tu cotización ${n} de Triple J Metal — ${name}`,
      heading: (n: string) => `Cotización ${n}`,
      intro: (name: string, legal: string) =>
        `Hola ${name}, aquí está tu cotización de ${legal}. Revisa los detalles abajo y haz clic en el botón para aceptarla o rechazarla.`,
      button: "Revisar y aceptar la cotización",
      validUntil: "Esta cotización es válida hasta el",
      textTitle: (n: string, legal: string) => `Cotización ${n} — ${legal}`,
      textHi: (name: string) => `Hola ${name}:`,
      textIntro: (legal: string) => `Aquí está tu cotización de ${legal}. Revísala y acéptala en línea:`,
      textItems: "CONCEPTOS",
      textValid: "Válida hasta:",
      textNotes: "Notas:",
    },
    // "STOP" stays in English: it is the carrier's opt-out keyword.
    sms: (n: string, name: string, total: string, url: string) =>
      `Triple J Metal — Cotización ${n} para ${name}: ${total}. Revisa y acepta: ${url}. Responde STOP para no recibir mensajes.`,
    table: { description: "Descripción", qty: "Cant.", unit: "Precio", total: "Total", subtotal: "Subtotal", tax: "Impuesto", taxRate: "Impuesto (8.25%)" },
    pdf: {
      quote: "Cotización",
      validUntil: "Válida hasta el",
      quoteFor: "Cotización para",
      notes: "Notas",
      generated: "Generada el",
      subject: (n: string, name: string) => `Cotización ${n} para ${name}`,
    },
    accept: {
      heading: (n: string) => `Cotización ${n}`,
      preparedFor: (name: string) => `Preparada para ${name}`,
      you: "ti",
      validUntil: "Válida hasta el",
      acceptedTitle: "Aceptaste esta cotización.",
      acceptedBody: (phone: string) => `Pronto nos comunicamos contigo para programar tu instalación. Llámanos cuando quieras al ${phone}.`,
      declinedTitle: "Rechazaste esta cotización.",
      declinedBody: (phone: string) => `Si cambias de opinión o tienes preguntas, llámanos al ${phone}.`,
      accept: "Aceptar cotización",
      decline: "Rechazar",
      processing: "Procesando…",
      error: "Algo salió mal. Inténtalo de nuevo.",
      questions: "¿Preguntas? Llama o manda mensaje al",
      notFoundTitle: "No encontramos la cotización",
      notFoundBody: "Este enlace de cotización no es válido o ya venció.",
      notFoundHelp: "¿Necesitas ayuda? Llama al",
    },
  },
);

/** "October 3, 2026" / "3 de octubre de 2026". Date-only strings are read as UTC. */
export function quoteDate(iso: string, locale: Locale): string {
  const timeZone = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? "UTC" : "America/Chicago";
  return new Date(iso).toLocaleDateString(INTL_LOCALE[locale], { month: "long", day: "numeric", year: "numeric", timeZone });
}
