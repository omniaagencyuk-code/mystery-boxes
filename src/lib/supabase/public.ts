import { createClient } from '@supabase/supabase-js';

import { supabasePublishableKey, supabaseUrl } from '@/lib/env';
import type { Database } from './types';

/**
 * Cookie-free Supabase client using the PUBLISHABLE key. Use this in build-time
 * or non-request server contexts such as sitemap generation, where next/headers
 * cookies() is not available. Still subject to Row Level Security, so it only
 * reads published/active content.
 */
export function createPublicSupabase() {
  return createClient<Database>(supabaseUrl(), supabasePublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
