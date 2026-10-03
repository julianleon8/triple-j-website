import type { Locale } from '@/i18n/config'

import { SITE } from './site'
import { SERVICES, type ServiceData, type ServiceForge, type ServiceOption } from './services'

/**
 * The Spanish side of each service page (the /es mirror, 2026-10-03).
 *
 * Holds only translated copy, keyed by the English slug; facts (images, slugs,
 * related links, gallery filters, quote service) stay in services.ts. Spanish
 * URL slugs live in src/i18n/routes.ts. Same numbers as the English
 * (prices, sizes, gauges, PSI) — copy them, never retype them.
 *
 * Server-only: never import this from a client component (bundle size).
 */
type ForgeCopy = Pick<
  ServiceForge,
  'menu' | 'eyebrow' | 'h1a' | 'h1b' | 'lede' | 'imgAlt' | 'facts' | 'optEyebrow' | 'optHeading' | 'optLede' | 'techHeading' | 'specs'
> & {
  /** Same order and length as the English options; img/structure/concrete come from there. */
  options: Pick<ServiceOption, 'label' | 'title' | 'body' | 'price' | 'note'>[]
}

export type ServiceCopy = Pick<
  ServiceData,
  | 'title'
  | 'shortTitle'
  | 'metaTitle'
  | 'metaDescription'
  | 'heroHeadline'
  | 'heroCopy'
  | 'mainBenefit'
  | 'features'
  | 'technicalAuthority'
  | 'competitorRows'
  | 'faqs'
  | 'trustPoints'
  | 'featuresHeading'
> & { forge?: ForgeCopy }

export const SERVICES_ES: Record<string, ServiceCopy> = {
  'metal-fencing': {
    title: 'Cercas metálicas y portones',
    shortTitle: 'Cercas metálicas y portones',
    metaTitle: 'Cercas y portones en el condado de Bell, TX',
    metaDescription:
      'Cercas metálicas de privacidad, de tubo, de rancho y ornamentales, más portones. Triple J Metal, de Temple, atiende el condado de Bell. Cotización gratis.',
    heroHeadline: 'Cercas metálicas y portones en Temple, Belton y Killeen',
    heroCopy:
      'Más privacidad en casa. Un límite claro para tu terreno. Una entrada que va con tu propiedad. Triple J Metal construye cercas metálicas de privacidad, cercas de tubo y de rancho, cercas metálicas ornamentales y portones para propiedades del centro de Texas. Cuéntale a nuestro equipo de Temple lo que necesitas y revisamos el diseño contigo.',
    mainBenefit: 'Tu cerca, tu diseño — con un equipo local de metal con el que hablas directamente.',
    featuresHeading: 'Encuentra la cerca ideal para tu propiedad.',
    trustPoints: ['Equipo de Temple', 'Inglés y español', 'Cotizaciones según el proyecto'],
    features: [
      { title: 'Cercas metálicas de privacidad', description: 'Protege un patio o un área de trabajo con paneles metálicos. Hablamos de altura, acabado, distribución de postes y estilo antes de cotizar.' },
      { title: 'Cercas de tubo y de rancho', description: 'Delimita tus acres, el frente del terreno o la entrada del rancho. Cuéntanos cómo usas la tierra y si necesitas contener ganado.' },
      { title: 'Cercas metálicas ornamentales', description: 'Una cerca metálica abierta que enmarca la propiedad y deja ver el paisaje. El estilo de los barrotes, el espacio entre ellos, la altura y el acabado los eliges tú.' },
      { title: 'Portones y acceso a la propiedad', description: 'Planea portones peatonales o para vehículos junto con la cerca, para que el acceso quede en la cotización desde el principio.' },
      { title: 'Una cotización hecha para tu terreno', description: 'El largo, la altura, los materiales, el terreno, el acceso y el retiro de una cerca vieja afectan el alcance — todo se confirma en tu cotización por escrito.' },
      { title: 'Ayuda para elegir el diseño', description: '¿No sabes por dónde empezar? Mándanos tu código postal, los pies lineales aproximados y una descripción de la propiedad. Platicamos las opciones.' },
    ],
    technicalAuthority:
      'Con base en Temple, recibimos consultas de cercas de Temple, Belton, Killeen, Harker Heights y comunidades cercanas del centro de Texas. Las pendientes, el drenaje, las aberturas de los portones, los linderos y los requisitos de la ciudad o de la HOA importan. Comparte tu dirección y cualquier plano que tengas para revisar el diseño y los materiales antes de la instalación.',
    competitorRows: [],
    faqs: [
      { q: '¿Qué tipos de cerca metálica ofrecen?', a: 'Cercas metálicas de privacidad, cercas de tubo y de rancho, cercas metálicas ornamentales y portones. Usa el formulario de cotización para elegir un estilo, o cuéntanos qué quieres que haga la cerca.' },
      { q: '¿Cuánto cuesta una cerca metálica?', a: 'Cada cerca se cotiza según su alcance. Los pies lineales totales, la altura, el material y el acabado, la cantidad de portones, el terreno y el trabajo de retiro afectan el precio. Mándanos medidas aproximadas para empezar; el precio final depende del alcance y de la revisión del terreno.' },
      { q: '¿Necesito medidas exactas para pedir una cotización?', a: 'No. Con los pies lineales y la altura aproximados alcanza para empezar. Confirmamos las medidas y el diseño antes de acordar el alcance final.' },
      { q: '¿Cuándo pueden instalar mi cerca?', a: 'Dinos cuándo te conviene. Confirmamos la fecha después de revisar el terreno, el alcance, la disponibilidad de materiales y cualquier aprobación necesaria. El formulario de cotización es una solicitud, no una fecha de instalación reservada.' },
      { q: '¿Una cerca metálica va a cumplir con las reglas de mi ciudad o de mi HOA?', a: 'Los requisitos varían según la propiedad y el diseño de la cerca. Comparte las normas de tu HOA, el plano topográfico (survey) o los documentos de aprobación que ya tengas. Los materiales, la altura, la ubicación y quién se encarga de las aprobaciones se confirman antes de empezar.' },
    ],
    forge: {
      menu: 'Cercas metálicas',
      eyebrow: 'Ya cotizamos cercas',
      h1a: 'Cercas metálicas.',
      h1b: 'Un mejor límite.',
      lede: 'Más privacidad en casa. Un límite claro para tu terreno. Triple J Metal construye cercas metálicas de privacidad, cercas de tubo y de rancho, y cercas metálicas ornamentales para propiedades del centro de Texas — cuéntale a nuestro equipo de Temple lo que necesitas y revisamos el diseño contigo.',
      imgAlt: 'Cerca metálica de alambre para rancho construida por Triple J Metal',
      facts: [
        { k: 'Estilos', v: 'Privacidad · Tubo · Ornamental', s: 'Portones en la misma cotización' },
        { k: 'Zona de servicio', v: 'Temple, Belton, Killeen', s: 'Y zonas cercanas del centro de Texas' },
        { k: 'Cotizaciones', v: 'Según el proyecto', s: 'Pies lineales, altura, acabado, terreno' },
        { k: 'Equipo', v: 'Inglés y español', s: 'Habla con quienes la construyen' },
      ],
      optEyebrow: 'Encuentra tu cerca',
      optHeading: '¿Qué quieres que haga?',
      optLede: 'Privacidad, un lindero bien definido, o un marco abierto que deja ver el paisaje. Elige un estilo y mira cómo lo trabajamos.',
      options: [
        { label: 'Privacidad', title: 'Cercas metálicas de privacidad', body: 'Crea un patio más privado o protege un área de trabajo con paneles metálicos. Hablamos de la altura, el acabado, la distribución de postes y el estilo que quieres antes de cotizar.', price: 'Se cotiza según el alcance', note: 'Altura · acabado · distribución de postes' },
        { label: 'Tubo y rancho', title: 'Cercas de tubo y de rancho', body: 'Delimita tus acres, el frente de tu terreno o la entrada del rancho con cerca de tubo. Cuéntanos cómo usas la tierra para platicar el diseño adecuado y si necesitas contener ganado.', price: 'Se cotiza según el alcance', note: 'Acres · frente · ganado' },
        { label: 'Ornamental', title: 'Cercas metálicas ornamentales', body: 'Enmarca tu propiedad con una cerca metálica abierta que conserva la vista. Platica con nuestro equipo el estilo de barrotes, el espacio entre ellos, la altura y el acabado.', price: 'Se cotiza según el alcance', note: 'Estilo de barrotes · espacio · acabado' },
        { label: 'Portones', title: 'Portones y acceso a la propiedad', body: 'Planea el acceso peatonal o para vehículos junto con tu cerca. Comparte cuántos portones necesitas y el ancho aproximado de cada abertura para que el acceso quede en la cotización desde el principio.', price: 'Se cotiza según el alcance', note: 'Cantidad de portones · ancho de abertura' },
      ],
      techHeading: 'Una cerca tiene que quedar bien en su terreno.',
      specs: [
        { k: 'Estilos', v: 'Privacidad, tubo y rancho, ornamental' },
        { k: 'Portones', v: 'Peatonales o para vehículos, planeados desde el inicio' },
        { k: 'Qué afecta la cotización', v: 'Largo, altura, material, terreno, acceso, retiro' },
        { k: 'Revisión del terreno', v: 'Pendientes, drenaje, linderos' },
        { k: 'Aprobaciones', v: 'Primero se confirman los requisitos de la ciudad y la HOA' },
      ],
    },
  },

  gates: {
    title: 'Portones metálicos',
    shortTitle: 'Portones',
    metaTitle: 'Portones metálicos, Temple, Belton, Killeen',
    metaDescription:
      'Portones peatonales, portones para vehículos y entradas de rancho, planeados con tu cerca metálica por Triple J Metal, de Temple. Cotización gratis.',
    heroHeadline: 'Portones metálicos en Temple, Belton y Killeen',
    heroCopy:
      'Portones peatonales, portones para vehículos y entradas de rancho, planeados junto con tu cerca metálica por nuestro equipo de Temple. Dinos cuántas aberturas necesitas y más o menos qué tan anchas — el acceso queda en la cotización desde el principio.',
    mainBenefit: 'El acceso planeado desde el inicio, no agregado después.',
    featuresHeading: 'El acceso planeado desde el inicio, no agregado después.',
    trustPoints: ['Equipo de Temple', 'Inglés y español', 'Cotizaciones según el proyecto'],
    features: [
      { title: 'Portones peatonales', description: 'Portones para pasar a pie en patios, patios laterales y áreas de trabajo, planeados dentro del diseño de la cerca.' },
      { title: 'Portones para vehículos', description: 'Aberturas del tamaño de los vehículos y remolques que las usan. Con un ancho aproximado alcanza para empezar.' },
      { title: 'Entradas de rancho y de tubo', description: 'Entradas para acres y frentes de rancho, diseñadas según cómo usas la tierra y si hay ganado.' },
      { title: 'Ancho de las aberturas, desde el inicio', description: 'Comparte cuántos portones necesitas y sus anchos aproximados para que el acceso quede en la cotización desde el principio.' },
      { title: 'Herrajes confirmados por escrito', description: 'El funcionamiento del portón y cualquier herraje especial se confirman al cotizar y quedan en tu cotización por escrito.' },
      { title: 'A juego con tu cerca', description: 'Privacidad, tubo y rancho, u ornamental — cada portón se planea junto con el estilo de cerca que lo rodea.' },
    ],
    technicalAuthority:
      'Un portón tiene que funcionar con su terreno: la pendiente de la abertura, el drenaje, cómo giran los vehículos al entrar, los linderos y cualquier requisito de la ciudad o de la HOA. Comparte tu dirección, los anchos aproximados de las aberturas y cualquier plano que tengas para revisar el diseño y los materiales antes de la instalación.',
    competitorRows: [],
    faqs: [
      { q: '¿Puedo agregar portones a una cerca nueva?', a: 'Sí. Incluye portones peatonales o para vehículos en tu solicitud, con el ancho aproximado de las aberturas si lo sabes. El funcionamiento del portón y cualquier herraje especial se confirman al cotizar.' },
      { q: '¿Necesito los anchos exactos de las aberturas?', a: 'No. Con los anchos aproximados alcanza para empezar. Confirmamos las medidas y el diseño antes de acordar el alcance final.' },
      { q: '¿Cuánto cuesta un portón?', a: 'Cada portón se cotiza según su alcance — el ancho de la abertura, el tipo de portón, el material y el acabado, los herrajes y las condiciones del terreno afectan el precio. Mándanos medidas aproximadas para empezar a platicar.' },
      { q: '¿Un portón va a cumplir con las reglas de mi HOA o de mi ciudad?', a: 'Los requisitos varían según la propiedad y el diseño. Comparte las normas de tu HOA, el plano topográfico (survey) o los documentos de aprobación que ya tengas; los materiales, la altura, la ubicación y quién se encarga de las aprobaciones se confirman antes de empezar.' },
    ],
    forge: {
      menu: 'Portones',
      eyebrow: 'Portones y acceso a la propiedad',
      h1a: 'Portones metálicos.',
      h1b: 'Una entrada que encaja.',
      lede: 'Portones peatonales, portones para vehículos y entradas de rancho, planeados junto con tu cerca metálica por nuestro equipo de Temple. Dinos cuántas aberturas necesitas y más o menos qué tan anchas — el acceso queda en la cotización desde el principio.',
      imgAlt: 'Línea de cerca metálica de rancho donde se planea la entrada con portón',
      facts: [
        { k: 'Tipos', v: 'Peatonal · Vehículos · Rancho', s: 'De un portón peatonal a una entrada completa' },
        { k: 'Medidas', v: 'Primero las aberturas', s: 'Con anchos aproximados alcanza' },
        { k: 'Herrajes', v: 'Confirmados en tu cotización', s: 'Funcionamiento y herrajes especiales' },
        { k: 'A juego con', v: 'Tu estilo de cerca', s: 'Privacidad, tubo u ornamental' },
      ],
      optEyebrow: 'Elige la abertura',
      optHeading: '¿Cómo entras y sales?',
      optLede: 'Cada portón empieza con cómo se usa — a pie, en camioneta, o con un remolque y ganado detrás.',
      options: [
        { label: 'Portón peatonal', title: 'Portones peatonales', body: 'Un portón para pasar a pie por el patio, el patio lateral o el área de trabajo, a juego con la cerca donde va. Dinos por dónde entras y sales y planeamos la abertura dentro del diseño.', price: 'Se cotiza según el alcance', note: 'Ubicación · ancho de abertura' },
        { label: 'Portón para vehículos', title: 'Portones para vehículos', body: 'Un portón de entrada del tamaño de los vehículos y remolques que lo usan. Comparte el ancho aproximado de la abertura; el funcionamiento del portón y cualquier herraje especial se confirman al cotizar.', price: 'Se cotiza según el alcance', note: 'Ancho de abertura · funcionamiento · herrajes' },
        { label: 'Entrada de rancho', title: 'Entradas de rancho y de tubo', body: 'Enmarca la entrada de tus acres o de tu rancho con cerca de tubo y un portón hecho para cómo usas la tierra — con equipo, remolques o ganado detrás.', price: 'Se cotiza según el alcance', note: 'Frente · equipo · ganado' },
      ],
      techHeading: 'Mide dos veces, abre una vez.',
      specs: [
        { k: 'Tipos', v: 'Peatonal, para vehículos, entrada de rancho' },
        { k: 'Para cotizar', v: 'Cantidad de portones + anchos aproximados' },
        { k: 'Herrajes', v: 'Se confirman al cotizar' },
        { k: 'Revisión del terreno', v: 'Pendiente, drenaje, giro de entrada, linderos' },
        { k: 'Aprobaciones', v: 'Primero se confirman los requisitos de la ciudad y la HOA' },
      ],
    },
  },

  carports: {
    title: 'Cocheras metálicas a la medida',
    shortTitle: 'Cocheras',
    metaTitle: 'Cocheras soldadas y atornilladas, Temple TX',
    metaDescription:
      'Cocheras metálicas soldadas o atornilladas en Temple, Belton, Killeen y el centro de Texas. Instalación en la misma semana, concreto disponible.',
    heroHeadline: 'Cocheras metálicas a la medida — soldadas o atornilladas, instalación en la misma semana',
    heroCopy:
      'Triple J Metal construye e instala cocheras de viga roja soldadas o atornilladas en Temple, Belton, Killeen y comunidades cercanas del centro de Texas. Elige las dimensiones, el estilo de techo y la cobertura que van con tu propiedad. Nuestro equipo puede sumar la preparación del terreno y una losa de concreto, que se cotiza aparte, en el mismo contrato.',
    mainBenefit: 'Viga roja soldada o atornillada, del tamaño de tus vehículos e instalada por nuestro equipo local.',
    featuresHeading: 'Todo lo que necesita una cochera, de un solo equipo.',
    trustPoints: ['Acero de viga roja de proveedores de Texas', 'Equipo de Temple'],
    features: [
      { title: 'Viga roja soldada — permanente', description: 'Viga roja soldada en sitio. El marco estándar es calibre 14; hay una mejora de servicio pesado con columnas calibre 11 cuando corresponde.' },
      { title: 'Viga roja atornillada — económica', description: 'Estructuras de viga roja atornillada con entrega e instalación de nuestro equipo. La preparación del terreno y el concreto se pueden agregar al alcance.' },
      { title: 'Programación en la misma semana', description: 'Pregunta por disponibilidad en la misma semana. Las fechas se confirman después de revisar el alcance, los materiales, que el terreno esté listo y las aprobaciones.' },
      { title: 'Cualquier tamaño o configuración', description: 'Para un auto, para dos o de ancho comercial. Lados abiertos, parciales o totalmente cerrados. Construida a tus dimensiones, no de catálogo.' },
      { title: 'Losa de concreto disponible', description: '¿Necesitas que primero se cuele una losa? Nos encargamos de la preparación del terreno y del concreto en el mismo contrato — sin tener que contratar otra cuadrilla de concreto.' },
      { title: 'Acero de proveedores de Texas', description: 'Paneles R-Panel PBR/PBU en sustrato Galvalume® de proveedores regionales de Texas, con opciones de acabado pintado para tu proyecto.' },
    ],
    technicalAuthority:
      'Revisamos el terreno, el uso que le darás, las dimensiones y las necesidades de cimientos antes de finalizar tu cochera. El calibre del acero, el anclaje, los requisitos de ingeniería, los acabados y los términos de la garantía se confirman para el diseño que elijas. Te orientamos sobre los requisitos de permisos; quién se encarga de presentarlos y de aprobarlos se confirma antes de empezar el trabajo.',
    competitorRows: [],
    faqs: [
      { q: '¿Cuál es la diferencia entre soldado y atornillado?', a: 'Soldado y atornillado describen cómo se hacen las conexiones estructurales. Ofrecemos los dos. La mejor opción depende del diseño, el uso, las condiciones del terreno y tu presupuesto. El desempeño ante el viento depende de todo el sistema diseñado, incluido el anclaje — no solo del tipo de conexión.' },
      { q: '¿Cuánto cuesta una cochera a la medida?', a: 'Una cochera de techo plano de 20×20 a 10 ft empieza en $3,000 atornillada o $3,300 soldada, por el acero y la instalación, antes de impuestos. El concreto, las paredes y otros extras se cotizan aparte. El precio final depende de las dimensiones y del alcance que elijas.' },
      { q: '¿Instalan sobre concreto que ya tengo?', a: 'Sí. Si ya tienes una losa, anclamos directamente en ella. También podemos colar una losa nueva como parte del mismo trabajo.' },
      { q: '¿Se encargan de los permisos?', a: 'Podemos orientarte sobre los requisitos de permisos para tu ubicación y tu proyecto. Los requisitos varían; confirma qué aprobaciones aplican y quién se encarga de presentarlas antes de empezar el trabajo.' },
    ],
    forge: {
      menu: 'Cocheras',
      eyebrow: 'Cocheras y cubiertas para RV',
      h1a: 'Cocheras metálicas a la medida.',
      h1b: 'Soldadas o atornilladas.',
      lede: 'Triple J Metal construye e instala cocheras de viga roja soldadas o atornilladas en Temple, Belton, Killeen y comunidades cercanas del centro de Texas. Elige las dimensiones, el estilo de techo y la cobertura que van con tu propiedad — la preparación del terreno y una losa de concreto que se cotiza aparte pueden ir en el mismo contrato.',
      imgAlt: 'Cochera metálica de techo a dos aguas construida por Triple J Metal en una propiedad residencial',
      facts: [
        { k: 'Desde', v: '$3,000', s: '20×20 atornillada · acero + instalación' },
        { k: 'Construcción', v: 'Soldada o atornillada', s: 'Viga roja, construida por nuestro equipo' },
        { k: 'Programación', v: 'En la misma semana', s: 'Se confirma tras revisar el alcance' },
        { k: 'Concreto', v: 'Mismo contrato', s: 'Preparación del terreno + losa, se cotiza aparte' },
      ],
      optEyebrow: 'Soldada o atornillada',
      optHeading: 'Elige cómo se construye.',
      optLede: 'Las dos son de viga roja y las dos las instala nuestro propio equipo. La mejor depende del diseño, de cómo la vas a usar, del terreno y de tu presupuesto.',
      options: [
        { label: 'Soldada', title: 'Viga roja soldada. Permanente.', body: 'Viga roja soldada en sitio, con los detalles de material y de conexión confirmados para tu proyecto. El marco estándar es calibre 14; hay una mejora de servicio pesado con columnas calibre 11 cuando corresponde.', price: 'Desde $3,300', note: '20×20 techo plano · 10 ft · acero + instalación, antes de impuestos' },
        { label: 'Atornillada', title: 'Viga roja atornillada. Económica.', body: 'Viga roja atornillada, entregada e instalada por nuestro equipo — y se puede mover después. La preparación del terreno y el concreto se pueden agregar al alcance cotizado.', price: 'Desde $3,000', note: '20×20 techo plano · 10 ft · acero + instalación, antes de impuestos' },
        { label: 'Llave en mano + concreto', title: 'Losa y cochera. Un solo contrato.', body: 'Planea la losa y la cochera juntas. Nos encargamos de la preparación del terreno, el concreto y la estructura de acero en un solo contrato, desglosado para que veas exactamente qué está incluido.', price: 'Se cotiza según el alcance', note: 'El concreto se cotiza aparte · 3,000 PSI estándar, 4,000 si lo pides' },
      ],
      techHeading: 'Dimensionada para tu terreno, no de catálogo.',
      specs: [
        { k: 'Estructura', v: 'Viga roja calibre 14 estándar' },
        { k: 'Mejora de servicio pesado', v: 'Columnas calibre 11, soldadas a los receptores y a las correas (purlins)' },
        { k: 'Paneles', v: 'PBR / PBU en Galvalume®' },
        { k: 'Acabado', v: 'Acabado pintado de 40 años' },
        { k: 'Tamaños', v: 'Para uno, dos autos o comerciales — tus dimensiones' },
        { k: 'Concreto', v: '3,000 PSI estándar · 4,000 PSI si lo pides' },
      ],
    },
  },

  'turnkey-carports-with-concrete': {
    title: 'Cocheras llave en mano con concreto',
    shortTitle: 'Llave en mano + concreto',
    metaTitle: 'Cocheras con losa de concreto, centro de TX',
    metaDescription:
      'Cocheras con preparación del terreno, concreto e instalación de acero en un solo contrato. Triple J Metal, de Temple. Pide una cotización desglosada.',
    heroHeadline: 'Cocheras con concreto — un contrato, de principio a fin',
    heroCopy:
      'Planea la losa y la cochera juntas. Triple J Metal puede encargarse de la preparación del terreno, el concreto y una estructura de acero soldada o atornillada en un solo contrato. Desglosamos el alcance para que veas qué está incluido y coordines el trabajo con una sola empresa.',
    mainBenefit: 'Preparación del terreno, concreto y tu estructura de acero — planeados juntos en un solo contrato.',
    features: [
      {
        title: 'Nivelación y preparación del terreno',
        description:
          'Nuestra minicargadora (skid-steer) John Deere se encarga de la nivelación y la preparación del terreno. Retiramos la maleza, nivelamos el área de la losa y nos aseguramos de que haya buen drenaje antes de colar el concreto.',
      },
      {
        title: 'Colado de la losa de concreto',
        description:
          'Concreto colado en sitio a 3,000 PSI estándar (4,000 PSI si lo pides), con el refuerzo adecuado y curado para cumplir con los requisitos del suelo del condado de Bell. Del tamaño de las dimensiones de tu estructura.',
      },
      {
        title: 'Instalación de la estructura de acero',
        description:
          'Cuando la losa cura, nuestro equipo regresa a levantar la cochera, el garaje o el granero — soldado o atornillado, de cualquier tamaño. La estructura se ancla directamente en el concreto fresco.',
      },
      {
        title: 'Una factura, una garantía',
        description:
          'Nada de culparse entre el que cuela el concreto y el que arma el acero. Triple J Metal se hace cargo de todo el trabajo, del suelo al techo.',
      },
      {
        title: 'Todo tipo de estructura',
        description:
          'Este paquete llave en mano aplica a cocheras, garajes, graneros, cubiertas para RV y porches metálicos. Si va sobre una losa, la podemos construir.',
      },
      {
        title: 'Orientación sobre permisos',
        description:
          'Te orientamos sobre los requisitos del condado de Bell y de los condados vecinos, y podemos ayudar a coordinar los permisos donde se requieran.',
      },
    ],
    technicalAuthority:
      'Revisamos el terreno, el uso que le darás, las dimensiones y las necesidades de cimientos antes de finalizar tu proyecto llave en mano con concreto. El calibre del acero, el anclaje, los requisitos de ingeniería, los acabados y los términos de la garantía se confirman para el diseño que elijas. El concreto está disponible como parte del mismo contrato y se cotiza aparte. Podemos orientarte sobre los requisitos de permisos; quién se encarga de presentarlos y de aprobarlos se debe confirmar antes de empezar el trabajo.',
    competitorRows: [],
    faqs: [
      {
        q: '¿Por qué otras empresas de cocheras no ofrecen el concreto?',
        a: 'El concreto requiere equipo (una minicargadora o un tractor para nivelar), licencias y responsabilidad legal que la mayoría de los vendedores de cocheras no tienen. La mayoría son vendedores nacionales de kits, no constructores de servicio completo. Triple J Metal tiene su propia minicargadora y ha colado cientos de losas en el centro de Texas.',
      },
      {
        q: '¿De qué grosor será la losa de concreto?',
        a: 'Las losas estándar de cocheras y garajes residenciales son de 4" de grosor, con el refuerzo adecuado. Podemos colar losas reforzadas de 6" para estructuras más pesadas o para el peso de un RV. Te recomendamos la especificación correcta para tu proyecto durante la cotización.',
      },
      {
        q: '¿Cuánto tarda todo el proceso?',
        a: 'La nivelación y el concreto normalmente toman un día. Después de 7 días de curado, regresamos a instalar la estructura — por lo general terminada el mismo día. El proyecto completo toma 8–10 días desde que empieza el trabajo, si el clima lo permite.',
      },
      {
        q: '¿Pueden colar concreto en un terreno inclinado?',
        a: 'Sí. Primero nivelamos el área. Las pendientes pronunciadas pueden requerir más preparación del terreno — lo evaluamos durante la visita de cotización.',
      },
    ],
  },

  'metal-garages': {
    title: 'Garajes metálicos',
    shortTitle: 'Garajes',
    metaTitle: 'Garajes metálicos en Temple y Belton, TX',
    metaDescription:
      'Garajes metálicos cerrados a la medida en Temple, Belton, Killeen y el centro de Texas. Una o varias bahías, soldados o atornillados, concreto disponible.',
    heroHeadline: 'Garajes metálicos a la medida — totalmente cerrados, hechos por encargo',
    heroCopy:
      'Un garaje metálico de Triple J Metal no es un cobertizo de tienda de cadena. Es una estructura de viga roja de acero totalmente cerrada, soldada o atornillada a tus dimensiones exactas e instalada en tu propiedad, con preparación del terreno y losa de concreto disponibles en el mismo contrato. De una bahía, de dos o para varios autos — construimos todas las configuraciones en el centro de Texas.',
    mainBenefit: 'Garaje metálico a la medida, totalmente cerrado y construido a tus dimensiones — soldado o atornillado, con losa de concreto disponible en el mismo contrato.',
    features: [
      {
        title: 'Viga roja totalmente cerrada',
        description:
          'Cuatro paredes, un techo inclinado y la configuración de puertas que prefieras. Todo de acero de viga roja — más fuerte y más permanente que la construcción con marco de madera.',
      },
      {
        title: 'Dimensiones a la medida',
        description:
          'Para un auto (12–14 ft de ancho), para dos (20–24 ft de ancho) o de varias bahías. Cualquier largo. No trabajamos con un catálogo estándar.',
      },
      {
        title: 'Puertas enrollables o de entrada a pie',
        description:
          'Puertas enrollables estándar, puertas enrollables comerciales o aberturas con marco para que instales tu propia puerta — tú eliges.',
      },
      {
        title: 'Losa de concreto en un solo contrato',
        description:
          '¿No quieres buscar tu propia cuadrilla de concreto? Colamos la losa, instalamos el garaje y te entregamos las llaves — una sola factura.',
      },
      {
        title: 'Mejora de servicio pesado',
        description:
          'El marco estándar es calibre 14. La mejora de servicio pesado agrega columnas calibre 11, soldadas a los receptores y a las correas (purlins).',
      },
      {
        title: 'Listo para aislamiento',
        description:
          'El marco está espaciado para instalar aislamiento estándar. Podemos orientarte sobre opciones de aislamiento para que tus herramientas y vehículos estén protegidos todo el año.',
      },
    ],
    technicalAuthority:
      'Revisamos el terreno, el uso que le darás, las dimensiones y las necesidades de cimientos antes de finalizar tu proyecto de garajes. El calibre del acero, el anclaje, los requisitos de ingeniería, los acabados y los términos de la garantía se confirman para el diseño que elijas. El concreto está disponible como parte del mismo contrato y se cotiza aparte. Podemos orientarte sobre los requisitos de permisos; quién se encarga de presentarlos y de aprobarlos se debe confirmar antes de empezar el trabajo.',
    competitorRows: [],
    faqs: [
      {
        q: '¿Cuánto cuesta un garaje metálico?',
        a: 'El precio de un garaje depende del marco, las paredes, las puertas, las dimensiones y los cimientos. Nuestra base de 30×30 con techo plano, por el acero y la instalación, empieza en $5,500 antes de impuestos; el cerramiento, las puertas, el concreto y otros extras se cotizan aparte. Pide una cotización completa del proyecto.',
      },
      {
        q: '¿Pueden agregar ventanas y puertas laterales?',
        a: 'Sí. Podemos dejar enmarcadas aberturas para ventanas, puertas de paso y cualquier configuración de puertas durante la construcción.',
      },
      {
        q: '¿Se puede aislar el garaje?',
        a: 'Podemos enmarcar la estructura para el aislamiento. Te ponemos en contacto con contratistas de aislamiento, o tú puedes encargarte de esa etapa después de que terminemos.',
      },
    ],
  },

  barns: {
    title: 'Graneros metálicos y estructuras para rancho',
    shortTitle: 'Graneros',
    metaTitle: 'Graneros metálicos, centro de Texas',
    metaDescription:
      'Graneros y estructuras para rancho en los condados de Bell y Coryell. Viga roja soldada o atornillada, concreto disponible, instalación en la misma semana.',
    heroHeadline: 'Graneros metálicos hechos para la vida de rancho en el centro de Texas',
    heroCopy:
      'Planea el granero según cómo usas tu tierra: guardar equipo, heno, refugio para el ganado o una combinación de usos. Triple J Metal ofrece estructuras de acero soldadas o atornilladas, con la distribución, el acceso, el anclaje y los detalles de los cimientos confirmados para el proyecto.',
    mainBenefit: 'Graneros de viga roja soldada diseñados para el clima del centro de Texas — ganado, equipo, heno o uso mixto.',
    features: [
      {
        title: 'Estructura de viga roja soldada',
        description:
          'Acero de viga roja calibre 14 con una mejora opcional de columnas de servicio pesado calibre 11, soldado en sitio. Permanente, a prueba de tormentas y hecho para durar décadas, sin conexiones atornilladas que se aflojen.',
      },
      {
        title: 'Cualquier configuración',
        description:
          'Cobertizos abiertos para equipo, graneros de heno totalmente cerrados, establos para ganado o estructuras de varias bahías de uso mixto. Diseñamos según tu operación.',
      },
      {
        title: 'La minicargadora alcanza 40 pies',
        description:
          'Nuestra minicargadora (skid-steer) John Deere con plataforma de andamio alcanza 40 pies — lo que nos permite levantar estructuras más altas, como graneros altos y estructuras de barndominium, que la mayoría de las cuadrillas pequeñas no pueden hacer.',
      },
      {
        title: 'Losa de concreto o piso de grava',
        description:
          'Colamos losas de concreto para guardar equipo y para talleres, o preparamos y nivelamos pisos de grava para las áreas del ganado. Mismo contrato.',
      },
      {
        title: 'Paneles de grado agrícola',
        description:
          'Los paneles R-Panel PBR/PBU son el estándar de la industria para edificios agrícolas. El acero base Galvalume® con acabado pintado de 40 años resiste la corrosión y los daños por rayos UV.',
      },
      {
        title: 'Contratistas generales para obras más grandes',
        description:
          '¿Necesitas un barndominium o una estructura comercial grande? Trabajamos con contratistas generales (GC) en PlanHub y ToolBelt para proyectos que van más allá de nuestro alcance estándar.',
      },
    ],
    technicalAuthority:
      'Revisamos el terreno, el uso que le darás, las dimensiones y las necesidades de cimientos antes de finalizar tu proyecto de graneros. El calibre del acero, el anclaje, los requisitos de ingeniería, los acabados y los términos de la garantía se confirman para el diseño que elijas. El concreto está disponible como parte del mismo contrato y se cotiza aparte. Podemos orientarte sobre los requisitos de permisos; quién se encarga de presentarlos y de aprobarlos se debe confirmar antes de empezar el trabajo.',
    competitorRows: [],
    faqs: [
      {
        q: '¿Se necesita permiso para un granero de finca en el condado de Bell?',
        a: 'Las estructuras agrícolas suelen tener umbrales de permiso distintos a los de los edificios residenciales. Antes de empezar te orientamos sobre lo que aplica a tu propiedad y al tamaño de la estructura. Las propiedades rurales con exención agrícola suelen tener más flexibilidad.',
      },
      {
        q: '¿Pueden construir establos para ganado dentro de un granero metálico?',
        a: 'Sí. Podemos armar las divisiones de los establos con el mismo acero de viga roja de la estructura. Medidas de establo a la medida, puertas y puertas Dutch (de dos hojas), todo disponible.',
      },
      {
        q: '¿Cuál es el granero más grande que pueden construir?',
        a: 'Nuestra minicargadora alcanza 40 pies, lo que permite estructuras de hasta esa altura. Para proyectos comerciales muy grandes o de barndominium, trabajamos con contratistas generales. Llámanos para platicar tu proyecto en específico.',
      },
    ],
  },

  'rv-covers': {
    title: 'Cubiertas para RV y lancha',
    shortTitle: 'Cubiertas para RV y lancha',
    metaTitle: 'Cubiertas para RV, descuento militar, TX',
    metaDescription:
      'Cubiertas para RV y lancha a la medida en el centro de Texas — programación en la misma semana, descuento militar, concreto disponible.',
    heroHeadline: 'Cubiertas para RV y lancha — instalación en la misma semana, el granizo de Texas no espera',
    heroCopy:
      'La temporada de granizo en Texas no manda invitación. Una sola tormenta puede dejar como pérdida total un RV o una lancha sin protección en cuestión de minutos. Triple J Metal construye cubiertas altas para RV y lancha en propiedades del centro de Texas — con programación en la misma semana una vez que se aprueba tu proyecto. Si acabas de comprar un RV, acabas de llegar a Fort Cavazos por PCS o tuviste un susto con el granizo — llámanos hoy.',
    mainBenefit: 'Programación en la misma semana. Descuento militar disponible para familias de Fort Cavazos.',
    features: [
      {
        title: 'Mucha altura libre para RV Clase A y Clase C',
        description:
          'Alturas libres estándar de 12–16 pies. Construimos a la altura exacta que necesita tu RV o tu lancha — sin apretarte debajo de una estructura baja de kit.',
      },
      {
        title: 'Instalación en la misma semana — sin esperar',
        description:
          'Pregunta por disponibilidad en la misma semana. Las fechas de instalación se confirman después de revisar el alcance, los materiales, que el terreno esté listo y cualquier aprobación necesaria.',
      },
      {
        title: 'Descuento militar en Fort Cavazos',
        description:
          'El personal militar en servicio activo, los veteranos y los primeros respondientes reciben un descuento en todas las instalaciones de cubiertas para RV y lancha. ¿Llegas a Fort Cavazos por PCS? Protegemos tu vehículo antes de que llegue tu mudanza.',
      },
      {
        title: 'Soldada o atornillada — tú eliges',
        description:
          'Viga roja soldada a la medida para una instalación permanente, o atornillada para una opción más económica. Las dos las construye e instala nuestro equipo.',
      },
      {
        title: 'Losa de concreto disponible',
        description:
          'Estaciona tu RV sobre una losa de concreto nueva — sin grava, sin surcos. Podemos colar la losa e instalar la cubierta en el mismo contrato.',
      },
      {
        title: 'Cortinas laterales y cerramientos',
        description:
          '¿Necesitas más protección contra el clima? Podemos agregar paneles metálicos laterales o puertas enrollables para tener una bahía de almacenamiento para RV total o parcialmente cerrada.',
      },
    ],
    technicalAuthority:
      'Revisamos el terreno, el uso que le darás, las dimensiones y las necesidades de cimientos antes de finalizar tu proyecto de cubiertas para RV y lancha. El calibre del acero, el anclaje, los requisitos de ingeniería, los acabados y los términos de la garantía se confirman para el diseño que elijas. El concreto está disponible como parte del mismo contrato y se cotiza aparte. Podemos orientarte sobre los requisitos de permisos; quién se encarga de presentarlos y de aprobarlos se debe confirmar antes de empezar el trabajo.',
    competitorRows: [],
    faqs: [
      {
        q: '¿Qué altura libre necesito para mi RV?',
        a: 'Los motorhomes Clase A suelen medir de 12\'6"–13\'6" de altura. Recomendamos al menos 14\' de altura libre. Trae la ficha de altura de tu RV y construimos exactamente lo que necesitas.',
      },
      {
        q: '¿Ofrecen descuento militar?',
        a: 'Sí. El personal militar en servicio activo, los veteranos y los primeros respondientes califican para un descuento en todas las instalaciones de Triple J Metal. Menciona tu servicio cuando llames o marca la casilla de descuento militar en nuestro formulario de cotización.',
      },
      {
        q: '¿Puedo guardar una lancha y un RV bajo la misma estructura?',
        a: 'Claro que sí. Podemos construir una cubierta ancha de varias bahías para los dos. Dinos tus dimensiones y diseñamos algo que te quede.',
      },
      {
        q: '¿Qué tan pronto pueden empezar?',
        a: `La mayoría de los trabajos se programan dentro de 2–5 días hábiles después de que aceptas la cotización, si el clima lo permite. Llama al ${SITE.phone} para ver la disponibilidad actual.`,
      },
    ],
  },

  'hoa-compliant-structures': {
    title: 'Estructuras metálicas que cumplen con la HOA',
    shortTitle: 'Estructuras para HOA',
    metaTitle: 'Cocheras y porches metálicos para HOA',
    metaDescription:
      'Cocheras, garajes y porches metálicos para HOA, con paneles arquitectónicos, para Heritage Oaks, Bella Charca y subdivisiones de lujo del centro de Texas.',
    heroHeadline: 'Estructuras metálicas que cumplen con la HOA para subdivisiones de lujo del centro de Texas',
    heroCopy:
      '¿Estás planeando una cochera, un garaje independiente o una cubierta para una propiedad con normas arquitectónicas? Comparte esos requisitos antes de elegir un diseño. Ofrecemos opciones de acabado, perfil y color para ayudarte a preparar una propuesta para revisión, incluidos sistemas Board & Batten y de tornillería oculta. La aprobación le corresponde a la autoridad que revisa; el concreto y la preparación del terreno se pueden cotizar en el mismo contrato.',
    mainBenefit: 'Opciones de paneles y acabados arquitectónicos para platicar según las normas específicas de la HOA de tu propiedad.',
    features: [
      {
        title: 'Techo de junta alzada con tornillería oculta',
        description:
          'Los sistemas premium de junta alzada (standing seam) dan el perfil arquitectónico limpio que piden las HOA — tornillería oculta, sin tornillos expuestos, sin aspecto de cobertizo utilitario. Compramos a proveedores regionales de Texas en el calibre y el color que pide la especificación de tu HOA.',
      },
      {
        title: 'Revestimiento Board & Batten',
        description:
          'El estándar arquitectónico de revestimiento para la construcción residencial de lujo — disponible en la misma paleta de colores que el exterior de tu casa principal para que combine a la perfección.',
      },
      {
        title: 'Mejora de servicio pesado',
        description:
          'Para estructuras premium, la mejora de servicio pesado agrega columnas calibre 11, soldadas a los receptores y a las correas (purlins). El resto del marco sigue siendo calibre 14.',
      },
      {
        title: 'Poca molestia — construcción en la misma semana',
        description:
          'Los vecinos de Heritage Oaks y Bella Charca notan los proyectos largos de construcción. Nuestro tiempo de construcción rápido significa mínima molestia para el vecindario — la mayoría de los trabajos terminan antes de que tus vecinos se den cuenta de que empezó la obra.',
      },
      {
        title: 'Concreto y preparación del terreno en el mismo contrato',
        description:
          'Los compradores adinerados no quieren manejar a dos contratistas. Nos encargamos del concreto, la preparación del terreno y la instalación de la estructura en un solo contrato.',
      },
      {
        title: 'Combinación de colores',
        description:
          'Nuestros proveedores de paneles tienen 39 colores pintados en dos líneas. Podemos combinar el color de las molduras, del techo o del cuerpo de tu casa para lograr continuidad arquitectónica.',
      },
    ],
    technicalAuthority:
      'Revisamos el terreno, el uso que le darás, las dimensiones y las necesidades de cimientos antes de finalizar tu proyecto de estructuras para HOA. El calibre del acero, el anclaje, los requisitos de ingeniería, los acabados y los términos de la garantía se confirman para el diseño que elijas. El concreto está disponible como parte del mismo contrato y se cotiza aparte. Podemos orientarte sobre los requisitos de permisos; quién se encarga de presentarlos y de aprobarlos se debe confirmar antes de empezar el trabajo.',
    competitorRows: [],
    faqs: [
      {
        q: '¿Mi HOA va a aprobar una estructura metálica?',
        a: 'La aprobación de la HOA depende de tus CC&Rs (el reglamento de la comunidad) y de tus normas arquitectónicas específicas. Los dos factores más importantes son la estética del panel (junta alzada vs. R-Panel utilitario) y la continuidad del color. Hemos ayudado a propietarios de Heritage Oaks y Bella Charca a recorrer este proceso. Trae las normas de tu HOA a la conversación de cotización y diseñamos una especificación que las cumpla.',
      },
      {
        q: '¿Cuál es la diferencia entre junta alzada y R-Panel estándar?',
        a: 'El R-Panel estándar tiene tornillos expuestos y un perfil corrugado — se ve agrícola o comercial. La junta alzada tiene tornillería oculta y un perfil limpio con la junta elevada — se ve arquitectónica y residencial. Las HOA con normas estrictas casi siempre exigen junta alzada.',
      },
      {
        q: '¿Pueden igualar exactamente el color exterior de mi casa?',
        a: 'Nuestros proveedores de paneles tienen 39 colores pintados en dos líneas. Trae una muestra del color exterior de tu casa e identificamos la opción más cercana. Para colores personalizados muy específicos, podemos platicar opciones de pintura en polvo (powder coat).',
      },
      {
        q: '¿Se encargan del papeleo de aprobación de la HOA?',
        a: 'Entregamos las fichas técnicas y la documentación de materiales que los comités arquitectónicos de las HOA suelen pedir. Tú presentas todo a tu HOA — nosotros te damos todo lo que necesitan para revisarlo.',
      },
    ],
  },

}

/** The English value at every key the Spanish copy has, recursively. */
function project(en: unknown, es: unknown): unknown {
  if (Array.isArray(es)) return es.map((v, i) => project((en as unknown[] | undefined)?.[i], v))
  if (es && typeof es === 'object') {
    return Object.fromEntries(Object.keys(es).map((k) => [k, project((en as Record<string, unknown> | undefined)?.[k], (es as Record<string, unknown>)[k])]))
  }
  return en
}

/**
 * The English twin of SERVICES_ES: the English copy cut down to the fields
 * (and option/fact/spec rows) the Spanish file translates, so the two can be
 * compared field by field. src/i18n/parity.test.ts reads this for its
 * `src/lib/services.es.ts` entry.
 */
export const SERVICES_EN_COPY: Record<string, unknown> = Object.fromEntries(
  Object.entries(SERVICES_ES).map(([slug, es]) => [slug, project(SERVICES[slug], es)]),
)

/**
 * A service in the page's language: the English facts with the Spanish copy
 * laid over them. Returns the English record untouched for `en`, and the
 * English one for a Spanish slug that has no translation yet.
 */
export function getService(slug: string, locale: Locale): ServiceData | undefined {
  const base = SERVICES[slug]
  if (!base || locale === 'en') return base
  const es = SERVICES_ES[slug]
  if (!es) return base
  const { forge: esForge, ...rest } = es
  const forge =
    base.forge && esForge
      ? {
          ...base.forge,
          ...esForge,
          options: base.forge.options.map((opt, i) => ({ ...opt, ...esForge.options[i] })),
        }
      : base.forge
  return { ...base, ...rest, forge }
}
