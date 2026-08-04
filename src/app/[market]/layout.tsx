import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { MarketSwitchBanner } from '@/components/market-switch-banner';
import { SiteNav } from '@/components/site-nav';
import { getCategoriesForMarket } from '@/lib/data/content';
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
  const [{ suggestSwitch }, categories] = await Promise.all([
    getRequestGeoContext(),
    getCategoriesForMarket(current),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      {suggestSwitch && suggestSwitch !== current && (
        <MarketSwitchBanner currentMarket={current} suggestMarket={suggestSwitch} />
      )}

      <SiteNav
        current={current}
        other={other}
        otherLabel={MARKET_LABELS[other]}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-12">{children}</main>

      <footer className="border-t border-line bg-elevated/50 px-4 py-10 text-sm">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-2 sm:col-span-2 md:col-span-1">
            <div className="text-lg font-black text-primary">Mystery-Boxes.com</div>
            <p className="text-xs text-muted">
              An independent comparison and review directory. We may earn a
              commission when you use the links on this site. This does not affect
              what we write. Marked #ad where relevant.
            </p>
          </div>
          <div className="space-y-2 text-muted">
            <div className="text-xs font-bold uppercase tracking-wider text-ink">Explore</div>
            <Link href={`/${current}/reviews`} className="block hover:text-ink">Reviews</Link>
            <Link href={`/${current}/compare`} className="block hover:text-ink">Compare</Link>
            <Link href={`/${current}/promo-codes`} className="block hover:text-ink">Promo codes</Link>
            <Link href={`/${current}/categories`} className="block hover:text-ink">Categories</Link>
            <Link href={`/${current}/news`} className="block hover:text-ink">News</Link>
          </div>
          <div className="space-y-2 text-muted">
            <div className="text-xs font-bold uppercase tracking-wider text-ink">Regions</div>
            <Link href={`/${current}`} className="block hover:text-ink">{MARKET_LABELS[current]}</Link>
            <Link href={`/${other}`} className="block hover:text-ink">{MARKET_LABELS[other]}</Link>
          </div>
          <div className="space-y-2 text-muted">
            <div className="text-xs font-bold uppercase tracking-wider text-ink">More</div>
            <Link href="/sitemap.xml" className="block hover:text-ink">Sitemap</Link>
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
