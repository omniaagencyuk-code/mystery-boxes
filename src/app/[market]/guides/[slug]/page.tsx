import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Markdown } from '@/components/markdown';
import { getPageForMarket } from '@/lib/data/content';
import { isSupportedMarket, marketPath, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { market, slug } = await params;
  if (!isSupportedMarket(market)) return {};
  const alternates = marketAlternates(market, `/guides/${slug}`);
  const page = await getPageForMarket(market, `guides/${slug}`);
  if (!page) return { alternates };
  return {
    title: page.title,
    description: page.meta_description ?? undefined,
    alternates,
  };
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { market, slug } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  // Guides are pages whose slug is prefixed with guides/.
  const page = await getPageForMarket(marketCode, `guides/${slug}`);
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
          { name: 'Guides', path: marketPath(marketCode, '/guides') },
          { name: page.title, path: marketPath(marketCode, `/guides/${slug}`) },
        ]}
      />
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{page.title}</h1>
      </header>
      {page.body && <Markdown>{page.body}</Markdown>}
    </article>
  );
}
