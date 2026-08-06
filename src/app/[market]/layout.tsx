import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { getMarketByCode } from '@/lib/data/markets';
import { getHeaderMenu, getFooterMenu } from '@/lib/data/menu';
import { isSupportedMarket, SUPPORTED_MARKETS, type MarketCode } from '@/lib/geo';

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

  const [menu, footerMenu] = await Promise.all([
    getHeaderMenu(current),
    getFooterMenu(current),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <SiteNav current={current} menu={menu} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-12">{children}</main>

      <SiteFooter menu={footerMenu} />
    </div>
  );
}

export function generateStaticParams() {
  return SUPPORTED_MARKETS.map((market) => ({ market }));
}
