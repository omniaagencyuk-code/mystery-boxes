import { cache } from 'react';

import { getMarketByCode } from '@/lib/data/markets';
import { getVisibleOperatorsForMarket } from '@/lib/data/operators';
import type { MarketCode } from '@/lib/geo';
import type { OperatorSummary } from '@/lib/models';
import { createServerSupabase } from '@/lib/supabase/server';
import type { CategoryRow, OfferRow, PageRow, PostRow, ReviewRow } from '@/lib/supabase/types';

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

/** Published posts (news / blog) for a market, newest first. */
export const getPublishedPostsForMarket = cache(
  async (marketCode: MarketCode): Promise<PostRow[]> => {
    const market = await getMarketByCode(marketCode);
    if (!market) return [];

    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('market_id', market.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    return data ?? [];
  },
);

/** A single published post for a market. */
export const getPostForMarket = cache(
  async (marketCode: MarketCode, slug: string): Promise<PostRow | null> => {
    const market = await getMarketByCode(marketCode);
    if (!market) return null;

    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('market_id', market.id)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    return data ?? null;
  },
);

/**
 * Active offers across every operator that is visible and not geo-blocked in the
 * market, paired with the operator, for the promo codes page. Respects the
 * offer's live window.
 */
export const getMarketPromoOffers = cache(
  async (
    marketCode: MarketCode,
    geoChain: readonly string[],
  ): Promise<{ operator: OperatorSummary; offer: OfferRow }[]> => {
    const operators = await getVisibleOperatorsForMarket(marketCode, geoChain);
    if (operators.length === 0) return [];

    const byId = new Map(operators.map((o) => [o.id, o]));
    const nowIso = new Date().toISOString();

    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('offers')
      .select('*')
      .in(
        'operator_id',
        operators.map((o) => o.id),
      )
      .eq('active', true)
      .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
      .or(`expires_at.is.null,expires_at.gte.${nowIso}`)
      .order('title');

    const results: { operator: OperatorSummary; offer: OfferRow }[] = [];
    for (const offer of data ?? []) {
      const operator = byId.get(offer.operator_id);
      if (operator) results.push({ operator, offer });
    }
    return results;
  },
);

/**
 * Published guide pages for a market. Guides are stored in `pages` with a slug
 * prefixed `guides/`, so they live at /guides/<slug> and stay out of the root
 * `/[slug]` namespace.
 */
export const getGuidesForMarket = cache(
  async (
    marketCode: MarketCode,
  ): Promise<{ slug: string; title: string; meta_description: string | null }[]> => {
    const market = await getMarketByCode(marketCode);
    if (!market) return [];

    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('pages')
      .select('slug, title, meta_description')
      .eq('market_id', market.id)
      .eq('status', 'published')
      .like('slug', 'guides/%')
      .order('title');
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
