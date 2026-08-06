import type { MetadataRoute } from 'next';

import { getSitemapEntriesForMarket } from '@/lib/data/sitemap';
import { SUPPORTED_MARKETS } from '@/lib/geo';
import { absoluteUrl } from '@/lib/seo';

// A single sitemap served at /sitemap.xml. The site is one namespace at the
// root. Generated at request time so it reflects the current database and does
// not run Supabase queries during the build.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const perMarket = await Promise.all(
    SUPPORTED_MARKETS.map((market) => getSitemapEntriesForMarket(market)),
  );

  const seen = new Set<string>();
  const urls: MetadataRoute.Sitemap = [];

  for (const entries of perMarket) {
    for (const entry of entries) {
      const url = absoluteUrl(entry.path);
      if (seen.has(url)) continue;
      seen.add(url);
      urls.push({
        url,
        lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined,
        changeFrequency: 'weekly',
      });
    }
  }

  return urls;
}
