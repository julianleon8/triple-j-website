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
  address: {
    street: "3319 Tem-Bel Ln",
    city: "Temple",
    state: "TX",
    zip: "76502",
  },
  hours: "Mon–Sat · 8am–6pm",
  established: 2025,
  stats: {
    projects: "150+",
  },
  social: {
    instagram: "https://www.instagram.com/triplejmetal/",
    facebook: "https://www.facebook.com/triplejmetaltx",
    google: "", // fill once GBP verifies; goes into sameAs + adds Knowledge Panel signal
  },
} as const;

export const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/partners", label: "Partners" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/** Footer service links — `href` must match a real route (or `/contact` until a dedicated page exists). */
export const SERVICES = [
  { title: "Carports", href: "/services/carports" },
  { title: "Metal Garages", href: "/services/metal-garages" },
  { title: "Metal Barns", href: "/services/barns" },
  { title: "RV & Boat Covers", href: "/services/rv-covers" },
  {
    title: "Lean-To Patios",
    href: "/contact",
  },
  {
    title: "House Additions",
    href: "/contact",
  },
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
