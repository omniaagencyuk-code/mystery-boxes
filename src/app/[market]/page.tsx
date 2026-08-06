import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { FaqAccordion } from '@/components/faq-accordion';
import { HomeArticle } from '@/components/home/home-article';
import { HomeComparison } from '@/components/home/home-comparison';
import { JsonLd } from '@/components/json-ld';
import { CheckIcon } from '@/components/review/icons';
import { getHomeComparison } from '@/lib/data/home-comparison';
import { getHomepageArticle, getHomepageConfig } from '@/lib/data/homepage';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { absoluteUrl, faqJsonLd, marketAlternates } from '@/lib/seo';

type Params = { market: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
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

export default async function MarketHomePage({ params }: { params: Promise<Params> }) {
  const { market } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const [config, article, comparison] = await Promise.all([
    getHomepageConfig(marketCode),
    getHomepageArticle(marketCode),
    getHomeComparison(marketCode),
  ]);
  const { settings, trustIndicators, faqs } = config;

  return (
    <div className="space-y-12">
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs.map((f) => ({ question: f.question, answer: f.answer })))} />}

      {/* 1. Editable H1 + introduction + optional trust points (no hero image) */}
      <header className="mx-auto max-w-3xl space-y-4 text-center">
        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          {settings.heroTitle}
        </h1>
        <p className="text-lg text-muted">{settings.heroIntro}</p>
        {trustIndicators.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-1">
            {trustIndicators.map((t, i) => (
              <TrustItem key={i}>{t}</TrustItem>
            ))}
          </div>
        )}
      </header>

      {/* 2. Category tabs + filters + comparison table (shared platform data) */}
      <HomeComparison rows={comparison.rows} categories={comparison.categories} />

      {/* 3. Editable SEO body content with insertable platform cards */}
      {article.length > 0 && (
        <div className="mx-auto max-w-3xl">
          <HomeArticle blocks={article} />
        </div>
      )}

      {/* 4. Optional FAQ */}
      {faqs.length > 0 && (
        <section aria-labelledby="home-faq" className="mx-auto max-w-3xl space-y-4">
          <h2 id="home-faq" className="text-2xl font-bold text-ink">
            Frequently asked questions
          </h2>
          <FaqAccordion items={faqs} />
        </section>
      )}
    </div>
  );
}
