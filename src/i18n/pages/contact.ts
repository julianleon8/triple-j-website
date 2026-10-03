import { bilingual, type Locale } from "@/i18n/config";
import { SITE, SITE_ES } from "@/lib/site";

/**
 * /contact copy, both languages. Facts that live in src/lib/site.ts (phone,
 * address, email, hours) are passed in, not retyped. /contact keeps its
 * "same day" callback in Spanish, as it does in English (Locked Decisions →
 * Response promise, known exception).
 */
export const CONTACT = bilingual(
  {
    meta: {
      title: "Contact | Temple, TX | Free Quote",
      description: `Call ${SITE.phone} for a same-day callback. Temple-based metal building crew — carports, garages, barns, and RV covers across Central Texas.`,
      ogTitle: "Contact Triple J Metal | Temple, TX",
      ogDescription: `Call ${SITE.phone} for a same-day callback. Temple-based metal building contractor.`,
    },
    jsonLd: {
      name: `Contact ${SITE.name}`,
      description:
        "Reach Triple J Metal — Temple, TX metal building contractor. Phone, email, and free quote form for Central Texas customers.",
    },
    hero: {
      company: "Company",
      current: "Contact",
      eyebrow: "Contact us",
      h1a: "Get in touch.",
      h1b: "We call back same day.",
      lede: "A question about your project, or ready for a quote? Call us directly or send a message. A real person from our Temple crew picks up — or calls you back the same day.",
    },
    reach: {
      eyebrow: "Reach us directly",
      phoneLabel: "Phone · English & Español",
      phoneSub: "Same-day callback",
      hoursLabel: "Hours",
      shopLabel: "Shop",
      shopSub: "Serving all of Central Texas",
      emailLabel: "Email",
    },
    area: {
      label: "Service area",
      note: "Within ~90 minutes of Temple. Call to confirm your area.",
      partnerQuestion: "Supplier, dealer or GC?",
      partnerLink: "Become an install partner",
    },
    map: {
      callout: "Triple J shop · HQ",
      directions: "Get directions →",
    },
    og: {
      alt: `Contact Triple J Metal — call ${SITE.phone}`,
      eyebrow: "Contact",
      headline: "Get in Touch",
      subhead: (address: string, hours: string): string => `${address} · ${hours}`,
    },
  },
  {
    meta: {
      title: "Contacto | Temple, TX | Cotización gratis",
      description: `Llama al ${SITE.phone} y te devolvemos la llamada el mismo día. Equipo de edificios metálicos con base en Temple: cocheras, garajes, graneros y cubiertas para RV en todo el centro de Texas.`,
      ogTitle: "Contacto | Triple J Metal, Temple, TX",
      ogDescription: `Llama al ${SITE.phone} y te devolvemos la llamada el mismo día. Contratista de edificios metálicos con base en Temple.`,
    },
    jsonLd: {
      name: `Contacto ${SITE.name}`,
      description:
        "Comunícate con Triple J Metal, contratista de edificios metálicos en Temple, TX. Teléfono, correo y formulario de cotización gratis para clientes del centro de Texas.",
    },
    hero: {
      company: "Empresa",
      current: "Contacto",
      eyebrow: "Contáctanos",
      h1a: "Ponte en contacto.",
      h1b: "Te llamamos el mismo día.",
      lede: "¿Tienes una pregunta sobre tu proyecto, o ya quieres una cotización? Llámanos directo o mándanos un mensaje. Contesta una persona de verdad de nuestro equipo de Temple, o te devuelve la llamada el mismo día.",
    },
    reach: {
      eyebrow: "Comunícate directo con nosotros",
      phoneLabel: "Teléfono · Español e inglés",
      phoneSub: "Te llamamos el mismo día",
      hoursLabel: "Horario",
      shopLabel: "Taller",
      shopSub: "Atendemos todo el centro de Texas",
      emailLabel: "Correo",
    },
    area: {
      label: "Zona de servicio",
      note: "A ~90 minutos o menos de Temple. Llama para confirmar tu zona.",
      partnerQuestion: "¿Eres proveedor, distribuidor o contratista general?",
      partnerLink: "Hazte socio instalador",
    },
    map: {
      callout: "Taller de Triple J · Oficina central",
      directions: "Cómo llegar →",
    },
    og: {
      alt: `Contacta a Triple J Metal — llama al ${SITE.phone}`,
      eyebrow: "Contacto",
      headline: "Ponte en contacto",
      subhead: (address: string, hours: string): string => `${address} · ${hours}`,
    },
  },
);

/** Opening hours in the page's language; the facts stay in src/lib/site.ts. */
export function contactHours(locale: Locale): string {
  return locale === "es" ? SITE_ES.hours : SITE.hours;
}
