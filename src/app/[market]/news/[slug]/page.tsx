import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { getPostForMarket } from '@/lib/data/content';
import { createServerSupabase } from '@/lib/supabase/server';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { market, slug } = await params;
  if (!isSupportedMarket(market)) return {};
  const alternates = marketAlternates(market, `/news/${slug}`);
  const post = await getPostForMarket(market, slug);
  if (!post) return { alternates };
  return {
    title: post.title,
    description: post.meta_description ?? post.excerpt ?? undefined,
    alternates,
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { market, slug } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const post = await getPostForMarket(marketCode, slug);
  if (!post) notFound();

  let coverUrl: string | null = null;
  if (post.cover_media_id) {
    const supabase = await createServerSupabase();
    const { data } = await supabase.from('media').select('url').eq('id', post.cover_media_id).maybeSingle();
    coverUrl = data?.url ?? null;
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
          { name: 'News', path: marketPath(marketCode, '/news') },
          { name: post.title, path: marketPath(marketCode, `/news/${post.slug}`) },
        ]}
      />

      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{post.title}</h1>
        <div className="text-sm text-muted">
          {post.author ? `By ${post.author}` : ''}
          {post.published_at ? ` · ${new Date(post.published_at).toLocaleDateString()}` : ''}
        </div>
      </header>

      {coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" className="w-full rounded-xl border border-line object-cover" />
      )}

      {post.body && (
        <div className="space-y-4 leading-relaxed text-ink/90">
          {post.body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}
    </article>
  );
}
