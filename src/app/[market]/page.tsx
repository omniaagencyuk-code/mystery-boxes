import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import heroImage from '../../../public/hero-mystery-box.png';
import { PlatformRankingCard } from '@/components/platform-ranking-card';
import { CheckIcon, ShieldIcon, ClockIcon, GlobeIcon } from '@/components/review/icons';
import { getCategoriesForMarket, getMarketPromoOffers } from '@/lib/data/content';
import { getVisibleOperatorsForMarket } from '@/lib/data/operators';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
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

const FEATURES = [
  { title: 'Independent reviews', sub: 'Unbiased and data driven', icon: ShieldIcon },
  { title: 'Verified offers', sub: 'Checked and kept current', icon: CheckIcon },
  { title: 'Transparent scoring', sub: 'Our rating system shows the full picture', icon: GlobeIcon },
  { title: 'Safe and responsible', sub: 'We promote safe play', icon: ClockIcon },
];

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted">
      <span className="text-success">
        <CheckIcon width={15} height={15} />
      </span>
      {children}
    </span>
  );
}

function HeroStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-ink sm:text-3xl">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
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

  // Real per-operator headline offer from the DB, for the ranking cards.
  const offerTitleByOperator = new Map<string, string>();
  for (const { operator, offer } of promo) {
    if (!offerTitleByOperator.has(operator.id)) offerTitleByOperator.set(operator.id, offer.title);
  }

  const topRated = operators.slice(0, 5);

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Find the best{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              mystery box websites
            </span>
          </h1>
          <p className="max-w-xl text-lg text-muted">
            Independent reviews, verified offers and real data to help you compare mystery box
            platforms available in the {MARKET_LABELS[marketCode]} before you spend anything.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={marketPath(marketCode, '/reviews')}
              className="u-btn-primary rounded-lg px-5 py-3 text-sm font-bold"
            >
              Browse reviews
            </Link>
            <Link
              href={marketPath(marketCode, '/compare')}
              className="rounded-lg border border-line px-5 py-3 text-sm font-bold text-ink hover:bg-elevated"
            >
              Compare sites
            </Link>
          </div>

          {/* Real database-driven statistics */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 pt-2">
            <HeroStat value={operators.length} label="Platforms reviewed" />
            <HeroStat value={categories.length} label="Categories" />
            <HeroStat value={promo.length} label="Verified offers" />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <TrustItem>Independent</TrustItem>
            <TrustItem>Verified offers</TrustItem>
            <TrustItem>Updated regularly</TrustItem>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Image
            src={heroImage}
            alt="A mystery box surrounded by prizes"
            priority
            sizes="(max-width: 1024px) 100vw, 512px"
            className="h-auto w-full max-w-lg drop-shadow-2xl"
          />
        </div>
      </section>

      {/* Top rated */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-ink">Top rated mystery box websites</h2>
          <Link
            href={marketPath(marketCode, '/reviews')}
            className="text-sm font-semibold text-accent hover:underline"
          >
            View all
          </Link>
        </div>

        {topRated.length === 0 ? (
          <p className="text-muted">We have nothing to show here for your region right now.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {topRated.map((op, i) => (
              <PlatformRankingCard
                key={op.id}
                operator={op}
                rank={i + 1}
                market={marketCode}
                offerTitle={offerTitleByOperator.get(op.id) ?? null}
                showCompare
              />
            ))}
          </div>
        )}
      </section>

      {/* Feature strip */}
      <section className="grid gap-4 rounded-2xl border border-line bg-surface/40 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-primary">
                <Icon width={20} height={20} />
              </span>
              <div>
                <div className="font-bold text-ink">{f.title}</div>
                <div className="text-sm text-muted">{f.sub}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Category chips */}
      {categories.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-ink">Browse by category</h2>
          <nav aria-label="Categories" className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={marketPath(marketCode, `/${cat.slug}`)}
                className="rounded-full border border-line bg-surface/50 px-4 py-1.5 text-sm text-muted hover:border-primary/40 hover:text-ink"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </section>
      )}
    </div>
  );
}
