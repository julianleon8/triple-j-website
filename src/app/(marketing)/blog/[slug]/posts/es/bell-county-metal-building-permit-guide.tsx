import Link from 'next/link'
import { ComparisonTable } from '@/components/ui/ComparisonTable'

/** Spanish body of /es/blog/guia-de-permisos-edificios-metalicos-condado-de-bell. */
export default function BellCountyPermitPostEs() {
  return (
    <>
      <p>
        Una de las primeras preguntas que recibimos en cada llamada de cotización es: “¿Necesito un
        permiso para esto?” La respuesta honesta en <strong>el condado de Bell, Texas</strong>{' '}es: depende
        del tamaño, de la jurisdicción y de cómo esté zonificada tu propiedad. Las reglas de Temple,
        Killeen, Belton y de la zona no incorporada del condado de Bell son diferentes entre sí — y las
        consecuencias de construir sin el permiso correcto pueden quedar ligadas a la escritura de tu
        propiedad por décadas.
      </p>
      <p>
        Esta es una guía práctica de un equipo local que construye en todo el condado de Bell. Repasamos
        qué suele requerir un permiso, quién puede solicitarlo, cuánto suele costar y cuánto tarda — y
        dónde confirmar cada respuesta para tu propio lote.
      </p>

      <h2>Por qué los permisos importan más de lo que admiten muchos contratistas</h2>
      <p>
        Una estructura construida sin un permiso requerido es una “mejora sin permiso”. En Texas, eso
        aparece en las declaraciones de divulgación de la propiedad. Las compañías de títulos lo marcan.
        Si alguna vez presentas un reclamo al seguro de tu casa por una estructura dañada por una
        tormenta, un edificio sin permiso puede quedar excluido de la cobertura. Algunos prestamistas no
        incluyen en los avalúos los pies cuadrados sin permiso.
      </p>
      <p>
        Más allá del papeleo, las estructuras con permiso deben cumplir con los retiros (setbacks), las
        distancias de separación contra incendios y las normas de carga de viento. Esos requisitos
        existen por fallas reales — estructuras que se derrumban sobre propiedades vecinas, bloquean
        servidumbres de drenaje o aumentan el riesgo de que se propague un incendio.
      </p>

      <h2>Requisitos de permiso en el condado de Bell, por jurisdicción</h2>

      <ComparisonTable
        caption="Cuándo se requiere permiso para un edificio metálico, por jurisdicción del condado de Bell"
        headers={['Jurisdicción', 'Cuándo se requiere permiso', 'Quién puede solicitarlo', 'Tiempo típico de respuesta']}
        highlightCol={1}
        rows={[
          ['Ciudad de Temple',        'Estructuras ≥ 200 pies cuadrados',    'Contratista con licencia o propietario-constructor', '5–10 días hábiles'],
          ['Ciudad de Belton',        'Estructuras ≥ 144 pies cuadrados',    'Se prefiere contratista con licencia',        '5–10 días hábiles'],
          ['Ciudad de Killeen',       'Estructuras ≥ 120 pies cuadrados',    'Contratista con licencia obligatorio en algunos alcances', '7–14 días hábiles'],
          ['Harker Heights',          'Estructuras ≥ 200 pies cuadrados',    'Contratista o propietario',              '5–10 días hábiles'],
          ['Zona no incorporada del condado de Bell', 'Estructuras ≥ 200 pies cuadrados (varía según la zonificación)', 'Contratista o propietario', '3–7 días hábiles'],
        ]}
      />

      <p>
        <strong>Importante:</strong>{' '}Estos umbrales aplican a estructuras accesorias independientes en
        lotes residenciales. Las propiedades comerciales, las que están en zonas inundables y las que
        tienen convenios de HOA pueden tener requisitos adicionales o distintos. Verifica siempre con el
        departamento de construcción que corresponda antes de empezar la obra.
      </p>

      <h2>¿Cuánto cuesta realmente un permiso en el condado de Bell?</h2>
      <p>
        El condado de Bell y sus municipios usan una tarifa basada en el valor de la obra. Vigente en
        2025, las tarifas de permiso típicas para una cochera o un garaje metálico están en este rango:
      </p>
      <ul>
        <li><strong>Estructuras pequeñas (menos de 300 pies cuadrados):</strong>{' '}tarifa de permiso de $50–$150</li>
        <li><strong>Tamaño mediano (300–800 pies cuadrados):</strong>{' '}$150–$350</li>
        <li><strong>Estructuras más grandes (800+ pies cuadrados):</strong>{' '}$350–$800+, pueden requerir ingeniería con sello</li>
      </ul>
      <p>
        Estas son solo las tarifas del permiso — los planos de ingeniería sellados, cuando la estructura
        los necesita, son un costo aparte. Algunos municipios también cobran la revisión de planos por
        separado de la tarifa de emisión del permiso.
      </p>

      <h2>¿Cuándo requiere una estructura ingeniería sellada?</h2>
      <p>
        Texas tiene requisitos específicos por zona de viento. Las estructuras en las zonas de
        certificación contra tormentas de viento (Zona V, cerca del Golfo) requieren ingeniería sellada.
        El condado de Bell no está en esas zonas obligatorias, pero cada municipio puede exigir planos de
        ingeniería para:
      </p>
      <ul>
        <li>Estructuras de más de 1,000 pies cuadrados</li>
        <li>Estructuras unidas a la vivienda principal</li>
        <li>Estructuras de escala comercial en lotes residenciales</li>
        <li>Cualquier estructura que un contratista con licencia presente para permiso (en algunas jurisdicciones)</li>
      </ul>
      <p>
        Si tu ciudad va a pedir planos sellados para tu estructura, te lo decimos durante la cotización y
        platicamos cómo conseguirlos — es parte de la conversación de la cotización, no una sorpresa a la
        hora del permiso.
      </p>

      <h2>¿Quién solicita el permiso — tú o el contratista?</h2>
      <p>
        Depende de la jurisdicción y del proyecto. Algunas ciudades permiten que lo solicite el dueño de
        la propiedad; otras esperan que lo haga el contratista. <strong>La función de Triple J es de
        orientación:</strong>{' '}te damos orientación sobre los permisos y platicamos las aprobaciones
        antes de programar la obra, y quién hace el trámite se confirma en tu alcance por escrito — para
        que lo sepas antes de firmar, no después de que llegue el acero.
      </p>
      <p>
        Sin importar quién construya tu estructura, haz las mismas preguntas: ¿quién solicita el permiso,
        quién prepara el terreno y quién recibe al inspector? Pide las respuestas por escrito en el
        alcance. Cuando tú eres el titular del permiso y no conoces el proceso local, quedas expuesto.
      </p>
      <p>
        Si prefieres solicitarlo tú mismo como propietario-constructor, muchas ciudades de Texas lo
        permiten para tu residencia principal. Solo ten claro que el proceso de inspección y cualquier
        infracción al código recaen en ti.
      </p>

      <h2>Retiros (setbacks): qué verificar antes de elegir el lugar</h2>
      <p>
        Cada ciudad y cada condado tiene requisitos de retiro — distancias mínimas que tu estructura debe
        mantener respecto a las líneas de propiedad, las servidumbres y la vivienda principal. En los
        municipios del condado de Bell, los retiros residenciales típicos para estructuras accesorias son:
      </p>
      <ul>
        <li><strong>Patio trasero:</strong>{' '}de 5–10 pies de la línea de propiedad (varía según la ciudad)</li>
        <li><strong>Patio lateral:</strong>{' '}3–5 pies como mínimo</li>
        <li><strong>Patio delantero:</strong>{' '}detrás de la fachada de la vivienda principal; por lo general no se permiten estructuras accesorias en el retiro frontal</li>
        <li><strong>Servidumbres de drenaje:</strong>{' '}no se permiten estructuras permanentes dentro de la superficie de la servidumbre (revisa el plano de tu lote)</li>
      </ul>
      <p>
        Antes de cotizar tu proyecto, te pedimos la dirección de tu propiedad, platicamos los retiros que
        suelen aplicar ahí y te indicamos la oficina de la ciudad o del condado que los confirma. Es
        mejor detectar un problema de retiros durante la cotización que después de colar el concreto.
      </p>

      <h2>Los convenios de la HOA son aparte de los permisos de construcción</h2>
      <p>
        Si tu propiedad está en una subdivisión con una asociación de propietarios (HOA) — Heritage Oaks
        en Killeen, Bella Charca en Nolanville y decenas de otras comunidades del centro de Texas — el
        comité de revisión arquitectónica de tu HOA debe aprobar tu estructura por separado del permiso
        de construcción de la ciudad. Nuestra guía de{' '}
        <Link href="/es/blog/edificios-metalicos-hoa-heritage-oaks-bella-charca">edificios metálicos aprobados por la HOA</Link>{' '}explica
        qué buscan esas revisiones.
      </p>
      <p>
        Un permiso de la ciudad no anula un convenio de la HOA. Una estructura que pasa el permiso de la
        ciudad pero viola los convenios de la HOA puede quedar sujeta a una orden de retiro por parte de
        la HOA — después de que ya pagaste el concreto y el acero. En cada cotización de propiedades en
        comunidades con HOA conocidas, preguntamos por los requisitos de la HOA.
      </p>

      <h2>Empieza con la llamada de cotización</h2>
      <p>
        La forma más rápida de entender qué requiere tu proyecto es describírnoslo. Cuando llames o
        llenes el <Link href="/es/cotizacion">formulario de cotización</Link>, dinos la dirección, el
        tamaño de la estructura y el uso que le vas a dar. Te decimos qué suele requerir tu
        jurisdicción, te avisamos de los retiros y de la revisión de la HOA, y escribimos en tu alcance
        quién se encarga del permiso. Sin sorpresas.
      </p>
      <p>
        ¿Vas a construir en el condado de Bell? Mira nuestras páginas de{' '}
        <Link href="/es/ciudades/temple">Temple</Link>, <Link href="/es/ciudades/belton">Belton</Link>{' '}y{' '}
        <Link href="/es/ciudades/killeen">Killeen</Link>, o explora las{' '}
        <Link href="/es/servicios/cocheras">cocheras</Link>{' '}y los{' '}
        <Link href="/es/servicios/garajes-metalicos">garajes</Link>.
      </p>
    </>
  )
}
