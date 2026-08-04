import { cache } from 'react';

import { getMarketByCode } from '@/lib/data/markets';
import type { MarketCode } from '@/lib/geo';
import { createServerSupabase } from '@/lib/supabase/server';
import type { CategoryRow, OfferRow, PageRow, ReviewRow } from '@/lib/supabase/types';

/** Published review for an operator in a market (RLS also enforces published). */
export const getPublishedReview = cache(
  async (operatorId: string, marketId: string): Promise<ReviewRow | null> => {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('operator_id', operatorId)
      .eq('market_id', marketId)
      .eq('status', 'published')
      .maybeSingle();
    return data ?? null;
  },
);

/** Active offers for an operator, within their live window when set. */
export const getActiveOffers = cache(async (operatorId: string): Promise<OfferRow[]> => {
  const supabase = await createServerSupabase();
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from('offers')
    .select('*')
    .eq('operator_id', operatorId)
    .eq('active', true)
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`expires_at.is.null,expires_at.gte.${nowIso}`);
  return data ?? [];
});

/**
 * A category available in a market: either scoped to that market or global
 * (market_id null). Used by /[market]/[slug].
 */
export const getCategoryForMarket = cache(
  async (marketCode: MarketCode, slug: string): Promise<CategoryRow | null> => {
    const market = await getMarketByCode(marketCode);
    if (!market) return null;

    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .or(`market_id.eq.${market.id},market_id.is.null`)
      .limit(1)
      .maybeSingle();
    return data ?? null;
  },
);

/** All categories available in a market (market-scoped plus global). */
export const getCategoriesForMarket = cache(
  async (marketCode: MarketCode): Promise<CategoryRow[]> => {
    const market = await getMarketByCode(marketCode);
    if (!market) return [];

    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('categories')
      .select('*')
      .or(`market_id.eq.${market.id},market_id.is.null`)
      .order('name', { ascending: true });
    return data ?? [];
  },
);

/** A published page (guide or money page) for a market. */
export const getPageForMarket = cache(
  async (marketCode: MarketCode, slug: string): Promise<PageRow | null> => {
    const market = await getMarketByCode(marketCode);
    if (!market) return null;

    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('market_id', market.id)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    return data ?? null;
  },
);
