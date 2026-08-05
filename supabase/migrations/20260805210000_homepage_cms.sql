-- ---------------------------------------------------------------------------
-- HOMEPAGE CMS
--
-- Makes the homepage fully editor-managed: per-market settings (hero, CTAs,
-- SEO, editorial panels, newsletter, final CTA), an ordered/visible list of
-- modular sections, trust indicators, FAQs, an operator "featured" flag, and a
-- newsletter subscriber capture. Additive and idempotent.
--
-- The dynamic content of sections (top-rated platforms, offers, reviews,
-- guides, categories) is still pulled live from the existing records, never
-- duplicated here. This only stores the homepage's own copy and its layout.
-- ---------------------------------------------------------------------------

-- Featured flag for the "Featured brands" homepage section.
alter table public.operators
  add column if not exists featured boolean not null default false;

-- Per-market homepage settings (a singleton per market).
create table if not exists public.homepage_settings (
  market_id uuid primary key references public.markets (id) on delete cascade,
  hero_title           text,
  hero_intro           text,
  hero_image_url       text,
  cta_primary_label    text,
  cta_primary_href     text,
  cta_secondary_label  text,
  cta_secondary_href   text,
  how_we_rate          text,
  trust_content        text,
  newsletter_heading   text,
  newsletter_body      text,
  final_cta_heading    text,
  final_cta_body       text,
  final_cta_label      text,
  final_cta_href       text,
  seo_title            text,
  meta_description     text,
  canonical_url        text,
  og_image_url         text,
  updated_at           timestamptz not null default now()
);

drop trigger if exists homepage_settings_set_updated_at on public.homepage_settings;
create trigger homepage_settings_set_updated_at
  before update on public.homepage_settings
  for each row execute function public.set_updated_at();

-- Ordered, toggleable homepage sections.
create table if not exists public.homepage_sections (
  id           uuid primary key default gen_random_uuid(),
  market_id    uuid not null references public.markets (id) on delete cascade,
  section_type text not null check (section_type in (
    'top_rated','comparison','category_cards','featured_brands','verified_offers',
    'latest_reviews','latest_guides','how_we_rate','trust','faq','newsletter','final_cta'
  )),
  position     integer not null default 0,
  visible      boolean not null default true
);
create index if not exists homepage_sections_market_id_idx on public.homepage_sections (market_id);

create table if not exists public.homepage_trust_indicators (
  id        uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets (id) on delete cascade,
  label     text not null,
  position  integer not null default 0
);
create index if not exists homepage_trust_indicators_market_id_idx on public.homepage_trust_indicators (market_id);

create table if not exists public.homepage_faqs (
  id        uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets (id) on delete cascade,
  question  text not null,
  answer    text not null,
  position  integer not null default 0
);
create index if not exists homepage_faqs_market_id_idx on public.homepage_faqs (market_id);

-- Newsletter capture. Inserted through a SECURITY DEFINER function so visitors
-- can subscribe without table grants; never publicly readable.
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  market_id  uuid references public.markets (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (email)
);

-- ---------------------------------------------------------------------------
-- RLS: homepage content is public; newsletter table is not.
-- ---------------------------------------------------------------------------
alter table public.homepage_settings enable row level security;
drop policy if exists homepage_settings_public_read on public.homepage_settings;
create policy homepage_settings_public_read on public.homepage_settings
  for select to anon, authenticated using (true);
grant select on public.homepage_settings to anon, authenticated;
grant all on public.homepage_settings to service_role;

alter table public.homepage_sections enable row level security;
drop policy if exists homepage_sections_public_read on public.homepage_sections;
create policy homepage_sections_public_read on public.homepage_sections
  for select to anon, authenticated using (true);
grant select on public.homepage_sections to anon, authenticated;
grant all on public.homepage_sections to service_role;

alter table public.homepage_trust_indicators enable row level security;
drop policy if exists homepage_trust_indicators_public_read on public.homepage_trust_indicators;
create policy homepage_trust_indicators_public_read on public.homepage_trust_indicators
  for select to anon, authenticated using (true);
grant select on public.homepage_trust_indicators to anon, authenticated;
grant all on public.homepage_trust_indicators to service_role;

alter table public.homepage_faqs enable row level security;
drop policy if exists homepage_faqs_public_read on public.homepage_faqs;
create policy homepage_faqs_public_read on public.homepage_faqs
  for select to anon, authenticated using (true);
grant select on public.homepage_faqs to anon, authenticated;
grant all on public.homepage_faqs to service_role;

alter table public.newsletter_subscribers enable row level security;
grant all on public.newsletter_subscribers to service_role;

-- subscribe_newsletter: idempotent email capture for anonymous visitors.
create or replace function public.subscribe_newsletter(subscriber_email text, market text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m_id uuid;
begin
  if subscriber_email is null or position('@' in subscriber_email) = 0 then
    raise exception 'invalid email';
  end if;
  if market is not null then
    select id into m_id from public.markets where code = market;
  end if;
  insert into public.newsletter_subscribers (email, market_id)
  values (lower(trim(subscriber_email)), m_id)
  on conflict (email) do nothing;
end;
$$;

grant execute on function public.subscribe_newsletter(text, text) to anon, authenticated;
