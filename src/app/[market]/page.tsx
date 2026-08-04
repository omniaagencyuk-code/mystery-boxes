import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { OperatorCard } from '@/components/operator-card';
import { getCategoriesForMarket, getMarketPromoOffers } from '@/lib/data/content';
import { getVisibleOperatorsForMarket } from '@/lib/data/operators';
import { marketPath, isSupportedMarket, MARKET_LABELS, SUPPORTED_MARKETS, type MarketCode } from '@/lib/geo';
import { getRequestGeoContext } from '@/lib/request-context';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { market } = await params;
  if (!isSupportedMarket(market)) return {};
  return {
    title: `Mystery box reviews for the ${MARKET_LABELS[market]}`,
    description: `We compare and review mystery box operators available in the ${MARKET_LABELS[market]}.`,
    alternates: marketAlternates(market, ''),
  };
}

function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface/40 p-3">
      <div className="text-2xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

const FEATURES = [
  { title: 'Independent reviews', sub: 'We are not owned by any operator' },
  { title: 'Compliance shown', sub: '18+ and licence info where it applies' },
  { title: 'Region aware', sub: 'Separate UK and US listings' },
  { title: 'Kept current', sub: 'We update as offers change' },
];

function HeroArt() {
  return (
    <svg viewBox="0 0 220 200" className="h-auto w-full max-w-xs" aria-hidden role="img">
      <defs>
        <linearGradient id="boxg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--grad-from)" />
          <stop offset="1" stopColor="var(--grad-to)" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="var(--grad-from)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--grad-from)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="110" cy="90" r="90" fill="url(#glow)" />
      <polygon points="110,40 175,72 110,104 45,72" fill="url(#boxg)" opacity="0.9" />
      <polygon points="45,72 110,104 110,168 45,136" fill="url(#boxg)" opacity="0.6" />
      <polygon points="175,72 110,104 110,168 175,136" fill="url(#boxg)" opacity="0.75" />
      <text x="110" y="90" textAnchor="middle" fontSize="42" fontWeight="800" fill="#fff">?</text>
    </svg>
  );
}

export default async function MarketHomePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { market } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const { geoChain } = await getRequestGeoContext();
  const [operators, categories, promo] = await Promise.all([
    getVisibleOperatorsForMarket(marketCode, geoChain),
    getCategoriesForMarket(marketCode),
    getMarketPromoOffers(marketCode, geoChain),
  ]);

  const topRated = operators.slice(0, 5);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/50 px-3 py-1 text-xs font-semibold text-muted">
            Independent and ad supported
          </span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Find the best{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              mystery box
            </span>{' '}
            websites
          </h1>
          <p className="max-w-xl text-lg text-muted">
            We compare mystery box operators available in the {MARKET_LABELS[marketCode]}, read the
            small print, and show the compliance details so you can decide before you spend anything.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={marketPath(marketCode, '/compare')}
              className="u-btn-primary rounded-lg px-5 py-3 text-sm font-bold"
            >
              Compare platforms
            </Link>
            <Link
              href={marketPath(marketCode, '/reviews')}
              className="rounded-lg border border-line px-5 py-3 text-sm font-bold text-ink hover:bg-elevated"
            >
              Browse reviews
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="u-glass rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-center">
              <HeroArt />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatTile value={operators.length} label="Platforms listed" />
              <StatTile value={promo.length} label="Live offers" />
              <StatTile value={categories.length} label="Categories" />
              <StatTile value={SUPPORTED_MARKETS.length} label="Regions" />
              <StatTile value="100%" label="Independent" />
              <StatTile value="18+" label="Where it applies" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature band */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="u-glass flex items-start gap-3 rounded-xl p-4">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent" />
            <div>
              <div className="font-bold text-ink">{f.title}</div>
              <div className="text-sm text-muted">{f.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Category chips */}
      {categories.length > 0 && (
        <nav aria-label="Categories" className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={marketPath(marketCode, `/${cat.slug}`)}
              className="rounded-full border border-line px-4 py-1.5 text-sm text-muted hover:bg-elevated hover:text-ink"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      )}

      {/* Top rated */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">Top rated mystery box sites</h2>
          <Link
            href={marketPath(marketCode, '/compare')}
            className="text-sm font-semibold text-accent hover:underline"
          >
            Compare all
          </Link>
        </div>

        {topRated.length === 0 ? (
          <p className="text-muted">We have nothing to show here for your region right now.</p>
        ) : (
          <div className="grid gap-4">
            {topRated.map((op, i) => (
              <OperatorCard
                key={op.id}
                operator={op}
                market={marketCode}
                variant="full"
                rank={i + 1}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
