import { bilingual } from '@/i18n/config'
import { SITE } from '@/lib/site'

/**
 * The words around a service page's own data (`/services/[slug]`,
 * `/es/servicios/[slug]`). The data itself — hero, features, FAQs, specs —
 * is src/lib/services.ts with src/lib/services.es.ts laid over it.
 */
export const SERVICE_PAGE = bilingual(
  {
    /** Eyebrow on pages without Forge copy, by keyword gap. */
    gapEyebrows: {
      1: 'Turnkey + Concrete',
      2: 'Welded Steel Quality',
      3: 'Same-Week Speed',
      4: 'HOA Luxury Builds',
    } as Record<number, string>,
    heroImageAlt: (title: string): string => `${title} built by ${SITE.name}`,
    quote: 'Get a Free Quote',
    call: 'Call',
    breadcrumb: 'Services',
    included: 'What’s included',
    builds: {
      eyebrow: 'Recent builds',
      heading: 'Real jobs, real addresses.',
      gallery: 'See the full gallery →',
    },
    tech: {
      eyebrow: 'Built for Central Texas',
      heading: 'Built for Central Texas',
      specTitle: (menu: string): string => `Spec sheet · ${menu}`,
      footnote: 'Final gauge, anchoring and engineering are confirmed for your design and site.',
    },
    faq: {
      eyebrow: 'Questions',
      line1: 'What people',
      line2: 'ask us.',
      stillUnsure: 'Still unsure? Call',
      picksUp: '. A real person from our Temple crew picks up.',
    },
    rails: {
      related: 'Related',
      panels: 'Panels & specialty',
      cities: 'Cities we serve',
    },
    /** Fixed "Related" buttons after the two related services. */
    links: {
      gallery: 'Project gallery',
      temple: 'Temple, TX',
      belton: 'Belton, TX',
      about: 'About our crew',
      military: 'Fort Cavazos military discount',
    },
    /** "Panels & specialty" buttons. */
    panels: {
      colors: 'Panel colors',
      pbrPbu: 'PBR vs PBU panels',
      hybrid: 'Hybrid projects',
    },
    ogEyebrow: 'Central Texas',
    ogAlt: 'Triple J Metal — metal buildings in Central Texas',
  },
  {
    gapEyebrows: {
      1: 'Llave en mano + concreto',
      2: 'Calidad en acero soldado',
      3: 'Rapidez en la misma semana',
      4: 'Obras de lujo para HOA',
    },
    heroImageAlt: (title: string): string => `${title}: obra de ${SITE.name}`,
    quote: 'Cotización gratis',
    call: 'Llamar al',
    breadcrumb: 'Servicios',
    included: 'Qué incluye',
    builds: {
      eyebrow: 'Obras recientes',
      heading: 'Trabajos reales, direcciones reales.',
      gallery: 'Ver la galería completa →',
    },
    tech: {
      eyebrow: 'Hecho para el centro de Texas',
      heading: 'Hecho para el centro de Texas',
      specTitle: (menu: string): string => `Ficha técnica · ${menu}`,
      footnote: 'El calibre final, el anclaje y la ingeniería se confirman para tu diseño y tu terreno.',
    },
    faq: {
      eyebrow: 'Preguntas',
      line1: 'Lo que la gente',
      line2: 'nos pregunta.',
      stillUnsure: '¿Todavía tienes dudas? Llama al',
      picksUp: '. Te contesta una persona de verdad de nuestro equipo de Temple.',
    },
    rails: {
      related: 'Relacionado',
      panels: 'Paneles y especialidades',
      cities: 'Ciudades que atendemos',
    },
    links: {
      gallery: 'Galería de proyectos',
      temple: 'Temple, TX',
      belton: 'Belton, TX',
      about: 'Sobre nuestro equipo',
      military: 'Descuento militar de Fort Cavazos',
    },
    panels: {
      colors: 'Colores de paneles',
      pbrPbu: 'Paneles PBR vs PBU',
      hybrid: 'Proyectos híbridos',
    },
    ogEyebrow: 'Centro de Texas',
    ogAlt: 'Triple J Metal — edificios metálicos en el centro de Texas',
  },
)
