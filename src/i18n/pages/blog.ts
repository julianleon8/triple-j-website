import { bilingual } from "@/i18n/config";

/**
 * /blog (index) and /blog/[slug] (post page) copy, both languages. The post
 * bodies themselves live beside the English ones in
 * src/app/(marketing)/blog/[slug]/posts/es/; each post's card (title,
 * excerpt, tags) is in src/lib/blog.es.ts. English is what shipped before the
 * Spanish site; the Spanish carries the same numbers and claims (Locked
 * Decisions → Spanish site, 2026-10-03). No names: "our crew", "the owners".
 */
export const BLOG = bilingual(
  {
    index: {
      meta: {
        title: "Blog | Central Texas Metal Building Guides",
        description:
          "Local guides, permit walkthroughs, and metal building education for Central Texas. Written by the Triple J Metal crew in Temple, TX.",
        ogTitle: "Blog | Triple J Metal",
        ogDescription: "Central Texas metal building guides — permits, welding, HOA, military, and soil.",
      },
      hero: {
        current: "Blog",
        eyebrow: "Resource Center",
        h1a: "Metal Building Guides for Central Texas",
        lede: "Permit requirements, soil conditions, HOA rules, and the honest difference between welded and bolted steel — written by the Triple J Metal crew in Temple, TX, not an AI content farm.",
        quote: "Get a free quote",
        call: "Or call ",
      },
      featured: {
        eyebrow: "Latest Post",
        read: "Read article →",
      },
      grid: {
        aria: "More articles",
      },
      cta: {
        line1: "Ready to Build in Central Texas?",
        lede: "Skip the research — call the crew that builds in Temple, TX and know exactly what you’re getting.",
        quote: "Get a Free Quote",
        call: "Call ",
      },
    },
    post: {
      back: "← All Articles",
      byline: (crew: string): string => `By the ${crew} crew · Temple, TX · Published`,
      author: {
        name: "Triple J Metal — Temple, TX",
        bio: (year: number): string =>
          `Local metal building contractor serving Central Texas since ${year}. Welded or bolted red iron, concrete available, same-week scheduling. This guide was written by our crew from first-hand experience in Bell County.`,
      },
      related: {
        heading: "More Articles",
        back: "← Back to all articles",
      },
    },
    og: {
      alt: "Triple J Metal — metal building guides for Central Texas",
      eyebrow: "Blog",
      headline: "Metal Building Guides",
      accent: "For Central Texas.",
      subhead: "Central Texas metal building guides — permits, welding, HOA, military, and soil.",
    },
  },
  {
    index: {
      meta: {
        title: "Blog | Guías de edificios metálicos en el centro de Texas",
        description:
          "Guías locales, explicaciones de permisos y educación sobre edificios metálicos para el centro de Texas. Escritas por el equipo de Triple J Metal en Temple, TX.",
        ogTitle: "Blog | Guías de Triple J Metal",
        ogDescription: "Guías de edificios metálicos del centro de Texas — permisos, soldadura, HOA, militares y suelo.",
      },
      hero: {
        current: "Blog",
        eyebrow: "Centro de recursos",
        h1a: "Guías de edificios metálicos para el centro de Texas",
        lede: "Requisitos de permisos, condiciones del suelo, reglas de las HOA y la diferencia honesta entre acero soldado y atornillado — escritas por el equipo de Triple J Metal en Temple, TX, no por una granja de contenido de IA.",
        quote: "Cotización gratis",
        call: "O llama al ",
      },
      featured: {
        eyebrow: "Última publicación",
        read: "Leer el artículo →",
      },
      grid: {
        aria: "Más artículos",
      },
      cta: {
        line1: "¿Listo para construir en el centro de Texas?",
        lede: "Ahórrate la investigación — llama al equipo que construye en Temple, TX y sabrás exactamente lo que recibes.",
        quote: "Cotización gratis",
        call: "Llama al ",
      },
    },
    post: {
      back: "← Todos los artículos",
      byline: (crew: string): string => `Por el equipo de ${crew} · Temple, TX · Publicado el`,
      author: {
        name: "Triple J Metal — Temple, TX",
        bio: (year: number): string =>
          `Contratista local de edificios metálicos que atiende el centro de Texas desde ${year}. Viga roja soldada o atornillada, concreto disponible, instalación programada en la misma semana. Esta guía la escribió nuestro equipo con experiencia directa en el condado de Bell.`,
      },
      related: {
        heading: "Más artículos",
        back: "← Volver a todos los artículos",
      },
    },
    og: {
      alt: "Triple J Metal — guías de edificios metálicos para el centro de Texas",
      eyebrow: "Blog",
      headline: "Guías de edificios metálicos",
      accent: "Para el centro de Texas.",
      subhead: "Guías de edificios metálicos del centro de Texas — permisos, soldadura, HOA, militares y suelo.",
    },
  },
);
