import type { Locale } from '@/i18n/config'
import {
  ALTERNATIVES_CONTENT,
  ALTERNATIVES_SLUGS,
  COMPETITORS,
  LOCAL_ROUNDUP_COMPARISON_ROWS,
  NATIONAL_KIT_COMPARISON_ROWS,
  type AlternativesPageContent,
  type AlternativesSlug,
  type ComparisonCell,
  type ComparisonRow,
  type Competitor,
  type CompetitorSlug,
} from '@/lib/competitors'

/**
 * Spanish copy for the publishable comparison content in competitors.ts
 * (Locked Decisions → Spanish site, 2026-10-03). Facts stay in the English
 * file: competitor names, URLs, `asOf` dates, row statuses, slugs, every
 * number. This file holds only the words, keyed the same way, plus the
 * accessors that merge the two.
 *
 * Claims are exactly as strong as the English (Locked Decisions →
 * Positioning): no competitor is said to lack anything, welded-or-bolted is
 * not a claim against local builders, and Spanish service is a Triple J
 * strength, never something competitors lack. Concrete is "disponible" /
 * "se cotiza por separado"; permits are advisory.
 *
 * Accessors live here, not in competitors.ts, so the Spanish copy never
 * rides along into a module a client component imports.
 */

// ── Competitor one-liners and coverage ─────────────────────────────────────

export type CompetitorCopyEs = Pick<Competitor, 'oneLiner' | 'coverage'>

export const COMPETITORS_ES: Record<CompetitorSlug, CompetitorCopyEs> = {
  'eagle-carports': {
    oneLiner: 'Fabricante nacional de cocheras metálicas con una red de distribuidores que cubre más de 40 estados.',
    coverage: 'Más de 40 estados de EE. UU. mediante una red de distribuidores independientes',
  },
  'get-carports': {
    oneLiner:
      'Configurador en línea de cocheras, garajes y graneros metálicos prefabricados que se envían a todo el país.',
    coverage: 'Estados Unidos continental mediante envío + instalación por distribuidor',
  },
  'carport-central': {
    oneLiner: 'Tienda en línea de cocheras, garajes y edificios metálicos de acero prefabricados.',
    coverage: 'Estados Unidos continental mediante envío + instalación por distribuidor',
  },
  'viking-steel': {
    oneLiner: 'Tienda en línea de estructuras de acero prefabricadas que cubre 48 estados.',
    coverage: '48 estados mediante envío + instalación por distribuidor',
  },
  'infinity-carports': {
    oneLiner: 'Configurador en línea de edificios metálicos con una red de distribuidores en varios estados.',
    coverage: 'Varios estados de EE. UU. mediante una red de distribuidores',
  },
  'rough-country-carports': {
    oneLiner:
      'Cocheras metálicas a la medida, cubiertas para RV, garajes y graneros con base en Temple, con estimados en el sitio.',
    coverage: 'Zona de Temple, TX',
  },
  'le-metal': {
    oneLiner:
      'Instalador de Temple de cocheras a la medida (p. ej., 20x20x10) a quien las reseñas destacan por programar con rapidez.',
    coverage: 'Zona de Temple, TX',
  },
  'texas-custom-carports': {
    oneLiner:
      'Constructor con base en Belton de cocheras de acero y techos para patio a la medida, con experiencia en instalaciones residenciales en patios traseros.',
    coverage: 'Zona de Belton, TX',
  },
  'a-plus-sheds-carports': {
    oneLiner: 'Revendedor en Temple de las líneas de productos Derksen Buildings y Superior Carports.',
    coverage: 'Zona de Temple, TX',
  },
  'premier-portables': {
    oneLiner: 'Proveedor en Temple de cobertizos, cocheras y patios construidos a la medida en el sitio.',
    coverage: 'Zona de Temple, TX',
  },
  'triple-j-metal': {
    oneLiner:
      'Contratista de edificios metálicos de Temple, TX, de propiedad familiar — acero de viga roja soldado o atornillado, concreto disponible, instalaciones en la misma semana en el condado de Bell y los condados vecinos.',
    coverage:
      'Condados de Bell, McLennan, Coryell, Williamson, Lampasas, Falls, Milam y Burnet (radio de 90 minutos desde Temple)',
  },
}

/** A competitor with its description and coverage in the page's language. */
export function getCompetitor(slug: CompetitorSlug, locale: Locale): Competitor {
  const competitor = COMPETITORS[slug]
  return locale === 'es' ? { ...competitor, ...COMPETITORS_ES[slug] } : competitor
}

// ── /alternatives/[slug] page content ──────────────────────────────────────

/** The translated fields of an alternatives page; slug and compared slugs stay in English. */
export type AlternativesCopyEs = Omit<AlternativesPageContent, 'slug' | 'competitorSlugs'>

const SHARED_ES = {
  heroSubhead:
    'Compara el alcance completo de cada proyecto. Triple J Metal ofrece estructuras soldadas o atornilladas, instaladas por nuestro equipo con base en Temple, con preparación del terreno y concreto disponibles en el mismo contrato.',
  tldr: 'Compara el diseño, la instalación, los cimientos y el alcance total antes de elegir constructor. Triple J Metal ofrece una relación directa con un equipo local. Pide a cada proveedor que confirme qué incluye para tu dirección y tu proyecto.',
  whyCompare:
    'El precio de un edificio solo sirve cuando el alcance está claro. Revisa las dimensiones, la estructura, los paneles de techo y de pared, las puertas, el anclaje, la entrega, la instalación, el concreto, los impuestos y cualquier aprobación requerida. Cotizaciones distintas pueden cubrir trabajos distintos.',
  whenTripleJWins: [
    'Quieres un equipo con base en Temple que atienda el centro de Texas.',
    'Quieres comparar opciones de viga roja soldada y atornillada.',
    'Quieres preparación del terreno y una losa de concreto, cotizada por separado, disponibles en el mismo contrato.',
    'Quieres hablar directamente con el equipo sobre el plazo que prefieres.',
    'Prefieres hablar de tu proyecto en inglés o en español.',
  ],
  breakdownSections: [
    {
      heading: 'Compara el alcance de la instalación',
      body: 'Pregunta quién entrega e instala la estructura, quién prepara el terreno y quién da el seguimiento. Algunos proveedores incluyen la instalación; otros ofrecen arreglos distintos. Triple J instala con su propio equipo las estructuras que cotiza.',
    },
    {
      heading: 'Compara el diseño completo',
      body: 'Las conexiones soldadas o atornilladas, por sí solas, no determinan el desempeño frente al viento. Compara la estructura, el anclaje, los cimientos y la ingeniería especificados para tu terreno. Triple J ofrece opciones tanto soldadas como atornilladas.',
    },
    {
      heading: 'Cotiza el concreto por separado',
      body: 'Triple J puede incluir la preparación del terreno, el concreto y la instalación en un solo contrato. Nuestros precios iniciales anunciados de acero e instalación no incluyen el concreto. Pide a cada proveedor una cotización detallada para que los totales cubran un trabajo equivalente.',
    },
    {
      heading: 'Confirma la programación',
      body: 'Los tiempos de entrega cambian según la ubicación, el diseño, la disponibilidad de materiales y el estado del terreno. Pide a cada proveedor un calendario vigente para tu proyecto. Triple J ofrece programación en la misma semana cuando el alcance y la disponibilidad lo permiten; tu fecha de instalación se confirma durante la cotización.',
    },
  ],
}

function alternativeEs(
  metaTitle: string,
  metaDescription: string,
  h1: string,
  whenCompetitorWins: string,
): AlternativesCopyEs {
  return {
    metaTitle,
    metaDescription,
    h1,
    heroSubhead: SHARED_ES.heroSubhead,
    tldr: SHARED_ES.tldr,
    whyCompare: SHARED_ES.whyCompare,
    whenCompetitorWins,
    whenTripleJWins: [...SHARED_ES.whenTripleJWins],
    breakdownSections: SHARED_ES.breakdownSections.map((s) => ({ ...s })),
  }
}

const wins = (who: string) =>
  `Considera ${who} cuando su área de servicio, sus diseños disponibles y su propuesta por escrito se ajusten a tu proyecto. Confirma directamente con el proveedor los arreglos de instalación vigentes, las exclusiones, los términos de la garantía y la programación.`

const metaDescription = (who: string) =>
  `Compara ${who} con Triple J Metal en el centro de Texas. Revisa instalación, concreto, diseño y programación en una cotización escrita.`

export const ALTERNATIVES_CONTENT_ES: Record<AlternativesSlug, AlternativesCopyEs> = {
  'eagle-carports': alternativeEs(
    'Alternativas a Eagle Carports en el centro de TX',
    metaDescription('Eagle Carports'),
    'Alternativas a Eagle Carports en el centro de Texas',
    wins('Eagle Carports'),
  ),
  'get-carports': alternativeEs(
    'Alternativas a Get Carports en el centro de TX',
    metaDescription('Get Carports'),
    'Alternativas a Get Carports en el centro de Texas',
    wins('Get Carports'),
  ),
  'carport-central': alternativeEs(
    'Alternativas a Carport Central en el centro de TX',
    metaDescription('Carport Central'),
    'Alternativas a Carport Central en el centro de Texas',
    wins('Carport Central'),
  ),
  'national-kit-dealers': alternativeEs(
    'Alternativas a distribuidores de kits de cocheras, centro de TX',
    'Compara a los proveedores nacionales de edificios metálicos con Triple J Metal en el centro de Texas. Revisa instalación, concreto, diseño y programación en una cotización escrita.',
    'Alternativas a los kits nacionales de cocheras metálicas en el centro de Texas',
    wins('a los proveedores nacionales de edificios metálicos'),
  ),
}

/**
 * The page content for a slug in the page's language, or null. English comes
 * back exactly as competitors.ts defines it.
 */
export function getAlternativesContent(slug: string, locale: Locale): AlternativesPageContent | null {
  if (!ALTERNATIVES_SLUGS.includes(slug as AlternativesSlug)) return null
  const english = ALTERNATIVES_CONTENT[slug as AlternativesSlug]
  return locale === 'es' ? { ...english, ...ALTERNATIVES_CONTENT_ES[english.slug] } : english
}

// ── Comparison rows ────────────────────────────────────────────────────────

/** Copy for one /alternatives row, by position in NATIONAL_KIT_COMPARISON_ROWS. */
type NationalRowCopyEs = {
  label: string
  description: string
  /** The cell note under the competitor's column. */
  competitorNote: string
  /** The cell note under Triple J's column. */
  tripleJNote: string
}

const NATIONAL_KIT_ROWS_ES: NationalRowCopyEs[] = [
  {
    label: 'Instalación',
    description: 'Confirma la entrega, la instalación y la preparación del terreno en el alcance por escrito.',
    competitorNote: 'Confirma con el proveedor',
    tripleJNote: 'Nuestro propio equipo',
  },
  {
    label: 'Soldado o atornillado',
    description: 'Pregunta qué sistemas estructurales ofrecen para tu diseño.',
    competitorNote: 'Confirma con el proveedor',
    tripleJNote: 'Ambos disponibles',
  },
  {
    label: 'Concreto',
    description: 'Revisa si el concreto viene incluido o se cotiza por separado.',
    competitorNote: 'Confirma con el proveedor',
    tripleJNote: 'Se cotiza por separado; disponible en el mismo contrato',
  },
  {
    label: 'Programación',
    description: 'Pide una fecha vigente según tu ubicación y qué tan listo esté tu terreno.',
    competitorNote: 'Confirma con el proveedor',
    tripleJNote: 'Pregunta por disponibilidad en la misma semana',
  },
  {
    label: 'Permisos',
    description: 'Confirma las responsabilidades de presentación y aprobación del permiso antes de empezar el trabajo.',
    competitorNote: 'Confirma con el proveedor',
    tripleJNote: 'Te orientamos',
  },
  {
    label: 'Contacto',
    description: 'Identifica quién se encarga de tu cotización y el seguimiento.',
    competitorNote: 'Confirma con el proveedor',
    tripleJNote: 'Equipo con base en Temple',
  },
]

/**
 * The /alternatives rows for one competitor in the page's language. Statuses
 * and which cells carry a note are the English file's; only the words change.
 */
export function nationalKitComparisonRows(competitorSlug: CompetitorSlug, locale: Locale): ComparisonRow[] {
  const rows = NATIONAL_KIT_COMPARISON_ROWS(competitorSlug)
  if (locale === 'en') return rows
  return rows.map((row, i) => {
    const copy = NATIONAL_KIT_ROWS_ES[i]
    if (!copy) return row
    const cells: Partial<Record<CompetitorSlug, ComparisonCell>> = {}
    for (const [slug, cell] of Object.entries(row.cells) as [CompetitorSlug, ComparisonCell][]) {
      cells[slug] =
        typeof cell === 'object'
          ? { ...cell, note: slug === 'triple-j-metal' ? copy.tripleJNote : copy.competitorNote }
          : cell
    }
    return { label: copy.label, description: copy.description, cells }
  })
}

/** Copy for one local-roundup row, by position in LOCAL_ROUNDUP_COMPARISON_ROWS. */
type LocalRowCopyEs = { label: string; notes?: Partial<Record<CompetitorSlug, string>> }

const LOCAL_ROUNDUP_ROWS_ES: LocalRowCopyEs[] = [
  { label: 'Opción de acero soldado' },
  { label: 'Opción de acero atornillado' },
  {
    label: 'Losa de concreto en el mismo contrato',
    notes: { 'triple-j-metal': '3,000 PSI estándar · 4,000 a solicitud' },
  },
  { label: 'Graneros + garajes + cubiertas para RV a la medida' },
  {
    label: 'Programación en la misma semana',
    notes: { 'le-metal': 'Según reseñas de Yelp' },
  },
]

/** The local roundup rows in the page's language (statuses are the English file's). */
export function localRoundupComparisonRows(locale: Locale): ComparisonRow[] {
  if (locale === 'en') return LOCAL_ROUNDUP_COMPARISON_ROWS
  return LOCAL_ROUNDUP_COMPARISON_ROWS.map((row, i) => {
    const copy = LOCAL_ROUNDUP_ROWS_ES[i]
    if (!copy) return row
    const cells: Partial<Record<CompetitorSlug, ComparisonCell>> = {}
    for (const [slug, cell] of Object.entries(row.cells) as [CompetitorSlug, ComparisonCell][]) {
      const note = copy.notes?.[slug]
      cells[slug] = typeof cell === 'object' && note ? { ...cell, note } : cell
    }
    return { label: copy.label, cells }
  })
}
