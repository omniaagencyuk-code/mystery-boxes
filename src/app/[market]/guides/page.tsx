import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { GuideList, type GuideListItem } from '@/components/guides/guide-list';
import { getGuidesForMarket } from '@/lib/data/content';
import { isSupportedMarket, marketPath, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { readMinutes } from '@/lib/guides/toc';
import { formatReviewDate } from '@/lib/reviews/format';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { market } = await params;
  if (!isSupportedMarket(market)) return {};
  return {
    title: 'Mystery box guides and resources',
    description: 'Plain-English guides to how mystery box websites work, the odds, safety and strategy.',
    alternates: marketAlternates(market, '/guides'),
  };
}

export default async function GuidesIndexPage({ params }: { params: Promise<Params> }) {
  const { market } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const guides = await getGuidesForMarket(marketCode);
  const items: GuideListItem[] = guides.map((g) => ({
    slug: g.slug.replace(/^guides\//, ''),
    title: g.title,
    summary: g.summary ?? g.meta_description,
    category: g.guide_category,
    heroUrl: g.hero_image_url,
    dateLabel: formatReviewDate(g.published_at),
    readMin: readMinutes(g.body),
  }));

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
          { name: 'Guides', path: marketPath(marketCode, '/guides') },
        ]}
      />
      <header className="max-w-2xl space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Mystery box guides and resources
        </h1>
        <p className="text-lg text-muted">
          Straightforward guides to how these sites work, how the odds add up, and how to stay safe.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-muted">No guides published yet.</p>
      ) : (
        <GuideList items={items} market={marketCode} />
      )}
    </div>
  );
}
