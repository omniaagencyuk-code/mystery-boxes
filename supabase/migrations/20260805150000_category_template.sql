-- ---------------------------------------------------------------------------
-- CATEGORY TEMPLATE
--
-- Turns each category record into a full landing page: adds editorial and SEO
-- fields plus structured child tables for shortcut chips, popular brands and
-- FAQs. Additive and idempotent (safe to re-run).
-- ---------------------------------------------------------------------------

alter table public.categories
  add column if not exists h1               text,
  add column if not exists intro            text,
  add column if not exists hero_image_url   text,
  add column if not exists accent_color     text,
  add column if not exists seo_title        text,
  add column if not exists meta_description  text;

-- Shortcut chips under the hero (label + a link target: a path or an anchor).
create table if not exists public.category_shortcuts (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  label       text not null,
  target      text,
  position    integer not null default 0
);
create index if not exists category_shortcuts_category_id_idx on public.category_shortcuts (category_id);

-- Popular brands list shown in the sidebar.
create table if not exists public.category_brands (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  name        text not null,
  position    integer not null default 0
);
create index if not exists category_brands_category_id_idx on public.category_brands (category_id);

-- Category FAQs.
create table if not exists public.category_faqs (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  question    text not null,
  answer      text not null,
  position    integer not null default 0
);
create index if not exists category_faqs_category_id_idx on public.category_faqs (category_id);

-- RLS: categories are public, so their child rows are publicly readable when the
-- parent category exists. Writes go through the service role (bypasses RLS).
alter table public.category_shortcuts enable row level security;
drop policy if exists category_shortcuts_public_read on public.category_shortcuts;
create policy category_shortcuts_public_read on public.category_shortcuts
  for select to anon, authenticated
  using (exists (select 1 from public.categories c where c.id = category_shortcuts.category_id));
grant select on public.category_shortcuts to anon, authenticated;
grant all on public.category_shortcuts to service_role;

alter table public.category_brands enable row level security;
drop policy if exists category_brands_public_read on public.category_brands;
create policy category_brands_public_read on public.category_brands
  for select to anon, authenticated
  using (exists (select 1 from public.categories c where c.id = category_brands.category_id));
grant select on public.category_brands to anon, authenticated;
grant all on public.category_brands to service_role;

alter table public.category_faqs enable row level security;
drop policy if exists category_faqs_public_read on public.category_faqs;
create policy category_faqs_public_read on public.category_faqs
  for select to anon, authenticated
  using (exists (select 1 from public.categories c where c.id = category_faqs.category_id));
grant select on public.category_faqs to anon, authenticated;
grant all on public.category_faqs to service_role;
