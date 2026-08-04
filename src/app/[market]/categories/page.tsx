import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { getCategoriesForMarket } from '@/lib/data/content';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { market } = await params;
  if (!isSupportedMarket(market)) return {};
  return {
    title: 'Types of mystery box',
    description: `Browse mystery box types and categories for the ${MARKET_LABELS[market]}.`,
    alternates: marketAlternates(market, '/categories'),
  };
}

export default async function CategoriesHubPage({ params }: { params: Promise<Params> }) {
  const { market } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const categories = await getCategoriesForMarket(marketCode);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
          { name: 'Categories', path: marketPath(marketCode, '/categories') },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Types of mystery box</h1>
        <p className="text-muted">Browse operators by the kind of box they run.</p>
      </header>

      {categories.length === 0 ? (
        <p className="text-muted">No categories yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={marketPath(marketCode, `/${cat.slug}`)}
              className="u-glass group rounded-xl p-5"
            >
              <h2 className="font-bold text-ink group-hover:text-primary">{cat.name}</h2>
              {cat.description && <p className="mt-1 text-sm text-muted">{cat.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
