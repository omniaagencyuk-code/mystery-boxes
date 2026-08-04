import type { MetadataRoute } from 'next';

import { getSitemapEntriesForMarket } from '@/lib/data/sitemap';
import { SUPPORTED_MARKETS, isSupportedMarket } from '@/lib/geo';
import { absoluteUrl } from '@/lib/seo';

// One sitemap per market, exposed under /sitemap/uk.xml and /sitemap/us.xml with
// an auto-generated index at /sitemap.xml. The US market lives at the root, so
// its home entry is '/'; the UK market lives under /uk.
//
// Generated at request time so it reflects the current database and does not run
// Supabase queries during the build.
export const dynamic = 'force-dynamic';

export async function generateSitemaps() {
  return SUPPORTED_MARKETS.map((market) => ({ id: market }));
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const market = await id;
  if (!isSupportedMarket(market)) return [];

  const entries = await getSitemapEntriesForMarket(market);

  return entries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined,
    changeFrequency: 'weekly' as const,
  }));
}
