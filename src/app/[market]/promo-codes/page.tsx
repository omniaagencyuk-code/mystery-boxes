import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AvailabilityFilter } from '@/components/availability-filter';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PromoList, type PromoItem } from '@/components/promo/promo-list';
import { availableIn, type AvailabilityFilterValue } from '@/lib/availability';
import { getMarketPromoOffers } from '@/lib/data/content';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { formatReviewDate } from '@/lib/reviews/format';
import { offerState } from '@/lib/reviews/offer-state';
import { getRequestGeoContext } from '@/lib/request-context';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { market } = await params;
  if (!isSupportedMarket(market)) return {};
  return {
    title: 'Mystery box promo codes and offers',
    description: `Current verified mystery box promo codes and welcome offers for the ${MARKET_LABELS[market]}.`,
    alternates: marketAlternates(market, '/promo-codes'),
  };
}

export default async function PromoCodesPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ availability?: string }>;
}) {
  const { market } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const { availability } = await searchParams;
  const availValue =
    availability && ['us', 'uk', 'both', 'global'].includes(availability)
      ? (availability as AvailabilityFilterValue)
      : null;

  const { geoChain } = await getRequestGeoContext();
  const raw = await getMarketPromoOffers(marketCode, geoChain);
  const now = new Date();

  // Keep only usable offers (active, in-window) and map to a serializable shape.
  const items: PromoItem[] = raw
    .filter(({ operator }) => availableIn(operator.availabilityScope, operator.availableCountries, availValue))
    .map(({ operator, offer }) => ({ operator, offer, state: offerState(offer, now) }))
    .filter(({ state }) => state.usable)
    .map(({ operator, offer, state }) => ({
      offerId: offer.id,
      operatorSlug: operator.slug,
      operatorName: operator.name,
      logoUrl: operator.logoUrl,
      trackingUrl: operator.trackingUrl,
      title: offer.title,
      description: offer.description,
      code: offer.code,
      eligibility: offer.eligibility,
      exclusive: offer.exclusive,
      stale: state.freshness === 'stale',
      lastCheckedLabel: formatReviewDate(state.lastCheckedISO),
    }));

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
          { name: 'Promo codes', path: marketPath(marketCode, '/promo-codes') },
        ]}
      />

      <header className="max-w-2xl space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Mystery box promo codes and offers
        </h1>
        <p className="text-lg text-muted">
          Current welcome offers and promo codes from the mystery box platforms we cover in the{' '}
          {MARKET_LABELS[marketCode]}. We check these regularly, but always confirm the terms on the
          operator&apos;s site before you spend.
        </p>
      </header>

      <AvailabilityFilter resultCount={items.length} />

      {items.length === 0 ? (
        <p className="text-muted">No live offers match this availability filter. Try All regions.</p>
      ) : (
        <PromoList items={items} market={marketCode} />
      )}

      <p className="border-t border-line pt-4 text-sm text-muted">
        Affiliate disclosure. Some links on this page are affiliate links. If you sign up through
        them we may earn a commission at no extra cost to you, which never affects our scores.
      </p>
    </div>
  );
}
