import { bilingual, type Locale } from "@/i18n/config";

/**
 * Words in the emails a customer or partner receives. Owner alerts stay
 * English. The response promise follows the lock: "today" only for an ASAP
 * request, "within 24 hours" otherwise.
 */
export const EMAILS = bilingual(
  {
    layout: {
      hours: "Mon–Sat · 8a–6p",
      signature: "The Triple J Metal crew",
      family: "Family-owned · Founded 2025 · 150+ Central Texas builds",
      tagline: "BUILT RIGHT · BUILT FAST · BUILT BY TRIPLE J",
      taglinePlain: "Built right, built fast, built by Triple J.",
    },
    leadConfirm: {
      subject: "We got your quote request — Triple J Metal",
      preview: (name: string, service: string, hot: boolean) =>
        `Got it ${name} — your ${service} request is in. We'll call you back ${hot ? "today" : "within 24 hours"}.`,
      eyebrow: "QUOTE REQUEST RECEIVED",
      thanks: (name: string) => `Thanks, ${name}.`,
      gotIt: (service: string, city: string) => [`We got your `, service, ` request for `, city, `.`],
      nextLabel: "WHAT HAPPENS NEXT",
      next: (hot: boolean) => [
        "A real person from our Temple crew will call you back at",
        `${hot ? "today" : "within 24 hours"} with an honest quote. No pressure, no offshore call center, no automated form replies.`,
      ],
      military: ["Military / First Responder discount noted.", "7% off your install. Thank you for your service."],
      hot: ["ASAP request flagged.", "Your callback is moving to the top of the list."],
      cantWait: "Can’t wait? Call us directly:",
      cantWaitPlain: "Can't wait? Call us directly:",
      signature: "— The Triple J Metal crew",
      signatureSub: "Family-owned · Temple, TX",
    },
    partnerConfirm: {
      subject: "We got your partner inquiry — Triple J Metal",
      preview: (contact: string, company: string) => `Thanks ${contact} — we got your partner inquiry from ${company}`,
      thanks: (contact: string) => `Thanks, ${contact}!`,
      received: "We received your partner inquiry from",
      reachOut:
        "One of the owners will reach out personally within one business day to talk through how a partnership could work — what kind of jobs you typically refer, where in Central Texas they tend to land, and what your customers care about most. No sales script.",
      skip: "If you want to skip the wait, you can reach us directly at",
      or: "or",
      signature: "— The Triple J Metal crew",
    },
  },
  {
    layout: {
      hours: "Lun–Sáb · 8a–6p",
      signature: "El equipo de Triple J Metal",
      family: "Empresa familiar · Fundada en 2025 · 150+ obras en el centro de Texas",
      tagline: "HECHO BIEN · HECHO RÁPIDO · HECHO POR TRIPLE J",
      taglinePlain: "Hecho bien, hecho rápido, hecho por Triple J.",
    },
    leadConfirm: {
      subject: "Recibimos tu solicitud de cotización — Triple J Metal",
      preview: (name: string, service: string, hot: boolean) =>
        `Listo, ${name} — recibimos tu solicitud de ${service}. Te llamamos ${hot ? "hoy mismo" : "en menos de 24 horas"}.`,
      eyebrow: "SOLICITUD DE COTIZACIÓN RECIBIDA",
      thanks: (name: string) => `Gracias, ${name}.`,
      gotIt: (service: string, city: string) => [`Recibimos tu solicitud de `, service, ` en `, city, `.`],
      nextLabel: "QUÉ SIGUE",
      next: (hot: boolean) => [
        "Una persona real de nuestro equipo de Temple te llamará al",
        `${hot ? "hoy mismo" : "en menos de 24 horas"} con una cotización honesta. Sin presión, sin centros de llamadas en otro país, sin respuestas automáticas.`,
      ],
      military: ["Anotamos tu descuento militar / de primer respondiente.", "7% de descuento en tu instalación. Gracias por tu servicio."],
      hot: ["Marcamos tu solicitud como urgente.", "Tu llamada pasa al principio de la lista."],
      cantWait: "¿No puedes esperar? Llámanos directamente:",
      cantWaitPlain: "¿No puedes esperar? Llámanos directamente:",
      signature: "— El equipo de Triple J Metal",
      signatureSub: "Empresa familiar · Temple, TX",
    },
    partnerConfirm: {
      subject: "Recibimos tu solicitud de alianza — Triple J Metal",
      preview: (contact: string, company: string) => `Gracias, ${contact} — recibimos la solicitud de alianza de ${company}`,
      thanks: (contact: string) => `¡Gracias, ${contact}!`,
      received: "Recibimos tu solicitud de alianza de",
      reachOut:
        "Uno de los dueños se comunicará contigo personalmente en un día hábil para platicar cómo podría funcionar una alianza — qué tipo de trabajos sueles recomendar, en qué parte del centro de Texas caen y qué es lo que más les importa a tus clientes. Sin guion de ventas.",
      skip: "Si no quieres esperar, puedes comunicarte directamente al",
      or: "o a",
      signature: "— El equipo de Triple J Metal",
    },
  },
);

/** A lead's service type as a customer reads it. Lean-to and fencing land as `other`. */
const SERVICE_WORDS: Record<Locale, Record<string, string>> = {
  en: { carport: "carport", garage: "garage", barn: "barn", rv_cover: "rv cover", other: "other" },
  es: { carport: "cochera", garage: "garaje", barn: "granero", rv_cover: "cubierta para RV", other: "obra" },
};

export function serviceWord(serviceType: string, locale: Locale): string {
  return SERVICE_WORDS[locale][serviceType] ?? serviceType.replace(/_/g, " ");
}

