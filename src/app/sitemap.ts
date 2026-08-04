import type { MetadataRoute } from 'next';

import { getSitemapEntriesForMarket } from '@/lib/data/sitemap';
import { SUPPORTED_MARKETS, isSupportedMarket } from '@/lib/geo';
import { absoluteUrl } from '@/lib/seo';

// One sitemap per market, exposed under /sitemap/uk.xml and /sitemap/us.xml with
// an auto-generated index at /sitemap.xml. The root chooser is included in each
// market sitemap so every sitemap is self-contained; crawlers dedupe the URL.
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

  const urls: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'monthly', priority: 0.3 },
  ];

  for (const entry of entries) {
    urls.push({
      url: absoluteUrl(entry.path),
      lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined,
      changeFrequency: 'weekly',
    });
  }

  return urls;
}
