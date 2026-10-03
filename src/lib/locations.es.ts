import type { Locale } from '@/i18n/config'
import { LOCATIONS, type CityCallout, type Landmark, type LocationData, type MilitarySection } from '@/lib/locations'

/**
 * Spanish copy for the city pages (/es/ciudades/[slug]).
 *
 * Facts (slug, ZIP, lat/lng, images, hrefs, gallery cities, related post
 * slugs, source URLs) stay in `locations.ts`; this file holds only the
 * translated copy fields, keyed by the same slug. Proper nouns (city, county
 * names inside place names, streets, landmarks, schools, bases, agencies)
 * stay as written; every number is copied, never retyped or rounded.
 *
 * BUNDLE RULE: `locations.ts` is imported by the client-side quote form
 * (`cityFromZip`), so it must never import this file. The accessor
 * `getLocation()` therefore lives here. Only server code imports this file.
 *
 * Voice: tú. No people's names. Permits advisory, concrete "disponible" /
 * "cotizado aparte", never "incluido" (Locked Decisions; scripts/check-vault.mjs).
 */

type Facts = NonNullable<LocationData['facts']>
type Why = NonNullable<LocationData['why']>

/** The translated copy for one city. Optional fields mirror `LocationData`. */
export type LocationCopyEs = {
  county: string
  metaTitle: string
  metaDescription: string
  heroHeadline: string
  heroCopy: string
  areaContext: string
  whyLocal: string
  services: string[]
  military?: MilitarySection
  heroImageAlt?: string
  customHeadline?: { line1: string; line2: string }
  heroSubhead?: string
  distanceFromTemple?: string
  localIntro?: string
  /** Same order as the English list; `imageSrc` stays English-owned. */
  landmarks?: Pick<Landmark, 'name' | 'blurb' | 'imageAlt'>[]
  neighborhoods?: string[]
  whyLocalBullets?: string[]
  /** Same order as the English list; `ctaHref` stays English-owned. */
  callouts?: Omit<CityCallout, 'ctaHref'>[]
  /** `url` stays English-owned. */
  localSource?: { label: string }
  heroEyebrow?: string
  facts?: Facts
  introEyebrow?: string
  introHeading?: string
  areaNote?: string
  landHeading?: string
  whyHeading?: string
  why?: Why
  quoteCallout?: NonNullable<LocationData['quoteCallout']>
}

export const LOCATIONS_ES: Record<string, LocationCopyEs> = {
  'harker-heights': {
    heroImageAlt: 'Estructura de viga roja en una obra de Triple J Metal en el centro de Texas',
    county: 'Condado de Bell',
    metaTitle: 'Cocheras metálicas en Harker Heights, TX',
    metaDescription:
      'Cocheras, garajes y cubiertas para RV soldados o atornillados en Harker Heights, TX. Equipo con base en Temple, concreto disponible, descuento militar de 7% para Fort Cavazos.',
    heroHeadline: 'Cocheras y edificios metálicos en Harker Heights, TX',
    heroCopy:
      'Planea una cochera, un garaje o una cubierta para RV con nuestro equipo con base en Temple. Dinos tus medidas y cuándo la necesitas; confirmamos el diseño, el alcance y el calendario para tu propiedad.',
    areaContext:
      'Harker Heights está sobre la US-190, justo al este de Killeen. Pinckney R. Cox y Harley Kern empezaron a vender lotes aquí en 1957, y la ciudad, que lleva el nombre de Kern, se incorporó en 1960. Muchos residentes trabajan en Fort Cavazos o en Killeen. Recibimos solicitudes de proyectos de estacionamiento techado, almacenamiento para RV y lanchas, y garajes en todo Harker Heights.',
    whyLocal:
      'Trabaja directamente con nuestro equipo con base en Temple en tu proyecto de Harker Heights: viga roja soldada o atornillada, comunicación en inglés y español, y concreto disponible en el mismo contrato.',
    services: [
      'Cocheras soldadas o atornilladas',
      'Garajes metálicos',
      'Cubiertas para RV y lanchas',
      'Patios lean-to',
      'Cercas y portones metálicos',
      'Preparación del terreno y concreto cotizado aparte',
    ],
    military: {
      headline: 'Descuento militar de Fort Cavazos — Harker Heights',
      copy: 'Fort Cavazos está aquí al lado, y un cambio de PCS casi nunca deja mucho tiempo. Triple J Metal construye cubiertas para RV, cocheras y garajes con programación en la misma semana, y ofrece un descuento de 7% para militares y primeros respondientes de Fort Cavazos. Menciona tu servicio cuando nos llames, o marca la casilla militar en el formulario de cotización.',
      keywords: ['cochera Fort Cavazos', 'cochera militar Harker Heights', 'protección de vehículos PCS condado de Bell'],
    },
    customHeadline: {
      line1: 'Hecho para Harker Heights.',
      line2: 'Estacionamiento techado, garajes y espacio para RV.',
    },
    heroSubhead:
      'Planea una cochera, un garaje o una cubierta para RV con nuestro equipo con base en Temple. Dinos tus medidas y cuándo la necesitas; confirmamos el diseño, el alcance y el calendario para tu propiedad.',
    localIntro:
      'Harker Heights está sobre la US-190, justo al este de Killeen. Pinckney R. Cox y Harley Kern empezaron a vender lotes aquí en 1957, y la ciudad, que lleva el nombre de Kern, se incorporó en 1960. Muchos residentes trabajan en Fort Cavazos o en Killeen. Recibimos solicitudes de proyectos de estacionamiento techado, almacenamiento para RV y lanchas, y garajes en todo Harker Heights.',
    landmarks: [
      {
        name: 'Stillhouse Hollow Lake',
        blurb:
          'Los vecinos de Harker Heights tienen el lago Stillhouse Hollow cerca, y las lanchas, los remolques y los RV necesitan dónde guardarse bajo techo. Dinos el largo y la altura de lo que vas a estacionar y ajustamos el espacio libre a esa medida.',
      },
    ],
    whyLocalBullets: [
      'Trae el largo y la altura de los vehículos, lanchas o remolques que necesitas cubrir.',
      'Viga roja soldada o atornillada — tú eliges, con precio en un alcance por escrito.',
      'Las condiciones del terreno y el drenaje guían la conversación sobre la cimentación; el concreto está disponible en el mismo contrato.',
      'Nuestro equipo con base en Temple puede hablar del proyecto en inglés o en español.',
    ],
    callouts: [
      {
        eyebrow: 'PCS en Fort Cavazos',
        headline: '7% de descuento militar + programación en la misma semana.',
        blurb:
          'Militares en servicio activo, retirados, de la Reserva y la Guardia, y primeros respondientes reciben 7% de descuento en cada instalación — soldada, atornillada o llave en mano. Dinos tu fecha de reporte y planeamos la semana de construcción alrededor de ella. Hablamos español.',
        ctaLabel: 'Ver la página de Fort Cavazos',
      },
    ],
    localSource: {
      label: 'Historia de Harker Heights (Handbook of Texas)',
    },
  },

  killeen: {
    county: 'Condado de Bell',
    metaTitle: 'Cocheras metálicas en Killeen, TX | Fort Cavazos',
    metaDescription:
      'Cocheras, cubiertas para RV y garajes soldados o atornillados en Killeen, construidos en la misma semana según los tiempos de PCS de Fort Cavazos. Concreto disponible. Hablamos español.',
    heroHeadline: 'Construido en Killeen. Hecho para Fort Cavazos.',
    heroCopy:
      'Triple J Metal construye cocheras, garajes y cubiertas para RV soldados o atornillados en Killeen. Nuestro equipo con base en Temple puede incluir la preparación del terreno y una losa de concreto, con precio aparte, en el mismo contrato. Cuéntanos tu proyecto y cuándo lo quieres, y te damos una cotización.',
    areaContext:
      'Atendemos todo Killeen, incluidas las zonas cerca de Fort Cavazos, Killeen-Fort Hood Regional Airport, Rosewood Heights, Westcliff y el corredor de la US-190 hacia Copperas Cove. Las propiedades rurales son bienvenidas.',
    whyLocal:
      'Trabaja directamente con nuestro equipo con base en Temple en tu proyecto de Killeen. Ofrecemos viga roja soldada o atornillada, comunicación en inglés y español, y concreto disponible en el mismo contrato.',
    services: [
      'Cocheras de viga roja soldadas o atornilladas',
      'Cocheras metálicas atornilladas',
      'Cocheras llave en mano con losa de concreto',
      'Garajes metálicos',
      'Cubiertas para RV y lanchas',
      'Graneros metálicos',
      'Patios lean-to',
      'Ampliaciones de casa',
    ],
    military: {
      headline: 'Los tiempos de Fort Cavazos, desde el principio',
      copy: 'Fort Cavazos trae un flujo constante de cambios de PCS por Killeen. Las familias militares llegan con poco aviso y necesitan proteger sus vehículos rápido. Triple J Metal construye cubiertas para RV y cocheras en la misma semana y aplica un descuento de 7% para militares y primeros respondientes de Fort Cavazos. Conocemos el vocabulario: BAH, préstamos VA, tiempos de PCS y reglas de HOA cerca de la base.',
      keywords: ['cocheras llave en mano Killeen', 'cocheras Fort Cavazos', 'cochera militar Killeen TX'],
    },
    heroImageAlt: 'Entrada principal de Fort Cavazos cerca de Killeen, Texas',
    customHeadline: {
      line1: 'Construido en Killeen.',
      line2: 'Hecho para Fort Cavazos.',
    },
    heroSubhead:
      'Las órdenes de PCS no esperan, y nosotros tampoco. Cocheras soldadas, cubiertas para RV y garajes construidos en la misma semana en todo Killeen — desde familias que llegan hasta veteranos que se retiran.',
    distanceFromTemple: '25 mi al suroeste · 30 min de la sede',
    localIntro:
      'Killeen gira en torno a Fort Cavazos. Llega la temporada de PCS, llega la temporada de granizo, y las familias militares necesitan sus vehículos y su equipo bajo techo antes de que llegue la mudanza. Triple J Metal está a 25 minutos por la carretera, en Temple — un equipo local de verdad, con cocheras de viga roja soldada, cubiertas para RV y garajes construidos en la misma semana. Aplicamos un descuento de 7% para militares y primeros respondientes de Fort Cavazos en cada instalación. Hablamos español.',
    landmarks: [
      {
        name: 'Bella Charca y Heritage Oaks',
        blurb:
          'Killeen no es solo la puerta trasera de Cavazos. Bella Charca y Heritage Oaks son las subdivisiones con estándares de HOA (asociación de propietarios) donde vive el mercado residencial de gama alta — paneles de sujetadores ocultos, molduras a juego con el color, construcciones que se ven residenciales, no utilitarias. Ya hemos pasado por comités de revisión arquitectónica ahí.',
        imageAlt: 'Subdivisión Bella Charca en Killeen, Texas — desarrollo residencial con estándares de HOA',
      },
      {
        name: 'Stillhouse Hollow Lake',
        blurb:
          'La zona de lago y marina del sur de Killeen. Los RV, las lanchas y los remolques merecen estar bajo techo antes de la temporada de granizo — construimos cubiertas extra altas en la misma semana.',
      },
    ],
    neighborhoods: ['Cedar Ridge', 'Heritage Park', 'Westcliff', 'Rosewood Heights', 'Todo Killeen'],
    whyLocalBullets: [
      'A 25 minutos de la sede en Temple — un equipo local de verdad, no un kit nacional enviado desde otro estado',
      'Viga roja soldada O atornillada — tú eliges, pensando en el viento de Texas, el granizo y los tiempos de Fort Cavazos',
      'Concreto colado y diseñado para los suelos de arcilla expansiva del condado de Bell — en el mismo contrato',
      'Programación en la misma semana — pensada para las llegadas de PCS y la urgencia de la temporada de granizo',
    ],
    callouts: [
      {
        eyebrow: 'PCS en Fort Cavazos',
        headline: 'Instalaciones en la misma semana, al ritmo de tu PCS.',
        blurb:
          'Militares en servicio activo, retirados, de la Reserva y la Guardia, y primeros respondientes reciben 7% de descuento en cada instalación — soldada, atornillada o llave en mano. Los calendarios de PCS, las fechas de despliegue y los periodos de TDY entran en el plan de la semana de construcción. Hablamos español.',
        ctaLabel: 'Ver la página de Fort Cavazos',
      },
      {
        eyebrow: 'De PCS a la tecnología',
        headline: 'Retirados de Cavazos que se mudan a Round Rock.',
        blurb:
          'La mitad de los retirados de Killeen con los que trabajamos terminan en segundos empleos en Dell, Apple o Tesla en Round Rock — y necesitan una cochera en la casa nueva antes de mudarse. Construimos en los dos extremos del tramo I-14/I-35 con el mismo equipo. Lo mismo aplica para los jubilados de Sun City, en Georgetown, que salen de Cavazos con su pensión.',
        ctaLabel: 'Ver construcciones en Round Rock',
      },
    ],
  },

  'copperas-cove': {
    heroImageAlt: 'Estructura de viga roja en una obra de Triple J Metal en el centro de Texas',
    county: 'Condado de Coryell',
    metaTitle: 'Cocheras metálicas en Copperas Cove, TX',
    metaDescription:
      'Cocheras, garajes y cubiertas para RV soldados o atornillados en Copperas Cove, TX. Equipo con base en Temple, concreto disponible, descuento militar de 7% para Fort Cavazos.',
    heroHeadline: 'Cocheras y edificios metálicos en Copperas Cove, TX',
    heroCopy:
      'Planea una cochera, un garaje, una cubierta para RV o un granero con nuestro equipo con base en Temple. Dinos tus medidas y cuándo lo necesitas; confirmamos el diseño, el alcance y el calendario para tu propiedad.',
    areaContext:
      'Copperas Cove nació en la década de 1870 como una comunidad ganadera y agrícola, y debe su nombre a un manantial cercano de sabor mineral. El ferrocarril, a finales de la década de 1880, y Camp Hood, en 1942, la convirtieron en la ciudad más grande del condado de Coryell. Recibimos solicitudes de proyectos de estacionamiento techado, garajes, almacenamiento para RV y construcciones de rancho en Cove y sus alrededores.',
    whyLocal:
      'Trabaja directamente con nuestro equipo con base en Temple en tu proyecto de Copperas Cove: viga roja soldada o atornillada, comunicación en inglés y español, y concreto disponible en el mismo contrato.',
    services: [
      'Cocheras soldadas o atornilladas',
      'Garajes metálicos',
      'Cubiertas para RV y lanchas',
      'Graneros y cubiertas para equipo',
      'Cercas y portones metálicos',
      'Preparación del terreno y concreto cotizado aparte',
    ],
    customHeadline: {
      line1: 'Hecho para Copperas Cove.',
      line2: 'Acero para las casas y los terrenos del condado de Coryell.',
    },
    heroSubhead:
      'Planea una cochera, un garaje, una cubierta para RV o un granero con nuestro equipo con base en Temple. Dinos tus medidas y cuándo lo necesitas; confirmamos el diseño, el alcance y el calendario para tu propiedad.',
    localIntro:
      'Copperas Cove nació en la década de 1870 como una comunidad ganadera y agrícola, y debe su nombre a un manantial cercano de sabor mineral. El ferrocarril, a finales de la década de 1880, y Camp Hood, en 1942, la convirtieron en la ciudad más grande del condado de Coryell. Recibimos solicitudes de proyectos de estacionamiento techado, garajes, almacenamiento para RV y construcciones de rancho en Cove y sus alrededores.',
    landmarks: [
      {
        name: 'Un manantial, un ferrocarril y Camp Hood',
        blurb:
          'La ciudad de Copperas Cove debe su nombre a un manantial de sabor mineral, y su crecimiento al ferrocarril y a Camp Hood. El acceso, la pendiente y el drenaje de tu propiedad se revisan caso por caso.',
      },
    ],
    whyLocalBullets: [
      'Trae las dimensiones aproximadas de vehículos, RV, equipo y bahías de almacenamiento.',
      'En lotes rurales, incluye las aberturas de los portones y la ruta que usarán los camiones para llegar al sitio.',
      'Las condiciones del terreno y el drenaje guían la conversación sobre la cimentación; el concreto está disponible en el mismo contrato.',
      'Nuestro equipo con base en Temple puede hablar del proyecto en inglés o en español.',
    ],
    callouts: [
      {
        eyebrow: 'PCS en Fort Cavazos',
        headline: '7% de descuento militar + programación en la misma semana.',
        blurb:
          'Militares en servicio activo, retirados, de la Reserva y la Guardia, y primeros respondientes reciben 7% de descuento en cada instalación — soldada, atornillada o llave en mano. Dinos tu fecha de reporte y planeamos la semana de construcción alrededor de ella. Hablamos español.',
        ctaLabel: 'Ver la página de Fort Cavazos',
      },
      {
        eyebrow: 'Al oeste de Cove',
        headline: 'Kempner y Lampasas, el mismo equipo.',
        blurb:
          'También recibimos proyectos al oeste por la US-190, hacia Kempner y Lampasas. Dinos dónde estás y qué necesita hacer la construcción, y confirmamos el alcance y el calendario.',
        ctaLabel: 'Ver Lampasas',
      },
    ],
    localSource: {
      label: 'Acerca de Copperas Cove (City of Copperas Cove)',
    },
  },

  temple: {
    county: 'Condado de Bell',
    metaTitle: 'Cocheras y edificios metálicos en Temple, TX',
    metaDescription:
      'Nuestro taller está en Temple, TX. Cocheras, garajes y cubiertas para RV soldados o atornillados, en la misma semana en Western Hills, Lake Belton y todo Temple.',
    heroHeadline: 'Construido en Temple. Construido donde vivimos.',
    heroCopy:
      'El taller de Triple J está en Tem-Bel Ln, en Temple. Para nosotros esto no es una zona de servicio — es nuestra casa. Cocheras y garajes soldados o atornillados, y cubiertas para RV junto al lago, construidos en la misma semana en la ciudad donde vivimos.',
    areaContext:
      'Estamos aquí mismo, en Temple, y atendemos todas las zonas alrededor, incluidas North Temple, South Temple sobre la I-35, East Temple cerca de la FM 93 y propiedades rurales del condado de Bell. También atendemos las cercanas Nolanville, Rogers, Belton y Troy.',
    whyLocal:
      'No somos una cadena. Triple J Metal fue fundada por una familia de Temple y opera desde Temple. Compramos el acero con proveedores regionales de Texas — acero de Texas de verdad, constructores de Texas de verdad, con varias fuentes para que la falta de un solo proveedor nunca retrase tu obra. Cuando otras empresas mandan un kit, nosotros mandamos un equipo.',
    services: [
      'Cocheras de viga roja soldadas o atornilladas',
      'Cocheras metálicas atornilladas',
      'Cocheras llave en mano con losa de concreto',
      'Garajes metálicos',
      'Cubiertas para RV y lanchas',
      'Graneros metálicos',
      'Estructuras que cumplen con HOA',
      'Estructuras para rancho',
      'Patios lean-to',
      'Ampliaciones de casa',
    ],
    heroImageAlt: 'Vista aérea de Temple, Texas — la sede de Triple J Metal',
    customHeadline: {
      line1: 'Construido en Temple.',
      line2: 'Construido donde vivimos.',
    },
    heroSubhead:
      'El taller de Triple J está en Tem-Bel Ln, en Temple. Para nosotros esto no es una zona de servicio — es nuestra casa. Cocheras y garajes soldados o atornillados y cubiertas para RV junto al lago, construidos en la misma semana en la ciudad donde vivimos.',
    distanceFromTemple: '0 mi · donde vivimos',
    localIntro:
      'Nuestro taller está en Tem-Bel Ln y nuestro equipo vive por toda la ciudad. Temple es un pueblo de ferrocarril, y nosotros soldamos como tal. Desde las propiedades a la orilla de Lake Belton hasta el corredor residencial de Western Hills, construimos en la misma semana en la ciudad que llamamos hogar.',
    landmarks: [
      {
        name: 'Lake Belton',
        blurb:
          'El centro de fin de semana de Temple. Las propiedades junto al lago necesitan cubiertas para RV, cubiertas para lanchas y graneros de orilla hechos para el viento que pega en el lago — construimos en la misma semana, antes de la temporada de tormentas.',
        imageAlt: 'Orilla de Lake Belton cerca de Temple, Texas',
      },
      {
        name: 'El centro y la estación de Santa Fe',
        blurb:
          'La estación de Santa Fe, de 1910, es el ancla del centro y de la herencia ferroviaria de la ciudad. Hecha para durar más de un siglo — el mismo estándar que le exigimos a nuestra estructura de viga roja soldada.',
        imageAlt: 'El centro de Temple, Texas — el histórico distrito ferroviario de Santa Fe',
      },
      {
        name: 'Baylor Scott & White',
        blurb:
          'El empleador más grande de Temple atrae a familias de profesionales a Western Hills, Heritage Acres y los desarrollos junto al lago — el mercado residencial que mejor conocemos.',
        imageAlt: 'Baylor Scott & White Medical Center en Temple, Texas',
      },
    ],
    neighborhoods: [
      'Western Hills',
      'Heritage Acres',
      'Lake Belton / Lakeside',
      'North Temple',
      'South Temple, sobre la I-35',
      'East Temple, cerca de la FM 93',
      'Zona rural del condado de Bell',
    ],
    whyLocalBullets: [
      'Nuestro taller, nuestro patio, nuestro equipo — todo en Tem-Bel Ln, en Temple. Sin viajes desde otro estado, sin kit en una caja.',
      'Viga roja soldada O atornillada — tú eliges, pensando en el viento de Texas, el granizo y las ráfagas de la orilla de Lake Belton.',
      'Concreto colado y diseñado para los suelos de arcilla expansiva del condado de Bell — en el mismo contrato.',
      'Programación en la misma semana — la mayoría de las llamadas se vuelven una obra antes del fin de semana.',
    ],
    callouts: [
      {
        eyebrow: 'Residencial de gama alta',
        headline: 'Hecho para los vecindarios con estándares de HOA de Temple.',
        blurb:
          'Techo standing seam con sujetadores ocultos, revestimiento Board & Batten a juego con el color de tu casa — para las subdivisiones de Western Hills, Heritage Acres y Lake Belton donde las normas arquitectónicas son estrictas y las construcciones tienen que verse residenciales, no utilitarias.',
        ctaLabel: 'Ver construcciones que cumplen con HOA',
      },
      {
        eyebrow: 'Rumbo al norte',
        headline: '35 millas por la I-35 hasta el condado de McLennan.',
        blurb:
          'Waco, Hewitt, Woodway, Robinson y China Spring son nuestros viajes más cercanos entre condados — y es donde viven en realidad nuestros proveedores regionales de acero de Texas. El mismo equipo, la misma semana, el mismo concreto llave en mano. El condado de Williamson, al sur (Georgetown, Round Rock), también es un viaje de rutina.',
        ctaLabel: 'Ver construcciones en Waco',
      },
    ],
    heroEyebrow: 'Zona de servicio · Nuestra sede',
    facts: [
      { k: 'Desde la sede', v: '0 mi', s: 'Donde vivimos' },
      { k: 'Condado', v: 'Condado de Bell', s: 'Nuestro condado' },
      { k: 'Taller', v: '3319 Tem-Bel Ln', s: 'Temple, TX 76502' },
      { k: 'Idioma', v: 'Español e inglés', s: 'Hablamos español — cotizaciones, visitas al sitio y la obra' },
    ],
    introEyebrow: 'Donde vivimos',
    introHeading: 'No es una zona de servicio. Es nuestra casa.',
    areaNote: 'También atendemos las cercanas Nolanville, Rogers, Belton y Troy.',
    landHeading: 'Temple, como la conocemos.',
    whyHeading: 'Cuando otras empresas mandan un kit, nosotros mandamos un equipo.',
    why: [
      {
        t: 'El taller está aquí cerca',
        b: 'Nuestro taller, nuestro patio, nuestro equipo — todo en Tem-Bel Ln, en Temple. Sin viajes desde otro estado, sin kit en una caja.',
      },
      {
        t: 'Soldado o atornillado',
        b: 'Viga roja soldada o atornillada — tú eliges, pensando en el viento de Texas, el granizo y las ráfagas de la orilla de Lake Belton.',
      },
      {
        t: 'No somos una cadena',
        b: 'Fundada por una familia de Temple y operada desde Temple. Acero de Texas de varias fuentes, para que si un proveedor se queda corto nunca se retrase tu obra.',
      },
    ],
    quoteCallout: {
      eyebrow: 'Construcciones con HOA',
      headline: 'Hecho para los vecindarios con estándares de HOA de Temple.',
      blurb:
        'Techo standing seam con sujetadores ocultos, revestimiento Board & Batten a juego con el color de tu casa — para las subdivisiones de Western Hills, Heritage Acres y Lake Belton donde las construcciones tienen que verse residenciales, no utilitarias.',
      ctaLabel: 'Pregunta por las especificaciones de HOA',
    },
  },

  belton: {
    county: 'Condado de Bell',
    metaTitle: 'Cocheras y edificios metálicos en Belton, TX',
    metaDescription:
      'El equipo de edificios metálicos de Belton, a 15 min de nuestro taller en Temple. Cocheras soldadas o atornilladas, graneros de rancho y cubiertas para RV junto al lago. Hablamos español.',
    heroHeadline: 'Construido en Belton. El equipo local del condado de Bell.',
    heroCopy:
      'En Belton está el juzgado del condado, y conocemos a todos en la oficina de permisos. El juzgado de 1885 sigue en pie. Nosotros construimos con esa misma intención. Cocheras soldadas o atornilladas, graneros de rancho y cubiertas para RV junto al lago — en la misma semana en todo el condado de Bell, a 15 minutos de nuestro taller en Temple.',
    areaContext:
      'Atendemos todo Belton y la zona de Lake Belton, incluidas las comunidades a lo largo de la US-190, la FM 2271 y los ranchos rurales del condado de Bell. También estamos cerca de Salado y Jarrell para clientes en el extremo sur del condado de Bell.',
    whyLocal:
      'The Carport Co. y Dayton Barns tienen páginas para Belton, pero son empresas nacionales sin equipo local. Triple J Metal está a 10 minutos del centro de Belton. Programamos más rápido, tenemos concreto disponible y nuestro equipo de verdad conoce tu vecindario.',
    services: [
      'Cocheras de viga roja soldadas o atornilladas',
      'Cocheras metálicas atornilladas',
      'Cocheras llave en mano con losa de concreto',
      'Garajes metálicos',
      'Cubiertas para RV y lanchas',
      'Graneros metálicos',
      'Estructuras para rancho',
      'Patios lean-to',
      'Ampliaciones de casa',
    ],
    heroImageAlt: 'El centro de Belton, Texas — sede del condado de Bell',
    customHeadline: {
      line1: 'Construido en Belton.',
      line2: 'El equipo local del condado de Bell.',
    },
    heroSubhead:
      'En Belton está el juzgado del condado, y el juzgado de 1885 sigue en pie. Construimos con esa misma intención. Cocheras soldadas o atornilladas, graneros de rancho y cubiertas para RV junto al lago — en la misma semana en el condado de Bell, a 15 minutos de nuestro taller en Temple.',
    distanceFromTemple: '10 mi al sur · 15 min',
    localIntro:
      'Desde las casas de lago de Lakeshore Drive hasta los ranchos de Pendleton, construimos en la misma semana en todo Belton. La ciudad del condado de Bell más cercana a nuestro taller en Temple, el juzgado donde se obtienen los permisos y el campo ranchero que se abre más allá del límite de la ciudad.',
    landmarks: [
      {
        name: '1885 Bell County Courthouse',
        blurb:
          'El juzgado sigue en pie en el centro, y ahí se obtienen los permisos del condado de Bell. Nosotros construimos con esa misma intención.',
        imageAlt: 'El Bell County Courthouse de 1885 en el centro de Belton, Texas',
      },
      {
        name: 'Lake Belton & BLORA',
        blurb:
          'La zona de lago de Belton corre por el borde oeste — propiedades de Lakeshore Drive, graneros de fin de semana, cubiertas para RV y lanchas. Estructuras junto al lago que llevamos años construyendo.',
        imageAlt: 'Orilla de Lake Belton en Belton, Texas',
      },
    ],
    neighborhoods: [
      'Centro de Belton',
      'North Belton',
      'Lakeshore Drive',
      'Lake Belton & BLORA',
      'Corredor de la US-190',
      'FM 2271',
      'Pendleton',
      'Zona rural del condado de Bell',
    ],
    whyLocalBullets: [
      'Podemos hablar de los requisitos del permiso; confirmamos las responsabilidades de presentación y aprobación antes de empezar la obra.',
      'A 15 min de nuestro taller en Temple — la instalación más rápida del condado de Bell, sin la demora de despacho de un distribuidor nacional.',
      'Concreto colado y diseñado para los suelos de arcilla expansiva del condado de Bell — mismo contrato.',
      'Viga roja soldada O atornillada — tú eliges, pensando en el viento de Texas, el granizo y el largo plazo.',
    ],
    callouts: [
      {
        eyebrow: 'Orientación sobre permisos',
        headline: 'Te orientamos con los permisos del condado de Bell.',
        blurb:
          'Conocemos el proceso y los tiempos, y te explicamos paso a paso lo que pide la oficina del condado para que no te pierdas en 4 semanas de ir y venir.',
        ctaLabel: 'Habla con nosotros sobre tu permiso',
      },
      {
        eyebrow: 'Rancho y agricultura',
        headline: 'Hecho para el campo ranchero del condado de Bell.',
        blurb:
          'Graneros de viga roja soldada, cobertizos para equipo y lean-tos diseñados para Pendleton, Sparta y las propiedades rurales del condado de Bell más allá del límite de la ciudad — donde el suelo es más duro y las estructuras tienen que durar más que el ganado.',
        ctaLabel: 'Ver graneros de rancho construidos',
      },
      {
        eyebrow: 'Al sur, hacia el condado de Williamson',
        headline: 'Georgetown, Round Rock y el corredor de los lagos.',
        blurb:
          'La zona de lagos de Belton desemboca en el mismo corredor de crecimiento que atrae compradores hacia Sun City, en Georgetown, y hacia las subdivisiones con estándares de HOA de Round Rock. Hacemos el viaje desde nuestro taller en Temple con el mismo equipo, la misma viga roja soldada y el mismo concreto llave en mano.',
        ctaLabel: 'Ver construcciones en Georgetown',
      },
    ],
    heroEyebrow: 'Zona de servicio · Sede del condado de Bell',
    facts: [
      { k: 'Desde la sede', v: '10 mi al sur', s: 'A 15 min de nuestro taller en Temple' },
      { k: 'Condado', v: 'Sede del condado de Bell', s: 'Donde se obtienen los permisos' },
      { k: 'Cobertura', v: 'US-190 · FM 2271', s: 'De Lake Belton al campo ranchero' },
      { k: 'Idioma', v: 'Español e inglés', s: 'Hablamos español — cotizaciones, visitas al sitio y la obra' },
    ],
    introEyebrow: 'Dónde construimos',
    introHeading: 'De casas de lago a tierras de rancho.',
    areaNote: 'También estamos cerca de Salado y Jarrell para clientes en el extremo sur del condado de Bell.',
    landHeading: 'Belton, como la conocemos.',
    whyHeading: 'No somos un distribuidor. Somos un equipo a 15 minutos.',
    why: [
      {
        t: 'La instalación más rápida del condado de Bell',
        b: 'A 15 minutos de nuestro taller en Temple — sin la demora de despacho de un distribuidor nacional.',
      },
      {
        t: 'Un equipo local de verdad',
        b: 'Las empresas nacionales tienen páginas de Belton pero no equipo local. Nosotros programamos más rápido, tenemos concreto disponible y conocemos tu vecindario de verdad.',
      },
      {
        t: 'Soldado o atornillado',
        b: 'Viga roja para el viento de Texas, el granizo y las ráfagas de la orilla de Lake Belton — tú eliges, construido por nuestro propio equipo.',
      },
    ],
    quoteCallout: {
      eyebrow: 'Orientación sobre permisos',
      headline: 'Conocemos el juzgado.',
      blurb:
        'Hablamos de los requisitos de permiso de tu propiedad en Belton antes de programar cualquier cosa. Las responsabilidades de presentación y aprobación quedan confirmadas en tu alcance por escrito — sin sorpresas cuando llegue el equipo.',
      ctaLabel: 'Pregunta por los permisos',
    },
  },

  salado: {
    heroImageAlt: 'Proyecto de estructura de acero de Triple J Metal en el centro de Texas',
    county: 'Condado de Bell',
    metaTitle: 'Edificios metálicos y cercas en Salado, TX',
    metaDescription:
      'Cocheras, garajes, graneros y cercas metálicas soldados o atornillados en Salado, TX. Triple J Metal, con base en Temple. Concreto disponible; pide una cotización de tu proyecto.',
    heroHeadline: 'Edificios metálicos y cercas en Salado, TX',
    heroCopy:
      'Planea una cochera, un garaje, un granero o una cerca metálica con nuestro equipo con base en Temple. Dinos tus medidas y tus prioridades; confirmamos el diseño, el alcance y la programación para tu propiedad.',
    areaContext:
      'Salado Creek y el centro del pueblo le dan a Salado un ambiente distinto. Una cochera, un garaje o una cerca nueva debe ir de acuerdo con la casa que ya tienes y con la forma en que usas la propiedad. Empieza con el espacio disponible, el acceso y el acabado que quieres; después podemos hablar de una estructura soldada o atornillada y de cualquier trabajo de concreto como un solo alcance cotizado.',
    whyLocal:
      'Nuestro equipo con base en Temple atiende Salado. Trabaja directamente con el equipo en el diseño, la preparación del terreno, la instalación y el alcance del proyecto por escrito.',
    services: [
      'Cocheras soldadas o atornilladas',
      'Garajes metálicos',
      'Graneros y cubiertas para equipo',
      'Cubiertas para RV y lanchas',
      'Cercas y portones metálicos',
      'Preparación del terreno y concreto cotizado aparte',
    ],
    customHeadline: {
      line1: 'Hecho para Salado.',
      line2: 'Hecho para tu propiedad en Salado.',
    },
    heroSubhead:
      'Planea una cochera, un garaje, un granero o una cerca metálica con nuestro equipo con base en Temple. Dinos tus medidas y tus prioridades; confirmamos el diseño, el alcance y la programación para tu propiedad.',
    localIntro:
      'Salado Creek y el centro del pueblo le dan a Salado un ambiente distinto. Una cochera, un garaje o una cerca nueva debe ir de acuerdo con la casa que ya tienes y con la forma en que usas la propiedad. Empieza con el espacio disponible, el acceso y el acabado que quieres; después podemos hablar de una estructura soldada o atornillada y de cualquier trabajo de concreto como un solo alcance cotizado.',
    landmarks: [
      {
        name: 'Salado Creek',
        blurb:
          'Salado Creek es una parte esencial del pueblo. Para tu propiedad, habla del drenaje y de la ubicación propuesta de la construcción o la cerca desde el inicio de la planeación.',
      },
    ],
    whyLocalBullets: [
      'Elige los colores y los perfiles de panel junto con la casa existente, no como algo de último momento.',
      'Incluye un croquis del estacionamiento, el acceso de los portones y las áreas que quieres dejar abiertas.',
      'Revisa las necesidades de drenaje y cimentación del sitio real antes de definir la distribución.',
      'El concreto y la cerca se definen por separado en la cotización para que el alcance completo quede claro.',
    ],
    callouts: [
      {
        eyebrow: 'Acabado y distribución',
        headline: 'Junta la casa y la cerca en un mismo plan.',
        blurb:
          'Comparte los colores exteriores, las líneas del techo y cualquier lineamiento arquitectónico antes de elegir paneles o materiales de cerca. Podemos hablar de cercas de privacidad, cercas ornamentales y aberturas de portones junto con una cochera o un garaje.',
        ctaLabel: 'Conoce las cercas y portones metálicos',
      },
    ],
    localSource: {
      label: 'Referencia local de Salado',
    },
  },

  waco: {
    county: 'Condado de McLennan',
    metaTitle: 'Cocheras y edificios metálicos en Waco, TX',
    metaDescription:
      'Cocheras metálicas soldadas o atornilladas en Waco, TX. Concreto disponible, instalación en la misma semana y graneros de rancho para Hewitt, Woodway, Robinson y China Spring.',
    heroHeadline: 'Hecho para Waco. El equipo soldador del condado de McLennan.',
    heroCopy:
      'Waco es nuestro condado vecino más cercano — a 35 millas por la I-35 — y la casa de los proveedores regionales de acero de Texas con los que trabaja nuestro taller. Triple J lleva una cuadrilla completa de soldadores y cuela la losa de concreto en el mismo contrato, para trabajos residenciales y agrícolas por igual en Waco, Hewitt, Woodway, Robinson y China Spring.',
    areaContext:
      'Atendemos todo Waco y el corredor circundante del condado de McLennan — Hewitt, Woodway, Robinson, China Spring, los productores agrícolas rurales entre Riesel y Crawford, y la orilla de Lake Waco. Las estructuras residenciales con influencia de Magnolia y las estructuras agrícolas para rancho son nuestro trabajo de todos los días en este mercado.',
    whyLocal:
      'El condado de McLennan es el condado más cercano a nuestro taller en Temple, y nuestras relaciones con proveedores tienen sus raíces aquí mismo, en Waco. Las empresas nacionales que envían kits tienen páginas de Waco pero no equipo local. Triple J hace el viaje de 35 minutos con nuestro propio equipo, nuestro propio acero y concreto llave en mano en un solo contrato.',
    services: [
      'Cocheras de viga roja soldadas o atornilladas',
      'Cocheras metálicas atornilladas',
      'Cocheras llave en mano con losa de concreto',
      'Garajes metálicos',
      'Cubiertas para RV y lanchas',
      'Graneros metálicos',
      'Estructuras para rancho',
      'Cubiertas para equipo',
      'Estructuras que cumplen con HOA',
      'Patios lean-to',
      'Ampliaciones de casa',
    ],
    heroImageAlt: 'Magnolia Silos en el centro de Waco, Texas',
    customHeadline: {
      line1: 'Hecho para Waco.',
      line2: 'El equipo soldador del condado de McLennan.',
    },
    heroSubhead:
      'A 35 minutos al norte de la sede — nuestro condado vecino más cercano y donde de verdad viven nuestras relaciones con proveedores. Viga roja soldada o atornillada, concreto llave en mano, en la misma semana en Waco, Hewitt, Woodway, Robinson y China Spring. Hablamos español.',
    distanceFromTemple: '35 mi al norte · 40 min de la sede',
    localIntro:
      'Waco es nuestro condado vecino más cercano — a 35 millas por la I-35 y la casa de los proveedores regionales de acero de Texas con los que trabaja nuestro taller. El condado de McLennan se divide entre productores agrícolas rurales que necesitan graneros para heno y cubiertas para equipo, y zonas residenciales con influencia de Magnolia donde la construcción tiene que verse como corresponde. Llevamos una cuadrilla soldadora de verdad y el concreto en el mismo contrato para ambos. Hablamos español.',
    landmarks: [
      {
        name: 'Magnolia Market & Silos',
        blurb:
          'Los silos de Chip y Joanna cambiaron cómo se ve el diseño residencial en el centro de Texas. Revestimiento Board & Batten, contraste de molduras negras, pendiente estilo farmhouse — la estética de Waco para la que están afinadas nuestras cocheras que cumplen con HOA.',
        imageAlt: 'Magnolia Market & Silos en el centro de Waco, Texas',
      },
      {
        name: 'Lake Waco',
        blurb:
          'Más de 60 millas de orilla y el centro de fin de semana del oeste de McLennan. Las cubiertas para RV y lanchas junto al lago y los graneros de orilla son trabajo de rutina — diseñamos para la exposición al viento que trae un frente abierto al lago.',
        imageAlt: 'Orilla de Lake Waco en el condado de McLennan, Texas',
      },
      {
        name: 'Baylor University',
        blurb:
          'Baylor atrae a familias de profesionales a Woodway y Hewitt, y a un mercado constante de rentas para estudiantes más cerca del campus. Los vecindarios alrededor del campus son variados — con frecuencia surgen tanto estructuras secundarias que cumplen con HOA como cocheras para propiedades de renta.',
        imageAlt: 'Campus de Baylor University en Waco, Texas',
      },
    ],
    neighborhoods: ['Waco (ciudad)', 'Hewitt', 'Woodway', 'Robinson', 'China Spring'],
    whyLocalBullets: [
      'A 35 millas por la I-35 — el condado de McLennan es el más cercano a nuestro taller en Temple, y nuestras relaciones con proveedores tienen sus raíces aquí mismo, en Waco.',
      'Trabajo de rancho y agrícola para el McLennan rural — graneros para heno, cubiertas para equipo y cobertizos de refugio para animales para los productores entre Hewitt, China Spring, Robinson y Crawford.',
      'Residencial con influencia de Magnolia — Board & Batten, paneles a juego con el color y la pendiente farmhouse que el mercado de Waco realmente quiere.',
      'Equipo de instalación bilingüe — llevamos la obra en español o en inglés para la fuerte base de propietarios hispanos de Waco.',
    ],
    callouts: [
      {
        eyebrow: 'Rancho y agricultura',
        headline: 'Hecho para el terreno de trabajo del condado de McLennan.',
        blurb:
          'Graneros de viga roja soldada para heno, cubiertas para equipo y lean-tos para los productores rurales entre Hewitt, China Spring, Robinson y Crawford. Dimensionados para tractores e implementos, no para cocheras residenciales — y hechos para durar más que el ganado.',
        ctaLabel: 'Ver graneros de rancho construidos',
      },
      {
        eyebrow: 'Residencial con estética Magnolia',
        headline: 'Board & Batten, a juego con el color, hecho como lo quiere Waco.',
        blurb:
          'Standing seam con sujetadores ocultos, revestimiento Board & Batten, contraste de molduras negras, pendiente farmhouse. El estilo Magnolia cambió cómo se ve el metal residencial en Waco — y construimos con ese estándar tanto para solicitudes de HOA como para pedidos directos de propietarios.',
        ctaLabel: 'Ver construcciones que cumplen con HOA',
      },
    ],
  },

  georgetown: {
    county: 'Condado de Williamson',
    metaTitle: 'Cocheras y edificios metálicos, Georgetown TX',
    metaDescription:
      'Cocheras, garajes y cubiertas para RV soldados o atornillados en Georgetown, TX. Equipo con base en Temple; concreto disponible en el mismo contrato. Pide una cotización.',
    heroHeadline: 'Edificios metálicos en Georgetown, TX',
    heroCopy:
      'Triple J Metal atiende Georgetown con cocheras, garajes y cubiertas para RV soldados o atornillados. Trabaja directamente con nuestro equipo con base en Temple para planear el diseño, las necesidades de concreto y el calendario de instalación.',
    areaContext:
      'Atendemos todo Georgetown y el corredor circundante del condado de Williamson — Sun City, Berry Creek, Georgetown Lake, el campo ranchero de Liberty Hill al oeste, y el Old Town de Georgetown alrededor de Southwestern University. Las cubiertas para RV, los graneros de rancho y las estructuras residenciales que cumplen con HOA son nuestro trabajo de todos los días en este mercado.',
    whyLocal:
      'Ofrecemos una relación directa con el equipo que construye tu proyecto, con concreto disponible como parte del mismo contrato, con precio aparte.',
    services: [
      'Cocheras de viga roja soldadas o atornilladas',
      'Cocheras metálicas atornilladas',
      'Cocheras llave en mano con losa de concreto',
      'Garajes metálicos',
      'Cubiertas para RV y lanchas',
      'Estructuras que cumplen con HOA',
      'Graneros metálicos',
      'Estructuras para rancho',
      'Patios lean-to',
      'Ampliaciones de casa',
    ],
    heroImageAlt: 'Proyecto de patio lean-to de Triple J Metal en el centro de Texas',
    customHeadline: {
      line1: 'Hecho para Georgetown.',
      line2: 'Tu proyecto. Nuestro equipo local.',
    },
    heroSubhead:
      'Triple J Metal atiende Georgetown con cocheras, garajes y cubiertas para RV soldados o atornillados. Trabaja directamente con nuestro equipo con base en Temple para planear el diseño, las necesidades de concreto y el calendario de instalación.',
    localIntro:
      'Para una cochera, un garaje o una cubierta para RV en Georgetown, empieza con las medidas, el acceso y la apariencia que necesitas. Comparte los lineamientos de tu propiedad y el estado de la entrada o la losa existente para que el alcance cotizado se ajuste a tu sitio.',
    landmarks: [
      {
        name: 'San Gabriel River',
        blurb:
          'El río cruza el centro y corre por el borde norte de la ciudad — y las propiedades ribereñas cercanas necesitan cimentaciones que cuiden la erosión. Definimos la especificación del concreto y la profundidad del anclaje para la zona real de crecidas, no una especificación genérica.',
      },
      {
        name: 'Sun City',
        blurb:
          'La comunidad más grande de Texas para adultos activos de 55+ — más de 9,500 casas, y cada una con un RV, un carrito de golf o herramientas de taller que no deberían estar al sol. Las cubiertas para RV y las cocheras que cumplen con HOA son nuestro trabajo de todos los días en Sun City.',
      },
      {
        name: 'Southwestern University',
        blurb:
          'La universidad más antigua de Texas ancla el centro de Georgetown y atrae a familias de profesionales constantes a Berry Creek y al Old Town de Georgetown. Los vecindarios históricos alrededor del campus tienen HOA muy estrictas — igualamos el color de paneles y molduras para que encajen.',
      },
    ],
    neighborhoods: ['Sun City', 'Berry Creek', 'Georgetown Lake', 'Liberty Hill', 'Old Town Georgetown'],
    whyLocalBullets: [
      'Habla directamente con nuestro equipo sobre el calendario actual; las fechas dependen del alcance del proyecto y de que el sitio esté listo.',
      'Cubiertas para RV y cobertizos para carritos de golf en Sun City — espacio libre extra alto, estética con estándares de HOA, dimensionados para los vehículos que de verdad manejan los jubilados.',
      'Cimentaciones junto al San Gabriel River — especificación de concreto y profundidad de anclaje diseñadas para propiedades en zona de crecidas y niveles freáticos estacionales.',
      'Campo ranchero de Liberty Hill — graneros de viga roja soldada, cobertizos para equipo y lean-tos para la creciente base de propiedades rurales del condado de Williamson.',
    ],
    callouts: [
      {
        eyebrow: 'Especialistas en Sun City',
        headline: 'Cubiertas para RV + cobertizos para carritos de golf, aprobados por HOA.',
        blurb:
          'Los estándares arquitectónicos de Sun City especifican el color del panel, el tratamiento del alero y la pendiente del techo. Los hemos igualado en suficientes obras para saber qué combinaciones de panel y molduras pasan el ARC (comité de revisión arquitectónica) a la primera — sin rehacer nada, sin segundo intento.',
        ctaLabel: 'Ver cubiertas para RV',
      },
      {
        eyebrow: 'Rancho en Liberty Hill',
        headline: 'Graneros soldados para el campo ranchero de Williamson.',
        blurb:
          'Liberty Hill es el último gran tramo abierto del condado de Williamson — y los compradores que llegan quieren graneros para heno, cubiertas para equipo y cobertizos de refugio que no sean construcción de kit. Viga roja soldada, nuestro propio equipo, un solo contrato.',
        ctaLabel: 'Ver graneros de rancho',
      },
    ],
  },

  'round-rock': {
    county: 'Condado de Williamson',
    metaTitle: 'Cocheras y edificios metálicos, Round Rock TX',
    metaDescription:
      'Cocheras metálicas soldadas o atornilladas en Round Rock, TX. Concreto disponible, instalación en la misma semana, construcciones que cumplen con HOA para Brushy Creek y Teravista.',
    heroHeadline: 'Hecho para Round Rock. Soldado o atornillado, en la misma semana.',
    heroCopy:
      'Los propietarios de Round Rock tienen muchos distribuidores nacionales de cocheras para escoger — y ninguno llega con una cuadrilla. Triple J Metal maneja 60 millas al sur desde nuestro taller en Temple, suelda o atornilla tu estructura en el sitio y cuela la losa de concreto en el mismo contrato. Sin kits, sin subcontratistas, sin lista de espera de 6 semanas.',
    areaContext:
      'Atendemos todo Round Rock y el corredor de crecimiento del condado de Williamson — Brushy Creek, Forest Creek, Teravista, la línea con Cedar Park y la expansión de Pflugerville / SH-45. Las estructuras residenciales que cumplen con HOA y las cocheras comerciales con concreto llave en mano son nuestro trabajo de todos los días en este mercado.',
    whyLocal:
      'Round Rock está a 60 millas al sur de nuestro patio en Temple — un viaje que vale la pena para un contratista de servicio completo con acero soldado, acabados de panel con estándares de HOA y concreto llave en mano en un solo contrato. Las empresas nacionales que envían kits no pueden cumplir con los comités de revisión arquitectónica de Williamson. Triple J sí.',
    services: [
      'Cocheras de viga roja soldadas o atornilladas',
      'Cocheras metálicas atornilladas',
      'Cocheras llave en mano con losa de concreto',
      'Garajes metálicos',
      'Cubiertas para RV y lanchas',
      'Estructuras que cumplen con HOA',
      'Patios lean-to',
      'Ampliaciones de casa',
    ],
    heroImageAlt: 'Cochera metálica residencial con losa de concreto en Round Rock, Texas',
    customHeadline: {
      line1: 'Hecho para Round Rock.',
      line2: 'Soldado o atornillado, en la misma semana.',
    },
    heroSubhead:
      'La ciudad de más rápido crecimiento del condado de Williamson. Triple J maneja 60 millas al sur desde Temple con nuestros propios soldadores y cuadrilla de concreto — viga roja que cumple con HOA para Brushy Creek, Forest Creek, Teravista, Cedar Park y Pflugerville.',
    distanceFromTemple: '60 mi al sur · 1 hora de la sede',
    localIntro:
      'Round Rock se duplicó en una generación — Dell, Apple y Tesla atrajeron familias de tecnología de todo el país, y los retirados de Fort Cavazos llegan aquí con su PCS para segundas carreras. Las subdivisiones son estrictas con HOA, el suelo cambia entre caliche del Edwards Plateau y arcilla de Blackland Prairie, y la mayoría de las empresas nacionales que envían kits no cumplen con los estándares del comité de revisión arquitectónica. Nosotros sí. Viga roja soldada o atornillada, a juego con el color de tu casa, concreto colado para el suelo que tiene debajo. Hablamos español.',
    landmarks: [
      {
        name: 'Old Settlers Park',
        blurb:
          '645 acres de campos, canchas y áreas para eventos — la Capital Deportiva de Texas recibe torneos todo el año. Los vecindarios con estándares de HOA que la rodean (Forest Creek, Stone Canyon) son justo donde nuestras cocheras standing seam se ganan su lugar.',
      },
      {
        name: 'Dell Diamond',
        blurb:
          'El estadio del Round Rock Express — y una señal de la economía tecnológica impulsada por Dell que trajo a la mitad de estos propietarios al condado de Williamson. Los retirados de Fort Cavazos consiguen empleos en Dell aquí, y luego nos llaman por la cochera que sus órdenes de PCS nunca contemplaron.',
      },
      {
        name: 'Round Rock Premium Outlets',
        blurb:
          'El ancla del corredor comercial SH-45 / I-35. El radio de crecimiento alrededor de los outlets es donde llegan la mayoría de los vecindarios nuevos de Round Rock — Forest Creek, Teravista, la línea con Cedar Park — y donde se especifican estructuras secundarias que cumplen con HOA.',
      },
    ],
    neighborhoods: ['Brushy Creek', 'Forest Creek', 'Teravista', 'Cedar Park', 'Pflugerville'],
    whyLocalBullets: [
      'Viga roja que cumple con HOA — standing seam con sujetadores ocultos, revestimiento a juego con el color, construcciones que se ven residenciales para los comités de revisión arquitectónica de Brushy Creek, Forest Creek y Teravista.',
      'Caliche del Edwards Plateau o arcilla de Blackland Prairie — diseñamos la especificación del concreto y la profundidad del anclaje para el suelo que de verdad tienes debajo de la losa, no para un promedio nacional.',
      'Equipo de instalación bilingüe — llevamos la obra en español o en inglés para el creciente mercado de propietarios hispanos de Round Rock.',
      'Programación en la misma semana para los retirados de Fort Cavazos con PCS que toman empleos en Dell, Apple y Tesla — vehículos bajo techo antes de que el camión de mudanza termine de descargar.',
    ],
    callouts: [
      {
        eyebrow: 'Residencial con estándares de HOA',
        headline: 'Hecho para los comités de revisión arquitectónica de Round Rock.',
        blurb:
          'Standing seam con sujetadores ocultos, revestimiento Board & Batten y colores de techo a juego con tu casa — para propietarios de Brushy Creek, Forest Creek, Teravista y Stone Canyon cuyo ARC exige que la construcción se vea residencial, no utilitaria.',
        ctaLabel: 'Ver construcciones que cumplen con HOA',
      },
      {
        eyebrow: 'Alcance en el condado de Williamson',
        headline: 'Cedar Park, Pflugerville y el corredor SH-45.',
        blurb:
          'Round Rock es el ancla del recorrido — Cedar Park, Pflugerville, Hutto y Leander quedan a la misma distancia de nuestro equipo. La misma viga roja soldada, el mismo concreto en un solo contrato, el mismo viaje de 60 millas desde Temple.',
        ctaLabel: 'Ver construcciones en Georgetown',
      },
    ],
  },

  lampasas: {
    heroImageAlt: 'Proyecto de estructura de acero de Triple J Metal en el centro de Texas',
    county: 'Condado de Lampasas',
    metaTitle: 'Edificios metálicos y cercas en Lampasas, TX',
    metaDescription:
      'Cocheras, garajes, graneros y cercas metálicas soldados o atornillados en Lampasas, TX. Triple J Metal, con base en Temple. Concreto disponible; pide una cotización de tu proyecto.',
    heroHeadline: 'Edificios metálicos y cercas en Lampasas, TX',
    heroCopy:
      'Planea una cochera, un garaje, un granero o una cerca metálica con nuestro equipo con base en Temple. Dinos tus medidas y tus prioridades; confirmamos el diseño, el alcance y la programación para tu propiedad.',
    areaContext:
      'Lampasas es el hogar de Hancock Springs y su alberca alimentada por un manantial. Para un proyecto de casa o terreno en la zona de Lampasas, el mejor punto de partida es qué necesita cubrirse: un vehículo de diario, un remolque, equipo agrícola o un taller. Triple J Metal recibe solicitudes de cocheras, graneros y garajes soldados o atornillados, con las necesidades de cimentación y acceso revisadas para cada propiedad.',
    whyLocal:
      'Nuestro equipo con base en Temple atiende Lampasas. Trabaja directamente con el equipo en el diseño, la preparación del terreno, la instalación y el alcance del proyecto por escrito.',
    services: [
      'Cocheras soldadas o atornilladas',
      'Garajes metálicos',
      'Graneros y cubiertas para equipo',
      'Cubiertas para RV y lanchas',
      'Cercas y portones metálicos',
      'Preparación del terreno y concreto cotizado aparte',
    ],
    customHeadline: {
      line1: 'Hecho para Lampasas.',
      line2: 'Espacio para vehículos, equipo y más.',
    },
    heroSubhead:
      'Planea una cochera, un garaje, un granero o una cerca metálica con nuestro equipo con base en Temple. Dinos tus medidas y tus prioridades; confirmamos el diseño, el alcance y la programación para tu propiedad.',
    localIntro:
      'Lampasas es el hogar de Hancock Springs y su alberca alimentada por un manantial. Para un proyecto de casa o terreno en la zona de Lampasas, el mejor punto de partida es qué necesita cubrirse: un vehículo de diario, un remolque, equipo agrícola o un taller. Triple J Metal recibe solicitudes de cocheras, graneros y garajes soldados o atornillados, con las necesidades de cimentación y acceso revisadas para cada propiedad.',
    landmarks: [
      {
        name: 'Hancock Springs Park',
        blurb:
          'La ciudad menciona una alberca alimentada por un manantial, un área de picnic y la histórica Hostess House en Hancock Springs Park.',
      },
    ],
    whyLocalBullets: [
      'Planea la altura libre según el vehículo o accesorio más alto, incluido el equipo montado en el techo.',
      'Habla del acceso de entrega y del espacio para maniobrar antes de elegir el área de la construcción.',
      'Los detalles de cimentación y anclaje se revisan para el sitio y el diseño reales.',
      '¿Necesitas una cerca de linde de rancho o un portón de entrada? Incluye la cerca en tu solicitud.',
    ],
    callouts: [
      {
        eyebrow: 'Equipo y acceso',
        headline: 'Mide el equipo y la entrada.',
        blurb:
          'Para una cubierta de RV, remolque o equipo, manda la altura y el ancho totales junto con fotos o un croquis del acceso. La holgura de las puertas, el espacio para maniobrar y el espacio interior útil, todo va en el plan.',
        ctaLabel: 'Planea tu proyecto',
      },
    ],
    localSource: {
      label: 'Referencia local de Lampasas',
    },
  },

  holland: {
    heroImageAlt: 'Proyecto de estructura de acero de Triple J Metal en el centro de Texas',
    county: 'Condado de Bell',
    metaTitle: 'Edificios metálicos y cercas en Holland, TX',
    metaDescription:
      'Cocheras, garajes, graneros y cercas metálicas soldados o atornillados en Holland, TX. Triple J Metal, con base en Temple. Concreto disponible; pide una cotización de tu proyecto.',
    heroHeadline: 'Edificios metálicos y cercas en Holland, TX',
    heroCopy:
      'Planea una cochera, un garaje, un granero o una cerca metálica con nuestro equipo con base en Temple. Dinos tus medidas y tus prioridades; confirmamos el diseño, el alcance y la programación para tu propiedad.',
    areaContext:
      'Holland está en el sureste del condado de Bell, al este de Salado; la historia de la ciudad se remonta a los primeros asentamientos a lo largo de Darr’s Creek. Recibimos solicitudes de proyectos de estacionamiento residencial, almacenamiento de equipo y cercas en la zona de Holland. Dinos qué necesita hacer el espacio y hablamos de una distribución que se ajuste a tu propiedad y a tu presupuesto.',
    whyLocal:
      'Nuestro equipo con base en Temple atiende Holland. Trabaja directamente con el equipo en el diseño, la preparación del terreno, la instalación y el alcance del proyecto por escrito.',
    services: [
      'Cocheras soldadas o atornilladas',
      'Garajes metálicos',
      'Graneros y cubiertas para equipo',
      'Cubiertas para RV y lanchas',
      'Cercas y portones metálicos',
      'Preparación del terreno y concreto cotizado aparte',
    ],
    customHeadline: {
      line1: 'Hecho para Holland.',
      line2: 'Acero práctico para las casas y los terrenos de Holland.',
    },
    heroSubhead:
      'Planea una cochera, un garaje, un granero o una cerca metálica con nuestro equipo con base en Temple. Dinos tus medidas y tus prioridades; confirmamos el diseño, el alcance y la programación para tu propiedad.',
    localIntro:
      'Holland está en el sureste del condado de Bell, al este de Salado; la historia de la ciudad se remonta a los primeros asentamientos a lo largo de Darr’s Creek. Recibimos solicitudes de proyectos de estacionamiento residencial, almacenamiento de equipo y cercas en la zona de Holland. Dinos qué necesita hacer el espacio y hablamos de una distribución que se ajuste a tu propiedad y a tu presupuesto.',
    landmarks: [
      {
        name: 'Darr’s Creek y la historia de Holland',
        blurb:
          'La ciudad de Holland documenta la vida temprana de la comunidad a lo largo de Darr’s Creek, al este del Holland de hoy. La ubicación propuesta de tu construcción y su acceso deben revisarse caso por caso.',
      },
    ],
    whyLocalBullets: [
      'Trae las dimensiones aproximadas del equipo, las bahías de almacenamiento y el estacionamiento techado.',
      'Incluye las aberturas de los portones y la ruta que usarán los vehículos para entrar a la propiedad.',
      'Las condiciones del terreno y el drenaje guían la conversación sobre la cimentación; no hay una suposición de suelo que sirva para todos.',
      'Nuestro equipo con base en Temple puede hablar del proyecto en inglés o en español.',
    ],
    callouts: [
      {
        eyebrow: 'Rancho y residencial',
        headline: 'Planea el portón antes de la línea de la cerca.',
        blurb:
          'Comparte el equipo o los vehículos que necesitan acceso, el largo aproximado de la cerca y el ancho de las aberturas que necesitas. Las cercas de tubo/rancho, de privacidad metálica y ornamentales se pueden platicar en la misma solicitud.',
        ctaLabel: 'Conoce las cercas y portones metálicos',
      },
    ],
    localSource: {
      label: 'Referencia local de Holland',
    },
  },

  taylor: {
    heroImageAlt: 'Proyecto de estructura de acero de Triple J Metal en el centro de Texas',
    county: 'Condado de Williamson',
    metaTitle: 'Edificios metálicos y cercas en Taylor, TX',
    metaDescription:
      'Cocheras, garajes, graneros y cercas metálicas soldados o atornillados en Taylor, TX. Triple J Metal, con base en Temple. Concreto disponible; pide una cotización de tu proyecto.',
    heroHeadline: 'Edificios metálicos y cercas en Taylor, TX',
    heroCopy:
      'Planea una cochera, un garaje, un granero o una cerca metálica con nuestro equipo con base en Temple. Dinos tus medidas y tus prioridades; confirmamos el diseño, el alcance y la programación para tu propiedad.',
    areaContext:
      'El centro de Taylor combina edificios históricos, tiendas y servicios, mientras que Murphy Park ofrece un espacio recreativo público importante. Para tu propiedad, concéntrate en cómo la estructura nueva se va a unir con la entrada, el patio y la construcción existentes. Ofrecemos cocheras y garajes soldados o atornillados, además de cercas y portones metálicos, con concreto disponible como parte del proyecto, con precio aparte.',
    whyLocal:
      'Nuestro equipo con base en Temple atiende Taylor. Trabaja directamente con el equipo en el diseño, la preparación del terreno, la instalación y el alcance del proyecto por escrito.',
    services: [
      'Cocheras soldadas o atornilladas',
      'Garajes metálicos',
      'Graneros y cubiertas para equipo',
      'Cubiertas para RV y lanchas',
      'Cercas y portones metálicos',
      'Preparación del terreno y concreto cotizado aparte',
    ],
    customHeadline: {
      line1: 'Hecho para Taylor.',
      line2: 'Una obra en Taylor que se ajusta a toda la propiedad.',
    },
    heroSubhead:
      'Planea una cochera, un garaje, un granero o una cerca metálica con nuestro equipo con base en Temple. Dinos tus medidas y tus prioridades; confirmamos el diseño, el alcance y la programación para tu propiedad.',
    localIntro:
      'El centro de Taylor combina edificios históricos, tiendas y servicios, mientras que Murphy Park ofrece un espacio recreativo público importante. Para tu propiedad, concéntrate en cómo la estructura nueva se va a unir con la entrada, el patio y la construcción existentes. Ofrecemos cocheras y garajes soldados o atornillados, además de cercas y portones metálicos, con concreto disponible como parte del proyecto, con precio aparte.',
    landmarks: [
      {
        name: 'El centro de Taylor y Murphy Park',
        blurb:
          'El programa oficial del centro de Taylor describe sus edificios históricos y negocios; la ciudad enumera Murphy Park en Veterans Drive.',
      },
    ],
    whyLocalBullets: [
      'Elige una línea de techo y un acabado que combinen con la propiedad existente.',
      'Mide el acceso de la entrada y el espacio libre que se necesita en cada puerta o portón.',
      'Habla de la nivelación, el drenaje y cualquier losa existente antes de cerrar el alcance.',
      'Confirmamos la disponibilidad para tu dirección y tu proyecto antes de prometer una fecha de instalación.',
    ],
    callouts: [
      {
        eyebrow: 'Estacionamiento y espacio de taller',
        headline: 'Deja espacio para algo más que el vehículo.',
        blurb:
          'El plan de un garaje necesita aberturas de puerta, espacio para el banco de trabajo y lugar para moverse alrededor del vehículo. Comparte esas necesidades junto con el área total para que la cotización refleje el espacio útil.',
        ctaLabel: 'Planea tu proyecto',
      },
    ],
    localSource: {
      label: 'Referencia local de Taylor',
    },
  },

  troy: {
    heroImageAlt: 'Proyecto de estructura de acero de Triple J Metal en el centro de Texas',
    county: 'Condado de Bell',
    metaTitle: 'Edificios metálicos y cercas en Troy, TX',
    metaDescription:
      'Cocheras, garajes, graneros y cercas metálicas soldados o atornillados en Troy, TX. Triple J Metal, con base en Temple. Concreto disponible; pide una cotización de tu proyecto.',
    heroHeadline: 'Edificios metálicos y cercas en Troy, TX',
    heroCopy:
      'Planea una cochera, un garaje, un granero o una cerca metálica con nuestro equipo con base en Temple. Dinos tus medidas y tus prioridades; confirmamos el diseño, el alcance y la programación para tu propiedad.',
    areaContext:
      'West Main Street, en Troy, se conecta con la I-35 y une al pueblo con el corredor de Temple. Para una cochera, un granero o una cubierta para equipo, el mejor plan empieza con el acceso de todos los días: dónde estacionas, das la vuelta, cargas y guardas. Triple J Metal atiende Troy desde Temple con opciones de acero soldado o atornillado y una cotización hecha a la medida del sitio.',
    whyLocal:
      'Nuestro equipo con base en Temple atiende Troy. Trabaja directamente con el equipo en el diseño, la preparación del terreno, la instalación y el alcance del proyecto por escrito.',
    services: [
      'Cocheras soldadas o atornilladas',
      'Garajes metálicos',
      'Graneros y cubiertas para equipo',
      'Cubiertas para RV y lanchas',
      'Cercas y portones metálicos',
      'Preparación del terreno y concreto cotizado aparte',
    ],
    customHeadline: {
      line1: 'Hecho para Troy.',
      line2: 'Espacio techado para las casas y el equipo de Troy.',
    },
    heroSubhead:
      'Planea una cochera, un garaje, un granero o una cerca metálica con nuestro equipo con base en Temple. Dinos tus medidas y tus prioridades; confirmamos el diseño, el alcance y la programación para tu propiedad.',
    localIntro:
      'West Main Street, en Troy, se conecta con la I-35 y une al pueblo con el corredor de Temple. Para una cochera, un granero o una cubierta para equipo, el mejor plan empieza con el acceso de todos los días: dónde estacionas, das la vuelta, cargas y guardas. Triple J Metal atiende Troy desde Temple con opciones de acero soldado o atornillado y una cotización hecha a la medida del sitio.',
    landmarks: [
      {
        name: 'West Main Street y la I-35',
        blurb:
          'El proyecto de West Main Street de la ciudad identifica la conexión desde la I-35 hacia Trojan Road. Comparte la entrada y la ruta de acceso reales de tu propiedad cuando pidas la cotización.',
      },
    ],
    whyLocalBullets: [
      'Dimensiona las aberturas según el vehículo o el equipo que de verdad va a pasar por ellas.',
      'Decide qué lados necesitan protección contra el clima y cuáles deben quedar accesibles.',
      'Revisa la pendiente del terreno y el flujo del agua antes de elegir el área y la cimentación.',
      'El concreto, el cerramiento y los portones se listan como parte del alcance acordado, en vez de darse por hecho en un precio base.',
    ],
    callouts: [
      {
        eyebrow: 'Espacio de trabajo',
        headline: 'Que cargar y estacionar no se estorben.',
        blurb:
          'Para un granero o una cubierta, muéstranos por dónde entra el equipo y dónde se van a guardar los materiales. Los lados abiertos, el cerramiento y la ubicación de los portones se pueden pensar según cómo uses la propiedad.',
        ctaLabel: 'Planea tu proyecto',
      },
    ],
    localSource: {
      label: 'Referencia local de Troy',
    },
  },

  nolanville: {
    heroImageAlt: 'Proyecto de estructura de acero de Triple J Metal en el centro de Texas',
    county: 'Condado de Bell',
    metaTitle: 'Edificios metálicos y cercas en Nolanville, TX',
    metaDescription:
      'Cocheras, garajes, graneros y cercas metálicas soldados o atornillados en Nolanville, TX. Triple J Metal, con base en Temple. Concreto disponible; pide una cotización de tu proyecto.',
    heroHeadline: 'Edificios metálicos y cercas en Nolanville, TX',
    heroCopy:
      'Planea una cochera, un garaje, un granero o una cerca metálica con nuestro equipo con base en Temple. Dinos tus medidas y tus prioridades; confirmamos el diseño, el alcance y la programación para tu propiedad.',
    areaContext:
      'El programa público de Nolan Creek de Nolanville resalta el papel del arroyo en la recreación y el manejo de aguas pluviales. Eso hace del drenaje un buen tema para planear desde temprano, sin suponer que todas las propiedades tienen las mismas condiciones. Trae tus planes de estacionamiento o de cerca a nuestro equipo con base en Temple y hablamos del área de la construcción, el acceso y los materiales para tu sitio.',
    whyLocal:
      'Nuestro equipo con base en Temple atiende Nolanville. Trabaja directamente con el equipo en el diseño, la preparación del terreno, la instalación y el alcance del proyecto por escrito.',
    services: [
      'Cocheras soldadas o atornilladas',
      'Garajes metálicos',
      'Graneros y cubiertas para equipo',
      'Cubiertas para RV y lanchas',
      'Cercas y portones metálicos',
      'Preparación del terreno y concreto cotizado aparte',
    ],
    customHeadline: {
      line1: 'Hecho para Nolanville.',
      line2: 'Aprovecha más tu propiedad en Nolanville.',
    },
    heroSubhead:
      'Planea una cochera, un garaje, un granero o una cerca metálica con nuestro equipo con base en Temple. Dinos tus medidas y tus prioridades; confirmamos el diseño, el alcance y la programación para tu propiedad.',
    localIntro:
      'El programa público de Nolan Creek de Nolanville resalta el papel del arroyo en la recreación y el manejo de aguas pluviales. Eso hace del drenaje un buen tema para planear desde temprano, sin suponer que todas las propiedades tienen las mismas condiciones. Trae tus planes de estacionamiento o de cerca a nuestro equipo con base en Temple y hablamos del área de la construcción, el acceso y los materiales para tu sitio.',
    landmarks: [
      {
        name: 'Nolan Creek',
        blurb:
          'El programa de Nolan Creek de la ciudad explica su papel en la recreación y en el manejo de aguas pluviales. Antes de agregar una estructura o una cerca, habla de cómo se relaciona la distribución propuesta con el flujo del agua en tu propiedad.',
      },
    ],
    whyLocalBullets: [
      'Empieza con las medidas del estacionamiento, la altura libre del techo y el ancho útil de los portones.',
      'Comparte el plano de la propiedad (survey) o los lineamientos arquitectónicos que tengas para el proyecto.',
      'Revisa el drenaje y la posición propuesta de la cerca o la construcción antes de la instalación.',
      'Nuestro equipo con base en Temple puede platicar el proyecto contigo en inglés y en español.',
    ],
    callouts: [
      {
        eyebrow: 'Cercas y portones',
        headline: 'Privacidad donde la quieres. Acceso donde lo necesitas.',
        blurb:
          'Dinos si necesitas una cerca metálica de privacidad, un diseño ornamental abierto o una cerca de tubo/rancho. Incluye en tu solicitud de cotización los pies lineales aproximados, la altura y los portones peatonales o de entrada de vehículos.',
        ctaLabel: 'Conoce las cercas y portones metálicos',
      },
    ],
    localSource: {
      label: 'Referencia local de Nolanville',
    },
  },
}

/**
 * One city, in the page's language. English returns the source record
 * untouched; Spanish overlays the translated copy on the English facts.
 */
export function getLocation(slug: string, locale: Locale): LocationData | undefined {
  const en = LOCATIONS[slug]
  if (!en) return undefined
  if (locale === 'en') return en
  const es = LOCATIONS_ES[slug]
  if (!es) return en
  const { landmarks, callouts, localSource, military, ...copy } = es
  return {
    ...en,
    ...copy,
    military: en.military && military ? military : en.military,
    landmarks: en.landmarks?.map((l, i) => ({ ...l, ...landmarks?.[i] })),
    callouts: en.callouts?.map((c, i) => ({ ...c, ...callouts?.[i] })),
    localSource: en.localSource ? { ...en.localSource, ...localSource } : undefined,
  }
}

/** The English value at every key the Spanish copy has, recursively. */
function project(en: unknown, es: unknown): unknown {
  if (Array.isArray(es)) return es.map((v, i) => project((en as unknown[] | undefined)?.[i], v))
  if (es && typeof es === 'object') {
    return Object.fromEntries(
      Object.keys(es).map((k) => [k, project((en as Record<string, unknown> | undefined)?.[k], (es as Record<string, unknown>)[k])]),
    )
  }
  return en
}

/**
 * The English twin of LOCATIONS_ES: the English copy cut down to the fields
 * (and landmark / callout / fact rows) the Spanish file translates, so the two
 * can be compared field by field. src/i18n/parity.test.ts reads this for its
 * `src/lib/locations.es.ts` entry.
 */
export const LOCATIONS_EN_COPY: Record<string, unknown> = Object.fromEntries(
  Object.entries(LOCATIONS_ES).map(([slug, es]) => [slug, project(LOCATIONS[slug], es)]),
)
