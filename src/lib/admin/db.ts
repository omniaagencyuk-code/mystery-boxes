import 'server-only';

import { getCurrentAdmin, requireAdminForAction, requireRoleForAction } from '@/lib/admin/auth';
import { createAdminSupabase } from '@/lib/supabase/admin';
import type { AdminRole } from '@/lib/supabase/types';

/**
 * Secret-key client for server ACTIONS. Throws if the caller is not an admin, so
 * a write can never run unverified.
 */
export async function adminDb() {
  await requireAdminForAction();
  return createAdminSupabase();
}

/**
 * Like adminDb, but also returns the verified admin (for audit logging). Use in
 * actions that record who made the change.
 */
export async function adminContext() {
  const admin = await requireAdminForAction();
  return { db: createAdminSupabase(), admin };
}

/**
 * adminContext restricted to specific roles. Throws if the caller's role is not
 * allowed. Use for privileged actions such as deletes (admin only).
 */
export async function adminContextWithRole(allowed: readonly AdminRole[]) {
  const admin = await requireRoleForAction(allowed);
  return { db: createAdminSupabase(), admin };
}

/**
 * Secret-key client for admin PAGES. Returns null for non-admins so the page can
 * render nothing while the layout shows the not-authorised message (avoids a
 * redirect loop and avoids surfacing a 500).
 */
export async function adminPageClient() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  return createAdminSupabase();
}
