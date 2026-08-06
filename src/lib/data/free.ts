import { cache } from 'react';

import { availabilityLabel, type FreeOfferRow } from '@/lib/free/offers';
import { resolveCta } from '@/lib/reviews/affiliate';
import { offerState } from '@/lib/reviews/offer-state';
import { createServerSupabase } from '@/lib/supabase/server';
import type {
  FreeBodyBlockRow,
  FreePageFaqRow,
  FreePageSectionType,
  OfferRow,
} from '@/lib/supabase/types';

// Offer lifecycle values that should never surface as a live free offer.
const HIDDEN_OFFER_STATUS = new Set(['paused', 'expired', 'no_current_offer', 'draft']);

export interface FreePageSettings {
  h1: string;
  heroIntro: string;
  heroImageUrl: string | null;
  heroImageMobileUrl: string | null;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  newsletterHeading: string;
  newsletterBody: string;
  newsletterPlaceholder: string;
  newsletterButton: string;
  newsletterPrivacy: string;
  tableDefaultSort: string;
  tablePageSize: number;
  tableCtaFallback: string;
  tableEmptyState: string;
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  indexStatus: string;
  published: boolean;
  author: string | null;
  reviewer: string | null;
  updatedAt: string | null;
}

export interface FreeStat {
  label: string;
  value: string;
}
export interface FreeFeaturedCard {
  row: FreeOfferRow;
  badge: string | null;
}
export interface FreeCategoryCard {
  label: string;
  href: string;
  imageUrl: string | null;
  count: number;
}
export interface FreeFaqItem {
  question: string;
  answer: string;
}
export interface FreeTrustItem {
  label: string;
  detail: string | null;
  icon: string | null;
}

export interface FreePageConfig {
  settings: FreePageSettings;
  sections: FreePageSectionType[];
  stats: FreeStat[];
  featured: FreeFeaturedCard[];
  categoryCards: FreeCategoryCard[];
  bodyBlocks: FreeBodyBlockRow[];
  faqs: FreeFaqItem[];
  trustItems: FreeTrustItem[];
}

const DEFAULT_SETTINGS: FreePageSettings = {
  h1: 'Free Mystery Boxes',
  heroIntro:
    'Find verified free mystery boxes, welcome bonuses, daily rewards and no-deposit offers from leading mystery box websites.',
  heroImageUrl: null,
  heroImageMobileUrl: null,
  ctaPrimaryLabel: 'Browse Free Offers',
  ctaPrimaryHref: '#offers',
  ctaSecondaryLabel: 'How It Works',
  ctaSecondaryHref: '#how-it-works',
  newsletterHeading: 'Never Miss a Free Box',
  newsletterBody: 'Get the latest free mystery box offers and new platform reviews delivered to your inbox.',
  newsletterPlaceholder: 'Enter your email address',
  newsletterButton: 'Subscribe Free',
  newsletterPrivacy: 'No spam. Unsubscribe anytime.',
  tableDefaultSort: 'rating',
  tablePageSize: 10,
  tableCtaFallback: 'visit_site',
  tableEmptyState: 'No free offers match these filters right now. Try clearing a filter to see more.',
  seoTitle: null,
  metaDescription: null,
  canonicalUrl: null,
  ogImageUrl: null,
  indexStatus: 'index',
  published: false,
  author: null,
  reviewer: null,
  updatedAt: null,
};

const DEFAULT_SECTIONS: FreePageSectionType[] = [
  'HERO',
  'FILTERS',
  'FEATURED_OFFERS',
  'OFFER_TABLE',
  'CATEGORY_CARDS',
  'BODY_CONTENT',
  'FAQ',
  'NEWSLETTER',
  'TRUST_STRIP',
];

/**
 * The full pool of live free offers, one row per active platform that currently
 * has a usable headline offer, with availability, category and a resolved CTA.
 * Filtering/sorting/pagination is applied by the pure helpers in lib/free/offers.
 */
export const getFreeOfferPool = cache(async (): Promise<FreeOfferRow[]> => {
  const supabase = await createServerSupabase();
  const nowIso = new Date().toISOString();

  const { data: operators } = await supabase
    .from('operators')
    .select(
      'id, slug, name, logo_url, logo_dark_url, rating, tracking_url, website_url, availability_scope, available_countries, excluded_states, features',
    )
    .eq('active', true);
  if (!operators || operators.length === 0) return [];

  const ids = operators.map((o) => o.id);

  const [{ data: offerRows }, { data: catLinks }, { data: cats }, { data: links }] = await Promise.all([
    supabase
      .from('offers')
      .select('*')
      .in('operator_id', ids)
      .eq('active', true)
      .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
      .or(`expires_at.is.null,expires_at.gte.${nowIso}`),
    supabase.from('operator_categories').select('operator_id, category_id').in('operator_id', ids),
    supabase.from('categories').select('id, slug, name'),
    supabase.from('affiliate_links').select('slug, operator_id, market_id, active').eq('active', true).in('operator_id', ids),
  ]);

  // Primary offer per operator: prefer exclusive, then most recently verified,
  // excluding editorially hidden lifecycle states.
  const now = new Date();
  const offersByOperator = new Map<string, OfferRow>();
  for (const offer of (offerRows ?? []) as OfferRow[]) {
    if (HIDDEN_OFFER_STATUS.has(offer.status)) continue;
    if (!offerState(offer, now).usable) continue;
    const current = offersByOperator.get(offer.operator_id);
    if (!current) {
      offersByOperator.set(offer.operator_id, offer);
      continue;
    }
    const better =
      Number(offer.exclusive) - Number(current.exclusive) ||
      (offer.last_verified_at ? Date.parse(offer.last_verified_at) : 0) -
        (current.last_verified_at ? Date.parse(current.last_verified_at) : 0);
    if (better > 0) offersByOperator.set(offer.operator_id, offer);
  }

  // Primary category per operator (first alphabetically by name).
  const catById = new Map((cats ?? []).map((c) => [c.id, c]));
  const categoryByOperator = new Map<string, { slug: string; name: string }>();
  for (const link of catLinks ?? []) {
    const cat = catById.get(link.category_id);
    if (!cat) continue;
    const existing = categoryByOperator.get(link.operator_id);
    if (!existing || cat.name.localeCompare(existing.name) < 0) {
      categoryByOperator.set(link.operator_id, { slug: cat.slug, name: cat.name });
    }
  }

  // Affiliate slug per operator (prefer a global link, then any).
  const slugByOperator = new Map<string, string>();
  for (const link of links ?? []) {
    if (!link.operator_id) continue;
    if (link.market_id === null || !slugByOperator.has(link.operator_id)) {
      slugByOperator.set(link.operator_id, link.slug);
    }
  }

  const rows: FreeOfferRow[] = [];
  for (const op of operators) {
    const offer = offersByOperator.get(op.id) ?? null;
    const state = offerState(offer, now);
    const category = categoryByOperator.get(op.id) ?? null;
    const cta = resolveCta(
      {
        affiliateSlug: slugByOperator.get(op.id) ?? null,
        trackingUrl: op.tracking_url,
        websiteUrl: op.website_url,
      },
      { placement: 'free_table', label: offer?.cta_label || 'Claim Offer', page: '/free' },
    );
    rows.push({
      operatorId: op.id,
      slug: op.slug,
      platformName: op.name,
      logoUrl: op.logo_dark_url ?? op.logo_url,
      rating: op.rating,
      offerId: offer?.id ?? null,
      offerTitle: offer?.title ?? null,
      offerType: offer?.offer_type ?? null,
      promoCode: offer?.code ?? null,
      prizeValueBand: offer?.prize_value_band ?? null,
      categoryName: category?.name ?? null,
      categorySlug: category?.slug ?? null,
      availabilityScope: op.availability_scope,
      availabilityLabel: availabilityLabel(op.availability_scope, op.available_countries),
      availableCountries: op.available_countries,
      excludedStates: op.excluded_states,
      features: op.features,
      lastVerifiedISO: state.lastCheckedISO,
      freshness: state.freshness,
      reviewHref: `/reviews/${op.slug}`,
      cta,
    });
  }
  return rows;
});

function computeStatValue(
  valueKey: string | null,
  staticValue: string | null,
  pool: FreeOfferRow[],
): string {
  if (valueKey === 'free_offers') return String(pool.filter((r) => r.offerId).length);
  if (valueKey === 'platforms') return String(pool.length);
  return staticValue ?? '';
}

/** Resolved /free configuration: settings, ordered sections, stats, featured
 * offers, category cards, SEO body, FAQs and trust items. */
export const getFreePageConfig = cache(async (): Promise<FreePageConfig> => {
  const supabase = await createServerSupabase();
  const [
    { data: s },
    { data: sectionRows },
    { data: statRows },
    { data: featuredRows },
    { data: cardRows },
    { data: blockRows },
    { data: faqRows },
    { data: trustRows },
    pool,
  ] = await Promise.all([
    supabase.from('free_page_settings').select('*').eq('page_key', 'free').maybeSingle(),
    supabase.from('free_page_sections').select('*').order('position'),
    supabase.from('free_page_stats').select('*').order('position'),
    supabase.from('free_featured_offers').select('*').order('position'),
    supabase.from('free_category_cards').select('*').order('position'),
    supabase.from('free_body_blocks').select('*').order('position'),
    supabase.from('free_page_faqs').select('question, answer, position').order('position'),
    supabase.from('free_trust_items').select('label, detail, icon, position').order('position'),
    getFreeOfferPool(),
  ]);

  const settings: FreePageSettings = {
    h1: s?.h1?.trim() || DEFAULT_SETTINGS.h1,
    heroIntro: s?.hero_intro?.trim() || DEFAULT_SETTINGS.heroIntro,
    heroImageUrl: s?.hero_image_url ?? null,
    heroImageMobileUrl: s?.hero_image_mobile_url ?? null,
    ctaPrimaryLabel: s?.cta_primary_label?.trim() || DEFAULT_SETTINGS.ctaPrimaryLabel,
    ctaPrimaryHref: s?.cta_primary_href?.trim() || DEFAULT_SETTINGS.ctaPrimaryHref,
    ctaSecondaryLabel: s?.cta_secondary_label?.trim() || DEFAULT_SETTINGS.ctaSecondaryLabel,
    ctaSecondaryHref: s?.cta_secondary_href?.trim() || DEFAULT_SETTINGS.ctaSecondaryHref,
    newsletterHeading: s?.newsletter_heading?.trim() || DEFAULT_SETTINGS.newsletterHeading,
    newsletterBody: s?.newsletter_body?.trim() || DEFAULT_SETTINGS.newsletterBody,
    newsletterPlaceholder: s?.newsletter_placeholder?.trim() || DEFAULT_SETTINGS.newsletterPlaceholder,
    newsletterButton: s?.newsletter_button?.trim() || DEFAULT_SETTINGS.newsletterButton,
    newsletterPrivacy: s?.newsletter_privacy?.trim() || DEFAULT_SETTINGS.newsletterPrivacy,
    tableDefaultSort: s?.table_default_sort || DEFAULT_SETTINGS.tableDefaultSort,
    tablePageSize: s?.table_page_size ?? DEFAULT_SETTINGS.tablePageSize,
    tableCtaFallback: s?.table_cta_fallback || DEFAULT_SETTINGS.tableCtaFallback,
    tableEmptyState: s?.table_empty_state?.trim() || DEFAULT_SETTINGS.tableEmptyState,
    seoTitle: s?.seo_title?.trim() || null,
    metaDescription: s?.meta_description?.trim() || null,
    canonicalUrl: s?.canonical_url?.trim() || null,
    ogImageUrl: s?.og_image_url?.trim() || null,
    indexStatus: s?.index_status || DEFAULT_SETTINGS.indexStatus,
    // When no settings row exists yet (migration seed not loaded), treat the
    // page as published so it renders on defaults. Only an explicit published =
    // false on a real row unpublishes it.
    published: s ? s.published : true,
    author: s?.author?.trim() || null,
    reviewer: s?.reviewer?.trim() || null,
    updatedAt: s?.updated_at ?? null,
  };

  const sections =
    sectionRows && sectionRows.length > 0
      ? sectionRows.filter((r) => r.visible).map((r) => r.section_type)
      : DEFAULT_SECTIONS;

  const stats: FreeStat[] = (statRows ?? []).map((r) => ({
    label: r.label,
    value: computeStatValue(r.value_key, r.static_value, pool),
  }));

  const byOperator = new Map(pool.map((r) => [r.operatorId, r]));
  const featured: FreeFeaturedCard[] = (featuredRows ?? [])
    .map((f) => {
      const row = byOperator.get(f.operator_id);
      return row ? { row, badge: f.badge } : null;
    })
    .filter((x): x is FreeFeaturedCard => x !== null);

  // Category cards with live offer counts (platforms with a usable offer in that category).
  const countByCategorySlug = new Map<string, number>();
  for (const r of pool) {
    if (r.categorySlug && r.offerId) {
      countByCategorySlug.set(r.categorySlug, (countByCategorySlug.get(r.categorySlug) ?? 0) + 1);
    }
  }
  const { data: cardCats } = await supabase.from('categories').select('id, slug, name');
  const catMeta = new Map((cardCats ?? []).map((c) => [c.id, c]));
  const categoryCards: FreeCategoryCard[] = (cardRows ?? []).map((c) => {
    const cat = c.category_id ? catMeta.get(c.category_id) : null;
    const slug = cat?.slug ?? null;
    return {
      label: c.label?.trim() || cat?.name || 'Category',
      href: c.href?.trim() || (slug ? `/free?category=${slug}` : '/free'),
      imageUrl: c.image_url ?? null,
      count: slug ? (countByCategorySlug.get(slug) ?? 0) : 0,
    };
  });

  const bodyBlocks = (blockRows ?? []).filter((b) => b.visible);
  const faqs: FreeFaqItem[] = (faqRows ?? []).map((f: Pick<FreePageFaqRow, 'question' | 'answer'>) => ({
    question: f.question,
    answer: f.answer,
  }));
  const trustItems: FreeTrustItem[] = (trustRows ?? []).map((t) => ({
    label: t.label,
    detail: t.detail,
    icon: t.icon,
  }));

  return { settings, sections, stats, featured, categoryCards, bodyBlocks, faqs, trustItems };
});
