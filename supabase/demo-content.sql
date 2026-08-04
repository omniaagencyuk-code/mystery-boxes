-- ---------------------------------------------------------------------------
-- DEMO CONTENT (safe to delete)
--
-- Run this once in the Supabase SQL Editor to populate the site with sample
-- content, the way a fresh WordPress install ships with a sample post. Every
-- row is clearly marked "Demo" and every slug starts with "demo-", so you can
-- find and delete them in the admin dashboard, or remove them all at once with
-- supabase/demo-content-cleanup.sql.
--
-- This is placeholder content. Operator names, ratings, licence numbers and
-- offer terms are invented stand-ins. Replace or delete before you rely on the
-- site. Re-running this file is safe (it will not create duplicates).
-- ---------------------------------------------------------------------------

-- Operators -----------------------------------------------------------------

insert into public.operators
  (slug, name, operator_type_id, rating, tracking_url, licence_authority, licence_number, summary, pros, cons, active)
select 'demo-unbox-arena', 'Demo Unbox Arena', ot.id, 4.6,
  'https://example.com/visit/demo-unbox-arena', 'Demo Licensing Authority', 'DEMO-1001',
  'A demo digital unboxing operator used to show how these cards look. Replace me.',
  '["Fast demo payouts", "Clear demo odds display", "Good demo support"]'::jsonb,
  '["Demo fees on withdrawals", "Limited demo box range"]'::jsonb,
  true
from public.operator_types ot where ot.slug = 'digital_unboxing'
on conflict (slug) do nothing;

insert into public.operators
  (slug, name, operator_type_id, rating, tracking_url, licence_authority, licence_number, summary, pros, cons, active)
select 'demo-crate-kings', 'Demo Crate Kings', ot.id, 4.3,
  'https://example.com/visit/demo-crate-kings', 'Demo Licensing Authority', 'DEMO-1002',
  'A second demo digital operator. This one is geo-blocked in the US to show that feature.',
  '["Big demo welcome offer", "Nice demo interface"]'::jsonb,
  '["Demo verification is slow"]'::jsonb,
  true
from public.operator_types ot where ot.slug = 'digital_unboxing'
on conflict (slug) do nothing;

insert into public.operators
  (slug, name, operator_type_id, rating, tracking_url, summary, pros, cons, active)
select 'demo-boxling', 'Demo Boxling', ot.id, 4.1,
  'https://example.com/visit/demo-boxling',
  'A demo physical retail operator. Notice it shows no gambling compliance furniture, only the ad label.',
  '["Real demo goods posted out", "Free demo returns"]'::jsonb,
  '["Demo shipping can be slow"]'::jsonb,
  true
from public.operator_types ot where ot.slug = 'physical_retail'
on conflict (slug) do nothing;

insert into public.operators
  (slug, name, operator_type_id, rating, tracking_url, summary, pros, cons, active)
select 'demo-surprise-parcel', 'Demo Surprise Parcel', ot.id, 3.8,
  'https://example.com/visit/demo-surprise-parcel',
  'Another demo physical retail operator so the comparison table has a few rows.',
  '["Cheap demo entry price", "Themed demo boxes"]'::jsonb,
  '["Mixed demo item quality"]'::jsonb,
  true
from public.operator_types ot where ot.slug = 'physical_retail'
on conflict (slug) do nothing;

-- Market mapping ------------------------------------------------------------
-- Most operators are visible in both markets.
insert into public.operator_markets (operator_id, market_id, requires_geo_block, visible)
select o.id, m.id, false, true
from public.operators o
cross join public.markets m
where o.slug in ('demo-unbox-arena', 'demo-boxling', 'demo-surprise-parcel')
  and m.code in ('uk', 'us')
on conflict (operator_id, market_id) do nothing;

-- Demo Crate Kings: visible in the UK, hard geo-blocked in the US.
insert into public.operator_markets (operator_id, market_id, requires_geo_block, visible)
select o.id, m.id, false, true
from public.operators o cross join public.markets m
where o.slug = 'demo-crate-kings' and m.code = 'uk'
on conflict (operator_id, market_id) do nothing;

insert into public.operator_markets (operator_id, market_id, requires_geo_block, visible)
select o.id, m.id, true, false
from public.operators o cross join public.markets m
where o.slug = 'demo-crate-kings' and m.code = 'us'
on conflict (operator_id, market_id) do nothing;

-- Categories ----------------------------------------------------------------
insert into public.categories (slug, name, description, market_id) values
  ('demo-best-mystery-boxes', 'Best mystery boxes', 'A demo category that lists our top rated operators.', null),
  ('demo-sneaker-boxes', 'Sneaker boxes', 'A demo category for sneaker themed boxes.', null)
on conflict do nothing;

insert into public.categories (slug, name, description, market_id)
select 'demo-uk-picks', 'Top UK picks', 'A demo UK only category.', m.id
from public.markets m where m.code = 'uk'
on conflict do nothing;

-- Put every operator in the "best" category.
insert into public.operator_categories (operator_id, category_id)
select o.id, c.id
from public.operators o
cross join public.categories c
where o.slug like 'demo-%' and c.slug = 'demo-best-mystery-boxes' and c.market_id is null
on conflict do nothing;

-- Put the physical operators in the sneaker category.
insert into public.operator_categories (operator_id, category_id)
select o.id, c.id
from public.operators o
cross join public.categories c
where o.slug in ('demo-boxling', 'demo-surprise-parcel')
  and c.slug = 'demo-sneaker-boxes' and c.market_id is null
on conflict do nothing;

-- Offers (promo codes) ------------------------------------------------------
insert into public.offers (operator_id, title, code, description, terms, active)
select o.id, 'Demo welcome offer', 'DEMOWELCOME',
  'A demo welcome offer so the promo codes page has something to show.',
  'Demo terms apply. This is sample content.', true
from public.operators o
where o.slug = 'demo-unbox-arena'
  and not exists (select 1 from public.offers x where x.operator_id = o.id and x.title = 'Demo welcome offer');

insert into public.offers (operator_id, title, code, description, terms, active)
select o.id, 'Demo first box deal', 'DEMOBOX',
  'A second demo offer. Codes are shown exactly as entered here.',
  'Demo terms apply. This is sample content.', true
from public.operators o
where o.slug = 'demo-crate-kings'
  and not exists (select 1 from public.offers x where x.operator_id = o.id and x.title = 'Demo first box deal');

insert into public.offers (operator_id, title, code, description, terms, active)
select o.id, 'Demo free shipping', 'DEMOSHIP',
  'A demo offer for a physical operator.',
  'Demo terms apply. This is sample content.', true
from public.operators o
where o.slug = 'demo-boxling'
  and not exists (select 1 from public.offers x where x.operator_id = o.id and x.title = 'Demo free shipping');

-- Reviews (published) -------------------------------------------------------
-- A UK review for every demo operator.
insert into public.reviews (operator_id, market_id, body, verdict, author, published_at, status)
select o.id, m.id,
  E'This is a demo review body. I write in the first person so you can see the editorial voice.\n\nSwap this text for a real review, or delete the operator to remove it. The rating, pros and cons above all come from the operator record.',
  'A solid demo pick', 'Demo Team', now(), 'published'
from public.operators o
cross join public.markets m
where o.slug like 'demo-%' and m.code = 'uk'
on conflict (operator_id, market_id) do nothing;

-- A couple of US reviews too.
insert into public.reviews (operator_id, market_id, body, verdict, author, published_at, status)
select o.id, m.id,
  E'This is a demo US review. UK and US reviews of the same operator can differ, which is why they are stored separately.\n\nReplace or delete this sample content.',
  'Worth a look in the US', 'Demo Team', now(), 'published'
from public.operators o
cross join public.markets m
where o.slug in ('demo-unbox-arena', 'demo-boxling') and m.code = 'us'
on conflict (operator_id, market_id) do nothing;

-- News posts (published) ----------------------------------------------------
insert into public.posts (slug, market_id, title, excerpt, body, author, status, published_at)
select 'demo-welcome', m.id, 'Welcome to the demo site',
  'A sample news post so the news section is not empty.',
  E'This is a demo news post. It behaves just like a real one.\n\nYou can edit it, unpublish it, or delete it from the Posts section of the admin.',
  'Demo Team', 'published', now()
from public.markets m where m.code in ('uk', 'us')
on conflict (market_id, slug) do nothing;

insert into public.posts (slug, market_id, title, excerpt, body, author, status, published_at)
select 'demo-how-we-test', m.id, 'How we test operators',
  'A second sample post that reads like a short guide.',
  E'This is a demo post about how we test operators. Keep the structure and rewrite the words, or delete it.\n\nShort paragraphs work well here.',
  'Demo Team', 'published', now()
from public.markets m where m.code in ('uk', 'us')
on conflict (market_id, slug) do nothing;

-- A demo guide page ---------------------------------------------------------
insert into public.pages (slug, market_id, title, meta_description, body, status, published_at)
select 'demo-how-mystery-boxes-work', m.id, 'How mystery boxes work',
  'A demo guide page.',
  E'This is a demo guide page. Guide and money pages live at /market/slug and are edited in the Pages section.\n\nDelete this sample when you add your own.',
  'published', now()
from public.markets m where m.code in ('uk', 'us')
on conflict (market_id, slug) do nothing;
