import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { MarketSwitchBanner } from '@/components/market-switch-banner';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { getMarketByCode } from '@/lib/data/markets';
import { getHeaderMenu, getFooterMenu } from '@/lib/data/menu';
import { isSupportedMarket, MARKET_LABELS, SUPPORTED_MARKETS, type MarketCode } from '@/lib/geo';
import { getRequestGeoContext } from '@/lib/request-context';

export default async function MarketLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ market: string }>;
}) {
  const { market } = await params;
  if (!isSupportedMarket(market)) notFound();

  // Confirm the market is active in the database, not just a known code.
  const record = await getMarketByCode(market);
  if (!record) notFound();

  const current = market as MarketCode;
  const other = SUPPORTED_MARKETS.find((m) => m !== current) as MarketCode;

  // Soft market suggestion, decided by the proxy from the visitor's IP. Absent
  // when there is no mismatch or the banner was dismissed.
  const [{ suggestSwitch }, menu, footerMenu] = await Promise.all([
    getRequestGeoContext(),
    getHeaderMenu(current),
    getFooterMenu(current),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      {suggestSwitch && suggestSwitch !== current && (
        <MarketSwitchBanner currentMarket={current} suggestMarket={suggestSwitch} />
      )}

      <SiteNav current={current} other={other} otherLabel={MARKET_LABELS[other]} menu={menu} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-12">{children}</main>

      <SiteFooter menu={footerMenu} />
    </div>
  );
}

export function generateStaticParams() {
  return SUPPORTED_MARKETS.map((market) => ({ market }));
}
