import { bilingual } from '@/i18n/config'

/** `/services/pbr-vs-pbu-panels` and `/es/servicios/paneles-pbr-vs-pbu`. */
export const PBR_PAGE = bilingual(
  {
    meta: {
      title: 'PBR vs PBU Roofing Panels — Which to Pick',
      description:
        'PBR vs PBU metal roofing panels: when to use each. Triple J Metal builds with both across Central Texas — which panel type fits your project?',
      ogTitle: 'PBR vs PBU Metal Panels | Triple J Metal',
      ogDescription: 'PBR vs PBU — which metal roofing panel is right for your carport, garage, or barn in Central Texas?',
    },
    jsonLd: {
      name: 'PBR vs PBU Roofing Panels — Which to Pick',
      description:
        'PBR vs PBU metal roofing panels: when to use each, and which fits your carport, garage, or barn in Central Texas.',
    },
    breadcrumbs: { services: 'Services', page: 'PBR vs PBU Panels' },
    hero: {
      eyebrow: 'Material Guide',
      h1a: 'PBR vs PBU Metal Roofing Panels',
      h1b: 'Which One Do You Need?',
      lede: 'Both PBR and PBU panels are high-quality metal roofing options used in Central Texas metal buildings. The right choice depends on your budget, aesthetics, and how much long-term maintenance you want to deal with. Here’s what the difference actually means for your project.',
      quote: 'Get a Free Panel Quote',
      ask: 'Ask Us —',
    },
    what: {
      heading: 'What Each Panel Actually Is',
      pbr: {
        title: 'PBR Panel',
        expansion: 'Purlin Bearing Rib',
        body: 'PBR is an exposed-fastener R-panel profile — the most widely used commercial roofing panel in Texas. Screws go through the face of the panel into the steel purlin below. When installed correctly with quality sealant washers, PBR panels are weathertight, durable, and cost-effective for the vast majority of metal building projects.',
        points: [
          'Most economical panel option',
          'Standard for carports, barns, and agricultural buildings',
          'Wide color and gauge availability from regional Texas suppliers',
          'Proven decades of performance in Central Texas',
        ],
      },
      pbu: {
        title: 'PBU Panel',
        expansion: 'Panel Base Under (Hidden Fastener)',
        body: 'PBU uses the same R-panel profile but with a concealed fastening system — the screw clips under the overlapping rib, so nothing penetrates the panel face. The result is a cleaner visual profile with no exposed screw heads on the roof surface. Better for HOA-grade builds where aesthetics matter, and lower maintenance since fastener points aren’t exposed to weather.',
        points: [
          'No exposed fasteners on the roof surface',
          'Cleaner look for HOA neighborhoods and luxury builds',
          'Reduced long-term maintenance on fastener points',
          'Higher upfront cost — labor and materials',
        ],
      },
    },
    compare: {
      heading: 'Side-by-Side Comparison',
      attribute: 'Attribute',
      pbr: 'PBR Panel',
      pbu: 'PBU Panel',
      rows: [
        {
          attribute: 'Fastener type',
          pbr: 'Exposed screws through panel face',
          pbu: 'Hidden fasteners under the overlapping rib',
        },
        {
          attribute: 'Aesthetics',
          pbr: 'Standard — visible screw heads on roof surface',
          pbu: 'Cleaner — no exposed fasteners visible from below',
        },
        {
          attribute: 'Water resistance',
          pbr: 'Good — industry standard, proper install is weathertight',
          pbu: 'Better — fasteners not exposed to weather at all',
        },
        {
          attribute: 'Cost',
          pbr: 'Lower — most economical commercial panel',
          pbu: 'Higher — labor and materials both cost more',
        },
        {
          attribute: 'Best for',
          pbr: 'Carports, barns, agricultural, commercial',
          pbu: 'HOA neighborhoods, high-end residential, showrooms',
        },
        {
          attribute: 'Long-term maintenance',
          pbr: 'Check and re-torque screws every few years',
          pbu: 'Lower maintenance — no exposed fastener points to monitor',
        },
        {
          attribute: 'Availability',
          pbr: 'Standard — widest color and gauge selection',
          pbu: 'Slightly more limited — check with us on color options',
        },
      ],
    },
    recommend: {
      line1: 'What Triple J Recommends',
      line2: 'And Why',
      // p1 and p2 each open with a bold sentence.
      p1: {
        before: 'For the majority of carports, barns, and garages we build in Central Texas — ',
        strong: 'PBR is the right call.',
        after:
          ' It’s cost-effective, weather-proven, and when we install it correctly with proper sealant-backed screws, it performs for decades without issues. The exposed-fastener design is also easier to inspect and maintain if you ever need to.',
      },
      p2: {
        strong: 'PBU makes sense when aesthetics are a priority.',
        after:
          ' If you’re in a Heritage Oaks or Bella Charca neighborhood, your HOA may expect cleaner finishes — or you simply want a structure that looks more architectural and less industrial. In that case, the extra cost of PBU is worth it.',
      },
      p3: 'When you fill out the quote form below or call us, just mention which look you want — or tell us your HOA requirements if you have them. We’ll recommend the right panel for your specific project.',
      steelLabel: 'Our steel',
      steel:
        'Triple J Metal sources PBR and PBU panels from leading regional Texas suppliers — Galvalume® substrate with painted finishes backed by a 40-year paint warranty, in 26-gauge and 29-gauge depending on your application. Multi-source so we’re never bottlenecked when a single supplier runs short.',
    },
    faq: {
      heading: 'Frequently Asked Questions',
      items: [
        {
          q: 'Can I mix PBR and PBU on the same building?',
          a: "In most cases, no — you'd typically choose one panel system per structure. However, you might use PBR on the roof and a standing seam option on visible wall panels if aesthetics are the driver. Ask us during your quote and we'll walk you through what makes sense.",
        },
        {
          q: 'Does PBU cost significantly more?',
          a: 'PBU panels themselves cost more per square foot, and installation takes longer since the fastener system is different. We quote PBR and PBU side by side, so you see the difference on your build before you choose.',
        },
        {
          q: 'Are PBR panels weathertight?',
          a: 'Yes — when installed correctly with sealant-backed screws and proper lapping, PBR panels are fully weathertight. The exposed fastener is not a weakness when the installation is done right. Triple J Metal uses correct torque and sealant on every screw.',
        },
        {
          q: 'Which panel holds up better in Texas hail?',
          a: 'Both PBR and PBU panels in 26-gauge perform similarly in hail events. If hail resistance is a specific concern, the gauge of steel matters more than the fastener style — ask us about upgrading to 26-gauge on your project.',
        },
      ],
    },
    related: {
      label: 'Related Services',
      links: [
        { href: '/services/carports', label: 'Metal Carports →' },
        { href: '/services/hoa-compliant-structures', label: 'HOA-Compliant Structures →' },
        { href: '/services/turnkey-carports-with-concrete', label: 'Turnkey + Concrete →' },
        { href: '/services', label: 'All Services →' },
      ],
    },
    og: {
      alt: 'Triple J Metal — PBR vs PBU metal roofing panels compared',
      eyebrow: 'Panel Guide',
      headline: 'PBR vs PBU Metal Roofing Panels',
      accent: 'Which One Do You Need?',
      subhead:
        'Both PBR and PBU panels are high-quality metal roofing options used in Central Texas metal buildings. The right choice depends on your budget, aesthetics, and how much long-term maintenance you want to deal with.',
    },
  },
  {
    meta: {
      title: 'Paneles PBR vs PBU para techo: cuál elegir',
      description:
        'Paneles de techo metálico PBR vs PBU: cuándo usar cada uno. Triple J Metal construye con los dos en el centro de Texas — ¿cuál encaja en tu proyecto?',
      ogTitle: 'Paneles metálicos PBR vs PBU | Triple J Metal',
      ogDescription:
        'PBR vs PBU — ¿qué panel de techo metálico es el ideal para tu cochera, garaje o granero en el centro de Texas?',
    },
    jsonLd: {
      name: 'Paneles PBR vs PBU para techo: cuál elegir',
      description:
        'Paneles de techo metálico PBR vs PBU: cuándo usar cada uno y cuál encaja en tu cochera, garaje o granero en el centro de Texas.',
    },
    breadcrumbs: { services: 'Servicios', page: 'Paneles PBR vs PBU' },
    hero: {
      eyebrow: 'Guía de materiales',
      h1a: 'Paneles metálicos para techo PBR vs PBU',
      h1b: '¿Cuál necesitas?',
      lede: 'Los paneles PBR y PBU son opciones de techo metálico de alta calidad que se usan en edificios metálicos del centro de Texas. La mejor opción depende de tu presupuesto, de la estética y de cuánto mantenimiento a largo plazo quieres atender. Esto es lo que la diferencia significa en realidad para tu proyecto.',
      quote: 'Cotización gratis de paneles',
      ask: 'Pregúntanos —',
    },
    what: {
      heading: 'Qué es en realidad cada panel',
      pbr: {
        title: 'Panel PBR',
        expansion: 'Purlin Bearing Rib (nervadura de apoyo sobre la correa)',
        body: 'PBR es un perfil de panel R-Panel de tornillería expuesta — el panel de techo comercial más usado en Texas. Los tornillos atraviesan la cara del panel y se fijan a la correa (purlin) de acero que está debajo. Cuando se instalan correctamente con arandelas selladoras de calidad, los paneles PBR son impermeables, durables y económicos para la gran mayoría de los proyectos de edificios metálicos.',
        points: [
          'La opción de panel más económica',
          'Estándar para cocheras, graneros y edificios agrícolas',
          'Gran variedad de colores y calibres de proveedores regionales de Texas',
          'Décadas de buen desempeño comprobado en el centro de Texas',
        ],
      },
      pbu: {
        title: 'Panel PBU',
        expansion: 'Panel Base Under (tornillería oculta)',
        body: 'PBU usa el mismo perfil R-Panel pero con un sistema de sujeción oculto — el tornillo se sujeta con un clip debajo de la nervadura que se traslapa, así que nada atraviesa la cara del panel. El resultado es un perfil visual más limpio, sin cabezas de tornillo expuestas en la superficie del techo. Es mejor para obras con estándares de HOA donde importa la estética, y requiere menos mantenimiento porque los puntos de sujeción no quedan expuestos a la intemperie.',
        points: [
          'Sin tornillería expuesta en la superficie del techo',
          'Un aspecto más limpio para vecindarios con HOA y obras de lujo',
          'Menos mantenimiento a largo plazo en los puntos de sujeción',
          'Mayor costo inicial — mano de obra y materiales',
        ],
      },
    },
    compare: {
      heading: 'Comparación lado a lado',
      attribute: 'Característica',
      pbr: 'Panel PBR',
      pbu: 'Panel PBU',
      rows: [
        {
          attribute: 'Tipo de sujeción',
          pbr: 'Tornillos expuestos que atraviesan la cara del panel',
          pbu: 'Tornillería oculta bajo la nervadura que se traslapa',
        },
        {
          attribute: 'Estética',
          pbr: 'Estándar — cabezas de tornillo visibles en la superficie del techo',
          pbu: 'Más limpia — no se ve tornillería expuesta desde abajo',
        },
        {
          attribute: 'Resistencia al agua',
          pbr: 'Buena — estándar de la industria; con una buena instalación es impermeable',
          pbu: 'Mejor — la tornillería no queda expuesta a la intemperie',
        },
        {
          attribute: 'Costo',
          pbr: 'Menor — el panel comercial más económico',
          pbu: 'Mayor — la mano de obra y los materiales cuestan más',
        },
        {
          attribute: 'Ideal para',
          pbr: 'Cocheras, graneros, uso agrícola, comercial',
          pbu: 'Vecindarios con HOA, residencial de gama alta, salas de exhibición',
        },
        {
          attribute: 'Mantenimiento a largo plazo',
          pbr: 'Revisa y vuelve a apretar los tornillos cada pocos años',
          pbu: 'Menos mantenimiento — no hay puntos de tornillería expuestos que vigilar',
        },
        {
          attribute: 'Disponibilidad',
          pbr: 'Estándar — la mayor variedad de colores y calibres',
          pbu: 'Un poco más limitada — pregúntanos por las opciones de color',
        },
      ],
    },
    recommend: {
      line1: 'Lo que recomienda Triple J',
      line2: 'Y por qué',
      p1: {
        before: 'Para la mayoría de las cocheras, graneros y garajes que construimos en el centro de Texas — ',
        strong: 'PBR es la decisión correcta.',
        after:
          ' Es económico, probado contra el clima y, cuando lo instalamos correctamente con tornillos con sellador, rinde por décadas sin problemas. El diseño de tornillería expuesta también es más fácil de inspeccionar y de mantener si algún día lo necesitas.',
      },
      p2: {
        strong: 'PBU tiene sentido cuando la estética es una prioridad.',
        after:
          ' Si vives en un vecindario como Heritage Oaks o Bella Charca, tu HOA puede esperar acabados más limpios — o simplemente quieres una estructura que se vea más arquitectónica y menos industrial. En ese caso, el costo extra del PBU vale la pena.',
      },
      p3: 'Cuando llenes el formulario de cotización de abajo o nos llames, solo dinos qué aspecto quieres — o cuéntanos los requisitos de tu HOA si los tienes. Te recomendamos el panel adecuado para tu proyecto en específico.',
      steelLabel: 'Nuestro acero',
      steel:
        'Triple J Metal compra paneles PBR y PBU a proveedores regionales líderes de Texas — sustrato Galvalume® con acabados pintados respaldados por una garantía de pintura de 40 años, en calibre 26 y calibre 29 según tu aplicación. Varias fuentes de suministro, para que nunca nos quedemos detenidos cuando un solo proveedor se queda corto.',
    },
    faq: {
      heading: 'Preguntas frecuentes',
      items: [
        {
          q: '¿Puedo combinar PBR y PBU en el mismo edificio?',
          a: 'En la mayoría de los casos, no — normalmente se elige un solo sistema de paneles por estructura. Sin embargo, podrías usar PBR en el techo y una opción de junta alzada en los paneles de pared visibles si la estética es lo que más importa. Pregúntanos durante tu cotización y te explicamos qué tiene sentido.',
        },
        {
          q: '¿El PBU cuesta mucho más?',
          a: 'Los paneles PBU cuestan más por pie cuadrado, y la instalación tarda más porque el sistema de sujeción es distinto. Cotizamos PBR y PBU lado a lado, para que veas la diferencia en tu obra antes de elegir.',
        },
        {
          q: '¿Los paneles PBR son impermeables?',
          a: 'Sí — cuando se instalan correctamente con tornillos con sellador y el traslape adecuado, los paneles PBR son totalmente impermeables. El tornillo expuesto no es una debilidad cuando la instalación está bien hecha. Triple J Metal usa el torque correcto y sellador en cada tornillo.',
        },
        {
          q: '¿Qué panel aguanta mejor el granizo de Texas?',
          a: 'Tanto los paneles PBR como los PBU en calibre 26 se comportan de forma parecida ante el granizo. Si te preocupa en especial la resistencia al granizo, el calibre del acero importa más que el tipo de sujeción — pregúntanos cómo mejorar a calibre 26 en tu proyecto.',
        },
      ],
    },
    related: {
      label: 'Servicios relacionados',
      links: [
        { href: '/services/carports', label: 'Cocheras metálicas →' },
        { href: '/services/hoa-compliant-structures', label: 'Estructuras para HOA →' },
        { href: '/services/turnkey-carports-with-concrete', label: 'Llave en mano + concreto →' },
        { href: '/services', label: 'Todos los servicios →' },
      ],
    },
    og: {
      alt: 'Triple J Metal — comparación de paneles de techo metálico PBR vs PBU',
      eyebrow: 'Guía de paneles',
      headline: 'Paneles metálicos para techo PBR vs PBU',
      accent: '¿Cuál necesitas?',
      subhead:
        'Los paneles PBR y PBU son opciones de techo metálico de alta calidad que se usan en edificios metálicos del centro de Texas. La mejor opción depende de tu presupuesto, de la estética y de cuánto mantenimiento a largo plazo quieres atender.',
    },
  },
)
