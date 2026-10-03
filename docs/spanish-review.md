# Spanish site — read-through for a native speaker

The whole public site now has a Spanish version under `/es`. It was translated by Claude, in **tú**,
using the glossary in `Website Copy & Messaging.md` → "Spanish site". Before it goes live, someone who
speaks Spanish at home should read it the way a customer would. About 30–45 minutes.

**Where:** the Vercel preview of branch `claude/nifty-cray-dhkhyu` (not the live site). Every page has
an "English / Español" switch in the header and footer.

**What to look for:**
- Anything that sounds translated rather than said. How would you say it to a neighbor on a jobsite?
- Trade words: does *cochera*, *granero*, *losa*, *viga roja*, *calibre*, *lean-to*, *llave en mano*
  sound right to customers around Temple and Killeen? Would *carport* or *galera* be more natural?
- Any number, price or promise that reads differently from the English page (there should be none).

Mark changes straight on this file or text them; each one is a one-line fix.

## Pages to read (in this order)

| Page | Spanish URL | Minutes |
|---|---|---|
| Home | `/es` | 3 |
| Quote form (fill it in, don't send) | `/es/cotizacion` | 4 |
| Services overview | `/es/servicios` | 3 |
| Carports | `/es/servicios/cocheras` | 4 |
| Garages | `/es/servicios/garajes-metalicos` | 2 |
| Fencing | `/es/servicios/cercas-metalicas` | 2 |
| Temple | `/es/ciudades/temple` | 4 |
| Killeen | `/es/ciudades/killeen` | 3 |
| About | `/es/nosotros` | 2 |
| Contact | `/es/contacto` | 1 |
| Military | `/es/militares` | 3 |
| One blog post | `/es/blog/guia-de-permisos-edificios-metalicos-condado-de-bell` | 5 |

Also worth one look: the confirmation email a Spanish lead receives (send one test lead from
`/es/cotizacion` with your own email once the database migration is applied).

## Lines flagged for a native speaker's call

Filled in as the pages are built; each row is a judgment call, not a known error.

| File | English | Spanish | Question |
|---|---|---|---|
| `src/i18n/pages/home.ts` | "A better boundary." | "Un mejor lindero." | Is *lindero* how customers say property line, or *límite* / *cerca*? |
| `src/i18n/copy/quote-form.ts` | "Phone — we text first" | "Teléfono — primero te mandamos mensaje" | Natural? |
| `src/lib/site.ts` | "Built right, built fast, built by Triple J." | "Hecho bien, hecho rápido, hecho por Triple J." | The tagline. Keep it, or say it differently? |
| `src/components/seo/OrganizationJsonLd.tsx` | "…with turnkey concrete…" | "…con concreto llave en mano…" | Search-engine text only. The English itself leans on "turnkey" as a blanket label (2026-09-28 lock) — worth fixing in both. |
| `src/i18n/pages/about.ts` | "concealed-fastener standing-seam systems for HOA-grade builds" | "sistemas standing-seam (junta alzada) con sujetadores ocultos…" | Do customers say *standing-seam* in English, or *junta alzada*? |
| `src/i18n/pages/partners.ts` | "named in-house crew" | "equipo propio que da la cara" | "Named" no longer fits (no names on the site). Does this read right? |
| `src/i18n/pages/partners.ts` | "No subcontractor roulette." | "Sin ruleta de subcontratistas." | A pun. Keep, or say it plainly? |
| `src/i18n/pages/quote.ts` | "trade discounts" | "descuentos para… gremios" | Does *gremios* read as tradespeople in Texas Spanish? |
| `src/i18n/pages/thank-you.ts` | "Got it. / We'll be in touch." | "Recibido. / Estaremos en contacto." | Natural, or too formal? |
| `src/lib/gallery-filters.ts` | "Patios & porches", "Custom builds" | "Patios y porches", "Obras a la medida" | Natural? |
| `src/i18n/pages/photo-lightbox.ts` | "Cover" (cover-photo badge) | "Portada" | Right word? |
| Gallery project pages | Panel and trim color names ("Charcoal Gray") | left in English | They are the manufacturer's catalog names customers order by. Keep English? |
| `src/lib/locations.es.ts` (Temple) | "Temple's a railroad town — we weld like one" | "Temple es un pueblo de ferrocarril, y nosotros soldamos como tal" | A pun. Keep, or say it plainly? |
| `src/lib/locations.es.ts` (Killeen) | "We speak the language: BAH, VA loans…" | "Conocemos el vocabulario: BAH, préstamos VA…" | Natural? |
| `src/lib/locations.es.ts` (Waco, Georgetown) | "run-in sheds" | "cobertizos de refugio para animales" | What do ranchers here call these? |
| `src/lib/locations.es.ts` (Nolanville) | "property survey" | "plano de la propiedad (survey)" | Natural? |
| `src/lib/locations.es.ts` (Lampasas) | "spring-fed pool" | "alberca alimentada por un manantial" | Natural? |
| `src/lib/locations.es.ts` (9 small towns) | — | One shared Spanish template | The nine smaller towns' intros read alike in Spanish. Fine, or vary them? |
| `src/lib/services.es.ts` (HOA) | "Concrete & Site Prep Included" | "Concreto y preparación del terreno en el mismo contrato" | Written to the concrete lock (never "incluido"). OK? |
| `src/lib/services.es.ts` | "skid-steer" | "minicargadora (skid-steer)" | Do people here say *skid steer* or *bobcat*? |
| `src/lib/services.es.ts` (RV covers) | "Texas hail season doesn't send a calendar invite" | "La temporada de granizo en Texas no manda invitación" | A pun. Keep? |
| `src/lib/services.es.ts` (garages) | "isn't a shed from a big-box store" | "no es un cobertizo de tienda de cadena" | Natural? |
| `src/lib/services.es.ts` (HOA) | "Wealthy buyers don't want to manage two contractors" | "Los compradores adinerados no quieren manejar a dos contratistas" | Reads blunt in Spanish. Soften? |
| `src/lib/services.es.ts` | "Dutch doors" | "puertas Dutch (de dos hojas)" | Natural? |
| `src/i18n/pages/hybrid-projects.ts` | "body shop", "loft", "tack rooms", "run-in shelters" | "taller de hojalatería y pintura", "tapanco", "cuarto para monturas", "refugios abiertos" | Natural for ranch customers here? |
| `src/i18n/pages/colors.ts` | "Best Value" | "Mejor precio" | OK? |

## English found while translating (owner, not the reviewer)

Unrendered legacy fields in `src/lib/locations.ts` still break locks in English. Nothing on the live
site shows them today (newer fields take precedence), but they should be cleaned so nothing can
surface them again. The Spanish versions follow the locks.

- `belton.callouts[0]`: "Bell County permits handled. Included in your contract … we file the paperwork." — permits are advisory only (2026-09-07).
- `belton.heroCopy`, `belton.whyLocal`, `waco.whyLocal`: name national competitors as having "no local crew", "we know everyone in the permit office", "include concrete" — competitor claims were removed 2026-09-26; concrete is "available".
- `src/lib/services.ts:346` (turnkey FAQ): "can help coordinate permit pulls where required." — borderline on the advisory-only permit lock (2026-09-07); "pulls" implies we pull them. The Spanish says "podemos ayudar a coordinar los permisos". Suggest "can walk you through the permit steps" in both.
