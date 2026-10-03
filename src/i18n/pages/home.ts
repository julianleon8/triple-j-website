import { bilingual } from "@/i18n/config";
import { SITE } from "@/lib/site";

/**
 * Homepage copy. "From $X" figures are the steel + install floors from
 * dev/sales-pack-2026-04-30.md (carport 20×20 $3,000; garage 30×30 $5,500;
 * barn $6,500, Decisions 2026-10-01). Never improvise a price here; the
 * Spanish side carries the same numbers (src/i18n/parity.test.ts).
 */
export const HOME = bilingual(
  {
    meta: {
      title: "Metal Carports, Garages & Barns, Temple TX",
      description: `Welded or bolted metal carports, garages, barns and RV covers from ${SITE.name}, Temple TX. Concrete available, same-week scheduling. Call ${SITE.phone}.`,
      ogTitle: "Metal Carports, Garages & Barns in Central Texas — Triple J Metal",
      ogDescription: "Welded or bolted metal buildings built by our Temple TX crew — concrete available, same-week scheduling.",
    },
    hero: {
      imgAlt: "23×35 carport with gutters built by Triple J Metal in Rogers, Texas",
      kicker: "Family-owned · Temple, Texas",
      h1: ["Built right.", "Built fast.", "Built by Triple J."],
      lede: {
        before: "Carports, garages, barns and patios,",
        welded: "welded or bolted",
        middle: "on your property by",
        crew: "our own Central Texas crew",
        after: ".",
      },
      quote: "Get a Free Quote",
      builds: "See Our Builds",
      scroll: "Scroll",
    },
    builds: {
      eyebrow: "Our builds",
      line1: "Real jobs, real addresses.",
      line2: "Built down the road.",
      lede: "Every photo is a Triple J crew job in Central Texas, pulled straight from our live gallery with the title and city we filed it under.",
    },
    services: {
      eyebrow: "What we build",
      line1: "Welded or bolted.",
      line2: "Built whole, by us.",
      lede: "Every structure is sold welded, bolted, or turnkey — with turnkey, site prep, concrete and installation sit on one contract. No kits, no subcontractors.",
      cards: [
        {
          eyebrow: "Carports & RV Covers",
          headline: "Welded or bolted, residential or ranch.",
          blurb:
            "Single, double, triple, custom spans — or extra-tall clearance for RVs, boats and trailers. Built and installed by our crew, usually within the week.",
          img: "/images/carport-gable-residential.jpg",
          price: "3,000",
          href: "/services/carports",
        },
        {
          eyebrow: "Garages",
          headline: "Enclosed shop space — your spec, our crew.",
          blurb:
            "30×30 bolted steel-and-install base starts here. Walls, roll-up doors, walk-throughs, and insulation are quoted on top per your spec.",
          img: "/images/metal-garage-green.jpg",
          price: "5,500",
          href: "/services/metal-garages",
        },
        {
          eyebrow: "Barns",
          headline: "Pole, equipment, hay — built to span.",
          blurb: "Long clear-spans for ag and ranch use. Welded red-iron primary, sheet on the skin.",
          img: "/images/carport-concrete-rural.jpg",
          price: "6,500",
          href: "/services/barns",
        },
      ],
      from: "From",
      steelInstall: "steel + install",
      seeBuilds: "See builds →",
      fencing: {
        imgAlt: "Metal ranch fencing built by Triple J Metal",
        kicker: "Now quoting fencing",
        title: "Metal fences. Gates.",
        titleAccent: "A better boundary.",
        body: "Privacy, pipe and ranch, and ornamental metal fencing for Temple, Belton, Killeen and nearby.",
        explore: "Explore fencing & gates",
        quote: "Get a fencing quote",
      },
    },
  },
  {
    meta: {
      title: "Cocheras, garajes y graneros metálicos en Temple, TX",
      description: `Cocheras, garajes, graneros y cubiertas para RV metálicos, soldados o atornillados, de ${SITE.name} en Temple, TX. Concreto disponible, instalación en la misma semana. Llama al ${SITE.phone}.`,
      ogTitle: "Cocheras, garajes y graneros metálicos en el centro de Texas — Triple J Metal",
      ogDescription:
        "Edificios metálicos soldados o atornillados, construidos por nuestro equipo de Temple, TX — concreto disponible, instalación en la misma semana.",
    },
    hero: {
      imgAlt: "Cochera de 23×35 con canaletas construida por Triple J Metal en Rogers, Texas",
      kicker: "Empresa familiar · Temple, Texas",
      h1: ["Hecho bien.", "Hecho rápido.", "Hecho por Triple J."],
      lede: {
        before: "Cocheras, garajes, graneros y patios,",
        welded: "soldados o atornillados",
        middle: "en tu propiedad, por",
        crew: "nuestro propio equipo del centro de Texas",
        after: ".",
      },
      quote: "Cotización gratis",
      builds: "Ver nuestras obras",
      scroll: "Desliza",
    },
    builds: {
      eyebrow: "Nuestras obras",
      line1: "Trabajos reales, direcciones reales.",
      line2: "Construidos aquí cerca.",
      lede: "Cada foto es un trabajo de nuestro equipo en el centro de Texas, tomada directo de nuestra galería con el título y la ciudad con que la registramos.",
    },
    services: {
      eyebrow: "Lo que construimos",
      line1: "Soldado o atornillado.",
      line2: "Completo, y lo hacemos nosotros.",
      lede: "Cada estructura se vende soldada, atornillada o llave en mano — con llave en mano, la preparación del terreno, el concreto y la instalación van en un solo contrato. Sin kits, sin subcontratistas.",
      cards: [
        {
          eyebrow: "Cocheras y cubiertas para RV",
          headline: "Soldadas o atornilladas, para casa o rancho.",
          blurb:
            "Sencillas, dobles, triples o a la medida — o con altura extra para RV, lanchas y remolques. Las construye e instala nuestro equipo, normalmente en la misma semana.",
          img: "/images/carport-gable-residential.jpg",
          price: "3,000",
          href: "/services/carports",
        },
        {
          eyebrow: "Garajes",
          headline: "Un taller cerrado — tus medidas, nuestro equipo.",
          blurb:
            "Aquí empieza el precio base de un 30×30 atornillado, acero e instalación. Paredes, puertas enrollables, puertas peatonales y aislamiento se cotizan aparte, según lo que pidas.",
          img: "/images/metal-garage-green.jpg",
          price: "5,500",
          href: "/services/metal-garages",
        },
        {
          eyebrow: "Graneros",
          headline: "Para equipo, pacas o animales — con claros amplios.",
          blurb: "Claros largos sin columnas para uso agrícola y de rancho. Estructura principal de viga roja soldada, con lámina de forro.",
          img: "/images/carport-concrete-rural.jpg",
          price: "6,500",
          href: "/services/barns",
        },
      ],
      from: "Desde",
      steelInstall: "acero + instalación",
      seeBuilds: "Ver obras →",
      fencing: {
        imgAlt: "Cerca metálica de rancho construida por Triple J Metal",
        kicker: "Ya cotizamos cercas",
        title: "Cercas metálicas. Portones.",
        titleAccent: "Un mejor lindero.",
        body: "Cercas metálicas de privacidad, de tubo y rancho, y ornamentales para Temple, Belton, Killeen y alrededores.",
        explore: "Ver cercas y portones",
        quote: "Cotizar una cerca",
      },
    },
  },
);
