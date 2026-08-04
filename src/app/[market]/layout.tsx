import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { MarketSwitchBanner } from '@/components/market-switch-banner';
import { getMarketByCode } from '@/lib/data/markets';
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
  const { suggestSwitch } = await getRequestGeoContext();

  return (
    <div className="flex min-h-full flex-col">
      {suggestSwitch && suggestSwitch !== current && (
        <MarketSwitchBanner currentMarket={current} suggestMarket={suggestSwitch} />
      )}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href={`/${current}`} className="font-semibold">
            Mystery Boxes
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {MARKET_LABELS[current]}
            </span>
            <Link href={`/${other}`} className="hover:underline">
              Switch to {MARKET_LABELS[other]}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>

      <footer className="border-t border-gray-200 px-4 py-6 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <div className="mx-auto max-w-5xl space-y-2">
          <p>
            We may earn a commission when you use the links on this site. This
            does not affect what we write. Marked #ad where relevant.
          </p>
          <p>
            Some listings are shown only to visitors in the region they are
            available in.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function generateStaticParams() {
  return SUPPORTED_MARKETS.map((market) => ({ market }));
}
