import { cache } from 'react';

import { availabilityLabel } from '@/lib/availability';
import { getMarketByCode } from '@/lib/data/markets';
import { getVisibleOperatorsForMarket } from '@/lib/data/operators';
import { marketPath, type MarketCode } from '@/lib/geo';
import type { OperatorSummary } from '@/lib/models';
import { resolveCta } from '@/lib/reviews/affiliate';
import { createServerSupabase } from '@/lib/supabase/server';
import type { HomepageArticleBlockType, HomepageSectionType } from '@/lib/supabase/types';

export interface HomepageFaqItem {
  question: string;
  answer: string;
}

/** Homepage copy with defaults applied. Defaults are clearly temporary and are
 * meant to be replaced through the CMS once final SEO copy is supplied. */
export interface HomepageSettings {
  heroTitle: string;
  heroIntro: string;
  heroImageUrl: string | null;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  howWeRate: string | null;
  trustContent: string | null;
  newsletterHeading: string;
  newsletterBody: string;
  finalCtaHeading: string | null;
  finalCtaBody: string | null;
  finalCtaLabel: string | null;
  finalCtaHref: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
}

export interface HomepageConfig {
  settings: HomepageSettings;
  sections: HomepageSectionType[];
  trustIndicators: string[];
  faqs: HomepageFaqItem[];
}

/** Default section order used until an editor configures the homepage. Sections
 * with no content are skipped at render time. */
const DEFAULT_SECTIONS: HomepageSectionType[] = [
  'top_rated',
  'verified_offers',
  'category_cards',
  'comparison',
  'latest_reviews',
  'latest_guides',
  'featured_brands',
  'how_we_rate',
  'trust',
  'faq',
  'newsletter',
  'final_cta',
];

const DEFAULT_TRUST = ['Independent', 'Verified offers', 'Updated regularly'];

// NOTE: temporary placeholder copy. Replace via Admin > Homepage.
function defaults(market: MarketCode): HomepageSettings {
  return {
    heroTitle: 'Find the best mystery box websites',
    heroIntro:
      'Independent reviews, verified offers and real data to help you compare mystery box platforms before you spend anything. [Placeholder copy, edit in the CMS.]',
    heroImageUrl: null,
    ctaPrimaryLabel: 'Browse reviews',
    ctaPrimaryHref: marketPath(market, '/reviews'),
    ctaSecondaryLabel: 'Compare sites',
    ctaSecondaryHref: marketPath(market, '/compare'),
    howWeRate: null,
    trustContent: null,
    newsletterHeading: 'Stay updated',
    newsletterBody: 'Get new reviews and verified offers. No spam. [Placeholder copy.]',
    finalCtaHeading: null,
    finalCtaBody: null,
    finalCtaLabel: null,
    finalCtaHref: null,
    seoTitle: null,
    metaDescription: null,
    canonicalUrl: null,
    ogImageUrl: null,
  };
}

/**
 * Resolved homepage configuration for a market: editor-managed settings, the
 * ordered/visible section list, trust indicators and FAQs, each falling back to
 * sensible defaults so the homepage always renders.
 */
export const getHomepageConfig = cache(async (market: MarketCode): Promise<HomepageConfig> => {
  const base = defaults(market);
  const record = await getMarketByCode(market);
  if (!record) return { settings: base, sections: DEFAULT_SECTIONS, trustIndicators: DEFAULT_TRUST, faqs: [] };

  const supabase = await createServerSupabase();
  const [{ data: s }, { data: sectionRows }, { data: trustRows }, { data: faqRows }] = await Promise.all([
    supabase.from('homepage_settings').select('*').eq('market_id', record.id).maybeSingle(),
    supabase.from('homepage_sections').select('*').eq('market_id', record.id).order('position'),
    supabase.from('homepage_trust_indicators').select('label, position').eq('market_id', record.id).order('position'),
    supabase.from('homepage_faqs').select('question, answer, position').eq('market_id', record.id).order('position'),
  ]);

  const settings: HomepageSettings = {
    heroTitle: s?.hero_title?.trim() || base.heroTitle,
    heroIntro: s?.hero_intro?.trim() || base.heroIntro,
    heroImageUrl: s?.hero_image_url ?? base.heroImageUrl,
    ctaPrimaryLabel: s?.cta_primary_label?.trim() || base.ctaPrimaryLabel,
    ctaPrimaryHref: s?.cta_primary_href?.trim() || base.ctaPrimaryHref,
    ctaSecondaryLabel: s?.cta_secondary_label?.trim() || base.ctaSecondaryLabel,
    ctaSecondaryHref: s?.cta_secondary_href?.trim() || base.ctaSecondaryHref,
    howWeRate: s?.how_we_rate?.trim() || null,
    trustContent: s?.trust_content?.trim() || null,
    newsletterHeading: s?.newsletter_heading?.trim() || base.newsletterHeading,
    newsletterBody: s?.newsletter_body?.trim() || base.newsletterBody,
    finalCtaHeading: s?.final_cta_heading?.trim() || null,
    finalCtaBody: s?.final_cta_body?.trim() || null,
    finalCtaLabel: s?.final_cta_label?.trim() || null,
    finalCtaHref: s?.final_cta_href?.trim() || null,
    seoTitle: s?.seo_title?.trim() || null,
    metaDescription: s?.meta_description?.trim() || null,
    canonicalUrl: s?.canonical_url?.trim() || null,
    ogImageUrl: s?.og_image_url?.trim() || null,
  };

  const sections =
    sectionRows && sectionRows.length > 0
      ? sectionRows.filter((r) => r.visible).map((r) => r.section_type)
      : DEFAULT_SECTIONS;

  const trustIndicators =
    trustRows && trustRows.length > 0 ? trustRows.map((t) => t.label) : DEFAULT_TRUST;

  const faqs = (faqRows ?? []).map((f) => ({ question: f.question, answer: f.answer }));

  return { settings, sections, trustIndicators, faqs };
});

/** A platform card embedded in the homepage article. */
export interface HomeArticlePlatform {
  slug: string;
  name: string;
  logoUrl: string | null;
  rating: number | null;
  summary: string | null;
  pros: string[];
  offerTitle: string | null;
  availabilityLabel: string;
  reviewHref: string;
  cta: { href: string; tracked: boolean } | null;
}

export interface HomeArticleBlock {
  id: string;
  type: HomepageArticleBlockType;
  heading: string | null;
  body: string | null;
  badge: string | null;
  cardStyle: 'compact' | 'featured' | null;
  mediaUrl: string | null;
  href: string | null;
  platform: HomeArticlePlatform | null;
}

/**
 * The homepage "Best Mystery Box Sites" article: ordered editorial blocks with
 * PLATFORM_CARD blocks resolved to a live operator, its availability label and a
 * tracked affiliate CTA (falling back to tracking/website URL, else null).
 */
export const getHomepageArticle = cache(async (market: MarketCode): Promise<HomeArticleBlock[]> => {
  const record = await getMarketByCode(market);
  if (!record) return [];
  const supabase = await createServerSupabase();

  const { data: blocks } = await supabase
    .from('homepage_article_blocks')
    .select('*')
    .eq('market_id', record.id)
    .eq('visible', true)
    .order('position');
  if (!blocks || blocks.length === 0) return [];

  const operatorIds = blocks.map((b) => b.operator_id).filter((id): id is string => !!id);

  const platformById = new Map<string, HomeArticlePlatform>();
  if (operatorIds.length > 0) {
    const nowIso = new Date().toISOString();
    const [{ data: operators }, { data: links }, { data: offerRows }] = await Promise.all([
      supabase
        .from('operators')
        .select('id, slug, name, logo_url, logo_dark_url, rating, summary, pros, tracking_url, website_url, availability_scope, available_countries')
        .eq('active', true)
        .in('id', operatorIds),
      supabase.from('affiliate_links').select('slug, operator_id, market_id, active').eq('active', true).in('operator_id', operatorIds),
      supabase
        .from('offers')
        .select('operator_id, title, active, starts_at, expires_at, last_verified_at')
        .in('operator_id', operatorIds)
        .eq('active', true)
        .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
        .or(`expires_at.is.null,expires_at.gte.${nowIso}`),
    ]);

    const slugByOperator = new Map<string, string>();
    for (const link of links ?? []) {
      if (!link.operator_id) continue;
      if (link.market_id === null || !slugByOperator.has(link.operator_id)) {
        slugByOperator.set(link.operator_id, link.slug);
      }
    }
    const offerByOperator = new Map<string, string>();
    for (const o of offerRows ?? []) {
      if (!offerByOperator.has(o.operator_id)) offerByOperator.set(o.operator_id, o.title);
    }

    for (const op of operators ?? []) {
      const cta = resolveCta(
        { affiliateSlug: slugByOperator.get(op.id) ?? null, trackingUrl: op.tracking_url, websiteUrl: op.website_url },
        { placement: 'home_article', label: 'Visit Site', page: '/' },
      );
      platformById.set(op.id, {
        slug: op.slug,
        name: op.name,
        logoUrl: op.logo_dark_url ?? op.logo_url,
        rating: op.rating,
        summary: op.summary,
        pros: Array.isArray(op.pros) ? op.pros.slice(0, 3) : [],
        offerTitle: offerByOperator.get(op.id) ?? null,
        availabilityLabel: availabilityLabel(op.availability_scope, op.available_countries),
        reviewHref: marketPath(market, `/reviews/${op.slug}`),
        cta,
      });
    }
  }

  return blocks.map((b) => ({
    id: b.id,
    type: b.block_type,
    heading: b.heading,
    body: b.body,
    badge: b.badge,
    cardStyle: (b.card_style === 'compact' || b.card_style === 'featured' ? b.card_style : null),
    mediaUrl: b.media_url,
    href: b.href,
    platform: b.operator_id ? (platformById.get(b.operator_id) ?? null) : null,
  }));
});

/** Visible operators flagged as featured, for the Featured brands section. */
export const getFeaturedOperatorsForMarket = cache(
  async (market: MarketCode, geoChain: readonly string[]): Promise<OperatorSummary[]> => {
    const all = await getVisibleOperatorsForMarket(market, geoChain);
    if (all.length === 0) return [];
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('operators')
      .select('id')
      .eq('featured', true)
      .in('id', all.map((o) => o.id));
    const featured = new Set((data ?? []).map((r) => r.id));
    return all.filter((o) => featured.has(o.id));
  },
);

/** Visible operators with a published review, ordered by review recency. */
export const getLatestReviewedOperators = cache(
  async (
    market: MarketCode,
    geoChain: readonly string[],
    limit: number,
  ): Promise<OperatorSummary[]> => {
    const record = await getMarketByCode(market);
    if (!record) return [];
    const all = await getVisibleOperatorsForMarket(market, geoChain);
    if (all.length === 0) return [];
    const byId = new Map(all.map((o) => [o.id, o]));

    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('reviews')
      .select('operator_id, published_at')
      .eq('market_id', record.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false });

    const ordered: OperatorSummary[] = [];
    for (const row of data ?? []) {
      const op = byId.get(row.operator_id);
      if (op && !ordered.includes(op)) ordered.push(op);
      if (ordered.length >= limit) break;
    }
    return ordered;
  },
);
