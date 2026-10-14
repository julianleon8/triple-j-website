# 3D configurator research (2026-10-13)

Research done by Codex on 2026-10-13 before the Triple J 3D builder was built (`docs/3D-BUILDER.md`). Codex ran out of usage before saving it; it was recovered from the Codex session logs on 2026-10-14 and is kept here as written. It informed the build; it is not authoritative for Triple J rules, prices or copy (`Locked Decisions.md` is).

Sources were public pages, public tenant configuration JSON and vendor documentation only. No proprietary code, assets or data were copied into this repo. Where the build differs from the recommendations below (no server-side draft storage, a "From $X" price line), `Decisions.md` 2026-10-14 says why.

Contents: 1. Handoff summary · 2. WolfSteel teardown · 3. Industry benchmarks · 4. REA assessment

---

## 1. Handoff summary


### Current direction

The agreed product direction is:

- Start with an owner-only `/hq/builder` pilot.
- Configure one crew-verified building system.
- First family: carports and RV covers.
- Treat welded, bolted, or unsure as a sales preference initially, not different geometry.
- Produce a fabrication-aware concept—not engineering or permit-ready output.
- Include dimensions, roof, open/partial/enclosed walls, colors, concrete/slab request, doors/windows, and one constrained side lean-to.
- Persist the versioned design, reopen it identically, generate four views, and produce a printable specification summary.
- After crew validation, reuse the engine for an anonymous public `/build` experience.
- Do not show public pricing at launch; submit designs for a project estimate.
- Match the current lead form: name and phone required, email optional, plus ZIP, intended use, and timing.
- Anonymous public sessions autosave server-side and expire after 30 inactive days.
- Provide complete HTML/2D controls and summaries when WebGL is unavailable.
- Borrow Wolfsteel’s interaction concepts, not its visual design, code, assets, copy, or trade dress.
- Exact fabrication rules must be approved jointly by Julian and Freddy before geometry implementation.

### Existing repository findings

The project currently uses Next.js 16.2.3, React 19, Tailwind 4, Supabase, PostHog, and a Serwist PWA. It has no Three.js, React Three Fiber, Babylon.js, GLTF, Draco, Zustand, or existing 3D asset pipeline.

The existing brief is [`docs/RED-IRON-3D-BUILDER.md`](</Users/victorialeon/triple-j-website/docs/RED-IRON-3D-BUILDER.md>). It is valuable as a feature brainstorm but is not reliable as an implementation specification.

Problems found in that brief:

- Several claims about Wolfsteel’s renderer, performance, vendor pricing, and customer behavior are unsourced.
- It assumes the existing quote calculator can supply live pricing.
- It mixes red-iron structural terminology with 14/11-gauge framing rules without a validated fabrication model.
- It proposes engineering-like collision and clearance rules that have not been approved by the crew.
- Its “under 15 ms” geometry, sub-2 KB configuration, vertex limits, and SaaS-cost claims are unsupported targets.
- It overreaches into BOM, fabrication, advanced equipment placement, and exact pricing before the basic customer workflow is validated.

The current `src/lib/quote-pricing.ts` explicitly labels most rates and material-cost ratios as placeholders. Roll-up-door prices conflict between the sales pack, archived handwritten values, and the pricing engine. It must not power customer pricing.

The old HQ quote wizard still exists in source but its route is intentionally disabled. Public dimensions are currently flattened into lead notes instead of stored structurally. `/api/leads` accepts only `website_form` or `quote_page`, so a public builder will require an approved source value and a design reference.

The worktree already contained numerous unrelated modified and untracked files before this research. They must be preserved.

### REA findings

[`morluto/rea`](https://github.com/morluto/rea) is not a 3D configurator or reusable building engine. It is a reverse-engineering CLI/MCP tool for observing websites, bundles, network traffic, browser execution, binaries, and other artifacts.

Relevant conclusions:

- Pin `rea-agents@6.4.0` if it is used for a controlled research run.
- Use it as external investigation tooling, never as a production dependency.
- It can capture DOM, accessibility data, scripts, network activity, screenshots, runtime coverage, and repeatable browser scenarios.
- It cannot recover a clean scene graph, product schema, pricing formula, or engineering rules automatically.
- Its automated scenario actions do not cover canvas dragging, orbit gestures, coordinate clicks, or touch gestures well.
- REA itself is MIT-licensed, but that does not grant rights to Wolfsteel or IdeaRoom code, models, textures, configuration data, or branding.
- Safe use requires a dedicated browser profile with no personal accounts or sensitive data.
- No pinned REA execution against Wolfsteel has been run yet. The current Wolfsteel findings came from direct browser/source/network inspection.

### Wolfsteel findings

Wolfsteel runs two separate IdeaRoom/CarportView tenants:

- [Red-iron configurator](https://design3d.wolfsteelbuildings.com/)
- [Tubular configurator](https://design.wolfsteelbuildings.com/)

They are separate product catalogs and rulesets, not two options inside one unified model.

Confirmed behavior:

- Visitors enter an editable default building without an account, ZIP, or PII gate.
- Desktop uses a large left-hand 3D viewport and a roughly 460-pixel right control panel.
- Users can visit categories in any order; there is no required wizard or progress indicator.
- Numerical pricing is hidden. The persistent CTA requests a quote.
- The red-iron tenant exposes Style, Sides & Ends, Size, Interior, Doors & Windows, Materials, Colors, and Details.
- It supports standard, single-slope, barn, and open-porch styles; large dimensional ranges; wall states; lean additions; frame spacing; openings; insulation; wainscot; and color groups.
- The tubular tenant exposes style families, size bands, open/partial/enclosed walls, 12/14-gauge framing, 26/29-gauge panels, openings, insulation, services, financing, and warranty questions.
- Both provide 3D/top views, orbit/pan/zoom, reset, background selection, undo/redo, interior/exterior controls, sharing, saved designs, AR hooks, and space-planning features.
- Anonymous sharing creates an opaque IdeaRoom design link without immediately requesting PII.
- Quote capture requires substantial contact and qualification information and promises final pricing later.
- Public configuration documents expose option identifiers, dimensions, rules, warnings, copy, and form definitions, but not an obvious customer price table.
- The current client bundle is heavy—approximately 4.1 MB compressed before models and runtime assets.

Observed weaknesses:

- No guided first-time-buyer journey.
- Geometry choices, concrete questions, warranties, financing, and sales qualification are mixed together.
- Long final quote form.
- Accessibility labels are weak, with numerous icon-only or generic controls.
- Canvas dragging is overly important.
- Copy and data defects exist across tenants.
- Quote-turnaround promises vary between Wolfsteel pages.
- The two domains fragment analytics and product consistency.
- Publicly discoverable staff-style calculator surfaces deserve a security review.
- Mobile behavior was not fully tested on physical devices.

### Industry benchmark findings

Best references:

- [Alan’s Factory Outlet](https://alansfactoryoutlet.com/3d-carport-and-metal-garage-builder/): best first-time-buyer sequencing, use-based presets, visible option deltas, and price clarity.
- [Heritage CarportView](https://builder.heritagecarports.com/): broadest rules-driven configuration and wall-aware opening controls.
- [Sensei](https://www.senseidigital.com/3d-carport-builder/): strong mobile commerce, sharing, comparisons, and AR.
- [Mueller](https://apps.muellerinc.com/design/): strongest camera presets, numeric inputs, scene controls, and scale references.
- [Morton 3D Studio](https://3dstudio.mortonbuildings.com/): strongest interior and equipment planning, but also the clearest warning against excessive control density.
- Tuff Shed and Studio Shed: useful progressive customization and finish-selection patterns.

The consistent winning pattern is:

1. Begin with a valid building or use-based preset.
2. Show visual consequences immediately.
3. Progressively disclose complexity.
4. Keep Review/Request Estimate visible.
5. Delay PII until save, share, or estimate.
6. Explain invalid combinations rather than silently removing selections.
7. Provide named camera views and numeric alternatives to dragging.
8. Keep a textual configuration summary outside the canvas.

### Recommended technical architecture

Use a durable domain model independent of the renderer:

- Versioned `BuildingDesign` schema validated with Zod.
- Separate product catalog, compatibility rules, geometry projection, pricing, and lead/customer layers.
- Pure TypeScript rule engine with no React or Three.js dependency.
- React Three Fiber/Three.js as the replaceable scene projection.
- Procedural geometry for the basic frame, roof, walls, slab, openings, and lean-to.
- Instancing/shared materials for repeated members and panels.
- HTML controls as the authoritative editor; canvas dragging is optional enhancement.
- Named front, rear, left, right, top, and isometric views.
- Local undo/redo and deterministic serialization.
- No import from the placeholder quote-pricing engine.
- Server-side validation whenever a design is persisted or submitted.

Proposed persistence model:

- `building_designs`: version, status, product family, configuration JSONB, summary fields, timestamps, expiry, lead/customer references, and owner audit fields.
- Private preview assets for the four rendered views.
- Owner-only RLS for the HQ pilot.
- Public autosave through rate-limited server routes, not direct anonymous table access.
- High-entropy bearer token stored hashed server-side.
- Anonymous records expire after 30 inactive days.
- Quoted designs attach to the lead and follow business retention instead.
- No PII inside share URLs or configuration JSON.
- Configuration JSON should not receive a broad GIN index unless real query patterns require it; index lifecycle/status/expiry and foreign keys directly.

The Supabase schema/RLS/storage design still needs current official-documentation verification before migration SQL is finalized.

### Analytics and acceptance direction

Add new PostHog events without renaming existing events:

- Builder opened
- Preset selected
- First edit
- Stage completed
- Validation blocked
- Opening added
- Lean-to enabled
- Undo/redo/reset
- Review opened
- Autosave succeeded/failed
- Share created
- Estimate started/submitted
- 3D fallback activated

Pilot acceptance:

- Julian or Freddy can create a standard carport/RV design without help.
- The design reopens identically from stored JSON.
- No invalid geometry can be saved.
- Every blocked choice explains the reason.
- Dimension changes never silently delete openings or the lean-to.
- Four views and the printable summary match the saved configuration.
- All configuration functions remain available without canvas dragging.
- WebGL failure does not block completion.
- Pricing and engineering approval are never implied.
- Crew sign-off is recorded against the rule-matrix version.

### Remaining pre-code work

1. Create and obtain Julian/Freddy approval for the fabrication-rule matrix:

   - Allowed width, length, and eave-height ranges and increments
   - Roof types, pitch ranges, and overhangs
   - Column/receiver/rafter/purlin member dimensions
   - Frame/bay spacing rules
   - Standard versus 11-gauge-upgrade representation
   - Wall states and partial-wall increments
   - Door/window catalog and clearance rules
   - Lean-to side, depth, length, offset, pitch, and height constraints
   - Concrete/slab visualization rules
   - Conditions requiring manual review

2. Verify current Supabase documentation for RLS, Storage policies, token handling, and cleanup jobs.
3. Decide the precise autosave frequency and conflict behavior.
4. Define the four required exported views and printable-summary contents.
5. Run a pinned, isolated REA capture against Wolfsteel if deeper bundle/runtime evidence is still worth the cost.
6. Only after those items are locked should implementation begin.

No literal Firecrawl connector was available during this session; the crawl used read-only browser, source, network, repository, and primary-documentation inspection.

---

## 2. WolfSteel teardown

### 1. Current WolfSteel journey, configurator behavior, and data capture

#### Takeaway

WolfSteel runs two separate IdeaRoom/CarportView configurators: a red-iron builder at [design3d.wolfsteelbuildings.com](https://design3d.wolfsteelbuildings.com/) and a tubular builder at [design.wolfsteelbuildings.com](https://design.wolfsteelbuildings.com/). Both are open for anonymous exploration, expose a large rules-driven product catalog, hide numerical pricing, and funnel the completed design into a substantial quote form.

### Cited findings

**Entry and customer journey**

1. The main WolfSteel site offers parallel “Tubular 3D Builder” and “Red Iron 3D Builder” paths from its homepage, [Design & Get Quote](https://wolfsteelbuildings.com/design-get-quote/), [shop](https://wolfsteelbuildings.com/shop/), [red-iron](https://wolfsteelbuildings.com/red-iron-metal-buildings-in-texas/), and [tubular](https://wolfsteelbuildings.com/tubular-metal-buildings/) pages.
2. No email, account, ZIP code, or other PII is required before entering either configurator. The user lands directly on an editable default building.
3. Desktop is a split layout: a large WebGL viewport at left and an approximately 460-pixel accordion panel at right. A contact strip, WolfSteel logo, Help, View Details, Saved Designs, and Login sit above it. A Quote CTA remains available throughout.
4. The user can move between categories in any order; there is no mandatory wizard, completion meter, or “next step” progression.
5. The main site positions the tool as a lead-generation step rather than checkout. The configurator does not expose a numerical price; the Details and quote screens say final pricing, delivery, adjustments, discounts, and taxes will be supplied with the final proposal.

**Red-iron flow and options**

The active category order observed in the [red-iron configurator](https://design3d.wolfsteelbuildings.com/) was:

1. Sales?
2. Style
3. Sides & Ends
4. Size
5. Interior
6. Doors & Windows
7. Materials
8. Colors
9. Details

The public [red-iron tenant data](https://db8rthss1z9vm.cloudfront.net/v2/carports/vendor/wolfsteel-red-iron) confirms the configurable catalog and conditional rules.

- Styles: Standard, Single Slope, Barn, and Open Porch.
- Standard roof pitch presents 2/12 through 6/12 choices. Overhang choices include None, 2 feet, and 3 feet.
- Style also contains operational questions such as gutters/downspouts, concrete work, pre-engineered upgrades, and intended use. These are quote inputs rather than visible building geometry.
- Sides & Ends includes fully enclosed, gable-end, or open walls; center storage; and left, right, front, or back lean additions. Lean types include gable, lean-to, lean-to with storage, or none.
- Size data covers approximately 20–100-foot widths, 20–200-foot lengths, and 8–30-foot eave heights, with style-specific restrictions. The public width list contains an apparent data defect: duplicate 90-foot options and no 92-foot option.
- Interior exposes 20- or 25-foot frame spacing. Selecting it makes the exterior translucent and reveals framing, despite nearby copy saying interior options are not shown visually.
- Doors & Windows uses front/left/back/right wall tabs and supports adding and dragging openings on the selected wall. Live families included personnel doors, windows, frameouts, roll-up doors, vents, and overhead doors.
- The exposed catalog includes common roll-up sizes from 6×6 through 14×14, overhead doors through 16 feet wide, 36×80 and 48×84 personnel doors, insulated and double-pane windows, vents, and custom frameouts.
- Materials exposes PBR siding and insulation choices including none, 1-inch spray foam/R-7, 2-inch spray foam/R-13, and fiberglass/R-10.
- Colors are grouped by roof, trim, wainscot, and walls. The UI warns that on-screen colors are approximate and recommends confirming against a physical sample.

**Tubular flow and options**

The active category order in the [tubular configurator](https://design.wolfsteelbuildings.com/) was:

1. Sales?
2. Style
3. Size
4. Sides & Ends
5. Materials
6. Doors & Windows
7. Colors
8. Services, Financing, & Warranty
9. Details

The public [tubular tenant data](https://db8rthss1z9vm.cloudfront.net/v2/carports/vendor/wolfsteel-buildings) confirms the underlying options and rules.

- Styles: Standard, Triple Wide, Wide Span Deluxe, RV Carport, Horizontal Garage, Vertical Garage, Utility, AG Barn, and Continuous Slope Barn.
- Style-based width bands are visible: Standard roughly 12–24 feet, Triple Wide 26–30 feet, and Wide Span Deluxe 32–50 feet. Length data extends approximately 10–100 feet, while leg heights span roughly 6–20 feet subject to style and width constraints.
- Roof pitch choices include 3/12 through 6/12 on the default style; roof-overhang choices include 6 and 12 inches.
- Walls include open, fully enclosed, gable end, partial-panel and extended-gable variants, plus side-specific closures.
- Materials include 14- or 12-gauge framing, 29- or 26-gauge panels, colored screws, insulation choices, and certification/anchor packages. Copy identifies 12 gauge as carrying a 20-year rust warranty and offers a “Severe Wind Package” described as highly recommended for the Houston area.
- Services contains several nonvisual, separately quoted items: permit assistance, engineer plans, concrete, gutters/downspouts, spray foam, financing, installation over an existing surface, and cutting legs to level.
- Warranty copy in this panel states 30-day workmanship, one-year leak protection, and a 20-year rust-through warranty on 12-gauge framing. These claims should not be reused without Triple J legal/operational validation.

**Viewport and design controls**

Both live configurators provide:

- 3D and Top View modes. Top View is an overhead camera view, not a dimensioned construction plan.
- Orbit/pan/zoom-style interaction, reset view, background selection, left/right rotation, zoom, undo/redo, and interior/exterior controls.
- Direct wall or section selection; selected geometry is highlighted, and openings can be positioned by dragging.
- AR/view-in-space, sharing, and a space-planner entry point. Label treatment differs between tenants: tubular shows descriptive text at desktop while red iron presents mainly icons.
- View Details produces a technical selection summary, not a priced bill of materials.

**Saving, sharing, PII, and quote handoff**

- Saved Designs and Login are visible in the header. Public tenant settings enable a saved-design list and sharing but disable the optional “capture information before saving” behavior. IdeaRoom documents that lead capture before save is separately configurable ([Enable Lead Capture](https://help.idearoom.com/en/articles/13265819-enable-lead-capture)).
- Opening Share saved the anonymous design and then offered Copy Link, Email, Messages, Facebook, Pinterest, and X. The public client code builds share links on `share.idearoom.com` using a design hash.
- No PII was requested for that anonymous save. This inspection created one anonymous saved design; no quote, contact form, account, email, social post, or purchase was submitted.
- The Quote modal is where PII is requested. Required contact fields are first name, last name, phone, email, and ZIP. Installation address, city, and state are displayed but were not marked required.
- The modal then asks how the customer heard about WolfSteel, approximate price range, concrete status, permit status, intended use, site readiness, desired timing, and salesperson style; notes and a “Packmate” field are also present. Most project-qualification questions are required.
- Buttons include Print PDF and Quote. The closing copy says the customer receives an email breakdown without pricing and WolfSteel will provide a priced proposal in one to two business days.
- IdeaRoom’s official [Working with Leads](https://help.idearoom.com/en/articles/7968354-working-with-leads) documentation says configurator saves can become SalesView leads; customer information is retained with Email Link/Submit for Quote actions; admins can search/export leads; and each saved design is associated with an IP address.

**Mobile**

The public client bundle uses a `max-width: 959px` breakpoint, and IdeaRoom documents special care for mobile embeds, including keeping the host page clear of interfering headers and footers ([Embedding Your IdeaRoom Configurator](https://help.idearoom.com/en/articles/9994645-embedding-your-idearoom-configurator)). The client also includes mobile-native share behavior.

A complete physical-device or responsive-emulation walkthrough was not available in the safe read-only session. Therefore, exact mobile drawer arrangement, canvas/control proportions, keyboard behavior, AR permission flow, and mobile quote completion remain unverified.

### Inferences

- The product is better described as a freeform visual editor with a persistent quote escape hatch than as a guided sales wizard.
- WolfSteel’s strongest conversion choice is letting visitors build immediately without a gate. Its greatest funnel cost is the long, abrupt qualification form at the end.
- Constraints appear declarative and context-sensitive: the client loads a large option catalog, then conditions determine which sizes, walls, components, and materials are currently valid.
- Red iron and tubular are operationally separate products, not two frame types within a unified customer project.

### Gaps

- Quote submission, email delivery, PDF output, login, authenticated Saved Designs, checkout, SalesView, camera/AR, and social sharing were deliberately not completed.
- No actual customer price table was available. Public configuration explicitly protects pricing.
- Mobile findings are limited to public code and vendor documentation, not a full device interaction recording.
- Numerous unused or legacy entries exist in the public catalogs; only options visibly exposed in the current UI are described as live.

### 2. Technology, surrounding funnel, and risk assessment

#### Takeaway

The wrappers are small, brand-specific launch pages for IdeaRoom’s CarportView product. The heavy behavior, rule engine, 3D rendering, serialization, share links, quote flow, and sales integration are vendor-controlled. WolfSteel complements them with a WordPress marketing funnel, chat, ad analytics, financing pages, and a separate staff-looking quotation calculator.

### Cited findings

**Confirmed stack and public assets**

- The [red wrapper](https://design3d.wolfsteelbuildings.com/) is an S3/CloudFront-hosted HTML page with a CarportView mount point using tenant key `wolfsteel-red-iron`. It also loads Google Tag Manager container `GTM-5Z7TSGZ` and Missive web chat.
- The [tubular wrapper](https://design.wolfsteelbuildings.com/) uses tenant key `wolfsteel-buildings` and loads CarportView, but its wrapper did not include the same GTM or Missive snippets.
- Both invoke the public [CarportView production loader](https://assets.carportview.com/production-carportview.js). The loader redirects through IdeaRoom domains to versioned JavaScript bundles.
- The current public client bundle identifies release `2.6.126` and references `api.idearoom.com`, `vendorserver.idearoom.com`, `share.idearoom.com`, `salesview.idearoom.com`, IdeaRoom asset/CDN hosts, and Sentry.
- Public client routes cover configurator/vendor retrieval, serialized design/order hashes, PDFs, draft-link notifications, and design events. IdeaRoom officially describes both subdomain and embedded deployment modes in its [embedding documentation](https://help.idearoom.com/en/articles/9994645-embedding-your-idearoom-configurator).
- IdeaRoom positions Carports as configurable steel-building visualization and quotation software on its [Carports product page](https://www.idearoom.com/carports). Its [service-level documentation](https://help.idearoom.com/en/articles/7968336-ifc-service-levels) distinguishes design/price/quote/lead features from higher plans that add invoices, checkout, dealer networks, and integrations.
- The downloaded application JavaScript was approximately 4.1 MB compressed before models, textures, generated previews, fonts, and other runtime assets. The Chrome session took several seconds before the 3D model appeared; the in-app browser showed a blank configurator canvas while chat loaded. These are observations, not general Core Web Vitals measurements.

**Pricing and public configuration exposure**

- Both public tenant documents set pricing visibility to protected and list IdeaRoom as the totals source. Their visible configurators consequently show Quote rather than a live total: [red data](https://db8rthss1z9vm.cloudfront.net/v2/carports/vendor/wolfsteel-red-iron), [tubular data](https://db8rthss1z9vm.cloudfront.net/v2/carports/vendor/wolfsteel-buildings).
- The same JSON exposes option identifiers, dimensions, materials, colors, component families, conditions, warning text, form fields, display flags, brand copy, and integration settings. This is normal for a client-rendered rule engine, but it means anything shipped in those documents should be treated as public.
- The protected configuration did not expose an obvious customer price table during inspection. Keeping confidential pricing and cost data out of the client bundle is a sound design choice.

**Website and adjacent funnel**

- WolfSteel’s main site is a WordPress/WP Engine property with Cloudflare/NitroPack delivery. Its public source loads Google Tag Manager, Facebook, TikTok, Missive, Google Maps, YouTube, and translation/social resources from third-party domains.
- The [Design & Get Quote page](https://wolfsteelbuildings.com/design-get-quote/) uses reviews, educational copy, turnkey services, Texas-only positioning, YouTube audience size, material explanations, financing references, and “talk to us instead” as trust/escape mechanisms around the configurator.
- WolfSteel describes service as Texas-only and points visitors outside Texas toward educational content on its [service-areas page](https://wolfsteelbuildings.com/service-areas/).
- The surrounding quote promise is inconsistent:
  - The [shop page](https://wolfsteelbuildings.com/shop/) says an estimate is provided within 12 hours.
  - The [custom-building page](https://wolfsteelbuildings.com/texas-custom-metal-building/) says a free quote within 24 hours.
  - Other marketing pages use 24–48 hours.
  - The configurator modal says one to two business days.
- The [financing page](https://wolfsteelbuildings.com/financing/) names Lyon, HFS, Frost, and personal financing paths, while portions of the design funnel mention only HFS and Frost.
- The website identifies WolfSteel Fab in Weatherford as an adjacent operational/manufacturing entity, while its configurator remains a WolfSteel Buildings sales surface.
- A public [calculator subdomain](https://calculator.wolfsteelbuildings.com/) exposes a staff-style quoting interface with salesperson, customer, building, discounts, price components, design link, uploads, quote status, and material-ordering fields. I did not access any saved-quote list or customer records. Its public discoverability and indexing are worth a security review even if data routes are authenticated.

**UX, accessibility, and quality issues**

Observed strengths:

- Immediate ungated exploration.
- Large, responsive visual model with direct manipulation.
- Undo/redo and camera recovery.
- Strong range of openings, materials, wall states, and add-on structures.
- Persistent quote CTA.
- Saved designs, share links, AR, and space planning.
- Detailed configuration summary and explicit final-price caveats.

Observed weaknesses:

- No guided journey or progress indicator.
- Information architecture mixes geometry with sales questions; for example, concrete and intended use sit under Style.
- The red tenant’s Sales panel says “TUBULAR ONLY,” a clear cross-tenant copy defect.
- Selecting Interior visually reveals structure despite copy claiming interior options are not visualized.
- Details displayed anomalous fields such as “Gray: Black” and duplicated gutter quantities.
- Controls and color swatches often lacked useful accessible names in the browser accessibility tree; several appeared only as generic buttons or internal identifiers.
- Canvas dragging and small swatches place a high burden on pointer/touch operation.
- “Top View” may imply a plan or layout drawing, but it is only a top-down rendering.
- The configurator, marketing site, and financing/warranty copy do not present one consistent SLA or warranty narrative.
- Hidden conditional rules can remove or change options without an obvious explanation.

**Privacy and abuse considerations**

- IdeaRoom’s [lead documentation](https://help.idearoom.com/en/articles/7968354-working-with-leads) says saved designs are associated with IP addresses and notes that SalesView cannot currently block an IP. This creates spam, rate-limiting, and privacy considerations.
- Share links are hash-based. They should be treated as bearer links: anyone possessing the URL may be able to retrieve the serialized design.
- Because rules and IDs are public, quote submissions and totals must be recalculated and validated server-side rather than trusted from browser state.
- Public configuration data should never contain internal costs, credentials, supplier secrets, private customer information, or authorization logic.

### Inferences

- IdeaRoom gives WolfSteel speed and catalog depth, but WolfSteel owns only a thin wrapper and tenant configuration. Fine-grained performance, accessibility, interaction, and data-governance improvements may therefore depend on vendor capability.
- The two-domain setup fragments analytics, saved-design continuity, copy governance, and product discovery.
- The unpriced model likely qualifies leads while protecting negotiated pricing, but it also withholds the most important decision variable until after a long form.
- The staff-facing calculator appears to be a separate downstream quoting/operations system rather than part of the normal consumer journey.

### Gaps

- No authenticated endpoint or administrative tool was tested.
- No customer records, quote lists, or private calculator routes were opened.
- Network evidence was limited to public wrappers, assets, configuration documents, and vendor documentation.
- Sentry/analytics presence was confirmed from public source, but event names, retention, consent behavior, and downstream audiences were not fully audited.
- Privacy-policy contents were not reliably accessible during the crawl.

### 3. Implementation recommendations for Triple J

#### Takeaway

Triple J should borrow WolfSteel’s immediacy and visual confidence, but use a cleaner single-product journey, an explicit state/rules architecture, progressive quote capture, real accessibility, consistent promises, and strict separation between public designs, PII, pricing, and staff tools.

### Cited findings and recommendations

**Borrow conceptually**

- **Start in the model, not behind a form.** WolfSteel’s configurators prove the value of anonymous exploration before PII ([red](https://design3d.wolfsteelbuildings.com/), [tubular](https://design.wolfsteelbuildings.com/)).
- **Keep a persistent conversion path.** Quote should remain reachable from every configuration state.
- **Use direct manipulation plus ordinary controls.** Clicking walls/openings, dragging components, and seeing changes immediately is compelling, but every action also needs a labeled form-control alternative.
- **Provide undo/redo, reset camera, exterior/interior, top view, share, and saved designs.**
- **Make constraints data-driven.** WolfSteel’s public tenant documents demonstrate how one catalog can carry conditional dimensions, compatible components, warnings, and display rules: [red JSON](https://db8rthss1z9vm.cloudfront.net/v2/carports/vendor/wolfsteel-red-iron), [tubular JSON](https://db8rthss1z9vm.cloudfront.net/v2/carports/vendor/wolfsteel-buildings).
- **Generate a human-readable final specification.** The visual model should always have a textual source of truth suitable for sales review.

**Improve substantially**

- Build one Triple J configurator route with an initial building-system choice rather than separate domains. Preserve a single project/share format across red iron, tubular, and future products.
- Add a lightweight journey:

  1. Building type and intended use
  2. Dimensions and roof
  3. Walls, leans, and storage
  4. Doors, windows, and openings
  5. Materials, insulation, and colors
  6. Site, concrete, permits, and services
  7. Review and quote

  Users should still be free to jump between steps.
- Explain constraints in context. If a width, door, roof pitch, or lean becomes invalid, state why and offer compatible alternatives instead of silently removing it.
- Keep business questions out of visual categories. “Need concrete?” belongs under Site & Services, not Style.
- Decide the pricing promise explicitly:
  - show a validated range;
  - show a stable base price plus “requires review” add-ons; or
  - clearly state “design only—priced proposal follows.”
  
  Avoid a UI that repeatedly resembles a priced ecommerce configurator while never revealing any price.
- Replace the large final quote wall with progressive capture:
  - initial quote: name, email/phone, ZIP, desired timing, and consent;
  - optional project qualification afterward;
  - salesperson preference and marketing-source questions should not block submission.
- Give saved/share actions transparent behavior: “This creates a private share link,” expiration controls, delete/revoke capability, and clear disclosure of whether an IP or analytics identifier is stored.
- Treat accessibility as a first-class acceptance criterion: named buttons, keyboard camera alternatives, color names and samples, visible focus, adequate touch targets, non-color selection states, reduced motion, a text-based editor, and an accessible configuration summary.
- Establish one authoritative SLA, warranty statement, financing list, service-area rule, and product-data owner. WolfSteel’s conflicting [shop](https://wolfsteelbuildings.com/shop/), [custom-building](https://wolfsteelbuildings.com/texas-custom-metal-building/), [financing](https://wolfsteelbuildings.com/financing/), and configurator messages illustrate the maintenance risk.
- Set a performance budget before selecting the 3D engine: staged loading, compressed GLB assets, shared materials/textures, low-detail mobile geometry, lazy AR/space-planner code, and a useful loading state. Do not make the quote form wait on the renderer.
- Offer a true dimensioned plan/elevation export if “Top View” or “plan” terminology is used.

**Avoid**

- Separate tenants with duplicated copy and diverging settings unless there is an unavoidable operational requirement.
- Auto-saving merely because Share was opened without telling the user.
- PII in share URLs or client-readable design payloads.
- Browser-authoritative pricing, discounts, engineering validity, or inventory.
- Publicly discoverable staff quotation interfaces.
- Exposing supplier costs, internal formulas, secrets, or privileged business rules in client configuration.
- Relying on canvas-only interactions.
- Mixing visually modeled options, quoted-only services, warranties, finance offers, and sales questionnaires in the same undifferentiated accordion.
- Copying WolfSteel’s labels, layout, trade dress, or proprietary option organization. The useful patterns are conceptual, not visual assets to reproduce.

### Inferences: recommended technical shape

- Define a versioned, serializable `BuildingDesign` object independent of Three.js/Babylon/React state.
- Maintain separate layers for:
  - product catalog;
  - compatibility/engineering rules;
  - pricing rules;
  - 3D scene projection;
  - quote/customer data.
- Recompute validity and any price server-side whenever a quote is requested.
- Store anonymous designs separately from PII. Use high-entropy share tokens, expiry/revocation, rate limits, abuse monitoring, and explicit ownership once a user authenticates.
- Log a small event vocabulary: configurator opened, system selected, dimension changed, opening added, invalid choice encountered, review viewed, save/share created, quote started, and quote completed.
- Keep the renderer replaceable. The durable product asset is the catalog/rules/design schema, not the 3D library.
- Model every visual choice as structured data so sales can reconstruct, price, revise, and compare designs without relying on screenshots.
- Build a fallback 2D/text configuration experience so weak devices and assistive technologies can still complete a quote.

### Gaps and product decisions needed before coding

- Which building systems belong in the first release?
- Which dimensions and engineering constraints are genuinely saleable by Triple J?
- Is pricing hidden, ranged, estimated, or exact?
- Which services—concrete, permits, engineering, financing, installation—are configurable versus merely requested?
- What is the authoritative quote turnaround promise?
- What CRM or sales workflow receives the design?
- Should anonymous designs persist, and for how long?
- Is authentication part of launch or a later phase?
- Which outputs are required: share link, PDF, image, BOM, salesperson worksheet, or contract-ready proposal?
- What mobile and accessibility acceptance standards are non-negotiable?

No claim from the existing local configurator draft was treated as authoritative in this research. Unverified surfaces—especially authenticated SalesView, quote submission, real mobile-device behavior, AR, checkout, and staff calculator data—are explicitly left as gaps.

---

## 3. Industry benchmarks

### 1. Best current benchmarks and comparison matrix

### Takeaway

No single product is the model to copy wholesale. The strongest benchmark stack is:

- Alan’s Factory Outlet for conversion clarity and price transparency.
- IdeaRoom/CarportView for configurator breadth and sales workflow.
- Sensei for modern commerce, AR, and mobile parity.
- Morton for interior/scale planning.
- Mueller for precise camera/scene controls.
- Tuff Shed and Studio Shed for progressive customization and checkout.

### Cited Findings

| Experience | Strongest transferable patterns | Notable friction / limitation |
|---|---|---|
| [Alan’s Factory Outlet 3D Builder](https://alansfactoryoutlet.com/3d-carport-and-metal-garage-builder/) — vendor not publicly identified | Four short stages: Size/Style → Sides → Doors/Windows → Colors. Starts with a valid building; uses “Good / Better / Best” roof choices, use-based popular sizes, fixed view buttons, background control, live option deltas, itemized subtotal, deposit and balance, instant buy, and save-by-email/PDF. It offers roof pitch, gauge, certification, surface, lean-to, walls, insulation and openings. When openings are impossible on open walls it explains why and offers “Edit Sides” or “Fully Enclose.” Alan’s official guide says the share action emails a saved-design link. [Builder](https://alansfactoryoutlet.com/3d-carport-and-metal-garage-builder/); [buyer guide](https://alansfactoryoutlet.com/wp-content/uploads/2025/03/Alans-Metal-Building-Buyers-Guide-2026.pdf) | Initial ZIP prompt and price urgency copy add friction. No clearly labeled undo/redo appeared in the inspected flow. It optimizes for standardized carport products more than custom red-iron engineering. |
| [Heritage Steel CarportView](https://builder.heritagecarports.com/) — IdeaRoom | Broadest customer-facing tool inspected: 3D/top view, AR, share, space planner, undo/redo-style toolbar, instant ZIP-based price, payment options, quote/purchase, favorites and saved designs. Its progressive menu covers style, size, sides/ends, materials, doors/windows, colors, services/financing/warranty and details. Openings are placed by wall, can be dragged, centered or cleared, and incompatible choices are disabled. Style families include standard, triple-wide, commercial, garage, barns, combo, lean-to and barndominium. IdeaRoom officially markets CarportView for customer self-configuration and accurate quotes. [Live deployment](https://builder.heritagecarports.com/); [IdeaRoom for Carports](https://www.idearoom.com/carports) | Requires ZIP before exposing regional price. The option catalog is large enough to feel dealer-oriented without careful curation. Several icon-only controls lacked useful accessible names in the live page. |
| [Eagle Carports Builder](https://build.eaglecarports.com/) and [Texwin CarportView](https://carportview.texwincarports.com/) — IdeaRoom | Additional live CarportView deployments. Eagle’s official dealer guide documents the sequence ZIP → builder → estimate → save → submit for quote, with an iPad/tablet recommended for a paperless dealer sale. [Eagle dealer guide](https://www.eaglecarports.com/wp-content/uploads/2022/10/2022-EC-DEALER-GUIDE-2022-v.1-web-1.pdf) | These implementations are optimized for manufacturer/dealer catalogs and regional pricing, which is more operationally complex than Triple J’s first release needs. |
| [Trinity Steel Structures / Sensei](https://trinitysteelstructures.sensei3d.com/) — [Sensei Carports](https://www.senseidigital.com/3d-carport-builder/) | Strong commerce surface: gallery presets, 3D/2D, size summary, live subtotal and deposit, lean-to/walls/openings/colors/insulation/options, AR, photo capture, compare, save/share and order. Sensei states the full designer and pricing work on phones and supports manufacturer comparison, insulation and load-compliance workflows. [Trinity guide](https://trinitysteelstructures.com/design-and-price-your-metal-building-with-our-3d-builder); [Sensei](https://www.senseidigital.com/3d-carport-builder/) | State-selection gate precedes design. The inspected save/share action first generated several building images and displayed a progress wait, creating extra latency. Heavy icon use and unlabeled controls weakened accessibility. |
| [Mueller 3D Design Tool](https://apps.muellerinc.com/design/) — vendor not disclosed | Numeric inputs plus sliders for width/length/height/pitch; overhang, lean-to, openings, wainscot, gutters, ridge vents, colors, insulation and translucent/liner panels. Camera presets include top, every elevation/corner and inside; scene choices include East Texas, West Texas and mountains; shadows plus truck/person toggles help scale. It offers start over, spec sheet, share and quote. Mueller publishes supported desktop/mobile browsers and recommends Chrome if problems occur. [Official overview](https://www.muellerinc.com/3d-tool) | Saving and requesting a quote require login or registration. The visual style is dated, controls are dense, and no live price was visible before account creation. |
| [Morton 3D Studio](https://3dstudio.mortonbuildings.com/) — [On The Z](https://onthez.com/) | Deepest planning feature set: connected buildings on all four sides, gabled/wrap porches, roof/truss options, wainscot, interiors, walls, ceiling, mezzanine, measurements, 2D, look-inside, hide-walls, backgrounds/map placement and dozens of scale objects including trucks, RVs, aircraft, workbenches and farm equipment. It supports print, save, share and sales consultation. [Morton overview](https://mortonbuildings.com/design-your-morton-building); [live studio](https://3dstudio.mortonbuildings.com/) | Hundreds of controls appear in one long menu, producing substantial cognitive load. No price is shown. The consultation form asks for extensive contact/address data, and Morton says desktop is more optimal than tablet/mobile. |
| [Tuff Shed](https://www.tuffshed.com/) Build-A-Quote — vendor not disclosed | Transferable shed pattern: ordered steps for type/style/size, openings, walls, paint, roof, floor/anchors, interior and finalization; live price, top/interior views, scale-object insertion, save quote and checkout. [Official design page](https://www.tuffshed.com/building-process/design); [official tool guide screenshot](https://www.888tuffshed.com/wp-content/uploads/2023/08/Specialty-Design-Tools-Tuff-Shed-Toolkit.pdf) | Its product is a smaller standardized shed, so the price/checkout pattern transfers better than its structural logic. |
| [Studio Shed Design Center](https://harp.studio-shed.com/) — vendor not disclosed | Premium finish-selection benchmark: materials, exterior and interior colors, flooring, windows, roof add-ons, pergola/awning, multiple elevation/interior views and detailed price breakdown. Save unlocks shipping and installation estimates and online ordering. | Far more interior-design complexity than a first metal-building configurator needs. Save/ZIP gates later pricing details. |

IdeaRoom now treats “Boost” as its mobile-first interface and says Classic/Modern interfaces were scheduled to lose support after June 2026. Its Boost menu hard-codes a sensible taxonomy—Style, Size, Materials, Colors, Doors & Windows, Interior and section properties—while allowing optional components to be reordered or removed. [Boost overview](https://help.idearoom.com/en/articles/13562906-why-boost-matters-turning-mobile-performance-into-more-sales); [menu model](https://help.idearoom.com/en/articles/15139461-configurator-menu-customization-sup_uimenucomponentcustomization)

### Inferences

- Alan’s is the best model for a first-time buyer’s path; CarportView is the best capability ceiling; Morton is a warning against exposing every possible option at once.
- Triple J should combine Alan’s four-to-six-step simplicity with CarportView’s model accuracy and wall-aware validation.
- AR, full interiors and production/BOM integration are proven capabilities, but they are not necessary to validate demand for Triple J’s configurator.

### Gaps

- Alan’s, Mueller’s, Tuff Shed’s and Studio Shed’s public pages do not identify the underlying configurator vendor.
- Competitor conversion numbers are generally private. IdeaRoom’s available uplift figures are vendor-reported, not independently audited.

### 2. Interaction, conversion, quality and risk patterns

### Takeaway

The consistent winning pattern is “valid building first, visual consequence immediately, commercial commitment last.” The strongest tools progressively disclose choices, keep price or quote status visible, and delay personal-data collection until save/quote.

### Cited Findings

- Alan’s exposes a complete, valid building immediately, groups the process into four stages, shows dollar or percentage deltas beside upgrades, and keeps price, deposit and balance visible. Its popular sizes are labeled by use (“1 Car / RV,” “2 Cars,” “3+ Cars”), reducing dimensional guesswork. [Live builder](https://alansfactoryoutlet.com/3d-carport-and-metal-garage-builder/)
- CarportView’s opening editor explains the interaction in context: choose a wall, add an item, then drag or edit it; unavailable windows are disabled when the wall is open. It also preserves an always-visible estimate/quote action. [Heritage CarportView](https://builder.heritagecarports.com/)
- Morton’s gallery and Morton’s public “premade design” categories reduce blank-canvas anxiety, but the actual editor exposes connected buildings, porches, interiors, scale objects and environment controls in one very large surface. [Morton overview](https://mortonbuildings.com/design-your-morton-building); [studio](https://3dstudio.mortonbuildings.com/)
- Mueller gates both save and quote behind login/registration, whereas Alan’s lets the buyer design and see price before requiring email for save. [Mueller tool](https://apps.muellerinc.com/design/); [Alan’s builder](https://alansfactoryoutlet.com/3d-carport-and-metal-garage-builder/)
- IdeaRoom says visualization leads buyers to add options they otherwise would not, and its customers report higher average tickets; treat these testimonials as vendor evidence rather than independent proof. [Post-frame page](https://www.idearoom.com/post-frame); [Carport page](https://www.idearoom.com/carports)
- IdeaRoom reports that Boost users see higher buyer intent and more weekly leads; another official webinar summary reports 20% more leads and $0.54 lower cost per lead, again vendor-reported. [Boost overview](https://help.idearoom.com/en/articles/13562906-why-boost-matters-turning-mobile-performance-into-more-sales); [official webinar summary](https://help.idearoom.com/es/articles/13494573-herramientas-de-autoservicio)
- IdeaRoom supports precise wall-item placement, top view/space planning, interior walls, mezzanines and SmartBuild handoff. SmartBuild then generates pricing, BOMs, proposals and construction documents, but its own FAQ describes substantial licensing and implementation work and distinguishes the desktop back-office product from mobile IdeaRoom. [IdeaRoom capability collection](https://help.idearoom.com/en/collections/12931049-using-idearoom); [mezzanines](https://help.idearoom.com/en/articles/12694433-using-mezzanines-in-idearoom); [SmartBuild FAQ](https://smartbuildsystems.com/faqs/)
- Google states that canvas-rendered content is not indexed and recommends semantic HTML, crawlable links, textual descriptions and server/static rendering where appropriate. [Google developer SEO guide](https://developers.google.com/search/docs/fundamentals/get-started-developers); [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- Current Core Web Vitals “good” thresholds are LCP ≤2.5 seconds, INP ≤200 ms and CLS ≤0.1 at the 75th percentile, measured separately for mobile and desktop. [web.dev](https://web.dev/articles/vitals)
- WCAG requires keyboard equivalents for pointer actions and a single-pointer alternative for drag-only behavior; WCAG 2.2’s minimum target criterion is 24×24 CSS pixels or sufficient spacing. [Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard); [dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements); [target size](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)

### Inferences

Recommended sequence:

1. Choose intended use or starter design.
2. Choose product family and basic dimensions.
3. Configure roof/envelope and simple lean-to.
4. Add openings wall-by-wall.
5. Choose colors and upgrades.
6. Review summary, estimate status and request quote.

Conversion and upsell:

- Put visually obvious, margin-positive upgrades beside the model: lean-to, wainscot, larger doors, extra openings, insulation and thicker panels.
- Show the incremental effect of an option, not only a final total.
- Keep one sticky “Review / Request Quote” action visible.
- Use preconfigured Central Texas examples—RV cover, workshop, equipment barn, two-bay garage—rather than an empty canvas.
- Do not require an account. Ask for ZIP only when it materially affects availability, engineering rules or an approved price.

Friction to avoid:

- A Morton-sized control inventory in v1.
- Mueller-style account gating.
- Silent automatic deletion of openings after a size change.
- Drag-only opening placement.
- Full street address or marketing consent before the buyer requests contact.
- Artificial urgency banners and unqualified “final price” language.

Accessibility, browser and performance:

- Every swatch needs a color name; every icon needs an accessible name; every slider also needs a numeric field.
- Provide named Front/Back/Left/Right/Top/Inside buttons so orbit gestures are optional.
- Door/window placement needs wall, offset and nudge controls in addition to dragging.
- Maintain a DOM-based configuration summary and status messages outside the canvas.
- Load a lightweight shell and valid low-detail model first; lazy-load optional assets, cap texture quality by device, and offer a static/2D fallback if WebGL fails.
- Support current Safari, Chrome, Edge and Firefox on desktop plus iOS Safari and Android Chrome; validate on real low/mid-tier phones.

Trust, privacy and SEO:

- Clearly label the model as conceptual and any number as a budgetary estimate until Triple J reviews site, engineering, delivery and foundation requirements.
- Display local phone/contact, service area, exclusions, response expectation and an exact submitted configuration summary.
- Collect only name, one contact method, project ZIP/county and intended use at quote; make comments optional and marketing consent separate.
- Never place PII inside share URLs; use opaque tokens and server-side authorization/expiry.
- Keep the configurator page server-rendered with descriptive copy, FAQs, examples and links. Index curated starter-design pages with real text and thumbnails; canonicalize or noindex arbitrary saved variants.

### Gaps

- No independent public study isolates which individual configurator feature produces the greatest conversion lift.
- Accessibility conformance statements were not found for the inspected industry tools; several live tools visibly use unlabeled icon controls, so Triple J should treat accessibility as a differentiator rather than copy competitors.

### 3. Triple J phased recommendation

### Takeaway

Build a restrained sales configurator first, not a consumer CAD system. Model welded and bolt-up/red-iron products as separate rule sets behind one interface, because dimensions, structural representation, allowable openings and pricing logic should not be conflated.

### Cited Findings

- IdeaRoom explicitly separates customer-facing mobile configuration from SmartBuild’s back-office BOM, pricing and construction-document workflow. [SmartBuild FAQ](https://smartbuildsystems.com/faqs/)
- IdeaRoom’s current Boost taxonomy keeps style, size, materials, colors, openings, interiors and section properties separate, supporting progressive disclosure. [Boost menu model](https://help.idearoom.com/en/articles/15139461-configurator-menu-customization-sup_uimenucomponentCustomization)
- IdeaRoom describes pricing as the most complex and time-intensive portion of a CarportView implementation, supporting a cautious estimate-first rollout. [IdeaRoom pricing implementation](https://help.idearoom.com/en/articles/7968339-ifc-carport-pricing)

### Inferences

**MVP — prove that buyers will complete and submit a useful design**

- Start with one valid model and four use-based presets. Let the buyer select “Welded steel” or “Red-iron clear span” only if Triple J genuinely wants customers choosing the system; otherwise derive/recommend the system from use and span.
- Six compact stages: Start, Size, Structure, Openings, Finish, Review.
- Support width, length, eave height, gable/single-slope roof, pitch, overhang, wall state, roof/wall/trim/wainscot colors, and a limited catalog of overhead doors, walk doors and windows.
- Include one constrained lean-to model: side, depth, length/offset, height and roof pitch; no wraps, compound corners or arbitrary attached buildings.
- Enforce ranges, opening overlap/edge/height rules and lean-to compatibility. Disable impossible choices with a reason and preserve prior selections whenever possible.
- Provide orbit/zoom, named elevations, top view, one neutral Central Texas ground/sky scene, shadows, undo, redo, reset with confirmation and local autosave.
- Show a live text summary and dimensions. Only show a dollar estimate if every rule is backed by Triple J’s approved price source; otherwise show “Request a project estimate.”
- Quote submission should send schema version, product family, all parameters, opening positions, option IDs, four rendered thumbnails, estimate/exclusion text and timestamp. Require name plus either email or phone, project ZIP/county and intended use; no account.
- Mobile layout: model above a thumb-friendly bottom sheet, sticky summary/quote CTA, 44px preferred targets, no horizontal toolbars.
- Instrument start, first edit, stage completion, validation error, undo/reset, quote-open, quote-submit and share events.

**v1.1 — improve lead quality and follow-up**

- Add a reusable preset/gallery system and editable shared URLs.
- Add PDF/elevation summary, four image captures and email-to-self without account creation.
- Add precise drag-and-snap openings plus wall/offset/nudge alternatives.
- Add a small scale library: pickup, RV, tractor, workbench and person.
- Add “look inside” or hide-wall mode and simple floor/clearance measurements.
- Add budgetary price ranges, option deltas and deposit illustration only after finance/price rules are operationally approved.
- Add lead-routing and CRM/webhook integration, analytics funnel dashboards and abandoned-design recovery only with explicit consent.

**Later — expensive or operationally risky**

- AR, property-photo overlay, satellite/map placement, day/night lighting and weather.
- Arbitrary connected buildings, L/T plans, wraparound lean-tos, mezzanines and full interior floor planning.
- Wind/snow/code automation, engineering calculations or permit-ready claims.
- Automated BOM, takeoff, shop drawings, SmartBuild/ERP integration and inventory-aware quoting.
- Checkout, deposits, financing, digital signatures, customer accounts and order tracking.
- Photoreal vehicle/interior libraries and multi-user salesperson collaboration.

**Acceptance criteria**

- A first-time mobile user can produce and submit a standard workshop without help in under five minutes.
- No invalid geometry can be submitted; every blocked choice explains why.
- Changing dimensions never silently removes an opening or lean-to.
- All non-freehand functions work with keyboard and single-pointer controls.
- Configuration state round-trips exactly through save/share/quote payloads.
- Mobile and desktop meet the cited Core Web Vitals targets in field monitoring.
- The quote record is sufficient for Triple J to reopen the identical design and begin a real sales conversation without asking the buyer to restate dimensions or options.

### Gaps

- Final MVP spans, increments, opening catalog, lean-to rules and whether public pricing is safe depend on Triple J’s actual fabrication and estimating rules.
- The research cannot determine whether buyers should choose welded versus bolt-up construction themselves; that is a product-positioning decision rather than an interface fact.

---

## 4. REA assessment

### REA reverse-engineering assessment for Triple J

### What REA actually is, how it works, and its technical architecture

### Takeaway

REA is not a 3D configurator, rendering framework, or reusable building-design baseline. It is a fast-moving, local reverse-engineering CLI/MCP server that can inspect a live website, capture reproducible browser scenarios, inventory bundles and network behavior, trace executed JavaScript, and return evidence for an agent to interpret.

The assessment below is pinned to published tag [`rea-agents-6.4.0`](https://github.com/morluto/rea/releases/tag/rea-agents-6.4.0) (`a56f7bb668ab23fec8d33f7af353ac7ed2fe1895`) and the inspected `main` snapshot [`4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e`](https://github.com/morluto/rea/commit/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e), current on 2026-10-13.

### Cited Findings

- The repository describes REA as one MCP/CLI for inspecting native binaries, JavaScript/Electron apps, .NET assemblies, websites, network captures, and other artifacts. Its intended loop is “agent calls REA → REA returns evidence → agent explains or implements,” not “REA supplies application UI/components.” — [README at inspected commit](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/README.md)

- The distributable is the ESM npm package `rea-agents`, with `rea` and `rea-agents` binaries. It requires Node `^22.19.0`, `^24.11.0`, or `>=26.0.0`. Principal runtime dependencies include the MCP SDK, Zod, Playwright Core, Babel Parser/Types, parse5, WebSocket, source-map tracing, Electron ASAR support, and various artifact parsers. There is no React, Next.js, Three.js, React Three Fiber, Babylon.js, WebGL engine, CAD kernel, physics engine, Redux, Zustand, or configurator-specific dependency. — [`package.json`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/package.json)

- Its architecture is layered:

  - `scripts/rea.mjs` dispatches either CLI or MCP mode.
  - `src/cli.ts` registers one-shot commands.
  - `src/main.ts` owns the long-lived stdio MCP server.
  - `src/composition/` wires providers and sessions.
  - `src/server/` translates MCP calls.
  - `src/application/` contains workflows.
  - `src/contracts/` owns caller-visible schemas.
  - `src/domain/` contains side-effect-free models.
  - `src/browser/` implements CDP and Playwright observation.
  - `src/process/` supervises owned processes and resource boundaries.  
  — [`docs/architecture.mermaid`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/architecture.mermaid), [`src/cli.ts`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/cli.ts), [`src/main.ts`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/main.ts)

- The web-analysis surface most relevant to WolfSteel includes:

  - `list_browser_targets`
  - `inspect_web_page`
  - `analyze_web_bundle`
  - `observe_web_session`
  - `capture_browser_scenario`
  - `capture_web_screenshot`
  - `compare_web_captures`
  - `compare_web_screenshots`
  - `observe_web_execution`
  - `inspect_web_event_listeners`
  - `export_web_scripts`
  - `trace_web_module_imports`
  - `trace_web_source_location`
  - offline HAR/SAZ/qlog inspection.  
  Passive inspection can return DOM structure, accessibility nodes, scripts, resources, network/console/WebSocket metadata, workers, selected storage metadata, screenshots, chunk relationships, route/endpoint candidates, vendor fingerprints, and optional source-map evidence. — [`docs/browser-observation.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/browser-observation.md), [`src/contracts/browserToolContracts.ts`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/contracts/browserToolContracts.ts)

- A practical WolfSteel investigation flow would be:

  1. Use a dedicated Chrome-family profile on a loopback CDP port, or let a Playwright scenario launch a temporary owned profile.
  2. List and select the configurator page target.
  3. Capture a passive baseline with DOM, accessibility, scripts, resources, screenshots, and narrowly selected network metadata.
  4. Run deterministic UI scenarios through representative configurator changes.
  5. Arm manual observation or precise execution coverage while a human operates interactions the scenario vocabulary cannot express.
  6. Compare before/after scenarios and screenshots.
  7. Export retained scripts, analyze their application graph, trace imports, map selected generated locations through locally supplied source maps, and inventory observed APIs.
  8. Preserve the returned Evidence records and explicit limitations rather than treating a partial capture as complete.  
  — [`docs/browser-observation.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/browser-observation.md), [`docs/browser-scenario-contract.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/browser-scenario-contract.md), [`docs/website-script-export.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/website-script-export.md), [`docs/website-module-trace.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/website-module-trace.md)

- Automated scenario actions are deliberately limited to `goto`, `click`, `fill`, `press`, `select_option`, `check`, `uncheck`, `wait_for`, and `wait_for_timeout`. Locators are CSS, test ID, or a bounded set of accessibility roles. There is no pointer move, coordinate click, drag, wheel, touch gesture, file upload, canvas hit testing, pinch/zoom, or orbit-control action in the public scenario schema. — [`src/domain/browserScenarioValues.ts`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/domain/browserScenarioValues.ts)

- A scenario can fix viewport, device scale factor, locale, timezone, color scheme, reduced-motion preference, service-worker policy, cookies, local/session storage, secrets, and requested artifacts/events. Defaults are 1280×720, scale 1, `en-US`, UTC, light theme, reduced motion, blocked service workers, empty storage, and only the final URL. — [`src/domain/browserScenarioValues.ts`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/domain/browserScenarioValues.ts)

- REA’s “state store” is an investigation ledger, not configurator state. Evidence records contain subject/provider identity, analysis profile, parameters, raw and normalized results, confidence, authority, environment, limitations, relationship coverage, locations, and links. Their semantic content is hashed into `evidence_id`; `EvidenceLedger` stores immutable records and explicitly tracked unresolved questions for a session. — [`src/domain/evidence.ts`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/domain/evidence.ts), [`src/application/investigation/EvidenceLedger.ts`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/application/investigation/EvidenceLedger.ts), [`src/application/investigation/InvestigationRecords.ts`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/application/investigation/InvestigationRecords.ts)

- Precise V8 execution observation can connect executed ranges, request initiators, scripts, and selected source locations, but it intentionally changes JIT/timing by starting precise coverage and preventing optimized execution until capture stops. It does not establish UI causality, chronological execution, child-frame/worker behavior, WebAssembly behavior, or browser performance. — [`docs/web-runtime.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/web-runtime.md)

- REA’s own public website is unrelated to its analysis engine and is not a framework example: it uses authored HTML, CSS, small JavaScript files, Python generation/checking, gettext translations, and no frontend framework or npm dependency. Documentation separately uses VitePress. — [`website/README.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/website/README.md), [`package.json`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/package.json)

- Build and QA are substantial: TypeScript compilation, Turbo task orchestration, Oxlint/Oxfmt, Knip, duplicate detection, Vitest projects across domain/application/adapters/boundaries/MCP/acceptance, coverage thresholds, browser-specific real-provider workflows, package verification, and release qualification. — [`turbo.json`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/turbo.json), [`vitest.config.ts`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/vitest.config.ts), [`.github/workflows/ci.yml`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/.github/workflows/ci.yml)

- Maintenance is exceptionally active but unstable. Version 6.4.0 was published on 2026-10-11; the inspected `main` commit was made on 2026-10-13. The 6.4.0 notes contain multiple explicit breaking changes, including web-capture and saved-Evidence schema changes. — [6.4.0 release](https://github.com/morluto/rea/releases/tag/rea-agents-6.4.0), [current inspected commit](https://github.com/morluto/rea/commit/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e)

### Inferences

- REA should be treated as a pinned research tool, not as a Triple J application dependency or architectural starting point. Its useful product is captured evidence about WolfSteel, not reusable 3D code. — [Repository purpose](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/README.md), [dependency manifest](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/package.json)

- For a canvas/WebGL configurator, fixed Playwright scenarios should cover ordinary controls, option panels, validation, URLs, and quote flows. Camera orbiting, canvas selection, drag placement, and other pointer-rich interactions need manual operation during `observe_web_session`/`observe_web_execution`, a separate purpose-built Playwright script, or ordinary browser automation tooling. — [Scenario action schema](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/domain/browserScenarioValues.ts), [runtime observation](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/web-runtime.md)

- REA can help determine whether WolfSteel uses Three.js, Babylon.js, custom WebGL, server-rendered images, prebuilt GLB/GLTF assets, or a proprietary third-party configurator by combining vendor fingerprints, captured scripts, static imports, network bodies, and runtime source attribution. It will not automatically recover a clean scene graph, semantic building model, engineering rules, or pricing formula merely because those facts influence rendered output. — [Bundle-analysis contract](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/contracts/browserToolContracts.ts), [script-export limitations](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/website-script-export.md)

### Gaps

- This subtask did not run REA against WolfSteel, so the target’s actual rendering engine, asset formats, API schema, option state, pricing behavior, and hosting/vendor relationships remain unverified.
- No REA benchmark exists for WolfSteel’s bundle size or source-map availability; actual capture completeness and resource-limit behavior remain unknown until a bounded trial.
- REA exposes internal provider ports and contracts, but I found no promise that these internals form a stable third-party plugin SDK.

### Reusability, extension points, and exact licensing implications

### Takeaway

Triple J should reuse REA as an external inspection instrument and borrow its evidence discipline. It should not fork its architecture into the configurator. REA-authored code is MIT-licensed, but that license does not extend to WolfSteel’s code, assets, models, copy, data, or visual identity.

### Cited Findings

- REA’s public extension seams are architectural ports and contracts: `BrowserObservationPort`, application services, provider registries, Zod domain schemas, MCP tool contracts, and composition factories. Adding a new browser capability would require work across schema/domain, provider implementation, contract registration, CLI/MCP surfaces, and tests; this is not a drop-in UI/plugin model. — [`docs/architecture.mermaid`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/architecture.mermaid), [`src/application/BrowserObservationPort.ts`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/application/BrowserObservationPort.ts), [`src/application/BrowserObservationService.ts`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/application/BrowserObservationService.ts)

- The exact top-level license is MIT, copyright 2026 morluto. It permits use, copying, modification, merging, publication, distribution, sublicensing, and sale. Its operative condition is that the copyright notice and permission notice be included in all copies or substantial portions of the Software. — [`LICENSE`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/LICENSE)

- REA-authored code is MIT, but third-party material retains separate copyright, license, attribution, and NOTICE requirements. The repository documents npm dependencies, derived parsers, assets, native runtime components, and separately obtained engines under MIT, Apache-2.0, LGPL, GPL/runtime exceptions, BSD, and proprietary terms depending on the component. — [`THIRD_PARTY_NOTICES.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/THIRD_PARTY_NOTICES.md)

- The project expressly states that analysis output or source-like reconstruction does not grant rights in the original program, its data, or the generated output. It disclaims authorization to copy proprietary software or reproduce protected code and assets, and places responsibility on the user to comply with laws, contracts, intellectual-property rights, privacy obligations, and target terms. The disclaimer states that these policies do not amend the MIT grant. — [`DISCLAIMER.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/DISCLAIMER.md)

- Captured website scripts can be exported and statically analyzed, but the documentation warns that captured source does not establish execution or completeness, source maps are not authenticated merely by declaration, missing dependencies remain unknown, and export does not grant rights in the source. — [`docs/website-script-export.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/website-script-export.md), [`docs/web-source-location.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/web-source-location.md)

### Inferences

- Genuinely reusable for Triple J:

  - The installed/pinned CLI or MCP service as a research tool.
  - Its methodology of deterministic scenario inputs, explicit capture scope, content-addressed artifacts, provenance, comparisons, and recorded unknowns.
  - Research outputs such as a high-level interaction inventory, option dependency map, observed request catalog, framework/vendor identification, and evidence-backed behavior descriptions—provided they are rewritten as independent product requirements rather than copied source.  
  — [Evidence model](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/domain/evidence.ts), [scenario comparison](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/browser-scenario-contract.md)

- Poor fits for direct reuse:

  - Its provider/process architecture, which solves binary and multi-runtime analysis rather than building configuration.
  - Its session Evidence ledger as the customer configurator’s state store.
  - Its static website or VitePress setup.
  - Its browser-capture schemas as the Triple J customer configuration schema.
  - Any claim that it contains geometry, framing, clash detection, structural validation, takeoff, pricing, quoting, or sales workflow logic.  
  — [Architecture map](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/architecture.mermaid), [package dependencies](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/package.json)

- If Triple J merely runs REA and independently implements observed concepts, there is no REA source copied into the product, so the MIT notice ordinarily need not appear in Triple J’s application bundle on account of REA alone. If Triple J copies or adapts REA files or substantial code portions, preserve REA’s copyright and permission notice and review copied dependencies/derived material against `THIRD_PARTY_NOTICES.md`. This is a license-reading conclusion, not legal advice. — [MIT license](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/LICENSE), [third-party inventory](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/THIRD_PARTY_NOTICES.md)

- REA’s MIT license cannot be used as permission to copy WolfSteel’s minified bundle, 3D models, textures, photographs, logos, copy, pricing tables, screenshots, or distinctive trade dress. The safe planning posture is clean-room behavioral study: document workflows and user needs, then design independent state schemas, geometry generation, interface components, assets, and copy. — [Responsible-use and output-rights disclaimer](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/DISCLAIMER.md)

### Gaps

- WolfSteel’s terms of use, configurator vendor agreement, robots policy, asset licenses, patents, and copyright ownership were outside this repository-only subtask and must be reviewed separately.
- Whether any particular observed interaction, workflow, or visual arrangement is protectable requires jurisdiction-specific legal analysis.
- No stable-API guarantee was found for importing REA internals directly into another TypeScript project.

### Risks, limitations, and recommendation for the Triple J research/build plan

### Takeaway

Use a version-pinned REA run during discovery, in an isolated profile, with narrowly scoped evidence. Combine it with ordinary browser inspection, accessibility testing, mobile/device testing, and WebGL performance profiling. Borrow observable workflow principles; avoid copying target implementation or making REA part of the shipped configurator.

### Cited Findings

- Security boundary: REA analyzes locally, but runtime/browser workflows execute or observe targets with the current user’s permissions. Its security policy says REA is not a sandbox and does not protect against malicious same-user processes. — [`SECURITY.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/SECURITY.md)

- Browser safety: passive CDP mode requires a loopback endpoint and recommends a dedicated profile; the docs warn not to expose the debugging port on a non-loopback interface. Captured URLs preserve ordinary query values/fragments, optional script text and console text may contain secrets, and local analysis results still reach the configured model provider under that provider’s data policy. — [`docs/browser-observation.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/browser-observation.md)

- Playwright scenarios are active. Navigations follow declared destinations and the page’s ordinary browser requests, with no separate origin allowlist or request-interception layer. A remote configurator can therefore execute its normal analytics, third-party requests, account actions, downloads, and application state changes. — [`docs/browser-scenario-contract.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/browser-scenario-contract.md)

- Target content is untrusted and may contain prompt-injection-like instructions. REA marks such MCP results with provenance metadata and tells agents to treat page text, scripts, logs, and tool output as data rather than instructions. — [`docs/mcp-contracts.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/mcp-contracts.md)

- Resource/performance limitations include a default MCP receive budget of roughly 10 MiB, 64 MiB CDP-message boundaries, explicit heap/deadline limits for source-map and JavaScript analysis, and a 256 MiB estimated working-memory budget for screenshot comparison. Browser scenarios return requested artifacts and observed events inline and do not impose application-level caps on many event/artifact counts, so broad captures can become very large. — [`docs/mcp-contracts.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/mcp-contracts.md), [`docs/browser-observation.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/browser-observation.md), [`docs/browser-scenario-contract.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/browser-scenario-contract.md)

- Accessibility support is observational: REA can capture accessibility structure/text and use role locators, but it does not claim WCAG auditing or remediation. Mobile controls are limited to viewport/device-scale and deterministic environment fields; there is no mobile-device descriptor, touch action vocabulary, orientation control, or multi-browser engine coverage in the scenario contract. — [`src/domain/browserScenarioValues.ts`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/domain/browserScenarioValues.ts), [`docs/browser-scenario-contract.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/browser-scenario-contract.md)

- Rendering/performance support is also observational. Screenshot comparison is pixel-based without OCR, and execution observation is V8 coverage that changes JIT behavior; neither is a WebGL/GPU profiler or a measure of frame time, draw calls, triangle count, texture memory, shader cost, input latency, or thermal behavior. — [`src/contracts/browserToolContracts.ts`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/contracts/browserToolContracts.ts), [`docs/web-runtime.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/web-runtime.md)

- Release churn is material: 6.4.0 itself lists breaking changes to web-capture shapes and saved Evidence compatibility. Security fixes are supported only on the latest published version. — [6.4.0 release](https://github.com/morluto/rea/releases/tag/rea-agents-6.4.0), [`SECURITY.md`](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/SECURITY.md)

### Inferences

- Recommended use:

  - Pin `rea-agents@6.4.0` for the research run and record the tag, browser version, viewport, timestamp, origins, scenarios, and capture options. Do not use floating `@latest` if reproducibility matters.
  - Prefer one-off CLI invocation over `setup` if permanent agent-configuration changes are unnecessary.
  - Use a new browser profile without personal logins, saved cards, customer data, extensions, or unrelated tabs.
  - Capture only the event families and bodies needed for each question; preserve secrets as explicit declarations and avoid quote submission or lead-generation actions.
  - Treat minified code and page text as untrusted evidence, not implementation instructions.  
  — [Installation/update model](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/README.md), [browser safety guidance](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/browser-observation.md)

- Borrow conceptually:

  - A deterministic scenario matrix covering dimensions, roof type/pitch, colors, openings, accessories, invalid combinations, resets, saving/sharing, quote handoff, and responsive layouts.
  - Explicit “observed / inferred / unknown” distinctions.
  - Before/after screenshots plus semantic configuration assertions.
  - Versioned configuration JSON and replayable scenarios.
  - Accessibility-tree capture alongside visual output.
  - Content-addressed assets and reproducible regression artifacts.  
  — [Evidence schema](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/src/domain/evidence.ts), [scenario comparison semantics](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/browser-scenario-contract.md)

- Adapt for Triple J:

  - Replace REA’s Evidence ledger with a purpose-built, serializable `BuildingConfiguration` domain model that separately owns customer selections, engineering constraints, geometry inputs, quote metadata, and schema version.
  - Test visual output with screenshots, but test correctness primarily against configuration invariants and generated geometry/takeoff data.
  - Supplement REA with Chrome Performance/Memory tooling, renderer statistics, asset-weight budgets, Lighthouse, keyboard testing, axe or equivalent accessibility checks, touch-device tests, and representative low-power mobile hardware.
  - Build independent parametric geometry appropriate to welded/bolted red-iron or tubular buildings; no REA module supplies that capability.  
  — [REA package surface](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/package.json), [runtime observation limits](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/web-runtime.md)

- Avoid:

  - Shipping REA inside the customer-facing application.
  - Forking REA’s provider/session/process architecture for configurator state.
  - Copying WolfSteel bundle code, models, textures, copy, brand elements, screenshots, or distinctive visual design.
  - Assuming a captured price or engineering restriction is Triple J’s rule.
  - Treating screenshot similarity as proof of structural, pricing, or accessibility correctness.
  - Running broad automated crawls from a logged-in personal browser profile.  
  — [Responsible-use constraints](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/DISCLAIMER.md), [capture completeness model](https://github.com/morluto/rea/blob/4aa51bfe1997ef2df6e905ab2fb7bcd5fabfe16e/docs/browser-observation.md)

### Gaps

- Actual WolfSteel compatibility with passive CDP, source export, source maps, network body capture, and precise coverage remains to be tested.
- Canvas accessibility, keyboard behavior, mobile touch handling, quote-side effects, and WebGL performance require target-specific testing beyond REA.
- The exact safe crawl boundary should be finalized only after reviewing WolfSteel’s terms, robots policy, authentication boundaries, and any third-party configurator vendor terms.
