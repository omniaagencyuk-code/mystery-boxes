import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/seo';

// Allow crawling everywhere. We never block crawlers wholesale: the only gate is
// the per-market hard geo block, which applies to everyone equally. Point robots
// at the sitemap index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
