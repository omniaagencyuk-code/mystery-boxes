-- ---------------------------------------------------------------------------
-- GUIDE FIELDS
--
-- Guides are stored as pages with a `guides/` slug prefix. These optional fields
-- power the guides hub cards and the richer article header. Additive and
-- idempotent; money pages simply leave them null.
-- ---------------------------------------------------------------------------

alter table public.pages
  add column if not exists guide_category text,
  add column if not exists author         text,
  add column if not exists hero_image_url text,
  add column if not exists summary        text;
