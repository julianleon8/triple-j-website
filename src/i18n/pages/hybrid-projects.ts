import { bilingual } from '@/i18n/config'

/** `/services/hybrid-projects` and `/es/servicios/proyectos-hibridos`. */
export const HYBRID_PAGE = bilingual(
  {
    meta: {
      title: 'Hybrid Projects — Stalls, Warehouses, Decks',
      description:
        "Triple J builds projects that don't fit a catalog — horse stalls, warehouses, decks, custom commercial. Welded + bolted, Central Texas crew.",
      ogTitle: 'Hybrid Projects | Triple J Metal',
      ogDescription:
        'Custom horse stalls, warehouses, decks, and one-off metal builds across Central Texas. Welded + bolted, on-site, no kits.',
    },
    breadcrumbs: { services: 'Services', hybrid: 'Hybrid Projects' },
    hero: {
      eyebrow: 'Custom & Commercial',
      h1a: 'Hybrid Projects',
      h1b: 'Beyond the Standard Catalog',
      lede: "Horse stalls, all-black warehouses, decks, hybrid stables, custom commercial. The builds that don't fit a clean carport or garage spec — but that we engineer, weld, bolt, and hand over complete just the same. Same Temple crew. Same on-site construction.",
      quote: 'Get a Custom Quote',
      call: 'Call',
    },
    grid: {
      heading: 'Recent Hybrid Builds',
      all: 'See all projects →',
      emptyTitle: 'Hybrid project photos coming soon.',
      emptyBody:
        "We're prepping a fresh set of horse stalls, warehouses, and custom builds for this page. Call us in the meantime — we can walk you through past hybrid jobs over the phone or show photos from a recent build.",
      emptyCta: 'Talk About Your Project',
      featured: 'Featured',
    },
    /** The panel/trim line under a build: `describeGalleryColors` resolves the names, these words are ours. */
    colorLabel: {
      panels: (name: string): string => `${name} panels`,
      trim: (name: string): string => `${name} trim`,
      both: (panel: string, trim: string): string => `${panel} panels · ${trim} trim`,
    },
    mean: {
      eyebrow: 'What we mean by "Hybrid"',
      heading: "Anything that isn't a standard kit.",
      p1: 'Most of what we build fits a clean category — a 30×40 carport, a barn, an RV cover, a metal garage. But a real chunk of our work is custom: a horse stall layout the owner sketched on a napkin, an all-black warehouse for a body shop, a deck-and-cover combo behind a ranch house, a workshop that needs both a slab and a loft.',
      p2: "We don't subcontract these. The same welder-owners who build the standard projects are the ones engineering and erecting the hybrids — the foreman on the iron, a second welder beside him, and the supply chain run by the family.",
      types: [
        { title: 'Horse Stalls', desc: 'Custom stall layouts, hybrid stables, run-in shelters with tack rooms.' },
        { title: 'Commercial Warehouses', desc: 'All-black exteriors, roll-ups, lean-tos for shop/storage hybrids.' },
        { title: 'Decks & Patios', desc: 'Metal-framed decks, patio covers tied into existing roofs, custom porches.' },
        { title: 'One-Off Custom', desc: 'Whatever you sketched. We engineer it, weld it, bolt it, hand it over.' },
      ],
    },
    how: {
      eyebrow: 'How we actually build',
      heading: 'Every welded structure is reinforced with permanent bolts.',
      // p1 has two emphasised words: before <em>or</em> mid <em>and</em> after.
      p1: {
        before: "Most contractors will tell you it's welded ",
        or: 'or',
        mid: ' bolted. The reality at Triple J is more honest: every welded build is welded ',
        and: 'and',
        after:
          " bolted. To weld red iron on-site, the crew first bolts everything together so it's sturdy and held in the correct position — then the welds happen. The bolts stay in (rubber gaskets keep the connections sealed) so what you get is a structure with both the rigid permanence of welded connections and the redundancy of mechanical fasteners.",
      },
      p2: "That matters most on hybrid projects, because the geometry is rarely off-the-shelf. Custom horse stalls have non-standard spans. Commercial warehouses might combine clear-span trusses with offset purlin patterns. A deck-and-cover combo ties a new metal frame into an existing structure. The bolt-then-weld sequence lets us hold the geometry exactly while the welds set, and leaves you with both anchoring methods when we're done.",
    },
    cta: {
      line1: 'Got something unusual?',
      line2: "Let's talk.",
      lede: "Tell us what you're picturing. We'll come out, take measurements, and send you a fixed quote — no kit upcharges, no subcontractor markups.",
    },
    og: {
      alt: 'Triple J Metal — custom hybrid metal builds in Central Texas',
      eyebrow: 'Custom Builds',
      headline: 'Hybrid Projects',
      accent: 'Beyond the Standard Catalog.',
      subhead:
        'Custom horse stalls, warehouses, decks, and one-off metal builds across Central Texas. Welded + bolted, on-site, no kits.',
    },
  },
  {
    meta: {
      title: 'Proyectos híbridos: establos, bodegas, decks',
      description:
        'Triple J construye lo que no cabe en un catálogo: establos para caballos, bodegas, decks y obras comerciales. Soldado + atornillado, equipo local.',
      ogTitle: 'Proyectos híbridos | Triple J Metal',
      ogDescription:
        'Establos para caballos, bodegas, decks y obras metálicas únicas a la medida en el centro de Texas. Soldado + atornillado, en sitio, sin kits.',
    },
    breadcrumbs: { services: 'Servicios', hybrid: 'Proyectos híbridos' },
    hero: {
      eyebrow: 'A la medida y comercial',
      h1a: 'Proyectos híbridos',
      h1b: 'Más allá del catálogo estándar',
      lede: 'Establos para caballos, bodegas todas negras, decks, caballerizas híbridas, obras comerciales a la medida. Las obras que no encajan en una especificación limpia de cochera o garaje — pero que igual diseñamos, soldamos, atornillamos y entregamos completas. El mismo equipo de Temple. La misma construcción en sitio.',
      quote: 'Cotización a la medida',
      call: 'Llamar al',
    },
    grid: {
      heading: 'Obras híbridas recientes',
      all: 'Ver todos los proyectos →',
      emptyTitle: 'Pronto habrá fotos de proyectos híbridos.',
      emptyBody:
        'Estamos preparando una nueva serie de establos, bodegas y obras a la medida para esta página. Llámanos mientras tanto — te platicamos por teléfono de trabajos híbridos anteriores o te mostramos fotos de una obra reciente.',
      emptyCta: 'Platícanos tu proyecto',
      featured: 'Destacado',
    },
    colorLabel: {
      panels: (name: string): string => `Paneles en ${name}`,
      trim: (name: string): string => `Molduras en ${name}`,
      both: (panel: string, trim: string): string => `Paneles en ${panel} · molduras en ${trim}`,
    },
    mean: {
      eyebrow: 'Lo que entendemos por "híbrido"',
      heading: 'Todo lo que no es un kit estándar.',
      p1: 'La mayoría de lo que construimos cabe en una categoría clara — una cochera de 30×40, un granero, una cubierta para RV, un garaje metálico. Pero una buena parte de nuestro trabajo es a la medida: un diseño de establos que el dueño dibujó en una servilleta, una bodega toda negra para un taller de hojalatería y pintura, un deck con cubierta detrás de una casa de rancho, un taller que necesita una losa y un tapanco.',
      p2: 'Estos trabajos no los subcontratamos. Los mismos dueños soldadores que construyen los proyectos estándar son quienes diseñan y levantan los proyectos híbridos — el capataz en el hierro, otro soldador a su lado, y la cadena de suministro a cargo de la familia.',
      types: [
        { title: 'Establos para caballos', desc: 'Distribuciones de establos a la medida, caballerizas híbridas, refugios abiertos con cuarto para monturas.' },
        { title: 'Bodegas comerciales', desc: 'Exteriores todos negros, puertas enrollables y lean-tos para combinaciones de taller y almacén.' },
        { title: 'Decks y patios', desc: 'Decks con estructura metálica, patios techados unidos a techos existentes, porches a la medida.' },
        { title: 'Obras únicas a la medida', desc: 'Lo que hayas dibujado. Lo diseñamos, lo soldamos, lo atornillamos y te lo entregamos.' },
      ],
    },
    how: {
      eyebrow: 'Cómo construimos de verdad',
      heading: 'Toda estructura soldada se refuerza con tornillos permanentes.',
      p1: {
        before: 'La mayoría de los contratistas te dirán que es soldado ',
        or: 'o',
        mid: ' atornillado. La realidad en Triple J es más honesta: toda obra soldada es soldada ',
        and: 'y',
        after:
          ' atornillada. Para soldar viga roja en sitio, el equipo primero atornilla todo para que quede firme y sostenido en la posición correcta — y luego vienen las soldaduras. Los tornillos se quedan (empaques de hule mantienen las conexiones selladas), así que obtienes una estructura con la permanencia rígida de las conexiones soldadas y la redundancia de los sujetadores mecánicos.',
      },
      p2: 'Eso importa más en los proyectos híbridos, porque la geometría casi nunca es de catálogo. Los establos a la medida tienen claros fuera de lo estándar. Las bodegas comerciales pueden combinar armaduras de claro libre con patrones de correas (purlins) desfasados. Un deck con cubierta une un marco metálico nuevo a una estructura existente. La secuencia de atornillar y luego soldar nos permite mantener la geometría exacta mientras las soldaduras se asientan, y te deja los dos métodos de anclaje cuando terminamos.',
    },
    cta: {
      line1: '¿Tienes algo fuera de lo común?',
      line2: 'Platiquemos.',
      lede: 'Cuéntanos lo que tienes en mente. Vamos, tomamos medidas y te mandamos una cotización fija — sin recargos de kit, sin sobreprecios de subcontratistas.',
    },
    og: {
      alt: 'Triple J Metal — obras metálicas híbridas a la medida en el centro de Texas',
      eyebrow: 'Obras a la medida',
      headline: 'Proyectos híbridos',
      accent: 'Más allá del catálogo estándar.',
      subhead:
        'Establos para caballos, bodegas, decks y obras metálicas únicas a la medida en el centro de Texas. Soldado + atornillado, en sitio, sin kits.',
    },
  },
)
