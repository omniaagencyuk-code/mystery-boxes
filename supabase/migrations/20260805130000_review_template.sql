-- ---------------------------------------------------------------------------
-- REVIEW TEMPLATE
--
-- Extends operators and reviews and adds the structured child tables that power
-- the dynamic platform review page: rating breakdown, quick facts, payment
-- methods, modular content blocks, FAQs, related platforms, plus an affiliate
-- click-event log so CTAs can record placement and label.
--
-- Additive only. No existing data is changed. Every new column is nullable or
-- defaulted so current operators and reviews keep working untouched.
-- ---------------------------------------------------------------------------

-- 1. Operator (platform) fields ----------------------------------------------
alter table public.operators
  add column if not exists website_url    text,
  add column if not exists logo_light_url text,
  add column if not exists logo_dark_url  text,
  add column if not exists hero_image_url text,
  add column if not exists founded_year   integer,
  add column if not exists owner          text,
  add column if not exists min_age        text,
  add column if not exists availability   text,
  add column if not exists kyc_required   text,
  add column if not exists buyback        text,
  add column if not exists mobile_app     text,
  add column if not exists shipping_info  text,
  add column if not exists support_info   text;

-- 1b. Offer fields for the welcome-offer bar ---------------------------------
alter table public.offers
  add column if not exists cta_label       text,
  add column if not exists exclusive       boolean not null default false,
  add column if not exists eligibility     text,
  add column if not exists terms_url       text,
  add column if not exists last_verified_at timestamptz;

-- 2. Review fields ------------------------------------------------------------
alter table public.reviews
  add column if not exists seo_title             text,
  add column if not exists meta_description      text,
  add column if not exists canonical_url         text,
  add column if not exists og_image_url          text,
  add column if not exists best_for_title        text,
  add column if not exists best_for_description  text,
  add column if not exists overall_score         numeric(2,1)
                             check (overall_score is null or (overall_score >= 0 and overall_score <= 5)),
  add column if not exists score_descriptor      text,
  add column if not exists reviewer              text,
  add column if not exists last_checked_at       timestamptz,
  add column if not exists next_review_at        timestamptz;

-- 3. Rating breakdown ---------------------------------------------------------
create table if not exists public.review_ratings (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references public.reviews (id) on delete cascade,
  label      text not null,
  score      numeric(2,1) not null check (score >= 0 and score <= 5),
  position   integer not null default 0
);
create index if not exists review_ratings_review_id_idx on public.review_ratings (review_id);

-- 4. FAQs ---------------------------------------------------------------------
create table if not exists public.review_faqs (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references public.reviews (id) on delete cascade,
  question   text not null,
  answer     text not null,
  position   integer not null default 0
);
create index if not exists review_faqs_review_id_idx on public.review_faqs (review_id);

-- 5. Modular content blocks ---------------------------------------------------
create table if not exists public.review_blocks (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references public.reviews (id) on delete cascade,
  block_type text not null check (block_type in (
    'RICH_TEXT','IMAGE_LEFT','IMAGE_RIGHT','FULL_WIDTH_IMAGE','SCREENSHOT_GALLERY',
    'FEATURE_GRID','OFFER_CALLOUT','PAYMENT_PANEL','SHIPPING_PANEL','SAFETY_PANEL',
    'DATA_TABLE','QUOTE','RELATED_GUIDES','COMPARISON','CTA'
  )),
  position   integer not null default 0,
  heading    text,
  body       text,
  media_id   uuid references public.media (id) on delete set null,
  media_url  text,
  alt        text,
  caption    text,
  cta_label  text,
  cta_url    text,
  config     jsonb not null default '{}'::jsonb,
  visible    boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists review_blocks_review_id_idx on public.review_blocks (review_id);

create trigger review_blocks_set_updated_at
  before update on public.review_blocks
  for each row execute function public.set_updated_at();

-- 6. Payment methods per operator --------------------------------------------
create table if not exists public.operator_payment_methods (
  id          uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.operators (id) on delete cascade,
  slug        text,
  name        text not null,
  kind        text not null default 'both' check (kind in ('deposit','withdrawal','both')),
  position    integer not null default 0
);
create index if not exists operator_payment_methods_operator_id_idx
  on public.operator_payment_methods (operator_id);

-- 7. Related platforms (You Might Also Like) ---------------------------------
create table if not exists public.operator_related (
  operator_id         uuid not null references public.operators (id) on delete cascade,
  related_operator_id uuid not null references public.operators (id) on delete cascade,
  position            integer not null default 0,
  primary key (operator_id, related_operator_id),
  check (operator_id <> related_operator_id)
);

-- 8. Affiliate click events ---------------------------------------------------
-- Records each tracked CTA click with its context. Insert only, never read by
-- the public app; the admin can aggregate it later.
create table if not exists public.affiliate_clicks (
  id           uuid primary key default gen_random_uuid(),
  link_slug    text not null,
  operator_id  uuid references public.operators (id) on delete set null,
  placement    text,
  cta_label    text,
  page_path    text,
  created_at   timestamptz not null default now()
);
create index if not exists affiliate_clicks_link_slug_idx on public.affiliate_clicks (link_slug);

-- ---------------------------------------------------------------------------
-- Row level security
--
-- Child review tables are readable only when their parent review is published.
-- Operator child tables are readable only for active operators. Writes go
-- through the service role, which bypasses RLS, exactly like the rest of the CMS.
-- ---------------------------------------------------------------------------

alter table public.review_ratings enable row level security;
create policy review_ratings_public_read on public.review_ratings
  for select to anon, authenticated
  using (exists (select 1 from public.reviews r
                 where r.id = review_ratings.review_id and r.status = 'published'));
grant select on public.review_ratings to anon, authenticated;
grant all on public.review_ratings to service_role;

alter table public.review_faqs enable row level security;
create policy review_faqs_public_read on public.review_faqs
  for select to anon, authenticated
  using (exists (select 1 from public.reviews r
                 where r.id = review_faqs.review_id and r.status = 'published'));
grant select on public.review_faqs to anon, authenticated;
grant all on public.review_faqs to service_role;

alter table public.review_blocks enable row level security;
create policy review_blocks_public_read on public.review_blocks
  for select to anon, authenticated
  using (visible = true and exists (select 1 from public.reviews r
                 where r.id = review_blocks.review_id and r.status = 'published'));
grant select on public.review_blocks to anon, authenticated;
grant all on public.review_blocks to service_role;

alter table public.operator_payment_methods enable row level security;
create policy operator_payment_methods_public_read on public.operator_payment_methods
  for select to anon, authenticated
  using (exists (select 1 from public.operators o
                 where o.id = operator_payment_methods.operator_id and o.active = true));
grant select on public.operator_payment_methods to anon, authenticated;
grant all on public.operator_payment_methods to service_role;

alter table public.operator_related enable row level security;
create policy operator_related_public_read on public.operator_related
  for select to anon, authenticated
  using (exists (select 1 from public.operators o
                 where o.id = operator_related.operator_id and o.active = true));
grant select on public.operator_related to anon, authenticated;
grant all on public.operator_related to service_role;

-- Click log: no public read. Inserts happen through the SECURITY DEFINER
-- function below, so the table itself grants nothing to anon.
alter table public.affiliate_clicks enable row level security;
grant all on public.affiliate_clicks to service_role;

-- ---------------------------------------------------------------------------
-- record_affiliate_click: safe insert + counter bump for a tracked CTA.
-- SECURITY DEFINER so anonymous visitors can log a click without table grants,
-- mirroring increment_affiliate_click.
-- ---------------------------------------------------------------------------
create or replace function public.record_affiliate_click(
  link_slug text,
  placement text default null,
  cta_label text default null,
  page_path text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  op_id uuid;
begin
  select operator_id into op_id from public.affiliate_links where slug = link_slug;

  insert into public.affiliate_clicks (link_slug, operator_id, placement, cta_label, page_path)
  values (link_slug, op_id, placement, cta_label, page_path);

  update public.affiliate_links set clicks = clicks + 1 where slug = link_slug;
end;
$$;

grant execute on function public.record_affiliate_click(text, text, text, text)
  to anon, authenticated;
