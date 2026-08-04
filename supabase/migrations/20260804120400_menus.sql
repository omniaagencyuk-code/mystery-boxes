-- Migration: customisable navigation menu.
--
-- menu_items are per market and per location (header or footer). A one-level
-- hierarchy supports dropdowns: a top-level item (parent_id null) can have child
-- items. Ordering within a set of siblings is controlled by position.

create table public.menu_items (
  id          uuid primary key default gen_random_uuid(),
  market_id   uuid not null references public.markets (id) on delete cascade,
  location    text not null default 'header' check (location in ('header', 'footer')),
  parent_id   uuid references public.menu_items (id) on delete cascade,
  label       text not null,
  url         text,
  position    integer not null default 0,
  open_in_new boolean not null default false,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index menu_items_lookup_idx
  on public.menu_items (market_id, location, parent_id, position);

create trigger menu_items_set_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

alter table public.menu_items enable row level security;

create policy menu_items_public_read
  on public.menu_items
  for select
  to anon, authenticated
  using (active = true);

grant select on public.menu_items to anon, authenticated;
grant all on public.menu_items to service_role;
