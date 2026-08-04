import { cache } from 'react';

import { createServerSupabase } from '@/lib/supabase/server';
import type { MarketRow, OperatorTypeSlug } from '@/lib/supabase/types';

/** All active markets, cached per request. */
export const getActiveMarkets = cache(async (): Promise<MarketRow[]> => {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from('markets').select('*').eq('active', true);
  return data ?? [];
});

/** Look up an active market by its code (uk, us, us-wa). */
export const getMarketByCode = cache(async (code: string): Promise<MarketRow | null> => {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('markets')
    .select('*')
    .eq('code', code)
    .eq('active', true)
    .maybeSingle();
  return data ?? null;
});

/**
 * Map of operator_type_id to its slug, cached per request. Used to attach the
 * compliance-driving operator type to operator rows without a typed embed.
 */
export const getOperatorTypeSlugMap = cache(
  async (): Promise<Map<string, OperatorTypeSlug>> => {
    const supabase = await createServerSupabase();
    const { data } = await supabase.from('operator_types').select('id, slug');
    const map = new Map<string, OperatorTypeSlug>();
    for (const row of data ?? []) map.set(row.id, row.slug);
    return map;
  },
);
