import Link from 'next/link'
import { ComparisonTable } from '@/components/ui/ComparisonTable'

/** Spanish body of /es/blog/suelo-blackland-prairie-cimientos-edificios-metalicos. */
export default function BlacklandPrairiePostEs() {
  return (
    <>
      <p>
        El centro de Texas está sobre uno de los tipos de suelo más problemáticos de Norteamérica para los
        cimientos de una construcción. <strong>La arcilla de la Blackland Prairie</strong>{' '}— el suelo oscuro y
        expansivo que atraviesa el condado de Bell,{' '}
        <Link href="/es/ciudades/temple">Temple</Link>, <Link href="/es/ciudades/killeen">Killeen</Link>{' '}y{' '}
        <Link href="/es/ciudades/belton">Belton</Link>{' '}— se hincha muchísimo cuando se moja y se encoge y
        se agrieta cuando se seca. El mismo suelo que hace de esta región una excelente tierra de cultivo
        levantará, inclinará y agrietará una losa de concreto que no se diseñó para él.
      </p>
      <p>
        Esta guía explica cómo afecta el suelo de la Blackland Prairie a los cimientos de los edificios
        metálicos en particular — qué hacemos distinto por eso y a qué estar atento al evaluar una
        cotización de cualquier contratista del centro de Texas.
      </p>

      <h2>Qué hace diferente a la arcilla de la Blackland Prairie</h2>
      <p>
        La propiedad clave de la arcilla expansiva del condado de Bell es su{' '}
        <strong>Índice de Plasticidad (PI)</strong>{' '}— una medida de cuánta agua absorbe el suelo antes de
        volverse plástico (maleable). Los suelos del condado de Bell suelen tener valores de PI superiores
        a 40, a veces superiores a 60. Para dar contexto, los suelos no expansivos tienen un PI menor de 15.
      </p>
      <p>
        Un PI alto significa que:
      </p>
      <ul>
        <li>El volumen del suelo cambia de forma notable entre las temporadas húmedas y las secas</li>
        <li>Los cimientos construidos a nivel del terreno sin un diseño adecuado se moverán con las estaciones</li>
        <li>Se recomienda mucho el postensado y el refuerzo con fibra en las losas de concreto</li>
        <li>Los sistemas de anclaje deben tomar en cuenta el movimiento del suelo — un ancla que está firme en verano puede aflojarse cuando el suelo se contrae en un invierno seco</li>
      </ul>

      <h2>Cómo afecta el tipo de suelo a la especificación del concreto</h2>
      <p>
        La mezcla de concreto estándar para una losa residencial es de 3,000 PSI, y eso es lo que{' '}
        <strong>Triple J cuela como estándar</strong>{' '}en las losas de cocheras y garajes. Lo que importa más
        que el número del ticket de la mezcla es lo que hay debajo y alrededor: el espesor correcto, el
        refuerzo, una viga perimetral y una profundidad de anclaje definida para el suelo que realmente hay
        en tu lote. En los terrenos de arcilla más reactiva podemos colar una{' '}
        <strong>mezcla de 4,000 PSI si la pides</strong>{' '}— la mayor resistencia hace que la losa aguante
        mejor el agrietamiento por movimiento diferencial, el caso en que un borde de tu losa sube mientras
        el otro se queda plano.
      </p>
      <p>
        Además de la resistencia de la mezcla, importa el espesor de la losa. Nuestra losa estándar para
        una cochera o un garaje es de 4 pulgadas, con 6 pulgadas de espesor en la viga perimetral. Para
        estructuras de más de 800 pies cuadrados o en terrenos con problemas de drenaje conocidos,
        recomendamos una losa de 5 pulgadas con cables postensados.
      </p>
      <p>
        La separación de la varilla también cambia en suelo expansivo. Usamos varilla #4 a cada 18
        pulgadas, en lugar de la separación de 24 pulgadas común en losas sobre suelo no expansivo. La
        varilla adicional no evita que el suelo se mueva — nada lo evita — pero reparte la carga en un
        área más grande y evita que las grietas finas se conviertan en grietas estructurales.
      </p>

      <h2>Sistemas de anclaje: qué requiere cada superficie</h2>

      <ComparisonTable
        caption="Requisitos de anclaje para edificios metálicos según el tipo de superficie en el centro de Texas"
        headers={['Superficie', 'Tipo de ancla', 'Profundidad mín.', 'Cumple la garantía contra el viento']}
        highlightCol={3}
        rows={[
          ['Arcilla expansiva (Blackland Prairie)', 'Anclas de tierra tipo casa móvil de 30" + pilotes helicoidales para estructuras grandes', '30"', 'Sí — si se cumple la especificación'],
          ['Subsuelo rocoso de caliche', 'Zapatas de concreto tipo pilar o anclas de manguito en la roca', '12–18" dentro de la roca', 'Sí — si se cumple la especificación'],
          ['Losa de concreto (colada por Triple J)', 'Anclas de manguito de 6" colocadas en el concreto fresco antes de que fragüe', '6" de empotramiento', 'Sí — el mejor método'],
          ['Losa de concreto existente', 'Anclas de manguito fijadas con epóxico (Hilti o equivalente)', '4–6" de empotramiento', 'Sí — requiere taladro de núcleo'],
          ['Asfalto', 'Anclas específicas para asfalto de 30"', '30"', 'Sí — si se cumple la especificación'],
          ['Tierra/grava (sin losa)', 'Anclas de tierra tipo barrena de 30" + collar de concreto', '30"', 'Sí — requiere concreto'],
        ]}
      />

      <p>
        La especificación de anclaje que de verdad importa para tu garantía es la que está en el manual
        de instalación del fabricante — no la que te dice el instalador de palabra. Cuando Triple J ofrece
        una garantía, el sistema de anclaje queda documentado en el contrato. Pídele a cualquier contratista
        que estés evaluando que especifique por escrito el tipo y la profundidad de las anclas antes de
        firmar.
      </p>

      <h2>El drenaje del terreno: la variable más subestimada</h2>
      <p>
        La arcilla de la Blackland Prairie no drena. Cuando llueve, el agua se queda encima de la arcilla
        en lugar de filtrarse. Una losa de edificio metálico que no tenga pendiente de drenaje hacia afuera
        por los cuatro lados tendrá agua estancada contra los cimientos en las temporadas de lluvia — lo que
        acelera el ciclo de expansión y el problema del aflojamiento de las anclas.
      </p>
      <p>
        Antes de colar cualquier losa en el condado de Bell, evaluamos el drenaje del terreno. Nuestra
        minicargadora (skid-steer) John Deere puede nivelar el perímetro del terreno para lograr una
        pendiente de drenaje, si hace falta. No siempre es necesario — muchos terrenos tienen buen drenaje
        natural — pero es parte de la evaluación del sitio en cada proyecto.
      </p>

      <h2>Cómo se ve una losa bien diseñada sobre suelo expansivo</h2>
      <p>
        Para una losa típica de 20×30 para una cochera o un garaje sobre suelo de la Blackland Prairie en
        el condado de Bell, esto es lo que Triple J maneja como estándar:
      </p>
      <ul>
        <li>Terreno nivelado con pendiente de drenaje hacia afuera del perímetro de la losa</li>
        <li>Base compactada de 6 pulgadas (piedra caliza triturada o caliche) debajo de la losa</li>
        <li>Losa de 4 pulgadas, mezcla de 3,000 PSI estándar (4,000 si lo pides), con viga perimetral de 6 pulgadas</li>
        <li>Varilla #4 en cuadrícula de 18 pulgadas</li>
        <li>Pernos de anclaje colocados en el concreto fresco, en ubicaciones calculadas, antes de que fragüe</li>
        <li>Pendiente de 2% hacia la dirección del drenaje en toda la superficie de la losa</li>
      </ul>
      <p>
        Esto es lo que significa “<Link href="/es/servicios/cocheras-llave-en-mano-con-concreto">llave en mano</Link>” en
        la práctica — los cimientos están diseñados para el lugar donde de verdad vives, no colados con los
        estándares mínimos solo para que la cotización salga competitiva.
      </p>

      <h2>Haz las preguntas correctas antes de firmar</h2>
      <p>
        Si estás pidiendo cotizaciones a varios contratistas del centro de Texas, pregúntale a cada uno:
      </p>
      <ul>
        <li>¿Qué PSI de concreto usan? (3,000 PSI es el estándar residencial — pregunta qué espesor, refuerzo y viga perimetral lleva.)</li>
        <li>¿Qué separación de varilla usan?</li>
        <li>¿Cómo colocan las anclas — en concreto fresco o después del colado?</li>
        <li>¿Nivelan el terreno para el drenaje?</li>
        <li>¿Qué pasa si la losa se agrieta en los primeros dos años?</li>
      </ul>
      <p>
        Las respuestas te dicen si el contratista ya ha construido algo en las condiciones de suelo
        específicas del condado de Bell — o si está aplicando una cotización genérica de otro lugar.
      </p>
      <p>
        Llámanos o llena el <Link href="/es/cotizacion">formulario de cotización</Link>. Ayuda que nos des
        la dirección del terreno — podemos revisar los mapas de suelos del condado para tu parcela antes de
        cotizar los cimientos.
      </p>
    </>
  )
}
