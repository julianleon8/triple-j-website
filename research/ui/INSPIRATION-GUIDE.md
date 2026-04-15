# UI Inspiration Guide — Triple J Metal LLC
## What to collect before the frontend build session

Brand context: blue + black, steel/industrial feel, Central Texas local contractor.
Target: homeowners in $500k+ subdivisions + Fort Cavazos military families.
Tone: rugged but clean. Trustworthy. Not cheap-looking. Not corporate either.

---

## WHERE TO LOOK

- **Framer** (framer.com/templates) — best source for pre-coded components
- **Tailwind UI** (tailwindui.com) — production-grade Tailwind sections, copy the HTML
- **Shadcn/ui** (ui.shadcn.com) — component blocks, dark/light, paste-ready
- **Aceternity UI** (ui.aceternity.com) — animated hero sections, scroll effects
- **MagicUI** (magicui.design) — micro-animations, bento grids, modern feel
- **21st.dev** — pre-coded component marketplace, paste-ready
- **Dribbble** — screenshots for visual direction only (not code)
- **Awwwards** — premium reference sites
- **Behance** — branding + visual identity examples

---

## WHAT TO COLLECT

### 1. HERO SECTION
What to look for:
- Full-width hero with a strong H1 and a photo/video background OR a dark overlay on a steel/construction photo
- Dual CTA buttons: primary (Get a Quote) + secondary (Call Now)
- Trust bar underneath: "150+ Projects · 48-Hour Build · Temple, TX"
- Look for: split-screen heroes (text left, photo right), animated text reveals, gradient overlays on dark images

Screenshot or copy the code for any hero that has:
- [ ] Dark/industrial mood
- [ ] Bold headline + subline
- [ ] Two CTAs side by side
- [ ] A badge or trust strip below the headline

---

### 2. NAVIGATION / HEADER
What to look for:
- Sticky navbar that turns solid on scroll (transparent → white/dark)
- Logo left, nav links center or right, phone number + CTA button on far right
- Mobile: hamburger menu that slides in from right

Look for:
- [ ] Sticky transparent-to-solid nav
- [ ] Nav with phone number baked in (not just links)
- [ ] Mobile drawer/hamburger

---

### 3. TRUST SECTION / STATS BAR
What to look for:
- A horizontal strip with 3–5 numbers: "150+ Projects", "48-Hour Build", "20+ Yrs Experience", "Central TX Based"
- Usually sits just below the hero
- Often uses a dark or blue background to break the page

Look for:
- [ ] Animated count-up numbers
- [ ] Horizontal stat strip (dark bg or brand color)
- [ ] Icon + number + label format

---

### 4. SERVICES / WHAT WE BUILD SECTION
What to look for:
- Card grid showing: Carports, Garages, Barns, RV Covers
- Each card: icon or photo, title, short description, link
- Hover effects: lift shadow, border glow, blue accent

Look for:
- [ ] 2×2 or 3-col service cards with hover effect
- [ ] Icon cards (SVG icons for metal/construction)
- [ ] Image cards with text overlay

---

### 5. WHY TRIPLE J / DIFFERENTIATORS SECTION
What to look for:
- A section that compares Triple J vs competitors OR lists key advantages
- Formats: icon list (checkmarks), comparison table (us vs them), or alternating text+image rows
- Content: 48-hr build, turnkey concrete, welded vs bolted, local Temple-based

Look for:
- [ ] "Why us" icon grid (3 or 6 icons + text)
- [ ] Side-by-side comparison table (us vs competitor)
- [ ] Alternating feature rows (text left, image right, then flip)

---

### 6. PHOTO / GALLERY SECTION
What to look for:
- Before/after sliders OR masonry grid of completed jobs
- Lightbox on click
- Real construction/carport photos will replace any placeholder

Look for:
- [ ] Masonry photo grid (Pinterest-style)
- [ ] Before/after slider component
- [ ] Simple image gallery with lightbox

---

### 7. TESTIMONIALS / REVIEWS
What to look for:
- Customer quote cards, star ratings
- Carousel or grid layout
- Photo of customer optional
- Google review badge if available

Look for:
- [ ] Review card with stars + quote + name
- [ ] Review carousel/slider
- [ ] Google reviews embed or widget

---

### 8. LOCATION / SERVICE AREA SECTION
What to look for:
- Map embed OR visual showing coverage area (Temple, Harker Heights, Killeen, Copperas Cove, Belton)
- City link grid that routes to the location pages already built
- Could be as simple as a list of city links with a Texas outline graphic

Look for:
- [ ] City card grid (5 cities with links)
- [ ] Map section with service radius
- [ ] Texas state outline SVG graphic

---

### 9. QUOTE FORM / CTA SECTION
What to look for:
- Full-width CTA strip at bottom of every page: "Get Your Free Quote Today" + form or phone
- Inline quote form: name, phone, city, service type, message — all in one row or a clean card
- This form connects to the existing /api/leads backend already built

Look for:
- [ ] Single-row horizontal form (email-list style but with more fields)
- [ ] Card form with shadow (white card on blue or dark bg)
- [ ] Full-width CTA banner with button + phone number

---

### 10. FOOTER
What to look for:
- 3-col or 4-col footer: logo/about, links, service cities, contact
- Phone number, email, address (3319 Tem-Bel Ln, Temple TX 76502)
- Social links (Facebook, Google)
- "© 2025 Triple J Metal LLC" line

Look for:
- [ ] Dark footer (gray-900 or black)
- [ ] Footer with city links column
- [ ] Footer with phone number + address prominently placed

---

### 11. BUTTONS
What to look for:
- Primary: blue bg, black text, rounded — "Get a Free Quote"
- Secondary: outlined or ghost — "Call Now" or "View Our Work"
- Hover states: slight scale up or glow effect
- Loading states (for the form submit)

Look for:
- [ ] Yellow/amber CTA button (filled, rounded)
- [ ] Ghost/outline button (dark border)
- [ ] Button with arrow icon →
- [ ] Button with phone icon

---

### 12. TYPOGRAPHY
What to look for:
- A strong display font for headlines (heavy, industrial — think bold sans-serif)
- A readable body font
- Good pairings: Inter + anything, Geist (already installed) + a display font

Look for:
- [ ] Google Fonts: Barlow Condensed, Bebas Neue, Oswald, or Black Han Sans (for H1s)
- [ ] Font pairing examples: display font headline + clean body
- [ ] Real examples of construction/contractor sites using heavy headlines

---

### 13. ICONS
What to look for:
- SVG icon sets for: construction, metal, building, tools, Texas
- Lucide icons (already available via shadcn) for UI chrome
- Custom icons for: carport, garage, barn, welding, crane

Look for:
- [ ] Lucide icon set (lucide.dev) — free, consistent
- [ ] Flaticon or Noun Project: search "carport", "metal building", "welder"
- [ ] Heroicons (heroicons.com) — free Tailwind-compatible

---

### 14. PHOTOS / IMAGES
What to look for:
- Real photos of your jobs are best — get 5–10 from your phone if possible
- Stock fallback: search Unsplash or Pexels for "metal carport", "steel building", "Texas construction"
- Hero background: wide landscape shot of a carport or metal building in a Texas setting
- Team photo: even a casual job site photo of Juan and Julian adds massive trust

Look for:
- [ ] 1 hero background photo (wide, 1920px+)
- [ ] 4–6 portfolio/project photos
- [ ] 1 team or job-site photo
- [ ] Texas landscape or rural property photo

---

### 15. COLOR / VIBE REFERENCES
Screenshot any site that has the right energy, even if unrelated to construction:

- Dark industrial: black + blue (like CAT equipment branding, heavy machinery sites)
- Clean contractor: white + navy + blue (like Angi or HomeAdvisor top contractor profiles)
- Premium local service: think HVAC, roofing, or fence company sites that look expensive

Look for:
- [ ] A site that feels "premium local contractor" not "cheap directory listing"
- [ ] A dark-mode or near-dark hero with blue accents
- [ ] A site where you can immediately see the phone number without scrolling

---

## HOW TO BRING IT BACK

When you come back with inspiration, bring:
1. **Screenshots** — paste them directly into chat (Claude can read images)
2. **URLs** — any site you like, I can scrape the design
3. **Code snippets** — if you found a Framer/Shadcn component you want, paste the code
4. **Font names** — just tell me "I want this headline font"
5. **Vibes** — "I want it to look like X but darker" is enough to work from

The more specific you are, the closer the first build will be to what you actually want.
