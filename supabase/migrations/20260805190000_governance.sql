-- ---------------------------------------------------------------------------
-- GOVERNANCE: roles + audit log
--
-- Adds a role to each admin (admin / editor / reviewer) and an append-only
-- audit log of admin actions. Additive and idempotent. Existing admins default
-- to the full "admin" role, so nobody loses access.
-- ---------------------------------------------------------------------------

alter table public.admins
  add column if not exists role text not null default 'admin';

-- Append-only record of who changed what. Written server-side with the secret
-- key; never publicly readable.
create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references public.admins (id) on delete set null,
  admin_email text,
  action      text not null,
  entity      text not null,
  entity_id   text,
  summary     text,
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;
grant all on public.audit_log to service_role;
