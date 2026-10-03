import { bilingual } from "@/i18n/config";

/**
 * /alternatives/[slug] page chrome, both languages: the section labels, the
 * buttons and the OG card words around the comparison content, which lives in
 * src/lib/competitors.ts (English) and competitors.es.ts (Spanish). Honest
 * comparison framing stays as strong as the English: it never says a
 * competitor lacks something (Locked Decisions → Positioning).
 */
export const ALTERNATIVES = bilingual(
  {
    hero: {
      eyebrow: "Comparison",
      cta: "Get a Free Quote",
      call: "Call ",
    },
    tldr: "TL;DR",
    why: "Why people compare these",
    table: {
      eyebrow: "Side-by-side",
      heading: "Feature-by-feature comparison",
      subheading:
        "What you get with each company on the most-asked questions. Verified from each company's public website.",
    },
    competitorWins: "When the competitor is the right pick",
    tripleJWins: "When Triple J Metal is the better fit",
    cta: "Get a Free Quote",
    og: {
      alt: "Triple J Metal — compare metal carport options in Central Texas",
      eyebrow: "Compare",
      // Used only if the route is reached with an unknown slug.
      fallbackHeadline: "Compare Metal Carport Options",
      fallbackAccent: "In Central Texas.",
    },
  },
  {
    hero: {
      eyebrow: "Comparación",
      cta: "Cotización gratis",
      call: "Llama al ",
    },
    tldr: "En resumen",
    why: "Por qué la gente compara estas opciones",
    table: {
      eyebrow: "Lado a lado",
      heading: "Comparación punto por punto",
      subheading:
        "Lo que obtienes con cada empresa en las preguntas más frecuentes. Verificado en el sitio web público de cada empresa.",
    },
    competitorWins: "Cuándo el competidor es la opción indicada",
    tripleJWins: "Cuándo Triple J Metal encaja mejor",
    cta: "Cotización gratis",
    og: {
      alt: "Triple J Metal — compara opciones de cocheras metálicas en el centro de Texas",
      eyebrow: "Comparar",
      fallbackHeadline: "Compara opciones de cocheras metálicas",
      fallbackAccent: "en el centro de Texas.",
    },
  },
);
