/**
 * Site-wide constants.
 * Single source of truth for company info, nav, services, and service areas.
 * Update here and the whole site follows.
 */

export const SITE = {
  name: "Triple J Metal",
  shortName: "Triple J Metal",
  /**
   * Legal/registered name — use ONLY for:
   *   - footer copyright lines (©)
   *   - schema.org `legalName`
   *   - terms of service / privacy policy body copy
   *   - any other contractual/legal copy
   * Everywhere else (page titles, og:site_name, marketing body copy,
   * alt text, email subject lines, brand displays) should use `name`.
   */
  legalName: "Triple J Metal LLC",
  tagline: "Built right, built fast, built by Triple J.",
  phone: "254-346-7764",
  phoneHref: "tel:+12543467764",
  email: "julianleon@triplejmetaltx.com",
  emailHref: "mailto:julianleon@triplejmetaltx.com",
  address: {
    street: "3319 Tem-Bel Ln",
    city: "Temple",
    state: "TX",
    zip: "76502",
  },
  /**
   * The full address on one line. Prefer this over re-composing from
   * `address.*` at the call site — that concatenation was previously
   * hand-written in a dozen places and had already drifted into two
   * different formats.
   */
  addressOneLine: "3319 Tem-Bel Ln, Temple, TX 76502",
  hours: "Mon–Sat · 8am–6pm",
  established: 2025,
  stats: {
    projects: "150+",
    /** Approved trust copy pairs this with `projects` -- see Website Copy & Messaging. */
    clients: "50+",
  },
  social: {
    instagram: "https://www.instagram.com/triplejmetal/",
    facebook: "https://www.facebook.com/triplejmetaltx",
    google: "", // fill once GBP verifies; goes into sameAs + adds Knowledge Panel signal
  },
} as const;

/** The two `SITE` lines that are words, in Spanish (the /es mirror, 2026-10-03). */
export const SITE_ES = {
  tagline: "Hecho bien, hecho rápido, hecho por Triple J.",
  hours: "Lun–Sáb · 8am–6pm",
} as const;

/**
 * Header nav (Forge, 2026-10-02). "Services" opens the mega menu built from
 * MEGA_SERVICES / MEGA_AREAS below; its href is the no-JS fallback.
 */
export const NAV_LINKS = [
  { href: "/services", label: "Services", es: "Servicios" },
  { href: "/gallery", label: "Gallery", es: "Galería" },
  { href: "/about", label: "About", es: "Nosotros" },
  { href: "/partners", label: "Partners", es: "Socios" },
  { href: "/contact", label: "Contact", es: "Contacto" },
] as const;

/** Footer "Company" column. Blog lives here, not in the header. */
export const COMPANY_LINKS = [
  { href: "/gallery", label: "Gallery", es: "Galería" },
  { href: "/about", label: "About", es: "Nosotros" },
  { href: "/contact", label: "Contact", es: "Contacto" },
  { href: "/blog", label: "Blog", es: "Blog" },
  { href: "/partners", label: "Partners", es: "Socios" },
  { href: "/military", label: "Fort Cavazos Military", es: "Militares de Fort Cavazos" },
  { href: "/best-metal-carport-builders-temple-tx", label: "Compare Builders", es: "Comparar constructores" },
] as const;

/**
 * The three services the mega menu, mobile menu and location pages feature,
 * with their thumbnail. Prices are the sales-pack floor
 * (dev/sales-pack-2026-04-30.md); never improvise one here.
 */
export const MEGA_SERVICES = [
  {
    slug: "carports",
    label: "Carports",
    href: "/services/carports",
    sub: "Welded or bolted · from $3,000",
    es: { label: "Cocheras", sub: "Soldadas o atornilladas · desde $3,000" },
    img: "/images/carport-gable-residential.jpg",
    pos: "50% 50%",
  },
  {
    slug: "metal-fencing",
    label: "Metal Fencing",
    href: "/services/metal-fencing",
    sub: "Privacy, pipe & ranch, ornamental",
    es: { label: "Cercas metálicas", sub: "Privacidad, tubo y rancho, ornamentales" },
    img: "/images/metal-fence-ranch-wire.webp",
    pos: "60% 50%",
  },
  {
    slug: "gates",
    label: "Gates",
    href: "/services/gates",
    sub: "Walk, driveway & ranch entrances",
    es: { label: "Portones", sub: "Peatonales, de entrada y de rancho" },
    img: "/images/metal-fence-ranch-wire.webp",
    pos: "15% 50%",
  },
] as const;

/** "Where we build" rows in the mega and mobile menus. */
export const MEGA_AREAS = [
  { slug: "temple", label: "Temple, TX", href: "/locations/temple", sub: "Home base · 0 mi", es: { sub: "Nuestra sede · 0 mi" } },
  { slug: "belton", label: "Belton, TX", href: "/locations/belton", sub: "10 mi south · 15 min from HQ", es: { sub: "10 mi al sur · 15 min de la sede" } },
] as const;

/** Footer service links — `href` must match a real route. Lean-to patios and house additions have no page of their own (they 301 to `/quote`), so they go straight to the quote page with the chip preselected. */
export const SERVICES = [
  { title: "Carports", es: "Cocheras", href: "/services/carports" },
  { title: "Metal Fencing", es: "Cercas metálicas", href: "/services/metal-fencing" },
  { title: "Gates", es: "Portones", href: "/services/gates" },
  { title: "Metal Garages", es: "Garajes metálicos", href: "/services/metal-garages" },
  { title: "Metal Barns", es: "Graneros metálicos", href: "/services/barns" },
  { title: "RV & Boat Covers", es: "Cubiertas para RV y lanchas", href: "/services/rv-covers" },
  { title: "Lean-To Patios", es: "Patios lean-to", href: "/quote?service=lean-to" },
  { title: "House Additions", es: "Ampliaciones de casa", href: "/quote?service=other" },
] as const;

export const SERVICE_CITIES = [
  { slug: "temple", name: "Temple, TX" },
  { slug: "belton", name: "Belton, TX" },
  { slug: "killeen", name: "Killeen, TX" },
  { slug: "harker-heights", name: "Harker Heights, TX" },
  { slug: "copperas-cove", name: "Copperas Cove, TX" },
  { slug: "waco", name: "Waco, TX" },
  { slug: "georgetown", name: "Georgetown, TX" },
  { slug: "round-rock", name: "Round Rock, TX" },
] as const;
