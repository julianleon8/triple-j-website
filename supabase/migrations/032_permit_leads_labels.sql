-- 032_permit_leads_labels.sql
--
-- Every permit gets a structure category, a set of labels and a normalised
-- builder key, so the free intelligence in the City's report can be sliced:
-- "carports issued this month", "everything with a slab and no contractor",
-- "which builders pull the most new-home permits".
--
-- The vocabulary (categories, tags) is owned by src/lib/jobs/scrape-permits.ts
-- -- PERMIT_CATEGORIES / CLAUDE_TAGS / STATUS_TAGS -- and deliberately not by
-- a CHECK constraint here, so a new value is one code change, not a migration.
--
-- labeled_at is how the scraper finds rows that predate this migration (or a
-- future vocabulary change, if it is nulled): it relabels up to 45 per run
-- from the stored raw_source_text, no PDF refetch needed.

alter table public.permit_leads
  add column if not exists category           text,
  add column if not exists tags               text[] not null default '{}',
  add column if not exists contractor_company text,
  add column if not exists contractor_key     text,
  add column if not exists sqft               integer,
  add column if not exists dimensions         text,
  add column if not exists height_ft          numeric(5,1),
  add column if not exists material           text,
  add column if not exists applied_at         date,
  add column if not exists labeled_at         timestamptz;

comment on column public.permit_leads.sqft is
  'Total square footage when the row states one ("1854 SQ FT", "18,000 SF"). NULL otherwise.';
comment on column public.permit_leads.dimensions is
  'Footprint as WxL in feet when stated, normalised to e.g. "30x40". NULL otherwise.';
comment on column public.permit_leads.height_ft is
  'Stated height in feet, decimal ("9''2''''" -> 9.2). NULL otherwise.';
comment on column public.permit_leads.material is
  'metal | wood | concrete | masonry | mixed, when the row says. Vocabulary: MATERIALS in src/lib/jobs/scrape-permits.ts.';
comment on column public.permit_leads.applied_at is
  'The date stamp the City prints at the end of the row -- when the record was entered.';

comment on column public.permit_leads.category is
  'Structure category within the lead_class, e.g. carport, storage_shed, self_storage. Vocabulary: PERMIT_CATEGORIES in src/lib/jobs/scrape-permits.ts.';
comment on column public.permit_leads.tags is
  'Labels. Claude-read from the row (metal, slab, prefab_kit, no_contractor, engineer_applicant, large, cover, enclosed) plus one status tag (applied, in_review, issued, closed). Vocabulary: CLAUDE_TAGS / STATUS_TAGS.';
comment on column public.permit_leads.contractor_company is
  'General contractor as a company name only -- Claude strips the person the City sometimes appends ("Flintrock Builders Aaron Yates").';
comment on column public.permit_leads.contractor_key is
  'contractorKey(contractor_company): lower-case, no punctuation, no LLC/LTD/INC. The grouping key for the builder list.';
comment on column public.permit_leads.labeled_at is
  'When category/tags were last assigned. NULL means the row predates the vocabulary and the next scrape run relabels it.';

create index if not exists permit_leads_category_idx       on public.permit_leads (category);
create index if not exists permit_leads_tags_idx           on public.permit_leads using gin (tags);
create index if not exists permit_leads_contractor_key_idx on public.permit_leads (contractor_key);
create index if not exists permit_leads_unlabeled_idx      on public.permit_leads (jurisdiction, created_at) where labeled_at is null;
