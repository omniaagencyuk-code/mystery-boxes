import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { supabaseUrl } from '@/lib/env';
import type { Database } from './types';

/**
 * Privileged Supabase client using the SECRET key. It BYPASSES Row Level
 * Security, so it must only be used for trusted server-side work such as
 * writes, revalidation webhooks or admin tooling. Never use it to render pages
 * for visitors.
 *
 * The `server-only` import above makes the build fail if this module is ever
 * imported into a Client Component, which guarantees the secret key cannot leak
 * into the browser bundle. The secret key is read here and nowhere else.
 */
export function createAdminSupabase() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey || secretKey.length === 0) {
    throw new Error(
      'Missing environment variable SUPABASE_SECRET_KEY. It is required for privileged server-side operations.',
    );
  }

  return createClient<Database>(supabaseUrl(), secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
