import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';

/**
 * Geo-block resolution, shared by middleware (fast early 404) and the data layer
 * (authoritative exclusion from listings and review pages).
 *
 * An operator is geo-blocked for a visitor when it has an operator_markets row
 * with requires_geo_block = true for ANY market in the visitor's detected chain
 * (e.g. ['us-wa', 'us']). Codes in the chain that do not exist as markets simply
 * never match.
 */

/**
 * Middleware helper. Uses the Supabase REST endpoint directly with the
 * publishable key because the edge middleware cannot use the cookie-bound server
 * client. Returns true only when a block is positively determined; on any error
 * it returns false and lets the review page perform the authoritative check.
 */
export async function isOperatorGeoBlockedViaRest(
  slug: string,
  chain: readonly string[],
): Promise<boolean> {
  if (chain.length === 0) return false;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) return false;

  const url = new URL(`${base}/rest/v1/operator_markets`);
  url.searchParams.set(
    'select',
    'requires_geo_block,market:markets!inner(code),operator:operators!inner(slug)',
  );
  url.searchParams.set('operator.slug', `eq.${slug}`);
  url.searchParams.set('requires_geo_block', 'is.true');

  try {
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      // Short cache so a hot review URL does not hit the DB on every request.
      next: { revalidate: 60 },
    });
    if (!res.ok) return false;

    const rows = (await res.json()) as Array<{ market: { code: string } | null }>;
    return rows.some((row) => row.market != null && chain.includes(row.market.code));
  } catch {
    return false;
  }
}

/**
 * Data-layer helper, retained as a no-op. The site no longer hard geo-blocks:
 * availability is a per-record property surfaced as a UI filter, not a gate that
 * hides pages, so every published page renders for every visitor (including
 * search crawlers). This always returns an empty set so no listing or review
 * page is ever suppressed. The `requires_geo_block` column is preserved in case
 * a hard block is ever reinstated.
 */
export async function getGeoBlockedOperatorIds(
  supabase: SupabaseClient<Database>,
  chain: readonly string[],
): Promise<Set<string>> {
  void supabase;
  void chain;
  return new Set();
}
