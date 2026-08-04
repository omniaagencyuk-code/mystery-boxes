import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { supabasePublishableKey, supabaseUrl } from '@/lib/env';
import type { Database } from './types';

/**
 * Supabase client for use in Server Components, Route Handlers and Server
 * Actions. It uses the PUBLISHABLE key, so every query is subject to Row Level
 * Security and can only read published/active content. This is the default
 * client for rendering pages.
 *
 * The site has no visitor accounts, so cookies carry no auth session today. The
 * cookie plumbing is wired up anyway so that adding auth later requires no
 * change here. setAll is guarded because Server Components cannot write cookies.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render, where cookies are read-only.
          // Safe to ignore: there is no session to persist.
        }
      },
    },
  });
}
