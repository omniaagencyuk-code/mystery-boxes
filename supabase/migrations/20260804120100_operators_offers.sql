-- Migration: operators, operator_markets (geo/visibility join), offers
-- RLS enabled on every table with explicit public-read policies.

-- ---------------------------------------------------------------------------
-- operators
-- rating and licence fields are nullable on purpose: we never fabricate them,
-- so rows without verified data leave them null rather than inventing values.
-- ---------------------------------------------------------------------------
create table public.operators (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  name                text not null,
  logo_url            text,
  operator_type_id    uuid not null references public.operator_types (id),
  rating              numeric(2,1) check (rating >= 1.0 and rating <= 5.0),
  tracking_url        text,
  licence_authority   text,
  licence_number      text,
  licence_verified_at timestamptz,
  summary             text,
  pros                jsonb not null default '[]'::jsonb,
  cons                jsonb not null default '[]'::jsonb,
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on column public.operators.rating is 'One decimal, 1.0 to 5.0. Null until verified; never fabricated.';
comment on column public.operators.pros is 'jsonb array of short strings';
comment on column public.operators.cons is 'jsonb array of short strings';

create index operators_operator_type_id_idx on public.operators (operator_type_id);

create trigger operators_set_updated_at
  before update on public.operators
  for each row execute function public.set_updated_at();

alter table public.operators enable row level security;

create policy operators_public_read
  on public.operators
  for select
  to anon, authenticated
  using (active = true);

grant select on public.operators to anon, authenticated;
grant all on public.operators to service_role;

-- ---------------------------------------------------------------------------
-- operator_markets
-- Controls where each operator can appear.
--   visible            : whether the operator shows in listings for this market
--   requires_geo_block : when true, requests from this market must not be served
--                        the operator's pages AT ALL (enforced in middleware).
-- These are two distinct behaviours. Rows are public-readable (structural join
-- data) so the server can make both decisions; geo enforcement is a serving
-- concern handled in middleware, not a row-security concern.
-- ---------------------------------------------------------------------------
create table public.operator_markets (
  operator_id        uuid not null references public.operators (id) on delete cascade,
  market_id          uuid not null references public.markets (id) on delete cascade,
  requires_geo_block boolean not null default false,
  visible            boolean not null default true,
  primary key (operator_id, market_id)
);

create index operator_markets_market_id_idx on public.operator_markets (market_id);

alter table public.operator_markets enable row level security;

create policy operator_markets_public_read
  on public.operator_markets
  for select
  to anon, authenticated
  using (true);

grant select on public.operator_markets to anon, authenticated;
grant all on public.operator_markets to service_role;

-- ---------------------------------------------------------------------------
-- offers
-- ---------------------------------------------------------------------------
create table public.offers (
  id          uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.operators (id) on delete cascade,
  title       text not null,
  code        text,
  description text,
  terms       text,
  starts_at   timestamptz,
  expires_at  timestamptz,
  active      boolean not null default true
);

create index offers_operator_id_idx on public.offers (operator_id);

alter table public.offers enable row level security;

-- Public read of active offers only. The app can further filter on the
-- starts_at / expires_at window at query time.
create policy offers_public_read
  on public.offers
  for select
  to anon, authenticated
  using (active = true);

grant select on public.offers to anon, authenticated;
grant all on public.offers to service_role;
