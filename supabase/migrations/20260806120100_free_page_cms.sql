-- ---------------------------------------------------------------------------
-- FREE PAGE CMS
--
-- Makes /free a fully editor-managed page, mirroring the homepage CMS pattern:
-- a singleton settings row (hero, CTAs, newsletter, table config, SEO, publish
-- state), an ordered/visible list of sections, and child tables for stats,
-- featured offers, category cards, structured SEO body blocks, FAQs and trust
-- items. Dynamic content (platforms, offers, categories, counts) is pulled live
-- from existing records, never duplicated here. Additive and idempotent.
--
-- The site now serves a single namespace (no US/UK subdirectories), so these
-- tables are NOT keyed by market. Availability is a per-record property
-- (see the availability_model migration) surfaced as a filter on this page.
-- ---------------------------------------------------------------------------

-- Singleton settings (one row, page_key = 'free').
create table if not exists public.free_page_settings (
  page_key             text primary key default 'free',
  h1                   text,
  hero_intro           text,
  hero_image_url       text,
  hero_image_mobile_url text,
  cta_primary_label    text,
  cta_primary_href     text,
  cta_secondary_label  text,
  cta_secondary_href   text,
  newsletter_heading   text,
  newsletter_body      text,
  newsletter_placeholder text,
  newsletter_button    text,
  newsletter_privacy   text,
  table_default_sort   text not null default 'rating',
  table_page_size      integer not null default 10,
  table_cta_fallback   text not null default 'visit_site',
  table_empty_state    text,
  seo_title            text,
  meta_description     text,
  canonical_url        text,
  og_image_url         text,
  index_status         text not null default 'index',
  published            boolean not null default false,
  author               text,
  reviewer             text,
  updated_at           timestamptz not null default now(),
  constraint free_page_settings_singleton check (page_key = 'free'),
  constraint free_page_settings_index_status_check check (index_status in ('index','noindex')),
  constraint free_page_settings_cta_fallback_check check (table_cta_fallback in ('visit_site','read_review','hide','view_alternatives')),
  constraint free_page_settings_sort_check check (table_default_sort in ('rating','last_verified','category','offer_type','platform'))
);

drop trigger if exists free_page_settings_set_updated_at on public.free_page_settings;
create trigger free_page_settings_set_updated_at
  before update on public.free_page_settings
  for each row execute function public.set_updated_at();

-- Ordered, toggleable sections.
create table if not exists public.free_page_sections (
  id           uuid primary key default gen_random_uuid(),
  section_type text not null check (section_type in (
    'HERO','FILTERS','FEATURED_OFFERS','OFFER_TABLE','CATEGORY_CARDS',
    'BODY_CONTENT','FAQ','NEWSLETTER','TRUST_STRIP'
  )),
  position     integer not null default 0,
  visible      boolean not null default true
);

-- Hero trust statistics. value_key computes from the DB when set; else static_value.
create table if not exists public.free_page_stats (
  id           uuid primary key default gen_random_uuid(),
  label        text not null,
  value_key    text,
  static_value text,
  position     integer not null default 0,
  constraint free_page_stats_value_key_check check (
    value_key is null or value_key in ('free_offers','platforms','updated','availability')
  )
);

-- Curated featured offers (Editor's Picks). Resolves the platform's live
-- headline offer at render time; the badge is editorially controlled.
create table if not exists public.free_featured_offers (
  id          uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.operators (id) on delete cascade,
  badge       text,
  position    integer not null default 0
);
create index if not exists free_featured_offers_operator_idx on public.free_featured_offers (operator_id);

-- Curated category cards. Count is computed live from the category's offers.
create table if not exists public.free_category_cards (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references public.categories (id) on delete cascade,
  label        text,
  href         text,
  image_url    text,
  position     integer not null default 0
);
create index if not exists free_category_cards_category_idx on public.free_category_cards (category_id);

-- Structured SEO body blocks (mirrors review_blocks).
create table if not exists public.free_body_blocks (
  id         uuid primary key default gen_random_uuid(),
  block_type text not null check (block_type in (
    'H2','H3','PARAGRAPH','LIST','IMAGE','CALLOUT','DATA_TABLE',
    'INTERNAL_LINK','CTA','RELATED_GUIDE','RELATED_REVIEW'
  )),
  position   integer not null default 0,
  heading    text,
  body       text,
  media_url  text,
  href       text,
  config     jsonb not null default '{}'::jsonb,
  visible    boolean not null default true
);

create table if not exists public.free_page_faqs (
  id        uuid primary key default gen_random_uuid(),
  question  text not null,
  answer    text not null,
  position  integer not null default 0
);

create table if not exists public.free_trust_items (
  id       uuid primary key default gen_random_uuid(),
  label    text not null,
  detail   text,
  icon     text,
  position integer not null default 0
);

-- ---------------------------------------------------------------------------
-- RLS: all free-page content is public-readable; writes are service_role only.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'free_page_settings','free_page_sections','free_page_stats','free_featured_offers',
    'free_category_cards','free_body_blocks','free_page_faqs','free_trust_items'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_public_read on public.%I', t, t);
    execute format('create policy %I_public_read on public.%I for select to anon, authenticated using (true)', t, t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Default content seed (editable starting point; generic copy, no fabricated
-- platform data). Only seeds when the settings row does not yet exist.
-- ---------------------------------------------------------------------------
insert into public.free_page_settings (
  page_key, h1, hero_intro,
  cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href,
  newsletter_heading, newsletter_body, newsletter_placeholder, newsletter_button, newsletter_privacy,
  table_empty_state, seo_title, meta_description, index_status, published
) values (
  'free',
  'Free Mystery Boxes',
  'Find verified free mystery boxes, welcome bonuses, daily rewards and no-deposit offers from leading mystery box websites. Filter by category, offer type and availability to find the right free offer.',
  'Browse Free Offers', '#offers', 'How It Works', '#how-it-works',
  'Never Miss a Free Box',
  'Get the latest free mystery box offers, exclusive promo codes and new platform reviews delivered to your inbox.',
  'Enter your email address', 'Subscribe Free', 'No spam. Unsubscribe anytime.',
  'No free offers match these filters right now. Try clearing a filter to see more.',
  'Free Mystery Boxes 2026 | Verified No-Deposit Offers and Bonuses',
  'Compare verified free mystery boxes, welcome bonuses and no-deposit offers from leading platforms. Filter by category, offer type and availability.',
  'index', true
) on conflict (page_key) do nothing;

insert into public.free_page_sections (section_type, position, visible)
select v.section_type, v.position, true
from (values
  ('HERO',0),('FILTERS',1),('FEATURED_OFFERS',2),('OFFER_TABLE',3),
  ('CATEGORY_CARDS',4),('BODY_CONTENT',5),('FAQ',6),('NEWSLETTER',7),('TRUST_STRIP',8)
) as v(section_type, position)
where not exists (select 1 from public.free_page_sections);

insert into public.free_page_stats (label, value_key, static_value, position)
select v.label, v.value_key, v.static_value, v.position
from (values
  ('Free Offers','free_offers',null,0),
  ('Platforms','platforms',null,1),
  ('Updated','updated','Daily',2),
  ('Availability','availability','US, UK or Both',3)
) as v(label, value_key, static_value, position)
where not exists (select 1 from public.free_page_stats);

insert into public.free_trust_items (label, detail, icon, position)
select v.label, v.detail, v.icon, v.position
from (values
  ('Daily Verified Offers','We test and verify offers so you only see working free boxes','check',0),
  ('Independent Reviews','Honest, unbiased platform reviews','shield',1),
  ('Secure and Responsible','Your safety and responsible play come first','lock',2),
  ('US, UK and Global','Find offers available in your country','globe',3)
) as v(label, detail, icon, position)
where not exists (select 1 from public.free_trust_items);

insert into public.free_page_faqs (question, answer, position)
select v.question, v.answer, v.position
from (values
  ('Are free mystery boxes really free?','Some are genuinely free, such as no-deposit welcome boxes and daily rewards, while others are free to open only after you sign up or verify an account. Each offer on this page states what is required, and we only mark an offer verified when we have confirmed it works.',0),
  ('Do I need to deposit money?','Not for no-deposit offers. Some welcome boxes and bonuses do require a first deposit to unlock, which we note in the offer details. Use the No Deposit filter to see only offers that need no payment.',1),
  ('How often are offers updated?','We re-check offers regularly and stamp each one with its last verified date. Offers we have not been able to re-confirm within the review window are marked stale rather than shown as verified.',2),
  ('Can I win real prizes from free boxes?','Yes, free boxes can contain real items, though average prize values are lower than paid boxes. Treat them as a low-cost way to try a platform rather than a way to make money.',3),
  ('Which free mystery boxes are available in the US?','Use the availability filter and choose US to see only offers available to US users. Each row also shows its availability in plain text.',4),
  ('Do I need a promo code?','Some offers need a promo code and some do not. Where a code is required we show it with the offer. Where none is needed the offer says so.',5)
) as v(question, answer, position)
where not exists (select 1 from public.free_page_faqs);
