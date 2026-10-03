import { bilingual } from "@/i18n/config";
import { SITE } from "@/lib/site";

/**
 * /quote copy, both languages. The page follows "Quote page copy rules"
 * (Website Copy & Messaging.md): one response promise, "Same day, guaranteed
 * within 24 hours." (the same promise in Spanish); permits advisory only; no
 * prices, deposit or payment language, no stars or reviews. The English list
 * item "Se habla español." stays on the English page; the Spanish page says
 * "Hablamos español."
 */
export const QUOTE = bilingual(
  {
    meta: {
      title: "Free Quote: Metal Buildings & Fencing",
      description: `Free quote on a welded or bolted metal carport, garage, barn, RV cover or metal fence. Temple, TX crew — same day, guaranteed within 24 hours.`,
      ogTitle: "Get a Free Quote | Triple J Metal",
      ogDescription: "Tell us about your build and a real Texas crew calls you back. Same day, guaranteed within 24 hours.",
    },
    jsonLd: {
      name: `Get a free quote from ${SITE.name}`,
      description: "Request a free quote on a metal carport, garage, barn, or RV cover in Temple and Central Texas.",
    },
    how: {
      eyebrow: "How it works",
      line1: "Three steps.",
      line2: "One company. Done.",
      lede: "We built Triple J to cut out the worst part of hiring a contractor: the endless coordination. You call once — we take it from there.",
      steps: [
        {
          title: "Call or request a free quote",
          body: "Tell us where, what size, and what you’re using it for. We come out, measure, and give you an honest, on-the-spot price.",
        },
        {
          title: "Site prep and concrete, if you need them",
          body: "Need a pad? Our crew grades it, runs the forms and pours it — concrete is available on any build and priced separately. One contract, one phone number.",
        },
        {
          title: "Same-week scheduling",
          body: "Your install date is confirmed after we review scope, materials, site readiness and any required approvals. You keep your weekend; we keep our word.",
        },
      ],
    },
    points: {
      fencing: [
        "Metal privacy, pipe/ranch, ornamental fencing and gates.",
        "Share your layout and any city or HOA requirements.",
        "Se habla español.",
        "Military, first-responder & trade discounts honored.",
      ],
      build: [
        "Welded or bolted — your call, quoted both ways.",
        "Building permits? We’ll talk you through it.",
        "Se habla español.",
        "Military, first-responder & trade discounts honored.",
      ],
    },
    hero: {
      current: "Free Quote",
      eyebrow: "Free quote",
      h1a: "Tell us about",
      h1bBuild: "your build.",
      h1bFence: "your fence.",
      promise: "Same day, guaranteed within 24 hours.",
      lede: "Two quick steps, then a real Texas crew calls you back — not an offshore call center.",
      call: "Or just call ",
      since: "Since",
      projects: "Projects",
      clients: "Clients",
    },
    fencing: {
      eyebrow: "Metal fencing",
      line1: "Your fence, from inquiry",
      line2: "to installation.",
      lede: "Send your approximate footage, style, and gate needs. We’ll review the site and scope, provide a written quote, and confirm an installation schedule after materials and any required approvals are settled.",
    },
    builds: {
      eyebrow: "Built by Triple J",
      line1: "A few places we’ve",
      line2: "left our mark.",
      gallery: "See the full gallery →",
    },
    og: {
      alt: "Triple J Metal — free quote on a Central Texas metal building",
      eyebrow: "Free Quote",
      headline: "Tell Us About",
      accent: "Your Build.",
      subhead: "Welded or bolted metal buildings across Central Texas. Same day, guaranteed within 24 hours.",
    },
  },
  {
    meta: {
      title: "Cotización gratis: edificios metálicos y cercas",
      description: `Cotización gratis de una cochera, garaje, granero o cubierta para RV metálicos, soldados o atornillados, o de una cerca metálica. Equipo de Temple, TX: el mismo día, garantizado en menos de 24 horas.`,
      ogTitle: "Cotización gratis | Triple J Metal",
      ogDescription:
        "Cuéntanos de tu obra y un equipo real de Texas te devuelve la llamada. El mismo día, garantizado en menos de 24 horas.",
    },
    jsonLd: {
      name: `Pide una cotización gratis a ${SITE.name}`,
      description:
        "Pide una cotización gratis de una cochera, garaje, granero o cubierta para RV metálicos en Temple y el centro de Texas.",
    },
    how: {
      eyebrow: "Cómo funciona",
      line1: "Tres pasos.",
      line2: "Una empresa. Listo.",
      lede: "Creamos Triple J para quitarte lo peor de contratar a un contratista: la coordinación interminable. Tú llamas una vez y nosotros nos encargamos del resto.",
      steps: [
        {
          title: "Llama o pide tu cotización gratis",
          body: "Dinos dónde, de qué tamaño y para qué lo vas a usar. Vamos a tu terreno, medimos y te damos un precio honesto en el momento.",
        },
        {
          title: "Preparación del terreno y concreto, si los necesitas",
          body: "¿Necesitas una losa? Nuestro equipo nivela el terreno, arma los moldes y cuela el concreto; el concreto está disponible en cualquier obra y se cotiza aparte. Un contrato, un solo número de teléfono.",
        },
        {
          title: "Instalación en la misma semana",
          body: "Confirmamos tu fecha de instalación después de revisar el alcance, los materiales, si el terreno está listo y las aprobaciones que se requieran. Tú conservas tu fin de semana; nosotros cumplimos nuestra palabra.",
        },
      ],
    },
    points: {
      fencing: [
        "Cercas metálicas de privacidad, de tubo y rancho, ornamentales, y portones.",
        "Cuéntanos cómo quieres el trazo y los requisitos de tu ciudad o HOA.",
        "Hablamos español.",
        "Respetamos descuentos para militares, primeros respondientes y gremios.",
      ],
      build: [
        "Soldado o atornillado: tú decides, y te cotizamos de las dos formas.",
        "¿Permisos de construcción? Te orientamos.",
        "Hablamos español.",
        "Respetamos descuentos para militares, primeros respondientes y gremios.",
      ],
    },
    hero: {
      current: "Cotización gratis",
      eyebrow: "Cotización gratis",
      h1a: "Cuéntanos de",
      h1bBuild: "tu obra.",
      h1bFence: "tu cerca.",
      promise: "El mismo día, garantizado en menos de 24 horas.",
      lede: "Dos pasos rápidos, y un equipo real de Texas te devuelve la llamada, no un centro de llamadas en otro país.",
      call: "O llama directo al ",
      since: "Desde",
      projects: "Proyectos",
      clients: "Clientes",
    },
    fencing: {
      eyebrow: "Cercas metálicas",
      line1: "Tu cerca, desde la consulta",
      line2: "hasta la instalación.",
      lede: "Mándanos los pies lineales aproximados, el estilo y lo que necesitas en portones. Revisamos el terreno y el alcance, te damos una cotización por escrito y confirmamos una fecha de instalación una vez que estén definidos los materiales y las aprobaciones que se requieran.",
    },
    builds: {
      eyebrow: "Hecho por Triple J",
      line1: "Algunos lugares donde",
      line2: "hemos dejado huella.",
      gallery: "Ver toda la galería →",
    },
    og: {
      alt: "Triple J Metal — cotización gratis de un edificio metálico en el centro de Texas",
      eyebrow: "Cotización gratis",
      headline: "Cuéntanos de",
      accent: "Tu obra.",
      subhead: "Edificios metálicos soldados o atornillados en todo el centro de Texas. El mismo día, garantizado en menos de 24 horas.",
    },
  },
);
