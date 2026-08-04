import 'server-only';

import { getCurrentAdmin, requireAdminForAction } from '@/lib/admin/auth';
import { createAdminSupabase } from '@/lib/supabase/admin';

/**
 * Secret-key client for server ACTIONS. Throws if the caller is not an admin, so
 * a write can never run unverified.
 */
export async function adminDb() {
  await requireAdminForAction();
  return createAdminSupabase();
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
