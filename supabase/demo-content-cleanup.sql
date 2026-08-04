-- ---------------------------------------------------------------------------
-- REMOVE ALL DEMO CONTENT
--
-- Run this in the Supabase SQL Editor to delete everything added by
-- supabase/demo-content.sql. It only touches rows whose slug starts with
-- "demo-", so your real content is left alone.
--
-- Deleting a demo operator cascades to its market mapping, category links,
-- offers and reviews automatically.
-- ---------------------------------------------------------------------------

delete from public.operators where slug like 'demo-%';
delete from public.categories where slug like 'demo-%';
delete from public.posts where slug like 'demo-%';
delete from public.pages where slug like 'demo-%';
