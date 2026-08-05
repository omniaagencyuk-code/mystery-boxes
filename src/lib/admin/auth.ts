import { createServerSupabase } from '@/lib/supabase/server';
import type { AdminRole, AdminRow } from '@/lib/supabase/types';

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

/**
 * Guard for server actions that require a specific role. Throws unless the
 * caller is an active admin whose role is in `allowed`. All authorisation is
 * enforced here, server-side, never in the client.
 */
export async function requireRoleForAction(allowed: readonly AdminRole[]): Promise<AdminRow> {
  const admin = await requireAdminForAction();
  if (!allowed.includes(admin.role)) {
    throw new Error('You do not have permission to do that');
  }
  return admin;
}
