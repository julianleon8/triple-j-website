# 3D Builder (`/build`)

Live on `main` since 2026-10-14, **unlisted** (noindex, no menu link, no sitemap entry) until Julian and Freddy sign off the shop rules below. Decisions: `Decisions.md` 2026-10-14 (three rows). What is true now: `Locked Decisions.md` → Product, Pricing, Project inquiries.

## What a customer does

1. **Start:** carport, RV & boat cover, garage & shop, or barn. Each loads a sales-pack size.
2. **Size & roof:** width, length, eave height; flat (low single slope, high at the front) or gabled 3:12.
3. **Walls:** each side open, partial (top 3 ft), gable end (front/back of a gable roof) or enclosed.
4. **Doors & windows:** roll-up, walk door, window; pick the wall, then drag it along the wall in the 3D view or on the plan (half-foot steps; it stops a foot from a corner, a foot from the next opening, and where the wall gets too low, and says which). The selected one is outlined in blue with a label; whatever is in the way flashes amber.
5. **Lean-tos:** left, right or back; depth; open or enclosed. Up to two; a back lean-to can't share corners with a side one.
6. **Colors:** roof, walls, trim (roll-up doors follow trim), ridge cap on a gabled roof (matches the roof unless picked), optional 3 ft wainscot. Standard Line colors from `src/lib/colors.ts`.
7. **Frame & site:** welded / bolted / not sure, heavy-duty upgrade, concrete pad.
8. **Review & quote:** summary, dimensioned plan, the "From $X" line, a share link, and the contact form.

The 3D view has undo/redo (also ⌘Z / ⇧⌘Z), Front / Side / Back / Top / 3D views, a **Frame only** view of the red iron, and a 5 ft 11 in figure for scale. Without WebGL the view becomes the plan drawing (doors still drag) and everything still works.

Anything the builder refuses (a door that won't fit, a size past the limit, a lean-to too deep for the eave) says why in an amber message over the 3D view, and the control shakes; screen readers hear the same text.

## Shop rules: sign-off sheet

Every number is a **draft** (`tj-v1-draft`), set from the sales pack and the gallery photos. A control cannot go past these, and when it stops it says why. To change one, edit `src/lib/builder/catalog.ts`; the controls, the 3D model, the plan, the server check and the tests all follow. When Julian and Freddy agree, change `RULESET_VERSION` to `tj-v1` and log it in `Decisions.md`.

| Rule | Draft value | Where it came from | OK / change to |
|---|---|---|---|
| Width | 12–40 ft, 1 ft steps | Sales pack sizes run 20–40 | |
| Length | 12–100 ft, 1 ft steps | 40×100 is the largest sheet size | |
| Eave height | 7–20 ft, 1 ft steps | "Heights above 12 ft +$450/ft", no stated max | |
| Flat roof slope | ½ in per ft, high at the front | Photos; the stated height is at the back (clearance) | |
| Gable pitch | 3:12, not adjustable | Photos | |
| Frame lines | every ≤ 25 ft (20×40 gets a center post, 25×25 does not) | Sales pack | |
| Build order | posts → receivers all the way around → purlins cut to fit and slotted inside the receivers, tops flush | Julian, 2026-10-15 | |
| Receiver on the post | the receiver's bottom flange is notched around the post, so the post runs up inside it and the top flange rests on the post: receiver top flush with the post top (the eave), bolted through the web; corners cut so both receivers sit on the corner post | Julian, 2026-10-15 | |
| Receiver | plain C-channel (no lips), 8 in deep × 2½ in, back flush with the posts' outside, open side in. The 4 in post is wider than the 2½ in flange, so it shows 1½ in past the flange inside | Julian: "7 or 8 in", unconfirmed; flange width and post size guesses | |
| Middle frame line | a double receiver: two back to back, purlins slot in from both bays | Julian, 2026-10-15 | |
| Roof purlin | C with lips, 6 in × 2 in (¾ in lips), open side up the slope; no ridge beam, the top purlin 2 in off the ridge each side | Julian (6 in); photos (no ridge beam); open side a guess | |
| Roof purlin spacing | ≤ 4 ft 6 in, spread evenly (a 26 wide gets 3 per side) | The 26×25 photos, about 4 ft 4 in | |
| Wall purlin | C with lips, 4 in × 2 in, between the posts, open side down; first at 3 ft 6 in, then every 4 ft, the top one kept clear under the receiver; with wainscot the first is at 3 ft for it to fasten to. Enclosed lean-to walls get the same | Julian (4 in, the 3 ft wainscot purlin); spacing a guess | |
| Roll-up jambs | posts each side run up inside the receiver; walk doors and windows stop at a header. An opening within 2 in of the receiver gets no header of its own: the receiver is its header (a 3×3 window on a 7 ft wall comes 2 in into it) | Julian (roll-ups); walk doors, windows and the receiver-as-header unconfirmed | |
| Flat roof framing | level receivers front and back, sloped side receivers, purlins side to side | Draft: the job photos suggest the long way, sloping to one long side — waiting on Julian | |
| Partial wall | top 3 ft closed | Industry standard; Triple J unconfirmed | |
| Wainscot | bottom 3 ft | Common practice | |
| Roll-up sizes | 8×8, 10×10, 12×12, 12×14, 14×14, 16×16 | Handwritten crew sheet + sales pack | |
| Roll-up header room | wall must be ≥ door height + 1 ft where the door sits | Common practice (drum) | |
| Walk door | 36 in × 80 in, needs + 6 in above | Sales pack "36-in walk door" | |
| Window | 3×3, sill at 3 ft 6 in | Sales pack ($350, no size given) | |
| Corner and gap clearance | 1 ft from a corner and between openings | Columns at the corners | |
| Lean-to depth | 6–16 ft | Draft choice; no source gives one | |
| Lean-to height | hangs 1 ft under the main eave, slopes 2:12, keeps ≥ 7 ft at its low edge (the outer posts; 6 ft 4 in under the receiver there). Framed like the main building; steel along the main wall stays outside its sheeting | Photos; whether the 7 ft is measured under the receiver is unconfirmed | |
| Lean-tos per building | 2; back can't combine with left/right | Keeps the corners simple | |
| Doors on a lean-to | not offered | V1 scope | |

## How it fits together

| Piece | File | Notes |
|---|---|---|
| Catalog + draft rules | `src/lib/builder/catalog.ts` | One place for every limit |
| Design schema + presets | `src/lib/builder/design.ts` | Versioned (`v: 1`); zod |
| Rules | `src/lib/builder/rules.ts` | Wall heights, opening fit, dimension floors with reasons, lean-to limits |
| 3D layout (pure) | `src/lib/builder/geometry.ts` | Members, ribbed panel surfaces, openings, slab; unit-tested |
| Price line | `src/lib/builder/price.ts` | Sales-pack anchors only |
| Share links | `src/lib/builder/share.ts` | Design in the URL fragment |
| Words | `src/lib/builder/summary.ts` | Review list, lead message, screen-reader text |
| Page | `src/app/build/page.tsx` | noindex until sign-off |
| UI | `src/components/builder/` | zustand store, 8 panels, plan SVG, quote form |
| 3D | `src/components/builder/scene/` | React Three Fiber, renders on demand, real PBR rib geometry, no textures or model files |
| Leads | `src/app/api/leads/route.ts` | `source: 'builder'` + validated design → `leads.design` (migration 034) |
| HQ | `src/app/hq/leads/[id]/components/BuilderDesignCard.tsx` | Plan, spec rows, "Open in 3D" (new tab) |

**Lead flow.** The form posts name, phone, optional email, ZIP, timeline, best time, military, notes and the design to `POST /api/leads` (hCaptcha and the 5-per-hour limit as usual). The server re-checks the design, fills the build type, size, frame and concrete fields from it, writes a message with the full summary and a link that reopens the design, stores the design in `leads.design`, and sends the usual owner alert. The visitor lands on `/thank-you`, so the Google Ads conversion fires as for any quote.

**Analytics.** `builder_opened`, `builder_preset_selected`, `builder_first_edit`, `builder_section_viewed`, `builder_shared`, `builder_quote_started`, `builder_quote_submitted`, `builder_quote_failed`, `builder_3d_unavailable`, plus the server's `lead_created` with `source: builder`. No names, phones or emails in properties.

**Weight.** The 3D code is about 260 KB gzipped (measured 2026-10-14), loaded only after `/build` itself is up and never precached by the service worker. For comparison, WolfSteel's configurator client is about 4.1 MB before models.

## Going public (after sign-off)

1. Set `RULESET_VERSION = "tj-v1"` with any rule changes; log it.
2. Remove `robots` from `src/app/build/page.tsx`; give it an OG card (`opengraph-image.tsx`) per the OG rule.
3. Add `/build` to the sitemap and to at least two page bodies (internal-linking rule), and to the header CTA area or Services menu if wanted.
4. `npm run build`, start, `node scripts/check-links.mjs --base <url> --strict`.
5. Update `Locked Decisions.md` → Product (3D builder) and log the change.

## Ideas not built (V1 scope)

Vehicle and equipment models for "fit my rig", AR, interior views, editable doors on lean-tos, more than two lean-tos, roof pitch choice, Premium Line colors, a priced breakdown (blocked on the roll-up price conflict), saved designs in HQ that are not tied to a lead.
