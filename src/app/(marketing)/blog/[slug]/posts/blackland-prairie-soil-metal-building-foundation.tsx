import { ComparisonTable } from '@/components/ui/ComparisonTable'

export default function BlacklandPrairiePost() {
  return (
    <>
      <p>
        Central Texas sits on one of the most problematic soil types in North America for construction
        foundations. <strong>Blackland Prairie clay</strong> &#8212; the dark, expansive soil that runs through Bell County,
        Temple, Killeen, and Belton &#8212; swells dramatically when wet and shrinks and cracks when dry. The
        same soil that makes this region excellent farmland will heave, tilt, and crack a concrete slab
        that wasn&#8217;t designed for it.
      </p>
      <p>
        This guide explains how Blackland Prairie soil affects metal building foundations specifically &#8212;
        what we do differently because of it, and what to watch for when evaluating a quote from any
        Central Texas contractor.
      </p>

      <h2>What Makes Blackland Prairie Clay Different</h2>
      <p>
        The key property of Bell County&#8217;s expansive clay is its <strong>Plasticity Index (PI)</strong> &#8212; a measure
        of how much water the soil absorbs before it becomes plastic (pliable). Bell County soils
        commonly have PI values above 40, sometimes above 60. For context, non-expansive soils have
        a PI under 15.
      </p>
      <p>
        A high PI means:
      </p>
      <ul>
        <li>The soil volume changes significantly between wet and dry seasons</li>
        <li>Foundations built at grade without adequate design will move seasonally</li>
        <li>Post-tension and fiber reinforcement in concrete slabs is strongly recommended</li>
        <li>Anchor systems must account for soil movement &#8212; an anchor that&#8217;s solid in summer may loosen as the soil contracts in a dry winter</li>
      </ul>

      <h2>How Soil Type Affects Concrete Specification</h2>
      <p>
        Standard concrete mix for a residential slab is 3,000 PSI. For Central Texas expansive soil
        conditions, <strong>Triple J specifies 4,000 PSI concrete</strong> as our default for carport and garage slabs.
        The higher strength rating means the slab is more resistant to cracking under differential
        movement &#8212; the scenario where one edge of your slab moves up while the other stays flat.
      </p>
      <p>
        Beyond mix strength, slab thickness matters. Our standard slab for a carport or garage pad is
        4 inches, with 6-inch thickness at the perimeter beam. For structures over 800 square feet
        or on sites with known drainage problems, we recommend a 5-inch slab with post-tension cables.
      </p>
      <p>
        Rebar spacing also changes for expansive soil. We use #4 rebar on 18-inch centers rather than
        the 24-inch spacing common on non-expansive soil pads. The additional rebar doesn&#8217;t prevent
        the soil from moving &#8212; nothing does &#8212; but it distributes the load across a larger area and
        keeps hairline cracks from becoming structural cracks.
      </p>

      <h2>Anchor Systems: What Each Substrate Requires</h2>

      <ComparisonTable
        caption="Metal building anchor requirements by substrate type in Central Texas"
        headers={['Substrate', 'Anchor Type', 'Min. Depth', 'Wind Warranty Compliant']}
        highlightCol={3}
        rows={[
          ['Expansive clay (Blackland Prairie)', '30" mobile home earth anchors + helical piers for large structures', '30"', 'Yes — if spec met'],
          ['Rocky caliche subsoil', 'Concrete pier footings or sleeve anchors into rock', '12–18" into rock', 'Yes — if spec met'],
          ['Concrete slab (poured by Triple J)', '6" sleeve anchors set in wet concrete before cure', '6" embedment', 'Yes — best method'],
          ['Existing concrete pad', 'Epoxy-set sleeve anchors (Hilti or equiv.)', '4–6" embedment', 'Yes — requires core drill'],
          ['Asphalt', '30" asphalt-specific anchors', '30"', 'Yes — if spec met'],
          ['Dirt/gravel (no slab)', '30" earth auger anchors + concrete collar', '30"', 'Yes — requires concrete'],
        ]}
      />

      <p>
        The anchor spec that actually matters for your warranty is what&#8217;s in the manufacturer&#8217;s
        installation manual &#8212; not what the installer tells you verbally. When Triple J provides a
        warranty, the anchor system is documented in the contract. Ask any contractor you&#8217;re evaluating
        to specify the anchor type and depth in writing before you sign.
      </p>

      <h2>Site Drainage: The Most Underestimated Variable</h2>
      <p>
        Blackland Prairie clay doesn&#8217;t drain. When it rains, water sits on top of the clay rather
        than percolating through. A metal building slab that doesn&#8217;t have positive drainage away from
        all four sides will have standing water against the foundation during wet seasons &#8212; accelerating
        the expansion cycle and the anchor loosening problem.
      </p>
      <p>
        Before we pour any slab in Bell County, we evaluate the site drainage. Our John Deere skid
        steer can grade the site perimeter to establish positive drainage if needed. This isn&#8217;t always
        required &#8212; many sites have adequate natural drainage &#8212; but it&#8217;s part of the site evaluation on
        every project.
      </p>

      <h2>What a Properly Engineered Slab Looks Like on Expansive Soil</h2>
      <p>
        For a typical 20&#215;30 carport or garage pad on Blackland Prairie soil in Bell County, here&#8217;s
        what Triple J includes as standard:
      </p>
      <ul>
        <li>Site graded for positive drainage away from slab perimeter</li>
        <li>6-inch compacted base course (crushed limestone or caliche) below slab</li>
        <li>4-inch slab, 4,000 PSI mix, with 6-inch perimeter beam</li>
        <li>#4 rebar on 18-inch grid</li>
        <li>Anchor bolts placed in wet concrete at engineered locations before cure</li>
        <li>2% grade toward drainage direction across slab surface</li>
      </ul>
      <p>
        This is what &#8220;turnkey&#8221; means in practice &#8212; the foundation is engineered for where you actually
        live, not just poured to minimum standards to keep the quote competitive.
      </p>

      <h2>Ask the Right Questions Before You Sign</h2>
      <p>
        If you&#8217;re getting quotes from multiple contractors in Central Texas, ask each one:
      </p>
      <ul>
        <li>What PSI concrete do you use? (Anything under 3,500 on Blackland Prairie is underspec.)</li>
        <li>What rebar spacing do you use?</li>
        <li>How do you handle anchor placement &#8212; wet-set or post-pour?</li>
        <li>Do you grade the site for drainage?</li>
        <li>What happens if the slab cracks within the first two years?</li>
      </ul>
      <p>
        The answers tell you whether the contractor has built anything in Bell County&#8217;s specific soil
        conditions before &#8212; or whether they&#8217;re applying a generic quote from somewhere else.
      </p>
      <p>
        Call us or fill out the quote form below. Site address is helpful &#8212; we can review county soil
        maps for your specific parcel before we quote the foundation.
      </p>
    </>
  )
}
