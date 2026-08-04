import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { getGuidesForMarket } from '@/lib/data/content';
import { isSupportedMarket, marketPath, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { market } = await params;
  if (!isSupportedMarket(market)) return {};
  return {
    title: 'Mystery box guides',
    description: 'Plain-English guides to how mystery box websites work and how to stay safe.',
    alternates: marketAlternates(market, '/guides'),
  };
}

export default async function GuidesIndexPage({ params }: { params: Promise<Params> }) {
  const { market } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const guides = await getGuidesForMarket(marketCode);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
          { name: 'Guides', path: marketPath(marketCode, '/guides') },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Mystery box guides</h1>
        <p className="text-muted">
          Straightforward guides to how these sites work, how the odds add up, and how to avoid the
          traps.
        </p>
      </header>

      {guides.length === 0 ? (
        <p className="text-muted">No guides published yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {guides.map((g) => {
            const tail = g.slug.replace(/^guides\//, '');
            return (
              <Link
                key={g.slug}
                href={marketPath(marketCode, `/guides/${tail}`)}
                className="u-glass group rounded-xl p-5"
              >
                <h2 className="font-bold text-ink group-hover:text-primary">{g.title}</h2>
                {g.meta_description && (
                  <p className="mt-1 text-sm text-muted">{g.meta_description}</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
