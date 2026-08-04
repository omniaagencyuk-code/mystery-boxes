-- ---------------------------------------------------------------------------
-- LOCAL DEVELOPMENT SEED ONLY
--
-- This file is applied by `supabase db reset` for local development. It is NOT
-- part of the migration history and is NOT pushed to a remote/production
-- database by `supabase db push`.
--
-- Every operator, offer, review and page below is PLACEHOLDER content. Names,
-- ratings, licence authorities, licence numbers and offer terms are fabricated
-- stand-ins so the UI has something to render during the build. Ratings are
-- left null (we never invent a rating). Replace everything marked PLACEHOLDER
-- with verified data before launch.
-- ---------------------------------------------------------------------------

-- Placeholder operators -----------------------------------------------------

-- Physical retail placeholder: real goods posted to the customer.
-- No gambling compliance furniture should render for this type.
insert into public.operators
  (slug, name, logo_url, operator_type_id, rating, tracking_url, summary, pros, cons, active)
select
  'placeholder-physical-operator',
  'PLACEHOLDER Physical Operator',
  null,
  ot.id,
  null, -- rating left null on purpose, never fabricated
  'https://example.com/track/placeholder-physical', -- PLACEHOLDER tracking link
  'PLACEHOLDER summary for a physical retail mystery box. Replace before launch.',
  '["PLACEHOLDER pro one", "PLACEHOLDER pro two"]'::jsonb,
  '["PLACEHOLDER con one"]'::jsonb,
  true
from public.operator_types ot
where ot.slug = 'physical_retail'
on conflict (slug) do nothing;

-- Digital unboxing placeholder: pay to open on screen with a randomised result.
-- Gambling compliance furniture SHOULD render for this type. Licence fields use
-- clearly-marked placeholders so the licence rendering path can be exercised.
insert into public.operators
  (slug, name, logo_url, operator_type_id, rating, tracking_url,
   licence_authority, licence_number, licence_verified_at, summary, pros, cons, active)
select
  'placeholder-digital-operator',
  'PLACEHOLDER Digital Operator',
  null,
  ot.id,
  null, -- rating left null on purpose, never fabricated
  'https://example.com/track/placeholder-digital', -- PLACEHOLDER tracking link
  'PLACEHOLDER Authority',       -- PLACEHOLDER licence authority, not a real body
  'PLACEHOLDER-LICENCE-0000',    -- PLACEHOLDER licence number, not a real licence
  null,                          -- licence_verified_at null until actually verified
  'PLACEHOLDER summary for a digital unboxing operator. Replace before launch.',
  '["PLACEHOLDER pro one", "PLACEHOLDER pro two"]'::jsonb,
  '["PLACEHOLDER con one", "PLACEHOLDER con two"]'::jsonb,
  true
from public.operator_types ot
where ot.slug = 'digital_unboxing'
on conflict (slug) do nothing;

-- Operator to market mapping -------------------------------------------------
-- Physical operator: visible in both UK and US, no geo block.
insert into public.operator_markets (operator_id, market_id, requires_geo_block, visible)
select o.id, m.id, false, true
from public.operators o
cross join public.markets m
where o.slug = 'placeholder-physical-operator'
  and m.code in ('uk', 'us')
on conflict (operator_id, market_id) do nothing;

-- Digital operator: visible in UK, but hard geo-blocked in US to demonstrate the
-- middleware 404 behaviour. It is still mapped to US so the block flag is found.
insert into public.operator_markets (operator_id, market_id, requires_geo_block, visible)
select o.id, m.id,
       case when m.code = 'us' then true else false end,   -- geo block in US
       case when m.code = 'us' then false else true end     -- hidden from US listings too
from public.operators o
cross join public.markets m
where o.slug = 'placeholder-digital-operator'
  and m.code in ('uk', 'us')
on conflict (operator_id, market_id) do nothing;

-- Placeholder offers ---------------------------------------------------------
insert into public.offers (operator_id, title, code, description, terms, active)
select o.id,
       'PLACEHOLDER welcome offer',
       'PLACEHOLDER',
       'PLACEHOLDER offer description. Replace before launch.',
       'PLACEHOLDER terms and conditions. Replace before launch.',
       true
from public.operators o
where o.slug in ('placeholder-physical-operator', 'placeholder-digital-operator')
on conflict do nothing;

-- Placeholder categories -----------------------------------------------------
-- One global category (all markets) and one UK-specific category.
insert into public.categories (slug, name, description, market_id)
values ('best-mystery-boxes', 'Best mystery boxes', 'PLACEHOLDER category description.', null)
on conflict do nothing;

insert into public.categories (slug, name, description, market_id)
select 'uk-picks', 'UK picks', 'PLACEHOLDER UK-only category description.', m.id
from public.markets m
where m.code = 'uk'
on conflict do nothing;

-- Map both placeholder operators into the global category.
insert into public.operator_categories (operator_id, category_id)
select o.id, c.id
from public.operators o
cross join public.categories c
where o.slug in ('placeholder-physical-operator', 'placeholder-digital-operator')
  and c.slug = 'best-mystery-boxes'
  and c.market_id is null
on conflict do nothing;

-- Placeholder reviews (published) --------------------------------------------
-- UK review for the physical operator.
insert into public.reviews (operator_id, market_id, body, verdict, author, published_at, status)
select o.id, m.id,
       'PLACEHOLDER review body written in a first person editorial voice. Replace before launch.',
       'PLACEHOLDER verdict',
       'PLACEHOLDER Author',
       now(),
       'published'
from public.operators o
cross join public.markets m
where o.slug = 'placeholder-physical-operator' and m.code = 'uk'
on conflict (operator_id, market_id) do nothing;

-- UK review for the digital operator.
insert into public.reviews (operator_id, market_id, body, verdict, author, published_at, status)
select o.id, m.id,
       'PLACEHOLDER review body for a digital unboxing operator. Replace before launch.',
       'PLACEHOLDER verdict',
       'PLACEHOLDER Author',
       now(),
       'published'
from public.operators o
cross join public.markets m
where o.slug = 'placeholder-digital-operator' and m.code = 'uk'
on conflict (operator_id, market_id) do nothing;

-- Placeholder pages (published) ----------------------------------------------
insert into public.pages (slug, market_id, title, meta_description, body, status, published_at)
select 'how-mystery-boxes-work', m.id,
       'How mystery boxes work',
       'PLACEHOLDER meta description for a UK guide page.',
       'PLACEHOLDER guide body written in a first person editorial voice. Replace before launch.',
       'published',
       now()
from public.markets m
where m.code = 'uk'
on conflict (market_id, slug) do nothing;

insert into public.pages (slug, market_id, title, meta_description, body, status, published_at)
select 'how-mystery-boxes-work', m.id,
       'How mystery boxes work',
       'PLACEHOLDER meta description for a US guide page.',
       'PLACEHOLDER guide body written in a first person editorial voice. Replace before launch.',
       'published',
       now()
from public.markets m
where m.code = 'us'
on conflict (market_id, slug) do nothing;
