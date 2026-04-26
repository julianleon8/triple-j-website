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
}

export const LOCATIONS: Record<string, LocationData> = {
  'harker-heights': {
    slug: 'harker-heights',
    heroImageAlt: 'Welded metal carport on a Harker Heights, Texas residential property near Fort Cavazos',
    name: 'Harker Heights',
    county: 'Bell County',
    zip: '76548',
    lat: 31.0804,
    lng: -97.6477,
    metaTitle: 'Metal Carports Harker Heights TX | Same-Week Install',
    metaDescription:
      'Welded or bolted metal carports in Harker Heights, TX — same-week installs, concrete pad included, Fort Cavazos military discount.',
    heroHeadline: 'Metal Carports in Harker Heights, TX — Same-Week Installs',
    heroCopy:
      "Harker Heights homeowners trust Triple J Metal for durable metal carports installed fast. We're a local Central Texas company — not a national kit seller — which means we show up, weld it, and stand behind our work. PCS'ing to Fort Cavazos? We'll protect your vehicles before your household goods arrive.",
    areaContext:
      "We serve all of Harker Heights and the surrounding Bell County area, including neighborhoods near Fort Cavazos, Clear Creek Road, and the Killeen-Fort Hood Regional Airport corridor. Whether you're in an established neighborhood or a rural property on the outskirts, we come to you.",
    whyLocal:
      "Every national company targeting Harker Heights ships a kit and leaves you to figure out installation. Triple J Metal is based in Temple — 15 minutes away — and we handle everything: site prep, concrete pad pouring, welding or bolting, and cleanup. One call, one company, done.",
    services: [
      'Welded or bolted red iron carports',
      'Bolted metal carports',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'Concrete pad pouring',
      'Lean-to patios',
      'House additions',
    ],
    military: {
      headline: 'Fort Cavazos Military Discount — Harker Heights',
      copy: "Fort Cavazos is minutes from Harker Heights, and we know what PCS season looks like. Military families need vehicle and equipment protection fast — not in 12 weeks. Triple J Metal builds RV covers, carports, and garages same-week, and we offer a 7% Fort Cavazos military and first responder discount on every install. Mention your service when you call or check the military box on the quote form.",
      keywords: ['Fort Cavazos carport', 'military carport Harker Heights', 'PCS vehicle protection Bell County'],
    },
    callouts: [
      {
        eyebrow: 'Fort Cavazos PCS',
        headline: '7% military discount + same-week installs.',
        blurb:
          "Active-duty, retired, Reserve/Guard, and first responders get 7% off every install — welded, bolted, or turnkey. Built around PCS calendars, deployment dates, and TDY blocks instead of 12-week franchise wait lists. Hablamos español.",
        ctaLabel: 'See Fort Cavazos page',
        ctaHref: '/military',
      },
    ],
    relatedPosts: [
      'fort-cavazos-pcs-metal-carport',
      'bell-county-metal-building-permit-guide-2025',
      'hoa-compliant-metal-buildings-heritage-oaks-bella-charca',
    ],
  },

  killeen: {
    slug: 'killeen',
    name: 'Killeen',
    county: 'Bell County',
    zip: '76541',
    lat: 31.1171,
    lng: -97.7278,
    metaTitle: 'Metal Carports Killeen TX | Built for Fort Cavazos Timelines',
    metaDescription:
      "Killeen's local metal building crew — welded or bolted carports, RV covers, and garages built same-week for Fort Cavazos PCS timelines. Concrete included. Hablamos español.",
    // Legacy fallbacks (used if new fields below aren't populated)
    heroHeadline: "Built in Killeen. Built for Fort Cavazos.",
    heroCopy:
      "Killeen has no shortage of national companies selling carport kits — but Triple J Metal is the only local Central Texas builder who shows up and installs it, pours the concrete pad, and hands you the keys. PCS orders don't wait, and neither do we.",
    areaContext:
      "We serve all of Killeen, including areas near Fort Cavazos, Killeen-Fort Hood Regional Airport, Rosewood Heights, Westcliff, and the US-190 corridor into Copperas Cove. Rural properties welcome.",
    whyLocal:
      "The Carport Co., Viking Steel, and Infinity Carports all have Killeen pages — but none of them have a local crew or pour concrete. Triple J Metal does. We offer same-week scheduling, a local phone number, welded steel, and the only turnkey concrete option you'll find from a local installer.",
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
      copy: "Fort Cavazos drives a constant flow of PCS moves through Killeen. Military families arrive on short notice and need vehicle protection immediately — not after a 12-week wait list. Triple J Metal builds RV covers and carports same-week and honors a 7% Fort Cavazos military and first-responder discount. We speak the language: BAH, VA loans, PCS timelines, base-area HOA rules.",
      keywords: ['turnkey carports Killeen', 'carports Fort Cavazos', 'military carport Killeen TX'],
    },

    // ── NEW personalization (military-first per 2026-04-23 design pass) ──
    // Photo TODO: hero + landmark images currently use placeholder Triple J
    // photos. Replace with real Fort Cavazos main gate + Stillhouse Hollow
    // shots when sourced from Unsplash / Pexels — alt text already accurate.
    heroImage: '/images/red-iron-frame-hero.jpg',
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
        name: 'Fort Cavazos',
        blurb:
          "We build for the Fort Cavazos community across every PCS season — from incoming families needing carports to retiring veterans protecting RVs and tools.",
        // imageSrc TODO: Unsplash search 'fort hood gate' / 'army base gate texas'
      },
      {
        name: 'Stillhouse Hollow Lake',
        blurb:
          "South Killeen's lake-and-marina country. RVs, boats, and trailers belong under cover before hail season — we build extra-tall clearance covers same-week.",
        // imageSrc TODO: Unsplash search 'central texas lake' / 'stillhouse hollow'
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
      "4,000 PSI concrete poured for Bell County's expansive clay soils — in the same contract",
      'Same-week scheduling — built around PCS arrivals and hail-season urgency, not a 12-week wait list',
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
    heroImageAlt: 'Welded metal carport on a Copperas Cove, Texas property in Coryell County',
    name: 'Copperas Cove',
    county: 'Coryell County',
    zip: '76522',
    lat: 31.1224,
    lng: -97.907,
    metaTitle: 'Metal Carports Copperas Cove TX',
    metaDescription:
      'Affordable metal carports in Copperas Cove, TX — welded or bolted red iron steel, concrete pad available, same-week installs. Call for a free quote.',
    heroHeadline: 'Affordable Metal Carports in Copperas Cove, TX',
    heroCopy:
      "Copperas Cove homeowners searching for a carport builder get hit with national kit companies that ship a package and walk away. Triple J Metal is different — we're a local Central Texas crew that installs everything ourselves. Welded or bolted, residential or ranch, concrete pad included if needed.",
    areaContext:
      "We serve all of Copperas Cove and Coryell County, including neighborhoods near FM 116, the US-190 corridor, and rural properties heading toward Lampasas. We also regularly work in the neighboring communities of Kempner and Lampasas.",
    whyLocal:
      "Viking Steel, The Carport Co., and Get Carports all target Copperas Cove with location pages — but they're all national dealers. Triple J Metal is based in Temple, 30 minutes away, and sends a real crew to build and install your structure from start to finish.",
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
    callouts: [
      {
        eyebrow: 'Fort Cavazos PCS',
        headline: 'Back-gate access — same-week installs.',
        blurb:
          "Cove sits at the back gate of Fort Cavazos. Triple J Metal serves Cove military families on the same same-week timeline and 7% Fort Cavazos military and first-responder discount we offer in Killeen and Harker Heights. PCS in, structure built before household goods land. Hablamos español.",
        ctaLabel: 'See Fort Cavazos page',
        ctaHref: '/military',
      },
      {
        eyebrow: 'Coryell County reach',
        headline: 'From Cove out through Kempner + Lampasas.',
        blurb:
          "We work the FM 116 corridor and the US-190 stretch heading west — Kempner ranches, Lampasas county lines, the rural properties along Lampasas River. Same crew, same week, same turnkey concrete option.",
        ctaLabel: 'See Lampasas builds',
        ctaHref: '/locations/lampasas',
      },
    ],
  },

  temple: {
    slug: 'temple',
    name: 'Temple',
    county: 'Bell County',
    zip: '76501',
    lat: 31.0982,
    lng: -97.3428,
    metaTitle: 'Metal Carports Temple TX | HQ · 3319 Tem-Bel Ln',
    metaDescription:
      "Triple J's home shop in Temple, TX. Welded or bolted carports, garages, RV covers — same-week across Western Hills, Lake Belton, and all of Temple. Hablamos español.",
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
    // Photo TODO: hero + 3 landmark images currently use placeholder (hero = existing
    // Triple J residential photo). Replace with real Lake Belton + Santa Fe Depot +
    // Scott & White + Temple-area shots when sourced from Unsplash/Pexels and dropped
    // into /public/images/locations/temple/. Alt text already accurate.
    heroImage: '/images/carport-gable-residential.jpg',
    heroImageAlt: 'Lake Belton near Temple, Texas',
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
        // imageSrc TODO: Unsplash 'lake belton texas' / 'central texas lake'
      },
      {
        name: 'Santa Fe Depot',
        blurb:
          "The 1910 depot anchors downtown Temple and the city's railroad heritage. Built to last over a century — the same standard we hold ourselves to with welded red-iron framing.",
        // imageSrc TODO: Unsplash 'santa fe depot temple texas' / 'historic train depot texas'
      },
      {
        name: 'Scott & White',
        blurb:
          "Baylor Scott & White is Temple's biggest employer and pulls professional families into Western Hills, Heritage Acres, and the lakeside developments — the residential market we know best.",
        // imageSrc TODO: Unsplash 'medical center texas' / 'modern hospital exterior'
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
      "4,000 PSI concrete poured for Bell County's expansive clay soils — in the same contract.",
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
    metaTitle: "Metal Carports Belton TX | Bell County's Home Crew",
    metaDescription:
      "Belton's local metal building crew — 15 min from our Temple shop. Welded or bolted carports, ranch barns, and lakeside RV covers. Permits handled. Hablamos español.",
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
    // Photo TODO: hero + 3 landmark images currently use placeholder Triple J photos.
    // Replace with real Bell County Courthouse + Lake Belton + Pendleton ranch + downtown
    // Belton shots when sourced from Unsplash/Pexels into /public/images/locations/belton/.
    // Alt text already accurate.
    heroImage: '/images/double-carport-install.jpg',
    heroImageAlt: 'Bell County Courthouse in downtown Belton, Texas',
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
        name: 'Bell County Courthouse',
        blurb:
          "1885 limestone landmark and the seat of permit authority for the whole county. We've pulled permits through these doors more times than we can count — it's part of what 'local' actually means.",
        // imageSrc TODO: Unsplash 'bell county courthouse' / 'historic texas courthouse'
      },
      {
        name: 'Lake Belton & BLORA',
        blurb:
          "Belton's lake country runs along the western edge — Lakeshore Drive properties, weekend barns, RV and boat covers. Lakeside structures we've been building for years.",
        // imageSrc TODO: Unsplash 'lake belton texas' / 'central texas lake'
      },
      {
        name: 'Pendleton & Ranch Country',
        blurb:
          "South Bell County opens into pasture, ranch land, and rural property. Welded red-iron barns, equipment sheds, and lean-tos — the structures rural buyers actually need.",
        // imageSrc TODO: Unsplash 'texas ranch pasture' / 'rural texas farm'
      },
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
      "We know the Bell County permit office by first name — pulling permits in Belton is part of our regular week.",
      "15 min from our Temple shop — fastest install in Bell County, no national-dealer dispatch lag.",
      "4,000 PSI concrete poured for Bell County's expansive clay soils — same contract.",
      "Welded OR bolted red-iron — your choice for Texas wind, hail, and the long haul.",
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
    heroImageAlt: 'Welded metal building on a Salado, Texas ranch property in Bell County',
    name: 'Salado',
    county: 'Bell County',
    zip: '76571',
    lat: 30.9452,
    lng: -97.5344,
    metaTitle: 'Metal Carports Salado TX | Turnkey + Concrete',
    metaDescription:
      'Custom metal carports in Salado, TX — welded or bolted red iron, concrete pad included, same-week installs. Local Temple crew 20 min away.',
    heroHeadline: 'Metal Carports in Salado, TX — Local Builder, Concrete Included',
    heroCopy:
      "Salado homeowners and ranchers don't have to wait weeks for a national carport company to ship a kit. Triple J Metal is based in Temple — 20 minutes away — and our crew installs welded or bolted red iron structures with concrete pads in the same contract. One call, one company, done.",
    areaContext:
      "We serve all of Salado and the surrounding Bell County area, including rural properties along I-35, FM 2268, and the Robertson Creek corridor. We also regularly work in Jarrell and the southern end of Bell County.",
    whyLocal:
      "Most carport companies targeting Salado are national dealers with no local footprint. Triple J Metal is a Temple family business — we drive 20 minutes to your property, build it ourselves, and include the concrete pad at no extra contract hassle.",
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
  },

  waco: {
    slug: 'waco',
    name: 'Waco',
    county: 'McLennan County',
    zip: '76701',
    lat: 31.5493,
    lng: -97.1467,
    metaTitle: 'Metal Carports & Buildings in Waco, TX | Same-Week Welded Installs',
    metaDescription:
      "Metal carport Waco TX — welded or bolted red iron, turnkey concrete, same-week installs across McLennan County. Magnolia-inspired residential, ranch barns for Hewitt, Woodway, Robinson, China Spring. Hablamos español.",
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
    // Photo TODO: hero + 3 landmark images currently use existing Triple J photos.
    // Replace with Waco landmark shots (Magnolia silos, Lake Waco, Baylor) when sourced
    // from Unsplash/Pexels into /public/images/locations/waco/. Alt text already accurate.
    // Note (per Decisions.md 2026-04-23): supplier-agnostic positioning — never name
    // a specific Waco supplier (e.g. MetalMax) in customer copy. Phrase as "regional
    // Texas steel suppliers" or "supplier relationships rooted in McLennan County."
    heroImage: '/images/carport-concrete-rural.jpg',
    heroImageAlt: 'McLennan County ranch property with metal building near Waco, Texas',
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
      },
      {
        name: 'Lake Waco',
        blurb:
          "60+ miles of shoreline and the weekend center for west McLennan. Lakeside RV covers, boat covers, and shoreline barns are routine work — we engineer for the wind exposure that comes with open lake frontage.",
      },
      {
        name: 'Baylor University',
        blurb:
          "Baylor pulls professional families into Woodway and Hewitt and a steady student-rental market closer in. The neighborhoods around campus are mixed — HOA-compliant secondary structures and rental-property carports both come up regularly.",
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
    metaTitle: 'Metal Carports & Buildings in Georgetown, TX | Same-Week Welded Installs',
    metaDescription:
      "Metal carport Georgetown TX — welded or bolted red iron, turnkey concrete, same-week installs while local contractors are 4–6 weeks out. Sun City RV covers, Liberty Hill ranch barns, San Gabriel River foundations.",
    // Legacy fallbacks (used if new fields below aren't populated)
    heroHeadline: 'Built for Georgetown. Same-week, while everyone else waits.',
    heroCopy:
      "Most Georgetown contractors are quoting 4–6 weeks out. Triple J isn't. We're a Temple-based family crew that drives 70 miles south, welds or bolts your structure on-site, and pours the concrete pad in the same contract. Sun City RVs, Liberty Hill ranch property, San Gabriel-adjacent homes — all built same-week.",
    areaContext:
      "We serve all of Georgetown and the surrounding Williamson County corridor — Sun City, Berry Creek, Georgetown Lake, the Liberty Hill ranch country to the west, and old-town Georgetown around Southwestern University. RV covers, ranch barns, and HOA-compliant residential are our day-in-day-out work in this market.",
    whyLocal:
      "Georgetown's contractor pool is booked 4–6 weeks out. Triple J is same-week, with our own welders, our own concrete crew, and engineering for whatever the soil and water table actually do under your slab. National kit-shippers won't show up here at all. We will.",
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
    heroImageAlt: 'San Gabriel River near Georgetown, Texas',
    customHeadline: {
      line1: 'Built for Georgetown.',
      line2: 'Same-week, while everyone else waits.',
    },
    heroSubhead:
      "Most Georgetown contractors are 4–6 weeks out. We're not. Triple J drives 70 miles south from Temple — Sun City RV covers, Liberty Hill ranch barns, San Gabriel River-adjacent foundations engineered for what the soil actually does.",
    distanceFromTemple: '70 mi south · 1 hr 10 min from HQ',
    habla: true,
    localIntro:
      "Georgetown is split between Sun City retirees protecting RVs and golf carts, San Gabriel-adjacent properties that flood-pulse with the river, and Liberty Hill ranch land that's growing into Williamson County's last open country. The local contractor pool is booked 4–6 weeks out — Triple J is same-week, with our own welders, our own concrete, and engineering for whatever the soil and water table actually do under your slab. Hablamos español con Juan y Freddy.",
    landmarks: [
      {
        name: 'San Gabriel River',
        blurb:
          "The river runs through downtown and along the north edge of town — and the riparian properties near it need erosion-conscious foundations. We pour 4,000 PSI concrete with anchor depth set for the actual flood-pulse zone, not a generic spec.",
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
      'Same-week scheduling — most Georgetown contractors are quoting 4–6 weeks. Triple J builds before they call you back.',
      'Sun City RV covers and golf-cart enclosures — extra-tall clearance, HOA-grade aesthetic, sized for the rigs retirees actually drive.',
      'San Gabriel River-adjacent foundations — 4,000 PSI concrete and anchor depth engineered for flood-pulse properties and seasonal water tables.',
      "Liberty Hill ranch country — welded red-iron barns, equipment sheds, and lean-tos for Williamson County's growing rural property base.",
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
    metaTitle: 'Metal Carports & Buildings in Round Rock, TX | Same-Week Welded Installs',
    metaDescription:
      "Metal carport Round Rock TX — welded or bolted red iron, turnkey concrete, same-week installs. HOA-compliant builds for Brushy Creek, Forest Creek, Teravista, Cedar Park, and Pflugerville. Hablamos español.",
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
      "Edwards Plateau caliche or Blackland Prairie clay — we engineer 4,000 PSI concrete and anchor depth for the soil actually under your slab, not a national average.",
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
        ctaLabel: 'Williamson County overview',
        ctaHref: '/locations/williamson-county',
      },
    ],
  },

  lampasas: {
    slug: 'lampasas',
    heroImageAlt: 'Welded metal building on a Lampasas, Texas property in Lampasas County',
    name: 'Lampasas',
    county: 'Lampasas County',
    zip: '76550',
    lat: 31.0632,
    lng: -98.1793,
    metaTitle: 'Metal Carports Lampasas TX | Ranch Structures',
    metaDescription:
      'Metal carports, barns, and ranch structures in Lampasas, TX — welded or bolted red iron, concrete included, same-week installs.',
    heroHeadline: 'Metal Carports & Ranch Structures in Lampasas, TX',
    heroCopy:
      "Lampasas and Lampasas County are ranch and farm country — and the structures here need to hold up to Hill Country weather without a kit falling apart. Triple J Metal builds welded red iron carports, barns, and ranch structures in Lampasas with concrete pads poured in the same contract.",
    areaContext:
      "We serve all of Lampasas County, including rural ranch properties along US-281, FM 580, and the Colorado River corridor. We regularly work in Kempner and Copperas Cove as well.",
    whyLocal:
      "Lampasas is 45 minutes from Temple — close enough for our crew to make the drive with no travel fee on most jobs. National dealers who target this area ship kits with no installer. We show up and build it.",
    services: [
      'Welded or bolted red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal barns',
      'Metal garages',
      'Ranch structures',
      'RV and boat covers',
      'Lean-to patios',
      'House additions',
    ],
  },

  holland: {
    slug: 'holland',
    heroImageAlt: 'Welded metal building on a Holland, Texas rural property in Bell County',
    name: 'Holland',
    county: 'Bell County',
    zip: '76534',
    lat: 30.8796,
    lng: -97.4091,
    metaTitle: 'Metal Carports Holland TX | Bell County',
    metaDescription:
      'Triple J Metal builds metal carports and barns in Holland, TX — welded or bolted red iron, concrete available. Local Bell County crew. Call 254-346-7764.',
    heroHeadline: 'Metal Carports & Barns in Holland, TX — Local Bell County Crew',
    heroCopy:
      "Holland is rural Bell County — and rural properties here need structures that are built right, not shipped in a box. Triple J Metal builds welded and bolted carports, barns, and garages in Holland with same-week scheduling and concrete pad options included in one contract.",
    areaContext:
      "We serve Holland and surrounding rural Bell County, including properties along FM 93, FM 2115, and the Elm Creek corridor heading toward Temple and Georgetown.",
    whyLocal:
      "Holland is a short drive from our Temple base. We know Bell County inside and out — the soils, the weather patterns, the permit requirements. Local crew, local knowledge, one contract.",
    services: [
      'Welded or bolted red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal barns',
      'Metal garages',
      'Ranch structures',
      'Lean-to patios',
      'House additions',
    ],
  },

  taylor: {
    slug: 'taylor',
    heroImageAlt: 'Welded metal building on a Taylor, Texas property in Williamson County',
    name: 'Taylor',
    county: 'Williamson County',
    zip: '76574',
    lat: 30.5711,
    lng: -97.4097,
    metaTitle: 'Metal Carports Taylor TX | Williamson County',
    metaDescription:
      'Custom metal carports and garages in Taylor, TX — welded or bolted red iron steel, concrete pad included, same-week scheduling.',
    heroHeadline: 'Metal Carports & Garages in Taylor, TX — Welded Steel + Concrete',
    heroCopy:
      "Taylor is growing fast thanks to new development in Williamson County. Homeowners and property managers here need carports and garages that hold up to Central Texas weather. Triple J Metal builds welded and bolted structures in Taylor with turnkey concrete included.",
    areaContext:
      "We serve all of Taylor and surrounding Williamson County, including Granger, Hutto, and rural properties along SH-95 and FM 1660.",
    whyLocal:
      "Taylor is about 55 minutes from Temple — close enough for our crew on standard residential and commercial jobs. No national kit dealer in this market includes concrete or installs with their own crew.",
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
  },

  troy: {
    slug: 'troy',
    heroImageAlt: 'Welded metal building on a Troy, Texas property in Bell County',
    name: 'Troy',
    county: 'Bell County',
    zip: '76579',
    lat: 31.2057,
    lng: -97.2983,
    metaTitle: 'Metal Carports Troy TX | Bell County',
    metaDescription:
      'Metal carports and barns in Troy, TX — welded or bolted red iron, concrete available, same-week installs. Local Temple-based Bell County crew.',
    heroHeadline: 'Metal Carports & Ranch Structures in Troy, TX',
    heroCopy:
      "Troy is a small rural Bell County community — and property owners here often get overlooked by the big carport dealers who only target the larger cities. Triple J Metal serves Troy and surrounding rural Bell County with the same full-service install as anywhere else: welded or bolted steel, concrete if needed, one contract.",
    areaContext:
      "We serve Troy and rural north Bell County, including properties along US-79, FM 935, and the Little River corridor. We're also close to Lott, Rosebud, and Marlin.",
    whyLocal:
      "Troy is a short drive from our Temple base. We treat every job the same — rural or suburban, small carport or large barn. Same crew, same contract, same standards.",
    services: [
      'Welded or bolted red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal barns',
      'Metal garages',
      'Ranch structures',
      'Lean-to patios',
      'House additions',
    ],
  },

  nolanville: {
    slug: 'nolanville',
    heroImageAlt: 'Welded metal carport on a Nolanville, Texas property near Fort Cavazos',
    name: 'Nolanville',
    county: 'Bell County',
    zip: '76559',
    lat: 31.0799,
    lng: -97.6024,
    metaTitle: 'Metal Carports Nolanville TX | Bell County',
    metaDescription:
      'Triple J Metal installs metal carports and garages in Nolanville, TX — 15 min from Temple, welded or bolted red iron, concrete included. Call 254-346-7764.',
    heroHeadline: 'Metal Carports & Garages in Nolanville, TX — 15 Minutes from Temple',
    heroCopy:
      "Nolanville sits between Temple and Killeen on the Bell County corridor — prime Triple J Metal territory. We're 15 minutes from Nolanville and build welded or bolted carports, garages, and RV covers with concrete pads included in the same contract. Same-week scheduling, local crew.",
    areaContext:
      "We serve Nolanville and the surrounding Bell County corridor, including communities along US-190, Sparta Road, and properties between Killeen and Temple. We're also close to Harker Heights and Gatesville.",
    whyLocal:
      "Nolanville is practically in our backyard. We've built throughout Bell County and know the permit requirements, soil types, and what structures hold up in this part of Texas. One call, one company.",
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
  },

  // ─── COUNTIES (county-wide SEO surfaces) ────────────────────────────────────
  // Each county groups multiple cities under one URL so we rank for
  // "metal carport [County] TX" searches without writing per-city duplicate copy.

  'bell-county': {
    slug: 'bell-county',
    heroImageAlt: 'Welded metal building on a Bell County, Texas property',
    name: 'Bell County',
    county: 'Bell County',
    zip: '76513',
    lat: 31.0568,
    lng: -97.4647,
    metaTitle: 'Metal Buildings Bell County TX | Carports, Garages, Barns',
    metaDescription:
      'Welded or bolted metal carports, garages, and barns across Bell County — Temple, Belton, Killeen, Harker Heights, Salado, Holland, Troy. Local crew, same-week installs.',
    heroHeadline: 'Bell County Metal Building Contractor — Temple, Belton, Killeen, Harker Heights',
    heroCopy:
      "Bell County is our home turf. Triple J Metal is based in Temple and serves every Bell County community — Belton, Killeen, Harker Heights, Salado, Holland, Troy, Nolanville, Rogers — with welded or bolted metal carports, garages, barns, RV covers, and turnkey concrete. We've completed 150+ Bell County projects, we know the soil conditions, the permit thresholds, and the wind ratings the county requires.",
    areaContext:
      "Bell County stretches from rural farmland in the east to the Fort Cavazos military region in the west. We serve the entire county — Temple's I-35 corridor, Belton's lake communities, Killeen's PCS-driven housing market, Harker Heights' subdivisions, Salado's historic downtown, and rural ag properties on FM roads. Every drive is under 45 minutes from our Temple yard.",
    whyLocal:
      "We're the only metal building contractor based inside Bell County with a full in-house crew, our own welder-owners, and turnkey concrete in the same contract. National kit-shippers have Bell County landing pages but no local crew. Triple J shows up.",
    services: [
      'Welded or bolted red iron carports',
      'Metal garages',
      'Turnkey carports with concrete pads',
      'Metal barns and ranch structures',
      'RV and boat covers',
      'HOA-compliant structures',
      'Lean-to patios',
      'House additions',
    ],
    military: {
      headline: 'Fort Cavazos Military Discount — All of Bell County',
      copy: "Fort Cavazos sits in western Bell County and drives the local PCS economy. Triple J Metal builds RV covers, carports, and garages same-week for active duty and veteran families across Killeen, Harker Heights, Nolanville, Copperas Cove, and Belton. Mention your service when you call or check the military box on the quote form for your discount.",
      keywords: ['Bell County military carport', 'Fort Cavazos PCS protection', 'Killeen Harker Heights military discount'],
    },
    relatedPosts: ['bell-county-metal-building-permit-guide-2025'],
  },

  'mclennan-county': {
    slug: 'mclennan-county',
    heroImageAlt: 'Welded metal building on a McLennan County, Texas ranch property',
    name: 'McLennan County',
    county: 'McLennan County',
    zip: '76701',
    lat: 31.5494,
    lng: -97.1467,
    metaTitle: 'Metal Buildings McLennan County TX | Waco Metal Carports & Garages',
    metaDescription:
      'Welded metal carports, garages, and barns across McLennan County — Waco, Hewitt, Woodway, China Spring, and rural properties along the Brazos. 45 min from Temple.',
    heroHeadline: 'McLennan County Metal Building Contractor — Waco, Hewitt, Woodway, China Spring',
    heroCopy:
      "McLennan County property owners — homeowners, ranchers, and small commercial operators — work with Triple J Metal for welded red iron carports, garages, barns, and RV covers across the entire county. We're 45 minutes from Waco, we bring our own crew, and we pour concrete in the same contract.",
    areaContext:
      "We serve all of McLennan County, including Waco proper, the Hewitt and Woodway suburbs, China Spring rural properties, the Brazos River corridor, and ag properties from Riesel to Crawford. Larger commercial projects on the McLennan side of I-35 are routine for us.",
    whyLocal:
      "National dealers like Viking Steel and The Carport Co. have Waco landing pages but no local crew. Triple J makes the 45-minute drive from Temple with our own team and our own steel — and a turnkey concrete option no McLennan competitor offers as one contract.",
    services: [
      'Welded or bolted red iron carports',
      'Metal garages',
      'Turnkey carports with concrete pads',
      'Metal barns and ranch structures',
      'RV and boat covers',
      'Equipment covers',
      'House additions',
    ],
  },

  'coryell-county': {
    slug: 'coryell-county',
    heroImageAlt: 'Welded metal building on a Coryell County, Texas property',
    name: 'Coryell County',
    county: 'Coryell County',
    zip: '76528',
    lat: 31.4357,
    lng: -97.7558,
    metaTitle: 'Metal Buildings Coryell County TX | Copperas Cove, Gatesville',
    metaDescription:
      'Welded carports, garages, barns, and ranch structures across Coryell County — Copperas Cove, Gatesville, and rural ag properties. Welded or bolted, concrete included.',
    heroHeadline: 'Coryell County Metal Building Contractor — Copperas Cove, Gatesville, Rural Ranch',
    heroCopy:
      "Coryell County is ranch country with a military edge — bordering Fort Cavazos in the east and stretching into the Hill Country in the west. Triple J Metal builds welded barns, equipment covers, garages, and carports for Coryell County ranchers, military families in Copperas Cove, and homeowners in Gatesville — all with our own crew and turnkey concrete.",
    areaContext:
      "We serve all of Coryell County, including Copperas Cove (military-heavy, adjacent to Fort Cavazos), Gatesville (the county seat with a strong ranching base), and rural ag properties along TX-36 and FM-116. Large barns and equipment covers are routine work for us in this county.",
    whyLocal:
      "Coryell County's mix of military families and ag operators needs a contractor who can switch gears between a quick PCS-timeline carport and a 60×80 hay barn. Triple J's in-house welders + skid-steer (40 ft reach) handle both. We're 30-45 minutes from anywhere in the county.",
    services: [
      'Welded or bolted red iron carports',
      'Metal garages',
      'Turnkey carports with concrete pads',
      'Metal barns and ranch structures',
      'Equipment covers',
      'RV and boat covers',
      'Hybrid projects (custom builds)',
    ],
    military: {
      headline: 'Fort Cavazos Military Discount — Copperas Cove + Western Coryell',
      copy: "Copperas Cove sits at the back gate of Fort Cavazos. Triple J Metal serves Cove military families on the same same-week timeline and same Fort Cavazos military discount we offer in Killeen and Harker Heights. PCS in, structure built before your household goods land.",
      keywords: ['Copperas Cove military carport', 'Fort Cavazos back gate', 'Coryell County PCS protection'],
    },
  },

  'williamson-county': {
    slug: 'williamson-county',
    heroImageAlt: 'Welded metal building on a Williamson County, Texas property',
    name: 'Williamson County',
    county: 'Williamson County',
    zip: '78626',
    lat: 30.6327,
    lng: -97.6772,
    metaTitle: 'Metal Buildings Williamson County TX | Georgetown, Round Rock, Taylor',
    metaDescription:
      'Welded carports, garages, RV covers, and HOA-compliant structures across Williamson County — Georgetown, Round Rock, Taylor, Hutto, Liberty Hill. Same-week installs.',
    heroHeadline: 'Williamson County Metal Building Contractor — Georgetown, Round Rock, Taylor',
    heroCopy:
      "Williamson County is the fastest-growing county in Texas — and that growth means new homeowners constantly need carports, garages, RV covers, and HOA-compliant secondary structures. Triple J Metal drives 60-90 minutes from our Temple yard to build with our own crew, our own steel, and turnkey concrete. National dealers can't say the same.",
    areaContext:
      "We serve all of Williamson County, including Georgetown's Sun City and Berry Creek subdivisions, Round Rock's commercial and residential corridors, Taylor's growing market, Hutto, Liberty Hill, Cedar Park, and Leander. HOA-compliant standing-seam systems are a frequent ask in the higher-end developments here.",
    whyLocal:
      "Williamson County HOAs (Heritage Oaks, Bella Charca, Sun City) often require concealed-fastener panels and color continuity with the primary residence — exactly what we specialize in. Most national kit-shippers can't meet HOA architectural requirements; we can.",
    services: [
      'Welded or bolted red iron carports',
      'Metal garages',
      'Turnkey carports with concrete pads',
      'HOA-compliant structures',
      'RV and boat covers',
      'Lean-to patios',
      'House additions',
    ],
  },

  'lampasas-county': {
    slug: 'lampasas-county',
    heroImageAlt: 'Welded metal building on a Lampasas County, Texas property',
    name: 'Lampasas County',
    county: 'Lampasas County',
    zip: '76550',
    lat: 31.0635,
    lng: -98.182,
    metaTitle: 'Metal Buildings Lampasas County TX | Carports, Barns, Ranch',
    metaDescription:
      'Welded metal carports, garages, ranch barns, and equipment covers across Lampasas County — Lampasas, Lometa, Kempner. 45 min from Temple.',
    heroHeadline: 'Lampasas County Metal Building Contractor — Lampasas, Lometa, Kempner',
    heroCopy:
      "Lampasas County is Hill Country ranch territory — a mix of ag operators, weekend ranch owners, and small-town families. Triple J Metal drives 45 minutes from Temple to build welded barns, equipment covers, carports, and RV covers for Lampasas County properties. We pour concrete in the same contract and haul our own steel.",
    areaContext:
      "We serve all of Lampasas County, including Lampasas (county seat), Lometa, Kempner, and rural ranch properties along US-281 and TX-183. Large ag barns and equipment covers are typical work here. Many properties are ag-exempt and have flexible permit thresholds.",
    whyLocal:
      "Lampasas County properties often need 40+ ft tall barns or wide-span equipment covers — work most carport contractors won't take. Our skid-steer reaches 40 feet and our welders are equipped for the larger spans. One trip from Temple, one contract, done.",
    services: [
      'Metal barns and ranch structures',
      'Equipment covers',
      'Welded or bolted red iron carports',
      'Metal garages',
      'RV and boat covers',
      'Hybrid projects (custom builds)',
      'Lean-to patios',
    ],
  },

  'falls-county': {
    slug: 'falls-county',
    heroImageAlt: 'Welded metal building on a Falls County, Texas property',
    name: 'Falls County',
    county: 'Falls County',
    zip: '76661',
    lat: 31.3091,
    lng: -96.8966,
    metaTitle: 'Metal Buildings Falls County TX | Marlin, Rosebud, Lott',
    metaDescription:
      'Welded carports, barns, garages, and equipment covers across Falls County — Marlin, Rosebud, Lott, and rural ag properties. 40 min from Temple.',
    heroHeadline: 'Falls County Metal Building Contractor — Marlin, Rosebud, Lott',
    heroCopy:
      "Falls County is rural East Bell — small towns, working farms, and ag properties along the Brazos and Little River. Triple J Metal builds welded carports, barns, equipment covers, and ranch structures for Falls County operators with our own crew and our own steel. 40 minutes from our Temple yard.",
    areaContext:
      "We serve all of Falls County, including Marlin (county seat), Rosebud, Lott, Reagan, and rural FM-road properties throughout the Brazos River bottomland. Practical, working ag structures are our specialty here — barns sized for hay storage, equipment covers for tractors and implements, livestock shelters.",
    whyLocal:
      "Falls County is too rural for most national contractors to bother with — but it's a 40-minute drive from our Temple yard. We treat Marlin and Rosebud projects with the same crew, same steel, and same turnkey concrete option as a Bell County build.",
    services: [
      'Metal barns and ranch structures',
      'Equipment covers',
      'Welded or bolted red iron carports',
      'Metal garages',
      'RV and boat covers',
      'Hybrid projects (custom builds)',
    ],
  },

  'milam-county': {
    slug: 'milam-county',
    heroImageAlt: 'Welded metal building on a Milam County, Texas property',
    name: 'Milam County',
    county: 'Milam County',
    zip: '76520',
    lat: 30.8552,
    lng: -96.9772,
    metaTitle: 'Metal Buildings Milam County TX | Cameron, Rockdale, Thorndale',
    metaDescription:
      'Welded carports, garages, barns, and equipment covers across Milam County — Cameron, Rockdale, Thorndale, and rural ag properties. 50 min from Temple.',
    heroHeadline: 'Milam County Metal Building Contractor — Cameron, Rockdale, Thorndale',
    heroCopy:
      "Milam County mixes small-town residential and a strong ag/ranch base — and most national metal-building contractors skip past it on their way to Austin. Triple J Metal drives 50 minutes from Temple to build welded carports, garages, barns, and equipment covers for Milam County properties with one contract and one local crew.",
    areaContext:
      "We serve all of Milam County, including Cameron (county seat), Rockdale, Thorndale, Buckholts, and rural FM-road properties throughout the county. We're equally comfortable on a Cameron residential carport and a Rockdale ranch hay barn.",
    whyLocal:
      "Milam County's distance from Austin and Waco means most national contractors quote a long lead time and a travel surcharge. Triple J's 50-minute drive from Temple costs you nothing extra — same crew, same steel, same week.",
    services: [
      'Welded or bolted red iron carports',
      'Metal garages',
      'Metal barns and ranch structures',
      'Equipment covers',
      'RV and boat covers',
      'Turnkey carports with concrete pads',
      'Hybrid projects (custom builds)',
    ],
  },

  'burnet-county': {
    slug: 'burnet-county',
    heroImageAlt: 'Welded metal building on a Burnet County, Texas property',
    name: 'Burnet County',
    county: 'Burnet County',
    zip: '78611',
    lat: 30.7588,
    lng: -98.2289,
    metaTitle: 'Metal Buildings Burnet County TX | Burnet, Marble Falls, Bertram',
    metaDescription:
      'Welded carports, garages, RV covers, and Hill Country ranch structures across Burnet County — Burnet, Marble Falls, Bertram, Granite Shoals. 75 min from Temple.',
    heroHeadline: 'Burnet County Metal Building Contractor — Burnet, Marble Falls, Bertram',
    heroCopy:
      "Burnet County is Hill Country and Highland Lakes — ranch land, weekend properties, and lakefront homes that all need quality steel structures. Triple J Metal drives 75 minutes from Temple to build welded carports, garages, RV covers, and ranch barns for Burnet County properties. Hill Country drainage and rocky soil don't slow us down.",
    areaContext:
      "We serve all of Burnet County, including Burnet (county seat), Marble Falls (Highland Lakes resort area), Bertram, Granite Shoals, and rural ranch properties throughout the Hill Country. Lakefront RV covers, hilltop carports, and ranch equipment barns are routine work for us here.",
    whyLocal:
      "Burnet County's Hill Country terrain — caliche, granite, and rocky soil — requires real grading and proper anchor placement. Most national kit-shippers have no answer for it. Triple J brings the right anchor specs, the right concrete depth (4,000 PSI for expansive ground conditions), and our own crew to install on terrain other contractors won't touch.",
    services: [
      'Welded or bolted red iron carports',
      'Metal garages',
      'Metal barns and ranch structures',
      'RV and boat covers',
      'Equipment covers',
      'Turnkey carports with concrete pads',
      'Hybrid projects (custom builds)',
    ],
  },
}

export const LOCATION_SLUGS = Object.keys(LOCATIONS)
