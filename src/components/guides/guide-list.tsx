'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { marketPath, type MarketCode } from '@/lib/geo';

export interface GuideListItem {
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  heroUrl: string | null;
  dateLabel: string | null;
  readMin: number;
}

export function GuideList({ items, market }: { items: GuideListItem[]; market: MarketCode }) {
  // Category filters, derived from the categories that actually exist.
  const categories = useMemo(() => {
    const set: string[] = [];
    for (const g of items) if (g.category && !set.includes(g.category)) set.push(g.category);
    return set;
  }, [items]);

  const [active, setActive] = useState<string>('all');
  const shown = active === 'all' ? items : items.filter((g) => g.category === active);

  return (
    <div className="space-y-6">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter guides">
          {['all', ...categories].map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(cat)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  isActive ? 'border-primary bg-primary/15 text-ink' : 'border-line text-muted hover:text-ink'
                }`}
              >
                {cat === 'all' ? 'All guides' : cat}
              </button>
            );
          })}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-muted">No guides in this category yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((g) => (
            <Link
              key={g.slug}
              href={marketPath(market, `/guides/${g.slug}`)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface/60 transition-colors hover:border-primary/40"
            >
              <div className="relative aspect-[16/9] w-full bg-elevated">
                {g.heroUrl ? (
                  <Image src={g.heroUrl} alt="" fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted">
                    <span className="text-sm">Guide</span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                {g.category && (
                  <span className="w-fit rounded-md border border-line bg-elevated px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                    {g.category}
                  </span>
                )}
                <h2 className="font-bold text-ink group-hover:text-primary">{g.title}</h2>
                {g.summary && <p className="line-clamp-2 text-sm text-muted">{g.summary}</p>}
                <div className="mt-auto flex items-center gap-2 pt-1 text-xs text-muted">
                  {g.dateLabel && <span>{g.dateLabel}</span>}
                  {g.dateLabel && <span aria-hidden>·</span>}
                  <span>{g.readMin} min read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
