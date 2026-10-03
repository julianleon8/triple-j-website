import { bilingual } from "@/i18n/config";

/**
 * /gallery and /gallery/[id] copy, both languages. Project titles, cities,
 * photo captions and the like are typed in HQ and show as stored; the gallery
 * `type` and `tag` words go through `buildWord` (src/i18n/copy/ui.ts), and the
 * filter names carry their Spanish beside them in src/lib/gallery-filters.ts.
 */
export const GALLERY = bilingual(
  {
    meta: {
      title: "Project Gallery — 150+ Central Texas Builds",
      description:
        "Browse 150+ metal carports, garages, barns, and RV covers built across Temple, Belton, Killeen, and Central Texas. Welded and bolted.",
      ogTitle: "Project Gallery | Triple J Metal",
      ogDescription: "150+ completed metal building projects across Central Texas.",
    },
    jsonLd: {
      name: "Triple J Metal — Project Gallery",
      description: "150+ completed metal carports, garages, barns, and RV covers across Central Texas.",
    },
    hero: {
      company: "Company",
      current: "Gallery",
      eyebrow: "The Triple J portfolio",
      h1a: "Built here.",
      h1b: "Built for you.",
      lede: "Central Texas projects, from backyard patios to garages and ranch structures. Every one is a Triple J crew job — tap a build to see it up close.",
      plan: "Plan Your Build",
    },
    grid: {
      aria: "Project portfolio",
      filterAria: "Filter by building type",
      count: (n: number, label: string): string => `${n} ${n === 1 ? "project" : "projects"} · ${label}`,
      emptyTitle: "More builds to explore",
      emptyBody: "No project photos in this category yet.",
      viewAll: "View all projects",
      footNote: "New photos are added as our projects take shape. Don’t see your build? We probably still build it.",
      quote: "Get a Free Quote",
    },
    og: {
      alt: "Triple J Metal project gallery — metal buildings across Central Texas",
      eyebrow: "Project Gallery",
      headline: "Built Here.",
      accent: "Built for You.",
      subhead: (n: string): string => `${n} completed metal building projects across Central Texas.`,
    },
    detail: {
      gallery: "Gallery",
      description: (type: string, city: string): string =>
        `${type} built by Triple J Metal in ${city}. Welded or bolted, same-week scheduling, Temple TX crew.`,
      jsonLdDescription: (type: string, city: string): string => `${type} built by Triple J Metal in ${city}.`,
      eyebrow: (type: string): string => `Triple J build · ${type}`,
      build: "Build one like this",
      call: "Call ",
      viewAria: (n: number, title: string): string => `View all ${n} photos of ${title}`,
      viewAll: (n: number): string => `View all ${n} photos →`,
      photosTitle: "Project photos",
      morePhotosBefore: "Additional photos coming soon. Call ",
      morePhotosAfter: " to see more examples like this build.",
      detailsTitle: "Build details",
      labels: {
        project: "Project",
        location: "Location",
        type: "Type",
        construction: "Construction",
        panelColor: "Panel Color",
        trimColor: "Trim Color",
        panelProfile: "Panel Profile",
        gauge: "Gauge",
      },
      gaugeValue: (gauge: string): string => `${gauge} ga`,
      allProjects: "← All projects",
    },
  },
  {
    meta: {
      title: "Galería de proyectos — 150+ obras en el centro de Texas",
      description:
        "Mira 150+ cocheras, garajes, graneros y cubiertas para RV metálicos construidos en Temple, Belton, Killeen y el centro de Texas. Soldados y atornillados.",
      ogTitle: "Galería de proyectos | Triple J Metal",
      ogDescription: "150+ proyectos de edificios metálicos terminados en el centro de Texas.",
    },
    jsonLd: {
      name: "Triple J Metal — Galería de proyectos",
      description: "150+ cocheras, garajes, graneros y cubiertas para RV metálicos terminados en el centro de Texas.",
    },
    hero: {
      company: "Empresa",
      current: "Galería",
      eyebrow: "El portafolio de Triple J",
      h1a: "Hecho aquí.",
      h1b: "Hecho para ti.",
      lede: "Proyectos del centro de Texas, desde patios traseros hasta garajes y estructuras de rancho. Cada uno es un trabajo de nuestro equipo: toca una obra para verla de cerca.",
      plan: "Planea tu obra",
    },
    grid: {
      aria: "Portafolio de proyectos",
      filterAria: "Filtrar por tipo de construcción",
      count: (n: number, label: string): string => `${n} ${n === 1 ? "proyecto" : "proyectos"} · ${label}`,
      emptyTitle: "Más obras por descubrir",
      emptyBody: "Todavía no hay fotos de proyectos en esta categoría.",
      viewAll: "Ver todos los proyectos",
      footNote:
        "Agregamos fotos nuevas conforme avanzan nuestros proyectos. ¿No ves tu tipo de obra? Probablemente también la construimos.",
      quote: "Cotización gratis",
    },
    og: {
      alt: "Galería de proyectos de Triple J Metal — edificios metálicos en el centro de Texas",
      eyebrow: "Galería de proyectos",
      headline: "Hecho aquí.",
      accent: "Hecho para ti.",
      subhead: (n: string): string => `${n} proyectos de edificios metálicos terminados en el centro de Texas.`,
    },
    detail: {
      gallery: "Galería",
      description: (type: string, city: string): string =>
        `${type} de Triple J Metal en ${city}. Soldado o atornillado, instalación en la misma semana, equipo de Temple, TX.`,
      jsonLdDescription: (type: string, city: string): string => `${type} de Triple J Metal en ${city}.`,
      eyebrow: (type: string): string => `Obra de Triple J · ${type}`,
      build: "Construye una obra como esta",
      call: "Llamar al ",
      viewAria: (n: number, title: string): string => `Ver las ${n} fotos de ${title}`,
      viewAll: (n: number): string => `Ver las ${n} fotos →`,
      photosTitle: "Fotos del proyecto",
      morePhotosBefore: "Pronto habrá más fotos. Llama al ",
      morePhotosAfter: " para ver más ejemplos como esta obra.",
      detailsTitle: "Detalles de la obra",
      labels: {
        project: "Proyecto",
        location: "Ubicación",
        type: "Tipo",
        construction: "Construcción",
        panelColor: "Color del panel",
        trimColor: "Color de las molduras",
        panelProfile: "Perfil del panel",
        gauge: "Calibre",
      },
      gaugeValue: (gauge: string): string => `${gauge} ga`,
      allProjects: "← Todos los proyectos",
    },
  },
);
