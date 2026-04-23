export type MilitarySection = {
  headline: string
  copy: string
  keywords: string[]
}

export type LocationData = {
  slug: string
  name: string
  county: string
  zip: string
  lat: number
  lng: number
  metaTitle: string
  metaDescription: string
  heroHeadline: string
  heroCopy: string
  areaContext: string
  whyLocal: string
  services: string[]
  military?: MilitarySection   // only Killeen + Harker Heights
}

export const LOCATIONS: Record<string, LocationData> = {
  'harker-heights': {
    slug: 'harker-heights',
    name: 'Harker Heights',
    county: 'Bell County',
    zip: '76548',
    lat: 31.0804,
    lng: -97.6477,
    metaTitle: 'Metal Carports Harker Heights TX | Same-Week Install | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal builds welded or bolted metal carports in Harker Heights, TX — same-week installs, concrete pad included, Fort Cavazos military discount. Call 254-346-7764.',
    heroHeadline: 'Metal Carports in Harker Heights, TX — Same-Week Installs',
    heroCopy:
      "Harker Heights homeowners trust Triple J Metal LLC for durable metal carports installed fast. We're a local Central Texas company — not a national kit seller — which means we show up, weld it, and stand behind our work. PCS'ing to Fort Cavazos? We'll protect your vehicles before your household goods arrive.",
    areaContext:
      "We serve all of Harker Heights and the surrounding Bell County area, including neighborhoods near Fort Cavazos, Clear Creek Road, and the Killeen-Fort Hood Regional Airport corridor. Whether you're in an established neighborhood or a rural property on the outskirts, we come to you.",
    whyLocal:
      "Every national company targeting Harker Heights ships a kit and leaves you to figure out installation. Triple J Metal LLC is based in Temple — 15 minutes away — and we handle everything: site prep, concrete pad pouring, welding or bolting, and cleanup. One call, one company, done.",
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
      copy: "Fort Cavazos is minutes from Harker Heights, and we know what PCS season looks like. Military families need vehicle and equipment protection fast — not in 12 weeks. Triple J Metal builds RV covers, carports, and garages same-week, and we offer a Fort Cavazos military and first responder discount on every install. Mention your service when you call or check the military box on the quote form.",
      keywords: ['Fort Cavazos carport', 'military carport Harker Heights', 'PCS vehicle protection Bell County'],
    },
  },

  killeen: {
    slug: 'killeen',
    name: 'Killeen',
    county: 'Bell County',
    zip: '76541',
    lat: 31.1171,
    lng: -97.7278,
    metaTitle: 'Metal Carports Killeen TX | Turnkey + Concrete | Triple J Metal LLC',
    metaDescription:
      "Killeen's local metal carport installer. Triple J Metal builds welded or bolted carports with concrete pads in Killeen, TX — same-week installs, Fort Cavazos military discount. Call 254-346-7764.",
    heroHeadline: "Killeen's Local Metal Carport Builder — Turnkey, Concrete Included",
    heroCopy:
      "Killeen has no shortage of national companies selling carport kits — but Triple J Metal LLC is the only local Central Texas builder who shows up and installs it, pours the concrete pad, and hands you the keys. We serve the entire Killeen area including neighborhoods near Fort Cavazos, and we offer a military discount for active duty and veterans.",
    areaContext:
      "We serve all of Killeen, including areas near Fort Cavazos, Killeen-Fort Hood Regional Airport, Rosewood Heights, Westcliff, and the US-190 corridor into Copperas Cove. Rural properties welcome.",
    whyLocal:
      "The Carport Co., Viking Steel, and Infinity Carports all have Killeen pages — but none of them have a local crew or pour concrete. Triple J Metal LLC does. We offer same-week scheduling, a local phone number, welded steel, and the only turnkey concrete option you'll find from a local installer.",
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
      headline: 'Fort Cavazos Military Discount — Killeen',
      copy: "Fort Cavazos drives a constant flow of PCS moves through Killeen. Military families arrive on short notice and need vehicle protection immediately — not after a 12-week wait list. Triple J Metal LLC builds RV covers and carports same-week and offers a Fort Cavazos military and first responder discount. We use military-friendly language: BAH, VA Loans, PCS timelines — because we know this community.",
      keywords: ['turnkey carports Killeen', 'carports Fort Cavazos', 'military carport Killeen TX'],
    },
  },

  'copperas-cove': {
    slug: 'copperas-cove',
    name: 'Copperas Cove',
    county: 'Coryell County',
    zip: '76522',
    lat: 31.1224,
    lng: -97.907,
    metaTitle: 'Metal Carports Copperas Cove TX | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal LLC installs affordable metal carports in Copperas Cove, TX — welded or bolted red iron steel, concrete pad available, same-week installs. Call 254-346-7764 for a free quote.',
    heroHeadline: 'Affordable Metal Carports in Copperas Cove, TX',
    heroCopy:
      "Copperas Cove homeowners searching for a carport builder get hit with national kit companies that ship a package and walk away. Triple J Metal LLC is different — we're a local Central Texas crew that installs everything ourselves. Welded or bolted, residential or ranch, concrete pad included if needed.",
    areaContext:
      "We serve all of Copperas Cove and Coryell County, including neighborhoods near FM 116, the US-190 corridor, and rural properties heading toward Lampasas. We also regularly work in the neighboring communities of Kempner and Lampasas.",
    whyLocal:
      "Viking Steel, The Carport Co., and Get Carports all target Copperas Cove with location pages — but they're all national dealers. Triple J Metal LLC is based in Temple, 30 minutes away, and sends a real crew to build and install your structure from start to finish.",
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

  temple: {
    slug: 'temple',
    name: 'Temple',
    county: 'Bell County',
    zip: '76501',
    lat: 31.0982,
    lng: -97.3428,
    metaTitle: 'Metal Carports Temple TX | Local Builder | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal LLC is based in Temple, TX — your local metal carport builder. 150+ completed projects, welded and bolted red iron steel, concrete pad included. Call 254-346-7764.',
    heroHeadline: "Temple's Local Metal Carport Builders — 150+ Projects Completed",
    heroCopy:
      "Triple J Metal LLC is a Temple, TX company — this is our home base. We've completed over 150 carports, garages, and barns across Bell County. When you call us, you're talking to a local family that knows this area, knows the weather, and knows how to build a structure that lasts. One contract covers site prep, concrete, and installation.",
    areaContext:
      "We're based right here in Temple and serve all surrounding areas including North Temple, South Temple along I-35, East Temple near FM 93, and rural Bell County properties. We also service nearby Nolanville, Rogers, Belton, and Troy.",
    whyLocal:
      "We're not a chain. Triple J Metal LLC was founded by a Temple family and operates out of Temple. We source from regional Texas steel suppliers — real Texas steel, real Texas builders, multi-source so a single supplier shortage never delays your build. When other companies send a kit, we send a crew.",
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
  },

  belton: {
    slug: 'belton',
    name: 'Belton',
    county: 'Bell County',
    zip: '76513',
    lat: 31.0557,
    lng: -97.4641,
    metaTitle: 'Metal Carports Belton TX | Carports with Concrete | Triple J Metal LLC',
    metaDescription:
      'Need a metal carport in Belton, TX? Triple J Metal LLC installs welded and bolted carports with concrete pads in Belton and all of Bell County. Local Temple-based crew. Call 254-346-7764.',
    heroHeadline: 'Metal Carport Installation in Belton, TX — Concrete Pad Included',
    heroCopy:
      "Belton is right in Triple J Metal LLC's backyard. We're based in Temple, just minutes away, and we've built carports, garages, and barns throughout Bell County. If you're a Belton homeowner or rancher looking for a local builder who includes site prep and concrete — not a national brand shipping a flat-pack — you've found the right company.",
    areaContext:
      "We serve all of Belton and the Lake Belton area, including communities along US-190, FM 2271, and rural Bell County ranches. We're also close to Salado and Jarrell for customers on the southern end of Bell County.",
    whyLocal:
      "The Carport Co. and Dayton Barns both have Belton pages, but they're national outfits with no local crew. Triple J Metal LLC is 10 minutes from downtown Belton. We schedule faster, include concrete, and our crew actually knows your neighborhood.",
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

  salado: {
    slug: 'salado',
    name: 'Salado',
    county: 'Bell County',
    zip: '76571',
    lat: 30.9452,
    lng: -97.5344,
    metaTitle: 'Metal Carports Salado TX | Turnkey + Concrete | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal LLC builds custom metal carports in Salado, TX — welded or bolted red iron, concrete pad included, same-week installs. Local Temple crew 20 min away. Call 254-346-7764.',
    heroHeadline: 'Metal Carports in Salado, TX — Local Builder, Concrete Included',
    heroCopy:
      "Salado homeowners and ranchers don't have to wait weeks for a national carport company to ship a kit. Triple J Metal LLC is based in Temple — 20 minutes away — and our crew installs welded or bolted red iron structures with concrete pads in the same contract. One call, one company, done.",
    areaContext:
      "We serve all of Salado and the surrounding Bell County area, including rural properties along I-35, FM 2268, and the Robertson Creek corridor. We also regularly work in Jarrell and the southern end of Bell County.",
    whyLocal:
      "Most carport companies targeting Salado are national dealers with no local footprint. Triple J Metal LLC is a Temple family business — we drive 20 minutes to your property, build it ourselves, and include the concrete pad at no extra contract hassle.",
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
    metaTitle: 'Metal Carports Waco TX | Welded + Turnkey Concrete | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal LLC builds custom welded metal carports in Waco, TX — turnkey concrete included, same-week scheduling. Central Texas crew serving all of McLennan County. Call 254-346-7764.',
    heroHeadline: 'Metal Carport Builder Serving Waco, TX — Turnkey Concrete Included',
    heroCopy:
      "Waco homeowners and property owners searching for a real metal building contractor — not a kit shipper — have found the right company. Triple J Metal LLC is based in Temple, 45 minutes away, and we bring a full crew to weld or bolt your structure and pour the concrete pad, all in one contract.",
    areaContext:
      "We serve Waco and all of McLennan County, including Woodway, Hewitt, China Spring, and rural properties along the Brazos River corridor. We also serve neighboring communities like Hillsboro and Corsicana on larger projects.",
    whyLocal:
      "National dealers like Viking Steel and The Carport Co. have Waco landing pages, but no local crew. Triple J Metal LLC makes the 45-minute drive from Temple with our own team, steel from regional Texas suppliers (some right here in Waco), and a turnkey concrete option that nobody else provides.",
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

  georgetown: {
    slug: 'georgetown',
    name: 'Georgetown',
    county: 'Williamson County',
    zip: '78626',
    lat: 30.6333,
    lng: -97.6779,
    metaTitle: 'Metal Carports Georgetown TX | Welded Steel | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal LLC installs welded and bolted metal carports in Georgetown, TX — concrete pad included, same-week builds. Central Texas family crew. Call 254-346-7764.',
    heroHeadline: 'Metal Carport Installation in Georgetown, TX — Welded Steel + Concrete',
    heroCopy:
      "Georgetown is one of the fastest-growing cities in Texas — and property owners here are looking for carports, garages, and RV covers that match the quality of their homes. Triple J Metal LLC builds welded red iron structures in Georgetown, includes concrete pad pouring in the same contract, and gets it done without a 3-month wait.",
    areaContext:
      "We serve Georgetown and all of Williamson County, including Sun City, Berry Creek, and Teravista neighborhoods, as well as rural properties along Ronald Reagan Blvd and the Georgetown Lake area.",
    whyLocal:
      "Georgetown is about 60 minutes from our Temple base — worth the drive when no local installer offers turnkey concrete. We bring our own crew, our own Texas-sourced steel, and handle the full job start to finish.",
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
  },

  'round-rock': {
    slug: 'round-rock',
    name: 'Round Rock',
    county: 'Williamson County',
    zip: '78664',
    lat: 30.5083,
    lng: -97.6789,
    metaTitle: 'Metal Carports Round Rock TX | Turnkey Install | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal LLC builds custom metal carports and garages in Round Rock, TX — welded or bolted, concrete pad included. Central Texas family crew, same-week installs. Call 254-346-7764.',
    heroHeadline: 'Metal Carports & Garages in Round Rock, TX — Full Crew, Concrete Included',
    heroCopy:
      "Round Rock homeowners have plenty of national carport dealers to choose from — and none of them show up with a crew. Triple J Metal LLC is different. We drive from Temple, weld or bolt your structure on-site, and pour the concrete pad in the same contract. No kits, no subcontractors, no waiting.",
    areaContext:
      "We serve Round Rock and Williamson County, including Brushy Creek, Forest Creek, Teravista, and rural properties east of I-35 heading toward Taylor. We also build in the Pflugerville and Hutto corridor.",
    whyLocal:
      "Round Rock is 70 minutes from our Temple base — but we make the drive for jobs that require a full-service contractor with welded steel and turnkey concrete. No national dealer in your area offers what we do.",
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
  },

  lampasas: {
    slug: 'lampasas',
    name: 'Lampasas',
    county: 'Lampasas County',
    zip: '76550',
    lat: 31.0632,
    lng: -98.1793,
    metaTitle: 'Metal Carports Lampasas TX | Ranch Structures | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal LLC builds metal carports, barns, and ranch structures in Lampasas, TX — welded or bolted red iron, concrete included, same-week installs. Call 254-346-7764.',
    heroHeadline: 'Metal Carports & Ranch Structures in Lampasas, TX',
    heroCopy:
      "Lampasas and Lampasas County are ranch and farm country — and the structures here need to hold up to Hill Country weather without a kit falling apart. Triple J Metal LLC builds welded red iron carports, barns, and ranch structures in Lampasas with concrete pads poured in the same contract.",
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
    name: 'Holland',
    county: 'Bell County',
    zip: '76534',
    lat: 30.8796,
    lng: -97.4091,
    metaTitle: 'Metal Carports Holland TX | Bell County | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal LLC builds metal carports and barns in Holland, TX — welded or bolted red iron, concrete available. Local Bell County crew. Call 254-346-7764.',
    heroHeadline: 'Metal Carports & Barns in Holland, TX — Local Bell County Crew',
    heroCopy:
      "Holland is rural Bell County — and rural properties here need structures that are built right, not shipped in a box. Triple J Metal LLC builds welded and bolted carports, barns, and garages in Holland with same-week scheduling and concrete pad options included in one contract.",
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
    name: 'Taylor',
    county: 'Williamson County',
    zip: '76574',
    lat: 30.5711,
    lng: -97.4097,
    metaTitle: 'Metal Carports Taylor TX | Williamson County | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal LLC builds custom metal carports and garages in Taylor, TX — welded or bolted red iron steel, concrete pad included, same-week scheduling. Call 254-346-7764.',
    heroHeadline: 'Metal Carports & Garages in Taylor, TX — Welded Steel + Concrete',
    heroCopy:
      "Taylor is growing fast thanks to new development in Williamson County. Homeowners and property managers here need carports and garages that hold up to Central Texas weather. Triple J Metal LLC builds welded and bolted structures in Taylor with turnkey concrete included.",
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
    name: 'Troy',
    county: 'Bell County',
    zip: '76579',
    lat: 31.2057,
    lng: -97.2983,
    metaTitle: 'Metal Carports Troy TX | Bell County | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal LLC builds metal carports and barns in Troy, TX — welded or bolted red iron, concrete available, same-week installs. Local Temple-based Bell County crew. Call 254-346-7764.',
    heroHeadline: 'Metal Carports & Ranch Structures in Troy, TX',
    heroCopy:
      "Troy is a small rural Bell County community — and property owners here often get overlooked by the big carport dealers who only target the larger cities. Triple J Metal LLC serves Troy and surrounding rural Bell County with the same full-service install as anywhere else: welded or bolted steel, concrete if needed, one contract.",
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
    name: 'Nolanville',
    county: 'Bell County',
    zip: '76559',
    lat: 31.0799,
    lng: -97.6024,
    metaTitle: 'Metal Carports Nolanville TX | Bell County | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal LLC installs metal carports and garages in Nolanville, TX — 15 min from Temple, welded or bolted red iron, concrete included. Call 254-346-7764.',
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
    name: 'Bell County',
    county: 'Bell County',
    zip: '76513',
    lat: 31.0568,
    lng: -97.4647,
    metaTitle: 'Metal Buildings Bell County TX | Carports, Garages, Barns | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal builds welded or bolted metal carports, garages, and barns across all of Bell County, TX — Temple, Belton, Killeen, Harker Heights, Salado, Holland, Troy. Local crew, same-week installs. Call 254-346-7764.',
    heroHeadline: 'Bell County Metal Building Contractor — Temple, Belton, Killeen, Harker Heights',
    heroCopy:
      "Bell County is our home turf. Triple J Metal LLC is based in Temple and serves every Bell County community — Belton, Killeen, Harker Heights, Salado, Holland, Troy, Nolanville, Rogers — with welded or bolted metal carports, garages, barns, RV covers, and turnkey concrete. We've completed 150+ Bell County projects, we know the soil conditions, the permit thresholds, and the wind ratings the county requires.",
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
  },

  'mclennan-county': {
    slug: 'mclennan-county',
    name: 'McLennan County',
    county: 'McLennan County',
    zip: '76701',
    lat: 31.5494,
    lng: -97.1467,
    metaTitle: 'Metal Buildings McLennan County TX | Waco Metal Carports & Garages | Triple J Metal',
    metaDescription:
      "Triple J Metal builds welded metal carports, garages, and barns across McLennan County, TX — Waco, Hewitt, Woodway, China Spring, and rural properties along the Brazos. 45 min from our Temple yard. Call 254-346-7764.",
    heroHeadline: 'McLennan County Metal Building Contractor — Waco, Hewitt, Woodway, China Spring',
    heroCopy:
      "McLennan County property owners — homeowners, ranchers, and small commercial operators — work with Triple J Metal LLC for welded red iron carports, garages, barns, and RV covers across the entire county. We're 45 minutes from Waco, we bring our own crew, and we pour concrete in the same contract.",
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
    name: 'Coryell County',
    county: 'Coryell County',
    zip: '76528',
    lat: 31.4357,
    lng: -97.7558,
    metaTitle: 'Metal Buildings Coryell County TX | Copperas Cove, Gatesville | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal builds welded carports, garages, barns, and ranch structures across Coryell County, TX — Copperas Cove, Gatesville, and rural ag properties. Welded or bolted, concrete included. Call 254-346-7764.',
    heroHeadline: 'Coryell County Metal Building Contractor — Copperas Cove, Gatesville, Rural Ranch',
    heroCopy:
      "Coryell County is ranch country with a military edge — bordering Fort Cavazos in the east and stretching into the Hill Country in the west. Triple J Metal LLC builds welded barns, equipment covers, garages, and carports for Coryell County ranchers, military families in Copperas Cove, and homeowners in Gatesville — all with our own crew and turnkey concrete.",
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
    name: 'Williamson County',
    county: 'Williamson County',
    zip: '78626',
    lat: 30.6327,
    lng: -97.6772,
    metaTitle: 'Metal Buildings Williamson County TX | Georgetown, Round Rock, Taylor | Triple J Metal',
    metaDescription:
      "Triple J Metal builds welded metal carports, garages, RV covers, and HOA-compliant structures across Williamson County, TX — Georgetown, Round Rock, Taylor, Hutto, Liberty Hill. Same-week installs. Call 254-346-7764.",
    heroHeadline: 'Williamson County Metal Building Contractor — Georgetown, Round Rock, Taylor',
    heroCopy:
      "Williamson County is the fastest-growing county in Texas — and that growth means new homeowners constantly need carports, garages, RV covers, and HOA-compliant secondary structures. Triple J Metal LLC drives 60-90 minutes from our Temple yard to build with our own crew, our own steel, and turnkey concrete. National dealers can't say the same.",
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
    name: 'Lampasas County',
    county: 'Lampasas County',
    zip: '76550',
    lat: 31.0635,
    lng: -98.182,
    metaTitle: 'Metal Buildings Lampasas County TX | Carports, Barns, Ranch | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal builds welded metal carports, garages, ranch barns, and equipment covers across Lampasas County, TX — Lampasas, Lometa, Kempner. 45 min from Temple. Call 254-346-7764.',
    heroHeadline: 'Lampasas County Metal Building Contractor — Lampasas, Lometa, Kempner',
    heroCopy:
      "Lampasas County is Hill Country ranch territory — a mix of ag operators, weekend ranch owners, and small-town families. Triple J Metal LLC drives 45 minutes from Temple to build welded barns, equipment covers, carports, and RV covers for Lampasas County properties. We pour concrete in the same contract and haul our own steel.",
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
    name: 'Falls County',
    county: 'Falls County',
    zip: '76661',
    lat: 31.3091,
    lng: -96.8966,
    metaTitle: 'Metal Buildings Falls County TX | Marlin, Rosebud, Lott | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal builds welded carports, barns, garages, and equipment covers across Falls County, TX — Marlin, Rosebud, Lott, and rural ag properties. 40 min from Temple. Call 254-346-7764.',
    heroHeadline: 'Falls County Metal Building Contractor — Marlin, Rosebud, Lott',
    heroCopy:
      "Falls County is rural East Bell — small towns, working farms, and ag properties along the Brazos and Little River. Triple J Metal LLC builds welded carports, barns, equipment covers, and ranch structures for Falls County operators with our own crew and our own steel. 40 minutes from our Temple yard.",
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
    name: 'Milam County',
    county: 'Milam County',
    zip: '76520',
    lat: 30.8552,
    lng: -96.9772,
    metaTitle: 'Metal Buildings Milam County TX | Cameron, Rockdale, Thorndale | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal builds welded carports, garages, barns, and equipment covers across Milam County, TX — Cameron, Rockdale, Thorndale, and rural ag properties. 50 min from Temple. Call 254-346-7764.',
    heroHeadline: 'Milam County Metal Building Contractor — Cameron, Rockdale, Thorndale',
    heroCopy:
      "Milam County mixes small-town residential and a strong ag/ranch base — and most national metal-building contractors skip past it on their way to Austin. Triple J Metal LLC drives 50 minutes from Temple to build welded carports, garages, barns, and equipment covers for Milam County properties with one contract and one local crew.",
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
    name: 'Burnet County',
    county: 'Burnet County',
    zip: '78611',
    lat: 30.7588,
    lng: -98.2289,
    metaTitle: 'Metal Buildings Burnet County TX | Burnet, Marble Falls, Bertram | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal builds welded metal carports, garages, RV covers, and Hill Country ranch structures across Burnet County, TX — Burnet, Marble Falls, Bertram, Granite Shoals. 75 min from Temple. Call 254-346-7764.',
    heroHeadline: 'Burnet County Metal Building Contractor — Burnet, Marble Falls, Bertram',
    heroCopy:
      "Burnet County is Hill Country and Highland Lakes — ranch land, weekend properties, and lakefront homes that all need quality steel structures. Triple J Metal LLC drives 75 minutes from Temple to build welded carports, garages, RV covers, and ranch barns for Burnet County properties. Hill Country drainage and rocky soil don't slow us down.",
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
