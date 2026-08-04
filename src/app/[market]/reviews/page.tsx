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
    title: 'Mystery box reviews',
    description: `Independent reviews of mystery box operators in the ${MARKET_LABELS[market]}.`,
    alternates: marketAlternates(market, '/reviews'),
  };
}

export default async function ReviewsIndexPage({ params }: { params: Promise<Params> }) {
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
          { name: 'Reviews', path: `/${marketCode}/reviews` },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Mystery box reviews</h1>
        <p className="text-muted">Every operator we cover, reviewed independently.</p>
      </header>

      {operators.length === 0 ? (
        <p className="text-muted">We have nothing to show here for your region right now.</p>
      ) : (
        <div className="grid gap-4">
          {operators.map((op) => (
            <OperatorCard key={op.id} operator={op} market={marketCode} variant="full" />
          ))}
        </div>
      )}
    </div>
  );
}
