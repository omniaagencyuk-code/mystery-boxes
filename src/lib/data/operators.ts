import { cache } from 'react';

import { availabilityLabel } from '@/lib/availability';
import { getGeoBlockedOperatorIds } from '@/lib/data/geo-block';
import { getMarketByCode, getOperatorTypeSlugMap } from '@/lib/data/markets';
import type { MarketCode } from '@/lib/geo';
import type { OperatorSummary } from '@/lib/models';
import { createServerSupabase } from '@/lib/supabase/server';
import type { OperatorRow, OperatorTypeSlug } from '@/lib/supabase/types';

function toSummary(row: OperatorRow, typeSlug: OperatorTypeSlug): OperatorSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url,
    rating: row.rating,
    summary: row.summary,
    pros: Array.isArray(row.pros) ? row.pros : [],
    cons: Array.isArray(row.cons) ? row.cons : [],
    trackingUrl: row.tracking_url,
    operatorType: typeSlug,
    licenceAuthority: row.licence_authority,
    licenceNumber: row.licence_number,
    availabilityScope: row.availability_scope,
    availableCountries: row.available_countries,
    availabilityLabel: availabilityLabel(row.availability_scope, row.available_countries),
  };
}

/** Operator ids that are visible in a given market (for listings). */
async function getVisibleOperatorIdsInMarket(marketId: string): Promise<string[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('operator_markets')
    .select('operator_id')
    .eq('market_id', marketId)
    .eq('visible', true);
  return (data ?? []).map((r) => r.operator_id);
}

/** Operator ids that have ANY mapping to a market (visible or not). */
async function getMappedOperatorIdsInMarket(marketId: string): Promise<Set<string>> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('operator_markets')
    .select('operator_id')
    .eq('market_id', marketId);
  return new Set((data ?? []).map((r) => r.operator_id));
}

/**
 * Operators to list for a market: mapped and visible in that market, active, and
 * NOT geo-blocked for the visitor's detected chain. Ordered by rating (rated
 * first) then name.
 */
export const getVisibleOperatorsForMarket = cache(
  async (marketCode: MarketCode, geoChain: readonly string[]): Promise<OperatorSummary[]> => {
    const market = await getMarketByCode(marketCode);
    if (!market) return [];

    const [visibleIds, blockedIds, typeMap] = await Promise.all([
      getVisibleOperatorIdsInMarket(market.id),
      getGeoBlockedOperatorIds(await createServerSupabase(), geoChain),
      getOperatorTypeSlugMap(),
    ]);

    const allowed = visibleIds.filter((id) => !blockedIds.has(id));
    if (allowed.length === 0) return [];

    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('operators')
      .select('*')
      .eq('active', true)
      .in('id', allowed)
      .order('rating', { ascending: false, nullsFirst: false })
      .order('name', { ascending: true });

    return (data ?? []).map((row) =>
      toSummary(row, typeMap.get(row.operator_type_id) ?? 'physical_retail'),
    );
  },
);

/** Restrict a set of operator summaries to those in a category. */
export const getVisibleOperatorsForCategory = cache(
  async (
    marketCode: MarketCode,
    categoryId: string,
    geoChain: readonly string[],
  ): Promise<OperatorSummary[]> => {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('operator_categories')
      .select('operator_id')
      .eq('category_id', categoryId);
    const inCategory = new Set((data ?? []).map((r) => r.operator_id));

    if (inCategory.size === 0) return [];
    const all = await getVisibleOperatorsForMarket(marketCode, geoChain);
    return all.filter((op) => inCategory.has(op.id));
  },
);

/**
 * Full operator record for a review page. Returns null when the operator does
 * not exist, is inactive, is not mapped to this market, or is geo-blocked for
 * the visitor. Geo-block here is the authoritative backstop to the proxy.
 */
export const getOperatorForReview = cache(
  async (
    marketCode: MarketCode,
    slug: string,
    geoChain: readonly string[],
  ): Promise<{ operator: OperatorSummary; id: string; marketId: string } | null> => {
    const market = await getMarketByCode(marketCode);
    if (!market) return null;

    const supabase = await createServerSupabase();
    const { data: row } = await supabase
      .from('operators')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle();
    if (!row) return null;

    // Must be mapped to this market to have a review page here.
    const mapped = await getMappedOperatorIdsInMarket(market.id);
    if (!mapped.has(row.id)) return null;

    // Authoritative geo-block backstop.
    const blocked = await getGeoBlockedOperatorIds(supabase, geoChain);
    if (blocked.has(row.id)) return null;

    const typeMap = await getOperatorTypeSlugMap();
    return {
      operator: toSummary(row, typeMap.get(row.operator_type_id) ?? 'physical_retail'),
      id: row.id,
      marketId: market.id,
    };
  },
);
