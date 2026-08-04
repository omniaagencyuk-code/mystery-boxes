import type { Metadata } from 'next';

import { siteUrl } from '@/lib/env';
import { marketPath, ROOT_MARKET, SUPPORTED_MARKETS, type MarketCode } from '@/lib/geo';

/** Absolute URL for a path, using the configured site URL. */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl()}${clean}`;
}

/** hreflang codes for our markets, plus x-default pointing at the chooser. */
const HREFLANG: Record<MarketCode, string> = {
  uk: 'en-GB',
  us: 'en-US',
};

/**
 * Build canonical + hreflang alternates for a page that exists in every market
 * at the same sub-path. `pathWithinMarket` is the part after the market segment,
 * e.g. '/reviews/some-operator' or '' for the market homepage.
 *
 * The US is served at the root (no /us prefix) and the UK under /uk, so URLs are
 * built with marketPath. Equivalent UK and US URLs are declared as regional
 * variants so search engines treat them as alternates rather than duplicates.
 * x-default points at the root (the default US region).
 */
export function marketAlternates(
  market: MarketCode,
  pathWithinMarket: string,
): NonNullable<Metadata['alternates']> {
  const sub = pathWithinMarket && !pathWithinMarket.startsWith('/')
    ? `/${pathWithinMarket}`
    : pathWithinMarket;

  const languages: Record<string, string> = {
    'x-default': absoluteUrl(marketPath(ROOT_MARKET, sub)),
  };
  for (const code of SUPPORTED_MARKETS) {
    languages[HREFLANG[code]] = absoluteUrl(marketPath(code, sub));
  }

  return {
    canonical: absoluteUrl(marketPath(market, sub)),
    languages,
  };
}

// --- JSON-LD builders -------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Review + AggregateRating for an operator page. Rating fields are included only
 * when a real rating exists; we never fabricate a rating or a review count. The
 * review count reflects the single editorial review shown on the page.
 */
export function operatorReviewJsonLd(params: {
  operatorName: string;
  canonicalPath: string;
  rating: number | null;
  reviewBody: string | null;
  verdict: string | null;
  author: string | null;
  datePublished: string | null;
}) {
  const url = absoluteUrl(params.canonicalPath);

  const aggregateRating =
    params.rating != null
      ? {
          '@type': 'AggregateRating',
          ratingValue: params.rating,
          bestRating: 5,
          worstRating: 1,
          reviewCount: 1,
        }
      : undefined;

  const reviewRating =
    params.rating != null
      ? {
          '@type': 'Rating',
          ratingValue: params.rating,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Organization',
      name: params.operatorName,
      url,
      ...(aggregateRating ? { aggregateRating } : {}),
    },
    ...(reviewRating ? { reviewRating } : {}),
    author: {
      '@type': 'Organization',
      name: params.author || 'Editorial team',
    },
    ...(params.verdict ? { name: params.verdict } : {}),
    ...(params.reviewBody ? { reviewBody: params.reviewBody } : {}),
    ...(params.datePublished ? { datePublished: params.datePublished } : {}),
  };
}
