import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AvailabilityFilter } from '@/components/availability-filter';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { CompareTool } from '@/components/compare/compare-tool';
import { availableIn, type AvailabilityFilterValue } from '@/lib/availability';
import { getComparePlatforms } from '@/lib/data/compare';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { getRequestGeoContext } from '@/lib/request-context';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string };
type Search = { ids?: string; availability?: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { market } = await params;
  if (!isSupportedMarket(market)) return {};
  return {
    title: 'Compare mystery box platforms',
    description: `Compare mystery box platforms side by side on score, offers, payments, shipping and more in the ${MARKET_LABELS[market]}.`,
    alternates: marketAlternates(market, '/compare'),
  };
}

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { market } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const { ids, availability } = await searchParams;
  const initialSlugs = (ids ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const availValue =
    availability && ['us', 'uk', 'both', 'global'].includes(availability)
      ? (availability as AvailabilityFilterValue)
      : null;

  const { geoChain } = await getRequestGeoContext();
  const all = await getComparePlatforms(marketCode, geoChain);
  const platforms = availValue
    ? all.filter((p) => availableIn(p.availabilityScope, p.availableCountries, availValue))
    : all;

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
          { name: 'Compare', path: marketPath(marketCode, '/compare') },
        ]}
      />
      <header className="max-w-2xl space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Compare mystery box websites
        </h1>
        <p className="text-lg text-muted">
          Put the top mystery box platforms side by side on score, welcome offer, payments, shipping
          and more. Pick up to four to compare.
        </p>
      </header>

      <AvailabilityFilter resultCount={platforms.length} />

      {platforms.length === 0 ? (
        <p className="text-muted">No platforms match this availability filter. Try All regions.</p>
      ) : (
        <CompareTool platforms={platforms} market={marketCode} initialSlugs={initialSlugs} />
      )}
    </div>
  );
}
