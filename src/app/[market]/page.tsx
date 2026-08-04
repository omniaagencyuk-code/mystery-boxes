import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { OperatorCard } from '@/components/operator-card';
import { getCategoriesForMarket } from '@/lib/data/content';
import { getVisibleOperatorsForMarket } from '@/lib/data/operators';
import { isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { getRequestGeoContext } from '@/lib/request-context';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { market } = await params;
  if (!isSupportedMarket(market)) return {};
  return {
    title: `Mystery box reviews for the ${MARKET_LABELS[market]}`,
    description: `We compare and review mystery box operators available in the ${MARKET_LABELS[market]}.`,
    alternates: marketAlternates(market, ''),
  };
}

export default async function MarketHomePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { market } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const { geoChain } = await getRequestGeoContext();
  const [operators, categories] = await Promise.all([
    getVisibleOperatorsForMarket(marketCode, geoChain),
    getCategoriesForMarket(marketCode),
  ]);

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ name: MARKET_LABELS[marketCode], path: `/${marketCode}` }]} />

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          Mystery box reviews for the {MARKET_LABELS[marketCode]}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          We test and compare mystery box operators so you can see how they stack
          up before you spend anything. Here is where things stand today.
        </p>
      </header>

      {categories.length > 0 && (
        <nav aria-label="Categories" className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${marketCode}/${cat.slug}`}
              className="rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">How the operators compare</h2>

        {operators.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            We have nothing to show here for your region right now.
          </p>
        ) : (
          <>
            {/* Comparison table using the table_row card variant. */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-300 text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                    <th className="py-2 pr-3 font-medium">Operator</th>
                    <th className="px-3 py-2 font-medium">Rating</th>
                    <th className="px-3 py-2 font-medium">Notes</th>
                    <th className="py-2 pl-3 text-right font-medium">Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {operators.map((op) => (
                    <OperatorCard
                      key={op.id}
                      operator={op}
                      market={marketCode}
                      variant="table_row"
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Full cards below the table for detail. */}
            <div className="space-y-4">
              {operators.map((op) => (
                <OperatorCard key={op.id} operator={op} market={marketCode} variant="full" />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
