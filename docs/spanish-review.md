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
