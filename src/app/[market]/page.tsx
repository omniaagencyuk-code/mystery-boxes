import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import heroFallback from '../../../public/hero-mystery-box.png';
import { HomeSections, type HomeData } from '@/components/home/home-sections';
import { CheckIcon } from '@/components/review/icons';
import { getCategoriesForMarket, getGuidesForMarket, getMarketPromoOffers } from '@/lib/data/content';
import {
  getFeaturedOperatorsForMarket,
  getHomepageConfig,
  getLatestReviewedOperators,
} from '@/lib/data/homepage';
import { getVisibleOperatorsForMarket } from '@/lib/data/operators';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { offerState } from '@/lib/reviews/offer-state';
import { getRequestGeoContext } from '@/lib/request-context';
import { absoluteUrl, marketAlternates } from '@/lib/seo';

type Params = { market: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { market } = await params;
  if (!isSupportedMarket(market)) return {};
  const marketCode = market as MarketCode;

  const { settings } = await getHomepageConfig(marketCode);
  const alternates = marketAlternates(marketCode, '');
  if (settings.canonicalUrl) alternates.canonical = settings.canonicalUrl;

  const title = settings.seoTitle || `Mystery box reviews for the ${MARKET_LABELS[marketCode]}`;
  const description =
    settings.metaDescription ||
    `We compare and review mystery box operators available in the ${MARKET_LABELS[marketCode]}.`;

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: (alternates.canonical as string) ?? absoluteUrl(marketPath(marketCode)),
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl }] } : {}),
    },
  };
}

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
  const [config, operators, categories, promo, guides, latestReviewed, featured] = await Promise.all([
    getHomepageConfig(marketCode),
    getVisibleOperatorsForMarket(marketCode, geoChain),
    getCategoriesForMarket(marketCode),
    getMarketPromoOffers(marketCode, geoChain),
    getGuidesForMarket(marketCode),
    getLatestReviewedOperators(marketCode, geoChain, 5),
    getFeaturedOperatorsForMarket(marketCode, geoChain),
  ]);

  const now = new Date();
  const usableOffers = promo.filter(({ offer }) => offerState(offer, now).usable);
  const offerTitleByOperator: Record<string, string> = {};
  for (const { operator, offer } of usableOffers) {
    if (!(operator.id in offerTitleByOperator)) offerTitleByOperator[operator.id] = offer.title;
  }

  const data: HomeData = {
    market: marketCode,
    operators,
    categories: categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name })),
    offers: usableOffers,
    offerTitleByOperator,
    guides,
    latestReviewed,
    featured,
  };

  const { settings, trustIndicators } = config;

  return (
    <div className="space-y-14">
      {/* Hero (CMS driven, always shown) */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            {settings.heroTitle}
          </h1>
          <p className="max-w-xl text-lg text-muted">{settings.heroIntro}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={settings.ctaPrimaryHref} className="u-btn-primary rounded-lg px-5 py-3 text-sm font-bold">
              {settings.ctaPrimaryLabel}
            </Link>
            <Link
              href={settings.ctaSecondaryHref}
              className="rounded-lg border border-line px-5 py-3 text-sm font-bold text-ink hover:bg-elevated"
            >
              {settings.ctaSecondaryLabel}
            </Link>
          </div>

          {/* Real database-driven statistics */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 pt-2">
            <HeroStat value={operators.length} label="Platforms reviewed" />
            <HeroStat value={categories.length} label="Categories" />
            <HeroStat value={usableOffers.length} label="Verified offers" />
          </div>

          {trustIndicators.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {trustIndicators.map((t, i) => (
                <TrustItem key={i}>{t}</TrustItem>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center">
          {settings.heroImageUrl ? (
            <div className="relative aspect-[4/3] w-full max-w-lg">
              <Image
                src={settings.heroImageUrl}
                alt="Mystery box hero"
                fill
                sizes="(max-width: 1024px) 100vw, 512px"
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          ) : (
            <Image
              src={heroFallback}
              alt="A mystery box surrounded by prizes"
              priority
              sizes="(max-width: 1024px) 100vw, 512px"
              className="h-auto w-full max-w-lg drop-shadow-2xl"
            />
          )}
        </div>
      </section>

      {/* Modular CMS sections, in the configured order */}
      <HomeSections config={config} data={data} />
    </div>
  );
}
