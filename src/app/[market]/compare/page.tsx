import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { CompareTool } from '@/components/compare/compare-tool';
import { getComparePlatforms } from '@/lib/data/compare';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { getRequestGeoContext } from '@/lib/request-context';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string };
type Search = { ids?: string };

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

  const { ids } = await searchParams;
  const initialSlugs = (ids ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const { geoChain } = await getRequestGeoContext();
  const platforms = await getComparePlatforms(marketCode, geoChain);

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

      {platforms.length === 0 ? (
        <p className="text-muted">We have nothing to compare for your region right now.</p>
      ) : (
        <CompareTool platforms={platforms} market={marketCode} initialSlugs={initialSlugs} />
      )}
    </div>
  );
}
