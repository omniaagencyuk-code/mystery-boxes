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
    <div className="space-y-10">
      <Breadcrumbs items={[{ name: MARKET_LABELS[marketCode], path: `/${marketCode}` }]} />

      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Compare mystery box platforms
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted">
          We test and compare mystery box operators available in the{' '}
          {MARKET_LABELS[marketCode]} so you can see how they stack up before you
          spend anything. Here is where things stand today.
        </p>
      </header>

      {categories.length > 0 && (
        <nav aria-label="Categories" className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${marketCode}/${cat.slug}`}
              className="rounded-full border border-line px-4 py-1.5 text-sm text-muted hover:bg-elevated hover:text-ink"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      )}

      <section className="space-y-6">
        <h2 className="text-xl font-bold text-ink">How the operators compare</h2>

        {operators.length === 0 ? (
          <p className="text-muted">We have nothing to show here for your region right now.</p>
        ) : (
          <>
            {/* Comparison table using the table_row card variant. */}
            <div className="overflow-x-auto pb-2">
              <table className="w-full min-w-[860px] overflow-hidden rounded-xl border border-line text-left">
                <thead>
                  <tr className="bg-raised text-xs font-bold uppercase tracking-wider text-muted">
                    <th className="py-3 pl-6 pr-3">Operator</th>
                    <th className="px-3 py-3">Rating</th>
                    <th className="px-3 py-3">Notes</th>
                    <th className="py-3 pl-3 pr-6 text-right">Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {operators.map((op, i) => (
                    <OperatorCard
                      key={op.id}
                      operator={op}
                      market={marketCode}
                      variant="table_row"
                      featured={i === 0 && op.rating != null}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Full cards below the table for detail. */}
            <div className="grid gap-4">
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
