import { createServerSupabase } from '@/lib/supabase/server';
import type { AdminRow } from '@/lib/supabase/types';

/**
 * The current admin, or null. Null means either no logged-in user or a
 * logged-in user who is not on the active admins allowlist. Uses the
 * RLS-bound session client, so the admins_read_own policy returns only the
 * caller's own row.
 */
export async function getCurrentAdmin(): Promise<AdminRow | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle();

  return data ?? null;
}

/**
 * Guard for server actions. Throws if the caller is not an active admin, so a
 * write can never proceed without verification. Returns the admin on success.
 */
export async function requireAdminForAction(): Promise<AdminRow> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Not authorised');
  return admin;
}
