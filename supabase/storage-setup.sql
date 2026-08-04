-- One-time Supabase Storage setup for the media library.
-- Run this once against your Supabase project (SQL editor or psql). It is kept
-- out of supabase/migrations/ because the storage schema only exists on Supabase
-- and would break local migration validation.

-- Public bucket for media assets (logos, post covers, etc).
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Public read of objects in the media bucket. Uploads and deletes are performed
-- server side with the secret key, which bypasses storage RLS, so no write
-- policy is granted here.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'media public read'
  ) then
    create policy "media public read"
      on storage.objects
      for select
      to anon, authenticated
      using (bucket_id = 'media');
  end if;
end $$;
