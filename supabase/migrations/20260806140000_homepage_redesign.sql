-- ---------------------------------------------------------------------------
-- HOMEPAGE REDESIGN
--
-- Simpler, comparison-focused homepage driven entirely by the shared operator
-- record (the single source of truth). Adds homepage-control fields to
-- operators, creates the category taxonomy used by the comparison tabs, gives a
-- grounded starting category assignment based on each platform's described
-- focus (editors refine in the backend), and extends the homepage body blocks
-- into a richer editor with two platform-card styles. Additive and idempotent.
-- ---------------------------------------------------------------------------

-- 1. Homepage-control fields on the shared operator record.
alter table public.operators
  add column if not exists recommended       boolean not null default false,
  add column if not exists homepage_visible  boolean not null default true,
  add column if not exists homepage_position integer,
  add column if not exists table_label       text;

comment on column public.operators.table_label is 'Short table badge, e.g. Recommended, Popular, New. Free text, hidden when empty.';

-- Backfill: keep current behaviour. Visible when active, ordered by rating.
update public.operators set homepage_visible = active where homepage_visible is null;
with ranked as (
  select id, row_number() over (order by rating desc nulls last, name) * 10 as pos
  from public.operators where active = true
)
update public.operators o set homepage_position = ranked.pos
from ranked where ranked.id = o.id and o.homepage_position is null;

create index if not exists operators_homepage_idx on public.operators (homepage_visible, homepage_position);

-- 2. Category taxonomy for the comparison tabs (root market). CS2/Rust already
--    exist from the skin-case work; add the general-site categories.
insert into public.categories (slug, name, market_id)
select v.slug, v.name, m.id
from public.markets m
join (values
  ('gaming','Gaming'),
  ('sneakers','Sneakers'),
  ('tech','Tech'),
  ('luxury','Luxury'),
  ('pokemon','Pokemon'),
  ('sports-cards','Sports Cards'),
  ('watches','Watches')
) as v(slug, name) on true
where m.code = 'us'
on conflict (slug, market_id) where market_id is not null do nothing;

-- 3. Grounded category assignments from each platform's described focus. Only
--    clear cases; editors add or remove the rest in the backend. Idempotent.
insert into public.operator_categories (operator_id, category_id)
select o.id, c.id
from public.operators o
join (values
  ('hypedrop','gaming'),('hypedrop','tech'),('hypedrop','sneakers'),
  ('cases-gg','gaming'),('cases-gg','tech'),
  ('rillabox','sneakers'),('rillabox','tech'),('rillabox','gaming'),
  ('jemlit','tech'),('jemlit','sneakers'),('jemlit','luxury'),
  ('luxdrop','luxury'),('luxdrop','watches'),
  ('dripdraw','sneakers'),('dripdraw','tech'),
  ('giveaways-com','tech'),('giveaways-com','gaming'),
  ('empiredrop','tech'),('empiredrop','gaming'),
  ('hapabox','tech'),
  ('open-that-pack','pokemon'),
  ('packz','sports-cards'),('packz','pokemon'),
  ('upper-deck-epack','sports-cards')
) as a(op_slug, cat_slug) on a.op_slug = o.slug
join public.categories c on c.slug = a.cat_slug
  and c.market_id = (select id from public.markets where code = 'us')
on conflict (operator_id, category_id) do nothing;

-- 4. Richer homepage body blocks: more block types, two platform-card styles,
--    plus media/link/config fields for images, buttons, tables and boxes.
alter table public.homepage_article_blocks
  add column if not exists card_style text,
  add column if not exists media_url  text,
  add column if not exists href       text,
  add column if not exists config     jsonb not null default '{}'::jsonb;

alter table public.homepage_article_blocks drop constraint if exists homepage_article_blocks_block_type_check;
alter table public.homepage_article_blocks add constraint homepage_article_blocks_block_type_check
  check (block_type in (
    'H2','H3','PARAGRAPH','PLATFORM_CARD','CALLOUT',
    'LIST','IMAGE','TABLE','BUTTON','INTERNAL_LINK','INFO_BOX','WARNING_BOX','PROS_CONS'
  ));

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'homepage_article_blocks_card_style_check') then
    alter table public.homepage_article_blocks add constraint homepage_article_blocks_card_style_check
      check (card_style is null or card_style in ('compact','featured'));
  end if;
end $$;
