import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { getPublishedPostsForMarket } from '@/lib/data/content';
import { createServerSupabase } from '@/lib/supabase/server';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { market } = await params;
  if (!isSupportedMarket(market)) return {};
  return {
    title: 'News and guides',
    description: `The latest mystery box news and guides for the ${MARKET_LABELS[market]}.`,
    alternates: marketAlternates(market, '/news'),
  };
}

export default async function NewsIndexPage({ params }: { params: Promise<Params> }) {
  const { market } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const posts = await getPublishedPostsForMarket(marketCode);

  // Resolve cover images in one query.
  const coverIds = posts.map((p) => p.cover_media_id).filter((v): v is string => Boolean(v));
  const coverUrl = new Map<string, string>();
  if (coverIds.length > 0) {
    const supabase = await createServerSupabase();
    const { data } = await supabase.from('media').select('id, url').in('id', coverIds);
    for (const m of data ?? []) if (m.url) coverUrl.set(m.id, m.url);
  }

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
          { name: 'News', path: marketPath(marketCode, '/news') },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">News and guides</h1>
        <p className="text-muted">The latest on mystery boxes, updates and how-tos.</p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted">Nothing published yet. Check back soon.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const cover = post.cover_media_id ? coverUrl.get(post.cover_media_id) : null;
            return (
              <Link
                key={post.id}
                href={marketPath(marketCode, `/news/${post.slug}`)}
                className="u-glass group flex flex-col overflow-hidden rounded-xl"
              >
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-elevated" />
                )}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h2 className="font-bold text-ink group-hover:text-primary">{post.title}</h2>
                  {post.excerpt && <p className="line-clamp-3 text-sm text-muted">{post.excerpt}</p>}
                  <div className="mt-auto text-xs text-muted">
                    {post.author ? `By ${post.author}` : ''}
                    {post.published_at
                      ? ` · ${new Date(post.published_at).toLocaleDateString()}`
                      : ''}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
