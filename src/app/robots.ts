import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/seo';

// Allow crawling everywhere. Only the admin area and the affiliate redirect
// (/go/) are disallowed; every content page is crawlable. Point robots at the
// sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/go/'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
