'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { OutboundLink } from '@/components/outbound-link';
import { Rating } from '@/components/rating';
import type { ComparisonCategory, ComparisonRow } from '@/lib/data/home-comparison';

type Sort = 'recommended' | 'highest' | 'lowest' | 'alpha' | 'updated';

const SORTS: { value: Sort; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
  { value: 'alpha', label: 'Alphabetical' },
  { value: 'updated', label: 'Recently updated' },
];

const selectCls =
  'w-full rounded-lg border border-line bg-elevated px-3 py-2 text-sm text-ink focus-visible:border-primary focus-visible:outline-none';
const labelCls = 'mb-1 block text-xs font-medium text-muted';

function Logo({ row }: { row: ComparisonRow }) {
  if (!row.logoUrl) {
    return (
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-line bg-elevated text-xs font-bold text-muted">
        {row.name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <span className="relative h-10 w-10 flex-none overflow-hidden rounded-lg border border-line bg-elevated">
      <Image src={row.logoUrl} alt={`${row.name} logo`} fill sizes="40px" className="object-contain p-1" loading="lazy" />
    </span>
  );
}

function Label({ row }: { row: ComparisonRow }) {
  const text = row.tableLabel ?? (row.recommended ? 'Recommended' : null);
  if (!text) return null;
  return (
    <span className="mt-0.5 inline-block rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
      {text}
    </span>
  );
}

function ScoreCell({ row }: { row: ComparisonRow }) {
  if (row.rating == null) return <span className="text-sm text-muted">Not yet rated</span>;
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="text-base font-bold text-ink">{row.rating.toFixed(1)}</span>
        <Rating value={row.rating} />
      </div>
      {row.ratingLabel && <span className="text-xs text-muted">{row.ratingLabel}</span>}
    </div>
  );
}

function Payments({ methods }: { methods: string[] }) {
  if (methods.length === 0) return <span className="text-sm text-muted">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {methods.slice(0, 4).map((m) => (
        <span key={m} className="rounded border border-line bg-elevated px-1.5 py-0.5 text-[11px] text-muted">
          {m}
        </span>
      ))}
    </div>
  );
}

function VisitButton({ row }: { row: ComparisonRow }) {
  if (!row.cta) {
    return row.reviewHref ? (
      <Link href={row.reviewHref} className="inline-flex items-center justify-center rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-elevated">
        Read Review
      </Link>
    ) : null;
  }
  return (
    <OutboundLink
      href={row.cta.href}
      data-placement="home_table"
      className="u-btn-primary inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-bold"
    >
      Visit Site
    </OutboundLink>
  );
}

export function HomeComparison({ rows, categories }: { rows: ComparisonRow[]; categories: ComparisonCategory[] }) {
  const [tab, setTab] = useState<string>('all');
  const [minRating, setMinRating] = useState('');
  const [offerOnly, setOfferOnly] = useState('');
  const [payment, setPayment] = useState('');
  const [sort, setSort] = useState<Sort>('recommended');

  const paymentOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.paymentMethods.forEach((m) => set.add(m)));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const out = rows.filter((r) => {
      if (tab !== 'all' && !r.categories.some((c) => c.slug === tab)) return false;
      if (minRating && (r.rating == null || r.rating < Number(minRating))) return false;
      if (offerOnly === 'yes' && !r.offerTitle) return false;
      if (payment && !r.paymentMethods.includes(payment)) return false;
      return true;
    });
    const byName = (a: ComparisonRow, b: ComparisonRow) => a.name.localeCompare(b.name);
    switch (sort) {
      case 'highest':
        return out.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || byName(a, b));
      case 'lowest':
        return out.sort((a, b) => (a.rating ?? 99) - (b.rating ?? 99) || byName(a, b));
      case 'alpha':
        return out.sort(byName);
      case 'updated':
        return out.sort((a, b) => (b.updatedISO ? Date.parse(b.updatedISO) : 0) - (a.updatedISO ? Date.parse(a.updatedISO) : 0));
      default:
        return out.sort((a, b) => Number(b.recommended) - Number(a.recommended)); // stable: keeps server position order
    }
  }, [rows, tab, minRating, offerOnly, payment, sort]);

  const reset = () => {
    setTab('all');
    setMinRating('');
    setOfferOnly('');
    setPayment('');
    setSort('recommended');
  };
  const hasFilters = tab !== 'all' || minRating || offerOnly || payment || sort !== 'recommended';

  return (
    <section aria-label="Compare mystery box platforms" className="space-y-4">
      {/* Category tabs */}
      <div role="tablist" aria-label="Categories" className="flex flex-wrap gap-2">
        {[{ slug: 'all', name: 'All Sites' }, ...categories].map((c) => {
          const active = tab === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(c.slug)}
              className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
                active ? 'border-primary bg-primary text-onprimary' : 'border-line text-muted hover:text-ink'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Filter row */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-line bg-surface/40 p-4 sm:grid-cols-4">
        <div>
          <label className={labelCls} htmlFor="f-rating">Minimum rating</label>
          <select id="f-rating" className={selectCls} value={minRating} onChange={(e) => setMinRating(e.target.value)}>
            <option value="">All ratings</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="f-offer">Welcome offer</label>
          <select id="f-offer" className={selectCls} value={offerOnly} onChange={(e) => setOfferOnly(e.target.value)}>
            <option value="">All platforms</option>
            <option value="yes">Has welcome offer</option>
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="f-pay">Payment methods</label>
          <select id="f-pay" className={selectCls} value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="">All methods</option>
            {paymentOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="f-sort">Sort by</label>
          <select id="f-sort" className={selectCls} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-4">
          <p className="text-sm text-muted" role="status" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'platform' : 'platforms'}
          </p>
          {hasFilters && (
            <button type="button" onClick={reset} className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted hover:text-ink">
              Reset filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-muted">
          No platforms match these filters. Try Reset filters.
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-line md:block">
            <table className="w-full min-w-[880px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th scope="col" className="px-4 py-3 font-semibold">#</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Platform</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Our Rating</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Welcome Offer</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Payments</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Review</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Visit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.operatorId} className="border-b border-line last:border-0 hover:bg-surface/40">
                    <td className="px-4 py-4 font-bold text-muted">{i + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Logo row={row} />
                        <div>
                          {row.reviewHref ? (
                            <Link href={row.reviewHref} className="font-semibold text-ink hover:text-primary">{row.name}</Link>
                          ) : (
                            <span className="font-semibold text-ink">{row.name}</span>
                          )}
                          <Label row={row} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {row.primaryCategory ? (
                        <span className="rounded-md border border-line px-2 py-0.5 text-xs text-muted">{row.primaryCategory.name}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4"><ScoreCell row={row} /></td>
                    <td className="px-4 py-4 text-muted">{row.offerTitle ?? <span className="text-muted">—</span>}</td>
                    <td className="px-4 py-4"><Payments methods={row.paymentMethods} /></td>
                    <td className="px-4 py-4">
                      {row.reviewHref ? (
                        <Link href={row.reviewHref} className="font-semibold text-accent hover:underline">Read Review</Link>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4"><VisitButton row={row} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {filtered.map((row, i) => (
              <li key={row.operatorId} className="rounded-2xl border border-line bg-surface/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted">{i + 1}</span>
                    <Logo row={row} />
                    <div>
                      {row.reviewHref ? (
                        <Link href={row.reviewHref} className="font-semibold text-ink">{row.name}</Link>
                      ) : (
                        <span className="font-semibold text-ink">{row.name}</span>
                      )}
                      {row.primaryCategory && <span className="block text-xs text-muted">{row.primaryCategory.name}</span>}
                    </div>
                  </div>
                  <ScoreCell row={row} />
                </div>
                {row.offerTitle && <p className="mt-3 text-sm text-success">{row.offerTitle}</p>}
                {row.paymentMethods.length > 0 && (
                  <div className="mt-3"><Payments methods={row.paymentMethods} /></div>
                )}
                <div className="mt-4 flex items-center gap-3">
                  <VisitButton row={row} />
                  {row.reviewHref && (
                    <Link href={row.reviewHref} className="text-sm font-semibold text-accent hover:underline">Read Review</Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
