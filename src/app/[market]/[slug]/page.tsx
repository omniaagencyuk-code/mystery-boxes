import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AvailabilityFilter } from '@/components/availability-filter';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { CategoryLanding } from '@/components/category/category-landing';
import { Markdown } from '@/components/markdown';
import { availableIn, type AvailabilityFilterValue } from '@/lib/availability';
import { getCategoryForMarket, getPageForMarket } from '@/lib/data/content';
import { getCategoryPageData } from '@/lib/data/category-page';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import type { CategoryRow, PageRow } from '@/lib/supabase/types';
import { getRequestGeoContext } from '@/lib/request-context';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string; slug: string };
type SearchParams = { availability?: string };

/**
 * A single /[market]/[slug] URL can be a category landing or a guide/money page.
 * Categories are resolved first, then pages. The `reviews` segment is a separate
 * static route, so it never reaches here.
 */
const RESERVED = new Set([
  'reviews',
  'news',
  'compare',
  'promo-codes',
  'categories',
  'guides',
  'free',
  'uk',
  'us',
]);

async function resolve(
  market: MarketCode,
  slug: string,
): Promise<{ kind: 'category'; category: CategoryRow } | { kind: 'page'; page: PageRow } | null> {
  if (RESERVED.has(slug)) return null;

  const category = await getCategoryForMarket(market, slug);
  if (category) return { kind: 'category', category };

  const page = await getPageForMarket(market, slug);
  if (page) return { kind: 'page', page };

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { market, slug } = await params;
  if (!isSupportedMarket(market)) return {};

  const alternates = marketAlternates(market, `/${slug}`);
  const resolved = await resolve(market, slug);
  if (!resolved) return { alternates };

  if (resolved.kind === 'category') {
    const c = resolved.category;
    return {
      title: c.seo_title?.trim() || c.name,
      description: c.meta_description?.trim() || c.description || undefined,
      alternates,
    };
  }

  return {
    title: resolved.page.title,
    description: resolved.page.meta_description ?? undefined,
    alternates,
  };
}

export default async function MarketSlugPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { market, slug } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const { availability } = await searchParams;
  const availValue =
    availability && ['us', 'uk', 'both', 'global'].includes(availability)
      ? (availability as AvailabilityFilterValue)
      : null;

  const resolved = await resolve(marketCode, slug);
  if (!resolved) notFound();

  const crumbs = (name: string) => [
    { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
    { name, path: marketPath(marketCode, `/${slug}`) },
  ];

  if (resolved.kind === 'category') {
    const { geoChain } = await getRequestGeoContext();
    const data = await getCategoryPageData(marketCode, slug, geoChain);
    if (!data) notFound();

    const filteredData = availValue
      ? {
          ...data,
          operators: data.operators.filter((op) =>
            availableIn(op.availabilityScope, op.availableCountries, availValue),
          ),
        }
      : data;

    return (
      <div className="space-y-8">
        <Breadcrumbs
          items={[
            { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
            { name: 'Categories', path: marketPath(marketCode, '/categories') },
            { name: data.category.name, path: marketPath(marketCode, `/${slug}`) },
          ]}
        />
        {data.operators.length === 0 && !data.category.intro ? (
          <>
            <header className="max-w-2xl space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                {data.category.h1 || data.category.name}
              </h1>
              {data.category.description && <p className="text-lg text-muted">{data.category.description}</p>}
            </header>
            <p className="text-muted">We have nothing to show here for your region right now.</p>
          </>
        ) : (
          <>
            {data.operators.length > 0 && <AvailabilityFilter resultCount={filteredData.operators.length} />}
            <CategoryLanding data={filteredData} market={marketCode} />
          </>
        )}
      </div>
    );
  }

  const { page } = resolved;
  return (
    <article className="space-y-6">
      <Breadcrumbs items={crumbs(page.title)} />
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{page.title}</h1>
      </header>
      {page.body && <Markdown>{page.body}</Markdown>}
    </article>
  );
}
