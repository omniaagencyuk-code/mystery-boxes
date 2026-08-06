-- Migration: collapse to a single market namespace (remove the UK subdirectory)
--
-- The site no longer uses US/UK URL subdirectories or a market switcher.
-- Availability is now a per-record property surfaced as a filter, so all content
-- lives under one root market ('us' = root). This migration folds every UK
-- record into that single namespace:
--   * unique UK content (e.g. the Mystery Box Shop platform, which is UK-only)
--     is repointed to the root market and preserved. Its UK availability is
--     already captured by availability_scope = 'uk', so it still reads as UK.
--   * a UK row that merely duplicates an existing US row (same operator review,
--     same page/category/post slug, the singleton homepage, per-market menus)
--     is dropped in favour of the US row, which becomes the single version.
--   * newsletter signups and affiliate links lose their UK market scope and
--     become market-agnostic.
-- The 'us-wa' sub-region (only ever a geo-rollup demo) is removed too. The
-- single remaining 'us' market keeps every market_id foreign key valid, so no
-- schema or query changes are needed. Idempotent: once UK is gone it is a no-op.

do $$
declare
  uk uuid;
  us uuid;
begin
  select id into uk from public.markets where code = 'uk';
  select id into us from public.markets where code = 'us';
  if uk is null or us is null then
    return;
  end if;

  -- operator_markets (PK operator_id, market_id)
  delete from public.operator_markets om
   where om.market_id = uk
     and exists (select 1 from public.operator_markets o2
                  where o2.operator_id = om.operator_id and o2.market_id = us);
  update public.operator_markets set market_id = us where market_id = uk;

  -- reviews (unique operator_id, market_id): keep the US review when both exist
  delete from public.reviews r
   where r.market_id = uk
     and exists (select 1 from public.reviews r2
                  where r2.operator_id = r.operator_id and r2.market_id = us);
  update public.reviews set market_id = us where market_id = uk;

  -- categories (partial unique slug, market_id): match by slug
  delete from public.categories c
   where c.market_id = uk
     and exists (select 1 from public.categories c2 where c2.slug = c.slug and c2.market_id = us);
  update public.categories set market_id = us where market_id = uk;

  -- pages (unique market_id, slug)
  delete from public.pages p
   where p.market_id = uk
     and exists (select 1 from public.pages p2 where p2.slug = p.slug and p2.market_id = us);
  update public.pages set market_id = us where market_id = uk;

  -- posts (unique market_id, slug)
  delete from public.posts p
   where p.market_id = uk
     and exists (select 1 from public.posts p2 where p2.slug = p.slug and p2.market_id = us);
  update public.posts set market_id = us where market_id = uk;

  -- menu_items: the US menus are canonical when present, otherwise adopt UK's
  if exists (select 1 from public.menu_items where market_id = us) then
    delete from public.menu_items where market_id = uk;
  else
    update public.menu_items set market_id = us where market_id = uk;
  end if;

  -- homepage (singleton per market + its child rows): US is canonical when present
  if exists (select 1 from public.homepage_settings where market_id = us) then
    delete from public.homepage_settings where market_id = uk;
    delete from public.homepage_sections where market_id = uk;
    delete from public.homepage_trust_indicators where market_id = uk;
    delete from public.homepage_faqs where market_id = uk;
  else
    update public.homepage_settings set market_id = us where market_id = uk;
    update public.homepage_sections set market_id = us where market_id = uk;
    update public.homepage_trust_indicators set market_id = us where market_id = uk;
    update public.homepage_faqs set market_id = us where market_id = uk;
  end if;

  -- Market-agnostic now.
  update public.newsletter_subscribers set market_id = null where market_id = uk;
  update public.affiliate_links set market_id = null where market_id = uk;

  -- Keep a single 'us' root market; remove the UK market and the us-wa sub-region.
  delete from public.markets where code in ('uk', 'us-wa');
end $$;
