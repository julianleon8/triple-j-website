import Link from 'next/link'
import { ComparisonTable } from '@/components/ui/ComparisonTable'

export default function FortCavazosPost() {
  return (
    <>
      <p>
        PCS orders come with a lot of things you can&#8217;t control: report date, housing assignment, which
        base you&#8217;re moving to. The one thing you can control is whether your vehicles, boat, or work
        trailer are covered before the first Central Texas hail storm hits.
      </p>
      <p>
        Triple J Metal is located in <strong>Temple, TX &#8212; about 30 minutes from Killeen.</strong>{' '}We build{' '}
        <Link href="/services/carports">carports</Link>{' '}and covered structures for military families across the{' '}
        <Link href="/locations/killeen">Killeen</Link>&#8211;<Link href="/locations/harker-heights">Harker Heights</Link>{' '}corridor. This is what we&#8217;ve learned about how to make the process work around a PCS timeline.
      </p>

      <h2>Why PCS Season Creates an Urgent Carport Window</h2>
      <p>
        The peak PCS wave runs from <strong>late April through early August</strong>{' '}&#8212; the same period that Central
        Texas enters its severe weather season. Families arriving in this window often have vehicles
        sitting in unshaded driveways or gravel lots while they settle in. Texas UV degrades vehicle
        paint and interiors faster than most military families expect coming from bases in the Pacific
        Northwest or Northeast.
      </p>
      <p>
        Beyond UV, Bell County hail season typically runs March through June. A single hail event
        can total a vehicle that was sitting uncovered in a driveway.
      </p>
      <p>
        The first question most military buyers ask is not &#8220;what gauge is the frame&#8221; &#8212; it&#8217;s &#8220;how fast
        can you build it?&#8221; Here&#8217;s our honest answer.
      </p>

      <h2>Triple J&#8217;s Typical Timeline From First Call to Keys</h2>
      <ol>
        <li>
          <strong>First call or form:</strong>{' '}We confirm your property address, size, and use, and talk
          through what your jurisdiction usually requires for permits (City of Killeen, Harker Heights, or
          unincorporated Bell County, depending on your address).
        </li>
        <li>
          <strong>Written quote:</strong>{' '}For your actual dimensions and scope. In a non-HOA area where the
          structure doesn&#8217;t need a permit, site prep can be scheduled right after you sign. Where a permit
          is required, who files it is set in your written scope, and the build is scheduled once it&#8217;s
          approved.
        </li>
        <li>
          <strong>Concrete, if you want it:</strong>{' '}Our crew pours the slab, sets the anchor bolts in the
          wet concrete, and lets it cure. Concrete is available on any build and priced separately.
        </li>
        <li>
          <strong>Steel erection:</strong>{' '}Same-week scheduling once scope, materials, site readiness and
          any required approvals are confirmed. Larger structures take longer on site than a standard
          20&#215;20 carport.
        </li>
      </ol>
      <p>
        For families who need to park their vehicles covered immediately, we can often prioritize your
        project in the schedule if you mention your PCS situation on the quote call. We&#8217;re a local
        crew &#8212; we confirm scheduling for your project directly.
      </p>

      <h2>How Triple J Compares to Competitors on Military Timelines</h2>

      <ComparisonTable
        caption="Carport contractor timeline comparison for Fort Cavazos military families"
        headers={['', 'Triple J Metal (Temple TX)', 'National Kit Dealers', 'Regional Bolted Dealers']}
        highlightCol={1}
        rows={[
          ['Typical lead time',    'Same-week scheduling after approval', 'Confirm current schedule', 'Confirm current schedule'],
          ['Concrete',             'Available; priced separately, same contract', 'Confirm scope', 'Confirm scope'],
          ['Permits',              'Advisory help; filing confirmed in scope', 'Confirm with provider', 'Confirm with provider'],
          ['Site prep',            'Our skid steer crew',          'Confirm scope', 'Confirm scope'],
          ['Military discount',    '7% — check the box on the quote form', 'Confirm with provider', 'Confirm with provider'],
          ['Local crew',           'Temple-based crew', 'National brand', 'Troy / Waco TX'],
        ]}
      />

      <h2>Budgeting for Your Carport</h2>
      <p>A 20×20 flat-roof carport at 10 ft height starts at $3,000 bolted or $3,300 welded for steel and installation, before tax. Concrete, walls, and other add-ons are priced separately. Request a written quote for your actual dimensions and scope before planning the purchase.</p>

      <h2>Off-Post Housing Considerations</h2>
      <p>
        If you&#8217;re living off-post in Heritage Oaks, Bella Charca, <Link href="/locations/nolanville">Nolanville</Link>, or subdivisions near
        Harker Heights, check your lease or <Link href="/blog/hoa-compliant-metal-buildings-heritage-oaks-bella-charca">HOA covenants</Link>{' '}before committing to a specific structure type.
        Some HOA communities require architectural review before a structure can be erected. We can
        work within those requirements &#8212; concealed-fastener standing seam panels, Board &amp; Batten profiles,
        and specific color palettes are all available through our regional Texas panel suppliers.
      </p>
      <p>
        For renters, many landlords in the Killeen area will allow a freestanding carport that&#8217;s
        removable, especially if it protects the driveway surface. A bolted structure on ground anchors
        (no concrete) is the right product for that situation &#8212; we can quote both options.
      </p>

      <h2>Military Discount and How to Claim It</h2>
      <p>
        Triple J takes <Link href="/military">7% off every install</Link>{' '}for active-duty, retired, Reserve/Guard and first responders.
        Check the military box on the <Link href="/quote">quote form</Link>{' '}(or mention your service on the call) and we&#8217;ll apply
        it to your quote. Nothing to prove on the call &#8212; we verify by service ID, military email or
        DD-214 at the estimate.
      </p>
      <p>
        If you&#8217;re inbound PCSing to Fort Cavazos, <strong>call us from your current station.</strong>{' '}We can have
        the quote ready before you arrive so you can sign and schedule the same week you move in.
      </p>
      <p>
        Boat or RV coming with you? See our <Link href="/services/rv-covers">RV and boat covers</Link>.
      </p>
    </>
  )
}
