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
}

export const LOCATION_SLUGS = Object.keys(LOCATIONS)
