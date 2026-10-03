import { bilingual } from "@/i18n/config";

/**
 * /best-metal-carport-builders-temple-tx copy, both languages (the Spanish page
 * is /es/mejores-constructores-de-cocheras-temple-tx). The English is what
 * shipped before the Spanish site; the Spanish carries the same numbers and
 * claims. This page is legally sensitive (Locked Decisions → Positioning):
 * it never says a competitor lacks something, and Spanish service is a Triple J
 * strength, not a differentiator. Competitor facts: src/lib/competitors.ts and
 * competitors.es.ts.
 */
export const ROUNDUP = bilingual(
  {
    meta: {
      title: "Best Metal Carport Builders, Temple TX 2026",
      description:
        "Honest roundup of Bell County metal carport builders: Triple J Metal, Rough Country, L&E Metal, Texas Custom Carports, A+ Sheds and Premier Portables.",
      ogTitle: "Best Metal Carport Builders in Temple, TX (2026)",
      ogDescription: "Honest comparison of Bell County metal building contractors.",
    },
    og: {
      alt: "Best metal carport builders in Temple, TX — 2026 roundup",
      eyebrow: "2026 Roundup",
      headline: "Best Metal Carport Builders",
      accent: "in Temple, TX.",
      subhead: "Honest comparison of Bell County metal building contractors.",
    },
    jsonLd: {
      name: "Best Metal Carport Builders in Temple, TX (2026 Roundup)",
      description:
        "Honest comparison of metal carport builders in Bell County, Texas. Includes Triple J Metal and five local competitors sourced from Yelp.",
      listName: "Bell County Metal Carport Builders",
      breadcrumb: "Best Builders",
    },
    hero: {
      crumb: "Best builders",
      eyebrow: "Local Roundup · 2026",
      h1: "Best metal carport builders in Temple, TX (2026 roundup)",
      lede: "An honest comparison of Bell County metal building contractors. We’re Triple J Metal — yes, we’re on this list. We also list the five other local builders we know about so you can compare. No paid placements, no sponsored slots.",
      cta: "Get a Free Quote from Triple J",
      call: "Call ",
    },
    disclosure: {
      lead: "Disclosure:",
      body: "This is Triple J Metal’s website. Triple J appears first because we publish this list; the order is not an independent ranking. The other listed builders are real Bell County companies sourced from Yelp searches as of April 2026. We don’t earn referrals if you choose a competitor — but we want you to be able to compare us fairly.",
    },
    why: {
      heading: "Why a Bell County builder usually beats a national kit",
      p1: "Metal carport buyers can compare local builders with national providers. Installation may be included in either model. Ask who will do the work, whether concrete is included, and what the written scope covers.",
      p2: "For most homeowners, the local-builder path produces a better outcome: someone you can actually call back, faster scheduling, and (in most cases) a real concrete pad poured by the same company. That’s why this roundup focuses on the local Central Texas builders we know about — including us.",
    },
    profiles: {
      heading: "Local builders to compare",
      self: "That’s us",
      coverage: "Coverage:",
      ourSite: "Our site",
      listing: "Public listing",
    },
    table: {
      eyebrow: "Side-by-side",
      heading: "Feature comparison across local builders",
      subheading:
        "Most of the local builder data comes from Yelp listings and public directories — many fields are unknown without the builder's own website. We've shown what we can verify, marked the rest 'unknown,' and welcome corrections from the other builders if anything's wrong.",
    },
    choose: {
      heading: "How to choose between local builders",
      intro:
        "Most local Bell County builders deliver real value compared to national kits. The differences come down to four questions:",
      items: [
        {
          lead: "Welded or bolted?",
          body: "Triple J offers both. Compare the complete design, framing, anchoring, and specifications for your site.",
        },
        {
          lead: "Concrete in the same contract?",
          body: "Some builders pour the slab, others expect you to hire a separate concrete contractor. The single-contract version saves coordination headaches.",
        },
        {
          lead: "How fast can they start?",
          body: "Same-week scheduling is rare. If the builder needs 4–6 weeks, that may be fine for a planned build but bad for a hailstorm-driven RV cover.",
        },
        {
          lead: "Will the same crew do site prep, install, and cleanup?",
          body: "Some local builders sub out portions of the work. The cleanest version is one crew, start to finish.",
        },
      ],
    },
    pick: {
      eyebrow: "Why pick us",
      heading: "When Triple J Metal is the right fit",
      items: [
        "You want to discuss welded and bolted options with the crew that will install the structure.",
        "You want the concrete pad, engineered for Bell County clay, poured in the same contract as the structure install.",
        "You need it built same-week.",
        "You speak Spanish or want to. Hablamos español.",
      ],
      phone: (phone: string): string =>
        `You want a local Texas phone number (${phone}) that goes to the actual family running the company.`,
      cta: (name: string): string => `Get a Free Quote from ${name}`,
    },
  },
  {
    meta: {
      title: "Los mejores constructores de cocheras metálicas, Temple TX 2026",
      description:
        "Resumen honesto de los constructores de cocheras metálicas del condado de Bell: Triple J Metal, Rough Country, L&E Metal, Texas Custom Carports, A+ Sheds y Premier Portables.",
      ogTitle: "Los mejores constructores de cocheras metálicas en Temple, TX (2026)",
      ogDescription: "Comparación honesta de los contratistas de edificios metálicos del condado de Bell.",
    },
    og: {
      alt: "Los mejores constructores de cocheras metálicas en Temple, TX — resumen 2026",
      eyebrow: "Resumen 2026",
      headline: "Los mejores constructores de cocheras metálicas",
      accent: "en Temple, TX.",
      subhead: "Comparación honesta de los contratistas de edificios metálicos del condado de Bell.",
    },
    jsonLd: {
      name: "Los mejores constructores de cocheras metálicas en Temple, TX (resumen 2026)",
      description:
        "Comparación honesta de constructores de cocheras metálicas en el condado de Bell, Texas. Incluye a Triple J Metal y a cinco competidores locales tomados de Yelp.",
      listName: "Constructores de cocheras metálicas del condado de Bell",
      breadcrumb: "Mejores constructores",
    },
    hero: {
      crumb: "Mejores constructores",
      eyebrow: "Resumen local · 2026",
      h1: "Los mejores constructores de cocheras metálicas en Temple, TX (resumen 2026)",
      lede: "Una comparación honesta de los contratistas de edificios metálicos del condado de Bell. Somos Triple J Metal — sí, estamos en esta lista. También incluimos a los otros cinco constructores locales que conocemos para que puedas comparar. Sin posiciones pagadas, sin espacios patrocinados.",
      cta: "Pide una cotización gratis a Triple J",
      call: "Llama al ",
    },
    disclosure: {
      lead: "Aviso:",
      body: "Este es el sitio web de Triple J Metal. Triple J aparece primero porque nosotros publicamos esta lista; el orden no es una clasificación independiente. Los demás constructores incluidos son empresas reales del condado de Bell tomadas de búsquedas en Yelp a abril de 2026. No ganamos comisión por referidos si eliges a un competidor — pero queremos que puedas compararnos de manera justa.",
    },
    why: {
      heading: "Por qué un constructor del condado de Bell suele superar a un kit nacional",
      p1: "Quienes compran una cochera metálica pueden comparar constructores locales con proveedores nacionales. La instalación puede venir incluida en cualquiera de los dos modelos. Pregunta quién hará el trabajo, si el concreto viene incluido y qué cubre el alcance por escrito.",
      p2: "Para la mayoría de los propietarios, el camino del constructor local da un mejor resultado: alguien a quien de verdad puedes volver a llamar, una programación más rápida y (en la mayoría de los casos) una losa de concreto de verdad colada por la misma empresa. Por eso este resumen se enfoca en los constructores locales del centro de Texas que conocemos — incluyéndonos a nosotros.",
    },
    profiles: {
      heading: "Constructores locales para comparar",
      self: "Somos nosotros",
      coverage: "Cobertura:",
      ourSite: "Nuestro sitio",
      listing: "Listado público",
    },
    table: {
      eyebrow: "Lado a lado",
      heading: "Comparación de características entre constructores locales",
      subheading:
        "La mayoría de los datos de los constructores locales proviene de listados de Yelp y directorios públicos — muchos campos son desconocidos sin el sitio web del propio constructor. Mostramos lo que podemos verificar, marcamos el resto como “sin datos” y recibimos con gusto las correcciones de los otros constructores si algo está mal.",
    },
    choose: {
      heading: "Cómo elegir entre constructores locales",
      intro:
        "La mayoría de los constructores locales del condado de Bell ofrecen un valor real frente a los kits nacionales. Las diferencias se reducen a cuatro preguntas:",
      items: [
        {
          lead: "¿Soldado o atornillado?",
          body: "Triple J ofrece ambos. Compara el diseño completo, la estructura, el anclaje y las especificaciones para tu terreno.",
        },
        {
          lead: "¿Concreto en el mismo contrato?",
          body: "Algunos constructores cuelan la losa; otros esperan que contrates a un contratista de concreto aparte. La versión de un solo contrato ahorra dolores de cabeza de coordinación.",
        },
        {
          lead: "¿Qué tan rápido pueden empezar?",
          body: "La programación en la misma semana es poco común. Si el constructor necesita 4–6 semanas, eso puede estar bien para una obra planeada, pero no para una cubierta para RV que urge por una tormenta de granizo.",
        },
        {
          lead: "¿El mismo equipo hará la preparación del terreno, la instalación y la limpieza?",
          body: "Algunos constructores locales subcontratan partes del trabajo. La versión más limpia es un solo equipo, de principio a fin.",
        },
      ],
    },
    pick: {
      eyebrow: "Por qué elegirnos",
      heading: "Cuándo Triple J Metal es la mejor opción",
      items: [
        "Quieres hablar de las opciones soldadas y atornilladas con el equipo que va a instalar la estructura.",
        "Quieres que la losa de concreto, diseñada para la arcilla del condado de Bell, se cuele en el mismo contrato que la instalación de la estructura.",
        "Necesitas que se construya en la misma semana.",
        "Hablas español o prefieres que te atiendan en español. Hablamos español.",
      ],
      phone: (phone: string): string =>
        `Quieres un número de teléfono local de Texas (${phone}) al que contesta la familia que de verdad dirige la empresa.`,
      cta: (name: string): string => `Pide una cotización gratis a ${name}`,
    },
  },
);
