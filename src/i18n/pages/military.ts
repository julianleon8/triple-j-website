import { bilingual } from "@/i18n/config";

/**
 * /military copy, both languages. The English is what shipped before the
 * Spanish site; the Spanish carries the same numbers and claims (Locked
 * Decisions → Spanish site, 2026-10-03). Same-week, never "48 horas"; permits
 * are advisory; concrete is "disponible"; no names.
 */
export const MILITARY = bilingual(
  {
    meta: {
      // The root layout's `%s | Triple J Metal` template adds the brand — never
      // put it in this string too.
      title: "Fort Cavazos Carports & Metal Buildings",
      description:
        "Welded or bolted carports, RV covers and garages for Fort Cavazos families. Same-week installs near Killeen and Harker Heights. 7% military discount.",
      ogTitle: "Fort Cavazos Carports — Same-Week Installs for PCS Families",
      ogDescription:
        "Local Temple-based crew. Welded or bolted carports + RV covers + garages built around PCS timelines. 7% military discount. Hablamos español.",
      twitterTitle: "Fort Cavazos Carports — Same-Week Installs for PCS Families",
      twitterDescription:
        "7% military discount. Same-week welded or bolted carports, RV covers, and garages around PCS timelines. Hablamos español.",
    },
    og: {
      alt: "Triple J Metal — Fort Cavazos Carports & Same-Week PCS Installs",
      pill: "Fort Cavazos",
      h1a: "Fort Cavazos carports.",
      h1b: "Same-week for PCS families.",
      subhead: "Welded or bolted. Concrete available. 7% military discount honored. Hablamos español.",
    },
    jsonLd: {
      serviceName: "Fort Cavazos PCS Metal Building Installation",
      serviceDescription:
        "Welded or bolted carports, RV covers, and garages installed within PCS timelines for Fort Cavazos active-duty, retired, Reserve/Guard, and first-responder families across the Killeen / Harker Heights catchment.",
      serviceType: "Metal building installation for military families",
      offerName: (pct: number): string => `${pct}% Fort Cavazos military and first-responder discount`,
      eligible: ["Active-duty military", "Retired military", "Reserve/Guard", "First responders"],
      catalogName: "Fort Cavazos services",
      offers: {
        welded: "Welded metal carports",
        bolted: "Bolted metal carports",
        rv: "RV and boat covers",
        garages: "Metal garages",
        turnkey: "Turnkey carports with concrete",
      },
      availableLanguage: ["English", "Spanish"],
      pageName: "Fort Cavazos Carports — Same-Week Installs for PCS Families",
      pageDescription:
        "Welded or bolted carports, RV covers, and garages built around PCS timelines for Fort Cavazos military families. 7% military discount.",
      breadcrumb: "Fort Cavazos Military",
      stateSuffix: "Texas",
      cityState: (name: string): string => `${name}, TX`,
      /** County names as the schema node prints them (the data says "Bell County"). */
      counties: { "Bell County": "Bell County", "Coryell County": "Coryell County" } as Record<string, string>,
    },
    hero: {
      imgAlt: "Welded metal carport over a pickup truck near Fort Cavazos, Texas",
      company: "Military",
      current: "Fort Cavazos",
      badge: "Fort Cavazos",
      badgePct: (pct: number): string => `${pct}% military discount honored`,
      h1a: "Fort Cavazos carports.",
      h1b: "Same-week for PCS families.",
      lede: "Welded or bolted carports, RV covers and garages built around your orders, with same-week scheduling. Local Temple crew, 30 min from Killeen. Hablamos español.",
      cta: "Get my PCS quote",
      call: "Call",
      eligible: "Active-duty · Retired · Reserve/Guard · First responders — all eligible.",
    },
    pcs: {
      eyebrow: "Same-week scheduling",
      line1: "PCS orders don’t wait.",
      line2: "Neither do we.",
      p1: "Wait in a long build queue and your household goods show up first. The truck’s sat through a Texas summer, and the spouse is improvising shade with a tarp.",
      p2: "We’re a local Temple crew, 30 minutes from Killeen. Most installs land within a week of approval — concrete poured the same week, structure built the next. Built around the PCS calendar, not a franchise wait list.",
    },
    discount: {
      eyebrow: "Off every install",
      title: "Fort Cavazos military discount",
      who: "For active-duty, retired, Reserve/Guard and first responders.",
      items: [
        "Welded, bolted and turnkey-with-concrete builds",
        "RV covers, boat covers and enclosed garages",
        "Verified by service ID, military email or DD-214",
      ],
    },
    scenarios: {
      eyebrow: "PCS scenarios we build for",
      line1: "Every PCS season since we opened.",
      items: [
        {
          eyebrow: "Pre-deployment",
          title: "Protect the truck before you ship out.",
          body: "A welded carport installed before your deployment date, so the truck doesn’t sit in Texas sun and hail for 9 to 12 months.",
        },
        {
          eyebrow: "TDY-friendly",
          title: "Cover the spouse’s vehicle during TDY.",
          body: "A quick-install bolted carport sized for the daily driver. We coordinate build week with the household, not the deployment cycle.",
        },
        {
          eyebrow: "Overseas tour",
          title: "RV or boat storage for a 2–3 year tour.",
          body: "A welded RV cover or enclosed garage so the toys ride out the tour under steel — not a tarp that fails in a Bell County hailstorm.",
        },
      ],
    },
    catchment: {
      eyebrow: "Where we build",
      line1: "Every city in the Cavazos catchment.",
      lede: "Killeen and Harker Heights are our highest-volume military markets. We also build for Cavazos families across Bell County and into Coryell County.",
    },
    timeline: {
      eyebrow: "On a military timeline",
      line1: "Quote to keys,",
      line2: "built around your orders.",
      // Step 1 keeps the locked response promise ("within 24 hours"); same-day
      // wording belongs to /quote only.
      steps: [
        {
          title: "Callback within 24 hours",
          body: (phone: string): string =>
            `Call ${phone} or send a quote request. We get back to you within 24 hours.`,
        },
        {
          title: "Site visit or video walk-through",
          body: (_phone: string): string =>
            "On-site at your home or rental — or a video walk-through if you’re still PCSing in. We measure, talk size, style and concrete, and email the quote that day.",
        },
        {
          title: "Build week around your orders",
          body: (_phone: string): string =>
            "Most installs land same-week to the week after — built around PCS arrivals, deployment dates and TDY blocks. We don’t overpromise, and we don’t disappear.",
        },
      ],
    },
    spanish: {
      eyebrow: "Hablamos español",
      line1: "A bilingual crew for a multilingual post.",
      body: "Military families come from every background. Our crew runs quotes, site visits and the build itself in Spanish or English — no language barrier between you and the people building your structure.",
      moreEyebrow: "More for Cavazos families",
      links: [
        { href: "/blog/fort-cavazos-pcs-metal-carport", label: "How military families get a metal carport on military timelines" },
        { href: "/locations/killeen", label: "Metal carports in Killeen, TX" },
        { href: "/locations/harker-heights", label: "Metal carports in Harker Heights, TX" },
        { href: "/blog/bell-county-metal-building-permit-guide", label: "Bell County permit guide (Killeen + Harker Heights)" },
      ],
    },
  },
  {
    meta: {
      title: "Cocheras y edificios metálicos para Fort Cavazos",
      description:
        "Cocheras soldadas o atornilladas, cubiertas para RV y garajes para familias de Fort Cavazos. Instalación en la misma semana cerca de Killeen y Harker Heights. 7% de descuento militar.",
      ogTitle: "Cocheras en Fort Cavazos — instalación en la misma semana para familias en PCS",
      ogDescription:
        "Equipo local con base en Temple. Cocheras soldadas o atornilladas, cubiertas para RV y garajes, construidos según los tiempos de tu PCS. 7% de descuento militar. Hablamos español.",
      twitterTitle: "Cocheras en Fort Cavazos — instalación en la misma semana para familias en PCS",
      twitterDescription:
        "7% de descuento militar. Cocheras soldadas o atornilladas, cubiertas para RV y garajes en la misma semana, según los tiempos de tu PCS. Hablamos español.",
    },
    og: {
      alt: "Triple J Metal — Cocheras en Fort Cavazos e instalaciones de PCS en la misma semana",
      pill: "Fort Cavazos",
      h1a: "Cocheras en Fort Cavazos.",
      h1b: "Misma semana para tu PCS.",
      subhead: "Soldadas o atornilladas. Concreto disponible. Honramos el descuento militar del 7%. Hablamos español.",
    },
    jsonLd: {
      serviceName: "Instalación de edificios metálicos para PCS en Fort Cavazos",
      serviceDescription:
        "Cocheras soldadas o atornilladas, cubiertas para RV y garajes instalados dentro de los tiempos de PCS para familias de Fort Cavazos en servicio activo, retiradas, de la Reserva/Guardia Nacional y de primeros respondientes, en toda la zona de Killeen / Harker Heights.",
      serviceType: "Instalación de edificios metálicos para familias militares",
      offerName: (pct: number): string => `${pct}% de descuento militar y para primeros respondientes de Fort Cavazos`,
      eligible: [
        "Militares en servicio activo",
        "Militares retirados",
        "Reserva/Guardia Nacional",
        "Primeros respondientes",
      ],
      catalogName: "Servicios para Fort Cavazos",
      offers: {
        welded: "Cocheras metálicas soldadas",
        bolted: "Cocheras metálicas atornilladas",
        rv: "Cubiertas para RV y lancha",
        garages: "Garajes metálicos",
        turnkey: "Cocheras llave en mano con concreto",
      },
      availableLanguage: ["English", "Spanish"],
      pageName: "Cocheras en Fort Cavazos — instalación en la misma semana para familias en PCS",
      pageDescription:
        "Cocheras soldadas o atornilladas, cubiertas para RV y garajes construidos según los tiempos de PCS para familias militares de Fort Cavazos. 7% de descuento militar.",
      breadcrumb: "Militares de Fort Cavazos",
      stateSuffix: "Texas",
      cityState: (name: string): string => `${name}, TX`,
      counties: { "Bell County": "Condado de Bell", "Coryell County": "Condado de Coryell" },
    },
    hero: {
      imgAlt: "Cochera metálica soldada sobre una camioneta cerca de Fort Cavazos, Texas",
      company: "Militares",
      current: "Fort Cavazos",
      badge: "Fort Cavazos",
      badgePct: (pct: number): string => `Honramos el descuento militar del ${pct}%`,
      h1a: "Cocheras en Fort Cavazos.",
      h1b: "Misma semana para tu PCS.",
      lede: "Cocheras soldadas o atornilladas, cubiertas para RV y garajes construidos según tus órdenes, con programación en la misma semana. Equipo local de Temple, a 30 min de Killeen. Hablamos español.",
      cta: "Quiero mi cotización para PCS",
      call: "Llama al",
      eligible: "Servicio activo · Retirados · Reserva/Guardia Nacional · Primeros respondientes — todos califican.",
    },
    pcs: {
      eyebrow: "Programación en la misma semana",
      line1: "Las órdenes de PCS no esperan.",
      line2: "Nosotros tampoco.",
      p1: "Si te toca esperar en una fila larga de construcción, tu mudanza llega primero. La camioneta ya aguantó un verano de Texas a la intemperie, y tu cónyuge está improvisando sombra con una lona.",
      p2: "Somos un equipo local de Temple, a 30 minutos de Killeen. La mayoría de las instalaciones se hacen dentro de una semana después de la aprobación — el concreto se cuela esa misma semana y la estructura se arma la siguiente. Todo gira alrededor del calendario de tu PCS, no de una lista de espera de franquicia.",
    },
    discount: {
      eyebrow: "De descuento en cada instalación",
      title: "Descuento militar de Fort Cavazos",
      who: "Para militares en servicio activo, retirados, de la Reserva/Guardia Nacional y primeros respondientes.",
      items: [
        "Construcciones soldadas, atornilladas y llave en mano con concreto",
        "Cubiertas para RV y lancha, y garajes cerrados",
        "Se verifica con tu identificación militar, correo militar o DD-214",
      ],
    },
    scenarios: {
      eyebrow: "Situaciones de PCS para las que construimos",
      line1: "Cada temporada de PCS desde que abrimos.",
      items: [
        {
          eyebrow: "Antes del despliegue",
          title: "Protege la camioneta antes de partir.",
          body: "Una cochera soldada instalada antes de tu fecha de despliegue, para que la camioneta no se quede de 9 a 12 meses bajo el sol y el granizo de Texas.",
        },
        {
          eyebrow: "Pensado para TDY",
          title: "Cubre el vehículo de tu cónyuge durante el TDY.",
          body: "Una cochera atornillada de instalación rápida, del tamaño justo para el vehículo de diario. Coordinamos la semana de construcción con tu hogar, no con el ciclo de despliegue.",
        },
        {
          eyebrow: "Destino en el extranjero",
          title: "Resguardo para RV o lancha durante un destino de 2–3 años.",
          body: "Una cubierta para RV soldada o un garaje cerrado para que tus juguetes aguanten el destino bajo acero — no una lona que falla en una tormenta de granizo del condado de Bell.",
        },
      ],
    },
    catchment: {
      eyebrow: "Dónde construimos",
      line1: "Todas las ciudades de la zona de Cavazos.",
      lede: "Killeen y Harker Heights son nuestros mercados militares de mayor volumen. También construimos para familias de Cavazos en todo el condado de Bell y hasta el condado de Coryell.",
    },
    timeline: {
      eyebrow: "Con tiempos militares",
      line1: "De la cotización a las llaves,",
      line2: "según tus órdenes.",
      steps: [
        {
          title: "Te llamamos dentro de 24 horas",
          body: (phone: string): string =>
            `Llama al ${phone} o envía una solicitud de cotización. Te respondemos dentro de 24 horas.`,
        },
        {
          title: "Visita al sitio o recorrido por video",
          body: (_phone: string): string =>
            "Vamos a tu casa o a la que rentas — o hacemos un recorrido por video si todavía estás llegando por tu PCS. Medimos, hablamos de tamaño, estilo y concreto, y te enviamos la cotización por correo ese mismo día.",
        },
        {
          title: "Semana de construcción según tus órdenes",
          body: (_phone: string): string =>
            "La mayoría de las instalaciones se hacen en la misma semana o la siguiente — alrededor de tus llegadas por PCS, fechas de despliegue y periodos de TDY. No prometemos de más, y no desaparecemos.",
        },
      ],
    },
    spanish: {
      eyebrow: "Hablamos español",
      line1: "Un equipo bilingüe para una base multilingüe.",
      body: "Las familias militares vienen de todos los orígenes. Nuestro equipo maneja las cotizaciones, las visitas al sitio y la construcción misma en español o en inglés — sin barrera de idioma entre tú y la gente que construye tu estructura.",
      moreEyebrow: "Más para familias de Cavazos",
      links: [
        { href: "/blog/fort-cavazos-pcs-metal-carport", label: "Temporada de PCS en Fort Cavazos: cómo las familias militares consiguen una cochera metálica a tiempo" },
        { href: "/locations/killeen", label: "Cocheras metálicas en Killeen, TX" },
        { href: "/locations/harker-heights", label: "Cocheras metálicas en Harker Heights, TX" },
        { href: "/blog/bell-county-metal-building-permit-guide", label: "Guía de permisos del condado de Bell (Killeen + Harker Heights)" },
      ],
    },
  },
);
