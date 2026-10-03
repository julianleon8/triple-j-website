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
        Triple J Metal is located in <strong>Temple, TX &#8212; 10 minutes from Fort Cavazos.</strong> We&#8217;ve built
        <Link href="/services/carports">carports</Link> and covered structures for military families throughout the{' '}
        <Link href="/locations/killeen">Killeen</Link>-<Link href="/locations/harker-heights">Harker Heights</Link> corridor. This is what we&#8217;ve learned about how to make the process work around a PCS timeline.
      </p>

      <h2>Why PCS Season Creates an Urgent Carport Window</h2>
      <p>
        The peak PCS wave runs from <strong>late April through early August</strong> &#8212; the same period that Central
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
          <strong>Day 1:</strong> Quote call or form submission. We confirm property address, size, and any permit
          requirements for your jurisdiction (city of Killeen, Harker Heights, or unincorporated Bell County
          depending on your address; see our{' '}
          <Link href="/blog/bell-county-metal-building-permit-guide-2025">Bell County permit guide</Link>).
        </li>
        <li>
          <strong>Day 2–3:</strong> Quote delivered. If you&#8217;re in a non-HOA area and the structure doesn&#8217;t require
          a permit, we can schedule site prep immediately after contract signing. If a permit is required,
          we submit it during this window.
        </li>
        <li>
          <strong>Day 3–5 (no permit) / Day 10–14 (with permit):</strong> Concrete pour, if applicable. Our
          crew pours the slab, places anchor bolts, and cures.
        </li>
        <li>
          <strong>Same week or next week (no permit) / Week 2–3 (with permit):</strong> Steel erection. On a
          standard 20&#215;20 carport, we&#8217;re on-site for one day. Larger structures take 2&#8211;3 days.
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
          ['Typical lead time',    '1–3 weeks (permit dependent)', 'Confirm current schedule',     'Confirm current schedule'],
          ['Concrete included',    'Separately priced; same contract available', 'Confirm scope', 'Confirm scope'],
          ['Permit handled by',    'Confirm filing responsibility', 'Confirm with provider', 'Confirm with provider'],
          ['Site prep',            'Our skid steer crew',          'Confirm scope', 'Confirm scope'],
          ['Military discount',    'Yes — ask on quote call',      'None noted',     'Varies'],
          ['Local crew',           'Temple-based crew', 'National brand', 'Troy / Waco TX'],
        ]}
      />

      <h2>Budgeting for Your Carport</h2>
      <p>A 20×20 flat-roof carport at 10 ft height starts at $3,000 bolted or $3,300 welded for steel and installation, before tax. Concrete, walls, and other add-ons are priced separately. Request a written quote for your actual dimensions and scope before planning the purchase.</p>

      <h2>Off-Post Housing Considerations</h2>
      <p>
        If you&#8217;re living off-post in Heritage Oaks, Bella Charca, <Link href="/locations/nolanville">Nolanville</Link>, or subdivisions near
        Harker Heights, check your lease or <Link href="/blog/hoa-compliant-metal-buildings-heritage-oaks-bella-charca">HOA covenants</Link> before committing to a specific structure type.
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
        Triple J offers a <Link href="/military">discount to active duty military members, veterans, and first responders</Link>.
        Just mention your service on the quote call or form &#8212; we&#8217;ll apply it to the final quote.
        No DD-214 required on the call; we ask for verification at contract signing.
      </p>
      <p>
        If you&#8217;re inbound PCSing to Fort Cavazos, <strong>call us from your current station.</strong> We can have
        the quote ready before you arrive so you can sign and schedule the same week you move in.
        You can also <Link href="/quote">request a quote online</Link>.
      </p>
      <p>
        Boat or RV coming with you? See our <Link href="/services/rv-covers">RV and boat covers</Link>.
      </p>
    </>
  )
}
