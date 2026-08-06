-- Migration: structured availability model on operators and offers
--
-- The site is moving away from US/UK URL subdirectories towards a single
-- namespace where availability is a property of each platform / offer and is
-- surfaced as a filter. This migration adds that structured availability plus
-- the filterable offer attributes the /free page needs. It is purely additive
-- (every column has a default) and backfills from the existing
-- operator_markets mapping, so no existing data is lost and current behaviour
-- is preserved: an operator keeps showing to exactly the audience it does now.
--
-- Availability scope values:
--   us       served to the US only
--   uk       served to the UK only
--   both     served to both US and UK
--   global   served everywhere (default)
--   selected available_countries lists the specific markets
-- excluded_states carries US state codes an operator/offer cannot serve.

-- ---------------------------------------------------------------------------
-- operators: availability + feature tags
-- ---------------------------------------------------------------------------
alter table public.operators
  add column if not exists availability_scope  text not null default 'global',
  add column if not exists available_countries text[] not null default '{}'::text[],
  add column if not exists excluded_states     text[] not null default '{}'::text[],
  add column if not exists features            text[] not null default '{}'::text[];

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'operators_availability_scope_check') then
    alter table public.operators
      add constraint operators_availability_scope_check
      check (availability_scope in ('us','uk','both','global','selected'));
  end if;
end $$;

comment on column public.operators.availability_scope is 'us | uk | both | global | selected. Where the platform is available.';
comment on column public.operators.available_countries is 'ISO country codes when scope = selected (or to refine global).';
comment on column public.operators.excluded_states is 'US state codes the platform cannot serve.';
comment on column public.operators.features is 'Structured feature tags: marketplace, box_battles, buyback, physical_shipping, crypto. Drives feature filters.';

create index if not exists operators_availability_scope_idx on public.operators (availability_scope);

-- ---------------------------------------------------------------------------
-- offers: availability + filterable attributes + explicit lifecycle status
-- (freshness stays computed from the live window + last_verified_at; status is
-- the editorially controlled lifecycle the CMS sets, spec-defined values.)
-- ---------------------------------------------------------------------------
alter table public.offers
  add column if not exists offer_type          text,
  add column if not exists prize_value_band    text,
  add column if not exists availability_scope  text not null default 'global',
  add column if not exists available_countries text[] not null default '{}'::text[],
  add column if not exists excluded_states     text[] not null default '{}'::text[],
  add column if not exists source_url          text,
  add column if not exists standard_url        text,
  add column if not exists next_review_at      timestamptz,
  add column if not exists status              text not null default 'draft';

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'offers_offer_type_check') then
    alter table public.offers add constraint offers_offer_type_check
      check (offer_type is null or offer_type in
        ('welcome_box','daily_box','promo_code','no_deposit','referral','daily_reward','free_pack'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'offers_prize_value_band_check') then
    alter table public.offers add constraint offers_prize_value_band_check
      check (prize_value_band is null or prize_value_band in
        ('under_20','20_plus','50_plus','100_plus','premium'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'offers_availability_scope_check') then
    alter table public.offers add constraint offers_availability_scope_check
      check (availability_scope in ('us','uk','both','global','selected'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'offers_status_check') then
    alter table public.offers add constraint offers_status_check
      check (status in ('draft','needs_verification','verified','stale','expired','paused','no_current_offer'));
  end if;
end $$;

comment on column public.offers.offer_type is 'welcome_box | daily_box | promo_code | no_deposit | referral | daily_reward | free_pack. Drives the offer-type filter.';
comment on column public.offers.prize_value_band is 'under_20 | 20_plus | 50_plus | 100_plus | premium. Drives the prize-value filter.';
comment on column public.offers.status is 'Editorial lifecycle. Expired/stale/paused/no_current_offer never render as verified.';

create index if not exists offers_offer_type_idx on public.offers (offer_type);
create index if not exists offers_status_idx on public.offers (status);

-- ---------------------------------------------------------------------------
-- Backfill availability from the existing operator_markets mapping.
-- Preserves current reach: both markets -> both, uk only -> uk, us only -> us,
-- unmapped -> global (the default).
-- ---------------------------------------------------------------------------
with mk as (
  select om.operator_id,
         bool_or(m.code = 'us') as in_us,
         bool_or(m.code = 'uk') as in_uk
  from public.operator_markets om
  join public.markets m on m.id = om.market_id
  where om.visible = true
  group by om.operator_id
)
update public.operators o
set availability_scope = case
    when mk.in_us and mk.in_uk then 'both'
    when mk.in_uk then 'uk'
    when mk.in_us then 'us'
    else o.availability_scope
  end
from mk
where mk.operator_id = o.id;

-- Best-effort feature tags from existing descriptive columns (no fabrication:
-- only tag a feature when the platform already records data for it).
update public.operators
set features = (
  select array(select distinct f from unnest(
    features
    || case when coalesce(buyback, '') <> '' then array['buyback'] else '{}'::text[] end
    || case when coalesce(shipping_info, '') <> '' then array['physical_shipping'] else '{}'::text[] end
  ) as f where f is not null and f <> '')
);

-- Offers inherit their platform's availability scope as a starting point.
update public.offers off
set availability_scope = o.availability_scope,
    available_countries = o.available_countries,
    excluded_states = o.excluded_states
from public.operators o
where o.id = off.operator_id
  and off.availability_scope = 'global';

-- Seed offer lifecycle status from the current active flag + live window +
-- verification date, matching how freshness already renders today.
update public.offers
set status = case
    when active = false then 'paused'
    when expires_at is not null and expires_at < now() then 'expired'
    when last_verified_at is not null then 'verified'
    else 'needs_verification'
  end
where status = 'draft';
