-- Migration: admin dashboard support
--   admins          allowlist of admin users, tied to Supabase auth.users
--   media           uploaded asset metadata (files live in Supabase Storage)
--   posts           blog / news content, per market
--   affiliate_links central affiliate link manager with a cloaked redirect
--
-- Writes remain service-role only: the admin UI verifies the session and admin
-- status, then writes with the secret key. No write policies are granted to
-- anon or authenticated here. Public read is limited to published/active rows.

-- ---------------------------------------------------------------------------
-- admins: who may use the dashboard. user_id links to the Supabase auth user.
-- ---------------------------------------------------------------------------
create table public.admins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid unique references auth.users (id) on delete cascade,
  email      text not null unique,
  name       text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- An authenticated user may read only their own admin row (used to confirm admin
-- status in the browser session). No anon access. Writes are service role only.
create policy admins_read_own
  on public.admins
  for select
  to authenticated
  using (user_id = auth.uid());

grant select on public.admins to authenticated;
grant all on public.admins to service_role;

-- ---------------------------------------------------------------------------
-- media: metadata for files stored in Supabase Storage. Publicly readable
-- because assets appear on public pages.
-- ---------------------------------------------------------------------------
create table public.media (
  id          uuid primary key default gen_random_uuid(),
  bucket      text not null default 'media',
  path        text not null,
  url         text,
  alt         text,
  title       text,
  mime_type   text,
  size_bytes  bigint,
  width       integer,
  height      integer,
  uploaded_by uuid references public.admins (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (bucket, path)
);

create trigger media_set_updated_at
  before update on public.media
  for each row execute function public.set_updated_at();

alter table public.media enable row level security;

create policy media_public_read
  on public.media
  for select
  to anon, authenticated
  using (true);

grant select on public.media to anon, authenticated;
grant all on public.media to service_role;

-- ---------------------------------------------------------------------------
-- posts: editorial blog / news posts, per market (mirrors pages' market scoping).
-- ---------------------------------------------------------------------------
create table public.posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null,
  market_id        uuid not null references public.markets (id) on delete cascade,
  title            text not null,
  excerpt          text,
  body             text,
  meta_description text,
  cover_media_id   uuid references public.media (id) on delete set null,
  author           text,
  status           text not null default 'draft' check (status in ('draft', 'published')),
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (market_id, slug)
);

create index posts_market_id_idx on public.posts (market_id);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

create policy posts_public_read
  on public.posts
  for select
  to anon, authenticated
  using (status = 'published');

grant select on public.posts to anon, authenticated;
grant all on public.posts to service_role;

-- ---------------------------------------------------------------------------
-- affiliate_links: central manager for outbound tracking links. The redirect
-- route /go/[slug] resolves the target and bumps the click counter. target_url
-- is exposed to the clicker in the redirect anyway, so active links are public
-- readable; clicks are incremented through a SECURITY DEFINER function so no
-- write policy is needed.
-- ---------------------------------------------------------------------------
create table public.affiliate_links (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  label       text not null,
  operator_id uuid references public.operators (id) on delete set null,
  market_id   uuid references public.markets (id) on delete set null,
  target_url  text not null,
  rel         text not null default 'sponsored nofollow',
  active      boolean not null default true,
  clicks      bigint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index affiliate_links_operator_id_idx on public.affiliate_links (operator_id);

create trigger affiliate_links_set_updated_at
  before update on public.affiliate_links
  for each row execute function public.set_updated_at();

alter table public.affiliate_links enable row level security;

create policy affiliate_links_public_read
  on public.affiliate_links
  for select
  to anon, authenticated
  using (active = true);

grant select on public.affiliate_links to anon, authenticated;
grant all on public.affiliate_links to service_role;

-- Increment a link's click counter without granting write access. SECURITY
-- DEFINER runs as the function owner, bypassing RLS for just this operation.
create or replace function public.increment_affiliate_click(link_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.affiliate_links
  set clicks = clicks + 1
  where slug = link_slug and active = true;
$$;

grant execute on function public.increment_affiliate_click(text) to anon, authenticated;
