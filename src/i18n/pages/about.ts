import { bilingual } from "@/i18n/config";
import { SITE } from "@/lib/site";

/**
 * /about copy, both languages. The English is what shipped before the Spanish
 * site; the Spanish carries the same numbers and claims (Locked Decisions →
 * Spanish site, 2026-10-03). No names: the owners, the point of contact and
 * the foreman are roles here.
 */
export const ABOUT = bilingual(
  {
    meta: {
      title: "About — Temple, TX Metal Building Family",
      description:
        "Temple, TX family metal building contractor. 150+ completed projects, welded red iron steel, turnkey concrete. Not a national chain.",
      ogTitle: "About Triple J Metal | Temple, TX",
      ogDescription: "Local Temple family business. 150+ completed metal building projects across Central Texas.",
    },
    jsonLd: {
      name: `About ${SITE.name}`,
      description:
        "Family-owned Temple, TX metal building contractor. 150+ completed projects, welded red iron steel, turnkey concrete.",
    },
    hero: {
      company: "Company",
      current: "About",
      imgAlt: "Red iron frame going up on a Triple J Metal jobsite",
      eyebrow: "About Triple J",
      h1a: "Temple’s metal building family.",
      h1b: "Not a national chain.",
      lede: "Founded by a Temple family and run out of Temple, TX. We build every structure ourselves — no subcontractors, no kit drops, no hand-offs. One crew. One contract. Done right.",
      facts: {
        projects: "Projects",
        projectsValue: (n: string): string => `${n} completed`,
        onSite: "On-site",
        onSiteValue: "Mon–Sat",
        afterApproval: "After approval",
        afterApprovalValue: "Same-week",
        founded: "Founded",
        foundedValue: (year: number): string => `${year} · Temple, TX`,
      },
    },
    crew: {
      imgAlt: "Finished Triple J Metal carport over a truck on a fresh concrete pad",
      caption: "From the first measurement to the final weld.",
      eyebrow: "Meet Triple J",
      line1: "One family.",
      line2: "One crew, start to finish.",
      lede: "The family behind the name and the crew that builds every job, based right here in Temple.",
      people: [
        {
          title: "The owners",
          role: "Family · Relationships",
          body: "The Temple family behind Triple J. They answer the phone, meet you on site and stand behind every build.",
        },
        {
          title: "Your point of contact",
          role: "Sales · Operations",
          body: "Plans the build with you, talks through the options and keeps the details moving from quote to install.",
        },
        {
          title: "The foreman",
          role: "Foreman · Fabrication",
          body: "Leads the crew — the measurements, cuts and welds that bring your plans to life.",
        },
      ],
      talk: "Talk with our team · ",
      languages: "English & Español",
    },
    apart: {
      eyebrow: "What sets us apart",
      line1: "No kits. No subs.",
      line2: "No hand-offs.",
      items: [
        {
          title: "Local crew — not a dealer",
          body: "We don’t sell kits. We build structures. Every job is handled by our own Temple-based crew from start to finish.",
        },
        {
          title: "Welded or bolted",
          body: "Both options, built by us. Framing, anchoring and any engineering requirements are confirmed for your design and site.",
        },
        {
          title: "Concrete on the same contract",
          body: "Site prep, concrete and the structure quoted together. Concrete is priced separately so you see exactly what’s included.",
        },
        {
          title: "Same-week scheduling",
          body: "Your install date is confirmed after we review scope, materials, site readiness and any required approvals.",
        },
        {
          title: "Custom dimensions",
          body: "Not catalog sizes. You tell us the width, length and height — we build exactly that, any configuration, any roof style.",
        },
        {
          title: "Permit planning",
          body: "We give permit guidance and discuss approvals before scheduling. Filing responsibilities are confirmed in your written scope.",
        },
      ],
    },
    materials: {
      eyebrow: "Materials",
      line1: "Texas steel.",
      line2: "Texas suppliers.",
      body: "PBR and PBU panels, Galvalume® roofing, and concealed-fastener standing-seam systems for HOA-grade builds — sourced from leading regional Texas suppliers. Multi-source by design, so we’re never bottlenecked when one supplier runs short on a color or gauge.",
      rules: [
        "Regional Texas suppliers — multi-source",
        "14-gauge standard · 11-gauge heavy-duty columns",
        "Galvalume® substrate · 40-year painted finish",
      ],
      imgAlt: "Completed residential metal carport with painted steel panels",
    },
    how: {
      eyebrow: "How we work",
      line1: "You keep your weekend.",
      line2: "We keep our word.",
      items: [
        {
          title: "Show up when we say we will",
          body: "If we schedule a build date, we’re there. No rescheduling after you’ve cleared the site.",
        },
        {
          title: "One company, start to finish",
          body: "Site prep, concrete, steel structure, cleanup — the same crew under one contract.",
        },
        {
          title: "Built to outlast the contract",
          body: "Welded red iron and permanent bolts on Galvalume® substrate — real estate improvements your kids inherit in working condition.",
        },
        {
          title: "Permanent, not portable",
          body: "No kits that rattle loose in the first Texas thunderstorm. Every weld and anchor is built for the wind our county actually sees.",
        },
        {
          title: "Honest pricing, no surprises",
          body: "We quote the full job upfront — including concrete if you need it. No add-ons after the fact.",
        },
      ],
    },
    next: {
      label: "Keep looking",
      links: [
        { href: "/gallery", label: "See recent builds" },
        { href: "/services", label: "What we build" },
        { href: "/locations", label: "Where we work" },
        { href: "/blog", label: "Guides from the crew" },
        { href: "/partners", label: "Install partners" },
      ],
    },
    og: {
      alt: "Triple J Metal — a Temple, TX family metal building company",
      eyebrow: "Temple, TX",
      headline: "Temple’s Local Metal Building Family",
      accent: "Not a National Chain.",
      subhead: (n: string): string => `Local Temple family business. ${n} completed metal building projects across Central Texas.`,
    },
  },
  {
    meta: {
      title: "Nosotros — Una familia de edificios metálicos en Temple, TX",
      description:
        "Contratista familiar de edificios metálicos en Temple, TX. 150+ proyectos terminados, acero de viga roja soldado, concreto llave en mano. No somos una cadena nacional.",
      ogTitle: "Sobre Triple J Metal | Temple, TX",
      ogDescription: "Empresa familiar local de Temple. 150+ proyectos de edificios metálicos terminados en el centro de Texas.",
    },
    jsonLd: {
      name: `Sobre ${SITE.name}`,
      description:
        "Contratista de edificios metálicos de Temple, TX, empresa familiar. 150+ proyectos terminados, acero de viga roja soldado, concreto llave en mano.",
    },
    hero: {
      company: "Empresa",
      current: "Nosotros",
      imgAlt: "Estructura de viga roja levantándose en una obra de Triple J Metal",
      eyebrow: "Sobre Triple J",
      h1a: "La familia de edificios metálicos de Temple.",
      h1b: "No una cadena nacional.",
      lede: "Fundada por una familia de Temple y operada desde Temple, TX. Construimos cada estructura nosotros mismos: sin subcontratistas, sin kits que se dejan en tu terreno, sin traspasos. Un equipo. Un contrato. Bien hecho.",
      facts: {
        projects: "Proyectos",
        projectsValue: (n: string): string => `${n} terminados`,
        onSite: "En obra",
        onSiteValue: "Lun–Sáb",
        afterApproval: "Tras la aprobación",
        afterApprovalValue: "En la misma semana",
        founded: "Fundada",
        foundedValue: (year: number): string => `${year} · Temple, TX`,
      },
    },
    crew: {
      imgAlt: "Cochera terminada de Triple J Metal sobre una camioneta, en una losa de concreto recién colada",
      caption: "Desde la primera medida hasta la última soldadura.",
      eyebrow: "Conoce a Triple J",
      line1: "Una familia.",
      line2: "Un equipo, de principio a fin.",
      lede: "La familia detrás del nombre y el equipo que construye cada trabajo, aquí mismo en Temple.",
      people: [
        {
          title: "Los dueños",
          role: "Familia · Relaciones",
          body: "La familia de Temple detrás de Triple J. Contestan el teléfono, te reciben en tu terreno y respaldan cada obra.",
        },
        {
          title: "Tu persona de contacto",
          role: "Ventas · Operaciones",
          body: "Planea la obra contigo, te explica las opciones y mantiene los detalles en marcha, de la cotización a la instalación.",
        },
        {
          title: "El capataz",
          role: "Capataz · Fabricación",
          body: "Dirige al equipo: las medidas, los cortes y las soldaduras que hacen realidad tus planos.",
        },
      ],
      talk: "Habla con nuestro equipo · ",
      languages: "Hablamos español e inglés",
    },
    apart: {
      eyebrow: "Lo que nos distingue",
      line1: "Sin kits. Sin subcontratistas.",
      line2: "Sin traspasos.",
      items: [
        {
          title: "Equipo local, no un distribuidor",
          body: "No vendemos kits. Construimos estructuras. Cada trabajo lo maneja nuestro propio equipo de Temple, de principio a fin.",
        },
        {
          title: "Soldado o atornillado",
          body: "Las dos opciones, hechas por nosotros. La estructura, el anclaje y cualquier requisito de ingeniería se confirman para tu diseño y tu terreno.",
        },
        {
          title: "Concreto en el mismo contrato",
          body: "Preparación del terreno, concreto y estructura se cotizan juntos. El concreto se cotiza aparte para que veas exactamente qué se incluye.",
        },
        {
          title: "Instalación en la misma semana",
          body: "Confirmamos tu fecha de instalación después de revisar el alcance, los materiales, si el terreno está listo y las aprobaciones que se requieran.",
        },
        {
          title: "Dimensiones a tu medida",
          body: "No son tamaños de catálogo. Tú nos dices el ancho, el largo y la altura, y construimos exactamente eso, en cualquier configuración y con cualquier tipo de techo.",
        },
        {
          title: "Orientación sobre permisos",
          body: "Te orientamos con el permiso de construcción y hablamos de las aprobaciones antes de programar. Quién se encarga de cada trámite se confirma por escrito en tu alcance de trabajo.",
        },
      ],
    },
    materials: {
      eyebrow: "Materiales",
      line1: "Acero de Texas.",
      line2: "Proveedores de Texas.",
      body: "Paneles PBR y PBU, techo Galvalume® y sistemas standing-seam (junta alzada) con sujetadores ocultos para obras al nivel que piden las HOA, con material de proveedores regionales líderes de Texas. Con varias fuentes por diseño, así nunca nos frenamos cuando a un proveedor se le acaba un color o un calibre.",
      rules: [
        "Proveedores regionales de Texas, con varias fuentes",
        "Calibre 14 estándar · columnas reforzadas de calibre 11",
        "Sustrato Galvalume® · acabado pintado de 40 años",
      ],
      imgAlt: "Cochera metálica residencial terminada, con paneles de acero pintados",
    },
    how: {
      eyebrow: "Cómo trabajamos",
      line1: "Tú conservas tu fin de semana.",
      line2: "Nosotros cumplimos nuestra palabra.",
      items: [
        {
          title: "Llegamos cuando decimos",
          body: "Si agendamos una fecha de obra, ahí estamos. Sin reprogramar después de que ya despejaste el terreno.",
        },
        {
          title: "Una sola empresa, de principio a fin",
          body: "Preparación del terreno, concreto, estructura de acero y limpieza: el mismo equipo, bajo un solo contrato.",
        },
        {
          title: "Hecho para durar más que el contrato",
          body: "Viga roja soldada y tornillos permanentes sobre sustrato Galvalume®: mejoras permanentes a tu propiedad que tus hijos reciben en buen estado.",
        },
        {
          title: "Permanente, no portátil",
          body: "Nada de kits que se aflojan con la primera tormenta de Texas. Cada soldadura y cada anclaje están hechos para el viento que de verdad ve nuestro condado.",
        },
        {
          title: "Precios honestos, sin sorpresas",
          body: "Cotizamos el trabajo completo desde el principio, con concreto si lo necesitas. Sin extras después.",
        },
      ],
    },
    next: {
      label: "Sigue explorando",
      links: [
        { href: "/gallery", label: "Ver obras recientes" },
        { href: "/services", label: "Lo que construimos" },
        { href: "/locations", label: "Dónde trabajamos" },
        { href: "/blog", label: "Guías de nuestro equipo" },
        { href: "/partners", label: "Socios instaladores" },
      ],
    },
    og: {
      alt: "Triple J Metal — una empresa familiar de edificios metálicos en Temple, TX",
      eyebrow: "Temple, TX",
      headline: "La familia local de edificios metálicos de Temple",
      accent: "No una cadena nacional.",
      subhead: (n: string): string => `Empresa familiar local de Temple. ${n} proyectos de edificios metálicos terminados en el centro de Texas.`,
    },
  },
);
