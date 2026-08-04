import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { OperatorCompliance } from '@/components/compliance';
import { OutboundLink } from '@/components/outbound-link';
import { getMarketPromoOffers } from '@/lib/data/content';
import { isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { reviewPath } from '@/lib/models';
import { getRequestGeoContext } from '@/lib/request-context';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { market } = await params;
  if (!isSupportedMarket(market)) return {};
  return {
    title: 'Promo codes and offers',
    description: `Current mystery box promo codes and offers for the ${MARKET_LABELS[market]}.`,
    alternates: marketAlternates(market, '/promo-codes'),
  };
}

export default async function PromoCodesPage({ params }: { params: Promise<Params> }) {
  const { market } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const { geoChain } = await getRequestGeoContext();
  const items = await getMarketPromoOffers(marketCode, geoChain);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: `/${marketCode}` },
          { name: 'Promo codes', path: `/${marketCode}/promo-codes` },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Promo codes and offers</h1>
        <p className="text-muted">Current offers from the operators we cover. Terms apply.</p>
      </header>

      {items.length === 0 ? (
        <p className="text-muted">No live offers for your region right now.</p>
      ) : (
        <div className="grid gap-4">
          {items.map(({ operator, offer }) => (
            <div key={offer.id} className="u-glass flex flex-col gap-3 rounded-xl p-5 sm:flex-row sm:items-center">
              <div className="flex-1 space-y-1">
                <Link href={reviewPath(marketCode, operator.slug)} className="font-bold text-ink hover:text-primary">
                  {operator.name}
                </Link>
                <div className="text-sm font-semibold text-ink">{offer.title}</div>
                {offer.description && <p className="text-sm text-muted">{offer.description}</p>}
                {offer.terms && <p className="text-xs text-muted">{offer.terms}</p>}
                <OperatorCompliance
                  operatorType={operator.operatorType}
                  market={marketCode}
                  licenceAuthority={operator.licenceAuthority}
                  licenceNumber={operator.licenceNumber}
                />
              </div>
              <div className="flex flex-col items-stretch gap-2 sm:w-48">
                {offer.code && (
                  <div className="rounded-lg border border-dashed border-line bg-elevated px-3 py-2 text-center font-mono text-sm tracking-wider text-ink">
                    {offer.code}
                  </div>
                )}
                {operator.trackingUrl && (
                  <OutboundLink
                    href={operator.trackingUrl}
                    className="u-btn-primary rounded-lg px-4 py-2.5 text-center text-sm font-bold"
                  >
                    Visit site
                  </OutboundLink>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
