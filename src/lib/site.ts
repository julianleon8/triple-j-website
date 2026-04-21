/**
 * Site-wide constants.
 * Single source of truth for company info, nav, services, and service areas.
 * Update here and the whole site follows.
 */

export const SITE = {
  name: "Triple J Metal LLC",
  shortName: "Triple J Metal",
  tagline: "Built right, built fast, built by Triple J.",
  phone: "254-346-7764",
  phoneHref: "tel:+12543467764",
  email: "julian@triplejmetaltx.com",
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
    clients: "50+",
  },
  social: {
    facebook: "", // TODO
    google: "", // TODO
  },
} as const;

export const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const SERVICES = [
  {
    slug: "carports",
    title: "Carports",
    blurb: "Welded or bolted red iron carports — built and installed by our crew.",
  },
  {
    slug: "garages",
    title: "Metal Garages",
    blurb: "Fully-enclosed red iron garages, single or multi-bay.",
  },
  {
    slug: "barns",
    title: "Metal Barns",
    blurb: "Ag & ranch barns engineered for Central Texas storms.",
  },
  {
    slug: "rv-covers",
    title: "RV & Boat Covers",
    blurb: "Tall-clearance structures for trailers, RVs, and boats.",
  },
  {
    slug: "lean-to-patios",
    title: "Lean-To Patios",
    blurb: "Steel-framed attached patio covers — any size, welded or bolted.",
  },
  {
    slug: "house-additions",
    title: "House Additions",
    blurb: "Steel-framed additions attached to your existing structure.",
  },
] as const;

export const SERVICE_CITIES = [
  { slug: "temple", name: "Temple, TX" },
  { slug: "belton", name: "Belton, TX" },
  { slug: "killeen", name: "Killeen, TX" },
  { slug: "harker-heights", name: "Harker Heights, TX" },
  { slug: "copperas-cove", name: "Copperas Cove, TX" },
] as const;
