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

      <header className="u-glass sticky top-0 z-50 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href={`/${current}`} className="text-lg font-black tracking-tight text-ink">
              Mystery-Boxes.com
            </Link>
            <nav className="hidden gap-5 text-sm md:flex">
              <Link href={`/${current}`} className="text-muted hover:text-ink">
                Compare
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted sm:inline">{MARKET_LABELS[current]}</span>
            <Link
              href={`/${other}`}
              className="rounded-lg border border-line px-3 py-1.5 font-semibold text-ink hover:bg-elevated"
            >
              Switch to {MARKET_LABELS[other]}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-12">{children}</main>

      <footer className="border-t border-line bg-elevated/50 px-4 py-10 text-sm">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-lg font-black text-primary">Mystery-Boxes.com</div>
            <p className="text-xs text-muted">
              An independent comparison and review directory. We may earn a
              commission when you use the links on this site. This does not affect
              what we write. Marked #ad where relevant.
            </p>
          </div>
          <div className="space-y-2 text-muted">
            <div className="text-xs font-bold uppercase tracking-wider text-ink">Regions</div>
            <Link href={`/${current}`} className="block hover:text-ink">
              {MARKET_LABELS[current]}
            </Link>
            <Link href={`/${other}`} className="block hover:text-ink">
              {MARKET_LABELS[other]}
            </Link>
          </div>
          <div className="space-y-2 text-muted">
            <div className="text-xs font-bold uppercase tracking-wider text-ink">More</div>
            <Link href="/sitemap.xml" className="block hover:text-ink">
              Sitemap
            </Link>
            <p className="text-xs">
              Some listings are shown only to visitors in the region they are
              available in.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function generateStaticParams() {
  return SUPPORTED_MARKETS.map((market) => ({ market }));
}
