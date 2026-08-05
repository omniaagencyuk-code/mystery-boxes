import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Markdown } from '@/components/markdown';
import { OperatorCard } from '@/components/operator-card';
import { PlatformRankingCard } from '@/components/platform-ranking-card';
import { getCategoryForMarket, getMarketPromoOffers, getPageForMarket } from '@/lib/data/content';
import { getVisibleOperatorsForCategory } from '@/lib/data/operators';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import type { CategoryRow, PageRow } from '@/lib/supabase/types';
import { getRequestGeoContext } from '@/lib/request-context';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string; slug: string };

/**
 * A single /[market]/[slug] URL can be a category listing or a guide/money page.
 * Categories are resolved first, then pages. The `reviews` segment is a separate
 * static route, so it never reaches here.
 */
// Static sections own these URLs, so a category or page must never resolve here
// under the same slug. 'uk' and 'us' are reserved too: 'uk' is the UK section
// and 'us' redirects to the root.
const RESERVED = new Set([
  'reviews',
  'news',
  'compare',
  'promo-codes',
  'categories',
  'guides',
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
    { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
    { name, path: marketPath(marketCode, `/${slug}`) },
  ];

  if (resolved.kind === 'category') {
    const { category } = resolved;
    const { geoChain } = await getRequestGeoContext();
    const [operators, promo] = await Promise.all([
      getVisibleOperatorsForCategory(marketCode, category.id, geoChain),
      getMarketPromoOffers(marketCode, geoChain),
    ]);

    // Real per-operator headline offer from the DB.
    const offerTitleByOperator = new Map<string, string>();
    for (const { operator, offer } of promo) {
      if (!offerTitleByOperator.has(operator.id)) offerTitleByOperator.set(operator.id, offer.title);
    }

    const topRated = operators.slice(0, 5);
    const rest = operators.slice(5);

    return (
      <div className="space-y-10">
        <Breadcrumbs items={crumbs(category.name)} />
        <header className="max-w-2xl space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {category.name}
          </h1>
          {category.description && <p className="text-lg text-muted">{category.description}</p>}
        </header>

        {operators.length === 0 ? (
          <p className="text-muted">We have nothing to show here for your region right now.</p>
        ) : (
          <>
            <section className="space-y-5">
              <h2 className="text-2xl font-bold text-ink">Top rated {category.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {topRated.map((op, i) => (
                  <PlatformRankingCard
                    key={op.id}
                    operator={op}
                    rank={i + 1}
                    market={marketCode}
                    offerTitle={offerTitleByOperator.get(op.id) ?? null}
                    primaryCta="visit"
                  />
                ))}
              </div>
            </section>

            {rest.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-ink">More sites</h2>
                <div className="space-y-4">
                  {rest.map((op) => (
                    <OperatorCard key={op.id} operator={op} market={marketCode} variant="full" />
                  ))}
                </div>
              </section>
            )}
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
