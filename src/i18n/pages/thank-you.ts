import { bilingual } from "@/i18n/config";

/**
 * /thank-you copy, both languages. Step 1 and the lede follow the
 * response-promise lock: the /quote funnel (?from=quote) reads "Same day,
 * guaranteed within 24 hours."; every other form says "within 24 hours". The
 * Spanish carries the same two promises.
 */
export const THANK_YOU = bilingual(
  {
    meta: {
      title: "Thanks — we'll call you back within 24 hours",
      description: "Your quote request is in. A real person from Triple J Metal will call you back within 24 hours.",
    },
    hero: {
      imgAlt: "Welded red iron frame going up on a Central Texas metal building site",
      h1a: "Got it.",
      h1b: "We’ll be in touch.",
      ledeQuote:
        "Your request landed. A real person from Triple J Metal will call you back today — guaranteed within 24 hours.",
      ledeOther: "Your request landed. A real person from Triple J Metal will call you back within 24 hours.",
      browse: "Browse our work",
      sooner: "Need it sooner? ",
    },
    next: {
      eyebrow: "What happens next",
      line1: "Three things,",
      line2: "in order.",
      back: "← Back to homepage",
      steps: (fromQuotePage: boolean): { title: string; blurb: string }[] => [
        {
          title: "We call you back",
          blurb: `${
            fromQuotePage ? "Same day, guaranteed within 24 hours." : "Within 24 hours."
          } A real person from our Temple crew on the other end, no offshore call center.`,
        },
        {
          title: "On-site walk-through",
          blurb:
            "We come measure, look at the site, and answer questions. No charge, no high-pressure pitch — just a real number on the spot.",
        },
        {
          title: "Build starts the same week",
          blurb:
            "If you say go, materials arrive fast and our crew starts. Site prep, the install, and concrete if you want it — one contract, one number.",
        },
      ],
    },
  },
  {
    meta: {
      title: "Gracias — te llamamos en menos de 24 horas",
      description:
        "Recibimos tu solicitud de cotización. Una persona de verdad de Triple J Metal te llamará en menos de 24 horas.",
    },
    hero: {
      imgAlt: "Estructura de viga roja soldada levantándose en una obra de edificio metálico en el centro de Texas",
      h1a: "Recibido.",
      h1b: "Estaremos en contacto.",
      ledeQuote:
        "Tu solicitud llegó. Una persona de verdad de Triple J Metal te llamará hoy, garantizado en menos de 24 horas.",
      ledeOther: "Tu solicitud llegó. Una persona de verdad de Triple J Metal te llamará en menos de 24 horas.",
      browse: "Ver nuestras obras",
      sooner: "¿Lo necesitas antes? ",
    },
    next: {
      eyebrow: "Qué sigue",
      line1: "Tres cosas,",
      line2: "en orden.",
      back: "← Volver al inicio",
      steps: (fromQuotePage: boolean): { title: string; blurb: string }[] => [
        {
          title: "Te llamamos",
          blurb: `${
            fromQuotePage ? "El mismo día, garantizado en menos de 24 horas." : "En menos de 24 horas."
          } Del otro lado, una persona de verdad de nuestro equipo de Temple, no un centro de llamadas en otro país.`,
        },
        {
          title: "Visita en tu terreno",
          blurb:
            "Vamos a medir, vemos el terreno y respondemos tus preguntas. Sin costo y sin presión para que compres: solo un número real en el momento.",
        },
        {
          title: "La obra empieza la misma semana",
          blurb:
            "Si das el sí, los materiales llegan rápido y nuestro equipo empieza. Preparación del terreno, la instalación y el concreto si lo quieres: un solo contrato, un solo número.",
        },
      ],
    },
  },
);
