import { cache } from 'react';

import { getGeoBlockedOperatorIds } from '@/lib/data/geo-block';
import { getMarketByCode, getOperatorTypeSlugMap } from '@/lib/data/markets';
import type { MarketCode } from '@/lib/geo';
import { offerState } from '@/lib/reviews/offer-state';
import type {
  OfferView,
  PaymentMethodView,
  PlatformView,
  RatingCategory,
  RelatedPlatformView,
  ReviewBlockView,
  ReviewFaqItem,
  ReviewPageData,
  ReviewView,
} from '@/lib/reviews/types';
import { createServerSupabase } from '@/lib/supabase/server';
import type { OperatorRow, OperatorTypeSlug } from '@/lib/supabase/types';

function toPlatform(row: OperatorRow, typeSlug: OperatorTypeSlug): PlatformView {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    operatorType: typeSlug,
    logoUrl: row.logo_url,
    logoLightUrl: row.logo_light_url,
    logoDarkUrl: row.logo_dark_url,
    heroImageUrl: row.hero_image_url,
    rating: row.rating,
    summary: row.summary,
    websiteUrl: row.website_url,
    trackingUrl: row.tracking_url,
    foundedYear: row.founded_year,
    owner: row.owner,
    minAge: row.min_age,
    availability: row.availability,
    kycRequired: row.kyc_required,
    buyback: row.buyback,
    mobileApp: row.mobile_app,
    shippingInfo: row.shipping_info,
    supportInfo: row.support_info,
    licenceAuthority: row.licence_authority,
    licenceNumber: row.licence_number,
    pros: Array.isArray(row.pros) ? row.pros : [],
    cons: Array.isArray(row.cons) ? row.cons : [],
  };
}

/**
 * Everything the review template needs for one platform in one market. Returns
 * null when the operator is missing, inactive, not mapped to the market, or
 * geo-blocked for the visitor, or when there is no published review. This is the
 * authoritative geo-block backstop, exactly like getOperatorForReview.
 */
export const getReviewPageData = cache(
  async (
    marketCode: MarketCode,
    slug: string,
    geoChain: readonly string[],
  ): Promise<ReviewPageData | null> => {
    const market = await getMarketByCode(marketCode);
    if (!market) return null;

    const supabase = await createServerSupabase();

    const { data: operator } = await supabase
      .from('operators')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle();
    if (!operator) return null;

    // Must be mapped to this market to have a review page here.
    const { data: mapping } = await supabase
      .from('operator_markets')
      .select('operator_id')
      .eq('market_id', market.id)
      .eq('operator_id', operator.id)
      .maybeSingle();
    if (!mapping) return null;

    // Authoritative geo-block backstop.
    const blocked = await getGeoBlockedOperatorIds(supabase, geoChain);
    if (blocked.has(operator.id)) return null;

    // Published review is required for the page to exist.
    const { data: reviewRow } = await supabase
      .from('reviews')
      .select('*')
      .eq('operator_id', operator.id)
      .eq('market_id', market.id)
      .eq('status', 'published')
      .maybeSingle();
    if (!reviewRow) return null;

    const typeMap = await getOperatorTypeSlugMap();
    const platform = toPlatform(operator, typeMap.get(operator.operator_type_id) ?? 'physical_retail');

    // Child records for the review, in display order.
    const [{ data: ratingRows }, { data: faqRows }, { data: blockRows }, { data: paymentRows }] =
      await Promise.all([
        supabase.from('review_ratings').select('*').eq('review_id', reviewRow.id).order('position'),
        supabase.from('review_faqs').select('*').eq('review_id', reviewRow.id).order('position'),
        supabase
          .from('review_blocks')
          .select('*')
          .eq('review_id', reviewRow.id)
          .eq('visible', true)
          .order('position'),
        supabase
          .from('operator_payment_methods')
          .select('*')
          .eq('operator_id', operator.id)
          .order('position'),
      ]);

    // Resolve any block media that stored only a media_id.
    const missingMediaIds = (blockRows ?? [])
      .filter((b) => !b.media_url && b.media_id)
      .map((b) => b.media_id as string);
    const mediaUrlById = new Map<string, string | null>();
    if (missingMediaIds.length > 0) {
      const { data: mediaRows } = await supabase
        .from('media')
        .select('id, url')
        .in('id', missingMediaIds);
      for (const m of mediaRows ?? []) mediaUrlById.set(m.id, m.url);
    }

    const ratings: RatingCategory[] = (ratingRows ?? []).map((r) => ({
      label: r.label,
      score: Number(r.score),
    }));
    const faqs: ReviewFaqItem[] = (faqRows ?? []).map((f) => ({
      question: f.question,
      answer: f.answer,
    }));
    const blocks: ReviewBlockView[] = (blockRows ?? []).map((b) => ({
      id: b.id,
      type: b.block_type,
      heading: b.heading,
      body: b.body,
      mediaUrl: b.media_url ?? (b.media_id ? mediaUrlById.get(b.media_id) ?? null : null),
      alt: b.alt,
      caption: b.caption,
      ctaLabel: b.cta_label,
      ctaUrl: b.cta_url,
      config: b.config,
    }));
    const payments: PaymentMethodView[] = (paymentRows ?? []).map((p) => ({
      slug: p.slug,
      name: p.name,
      kind: p.kind,
    }));

    const review: ReviewView = {
      id: reviewRow.id,
      summary: platform.summary,
      body: reviewRow.body,
      verdict: reviewRow.verdict,
      bestForTitle: reviewRow.best_for_title,
      bestForDescription: reviewRow.best_for_description,
      // Fall back to the operator's star rating when no review-level score is set.
      overallScore: reviewRow.overall_score ?? platform.rating,
      scoreDescriptor: reviewRow.score_descriptor,
      author: reviewRow.author,
      reviewer: reviewRow.reviewer,
      publishedAt: reviewRow.published_at,
      updatedAt: reviewRow.updated_at,
      lastCheckedAt: reviewRow.last_checked_at,
      nextReviewAt: reviewRow.next_review_at,
      seoTitle: reviewRow.seo_title,
      metaDescription: reviewRow.meta_description,
      canonicalUrl: reviewRow.canonical_url,
      ogImageUrl: reviewRow.og_image_url,
      ratings,
      faqs,
      blocks,
    };

    // Primary welcome offer, with freshness derived at request time.
    const nowIso = new Date().toISOString();
    const { data: offerRows } = await supabase
      .from('offers')
      .select('*')
      .eq('operator_id', operator.id)
      .eq('active', true)
      .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
      .or(`expires_at.is.null,expires_at.gte.${nowIso}`)
      .order('exclusive', { ascending: false });
    const primaryOffer = offerRows?.[0] ?? null;
    const offer: OfferView | null = primaryOffer
      ? {
          id: primaryOffer.id,
          title: primaryOffer.title,
          description: primaryOffer.description,
          code: primaryOffer.code,
          terms: primaryOffer.terms,
          termsUrl: primaryOffer.terms_url,
          eligibility: primaryOffer.eligibility,
          ctaLabel: primaryOffer.cta_label,
          exclusive: primaryOffer.exclusive,
          state: offerState(primaryOffer, new Date()),
        }
      : null;

    // Active affiliate link for tracked CTAs (market-specific preferred).
    const { data: linkRows } = await supabase
      .from('affiliate_links')
      .select('slug, market_id')
      .eq('operator_id', operator.id)
      .eq('active', true);
    const marketLink = (linkRows ?? []).find((l) => l.market_id === market.id);
    const globalLink = (linkRows ?? []).find((l) => l.market_id === null);
    const affiliateSlug = (marketLink ?? globalLink)?.slug ?? null;

    // Related platforms, honouring geo-block, with a best-for label from their
    // own review when available.
    const related = await loadRelatedPlatforms(
      supabase,
      operator.id,
      market.id,
      blocked,
    );

    return { platform, review, offer, payments, related, affiliateSlug };
  },
);

async function loadRelatedPlatforms(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  operatorId: string,
  marketId: string,
  blocked: Set<string>,
): Promise<RelatedPlatformView[]> {
  const { data: rel } = await supabase
    .from('operator_related')
    .select('related_operator_id, position')
    .eq('operator_id', operatorId)
    .order('position');
  const ids = (rel ?? []).map((r) => r.related_operator_id).filter((id) => !blocked.has(id));
  if (ids.length === 0) return [];

  const [{ data: ops }, { data: revs }] = await Promise.all([
    supabase.from('operators').select('id, slug, name, logo_url, rating').eq('active', true).in('id', ids),
    supabase
      .from('reviews')
      .select('operator_id, best_for_title')
      .eq('market_id', marketId)
      .eq('status', 'published')
      .in('operator_id', ids),
  ]);
  const bestForByOp = new Map<string, string | null>();
  for (const r of revs ?? []) bestForByOp.set(r.operator_id, r.best_for_title);
  const byId = new Map((ops ?? []).map((o) => [o.id, o]));

  // Preserve the admin-defined order, and only include operators that are
  // active and still mapped (a published review in this market implies mapping).
  const publishedIds = new Set((revs ?? []).map((r) => r.operator_id));
  return ids
    .filter((id) => byId.has(id) && publishedIds.has(id))
    .map((id) => {
      const o = byId.get(id)!;
      return {
        slug: o.slug,
        name: o.name,
        logoUrl: o.logo_url,
        rating: o.rating,
        bestFor: bestForByOp.get(id) ?? null,
      };
    });
}
