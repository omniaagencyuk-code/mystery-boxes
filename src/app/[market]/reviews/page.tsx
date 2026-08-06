import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AvailabilityFilter } from '@/components/availability-filter';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { OperatorCard } from '@/components/operator-card';
import { availableIn, type AvailabilityFilterValue } from '@/lib/availability';
import { getVisibleOperatorsForMarket } from '@/lib/data/operators';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { getRequestGeoContext } from '@/lib/request-context';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string };
type SearchParams = { availability?: string };

const AVAIL = new Set(['us', 'uk', 'both', 'global']);

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { market } = await params;
  if (!isSupportedMarket(market)) return {};
  return {
    title: 'Mystery box reviews',
    description: `Independent reviews of mystery box operators in the ${MARKET_LABELS[market]}.`,
    alternates: marketAlternates(market, '/reviews'),
  };
}

export default async function ReviewsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { market } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const { availability } = await searchParams;
  const availValue = availability && AVAIL.has(availability) ? (availability as AvailabilityFilterValue) : null;

  const { geoChain } = await getRequestGeoContext();
  const all = await getVisibleOperatorsForMarket(marketCode, geoChain);
  const operators = availValue
    ? all.filter((op) => availableIn(op.availabilityScope, op.availableCountries, availValue))
    : all;

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
          { name: 'Reviews', path: marketPath(marketCode, '/reviews') },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Mystery box reviews</h1>
        <p className="text-muted">Every operator we cover, reviewed independently.</p>
      </header>

      <AvailabilityFilter resultCount={operators.length} />

      {operators.length === 0 ? (
        <p className="text-muted">No platforms match this availability filter. Try All regions.</p>
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
