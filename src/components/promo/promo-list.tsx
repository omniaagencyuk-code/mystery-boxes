'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { CopyCode } from '@/components/promo/copy-code';
import { CheckIcon, ClockIcon } from '@/components/review/icons';
import { marketPath, type MarketCode } from '@/lib/geo';

export interface PromoItem {
  offerId: string;
  operatorSlug: string;
  operatorName: string;
  logoUrl: string | null;
  trackingUrl: string | null;
  title: string;
  description: string | null;
  code: string | null;
  eligibility: string | null;
  exclusive: boolean;
  stale: boolean;
  lastCheckedLabel: string | null;
}

type FilterKey = 'all' | 'code' | 'nocode' | 'exclusive';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All offers' },
  { key: 'code', label: 'With promo code' },
  { key: 'nocode', label: 'No code required' },
  { key: 'exclusive', label: 'Exclusive' },
];

function matches(item: PromoItem, filter: FilterKey): boolean {
  switch (filter) {
    case 'code':
      return Boolean(item.code);
    case 'nocode':
      return !item.code;
    case 'exclusive':
      return item.exclusive;
    default:
      return true;
  }
}

function PromoRow({ item, market }: { item: PromoItem; market: MarketCode }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface/60 p-5 sm:flex-row sm:items-center">
      {/* Logo */}
      <div className="flex h-14 w-28 shrink-0 items-center justify-center rounded-xl border border-line bg-elevated">
        {item.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary logo hosts
          <img src={item.logoUrl} alt={`${item.operatorName} logo`} className="max-h-9 w-auto max-w-[80%] object-contain" />
        ) : (
          <span className="px-2 text-center text-sm font-bold text-ink">{item.operatorName}</span>
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-ink">{item.title}</span>
          {item.exclusive && (
            <span className="rounded-md border border-success/40 bg-success/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
              Exclusive
            </span>
          )}
        </div>
        {item.description && <p className="text-sm text-muted">{item.description}</p>}
        {item.eligibility && <p className="text-xs text-muted">{item.eligibility}</p>}
        <div className="flex items-center gap-1.5 pt-0.5 text-xs">
          {item.stale ? (
            <span className="inline-flex items-center gap-1 text-warning">
              <ClockIcon width={12} height={12} /> Confirm on site
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-success">
              <CheckIcon width={12} height={12} /> Verified
              {item.lastCheckedLabel ? ` ${item.lastCheckedLabel}` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-52">
        {item.code ? (
          <CopyCode code={item.code} />
        ) : (
          <span className="rounded-lg border border-line bg-elevated px-3 py-2 text-center text-sm text-muted">
            No code required
          </span>
        )}
        {item.trackingUrl && (
          <a
            href={item.trackingUrl}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="rounded-lg bg-success px-4 py-2 text-center text-sm font-bold text-[#04120a] transition-[filter] hover:brightness-105"
          >
            Claim offer
          </a>
        )}
        <div className="flex items-center justify-center gap-3 text-xs">
          <Link href={marketPath(market, `/promo-codes/${item.operatorSlug}`)} className="font-semibold text-accent hover:underline">
            View offer
          </Link>
          <Link href={marketPath(market, `/reviews/${item.operatorSlug}`)} className="text-muted hover:text-ink">
            Read review
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Client-side filterable list of promo offers. The full list is server-rendered
 * on first paint (so it is indexable); filters only toggle which cards show.
 * Filters are derived from real offer attributes, never invented categories.
 */
export function PromoList({ items, market }: { items: PromoItem[]; market: MarketCode }) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const shown = useMemo(() => items.filter((i) => matches(i, filter)), [items, filter]);

  const available = FILTERS.filter(
    (f) => f.key === 'all' || items.some((i) => matches(i, f.key)),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter offers">
        {available.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? 'border-primary bg-primary/15 text-ink'
                  : 'border-line text-muted hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="text-muted">No offers match this filter right now.</p>
      ) : (
        <div className="grid gap-4">
          {shown.map((item) => (
            <PromoRow key={item.offerId} item={item} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
