import { cache } from 'react';

import { availabilityLabel } from '@/lib/availability';
import { getMarketByCode } from '@/lib/data/markets';
import { marketPath, type MarketCode } from '@/lib/geo';
import { resolveCta } from '@/lib/reviews/affiliate';
import { offerState } from '@/lib/reviews/offer-state';
import { createServerSupabase } from '@/lib/supabase/server';
import type { OfferRow } from '@/lib/supabase/types';

export interface ComparisonCategory {
  slug: string;
  name: string;
}

export interface ComparisonRow {
  operatorId: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  rating: number | null;
  ratingLabel: string | null;
  categories: ComparisonCategory[];
  primaryCategory: ComparisonCategory | null;
  offerTitle: string | null;
  paymentMethods: string[];
  availabilityLabel: string;
  recommended: boolean;
  tableLabel: string | null;
  reviewHref: string | null;
  cta: { href: string; tracked: boolean } | null;
  updatedISO: string | null;
}

export interface HomeComparison {
  rows: ComparisonRow[];
  categories: ComparisonCategory[];
}

/** A short descriptor for a numeric score, matching the concept image. */
function ratingLabel(score: number | null): string | null {
  if (score == null) return null;
  if (score >= 4.8) return 'Excellent';
  if (score >= 4.5) return 'Great';
  if (score >= 4.2) return 'Very Good';
  if (score >= 3.8) return 'Good';
  return 'Fair';
}

/**
 * The homepage comparison table, built from the shared operator record. Loads
 * only the fields the table and its filters need (never full review bodies), for
 * every operator marked visible on the homepage, ordered by homepage position.
 * Filtering, sorting and category tabs are applied client-side with no reload.
 */
export const getHomeComparison = cache(async (market: MarketCode): Promise<HomeComparison> => {
  const record = await getMarketByCode(market);
  if (!record) return { rows: [], categories: [] };
  const supabase = await createServerSupabase();
  const nowIso = new Date().toISOString();

  const { data: operators } = await supabase
    .from('operators')
    .select(
      'id, slug, name, logo_url, logo_dark_url, rating, tracking_url, website_url, availability_scope, available_countries, recommended, table_label, homepage_position, updated_at',
    )
    .eq('active', true)
    .eq('homepage_visible', true)
    .order('homepage_position', { ascending: true, nullsFirst: false })
    .order('rating', { ascending: false, nullsFirst: false });
  if (!operators || operators.length === 0) return { rows: [], categories: [] };

  const ids = operators.map((o) => o.id);

  const [{ data: catLinks }, { data: cats }, { data: offerRows }, { data: payments }, { data: links }, { data: reviews }] =
    await Promise.all([
      supabase.from('operator_categories').select('operator_id, category_id').in('operator_id', ids),
      supabase.from('categories').select('id, slug, name').eq('market_id', record.id),
      supabase
        .from('offers')
        .select('*')
        .in('operator_id', ids)
        .eq('active', true)
        .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
        .or(`expires_at.is.null,expires_at.gte.${nowIso}`),
      supabase.from('operator_payment_methods').select('operator_id, name, position').in('operator_id', ids).order('position'),
      supabase.from('affiliate_links').select('slug, operator_id, market_id, active').eq('active', true).in('operator_id', ids),
      supabase.from('reviews').select('operator_id').eq('market_id', record.id).eq('status', 'published').in('operator_id', ids),
    ]);

  const catById = new Map((cats ?? []).map((c) => [c.id, { slug: c.slug, name: c.name }]));
  const catsByOperator = new Map<string, ComparisonCategory[]>();
  for (const link of catLinks ?? []) {
    const c = catById.get(link.category_id);
    if (!c) continue;
    const list = catsByOperator.get(link.operator_id) ?? [];
    list.push(c);
    catsByOperator.set(link.operator_id, list);
  }

  const now = new Date();
  const offerByOperator = new Map<string, string>();
  for (const offer of (offerRows ?? []) as OfferRow[]) {
    if (!offerState(offer, now).usable) continue;
    if (!offerByOperator.has(offer.operator_id)) offerByOperator.set(offer.operator_id, offer.title);
  }

  const paymentsByOperator = new Map<string, string[]>();
  for (const p of payments ?? []) {
    const list = paymentsByOperator.get(p.operator_id) ?? [];
    list.push(p.name);
    paymentsByOperator.set(p.operator_id, list);
  }

  const slugByOperator = new Map<string, string>();
  for (const link of links ?? []) {
    if (!link.operator_id) continue;
    if (link.market_id === null || !slugByOperator.has(link.operator_id)) slugByOperator.set(link.operator_id, link.slug);
  }

  const reviewed = new Set((reviews ?? []).map((r) => r.operator_id));

  const rows: ComparisonRow[] = operators.map((op) => {
    const categories = (catsByOperator.get(op.id) ?? []).sort((a, b) => a.name.localeCompare(b.name));
    const cta = resolveCta(
      { affiliateSlug: slugByOperator.get(op.id) ?? null, trackingUrl: op.tracking_url, websiteUrl: op.website_url },
      { placement: 'home_table', label: 'Visit Site', page: '/' },
    );
    return {
      operatorId: op.id,
      slug: op.slug,
      name: op.name,
      logoUrl: op.logo_dark_url ?? op.logo_url,
      rating: op.rating,
      ratingLabel: ratingLabel(op.rating),
      categories,
      primaryCategory: categories[0] ?? null,
      offerTitle: offerByOperator.get(op.id) ?? null,
      paymentMethods: paymentsByOperator.get(op.id) ?? [],
      availabilityLabel: availabilityLabel(op.availability_scope, op.available_countries),
      recommended: op.recommended,
      tableLabel: op.table_label,
      reviewHref: reviewed.has(op.id) ? marketPath(market, `/reviews/${op.slug}`) : null,
      cta,
      updatedISO: op.updated_at,
    };
  });

  // Tabs: categories that actually have a visible platform, in name order.
  const present = new Set(rows.flatMap((r) => r.categories.map((c) => c.slug)));
  const categories = (cats ?? [])
    .filter((c) => present.has(c.slug))
    .map((c) => ({ slug: c.slug, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { rows, categories };
});
