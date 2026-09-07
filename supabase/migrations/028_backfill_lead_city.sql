-- 028_backfill_lead_city.sql
--
-- One-time repair of leads.city rows that hold a ZIP instead of a city name.
--
-- CAUSE
-- /api/leads resolved city with `ZIP_CITIES[zip] ?? zip` — an unrecognised ZIP
-- was written into the city column verbatim. The map was hand-maintained in two
-- places and derived from neither LOCATIONS nor site.ts, so it was missing ZIPs
-- for cities we publish landing pages for (78664 — Round Rock). Four of the six
-- real leads in the table are affected; each of those rows also renders as
-- "76577 · 76577" in the HQ list and reached the owner alert subject as a bare
-- number.
--
-- The code fix (src/lib/locations.ts — ZIP_TO_CITY / cityFromZip) makes the
-- lookup single-source and returns NULL instead of echoing the ZIP back, so no
-- new rows can land in this state.
--
-- This migration is a one-time snapshot, deliberately NOT a SQL copy of the ZIP
-- map — duplicating that map is the bug being fixed. It re-resolves only the
-- ZIPs actually present in affected rows today, then clears the rest.

-- Round Rock has its own location page; 78664 was simply missing from the map.
update public.leads
   set city = 'Round Rock'
 where city = zip
   and zip = '78664';

-- Everything still holding its own ZIP (76566 Purmela, 76577 Thorndale,
-- 76877 Richland Springs — all outside the mapped service area) becomes NULL.
-- The ZIP itself is untouched in leads.zip, and the UI now renders "ZIP 76577".
update public.leads
   set city = null
 where city = zip;

-- Invariant this restores: leads.city is a city name or NULL, never a ZIP.
