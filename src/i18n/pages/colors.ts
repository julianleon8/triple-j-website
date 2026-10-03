import { bilingual } from '@/i18n/config'
import { LINE_LABELS, LINE_SUBTITLES } from '@/lib/colors'

/**
 * `/services/colors` and `/es/servicios/colores`. Color NAMES (Burnished
 * Slate, Brite Red…) are the manufacturer's catalog names and stay English on
 * both sides — that is what customers order by; only the labels, subtitles and
 * sentences around them are translated.
 */
export const COLORS_PAGE = bilingual(
  {
    meta: {
      title: 'Metal Panel Colors & Finishes',
      description:
        'Browse 39 metal panel colors for your Central Texas carport, garage, or barn. 26 & 29-gauge Galvalume® steel with a 40-year paint warranty.',
      ogTitle: 'Metal Panel Colors & Finishes | Triple J Metal',
      ogDescription: 'Choose from 39 painted Galvalume® panel colors for your Central Texas metal building. Standard and Premium lines.',
    },
    breadcrumbs: { services: 'Services', colors: 'Panel Colors' },
    hero: {
      eyebrow: 'Panel Options',
      h1: 'Metal Panel Colors & Finishes',
      lede: "Triple J Metal sources painted Galvalume® steel from leading regional Texas suppliers, spec'd for high-UV, high-heat Central Texas conditions. Available in 26 and 29 gauge, 39 colors across two product lines.",
      quote: 'Get a Free Color Quote',
      call: 'Call',
    },
    overview: {
      aria: 'Finish overview',
      stats: [
        { stat: '39', label: 'Colors Available' },
        { stat: '26 & 29', label: 'Gauge Options' },
        { stat: '40-Year', label: 'Paint Warranty' },
        { stat: 'Galvalume®', label: 'Steel Substrate' },
      ],
    },
    lines: {
      standard: {
        eyebrow: '26 & 29 Gauge',
        label: LINE_LABELS.Turnium,
        sub: LINE_SUBTITLES.Turnium,
        lede: (sub: string): string =>
          `${sub}. Standard residential and commercial panel for carports, barns, garages, and RV covers. PBR and PBU profiles available.`,
      },
      premium: {
        eyebrow: '26 Gauge Only',
        label: LINE_LABELS.Sheffield,
        sub: LINE_SUBTITLES.Sheffield,
        lede: (sub: string): string =>
          `${sub}. Concealed-fastener standing-seam options popular for HOA-governed neighborhoods like Heritage Oaks and Bella Charca. Higher-end aesthetic with hidden fasteners.`,
      },
    },
    count: (n: number): string => `${n} Colors`,
    swatchAlt: (name: string): string => `${name} metal panel swatch`,
    bestValue: 'Best Value',
    cheapest: 'Cheapest option',
    hoa: 'HOA',
    legend: {
      hoa: '= commonly used in HOA-governed subdivisions',
      bestValue: '= our most economical panel option',
    },
    about: {
      heading: 'Built for Central Texas Sun',
      p1: 'The painted finish on every panel is engineered specifically for high-UV, high-heat environments. The color coat bonds to a Galvalume® substrate — a zinc-aluminum alloy that resists rust at cut edges and fastener points, which is where standard painted steel panels fail first in the Central Texas climate. Backed by a 40-year paint warranty.',
      p2: (standard: string, premium: string): string =>
        `When you fill out the quote form, just mention the color name and line (${standard} or ${premium}) — or tell us your project type and we’ll recommend colors that match common HOA palettes or complement popular Central Texas home exterior colors.`,
      noteLabel: 'Note:',
      note: 'Actual colors may vary from on-screen swatches due to monitor calibration. Physical samples are available — call or visit our Temple, TX office to see panels in person before committing to a color.',
    },
    related: {
      label: 'Related',
      pbrPbu: 'PBR vs PBU Panels →',
      services: 'All Services →',
      gallery: 'See Completed Projects →',
    },
    og: {
      alt: 'Triple J Metal — metal panel colors and finishes',
      eyebrow: 'Panel Colors',
      headline: 'Metal Panel Colors & Finishes',
      subhead: (n: number): string =>
        `Choose from ${n} painted Galvalume® panel colors for your Central Texas metal building. Standard and Premium lines.`,
    },
  },
  {
    meta: {
      title: 'Colores y acabados de paneles metálicos',
      description:
        'Mira 39 colores de panel metálico para tu cochera, garaje o granero en el centro de Texas. Galvalume® calibre 26 y 29, garantía de pintura de 40 años.',
      ogTitle: 'Colores y acabados de paneles metálicos | Triple J Metal',
      ogDescription:
        'Elige entre 39 colores de panel Galvalume® pintado para tu edificio metálico en el centro de Texas. Líneas Estándar y Premium.',
    },
    breadcrumbs: { services: 'Servicios', colors: 'Colores de paneles' },
    hero: {
      eyebrow: 'Opciones de paneles',
      h1: 'Colores y acabados de paneles metálicos',
      lede: 'Triple J Metal compra acero Galvalume® pintado a proveedores regionales líderes de Texas, especificado para el sol intenso (UV alto) y el calor del centro de Texas. Disponible en calibre 26 y 29, 39 colores en dos líneas de producto.',
      quote: 'Cotiza tu color gratis',
      call: 'Llamar al',
    },
    overview: {
      aria: 'Resumen del acabado',
      stats: [
        { stat: '39', label: 'Colores disponibles' },
        { stat: '26 y 29', label: 'Calibres disponibles' },
        { stat: '40 años', label: 'Garantía de pintura' },
        { stat: 'Galvalume®', label: 'Sustrato de acero' },
      ],
    },
    lines: {
      standard: {
        eyebrow: 'Calibre 26 y 29',
        label: 'Línea Estándar',
        sub: 'Paneles de tornillería expuesta, calibre 26 y 29',
        lede: (sub: string): string =>
          `${sub}. Panel residencial y comercial estándar para cocheras, graneros, garajes y cubiertas para RV. Perfiles PBR y PBU disponibles.`,
      },
      premium: {
        eyebrow: 'Solo calibre 26',
        label: 'Línea Premium',
        sub: 'Paneles de tornillería oculta, calibre 26, para proyectos de HOA y arquitectónicos',
        lede: (sub: string): string =>
          `${sub}. Opciones de junta alzada con tornillería oculta, populares en vecindarios regidos por una HOA como Heritage Oaks y Bella Charca. Una estética de gama alta con tornillos ocultos.`,
      },
    },
    count: (n: number): string => `${n} colores`,
    swatchAlt: (name: string): string => `Muestra de panel metálico ${name}`,
    bestValue: 'Mejor precio',
    cheapest: 'La opción más económica',
    hoa: 'HOA',
    legend: {
      hoa: '= de uso común en subdivisiones con HOA',
      bestValue: '= nuestra opción de panel más económica',
    },
    about: {
      heading: 'Hecho para el sol del centro de Texas',
      p1: 'El acabado pintado de cada panel está diseñado específicamente para ambientes de mucho sol (UV alto) y calor intenso. La capa de color se adhiere a un sustrato Galvalume® — una aleación de zinc y aluminio que resiste el óxido en los bordes cortados y en los puntos de los tornillos, que es donde los paneles de acero pintado estándar fallan primero en el clima del centro de Texas. Respaldado por una garantía de pintura de 40 años.',
      p2: (standard: string, premium: string): string =>
        `Cuando llenes el formulario de cotización, solo menciona el nombre del color y la línea (${standard} o ${premium}) — o dinos el tipo de proyecto y te recomendamos colores que combinen con las paletas comunes de las HOA o con los colores exteriores más populares de las casas del centro de Texas.`,
      noteLabel: 'Nota:',
      note: 'Los colores reales pueden variar respecto a las muestras en pantalla por la calibración del monitor. Hay muestras físicas disponibles — llama o visita nuestra oficina en Temple, TX para ver los paneles en persona antes de decidirte por un color.',
    },
    related: {
      label: 'Relacionado',
      pbrPbu: 'Paneles PBR vs PBU →',
      services: 'Todos los servicios →',
      gallery: 'Ver proyectos terminados →',
    },
    og: {
      alt: 'Triple J Metal — colores y acabados de paneles metálicos',
      eyebrow: 'Colores de paneles',
      headline: 'Colores y acabados de paneles metálicos',
      subhead: (n: number): string =>
        `Elige entre ${n} colores de panel Galvalume® pintado para tu edificio metálico en el centro de Texas. Líneas Estándar y Premium.`,
    },
  },
)
