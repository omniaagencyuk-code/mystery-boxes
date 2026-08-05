import { cache } from 'react';

import { getCategoryForMarket, getMarketPromoOffers } from '@/lib/data/content';
import { getVisibleOperatorsForCategory } from '@/lib/data/operators';
import type { MarketCode } from '@/lib/geo';
import type { OperatorSummary } from '@/lib/models';
import { createServerSupabase } from '@/lib/supabase/server';
import type { CategoryRow } from '@/lib/supabase/types';

export interface CategoryShortcut {
  label: string;
  target: string | null;
}
export interface CategoryFaqItem {
  question: string;
  answer: string;
}

export interface CategoryPageData {
  category: CategoryRow;
  operators: OperatorSummary[];
  offerTitleByOperator: Record<string, string>;
  /** Count of category operators that have a live headline offer. */
  verifiedOfferCount: number;
  shortcuts: CategoryShortcut[];
  brands: string[];
  faqs: CategoryFaqItem[];
}

/**
 * Everything the category landing template needs, assembled from real data.
 * Returns null when the category does not exist in the market.
 */
export const getCategoryPageData = cache(
  async (
    marketCode: MarketCode,
    slug: string,
    geoChain: readonly string[],
  ): Promise<CategoryPageData | null> => {
    const category = await getCategoryForMarket(marketCode, slug);
    if (!category) return null;

    const [operators, promo] = await Promise.all([
      getVisibleOperatorsForCategory(marketCode, category.id, geoChain),
      getMarketPromoOffers(marketCode, geoChain),
    ]);

    const operatorIds = new Set(operators.map((o) => o.id));
    const offerTitleByOperator: Record<string, string> = {};
    for (const { operator, offer } of promo) {
      if (operatorIds.has(operator.id) && !(operator.id in offerTitleByOperator)) {
        offerTitleByOperator[operator.id] = offer.title;
      }
    }

    const supabase = await createServerSupabase();
    const [{ data: shortcutRows }, { data: brandRows }, { data: faqRows }] = await Promise.all([
      supabase.from('category_shortcuts').select('label, target, position').eq('category_id', category.id).order('position'),
      supabase.from('category_brands').select('name, position').eq('category_id', category.id).order('position'),
      supabase.from('category_faqs').select('question, answer, position').eq('category_id', category.id).order('position'),
    ]);

    return {
      category,
      operators,
      offerTitleByOperator,
      verifiedOfferCount: Object.keys(offerTitleByOperator).length,
      shortcuts: (shortcutRows ?? []).map((s) => ({ label: s.label, target: s.target })),
      brands: (brandRows ?? []).map((b) => b.name),
      faqs: (faqRows ?? []).map((f) => ({ question: f.question, answer: f.answer })),
    };
  },
);
