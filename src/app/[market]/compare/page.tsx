import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { OperatorCard } from '@/components/operator-card';
import { getVisibleOperatorsForMarket } from '@/lib/data/operators';
import { isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { getRequestGeoContext } from '@/lib/request-context';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { market } = await params;
  if (!isSupportedMarket(market)) return {};
  return {
    title: 'Compare mystery box platforms',
    description: `Side by side comparison of mystery box operators in the ${MARKET_LABELS[market]}.`,
    alternates: marketAlternates(market, '/compare'),
  };
}

export default async function ComparePage({ params }: { params: Promise<Params> }) {
  const { market } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const { geoChain } = await getRequestGeoContext();
  const operators = await getVisibleOperatorsForMarket(marketCode, geoChain);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: `/${marketCode}` },
          { name: 'Compare', path: `/${marketCode}/compare` },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Compare platforms</h1>
        <p className="text-muted">
          Every operator available in the {MARKET_LABELS[marketCode]}, side by side.
        </p>
      </header>

      {operators.length === 0 ? (
        <p className="text-muted">We have nothing to show here for your region right now.</p>
      ) : (
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
      )}
    </div>
  );
}
