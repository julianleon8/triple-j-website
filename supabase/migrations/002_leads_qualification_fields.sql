-- Triple J Metal LLC — Lead Qualification Fields
-- Adds structured pre-qualification data captured by the new multi-step QuoteForm.
-- Run this in the Supabase SQL editor after 001_initial_schema.sql.

alter table public.leads
  add column if not exists zip              text,
  add column if not exists needs_concrete   text,   -- 'yes' | 'already_have' | 'unsure'
  add column if not exists current_surface  text,   -- 'dirt' | 'gravel' | 'asphalt' | 'concrete'
  add column if not exists timeline         text,   -- 'asap' | 'this_week' | 'this_month' | 'planning'
  add column if not exists is_military      boolean default false;

-- Update the city field from zip when city is missing
-- (optional helper — city is still populated by the API from a zip lookup)
comment on column public.leads.zip             is 'Installation ZIP code — used to verify service area';
comment on column public.leads.needs_concrete  is 'Whether customer needs a concrete pad poured';
comment on column public.leads.current_surface is 'Current ground surface at installation site';
comment on column public.leads.timeline        is 'Customer desired build timeline';
comment on column public.leads.is_military     is 'Military or first responder — eligible for discount';
