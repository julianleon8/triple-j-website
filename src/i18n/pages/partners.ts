import { bilingual } from "@/i18n/config";

/**
 * /partners copy, both languages. Zero subcontractors and welded-or-bolted
 * stay as the page has always said them; no one is named (Locked Decisions →
 * No names on the site, 2026-10-03).
 */
export const PARTNERS = bilingual(
  {
    meta: {
      title: "B2B Install Partner — GCs & Suppliers",
      description:
        "Triple J is the Central Texas install crew for manufacturers, dealers, and GCs. Welded + bolted, named in-house crew, no subcontractors.",
      ogTitle: "Become a Triple J Install Partner | Triple J Metal",
      ogDescription:
        "B2B install partnership in Central Texas — welded + bolted, no subs, photo-documented. Suppliers, manufacturers, GCs welcome.",
    },
    hero: {
      company: "Company",
      current: "Partners",
      imgAlt: "Triple J Metal crew installing a double carport",
      eyebrow: "For suppliers, manufacturers & GCs",
      h1a: "Your Central Texas",
      h1b: "install crew.",
      lede: "When your customer is in Bell, McLennan, Coryell or Williamson County, we’re the named in-house crew that welds, bolts and hands the building over complete. No kits left in driveways. No subcontractor roulette. Your reputation rides on the install — we treat it that way.",
      inquiry: "Send a Partner Inquiry",
      call: "Call ",
      facts: {
        crew: "Crew",
        crewValue: "In-house",
        crewSub: "Zero subcontractors",
        track: "Track record",
        trackValue: (n: string): string => `${n} projects`,
        trackSub: "Across Central Texas",
        mobilization: "Mobilization",
        mobilizationValue: "Same-week",
        mobilizationSub: "On approval",
        hq: "HQ",
        hqValue: "Temple, TX",
        hqSub: "Full Central TX coverage",
      },
    },
    offer: {
      eyebrow: "What we offer partners",
      line1: "The install crew you’d build if you could.",
      lede: "Built around what suppliers and GCs ask for and rarely get from install subs. No black-box scheduling. No phantom subcontractors. No dodged calls when something goes sideways.",
      items: [
        {
          title: "Photo-documented installs",
          body: "Every job photographed front-to-back. You get the full gallery to show your customer, post on social, or use in your own marketing — unbranded if you prefer.",
        },
        {
          title: "Welded + bolted construction",
          body: "Our welded builds are welded and bolted: the crew bolts everything to hold the geometry, then welds. The bolts stay, sealed with rubber gaskets — redundant anchoring, no leaks, fewer warranty claims downstream.",
        },
        {
          title: "No subcontractors",
          body: "Every weld, bolt and panel goes up under the owners themselves, never a hired-out crew. When something needs answering on-site, the person who can answer is on-site.",
        },
        {
          title: "Bilingual on every job",
          body: "English and Spanish on every site, from the quote to the final weld. Critical when your customers include Hispanic landowners, ranchers or commercial buyers.",
        },
      ],
    },
    featured: {
      eyebrow: "Featured builds",
      line1: "The work, documented.",
      gallery: "Full gallery →",
    },
    inquire: {
      eyebrow: "Inquire",
      line1: "Tell us about",
      line2: "your business.",
      lede: "A few quick fields. An owner reads every one personally and reaches back within one business day.",
      skipTitle: "Rather skip the form?",
      skipBody: "Call or email us directly — the same person who reads the responses.",
      email: "Email us",
      newIntro: "New to Triple J? See ",
      services: "what we install",
      sepA: ", ",
      locations: "where we work",
      sepB: ", or ",
      about: "meet the crew",
      end: ".",
    },
    og: {
      alt: "Triple J Metal — Central Texas installation partner for suppliers and GCs",
      eyebrow: "B2B Partners",
      headline: "Looking for a Central Texas Installation Partner?",
      subhead:
        "B2B install partnership in Central Texas — welded + bolted, no subs, photo-documented. Suppliers, manufacturers, GCs welcome.",
    },
  },
  {
    meta: {
      title: "Socio de instalación B2B — contratistas generales y proveedores",
      description:
        "Triple J es el equipo de instalación del centro de Texas para fabricantes, distribuidores y contratistas generales. Soldado + atornillado, equipo propio y con la cara visible, sin subcontratistas.",
      ogTitle: "Hazte socio instalador de Triple J | Triple J Metal",
      ogDescription:
        "Alianza de instalación B2B en el centro de Texas: soldado + atornillado, sin subcontratistas, documentado con fotos. Proveedores, fabricantes y contratistas generales, bienvenidos.",
    },
    hero: {
      company: "Empresa",
      current: "Socios",
      imgAlt: "Equipo de Triple J Metal instalando una cochera doble",
      eyebrow: "Para proveedores, fabricantes y contratistas generales",
      h1a: "Tu equipo de instalación",
      h1b: "en el centro de Texas.",
      lede: "Cuando tu cliente está en el condado de Bell, McLennan, Coryell o Williamson, somos el equipo propio que da la cara: soldamos, atornillamos y entregamos el edificio completo. Sin kits abandonados en una entrada. Sin ruleta de subcontratistas. Tu reputación depende de la instalación, y así la tratamos.",
      inquiry: "Enviar solicitud de socio",
      call: "Llamar al ",
      facts: {
        crew: "Equipo",
        crewValue: "Propio",
        crewSub: "Cero subcontratistas",
        track: "Trayectoria",
        trackValue: (n: string): string => `${n} proyectos`,
        trackSub: "En todo el centro de Texas",
        mobilization: "Arranque",
        mobilizationValue: "En la misma semana",
        mobilizationSub: "Con aprobación",
        hq: "Sede",
        hqValue: "Temple, TX",
        hqSub: "Cobertura en todo el centro de Texas",
      },
    },
    offer: {
      eyebrow: "Lo que ofrecemos a socios",
      line1: "El equipo de instalación que armarías tú, si pudieras.",
      lede: "Hecho a partir de lo que piden proveedores y contratistas generales, y rara vez reciben de quienes instalan. Sin calendarios opacos. Sin subcontratistas fantasma. Sin llamadas esquivadas cuando algo sale mal.",
      items: [
        {
          title: "Instalaciones documentadas con fotos",
          body: "Cada trabajo se fotografía de principio a fin. Recibes la galería completa para enseñársela a tu cliente, publicarla en redes o usarla en tu propio marketing, sin nuestra marca si lo prefieres.",
        },
        {
          title: "Construcción soldada + atornillada",
          body: "Nuestras obras soldadas van soldadas y atornilladas: el equipo atornilla todo para fijar la geometría y después suelda. Los tornillos se quedan, sellados con empaques de hule: anclaje redundante, sin goteras y menos reclamos de garantía más adelante.",
        },
        {
          title: "Sin subcontratistas",
          body: "Cada soldadura, tornillo y panel se instala bajo los propios dueños, nunca con una cuadrilla contratada aparte. Cuando hay algo que resolver en la obra, la persona que puede resolverlo está ahí.",
        },
        {
          title: "Bilingües en cada obra",
          body: "Inglés y español en cada obra, de la cotización a la última soldadura. Clave cuando tus clientes incluyen dueños de terrenos, ganaderos o compradores comerciales hispanos.",
        },
      ],
    },
    featured: {
      eyebrow: "Obras destacadas",
      line1: "El trabajo, documentado.",
      gallery: "Galería completa →",
    },
    inquire: {
      eyebrow: "Solicitud",
      line1: "Cuéntanos de",
      line2: "tu negocio.",
      lede: "Unos cuantos campos rápidos. Un dueño lee cada solicitud personalmente y te responde en un día hábil.",
      skipTitle: "¿Prefieres saltarte el formulario?",
      skipBody: "Llámanos o escríbenos directo: te contesta la misma persona que lee las solicitudes.",
      email: "Escríbenos",
      newIntro: "¿Primera vez con Triple J? Mira ",
      services: "lo que instalamos",
      sepA: ", ",
      locations: "dónde trabajamos",
      sepB: " o ",
      about: "conoce al equipo",
      end: ".",
    },
    og: {
      alt: "Triple J Metal — socio de instalación en el centro de Texas para proveedores y contratistas generales",
      eyebrow: "Socios B2B",
      headline: "¿Buscas un socio de instalación en el centro de Texas?",
      subhead:
        "Alianza de instalación B2B en el centro de Texas: soldado + atornillado, sin subcontratistas, documentado con fotos. Proveedores, fabricantes y contratistas generales, bienvenidos.",
    },
  },
);
