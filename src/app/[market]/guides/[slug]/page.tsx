import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Markdown } from '@/components/markdown';
import { getGuidesForMarket, getPageForMarket } from '@/lib/data/content';
import { isSupportedMarket, marketPath, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { guideToc, readMinutes } from '@/lib/guides/toc';
import { formatReviewDate } from '@/lib/reviews/format';
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
    description: page.summary ?? page.meta_description ?? undefined,
    alternates,
  };
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { market, slug } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const page = await getPageForMarket(marketCode, `guides/${slug}`);
  if (!page) notFound();

  const toc = guideToc(page.body);
  const readMin = readMinutes(page.body);
  const published = formatReviewDate(page.published_at);
  const updated = formatReviewDate(page.updated_at);

  const allGuides = await getGuidesForMarket(marketCode);
  const related = allGuides.filter((g) => g.slug !== page.slug).slice(0, 3);

  return (
    <div className="space-y-10">
      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
          { name: 'Guides', path: marketPath(marketCode, '/guides') },
          { name: page.title, path: marketPath(marketCode, `/guides/${slug}`) },
        ]}
      />

      <header className="max-w-3xl space-y-4">
        {page.guide_category && (
          <span className="inline-block rounded-md border border-line bg-elevated px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent">
            {page.guide_category}
          </span>
        )}
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
          {page.title}
        </h1>
        {(page.summary ?? page.meta_description) && (
          <p className="text-lg text-muted">{page.summary ?? page.meta_description}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {page.author && <span className="text-ink">{page.author}</span>}
          {page.author && <span aria-hidden>·</span>}
          {published && <span>{published}</span>}
          {published && <span aria-hidden>·</span>}
          <span>{readMin} min read</span>
        </div>
      </header>

      {page.hero_image_url && (
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-line">
          <Image
            src={page.hero_image_url}
            alt={`${page.title} illustration`}
            fill
            sizes="(max-width: 1280px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Table of contents */}
        {toc.length > 2 ? (
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-6 space-y-2 text-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-muted">On this page</div>
              <ul className="space-y-1.5">
                {toc.map((item) => (
                  <li key={item.id} className={item.depth === 3 ? 'pl-3' : ''}>
                    <a href={`#${item.id}`} className="text-muted hover:text-ink">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        ) : (
          <div className="hidden lg:block" />
        )}

        {/* Body */}
        <article className="min-w-0 max-w-3xl">
          {page.body && <Markdown>{page.body}</Markdown>}
          {updated && (
            <p className="mt-8 border-t border-line pt-4 text-sm text-muted">Last updated {updated}</p>
          )}
        </article>
      </div>

      {/* Related guides */}
      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-ink">More guides</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((g) => {
              const tail = g.slug.replace(/^guides\//, '');
              return (
                <Link
                  key={g.slug}
                  href={marketPath(marketCode, `/guides/${tail}`)}
                  className="group rounded-2xl border border-line bg-surface/60 p-4 transition-colors hover:border-primary/40"
                >
                  {g.guide_category && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-accent">
                      {g.guide_category}
                    </span>
                  )}
                  <div className="mt-1 font-bold text-ink group-hover:text-primary">{g.title}</div>
                  {(g.summary ?? g.meta_description) && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{g.summary ?? g.meta_description}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
