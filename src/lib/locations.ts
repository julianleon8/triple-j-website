
export type MilitarySection = {
  headline: string
  copy: string
  keywords: string[]
}

/**
 * One landmark card in the per-city landmark grid.
 * `imageSrc` is optional — when absent, the card renders as a typography-only
 * card (brand-blue accent + name + blurb) instead of a photo card. This keeps
 * landmark sections useful even before photos are sourced.
 */
export type Landmark = {
  name: string
  blurb: string
  imageSrc?: string
  imageAlt?: string
}

/**
 * Optional standalone callout section that sits between Services and Why-local
 * on a city page. Used for cities with a clear secondary-market angle worth
 * featuring (e.g. Temple's HOA-grade premium residential market). Brand-blue
 * tinted card.
 */
export type CityCallout = {
  /** Small uppercase label above the headline (e.g. "Premium Residential") */
  eyebrow: string
  /** Barlow huge headline */
  headline: string
  /** 1-2 sentence body */
  blurb: string
  /** CTA label (e.g. "See HOA-compliant builds →") */
  ctaLabel: string
  /** CTA href (typically an internal /services/[slug] link) */
  ctaHref: string
}

export type LocationData = {
  // ── Identity / SEO (existing, all required) ───────────────────────────────
  slug: string
  name: string
  county: string
  zip: string
  lat: number
  lng: number
  metaTitle: string
  metaDescription: string

  // ── Legacy copy fields (still required; used as fallbacks when new
  //    personalization fields below aren't populated for a city) ────────────
  heroHeadline: string
  heroCopy: string
  areaContext: string
  whyLocal: string
  services: string[]
  military?: MilitarySection   // Killeen + Harker Heights only

  // ── NEW per-city personalization (all optional) ───────────────────────────
  /** Hero background photo path (preferably city landmark). Falls back to
   *  a generic Triple J industrial photo when absent. */
  heroImage?: string
  heroImageAlt?: string
  /** Per-city custom two-line headline. line2 renders in brand-blue.
   *  Overrides `heroHeadline` when present. */
  customHeadline?: { line1: string; line2: string }
  /** 1-2 sentence subhead under the headline. Falls back to `heroCopy`
   *  when absent. */
  heroSubhead?: string
  /** Driving distance + time from Temple HQ — e.g. "25 mi · 30 min".
   *  Featured as a hero stat. */
  distanceFromTemple?: string
  /** Show the 'Hablamos español' chip in the hero alongside the county pill.
   *  Used for cities with bilingual demand (Killeen, etc.). */
  habla?: boolean
  /** Local intro paragraph shown directly under the hero, before landmarks.
   *  More personal than `areaContext`. */
  localIntro?: string
  /** Up to 3 city landmarks for the landmark card grid. Section is skipped
   *  entirely when absent. */
  landmarks?: Landmark[]
  /** Neighborhood names for the 'Where We Build' chip grid. */
  neighborhoods?: string[]
  /** Top 3 service slugs to feature in the per-city services mini-grid.
   *  References slugs in `src/lib/services.ts`. */
  topServices?: string[]
  /** 4 punchy bullets for the dark-editorial 'Why Triple J in {city}' section.
   *  At least one bullet should weave in soil/climate authority. */
  whyLocalBullets?: string[]
  /** Optional standalone callout sections between Services and Why-local.
   *  Use for secondary-market angles worth featuring (HOA-grade for Temple,
   *  Permit Advisory + Ranch/Ag for Belton, etc.). Multiple callouts stack
   *  vertically in array order. */
  callouts?: CityCallout[]
  /** Blog post slugs to feature in the inline 'Further Reading' callout.
   *  Up to 3 render. Omit or leave empty to suppress the section. */
  relatedPosts?: string[]
  localSource?: { label: string; url: string }
}

export const LOCATIONS: Record<string, LocationData> = {
  'harker-heights': {
    slug: 'harker-heights',
    heroImageAlt: 'Red iron framing on a Triple J Metal construction site in Central Texas',
    name: 'Harker Heights',
    county: 'Bell County',
    zip: '76548',
    lat: 31.0804,
    lng: -97.6477,
    metaTitle: 'Metal Carports in Harker Heights, TX',
    metaDescription:
      'Welded or bolted carports, garages and RV covers in Harker Heights, TX. Temple-based crew, concrete available, 7% Fort Cavazos military discount.',
    heroHeadline: 'Metal Carports & Buildings in Harker Heights, TX',
    heroCopy:
      "Plan a carport, garage, or RV cover with our Temple-based crew. Tell us your dimensions and timing; we’ll confirm the design, scope, and schedule for your property.",
    areaContext:
      "Harker Heights sits on US-190 just east of Killeen. Pinckney R. Cox and Harley Kern began selling lots here in 1957, and the city, named for Kern, incorporated in 1960. Many residents work at Fort Cavazos or in Killeen. We take project inquiries for covered parking, RV and boat storage, and garages across Harker Heights.",
    whyLocal:
      "Work directly with our Temple-based crew on your Harker Heights project: welded or bolted red iron, English and Spanish communication, and concrete available in the same contract.",
    services: [
      'Welded or bolted carports',
      'Metal garages',
      'RV and boat covers',
      'Lean-to patios',
      'Metal fencing and gates',
      'Site prep and separately priced concrete',
    ],
    military: {
      headline: 'Fort Cavazos Military Discount — Harker Heights',
      copy: "Fort Cavazos is next door, and a PCS move rarely leaves much time. Triple J Metal builds RV covers, carports, and garages with same-week scheduling, and offers a 7% Fort Cavazos military and first-responder discount. Mention your service when you call, or check the military box on the quote form.",
      keywords: ['Fort Cavazos carport', 'military carport Harker Heights', 'PCS vehicle protection Bell County'],
    },
    customHeadline: {
      line1: 'Built for Harker Heights.',
      line2: 'Covered parking, garages and RV storage.',
    },
    heroSubhead:
      "Plan a carport, garage, or RV cover with our Temple-based crew. Tell us your dimensions and timing; we’ll confirm the design, scope, and schedule for your property.",
    localIntro:
      "Harker Heights sits on US-190 just east of Killeen. Pinckney R. Cox and Harley Kern began selling lots here in 1957, and the city, named for Kern, incorporated in 1960. Many residents work at Fort Cavazos or in Killeen. We take project inquiries for covered parking, RV and boat storage, and garages across Harker Heights.",
    habla: true,
    topServices: ['carports', 'rv-covers', 'metal-garages'],
    landmarks: [
      {
        name: 'Stillhouse Hollow Lake',
        blurb:
          "Harker Heights residents have Stillhouse Hollow Lake close by, and boats, trailers and RVs need covered storage. Tell us the length and height of what you’re parking and we’ll size the clearance to it.",
      },
    ],
    whyLocalBullets: [
      'Bring the length and height of the vehicles, boats, or trailers you need to cover.',
      'Welded or bolted red iron — your choice, priced in a written scope.',
      'Site conditions and drainage guide the foundation discussion; concrete is available in the same contract.',
      'Our Temple-based team can discuss the project in English or Spanish.',
    ],
    callouts: [
      {
        eyebrow: 'Fort Cavazos PCS',
        headline: '7% military discount + same-week scheduling.',
        blurb:
          "Active-duty, retired, Reserve/Guard, and first responders get 7% off every install — welded, bolted, or turnkey. Tell us your report date and we’ll plan the build week around it. Hablamos español.",
        ctaLabel: 'See Fort Cavazos page',
        ctaHref: '/military',
      },
    ],
    relatedPosts: [
      'fort-cavazos-pcs-metal-carport',
      'bell-county-metal-building-permit-guide-2025',
      'hoa-compliant-metal-buildings-heritage-oaks-bella-charca',
    ],
    localSource: {
      label: 'Harker Heights history (Handbook of Texas)',
      url: 'https://www.tshaonline.org/handbook/entries/harker-heights-tx',
    },
  },

  killeen: {
    slug: 'killeen',
    name: 'Killeen',
    county: 'Bell County',
    zip: '76541',
    lat: 31.1171,
    lng: -97.7278,
    metaTitle: 'Metal Carports Killeen TX | Fort Cavazos',
    metaDescription:
      "Welded or bolted carports, RV covers and garages in Killeen, built same-week around Fort Cavazos PCS timelines. Concrete available. Hablamos español.",
    // Legacy fallbacks (used if new fields below aren't populated)
    heroHeadline: "Built in Killeen. Built for Fort Cavazos.",
    heroCopy:
      "Triple J Metal builds welded or bolted carports, garages, and RV covers in Killeen. Our Temple-based crew can include site preparation and a separately priced concrete pad in the same contract. Share your project and preferred timing for a quote.",
    areaContext:
      "We serve all of Killeen, including areas near Fort Cavazos, Killeen-Fort Hood Regional Airport, Rosewood Heights, Westcliff, and the US-190 corridor into Copperas Cove. Rural properties welcome.",
    whyLocal:
      "Work directly with our Temple-based crew on your Killeen project. We offer welded or bolted red iron, English and Spanish communication, and concrete available in the same contract.",
    services: [
      'Welded or bolted red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'Lean-to patios',
      'House additions',
    ],
    military: {
      headline: 'Fort Cavazos Timelines — Built In',
      copy: "Fort Cavazos drives a constant flow of PCS moves through Killeen. Military families arrive on short notice and need vehicle protection fast. Triple J Metal builds RV covers and carports same-week and honors a 7% Fort Cavazos military and first-responder discount. We speak the language: BAH, VA loans, PCS timelines, base-area HOA rules.",
      keywords: ['turnkey carports Killeen', 'carports Fort Cavazos', 'military carport Killeen TX'],
    },

    // ── NEW personalization (military-first per 2026-04-23 design pass) ──
    heroImage: '/images/locations/killeen/fort-cavazos.jpg',
    heroImageAlt: 'Fort Cavazos main gate near Killeen, Texas',
    customHeadline: {
      line1: 'Built in Killeen.',
      line2: 'Built for Fort Cavazos.',
    },
    heroSubhead:
      "PCS orders don't wait, and we don't either. Welded carports, RV covers, and garages built same-week across Killeen — from arriving families to retiring veterans.",
    distanceFromTemple: '25 mi southwest · 30 min from HQ',
    habla: true,
    localIntro:
      "Killeen runs on Fort Cavazos. PCS season hits, hail season hits, and military families need vehicles and equipment under cover before household goods arrive. Triple J Metal is 25 minutes up the road in Temple — a real local crew with welded red-iron carports, RV covers, and garages built same-week. We honor a 7% Fort Cavazos military and first-responder discount on every install. Hablamos español con Juan y Freddy.",
    landmarks: [
      {
        name: 'Bella Charca & Heritage Oaks',
        blurb:
          "Killeen isn't just the back gate of Cavazos. Bella Charca and Heritage Oaks are the HOA-grade subdivisions where the higher-end residential market lives — concealed-fastener panels, color-matched trim, builds that read residential, not utility. We've cleared architectural review boards there before.",
        imageSrc: '/images/locations/killeen/bella-charca.jpg',
        imageAlt: 'Bella Charca subdivision in Killeen, Texas — HOA-grade residential development',
      },
      {
        name: 'Stillhouse Hollow Lake',
        blurb:
          "South Killeen's lake-and-marina country. RVs, boats, and trailers belong under cover before hail season — we build extra-tall clearance covers same-week.",
        // imageSrc TODO: lake / marina shot
      },
    ],
    neighborhoods: [
      'Cedar Ridge',
      'Heritage Park',
      'Westcliff',
      'Rosewood Heights',
      'All of Killeen',
    ],
    topServices: ['carports', 'rv-covers', 'metal-garages'],
    whyLocalBullets: [
      '25 minutes from Temple HQ — a real local crew, not a national kit shipped from out of state',
      "Welded OR bolted red-iron — your choice for Texas wind, hail, and Fort Cavazos timelines",
      "Concrete poured and engineered for Bell County's expansive clay soils — in the same contract",
      'Same-week scheduling — built around PCS arrivals and hail-season urgency',
    ],
    callouts: [
      {
        eyebrow: 'Fort Cavazos PCS',
        headline: 'Same-week installs on PCS timelines.',
        blurb:
          "Active-duty, retired, Reserve/Guard, and first responders get a 7% discount on every install — welded, bolted, or turnkey. PCS calendars, deployment dates, and TDY blocks all factored into the build week. Hablamos español con Juan y Freddy.",
        ctaLabel: 'See Fort Cavazos page',
        ctaHref: '/military',
      },
      {
        eyebrow: 'PCS to Tech',
        headline: 'Cavazos retirees relocating to Round Rock.',
        blurb:
          "Half the Killeen retirees we work with end up taking second-career jobs at Dell, Apple, or Tesla in Round Rock — and need a carport at the new house before move-in. We build at both ends of the I-14/I-35 run with the same crew. Same applies for Georgetown's Sun City retirees coming off a Cavazos pension.",
        ctaLabel: 'See Round Rock builds',
        ctaHref: '/locations/round-rock',
      },
    ],
    relatedPosts: [
      'fort-cavazos-pcs-metal-carport',
      'bell-county-metal-building-permit-guide-2025',
    ],
  },

  'copperas-cove': {
    slug: 'copperas-cove',
    heroImageAlt: 'Red iron framing on a Triple J Metal construction site in Central Texas',
    name: 'Copperas Cove',
    county: 'Coryell County',
    zip: '76522',
    lat: 31.1224,
    lng: -97.907,
    metaTitle: 'Metal Carports in Copperas Cove, TX',
    metaDescription:
      'Welded or bolted carports, garages and RV covers in Copperas Cove, TX. Temple-based crew, concrete available, 7% Fort Cavazos military discount.',
    heroHeadline: 'Metal Carports & Buildings in Copperas Cove, TX',
    heroCopy:
      "Plan a carport, garage, RV cover, or barn with our Temple-based crew. Tell us your dimensions and timing; we’ll confirm the design, scope, and schedule for your property.",
    areaContext:
      "Copperas Cove began in the 1870s as a ranching and farming community, named for a nearby spring with a mineral taste. The railroad in the late 1880s and Camp Hood in 1942 grew it into the largest city in Coryell County. We take project inquiries for covered parking, garages, RV storage, and ranch buildings in and around Cove.",
    whyLocal:
      "Work directly with our Temple-based crew on your Copperas Cove project: welded or bolted red iron, English and Spanish communication, and concrete available in the same contract.",
    services: [
      'Welded or bolted carports',
      'Metal garages',
      'RV and boat covers',
      'Barns and equipment covers',
      'Metal fencing and gates',
      'Site prep and separately priced concrete',
    ],
    customHeadline: {
      line1: 'Built for Copperas Cove.',
      line2: 'Steel for Coryell County homes and land.',
    },
    heroSubhead:
      "Plan a carport, garage, RV cover, or barn with our Temple-based crew. Tell us your dimensions and timing; we’ll confirm the design, scope, and schedule for your property.",
    localIntro:
      "Copperas Cove began in the 1870s as a ranching and farming community, named for a nearby spring with a mineral taste. The railroad in the late 1880s and Camp Hood in 1942 grew it into the largest city in Coryell County. We take project inquiries for covered parking, garages, RV storage, and ranch buildings in and around Cove.",
    habla: true,
    topServices: ['carports', 'rv-covers', 'barns'],
    landmarks: [
      {
        name: 'A spring, a railroad, and Camp Hood',
        blurb:
          "The City of Copperas Cove traces its name to a mineral-tasting spring and its growth to the railroad and Camp Hood. Your own property’s access, slope, and drainage are reviewed on their own merits.",
      },
    ],
    whyLocalBullets: [
      'Bring approximate dimensions for vehicles, RVs, equipment, and storage bays.',
      'On rural lots, include gate openings and the route trucks will use to reach the site.',
      'Site conditions and drainage guide the foundation discussion; concrete is available in the same contract.',
      'Our Temple-based team can discuss the project in English or Spanish.',
    ],
    callouts: [
      {
        eyebrow: 'Fort Cavazos PCS',
        headline: '7% military discount + same-week scheduling.',
        blurb:
          "Active-duty, retired, Reserve/Guard, and first responders get 7% off every install — welded, bolted, or turnkey. Tell us your report date and we’ll plan the build week around it. Hablamos español.",
        ctaLabel: 'See Fort Cavazos page',
        ctaHref: '/military',
      },
      {
        eyebrow: 'West of Cove',
        headline: 'Kempner and Lampasas, same crew.',
        blurb:
          "We also take projects west along US-190 toward Kempner and Lampasas. Share your location and what the building needs to do, and we’ll confirm the scope and schedule.",
        ctaLabel: 'See Lampasas',
        ctaHref: '/locations/lampasas',
      },
    ],
    relatedPosts: [
      'fort-cavazos-pcs-metal-carport',
      'welded-vs-bolted-metal-buildings-central-texas',
    ],
    localSource: {
      label: 'About Copperas Cove (City of Copperas Cove)',
      url: 'https://www.copperascovetx.gov/269/About-Copperas-Cove',
    },
  },

  temple: {
    slug: 'temple',
    name: 'Temple',
    county: 'Bell County',
    zip: '76501',
    lat: 31.0982,
    lng: -97.3428,
    metaTitle: 'Metal Carports & Buildings in Temple, TX',
    metaDescription:
      "Our home shop is in Temple, TX. Welded or bolted carports, garages and RV covers, same-week across Western Hills, Lake Belton and all of Temple.",
    // Legacy fallbacks (used if new fields below aren't populated)
    heroHeadline: "Built in Temple. Built where we live.",
    heroCopy:
      "Triple J's shop sits on Tem-Bel Ln in Temple. This isn't a service area for us — it's home. Welded or bolted carports, garages, and lakeside RV covers built same-week across the city we live in.",
    areaContext:
      "We're based right here in Temple and serve all surrounding areas including North Temple, South Temple along I-35, East Temple near FM 93, and rural Bell County properties. We also service nearby Nolanville, Rogers, Belton, and Troy.",
    whyLocal:
      "We're not a chain. Triple J Metal was founded by a Temple family and operates out of Temple. We source from regional Texas steel suppliers — real Texas steel, real Texas builders, multi-source so a single supplier shortage never delays your build. When other companies send a kit, we send a crew.",
    services: [
      'Welded or bolted red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'HOA-compliant structures',
      'Ranch structures',
      'Lean-to patios',
      'House additions',
    ],

    // ── NEW personalization (HQ-pride + lakeside lifestyle, per 2026-04-23 design pass) ──
    heroImage: '/images/locations/temple/temple-aerial.jpg',
    heroImageAlt: 'Aerial drone view of Temple, Texas — Triple J Metal home base',
    customHeadline: {
      line1: 'Built in Temple.',
      line2: 'Built where we live.',
    },
    heroSubhead:
      "Triple J's shop, yard, and crew all live here. From Lake Belton's lakeside neighborhoods to Western Hills residential streets, we build same-week across the city we call home.",
    distanceFromTemple: '0 mi · Where we live',
    habla: true,
    localIntro:
      "This is where we live and where we work. Triple J's shop sits on Tem-Bel Ln, our crew lives across town, and Temple's a railroad town — we weld like one. From Lake Belton's lakeside properties to the Western Hills residential corridor, we build same-week across the city we call home. Hablamos español con Juan y Freddy.",
    landmarks: [
      {
        name: 'Lake Belton',
        blurb:
          "Temple's weekend center. Lakeside properties need RV covers, boat covers, and shoreline barns engineered for Lake Belton's wind exposure — we build same-week before storm season.",
        imageSrc: '/images/locations/temple/lake-belton.jpg',
        imageAlt: 'Lake Belton shoreline near Temple, Texas',
      },
      {
        name: 'Downtown Temple & Santa Fe Heritage',
        blurb:
          "The 1910 Santa Fe depot anchors downtown Temple and the city's railroad heritage. Built to last over a century — the same standard we hold ourselves to with welded red-iron framing.",
        imageSrc: '/images/locations/temple/downtown-temple.jpg',
        imageAlt: 'Downtown Temple, Texas — historic Santa Fe railroad district',
      },
      {
        name: 'Scott & White',
        blurb:
          "Baylor Scott & White is Temple's biggest employer and pulls professional families into Western Hills, Heritage Acres, and the lakeside developments — the residential market we know best.",
        imageSrc: '/images/locations/temple/scott-white-temple.webp',
        imageAlt: 'Baylor Scott & White Medical Center in Temple, Texas',
      },
    ],
    neighborhoods: [
      'Western Hills',
      'Lake Belton / Lakeside',
      'Sammons Trail',
      'Stagecoach Trail',
      'All of Temple',
    ],
    topServices: ['carports', 'metal-garages', 'turnkey-carports-with-concrete'],
    whyLocalBullets: [
      'Our shop, our yard, our crew — all on Tem-Bel Ln in Temple. No driving in from out of state, no kit in a box.',
      "Welded OR bolted red-iron — your choice for Texas wind, hail, and Lake Belton shoreline gusts.",
      "Concrete poured and engineered for Bell County's expansive clay soils — in the same contract.",
      'Same-week scheduling — most calls become a build before the weekend.',
    ],
    callouts: [
      {
        eyebrow: 'Premium Residential',
        headline: "Built for Temple's HOA-grade neighborhoods.",
        blurb:
          "Concealed-fastener standing-seam, Board & Batten siding, color-matched to your home — for Western Hills, Heritage Acres, and Lake Belton subdivisions where the architectural guidelines are strict and the builds need to read residential, not utility.",
        ctaLabel: 'See HOA-compliant builds',
        ctaHref: '/services/hoa-compliant-structures',
      },
      {
        eyebrow: 'Building North',
        headline: '35 miles up I-35 to McLennan County.',
        blurb:
          "Waco, Hewitt, Woodway, Robinson, and China Spring are our closest cross-county runs — and where our regional Texas steel suppliers actually live. Same crew, same week, same turnkey concrete. Williamson County south (Georgetown, Round Rock) is also a routine drive.",
        ctaLabel: 'See Waco builds',
        ctaHref: '/locations/waco',
      },
    ],
    relatedPosts: [
      'bell-county-metal-building-permit-guide-2025',
      'blackland-prairie-soil-metal-building-foundation',
    ],
  },

  belton: {
    slug: 'belton',
    name: 'Belton',
    county: 'Bell County',
    zip: '76513',
    lat: 31.0557,
    lng: -97.4641,
    metaTitle: "Metal Carports & Buildings in Belton, TX",
    metaDescription:
      "Belton's metal building crew, 15 min from our Temple shop. Welded or bolted carports, ranch barns and lakeside RV covers. Hablamos español.",
    // Legacy fallbacks (used if new fields below aren't populated)
    heroHeadline: "Built in Belton. Bell County's home crew.",
    heroCopy:
      "Belton runs the county courthouse, and we know everyone in the permit office. The 1885 courthouse still stands. We build with that kind of intention. Welded or bolted carports, ranch barns, and lakeside RV covers — same-week across all of Bell County, 15 minutes from our Temple shop.",
    areaContext:
      "We serve all of Belton and the Lake Belton area, including communities along US-190, FM 2271, and rural Bell County ranches. We're also close to Salado and Jarrell for customers on the southern end of Bell County.",
    whyLocal:
      "The Carport Co. and Dayton Barns both have Belton pages, but they're national outfits with no local crew. Triple J Metal is 10 minutes from downtown Belton. We schedule faster, include concrete, and our crew actually knows your neighborhood.",
    services: [
      'Welded or bolted red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'Ranch structures',
      'Lean-to patios',
      'House additions',
    ],

    // ── NEW personalization (county-seat authority + range, per 2026-04-23 design pass) ──
    heroImage: '/images/locations/belton/downtown-belton.jpg',
    heroImageAlt: 'Downtown Belton, Texas — Bell County seat',
    customHeadline: {
      line1: 'Built in Belton.',
      line2: "Bell County's home crew.",
    },
    heroSubhead:
      "10 minutes south of HQ. The closest Bell County city to our Temple shop, the courthouse where every permit gets pulled, and the ranch country that opens up beyond city limits.",
    distanceFromTemple: '10 mi south · 15 min from HQ',
    habla: true,
    localIntro:
      "Belton runs the county courthouse, and we know everyone in the permit office. The 1885 courthouse still stands — we build with that kind of intention. From Lakeshore Drive lake-houses to Pendleton ranch land, we build same-week across all of Bell County. Hablamos español con Juan y Freddy.",
    landmarks: [
  {
    "name": "Bell County Courthouse",
    "blurb": "The Bell County Courthouse is a local landmark. Permit requirements and filing responsibilities depend on the location and scope of your project.",
    "imageSrc": "/images/locations/belton/bell-county-courthouse.jpg",
    "imageAlt": "1885 Bell County Courthouse in downtown Belton, Texas"
  },
  {
    "name": "Lake Belton & BLORA",
    "blurb": "Belton's lake country runs along the western edge — Lakeshore Drive properties, weekend barns, RV and boat covers. Lakeside structures we've been building for years.",
    "imageSrc": "/images/locations/belton/lake-belton.jpg",
    "imageAlt": "Lake Belton shoreline in Belton, Texas"
  },
  {
    "name": "Pendleton & Ranch Country",
    "blurb": "South Bell County opens into pasture, ranch land, and rural property. Welded red-iron barns, equipment sheds, and lean-tos — the structures rural buyers actually need."
  }
],
    neighborhoods: [
      'Lakeshore Drive',
      'Heritage Place',
      'North Belton',
      'Pendleton',
      'Sparta',
      'All of Bell County',
    ],
    topServices: ['carports', 'barns', 'rv-covers'],
    whyLocalBullets: [
  "We can discuss permit requirements; confirm filing and approval responsibilities before work starts.",
  "15 min from our Temple shop — fastest install in Bell County, no national-dealer dispatch lag.",
  "Concrete poured and engineered for Bell County's expansive clay soils — same contract.",
  "Welded OR bolted red-iron — your choice for Texas wind, hail, and the long haul."
],
    callouts: [
      {
        eyebrow: 'Permit Advisory',
        headline: 'Bell County permits handled.',
        blurb:
          "Included in your contract — no 4-week back-and-forth with the county office on your end. We know the process, we know the timelines, and we file the paperwork.",
        ctaLabel: 'Talk to us about your permit',
        ctaHref: '/contact',
      },
      {
        eyebrow: 'Ranch & Agricultural',
        headline: "Built for Bell County's ranch country.",
        blurb:
          "Welded red-iron barns, equipment sheds, and lean-tos engineered for Pendleton, Sparta, and the rural Bell County properties beyond the city limits — where the soil's tougher and the structures need to outlast the herd.",
        ctaLabel: 'See ranch barn builds',
        ctaHref: '/services/barns',
      },
      {
        eyebrow: 'South to Williamson County',
        headline: 'Georgetown, Round Rock, and the lake corridor.',
        blurb:
          "Belton's lake country runs into the same growth corridor pulling buyers down to Georgetown's Sun City and Round Rock's HOA-grade subdivisions. We make the run from our Temple shop with the same crew, same welded red-iron, same turnkey concrete.",
        ctaLabel: 'See Georgetown builds',
        ctaHref: '/locations/georgetown',
      },
    ],
    relatedPosts: [
      'bell-county-metal-building-permit-guide-2025',
      'hoa-compliant-metal-buildings-heritage-oaks-bella-charca',
    ],
  },

  salado: {
    slug: 'salado',
    heroImageAlt: "Triple J Metal steel construction project in Central Texas",
    name: 'Salado',
    county: 'Bell County',
    zip: '76571',
    lat: 30.9452,
    lng: -97.5344,
    metaTitle: "Metal Buildings & Fencing in Salado, TX",
    metaDescription:
      "Welded or bolted carports, garages, barns and metal fencing in Salado, TX. Temple-based Triple J Metal. Concrete available; request a project quote.",
    heroHeadline: "Metal Buildings & Fencing in Salado, TX",
    heroCopy:
      "Plan a carport, garage, barn, or metal fence with our Temple-based crew. Tell us your dimensions and priorities; we’ll confirm the design, scope, and scheduling for your property.",
    areaContext:
      "Salado Creek and the village center give Salado a distinct setting. A new carport, garage, or fence should work with the existing home and the way you use the property. Start with the available space, access, and finish you want; then we can discuss a welded or bolted structure and any concrete work as one quoted scope.",
    whyLocal:
      "Our Temple-based crew serves Salado. Work directly with the team on design, site preparation, installation, and the written project scope.",
    services: [
  "Welded or bolted carports",
  "Metal garages",
  "Barns and equipment covers",
  "RV and boat covers",
  "Metal fencing and gates",
  "Site prep and separately priced concrete"
],
      customHeadline: {
  "line1": "Built for Salado.",
  "line2": "Made for your Salado property."
},
    heroSubhead: "Plan a carport, garage, barn, or metal fence with our Temple-based crew. Tell us your dimensions and priorities; we’ll confirm the design, scope, and scheduling for your property.",
    localIntro: "Salado Creek and the village center give Salado a distinct setting. A new carport, garage, or fence should work with the existing home and the way you use the property. Start with the available space, access, and finish you want; then we can discuss a welded or bolted structure and any concrete work as one quoted scope.",
    habla: true,
    topServices: [
  "carports",
  "metal-fencing",
  "metal-garages"
],
    landmarks: [
  {
    "name": "Salado Creek",
    "blurb": "Salado Creek is a defining part of the village. For your own property, discuss drainage and the proposed building or fence location early in planning."
  }
],
    whyLocalBullets: [
  "Choose colors and panel profiles alongside the existing home, rather than as an afterthought.",
  "Include a sketch of parking, gate access, and any areas you want to keep open.",
  "Review drainage and foundation needs for the actual site before settling the layout.",
  "Concrete and fencing are separately defined in the quote so the full scope is clear."
],
    callouts: [
  {
    "eyebrow": "Finish & Layout",
    "headline": "Bring the house and fence into the same plan.",
    "blurb": "Share exterior colors, rooflines, and any architectural guidelines before selecting panels or fence materials. We can discuss privacy, ornamental fencing, and gate openings alongside a carport or garage.",
    "ctaLabel": "Explore metal fencing & gates",
    "ctaHref": "/services/metal-fencing"
  }
],
    localSource: {
  "label": "Salado local reference",
  "url": "https://www.saladotx.gov/sites/default/files/fileattachments/development_services/page/2356/comp_plan.pdf"
},
},

  waco: {
    slug: 'waco',
    name: 'Waco',
    county: 'McLennan County',
    zip: '76701',
    lat: 31.5493,
    lng: -97.1467,
    metaTitle: 'Metal Carports & Buildings in Waco, TX',
    metaDescription:
      "Welded or bolted metal carports in Waco, TX. Concrete available, same-week installs and ranch barns for Hewitt, Woodway, Robinson and China Spring.",
    // Legacy fallbacks (used if new fields below aren't populated)
    heroHeadline: "Built for Waco. McLennan County's welded crew.",
    heroCopy:
      "Waco is our closest county neighbor — 35 miles up I-35 — and the home of the regional Texas steel suppliers our shop draws from. Triple J brings a full welding crew and pours the concrete pad in the same contract for Waco, Hewitt, Woodway, Robinson, and China Spring residential and ag work alike.",
    areaContext:
      "We serve all of Waco and the surrounding McLennan County corridor — Hewitt, Woodway, Robinson, China Spring, the rural ag operators between Riesel and Crawford, and the Lake Waco shoreline. Magnolia-influenced residential and ranch-grade ag structures are both our day-in-day-out work in this market.",
    whyLocal:
      "McLennan County is the closest county to our Temple shop, and our supplier relationships are rooted right here in Waco. National kit-shippers have Waco landing pages but no local crew. Triple J makes the 35-minute run with our own team, our own steel, and turnkey concrete in one contract.",
    services: [
      'Welded or bolted red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'Ranch structures',
      'Equipment covers',
      'HOA-compliant structures',
      'Lean-to patios',
      'House additions',
    ],

    // ── NEW personalization (closest neighbor + supplier proximity + ag/Magnolia split + bilingual) ──
    // Note (per Decisions.md 2026-04-23): supplier-agnostic positioning — never name
    // a specific Waco supplier (e.g. MetalMax) in customer copy. Phrase as "regional
    // Texas steel suppliers" or "supplier relationships rooted in McLennan County."
    heroImage: '/images/locations/waco/magnolia-silos.jpg',
    heroImageAlt: 'Magnolia Silos in downtown Waco, Texas',
    customHeadline: {
      line1: 'Built for Waco.',
      line2: "McLennan County's welded crew.",
    },
    heroSubhead:
      "35 minutes north of HQ — our closest county neighbor and where our supplier relationships actually live. Welded or bolted red-iron, turnkey concrete, same-week across Waco, Hewitt, Woodway, Robinson, and China Spring. Hablamos español.",
    distanceFromTemple: '35 mi north · 40 min from HQ',
    habla: true,
    localIntro:
      "Waco is our closest county neighbor — 35 miles up I-35 and the home of the regional Texas steel suppliers our shop draws from. McLennan County splits between rural ag operators who need hay barns and equipment covers, and Magnolia-influenced residential where the build has to look the part. We bring a real welding crew and concrete in the same contract for both. Hablamos español con Juan y Freddy.",
    landmarks: [
      {
        name: 'Magnolia Market & Silos',
        blurb:
          "Chip and Joanna's silos reset what residential design looks like in Central Texas. Board & Batten siding, black-trim color contrast, farmhouse pitch — the Waco aesthetic our HOA-compliant carports are dialed in for.",
        imageSrc: '/images/locations/waco/magnolia-silos.jpg',
        imageAlt: 'Magnolia Market & Silos in downtown Waco, Texas',
      },
      {
        name: 'Lake Waco',
        blurb:
          "60+ miles of shoreline and the weekend center for west McLennan. Lakeside RV covers, boat covers, and shoreline barns are routine work — we engineer for the wind exposure that comes with open lake frontage.",
        imageSrc: '/images/locations/waco/lake-waco.jpg',
        imageAlt: 'Lake Waco shoreline in McLennan County, Texas',
      },
      {
        name: 'Baylor University',
        blurb:
          "Baylor pulls professional families into Woodway and Hewitt and a steady student-rental market closer in. The neighborhoods around campus are mixed — HOA-compliant secondary structures and rental-property carports both come up regularly.",
        imageSrc: '/images/locations/waco/baylor.jpg',
        imageAlt: 'Baylor University campus in Waco, Texas',
      },
    ],
    neighborhoods: [
      'Waco proper',
      'Hewitt',
      'Woodway',
      'Robinson',
      'China Spring',
    ],
    topServices: ['barns', 'carports', 'metal-garages'],
    whyLocalBullets: [
      '35 miles up I-35 — McLennan County is the closest county to our Temple shop, and our supplier relationships are rooted right here in Waco.',
      'Ranch and ag work for rural McLennan — hay barns, equipment covers, and run-in sheds for the operators between Hewitt, China Spring, Robinson, and Crawford.',
      'Magnolia-influenced residential — Board & Batten, color-matched panels, and the farmhouse pitch the Waco market actually wants.',
      "Bilingual install crew — Juan and Freddy run the build in Spanish or English for Waco's strong Hispanic homeowner base.",
    ],
    callouts: [
      {
        eyebrow: 'Ranch & Agricultural',
        headline: "Built for McLennan County's working ground.",
        blurb:
          "Welded red-iron hay barns, equipment covers, and lean-tos for the rural operators between Hewitt, China Spring, Robinson, and Crawford. Sized for tractors and implements, not residential carports — and built to outlast the herd.",
        ctaLabel: 'See ranch barn builds',
        ctaHref: '/services/barns',
      },
      {
        eyebrow: 'Magnolia-Aesthetic Residential',
        headline: 'Board & Batten, color-matched, built like Waco wants it.',
        blurb:
          "Concealed-fastener standing-seam, Board & Batten siding, black-trim contrast, farmhouse pitch. The Magnolia look has reset what residential metal looks like in Waco — and we build to that standard for HOA submissions and direct homeowner asks alike.",
        ctaLabel: 'See HOA-compliant builds',
        ctaHref: '/services/hoa-compliant-structures',
      },
    ],
    relatedPosts: ['blackland-prairie-soil-metal-building-foundation'],
  },

  georgetown: {
    slug: 'georgetown',
    name: 'Georgetown',
    county: 'Williamson County',
    zip: '78626',
    lat: 30.6333,
    lng: -97.6779,
    metaTitle: 'Metal Carports & Buildings, Georgetown TX',
    metaDescription:
      "Welded or bolted carports, garages and RV covers in Georgetown, TX. Temple-based crew; concrete available in the same contract. Request a quote.",
    // Legacy fallbacks (used if new fields below aren't populated)
    heroHeadline: "Metal Buildings in Georgetown, TX",
    heroCopy:
      "Triple J Metal serves Georgetown with welded or bolted carports, garages, and RV covers. Work directly with our Temple-based crew to plan the design, concrete needs, and installation schedule.",
    areaContext:
      "We serve all of Georgetown and the surrounding Williamson County corridor — Sun City, Berry Creek, Georgetown Lake, the Liberty Hill ranch country to the west, and old-town Georgetown around Southwestern University. RV covers, ranch barns, and HOA-compliant residential are our day-in-day-out work in this market.",
    whyLocal:
      "We offer a direct relationship with the crew building your project, with concrete available as a separately priced part of the same contract.",
    services: [
      'Welded or bolted red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'HOA-compliant structures',
      'Metal barns',
      'Ranch structures',
      'Lean-to patios',
      'House additions',
    ],

    // ── NEW personalization (Sun City + Liberty Hill ranch + San Gabriel + speed-against-locals) ──
    // Photo TODO: hero + 3 landmark images currently use existing Triple J photos.
    // Replace with Georgetown landmark shots (San Gabriel River, Sun City, Southwestern
    // University) when sourced from Unsplash/Pexels into /public/images/locations/georgetown/.
    // Alt text already accurate.
    heroImage: '/images/porch-cover-lean-to.jpg',
    heroImageAlt: "Triple J Metal lean-to patio project in Central Texas",
    customHeadline: {
  "line1": "Built for Georgetown.",
  "line2": "Your project. Our local crew."
},
    heroSubhead:
      "Triple J Metal serves Georgetown with welded or bolted carports, garages, and RV covers. Work directly with our Temple-based crew to plan the design, concrete needs, and installation schedule.",

    habla: true,
    localIntro:
      "For a Georgetown carport, garage, or RV cover, start with the dimensions, access, and appearance you need. Share any property guidelines and the condition of the existing driveway or slab so the quoted scope fits your site.",
    landmarks: [
      {
        name: 'San Gabriel River',
        blurb:
          "The river runs through downtown and along the north edge of town — and the riparian properties near it need erosion-conscious foundations. We set the concrete spec and anchor depth for the actual flood-pulse zone, not a generic spec.",
      },
      {
        name: 'Sun City',
        blurb:
          "Texas's largest 55+ active-adult community — 9,500+ homes, every one with an RV, golf cart, or workshop tool that should not be sitting in the sun. RV covers and HOA-compliant carports are our day-in-day-out work in Sun City.",
      },
      {
        name: 'Southwestern University',
        blurb:
          "Texas's oldest university anchors downtown Georgetown and pulls steady professional families into Berry Creek and old-town Georgetown. The historic neighborhoods around campus are HOA-tight — we color-match panels and trim to fit.",
      },
    ],
    neighborhoods: [
      'Sun City',
      'Berry Creek',
      'Georgetown Lake',
      'Liberty Hill',
      'Old Town Georgetown',
    ],
    topServices: ['rv-covers', 'hoa-compliant-structures', 'barns'],
    whyLocalBullets: [
  "Discuss current scheduling directly with our team; dates depend on the project scope and site readiness.",
  "Sun City RV covers and golf-cart enclosures — extra-tall clearance, HOA-grade aesthetic, sized for the rigs retirees actually drive.",
  "San Gabriel River-adjacent foundations — concrete spec and anchor depth engineered for flood-pulse properties and seasonal water tables.",
  "Liberty Hill ranch country — welded red-iron barns, equipment sheds, and lean-tos for Williamson County's growing rural property base."
],
    callouts: [
      {
        eyebrow: 'Sun City Specialists',
        headline: 'RV covers + golf-cart enclosures, HOA-approved.',
        blurb:
          "Sun City's architectural standards specify panel color, eave treatment, and roof pitch. We've matched them on enough builds to know which panel and trim combos clear ARC the first submission — no rework, no second try.",
        ctaLabel: 'See RV covers',
        ctaHref: '/services/rv-covers',
      },
      {
        eyebrow: 'Liberty Hill Ranch',
        headline: 'Welded barns for Williamson ranch country.',
        blurb:
          "Liberty Hill's the last big open stretch in Williamson County — and the buyers moving in want hay barns, equipment covers, and run-in sheds that aren't kit construction. Welded red-iron, our own crew, one contract.",
        ctaLabel: 'See ranch barns',
        ctaHref: '/services/barns',
      },
    ],
  },

  'round-rock': {
    slug: 'round-rock',
    name: 'Round Rock',
    county: 'Williamson County',
    zip: '78664',
    lat: 30.5083,
    lng: -97.6789,
    metaTitle: 'Metal Carports & Buildings, Round Rock TX',
    metaDescription:
      "Welded or bolted metal carports in Round Rock, TX. Concrete available, same-week installs, HOA-compliant builds for Brushy Creek and Teravista.",
    // Legacy fallbacks (used if new fields below aren't populated)
    heroHeadline: "Built for Round Rock. Welded or bolted, same-week.",
    heroCopy:
      "Round Rock homeowners have plenty of national carport dealers to choose from — and none of them show up with a crew. Triple J Metal drives 60 miles south from our Temple shop, welds or bolts your structure on-site, and pours the concrete pad in the same contract. No kits, no subcontractors, no 6-week wait list.",
    areaContext:
      "We serve all of Round Rock and Williamson County's growth corridor — Brushy Creek, Forest Creek, Teravista, the Cedar Park line, and the Pflugerville / SH-45 build-out. HOA-compliant residential and turnkey-concrete commercial carports are our day-in-day-out work in this market.",
    whyLocal:
      "Round Rock is 60 miles south of our Temple yard — a worthwhile drive for a full-service contractor with welded steel, HOA-grade panel finishes, and turnkey concrete in one contract. National kit-shippers can't meet Williamson architectural review boards. Triple J can.",
    services: [
      'Welded or bolted red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'HOA-compliant structures',
      'Lean-to patios',
      'House additions',
    ],

    // ── NEW personalization (Williamson growth + HOA + bilingual + Cavazos→Dell migration) ──
    // Photo TODO: hero + 3 landmark images currently use existing Triple J photos.
    // Replace with Round Rock landmark shots (Old Settlers Park, Dell Diamond,
    // Round Rock Premium Outlets) when sourced from Unsplash/Pexels into
    // /public/images/locations/round-rock/. Alt text already accurate.
    heroImage: '/images/carport-truck-concrete-hero.jpg',
    heroImageAlt: 'Round Rock, Texas residential metal carport with concrete pad',
    customHeadline: {
      line1: 'Built for Round Rock.',
      line2: 'Welded or bolted, same-week.',
    },
    heroSubhead:
      "Williamson County's fastest-growing city. Triple J drives 60 miles south from Temple with our own welders and concrete crew — HOA-compliant red-iron for Brushy Creek, Forest Creek, Teravista, Cedar Park, and Pflugerville.",
    distanceFromTemple: '60 mi south · 1 hr from HQ',
    habla: true,
    localIntro:
      "Round Rock has doubled in a generation — Dell, Apple, and Tesla pulled tech families in from across the country, and Fort Cavazos retirees PCS here for second careers. The subdivisions are HOA-strict, the soil flips between Edwards Plateau caliche and Blackland Prairie clay, and most national kit-shippers can't meet the architectural review board's standards. We can. Welded or bolted red-iron, color-matched to your home, concrete poured for the soil under it. Hablamos español con Juan y Freddy.",
    landmarks: [
      {
        name: 'Old Settlers Park',
        blurb:
          "645 acres of fields, courts, and event grounds — the Sports Capital of Texas hosts year-round tournaments. The surrounding HOA-grade neighborhoods (Forest Creek, Stone Canyon) are exactly where our standing-seam carports earn their keep.",
      },
      {
        name: 'Dell Diamond',
        blurb:
          "Round Rock Express stadium — and a marker of the Dell-driven tech economy that brought half of these homeowners to Williamson County. Fort Cavazos retirees take Dell jobs here, then call us for the carport their PCS orders never made room for.",
      },
      {
        name: 'Round Rock Premium Outlets',
        blurb:
          "Anchor of the SH-45 / I-35 commercial corridor. The growth radius around the outlets is where most Round Rock new-build neighborhoods are landing — Forest Creek, Teravista, the Cedar Park line — and where HOA-compliant secondary structures get specified.",
      },
    ],
    neighborhoods: [
      'Brushy Creek',
      'Forest Creek',
      'Teravista',
      'Cedar Park',
      'Pflugerville',
    ],
    topServices: ['hoa-compliant-structures', 'carports', 'turnkey-carports-with-concrete'],
    whyLocalBullets: [
      'HOA-compliant red-iron — concealed-fastener standing-seam, color-matched siding, builds that read residential for Brushy Creek, Forest Creek, and Teravista architectural review boards.',
      "Edwards Plateau caliche or Blackland Prairie clay — we engineer the concrete spec and anchor depth for the soil actually under your slab, not a national average.",
      "Bilingual install crew — Juan and Freddy run the build in Spanish or English for Round Rock's growing Hispanic homeowner market.",
      'Same-week scheduling for Fort Cavazos PCS retirees taking Dell, Apple, and Tesla jobs — vehicles under cover before the moving truck unloads.',
    ],
    callouts: [
      {
        eyebrow: 'HOA-Grade Residential',
        headline: "Built for Round Rock's architectural review boards.",
        blurb:
          "Concealed-fastener standing-seam, Board & Batten siding, and roof colors matched to your home — for Brushy Creek, Forest Creek, Teravista, and Stone Canyon homeowners whose ARC requires the build to read residential, not utility.",
        ctaLabel: 'See HOA-compliant builds',
        ctaHref: '/services/hoa-compliant-structures',
      },
      {
        eyebrow: 'Williamson County Reach',
        headline: 'Cedar Park, Pflugerville, and the SH-45 corridor.',
        blurb:
          "Round Rock anchors the run — Cedar Park, Pflugerville, Hutto, and Leander are the same drive from our crew. Same welded red-iron, same concrete in one contract, same 60-mile run from Temple.",
        ctaLabel: 'See Georgetown builds',
        ctaHref: '/locations/georgetown',
      },
    ],
  },

  lampasas: {
    slug: 'lampasas',
    heroImageAlt: "Triple J Metal steel construction project in Central Texas",
    name: 'Lampasas',
    county: 'Lampasas County',
    zip: '76550',
    lat: 31.0632,
    lng: -98.1793,
    metaTitle: "Metal Buildings & Fencing in Lampasas, TX",
    metaDescription:
      "Welded or bolted carports, garages, barns and metal fencing in Lampasas, TX. Temple-based Triple J Metal. Concrete available; request a project quote.",
    heroHeadline: "Metal Buildings & Fencing in Lampasas, TX",
    heroCopy:
      "Plan a carport, garage, barn, or metal fence with our Temple-based crew. Tell us your dimensions and priorities; we’ll confirm the design, scope, and scheduling for your property.",
    areaContext:
      "Lampasas is home to Hancock Springs and its spring-fed pool. For a home or acreage project in the Lampasas area, the useful starting point is what needs covering: a daily driver, a trailer, farm equipment, or a workshop. Triple J Metal takes inquiries for welded or bolted carports, barns, and garages, with foundation and access needs reviewed for each property.",
    whyLocal:
      "Our Temple-based crew serves Lampasas. Work directly with the team on design, site preparation, installation, and the written project scope.",
    services: [
  "Welded or bolted carports",
  "Metal garages",
  "Barns and equipment covers",
  "RV and boat covers",
  "Metal fencing and gates",
  "Site prep and separately priced concrete"
],
      customHeadline: {
  "line1": "Built for Lampasas.",
  "line2": "Room for vehicles, equipment, and more."
},
    heroSubhead: "Plan a carport, garage, barn, or metal fence with our Temple-based crew. Tell us your dimensions and priorities; we’ll confirm the design, scope, and scheduling for your property.",
    localIntro: "Lampasas is home to Hancock Springs and its spring-fed pool. For a home or acreage project in the Lampasas area, the useful starting point is what needs covering: a daily driver, a trailer, farm equipment, or a workshop. Triple J Metal takes inquiries for welded or bolted carports, barns, and garages, with foundation and access needs reviewed for each property.",
    habla: true,
    topServices: [
  "barns",
  "rv-covers",
  "carports"
],
    landmarks: [
  {
    "name": "Hancock Springs Park",
    "blurb": "The city lists a spring-fed pool, picnic area, and historic Hostess House at Hancock Springs Park."
  }
],
    whyLocalBullets: [
  "Plan clear height around the tallest vehicle or attachment, including roof-mounted equipment.",
  "Discuss delivery access and turning space before selecting a building footprint.",
  "Foundation and anchoring details are reviewed for the actual site and design.",
  "Need a ranch boundary or entrance gate? Include fencing in your inquiry."
],
    callouts: [
  {
    "eyebrow": "Equipment & Access",
    "headline": "Measure the equipment and the approach.",
    "blurb": "For an RV, trailer, or equipment cover, send overall height and width along with photos or a sketch of the approach. Door clearance, turning room, and usable interior space all belong in the plan.",
    "ctaLabel": "Plan your project",
    "ctaHref": "/quote?city=lampasas"
  }
],
    localSource: {
  "label": "Lampasas local reference",
  "url": "https://lampasas.org/367/Hancock-Springs-Park"
},
},

  holland: {
    slug: 'holland',
    heroImageAlt: "Triple J Metal steel construction project in Central Texas",
    name: 'Holland',
    county: 'Bell County',
    zip: '76534',
    lat: 30.8796,
    lng: -97.4091,
    metaTitle: "Metal Buildings & Fencing in Holland, TX",
    metaDescription:
      "Welded or bolted carports, garages, barns and metal fencing in Holland, TX. Temple-based Triple J Metal. Concrete available; request a project quote.",
    heroHeadline: "Metal Buildings & Fencing in Holland, TX",
    heroCopy:
      "Plan a carport, garage, barn, or metal fence with our Temple-based crew. Tell us your dimensions and priorities; we’ll confirm the design, scope, and scheduling for your property.",
    areaContext:
      "Holland lies in southeast Bell County, east of Salado; its city history traces early settlement along Darr’s Creek. We take project inquiries for residential parking, equipment storage, and fencing in the Holland area. Tell us what the space needs to do, and we’ll discuss a layout that fits your property and budget.",
    whyLocal:
      "Our Temple-based crew serves Holland. Work directly with the team on design, site preparation, installation, and the written project scope.",
    services: [
  "Welded or bolted carports",
  "Metal garages",
  "Barns and equipment covers",
  "RV and boat covers",
  "Metal fencing and gates",
  "Site prep and separately priced concrete"
],
      customHeadline: {
  "line1": "Built for Holland.",
  "line2": "Practical steel for Holland homes and land."
},
    heroSubhead: "Plan a carport, garage, barn, or metal fence with our Temple-based crew. Tell us your dimensions and priorities; we’ll confirm the design, scope, and scheduling for your property.",
    localIntro: "Holland lies in southeast Bell County, east of Salado; its city history traces early settlement along Darr’s Creek. We take project inquiries for residential parking, equipment storage, and fencing in the Holland area. Tell us what the space needs to do, and we’ll discuss a layout that fits your property and budget.",
    habla: true,
    topServices: [
  "barns",
  "carports",
  "metal-fencing"
],
    landmarks: [
  {
    "name": "Darr’s Creek & Holland’s history",
    "blurb": "The City of Holland records early community life along Darr’s Creek east of present-day Holland. Your proposed building location and access should be reviewed on their own merits."
  }
],
    whyLocalBullets: [
  "Bring approximate dimensions for equipment, storage bays, and covered parking.",
  "Include gate openings and the route vehicles will use to enter the property.",
  "Site conditions and drainage guide the foundation discussion; no one-size-fits-all soil assumption.",
  "Our Temple-based team can discuss the project in English or Spanish."
],
    callouts: [
  {
    "eyebrow": "Ranch & Residential",
    "headline": "Plan the gate before the fence line.",
    "blurb": "Share the equipment or vehicles that need access, the approximate fence length, and the opening widths you need. Pipe/ranch fencing, metal privacy, and ornamental options can be discussed in the same inquiry.",
    "ctaLabel": "Explore metal fencing & gates",
    "ctaHref": "/services/metal-fencing"
  }
],
    localSource: {
  "label": "Holland local reference",
  "url": "https://cityofholland.org/about-us"
},
},

  taylor: {
    slug: 'taylor',
    heroImageAlt: "Triple J Metal steel construction project in Central Texas",
    name: 'Taylor',
    county: 'Williamson County',
    zip: '76574',
    lat: 30.5711,
    lng: -97.4097,
    metaTitle: "Metal Buildings & Fencing in Taylor, TX",
    metaDescription:
      "Welded or bolted carports, garages, barns and metal fencing in Taylor, TX. Temple-based Triple J Metal. Concrete available; request a project quote.",
    heroHeadline: "Metal Buildings & Fencing in Taylor, TX",
    heroCopy:
      "Plan a carport, garage, barn, or metal fence with our Temple-based crew. Tell us your dimensions and priorities; we’ll confirm the design, scope, and scheduling for your property.",
    areaContext:
      "Taylor’s city center combines historic buildings, shops, and services, while Murphy Park provides a major public recreation space. For your own property, focus on how the new structure will meet the existing driveway, yard, and building. We offer welded or bolted carports and garages, plus metal fencing and gates, with concrete available as a separately priced part of the project.",
    whyLocal:
      "Our Temple-based crew serves Taylor. Work directly with the team on design, site preparation, installation, and the written project scope.",
    services: [
  "Welded or bolted carports",
  "Metal garages",
  "Barns and equipment covers",
  "RV and boat covers",
  "Metal fencing and gates",
  "Site prep and separately priced concrete"
],
      customHeadline: {
  "line1": "Built for Taylor.",
  "line2": "A Taylor build that fits the whole property."
},
    heroSubhead: "Plan a carport, garage, barn, or metal fence with our Temple-based crew. Tell us your dimensions and priorities; we’ll confirm the design, scope, and scheduling for your property.",
    localIntro: "Taylor’s city center combines historic buildings, shops, and services, while Murphy Park provides a major public recreation space. For your own property, focus on how the new structure will meet the existing driveway, yard, and building. We offer welded or bolted carports and garages, plus metal fencing and gates, with concrete available as a separately priced part of the project.",
    habla: true,
    topServices: [
  "carports",
  "metal-garages",
  "metal-fencing"
],
    landmarks: [
  {
    "name": "Downtown Taylor & Murphy Park",
    "blurb": "Taylor’s official downtown program describes its historic buildings and businesses; the city lists Murphy Park on Veterans Drive."
  }
],
    whyLocalBullets: [
  "Choose a roofline and finish that suit the existing property.",
  "Measure driveway access and the clearance needed at each door or gate.",
  "Discuss grading, drainage, and any existing slab before finalizing the scope.",
  "We confirm availability for your address and project before promising an installation date."
],
    callouts: [
  {
    "eyebrow": "Parking & Workshop Space",
    "headline": "Make room for more than the vehicle.",
    "blurb": "A garage plan needs door openings, workbench space, and room to move around the vehicle. Share those needs with the overall footprint so the quote reflects usable space.",
    "ctaLabel": "Plan your project",
    "ctaHref": "/quote?city=taylor"
  }
],
    localSource: {
  "label": "Taylor local reference",
  "url": "https://taylortx.gov/901/Downtown"
},
},

  troy: {
    slug: 'troy',
    heroImageAlt: "Triple J Metal steel construction project in Central Texas",
    name: 'Troy',
    county: 'Bell County',
    zip: '76579',
    lat: 31.2057,
    lng: -97.2983,
    metaTitle: "Metal Buildings & Fencing in Troy, TX",
    metaDescription:
      "Welded or bolted carports, garages, barns and metal fencing in Troy, TX. Temple-based Triple J Metal. Concrete available; request a project quote.",
    heroHeadline: "Metal Buildings & Fencing in Troy, TX",
    heroCopy:
      "Plan a carport, garage, barn, or metal fence with our Temple-based crew. Tell us your dimensions and priorities; we’ll confirm the design, scope, and scheduling for your property.",
    areaContext:
      "Troy’s West Main Street connects with I-35, linking the town to the Temple corridor. For a carport, barn, or equipment cover, the best plan starts with everyday access: where you park, turn, load, and store. Triple J Metal serves Troy from Temple with welded or bolted steel options and a quote tailored to the site.",
    whyLocal:
      "Our Temple-based crew serves Troy. Work directly with the team on design, site preparation, installation, and the written project scope.",
    services: [
  "Welded or bolted carports",
  "Metal garages",
  "Barns and equipment covers",
  "RV and boat covers",
  "Metal fencing and gates",
  "Site prep and separately priced concrete"
],
      customHeadline: {
  "line1": "Built for Troy.",
  "line2": "Covered space for Troy homes and equipment."
},
    heroSubhead: "Plan a carport, garage, barn, or metal fence with our Temple-based crew. Tell us your dimensions and priorities; we’ll confirm the design, scope, and scheduling for your property.",
    localIntro: "Troy’s West Main Street connects with I-35, linking the town to the Temple corridor. For a carport, barn, or equipment cover, the best plan starts with everyday access: where you park, turn, load, and store. Triple J Metal serves Troy from Temple with welded or bolted steel options and a quote tailored to the site.",
    habla: true,
    topServices: [
  "carports",
  "barns",
  "rv-covers"
],
    landmarks: [
  {
    "name": "West Main Street & I-35",
    "blurb": "The city’s West Main Street project identifies the connection from I-35 toward Trojan Road. Share the actual entrance and access route for your property when arranging a quote."
  }
],
    whyLocalBullets: [
  "Size openings for the vehicle or equipment that will actually pass through them.",
  "Decide which sides need weather cover and which should remain accessible.",
  "Review site slope and water flow before choosing the footprint and foundation.",
  "Concrete, enclosure, and gates are listed as part of the agreed scope rather than assumed in a base price."
],
    callouts: [
  {
    "eyebrow": "Working Space",
    "headline": "Keep loading and parking out of each other’s way.",
    "blurb": "For a barn or cover, show us where equipment enters and where materials will be stored. Open sides, enclosure, and gate placement can be considered around how the property is used.",
    "ctaLabel": "Plan your project",
    "ctaHref": "/quote?city=troy"
  }
],
    localSource: {
  "label": "Troy local reference",
  "url": "https://www.cityoftroy.us/news/3506"
},
},

  nolanville: {
    slug: 'nolanville',
    heroImageAlt: "Triple J Metal steel construction project in Central Texas",
    name: 'Nolanville',
    county: 'Bell County',
    zip: '76559',
    lat: 31.0799,
    lng: -97.6024,
    metaTitle: "Metal Buildings & Fencing in Nolanville, TX",
    metaDescription:
      "Welded or bolted carports, garages, barns and metal fencing in Nolanville, TX. Temple-based Triple J Metal. Concrete available; request a project quote.",
    heroHeadline: "Metal Buildings & Fencing in Nolanville, TX",
    heroCopy:
      "Plan a carport, garage, barn, or metal fence with our Temple-based crew. Tell us your dimensions and priorities; we’ll confirm the design, scope, and scheduling for your property.",
    areaContext:
      "Nolanville’s public Nolan Creek program highlights the creek’s role in recreation and stormwater. That makes drainage a useful early planning topic, without assuming every property has the same conditions. Bring your parking or fencing plans to our Temple-based team and we’ll discuss the footprint, access, and materials for your site.",
    whyLocal:
      "Our Temple-based crew serves Nolanville. Work directly with the team on design, site preparation, installation, and the written project scope.",
    services: [
  "Welded or bolted carports",
  "Metal garages",
  "Barns and equipment covers",
  "RV and boat covers",
  "Metal fencing and gates",
  "Site prep and separately priced concrete"
],
      customHeadline: {
  "line1": "Built for Nolanville.",
  "line2": "Make more of your Nolanville property."
},
    heroSubhead: "Plan a carport, garage, barn, or metal fence with our Temple-based crew. Tell us your dimensions and priorities; we’ll confirm the design, scope, and scheduling for your property.",
    localIntro: "Nolanville’s public Nolan Creek program highlights the creek’s role in recreation and stormwater. That makes drainage a useful early planning topic, without assuming every property has the same conditions. Bring your parking or fencing plans to our Temple-based team and we’ll discuss the footprint, access, and materials for your site.",
    habla: true,
    topServices: [
  "carports",
  "metal-fencing",
  "rv-covers"
],
    landmarks: [
  {
    "name": "Nolan Creek",
    "blurb": "The city’s Nolan Creek program explains its recreation and stormwater role. Before adding a structure or fence, discuss how the proposed layout relates to water flow on your property."
  }
],
    whyLocalBullets: [
  "Start with parking dimensions, roof clearance, and usable gate widths.",
  "Share any property survey or architectural guidelines available for the project.",
  "Review drainage and the proposed fence or building position before installation.",
  "English and Spanish project discussions are available through our Temple-based team."
],
    callouts: [
  {
    "eyebrow": "Fencing & Gates",
    "headline": "Privacy where you want it. Access where you need it.",
    "blurb": "Tell us whether you need a metal privacy fence, an open ornamental design, or pipe/ranch fencing. Include the approximate footage, height, and pedestrian or driveway gates in your quote request.",
    "ctaLabel": "Explore metal fencing & gates",
    "ctaHref": "/services/metal-fencing"
  }
],
    localSource: {
  "label": "Nolanville local reference",
  "url": "https://www.nolanvilletx.gov/page/Nolan%20Creek%20Matters"
},
},

  // ─── COUNTIES (county-wide SEO surfaces) ────────────────────────────────────
  // Each county groups multiple cities under one URL so we rank for
  // "metal carport [County] TX" searches without writing per-city duplicate copy.

}

export const LOCATION_SLUGS = Object.keys(LOCATIONS)

/* ────────────────────────────────────────────────────────────────────────────
   ZIP → city resolution

   One owner for "which city is this ZIP". Before this, two hand-maintained
   copies of the map lived in the API routes (/api/leads and /api/hq/voice-lead)
   and neither derived from LOCATIONS. They drifted: 78664 — Round Rock, a city
   with its own landing page — was missing from both, so a Round Rock lead came
   in labelled `78664`. That raw ZIP was then stored in `leads.city` and
   interpolated straight into the owner alert subject, which arrived reading
   "New Lead: <name> — 78664 — garage" and looked like junk.

   `LOCATIONS[].zip` is the primary ZIP we publish per city; the maps below add
   the rest of each city's ZIPs plus the nearby towns we serve that don't have a
   landing page of their own.
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Secondary ZIPs for cities that already have a LOCATIONS entry. Keyed by slug
 * so a typo fails loudly in the build below rather than silently adding a city.
 * The primary ZIP comes from `LOCATIONS[slug].zip` and must not be repeated.
 */
const EXTRA_CITY_ZIPS: Record<string, readonly string[]> = {
  temple:          ['76502', '76503', '76504', '76505', '76508'],
  killeen:         ['76540', '76542', '76543', '76544', '76545', '76546', '76547', '76549'],
  waco:            ['76702', '76703', '76704', '76705', '76706', '76707', '76708', '76710', '76711', '76712'],
  georgetown:      ['78627', '78628', '78633'],
  'round-rock':    ['78665', '78680', '78681', '78683'],
  belton:          ['76597', '76598'],
}

/**
 * Towns inside the service area that don't have their own landing page. Carried
 * over from the previous hand-maintained maps — this list is a business fact,
 * so add to it only when Julian confirms we cover a town, never by inference.
 *
 * Note: the old maps had `76578: Taylor`. 76578 is Thrall; Taylor is 76574,
 * which is what LOCATIONS has always said. Corrected here.
 */
const NEARBY_TOWN_ZIPS: Record<string, string> = {
  '76511': 'Bartlett',
  '76527': 'Florence',
  '76554': 'Little River-Academy',
  '76557': 'Moody',
  '76578': 'Thrall',
}

/** Every ZIP we can name a city for. Built once at module load. */
export const ZIP_TO_CITY: Readonly<Record<string, string>> = (() => {
  const map: Record<string, string> = {}

  for (const loc of Object.values(LOCATIONS)) {
    // County surfaces (name === county) are SEO groupings, not places a lead
    // lives — Bell County carries zip 76513, which is Belton's. Mapping a ZIP
    // to "Bell County" would put a non-city into leads.city, the exact class of
    // corruption this module exists to prevent.
    if (loc.name === loc.county) continue

    const claimed = map[loc.zip]
    if (claimed && claimed !== loc.name) {
      throw new Error(
        `ZIP ${loc.zip} is claimed by both "${claimed}" and "${loc.name}" in LOCATIONS. ` +
        `A ZIP resolves to exactly one city — give one of them a different primary ZIP.`,
      )
    }
    map[loc.zip] = loc.name
  }

  for (const [slug, zips] of Object.entries(EXTRA_CITY_ZIPS)) {
    const loc = LOCATIONS[slug]
    if (!loc) {
      throw new Error(
        `EXTRA_CITY_ZIPS references unknown location slug "${slug}". ` +
        `Add it to LOCATIONS or fix the key.`,
      )
    }
    for (const zip of zips) {
      const claimed = map[zip]
      if (claimed && claimed !== loc.name) {
        throw new Error(
          `EXTRA_CITY_ZIPS gives ${zip} to "${loc.name}", but it is already "${claimed}".`,
        )
      }
      map[zip] = loc.name
    }
  }

  for (const [zip, name] of Object.entries(NEARBY_TOWN_ZIPS)) {
    const claimed = map[zip]
    if (claimed && claimed !== name) {
      throw new Error(
        `NEARBY_TOWN_ZIPS gives ${zip} to "${name}", but a LOCATIONS city already claims it as "${claimed}".`,
      )
    }
    map[zip] = name
  }

  return Object.freeze(map)
})()

/**
 * The city for a ZIP, or `null` when we don't recognise it.
 *
 * Returns null rather than echoing the ZIP back: callers persist this into
 * `leads.city`, and a ZIP stored in a city column poisons every city-level
 * report downstream. Use `formatCityOrZip` for display.
 */
export function cityFromZip(zip: string | null | undefined): string | null {
  const key = zip?.trim()
  if (!key) return null
  return ZIP_TO_CITY[key] ?? null
}

/** True when the ZIP is one we have a named city for. */
export function isServedZip(zip: string | null | undefined): boolean {
  return cityFromZip(zip) !== null
}

/**
 * Human label for a lead's location, for alert subjects and HQ rows.
 * Falls back to `ZIP 76577` — still identifiable, but obviously a ZIP rather
 * than a bare number that reads like spam.
 */
export function formatCityOrZip(
  city: string | null | undefined,
  zip: string | null | undefined,
): string {
  const c = city?.trim()
  if (c) return c
  const z = zip?.trim()
  if (z) return `ZIP ${z}`
  return 'Unknown'
}
