# Lead Sources Research — Central Texas Municipal OSINT (2026-04-20)

Research source: NotebookLM / Gemini Deep Research, run by Julian on his Mac.
Purpose: identify public, non-login-gated data vectors for upstream commercial construction signals (warehouse, pole barn, PEMB, slab) 30–90 days before final building permits.

## TL;DR

- **MGOconnect.org and EnerGov CSS portals = dead ends** (login-gated, CAPTCHA-protected, ToS prohibits scraping). Used by all 7 jurisdictions for live permits.
- **Upstream pivot** legally mandated by Texas Open Meetings Act (TOMA) + Texas Local Government Code Ch. 212/232: P&Z agendas, Commissioners' Court agendas, and voluntary weekly/monthly transparency reports are public PDFs.
- **High-value targets:** Temple Weekly Permit Reports, Killeen Monthly Permit Reports, Copperas Cove Weekly Reports, McLennan County + Bell County Commissioners' Court agendas, Waco Plan Commission packets.
- **Dead ends in our target list:** Belton's monthly permit report (aggregate $$ only, no project detail — pivot to P&Z packets instead). Waco has no static permit roll — pivot to Plan Commission only.

## Jurisdiction Matrix

| Jurisdiction | Best URL | Format | Cadence | Scraping Difficulty | Notes |
|---|---|---|---|---|---|
| **Bell County** | https://www.bellcountytx.com/county_government/commissioners_court/index.php | PDF (Revize CMS) | Weekly/Bi-weekly | Easy (static HTML, requests + BeautifulSoup) | Commissioners' Court plat approvals — large-acreage subdivision = upstream warehouse signals. Sample: "110.32 acre, 130 lots subdivision". No CAPTCHAs. |
| **City of Temple** | https://www.templetx.gov/departments/city_departments/building_permits___inspections/permitreports.php | PDF (Revize CMS) | Weekly | Easy | **GOLDMINE.** Reports explicitly say "PEMB" and "pre-engineered metal building". Sample: "1-Story PEMB, 10,560 sqft, 1006 S 30TH STREET". |
| **City of Belton** | https://www.beltontexas.gov/departments/planning_department/document_center.php | PDF packets (Revize CMS) | Monthly (3rd Tues) | Medium (large packets, OCR for embedded plats) | P&Z Commission agendas only — Belton's monthly permit report is aggregated $$, useless. P&Z packets have full plats + civil narratives. |
| **City of Killeen** | Permits: https://www.killeentexas.gov/207/Permit-Applications-Forms-Reports-Refund<br>P&Z: https://www.killeentexas.gov/AgendaCenter | PDF (CivicPlus Document Center) | Monthly (permits), bi-weekly (P&Z) | Medium (CivicPlus uses JS rendering — needs Playwright/Puppeteer) | Excellent data. Sample: "10' x 10' storage building, concrete slab, brick walls, 7703 SILICON DR, $9,500". |
| **City of Waco / McLennan County** | Waco P&Z: https://www.waco-texas.com/Departments/Development-Services/Planning-Services/Plan-Commission<br>McLennan: https://www.mclennan.gov/agendacenter | PDF packets (Granicus / CivicPlus) | Bi-weekly | Medium-Hard (CivicPlus + huge packets, OCR for civil scans) | NO static permit roll for Waco — only P&Z + Commissioners' Court. Sample: "53.45-acre PUD rezoning for mixed-use commercial". 3–6 month lead time. |
| **City of Harker Heights** | EDR: https://harkerheights.gov/index.php/building-permits-and-forms<br>P&Z: https://harkerheights.gov/index.php/boards-and-commissions/planning-and-zoning/p-z-agenda-and-minutes | PDF (Joomla CMS) | Monthly | Easy (Joomla + open /images/PDF/ directory) | Detailed Economic Development Reports with project name + address + valuation. Sample: "Mayo Autoworks 3, 901 Mountain Lion Circle, $1,600,000". |
| **City of Copperas Cove** | https://www.copperascovetx.gov/217/Permit-Reports | PDF (CivicPlus Document Center) | Weekly (Fri–Thu) | Medium (CivicPlus JS tabs — needs headless browser) | Reliable, deep archive. Native text PDFs, no OCR needed. |

## Technical Notes

**CMS architectures = modular scraper opportunity:**
- **Revize CMS** (Temple, Belton, Bell County, Harker Heights via Joomla): static HTML, `requests` + `BeautifulSoup` works. Match `\.pdf$` in href attributes; date strings in filenames are inconsistent.
- **CivicPlus / Granicus** (Killeen, Waco, McLennan, Copperas Cove): JS-rendered DOM. **Headless browser required** (Playwright recommended). Wait for `div.agenda-list` or `#DocumentCenterList` then extract hrefs.

**PDF parsing:**
- Permit reports (Temple, Killeen, Copperas Cove) → digitally generated text, use `pdfplumber` → DataFrame → regex filter on description column: `(?i)(PEMB|metal\s*building|pole\s*barn|slab|warehouse|industrial|storage)`
- P&Z packets (Belton, Waco, Bell County) → mixed text + scanned civil plans, OCR (Tesseract or AWS Textract) for "Notes" / "Legend" sections of plats.

## Strategic Caveat (Julian's flag, 2026-04-20)

The keyword targets — PEMB, pole barn, slab, warehouse — overlap incompletely with Triple J's residential welded-red-iron core. Most permit text describes pre-engineered metal buildings (Mueller-style kits) installed by larger commercial contractors, not custom welded carports.

**Strategic implication:** Lead Engine V1 surfaces commercial leads that need a *different sales pitch* than the residential carport flow. Triple J's plays on these leads:
- **Slab + erection subcontracting** for developers who already bought the PEMB kit
- **Small commercial turnkey** (auto shops, storage, ag buildings <$500K) where Triple J's full-service edge wins
- Skip large industrial/warehouse unless explicitly scaling that direction

Filter strategy decision PENDING — see `Decisions.md` 2026-04-20.