import { bilingual } from "@/i18n/config";

/**
 * Words on the city pages (/locations/[slug], /es/ciudades/[slug]) and on the
 * service-areas hub (/locations, /es/ciudades). The per-city copy itself is
 * data: English in src/lib/locations.ts, Spanish in src/lib/locations.es.ts.
 *
 * Numbers are never retyped here; the hub's city count is passed in.
 */

export const CITY_PAGE = bilingual(
  {
    /** Visible breadcrumb step. */
    hubCrumb: "Service areas",
    /** The same step's name in the BreadcrumbList JSON-LD. */
    hubJsonLd: "Service Areas",
    eyebrow: (county: string): string => `Service area · ${county}`,
    quote: (city: string): string => `Get a ${city} Quote`,
    call: "Call",
    facts: {
      fromHq: "From HQ",
      county: "County",
      language: "Language",
      languageValue: "English & Español",
      languageSub: "Hablamos español — quotes, site visits and the build",
    },
    military: { eyebrow: "Military & first responder", cta: "See the military page" },
    intro: {
      eyebrow: "Where we build",
      line1: "Built local.",
      line2: "Built whole, by us.",
    },
    source: "Source:",
    neighborhoods: "Neighborhoods we cover",
    shop: "Shop:",
    land: {
      eyebrow: "Know the ground",
      heading: (city: string): string => `${city}, the way we know it.`,
    },
    why: {
      eyebrow: "Why a local crew",
      line1: "Local crew.",
      line2: (city: string): string => `${city} timelines.`,
    },
    build: {
      eyebrow: (city: string): string => `What we build in ${city}`,
      line1: "Same crew.",
      line2: "Every build.",
      explore: (label: string): string => `Explore ${label}`,
    },
    near: {
      eyebrow: (city: string): string => `Builds near ${city}`,
      line1: "Built down the road.",
      gallery: "See the full gallery →",
    },
    nearby: {
      eyebrow: "Nearby",
      heading: (city: string): string => `Also serving near ${city}.`,
      all: "All service areas →",
    },
    heroAlt: (city: string): string => `${city}, Texas`,
    keywords: (city: string): string[] => [
      `carport builders ${city} tx`,
      `metal carports ${city} texas`,
      `turnkey carports ${city}`,
      `carports with concrete ${city} tx`,
      `welded carport ${city} tx`,
    ],
    jsonLd: {
      name: (city: string): string => `Metal Building Installation in ${city}, TX`,
      serviceType: "Metal building installation",
      containedIn: (county: string): string => `${county}, Texas`,
      catalog: (siteName: string, city: string): string => `${siteName} services in ${city}, TX`,
    },
    og: {
      alt: "Triple J Metal — metal carports and buildings in Central Texas",
      headline: "Metal Buildings in",
    },
  },
  {
    hubCrumb: "Áreas de servicio",
    hubJsonLd: "Áreas de servicio",
    eyebrow: (county: string): string => `Zona de servicio · ${county}`,
    quote: (city: string): string => `Pide tu cotización en ${city}`,
    call: "Llamar al",
    facts: {
      fromHq: "Desde la sede",
      county: "Condado",
      language: "Idioma",
      languageValue: "Español e inglés",
      languageSub: "Hablamos español — cotizaciones, visitas al sitio y la obra",
    },
    military: { eyebrow: "Militares y primeros respondientes", cta: "Ver la página militar" },
    intro: {
      eyebrow: "Dónde construimos",
      line1: "Hecho local.",
      line2: "Completo, y lo hacemos nosotros.",
    },
    source: "Fuente:",
    neighborhoods: "Zonas que atendemos",
    shop: "Taller:",
    land: {
      eyebrow: "Conoce el terreno",
      heading: (city: string): string => `${city}, como la conocemos.`,
    },
    why: {
      eyebrow: "Por qué un equipo local",
      line1: "Equipo local.",
      line2: (city: string): string => `Tiempos de ${city}.`,
    },
    build: {
      eyebrow: (city: string): string => `Lo que construimos en ${city}`,
      line1: "El mismo equipo.",
      line2: "En cada obra.",
      explore: (label: string): string => `Ver ${label.toLowerCase()}`,
    },
    near: {
      eyebrow: (city: string): string => `Obras cerca de ${city}`,
      line1: "Construidos aquí cerca.",
      gallery: "Ver la galería completa →",
    },
    nearby: {
      eyebrow: "Cerca",
      heading: (city: string): string => `También atendemos cerca de ${city}.`,
      all: "Todas las áreas de servicio →",
    },
    heroAlt: (city: string): string => `${city}, Texas`,
    keywords: (city: string): string[] => [
      `constructores de cocheras ${city} tx`,
      `cocheras metálicas ${city} texas`,
      `cocheras llave en mano ${city}`,
      `cocheras con losa de concreto ${city} tx`,
      `cochera soldada ${city} tx`,
    ],
    jsonLd: {
      name: (city: string): string => `Instalación de edificios metálicos en ${city}, TX`,
      serviceType: "Instalación de edificios metálicos",
      containedIn: (county: string): string => `${county}, Texas`,
      catalog: (siteName: string, city: string): string => `Servicios de ${siteName} en ${city}, TX`,
    },
    og: {
      alt: "Triple J Metal — cocheras y edificios metálicos en el centro de Texas",
      headline: "Edificios metálicos en",
    },
  },
);

export const CITIES_HUB = bilingual(
  {
    meta: {
      title: "Metal Building Service Areas, Central TX",
      description: (count: number): string =>
        `Welded or bolted carports, garages, RV covers and barns in ${count} Central Texas cities, from Waco to Round Rock. Same-week installs from our Temple shop.`,
      ogTitle: "Service Areas | Triple J Metal",
      ogDescription: "Metal building installation across Central Texas. Temple-based crew.",
    },
    jsonLd: {
      crumb: "Service Areas",
      name: "Triple J Metal Service Areas",
      description: "Cities and counties served by Triple J Metal for metal building installation in Central Texas",
      item: (city: string): string => `Metal Buildings ${city}, TX`,
    },
    hero: {
      crumb: "Service areas",
      eyebrow: "Where We Build",
      h1: "Metal building installation across Central Texas",
      lede: "Triple J Metal is based in Temple, TX. We build welded or bolted carports, garages, barns, and RV covers across the entire Killeen–Temple–Belton corridor and surrounding counties. If you’re within 90 minutes of Temple, we come to you.",
      quote: "Get a Free Quote",
      call: "Call ",
    },
    stats: {
      cities: "Cities Served",
      counties: "Counties Covered",
      sameWeek: "Same-Week",
      sameWeekLabel: "On-Site After Approval",
      zero: "Zero",
      zeroLabel: "Subcontractors — Ever",
    },
    cities: {
      heading: "Cities we serve",
      lede: "Click any city to see a dedicated page with local service details, pricing context, and area-specific information for your project.",
      homeBase: "Home Base",
      view: "View details",
    },
    counties: {
      heading: "Counties we serve",
      lede: "Our Temple-based crew covers these counties in full — including towns and rural ag properties not listed individually above.",
    },
    travel: {
      heading: "How far do we travel?",
      p1: "Our Temple-based crew regularly builds within a 90-minute radius. That covers most of Bell, Coryell, McLennan, Lampasas, and Williamson counties. For larger commercial jobs or unique projects, we’ll travel further — just call and ask.",
      p2Before: "Not sure if you’re in our range? Call",
      p2After: "— we’ll tell you immediately.",
      cta: "Call to confirm your area — ",
    },
    og: {
      alt: "Triple J Metal — metal building installation across Central Texas",
      eyebrow: "Service Areas",
      headline: "Metal Building Installation",
      accent: "Across Central Texas.",
      subhead:
        "Triple J Metal is based in Temple, TX. We build welded or bolted carports, garages, barns, and RV covers across the entire Killeen–Temple–Belton corridor and surrounding counties.",
    },
  },
  {
    meta: {
      title: "Áreas de servicio para edificios metálicos, centro de Texas",
      description: (count: number): string =>
        `Cocheras, garajes, cubiertas para RV y graneros soldados o atornillados en ${count} ciudades del centro de Texas, de Waco a Round Rock. Instalaciones en la misma semana desde nuestro taller en Temple.`,
      ogTitle: "Áreas de servicio | Triple J Metal",
      ogDescription: "Instalación de edificios metálicos en todo el centro de Texas. Equipo con base en Temple.",
    },
    jsonLd: {
      crumb: "Áreas de servicio",
      name: "Áreas de servicio de Triple J Metal",
      description: "Ciudades y condados donde Triple J Metal instala edificios metálicos en el centro de Texas",
      item: (city: string): string => `Edificios metálicos en ${city}, TX`,
    },
    hero: {
      crumb: "Áreas de servicio",
      eyebrow: "Dónde construimos",
      h1: "Instalación de edificios metálicos en todo el centro de Texas",
      lede: "Triple J Metal tiene su base en Temple, TX. Construimos cocheras, garajes, graneros y cubiertas para RV soldados o atornillados en todo el corredor Killeen–Temple–Belton y los condados vecinos. Si estás a 90 minutos de Temple o menos, vamos hasta ti.",
      quote: "Cotización gratis",
      call: "Llamar al ",
    },
    stats: {
      cities: "Ciudades atendidas",
      counties: "Condados cubiertos",
      sameWeek: "Misma semana",
      sameWeekLabel: "En tu terreno tras la aprobación",
      zero: "Cero",
      zeroLabel: "Subcontratistas — nunca",
    },
    cities: {
      heading: "Ciudades que atendemos",
      lede: "Elige cualquier ciudad para ver una página dedicada con detalles del servicio local, contexto de precios e información de la zona para tu proyecto.",
      homeBase: "Nuestra sede",
      view: "Ver detalles",
    },
    counties: {
      heading: "Condados que atendemos",
      lede: "Nuestro equipo con base en Temple cubre estos condados por completo — incluidos pueblos y propiedades agrícolas rurales que no aparecen por separado arriba.",
    },
    travel: {
      heading: "¿Hasta dónde viajamos?",
      p1: "Nuestro equipo con base en Temple construye con regularidad en un radio de 90 minutos. Eso cubre la mayor parte de los condados de Bell, Coryell, McLennan, Lampasas y Williamson. Para trabajos comerciales más grandes o proyectos especiales, viajamos más lejos — solo llama y pregunta.",
      p2Before: "¿No sabes si estás dentro de nuestro rango? Llama al",
      p2After: "— te lo decimos de inmediato.",
      cta: "Llama para confirmar tu zona — ",
    },
    og: {
      alt: "Triple J Metal — instalación de edificios metálicos en todo el centro de Texas",
      eyebrow: "Áreas de servicio",
      headline: "Instalación de edificios metálicos",
      accent: "En todo el centro de Texas.",
      subhead:
        "Triple J Metal tiene su base en Temple, TX. Construimos cocheras, garajes, graneros y cubiertas para RV soldados o atornillados en todo el corredor Killeen–Temple–Belton y los condados vecinos.",
    },
  },
);
