import type { Metadata } from 'next';

import { siteUrl } from '@/lib/env';
import { marketPath, type MarketCode } from '@/lib/geo';

/** Absolute URL for a path, using the configured site URL. */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl()}${clean}`;
}

/**
 * Build the canonical for a page. The site serves a single namespace at the
 * root, so each page has one self-referencing canonical URL and no hreflang
 * alternates. `pathWithinMarket` is the path after the root, e.g.
 * '/reviews/some-operator' or '' for the homepage.
 */
export function marketAlternates(
  market: MarketCode,
  pathWithinMarket: string,
): NonNullable<Metadata['alternates']> {
  const sub = pathWithinMarket && !pathWithinMarket.startsWith('/')
    ? `/${pathWithinMarket}`
    : pathWithinMarket;

  return {
    canonical: absoluteUrl(marketPath(market, sub)),
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

/**
 * Review structured data for the platform review template. Emits our own
 * editorial rating as `reviewRating` only. It deliberately omits AggregateRating
 * and any review count, because we hold no user reviews and must not fabricate
 * aggregate rating data.
 */
export function platformReviewJsonLd(params: {
  platformName: string;
  canonicalPath: string;
  score: number | null;
  headline: string | null;
  reviewBody: string | null;
  author: string | null;
  reviewer: string | null;
  datePublished: string | null;
  dateModified: string | null;
}) {
  const url = absoluteUrl(params.canonicalPath);
  const reviewRating =
    params.score != null
      ? { '@type': 'Rating', ratingValue: params.score, bestRating: 5, worstRating: 1 }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: { '@type': 'Organization', name: params.platformName, url },
    ...(reviewRating ? { reviewRating } : {}),
    author: { '@type': 'Organization', name: params.author || 'Editorial team' },
    ...(params.reviewer ? { reviewedBy: { '@type': 'Person', name: params.reviewer } } : {}),
    publisher: { '@type': 'Organization', name: 'Mystery Boxes' },
    ...(params.headline ? { name: params.headline } : {}),
    ...(params.reviewBody ? { reviewBody: params.reviewBody } : {}),
    ...(params.datePublished ? { datePublished: params.datePublished } : {}),
    ...(params.dateModified ? { dateModified: params.dateModified } : {}),
  };
}

/** FAQPage structured data from real question/answer pairs. */
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
