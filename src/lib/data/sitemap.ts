import { marketPath, type MarketCode } from '@/lib/geo';
import { createPublicSupabase } from '@/lib/supabase/public';

export interface SitemapEntry {
  path: string;
  lastModified?: string;
}

/**
 * URLs for the sitemap: the home page, every hub, published pages/posts,
 * categories, the /free page (when published) and a review page for every
 * active, visible operator. The site no longer hard geo-blocks, so no page is
 * suppressed: everything published is listed and crawlable.
 */
export async function getSitemapEntriesForMarket(
  market: MarketCode,
): Promise<SitemapEntry[]> {
  const supabase = createPublicSupabase();

  const { data: marketRow } = await supabase
    .from('markets')
    .select('id')
    .eq('code', market)
    .eq('active', true)
    .maybeSingle();
  if (!marketRow) return [];

  const entries: SitemapEntry[] = [
    { path: marketPath(market) },
    { path: marketPath(market, '/reviews') },
    { path: marketPath(market, '/compare') },
    { path: marketPath(market, '/promo-codes') },
    { path: marketPath(market, '/categories') },
    { path: marketPath(market, '/guides') },
    { path: marketPath(market, '/news') },
  ];

  // The /free page, when published and indexable.
  const { data: freeSettings } = await supabase
    .from('free_page_settings')
    .select('published, index_status')
    .eq('page_key', 'free')
    .maybeSingle();
  if ((!freeSettings || freeSettings.published) && freeSettings?.index_status !== 'noindex') {
    entries.push({ path: marketPath(market, '/free') });
  }

  // Published posts (news) for this market.
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('market_id', marketRow.id)
    .eq('status', 'published');
  for (const post of posts ?? []) {
    entries.push({ path: marketPath(market, `/news/${post.slug}`), lastModified: post.updated_at });
  }

  // Categories available in this market (market-scoped or global).
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, market_id')
    .or(`market_id.eq.${marketRow.id},market_id.is.null`);
  for (const cat of categories ?? []) {
    entries.push({ path: marketPath(market, `/${cat.slug}`) });
  }

  // Published pages for this market.
  const { data: pages } = await supabase
    .from('pages')
    .select('slug, updated_at')
    .eq('market_id', marketRow.id)
    .eq('status', 'published');
  for (const page of pages ?? []) {
    entries.push({ path: marketPath(market, `/${page.slug}`), lastModified: page.updated_at });
  }

  // Operators visible in this market.
  const { data: visible } = await supabase
    .from('operator_markets')
    .select('operator_id')
    .eq('market_id', marketRow.id)
    .eq('visible', true);
  const visibleIds = new Set((visible ?? []).map((r) => r.operator_id));

  if (visibleIds.size > 0) {
    const { data: operators } = await supabase
      .from('operators')
      .select('slug, updated_at')
      .eq('active', true)
      .in('id', [...visibleIds]);
    for (const op of operators ?? []) {
      entries.push({
        path: marketPath(market, `/reviews/${op.slug}`),
        lastModified: op.updated_at,
      });
    }
  }

  return entries;
}
