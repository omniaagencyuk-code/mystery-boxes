import { cache } from 'react';

import { availabilityLabel } from '@/lib/availability';
import { getGeoBlockedOperatorIds } from '@/lib/data/geo-block';
import { getMarketByCode } from '@/lib/data/markets';
import type { MarketCode } from '@/lib/geo';
import { createServerSupabase } from '@/lib/supabase/server';
import type { AvailabilityScope } from '@/lib/supabase/types';

export interface ComparePlatform {
  slug: string;
  name: string;
  logoUrl: string | null;
  /** Overall editorial score: review score if set, else the operator rating. */
  score: number | null;
  /** Rating breakdown, keyed by the CMS label (free text, may vary per site). */
  scores: Record<string, number>;
  offerTitle: string | null;
  buyback: string | null;
  shipping: string | null;
  minAge: string | null;
  paymentMethods: string[];
  usAvailable: boolean;
  availabilityScope: AvailabilityScope;
  availableCountries: string[];
  availabilityLabel: string;
  trackingUrl: string | null;
  lastCheckedISO: string | null;
}

/**
 * Assemble side-by-side comparison data for every platform visible in a market,
 * from real operator, review, offer and payment data. Batched queries (no N+1).
 * Only published reviews contribute scores; missing values stay null so the UI
 * can show a gap rather than invent one.
 */
export const getComparePlatforms = cache(
  async (marketCode: MarketCode, geoChain: readonly string[]): Promise<ComparePlatform[]> => {
    const market = await getMarketByCode(marketCode);
    if (!market) return [];
    const supabase = await createServerSupabase();

    // Visible, non-geo-blocked operator ids in this market.
    const [{ data: vis }, blocked] = await Promise.all([
      supabase.from('operator_markets').select('operator_id').eq('market_id', market.id).eq('visible', true),
      getGeoBlockedOperatorIds(supabase, geoChain),
    ]);
    const ids = (vis ?? []).map((r) => r.operator_id).filter((id) => !blocked.has(id));
    if (ids.length === 0) return [];

    const usMarket = await getMarketByCode('us');

    const [
      { data: operators },
      { data: reviews },
      { data: payments },
      { data: offers },
      { data: usVis },
    ] = await Promise.all([
      supabase
        .from('operators')
        .select('id, slug, name, logo_url, rating, tracking_url, buyback, shipping_info, min_age, availability_scope, available_countries')
        .eq('active', true)
        .in('id', ids)
        .order('rating', { ascending: false, nullsFirst: false })
        .order('name'),
      supabase
        .from('reviews')
        .select('id, operator_id, overall_score, last_checked_at')
        .eq('market_id', market.id)
        .eq('status', 'published')
        .in('operator_id', ids),
      supabase.from('operator_payment_methods').select('operator_id, name, position').in('operator_id', ids).order('position'),
      supabase
        .from('offers')
        .select('operator_id, title, exclusive, active')
        .eq('active', true)
        .in('operator_id', ids)
        .order('exclusive', { ascending: false }),
      usMarket
        ? supabase
            .from('operator_markets')
            .select('operator_id, requires_geo_block')
            .eq('market_id', usMarket.id)
            .eq('visible', true)
            .in('operator_id', ids)
        : Promise.resolve({ data: [] as { operator_id: string; requires_geo_block: boolean }[] }),
    ]);

    const reviewByOp = new Map((reviews ?? []).map((r) => [r.operator_id, r]));
    const reviewIds = (reviews ?? []).map((r) => r.id);

    // Rating breakdown for the collected reviews.
    const { data: ratings } = reviewIds.length
      ? await supabase.from('review_ratings').select('review_id, label, score').in('review_id', reviewIds)
      : { data: [] as { review_id: string; label: string; score: number }[] };
    const opByReview = new Map((reviews ?? []).map((r) => [r.id, r.operator_id]));
    const scoresByOp = new Map<string, Record<string, number>>();
    for (const row of ratings ?? []) {
      const opId = opByReview.get(row.review_id);
      if (!opId) continue;
      const bucket = scoresByOp.get(opId) ?? {};
      bucket[row.label] = Number(row.score);
      scoresByOp.set(opId, bucket);
    }

    const paymentsByOp = new Map<string, string[]>();
    for (const p of payments ?? []) {
      const list = paymentsByOp.get(p.operator_id) ?? [];
      list.push(p.name);
      paymentsByOp.set(p.operator_id, list);
    }

    const offerByOp = new Map<string, string>();
    for (const o of offers ?? []) if (!offerByOp.has(o.operator_id)) offerByOp.set(o.operator_id, o.title);

    const usAvailableByOp = new Map<string, boolean>();
    for (const m of usVis ?? []) usAvailableByOp.set(m.operator_id, !m.requires_geo_block);

    return (operators ?? []).map((op) => {
      const review = reviewByOp.get(op.id);
      return {
        slug: op.slug,
        name: op.name,
        logoUrl: op.logo_url,
        score: review?.overall_score ?? op.rating,
        scores: scoresByOp.get(op.id) ?? {},
        offerTitle: offerByOp.get(op.id) ?? null,
        buyback: op.buyback,
        shipping: op.shipping_info,
        minAge: op.min_age,
        paymentMethods: paymentsByOp.get(op.id) ?? [],
        usAvailable: usAvailableByOp.get(op.id) ?? false,
        availabilityScope: op.availability_scope,
        availableCountries: op.available_countries,
        availabilityLabel: availabilityLabel(op.availability_scope, op.available_countries),
        trackingUrl: op.tracking_url,
        lastCheckedISO: review?.last_checked_at ?? null,
      };
    });
  },
);
