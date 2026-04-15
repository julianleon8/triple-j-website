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
    metaTitle: 'Metal Carports Harker Heights TX | 48-Hour Install | Triple J Metal LLC',
    metaDescription:
      'Triple J Metal builds custom welded and bolted metal carports in Harker Heights, TX — 48-hour installs, concrete pad included, Fort Cavazos military discount. Call 254-346-7764.',
    heroHeadline: 'Metal Carports in Harker Heights, TX — Built in Under 48 Hours',
    heroCopy:
      "Harker Heights homeowners trust Triple J Metal LLC for durable metal carports installed fast. We're a local Central Texas company — not a national kit seller — which means we show up, weld it, and stand behind our work. PCS'ing to Fort Cavazos? We'll protect your vehicles before your household goods arrive.",
    areaContext:
      "We serve all of Harker Heights and the surrounding Bell County area, including neighborhoods near Fort Cavazos, Clear Creek Road, and the Killeen-Fort Hood Regional Airport corridor. Whether you're in an established neighborhood or a rural property on the outskirts, we come to you.",
    whyLocal:
      "Every national company targeting Harker Heights ships a kit and leaves you to figure out installation. Triple J Metal LLC is based in Temple — 15 minutes away — and we handle everything: site prep, concrete pad pouring, welding or bolting, and cleanup. One call, one company, done.",
    services: [
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'Concrete pad pouring',
    ],
    military: {
      headline: 'Fort Cavazos Military Discount — Harker Heights',
      copy: "Fort Cavazos is minutes from Harker Heights, and we know what PCS season looks like. Military families need vehicle and equipment protection fast — not in 12 weeks. Triple J Metal builds RV covers, carports, and garages in under 48 hours, and we offer a Fort Cavazos military and first responder discount on every install. Mention your service when you call or check the military box on the quote form.",
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
      "Killeen's local metal carport installer. Triple J Metal builds welded carports with concrete pads in Killeen, TX — 48-hour installs, Fort Cavazos military discount. Call 254-346-7764.",
    heroHeadline: "Killeen's Local Metal Carport Builder — Turnkey, Concrete Included",
    heroCopy:
      "Killeen has no shortage of national companies selling carport kits — but Triple J Metal LLC is the only local Central Texas builder who shows up and installs it, pours the concrete pad, and hands you the keys. We serve the entire Killeen area including neighborhoods near Fort Cavazos, and we offer a military discount for active duty and veterans.",
    areaContext:
      "We serve all of Killeen, including areas near Fort Cavazos, Killeen-Fort Hood Regional Airport, Rosewood Heights, Westcliff, and the US-190 corridor into Copperas Cove. Rural properties welcome.",
    whyLocal:
      "The Carport Co., Viking Steel, and Infinity Carports all have Killeen pages — but none of them have a local crew or pour concrete. Triple J Metal LLC does. We offer same-week scheduling, a local phone number, welded steel, and the only turnkey concrete option you'll find from a local installer.",
    services: [
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
    ],
    military: {
      headline: 'Fort Cavazos Military Discount — Killeen',
      copy: "Fort Cavazos drives a constant flow of PCS moves through Killeen. Military families arrive on short notice and need vehicle protection immediately — not after a 12-week wait list. Triple J Metal LLC builds RV covers and carports in under 48 hours and offers a Fort Cavazos military and first responder discount. We use military-friendly language: BAH, VA Loans, PCS timelines — because we know this community.",
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
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
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
      "We're not a chain. Triple J Metal LLC was founded by a Temple family and operates out of Temple. Our suppliers are MetalMax in Waco and MetalMart — real Texas steel, real Texas builders. When other companies send a kit, we send a crew.",
    services: [
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'HOA-compliant structures',
      'Ranch structures',
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
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'Ranch structures',
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
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
      'Ranch structures',
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
      "National dealers like Viking Steel and The Carport Co. have Waco landing pages, but no local crew. Triple J Metal LLC makes the 45-minute drive from Temple with our own team, steel from MetalMax in Waco itself, and a turnkey concrete option that nobody else provides.",
    services: [
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
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
      "Georgetown is about 60 minutes from our Temple base — worth the drive when no local installer offers turnkey concrete. We bring our own crew, our own steel from MetalMax, and handle the full job start to finish.",
    services: [
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'HOA-compliant structures',
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
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'HOA-compliant structures',
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
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal barns',
      'Metal garages',
      'Ranch structures',
      'RV and boat covers',
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
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal barns',
      'Metal garages',
      'Ranch structures',
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
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
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
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal barns',
      'Metal garages',
      'Ranch structures',
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
      'Custom welded red iron carports',
      'Bolted metal carports',
      'Turnkey carports with concrete pads',
      'Metal garages',
      'RV and boat covers',
      'Metal barns',
    ],
  },
}

export const LOCATION_SLUGS = Object.keys(LOCATIONS)
