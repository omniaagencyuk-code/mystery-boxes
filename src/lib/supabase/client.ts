'use client';

import { createBrowserClient } from '@supabase/ssr';

import { supabasePublishableKey, supabaseUrl } from '@/lib/env';
import type { Database } from './types';

/**
 * Supabase client for Client Components. Uses the PUBLISHABLE key and is subject
 * to Row Level Security.
 *
 * Note: per the spec, all content is server rendered. This helper exists for
 * incidental client-side needs only and must never be used to fetch page
 * content. It never has access to the secret key.
 */
export function createBrowserSupabase() {
  return createBrowserClient<Database>(supabaseUrl(), supabasePublishableKey());
}
