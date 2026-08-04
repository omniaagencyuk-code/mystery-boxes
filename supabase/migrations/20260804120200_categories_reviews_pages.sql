-- Migration: categories, operator_categories, reviews, pages
-- RLS enabled on every table with explicit public-read policies.

-- ---------------------------------------------------------------------------
-- categories
-- market_id null means the category applies to all markets.
-- ---------------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null,
  name        text not null,
  description text,
  market_id   uuid references public.markets (id) on delete cascade
);

-- Slug must be unique within a market. Two separate unique indexes handle the
-- nullable market_id (Postgres treats NULLs as distinct, so a partial index
-- pins the "all markets" case).
create unique index categories_slug_market_idx
  on public.categories (slug, market_id)
  where market_id is not null;

create unique index categories_slug_global_idx
  on public.categories (slug)
  where market_id is null;

alter table public.categories enable row level security;

create policy categories_public_read
  on public.categories
  for select
  to anon, authenticated
  using (true);

grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;

-- ---------------------------------------------------------------------------
-- operator_categories (simple join)
-- ---------------------------------------------------------------------------
create table public.operator_categories (
  operator_id uuid not null references public.operators (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (operator_id, category_id)
);

create index operator_categories_category_id_idx on public.operator_categories (category_id);

alter table public.operator_categories enable row level security;

create policy operator_categories_public_read
  on public.operator_categories
  for select
  to anon, authenticated
  using (true);

grant select on public.operator_categories to anon, authenticated;
grant all on public.operator_categories to service_role;

-- ---------------------------------------------------------------------------
-- reviews
-- Long form editorial per operator per market, so UK and US reviews of the same
-- operator can differ. Only published reviews are public-readable.
-- ---------------------------------------------------------------------------
create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null references public.operators (id) on delete cascade,
  market_id    uuid not null references public.markets (id) on delete cascade,
  body         text,
  verdict      text,
  author       text,
  published_at timestamptz,
  updated_at   timestamptz not null default now(),
  status       text not null default 'draft' check (status in ('draft', 'published')),
  unique (operator_id, market_id)
);

create index reviews_operator_id_idx on public.reviews (operator_id);
create index reviews_market_id_idx on public.reviews (market_id);

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

create policy reviews_public_read
  on public.reviews
  for select
  to anon, authenticated
  using (status = 'published');

grant select on public.reviews to anon, authenticated;
grant all on public.reviews to service_role;

-- ---------------------------------------------------------------------------
-- pages
-- Money pages and guides, per market. Only published pages are public-readable.
-- ---------------------------------------------------------------------------
create table public.pages (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null,
  market_id        uuid not null references public.markets (id) on delete cascade,
  title            text not null,
  meta_description text,
  body             text,
  status           text not null default 'draft' check (status in ('draft', 'published')),
  published_at     timestamptz,
  updated_at       timestamptz not null default now(),
  unique (market_id, slug)
);

create index pages_market_id_idx on public.pages (market_id);

create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

alter table public.pages enable row level security;

create policy pages_public_read
  on public.pages
  for select
  to anon, authenticated
  using (status = 'published');

grant select on public.pages to anon, authenticated;
grant all on public.pages to service_role;
