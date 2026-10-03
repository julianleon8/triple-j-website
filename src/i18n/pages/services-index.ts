import { bilingual } from '@/i18n/config'
import { SITE } from '@/lib/site'

/** The services list page (`/services`, `/es/servicios`). */
export const SERVICES_INDEX = bilingual(
  {
    meta: {
      title: 'Metal Buildings, Fences & Gates, Central TX',
      description: `Custom metal carports, garages, barns, RV covers, fencing and gates across Central Texas. Welded or bolted, concrete available. Call ${SITE.phone}.`,
    },
    breadcrumb: 'Services',
    hero: {
      imgAlt: 'Welded red iron frame going up on a Central Texas metal building site',
      eyebrow: 'What We Build',
      h1a: 'Six things we build.',
      h1b: 'Built whole, by us.',
      lede: 'Every structure is sold welded, bolted, or turnkey — with turnkey, site prep, concrete and installation sit on one contract. No kits, no subcontractors. Same-week scheduling across Bell, Coryell, and McLennan counties.',
    },
    lineup: 'Service lineup',
    flagship: 'Flagship',
    seeDetailsOf: (name: string): string => `See ${name} details`,
    seeDetails: 'See details',
    resources: {
      eyebrow: 'Resources',
      heading: 'Specs & guides',
      body: 'Pick a finish, compare panel systems, or see where we build.',
      links: [
        { href: '/services/colors', label: '39 Color Options' },
        { href: '/services/pbr-vs-pbu-panels', label: 'PBR vs PBU Panel Guide' },
        { href: '/services/hybrid-projects', label: 'Custom Hybrid Projects' },
        { href: '/locations', label: 'Service Locations' },
      ],
    },
  },
  {
    meta: {
      title: 'Edificios metálicos y cercas, centro de TX',
      description: `Cocheras, garajes, graneros, cubiertas para RV, cercas y portones en el centro de TX. Soldados o atornillados, concreto disponible. Llama al ${SITE.phone}.`,
    },
    breadcrumb: 'Servicios',
    hero: {
      imgAlt: 'Estructura de viga roja soldada levantándose en una obra de edificio metálico en el centro de Texas',
      eyebrow: 'Lo que construimos',
      h1a: 'Seis cosas que construimos.',
      h1b: 'Completo, y lo hacemos nosotros.',
      lede: 'Cada estructura se vende soldada, atornillada o llave en mano — con llave en mano, la preparación del terreno, el concreto y la instalación van en un solo contrato. Sin kits, sin subcontratistas. Programación en la misma semana en los condados de Bell, Coryell y McLennan.',
    },
    lineup: 'Lista de servicios',
    flagship: 'Servicio principal',
    seeDetailsOf: (name: string): string => `Ver detalles de ${name.toLowerCase()}`,
    seeDetails: 'Ver detalles',
    resources: {
      eyebrow: 'Recursos',
      heading: 'Especificaciones y guías',
      body: 'Elige un acabado, compara sistemas de paneles o mira dónde construimos.',
      links: [
        { href: '/services/colors', label: '39 opciones de color' },
        { href: '/services/pbr-vs-pbu-panels', label: 'Guía de paneles PBR vs PBU' },
        { href: '/services/hybrid-projects', label: 'Proyectos híbridos a la medida' },
        { href: '/locations', label: 'Ciudades donde construimos' },
      ],
    },
  },
)
