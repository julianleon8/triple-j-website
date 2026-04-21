-- Triple J Metal LLC — Gallery v2 cleanup
-- Drop the legacy gallery_items.image_url column.
--
-- After 008_gallery_v2.sql introduced gallery_photos (per-photo rows with
-- is_cover / sort_order), gallery_items.image_url became a redundant
-- back-compat field. Every read path now resolves the cover photo through
-- gallery_photos; the column is dead weight.
--
-- Idempotent: the "if exists" guard means this can be re-applied safely.

alter table public.gallery_items drop column if exists image_url;
