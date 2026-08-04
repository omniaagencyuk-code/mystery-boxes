-- Migration: core reference tables (markets, operator_types) + shared helpers
-- Row Level Security is enabled on every table in this file, with explicit
-- public-read policies. Writes are not granted to anon/authenticated, so they
-- fall through to the service_role, which bypasses RLS.

-- gen_random_uuid() lives in pgcrypto on older Postgres; safe to ensure it.
create extension if not exists pgcrypto;

-- Shared trigger to keep updated_at columns current.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- markets
-- Regional targeting. Self-referencing parent_id lets sub-regions (e.g. us-wa)
-- roll up to a parent (us) so US states can be excluded later without a schema
-- change.
-- ---------------------------------------------------------------------------
create table public.markets (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  parent_id   uuid references public.markets (id) on delete set null,
  name        text not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on column public.markets.code is 'Stable market code, e.g. uk, us, us-wa';
comment on column public.markets.parent_id is 'Self FK: us-wa rolls up to us';

alter table public.markets enable row level security;

-- Public can read active markets only.
create policy markets_public_read
  on public.markets
  for select
  to anon, authenticated
  using (active = true);

grant select on public.markets to anon, authenticated;
grant all on public.markets to service_role;

-- ---------------------------------------------------------------------------
-- operator_types
-- Controls which compliance treatment an operator receives.
--   physical_retail  = real goods posted to the customer
--   digital_unboxing = pay to open on screen with a randomised result
-- Reference data (small, non-sensitive), so it is fully public-readable.
-- ---------------------------------------------------------------------------
create table public.operator_types (
  id    uuid primary key default gen_random_uuid(),
  slug  text not null unique,
  name  text not null
);

alter table public.operator_types enable row level security;

create policy operator_types_public_read
  on public.operator_types
  for select
  to anon, authenticated
  using (true);

grant select on public.operator_types to anon, authenticated;
grant all on public.operator_types to service_role;

-- ---------------------------------------------------------------------------
-- Structural seed data (required in every environment, including production)
-- ---------------------------------------------------------------------------

-- Markets: uk and us as roots, plus one example sub-region (us-wa) to prove the
-- parent rollup works. These are real structural codes, not fabricated content.
insert into public.markets (code, parent_id, name, active) values
  ('uk', null, 'United Kingdom', true),
  ('us', null, 'United States', true)
on conflict (code) do nothing;

insert into public.markets (code, parent_id, name, active)
select 'us-wa', m.id, 'United States - Washington', true
from public.markets m
where m.code = 'us'
on conflict (code) do nothing;

-- Operator types: the two compliance treatments defined by the spec.
insert into public.operator_types (slug, name) values
  ('physical_retail', 'Physical retail'),
  ('digital_unboxing', 'Digital unboxing')
on conflict (slug) do nothing;
