import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { OperatorCard } from '@/components/operator-card';
import { getCategoryForMarket, getPageForMarket } from '@/lib/data/content';
import { getVisibleOperatorsForCategory } from '@/lib/data/operators';
import { isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import type { CategoryRow, PageRow } from '@/lib/supabase/types';
import { getRequestGeoContext } from '@/lib/request-context';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string; slug: string };

/**
 * A single /[market]/[slug] URL can be a category listing or a guide/money page.
 * Categories are resolved first, then pages. The `reviews` segment is a separate
 * static route, so it never reaches here.
 */
async function resolve(
  market: MarketCode,
  slug: string,
): Promise<{ kind: 'category'; category: CategoryRow } | { kind: 'page'; page: PageRow } | null> {
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
    return {
      title: resolved.category.name,
      description: resolved.category.description ?? undefined,
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
}: {
  params: Promise<Params>;
}) {
  const { market, slug } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const resolved = await resolve(marketCode, slug);
  if (!resolved) notFound();

  const crumbs = (name: string) => [
    { name: MARKET_LABELS[marketCode], path: `/${marketCode}` },
    { name, path: `/${marketCode}/${slug}` },
  ];

  if (resolved.kind === 'category') {
    const { category } = resolved;
    const { geoChain } = await getRequestGeoContext();
    const operators = await getVisibleOperatorsForCategory(marketCode, category.id, geoChain);

    return (
      <div className="space-y-6">
        <Breadcrumbs items={crumbs(category.name)} />
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600 dark:text-gray-300">{category.description}</p>
          )}
        </header>

        {operators.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            We have nothing to show here for your region right now.
          </p>
        ) : (
          <div className="space-y-4">
            {operators.map((op) => (
              <OperatorCard key={op.id} operator={op} market={marketCode} variant="full" />
            ))}
          </div>
        )}
      </div>
    );
  }

  const { page } = resolved;
  return (
    <article className="space-y-6">
      <Breadcrumbs items={crumbs(page.title)} />
      <header>
        <h1 className="text-2xl font-semibold">{page.title}</h1>
      </header>
      {page.body && (
        <div className="space-y-3 text-gray-700 dark:text-gray-200">
          {page.body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}
    </article>
  );
}
