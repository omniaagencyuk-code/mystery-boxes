'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { CheckIcon, XIcon } from '@/components/review/icons';
import type { ComparePlatform } from '@/lib/data/compare';
import { marketPath, type MarketCode } from '@/lib/geo';
import { formatReviewDate } from '@/lib/reviews/format';
import { formatScore, ratingDescriptor } from '@/lib/reviews/scoring';

const MAX = 4;

function ScoreCell({ platform }: { platform: ComparePlatform }) {
  const d = ratingDescriptor(platform.score);
  return (
    <div>
      <span className="text-lg font-extrabold text-star">{formatScore(platform.score) ?? '--'}</span>
      {d && <span className="ml-1 text-xs text-muted">{d}</span>}
    </div>
  );
}

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-success">
      <CheckIcon width={16} height={16} /> Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-muted">
      <XIcon width={16} height={16} /> No
    </span>
  );
}

const DASH = <span className="text-muted">--</span>;

export function CompareTool({
  platforms,
  market,
  initialSlugs,
}: {
  platforms: ComparePlatform[];
  market: MarketCode;
  initialSlugs: string[];
}) {
  const bySlug = useMemo(() => new Map(platforms.map((p) => [p.slug, p])), [platforms]);

  const validInitial = initialSlugs.filter((s) => bySlug.has(s)).slice(0, MAX);
  const defaults = platforms.slice(0, Math.min(MAX, platforms.length)).map((p) => p.slug);
  const [selected, setSelected] = useState<string[]>(validInitial.length ? validInitial : defaults);
  const [copied, setCopied] = useState(false);

  const chosen = selected.map((s) => bySlug.get(s)).filter((p): p is ComparePlatform => Boolean(p));
  const available = platforms.filter((p) => !selected.includes(p.slug));

  function syncUrl(next: string[]) {
    const qs = next.length ? `?ids=${next.join(',')}` : '';
    window.history.replaceState(null, '', `${window.location.pathname}${qs}`);
  }
  function setAndSync(next: string[]) {
    setSelected(next);
    syncUrl(next);
  }
  const add = (slug: string) => {
    if (selected.length >= MAX || selected.includes(slug)) return;
    setAndSync([...selected, slug]);
  };
  const remove = (slug: string) => setAndSync(selected.filter((s) => s !== slug));
  const clear = () => setAndSync([]);
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  }

  // Union of rating-breakdown labels across the chosen platforms, in first-seen order.
  const scoreLabels: string[] = [];
  for (const p of chosen) for (const label of Object.keys(p.scores)) if (!scoreLabels.includes(label)) scoreLabels.push(label);

  const rows: { label: string; render: (p: ComparePlatform) => React.ReactNode }[] = [
    { label: 'Overall rating', render: (p) => <ScoreCell platform={p} /> },
    ...scoreLabels.map((label) => ({
      label,
      render: (p: ComparePlatform) =>
        label in p.scores ? <span className="font-semibold text-ink">{formatScore(p.scores[label])}</span> : DASH,
    })),
    { label: 'Welcome offer', render: (p) => (p.offerTitle ? <span className="text-success">{p.offerTitle}</span> : DASH) },
    { label: 'Buyback', render: (p) => p.buyback ?? DASH },
    { label: 'Shipping', render: (p) => p.shipping ?? DASH },
    { label: 'US availability', render: (p) => <BoolCell value={p.usAvailable} /> },
    { label: 'Minimum age', render: (p) => p.minAge ?? DASH },
    {
      label: 'Payment methods',
      render: (p) =>
        p.paymentMethods.length ? (
          <div className="flex flex-wrap gap-1">
            {p.paymentMethods.slice(0, 6).map((m, i) => (
              <span key={i} className="rounded border border-line bg-elevated px-1.5 py-0.5 text-xs text-muted">
                {m}
              </span>
            ))}
          </div>
        ) : (
          DASH
        ),
    },
    { label: 'Last checked', render: (p) => formatReviewDate(p.lastCheckedISO) ?? DASH },
  ];

  function PlatformHeader({ p }: { p: ComparePlatform }) {
    return (
      <div className="flex flex-col items-center gap-1 text-center">
        <button
          type="button"
          onClick={() => remove(p.slug)}
          aria-label={`Remove ${p.name}`}
          className="self-end rounded p-1 text-muted hover:text-danger"
        >
          <XIcon width={14} height={14} />
        </button>
        {p.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary logo hosts
          <img src={p.logoUrl} alt={`${p.name} logo`} className="h-8 w-auto max-w-[120px] object-contain" />
        ) : (
          <span className="font-bold text-ink">{p.name}</span>
        )}
      </div>
    );
  }

  function CtaCell({ p }: { p: ComparePlatform }) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        {p.trackingUrl && (
          <a
            href={p.trackingUrl}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="u-btn-primary w-full rounded-lg px-3 py-2 text-center text-xs font-bold"
          >
            Visit site
          </a>
        )}
        <Link href={marketPath(market, `/reviews/${p.slug}`)} className="text-xs font-semibold text-accent hover:underline">
          Read review
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted">
          Add platform
          <select
            value=""
            onChange={(e) => e.target.value && add(e.target.value)}
            disabled={selected.length >= MAX || available.length === 0}
            className="ml-2 rounded-lg border border-line bg-elevated px-3 py-2 text-sm text-ink disabled:opacity-40"
          >
            <option value="">
              {selected.length >= MAX ? 'Maximum of 4' : available.length === 0 ? 'All added' : 'Choose a platform'}
            </option>
            {available.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs text-muted">{selected.length} of {MAX} selected</span>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={share} className="rounded-lg border border-line px-3 py-2 text-sm text-ink hover:bg-elevated">
            {copied ? 'Link copied' : 'Share'}
          </button>
          <button type="button" onClick={clear} disabled={selected.length === 0} className="rounded-lg border border-line px-3 py-2 text-sm text-muted hover:text-ink disabled:opacity-40">
            Clear all
          </button>
        </div>
      </div>

      {chosen.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-muted">
          Add platforms above to compare them side by side.
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-base px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                    Features
                  </th>
                  {chosen.map((p) => (
                    <th key={p.slug} className="border-b border-line px-4 py-3 align-top">
                      <PlatformHeader p={p} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="odd:bg-surface/40">
                    <th className="sticky left-0 z-10 bg-base px-4 py-3 text-left font-medium text-muted">
                      {row.label}
                    </th>
                    {chosen.map((p) => (
                      <td key={p.slug} className="border-b border-line px-4 py-3 text-ink">
                        {row.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th className="sticky left-0 z-10 bg-base px-4 py-3" />
                  {chosen.map((p) => (
                    <td key={p.slug} className="px-4 py-3">
                      <CtaCell p={p} />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-4 md:hidden">
            {chosen.map((p) => (
              <div key={p.slug} className="rounded-2xl border border-line bg-surface/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  {p.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- arbitrary logo hosts
                    <img src={p.logoUrl} alt={`${p.name} logo`} className="h-7 w-auto max-w-[120px] object-contain" />
                  ) : (
                    <span className="font-bold text-ink">{p.name}</span>
                  )}
                  <button type="button" onClick={() => remove(p.slug)} aria-label={`Remove ${p.name}`} className="rounded p-1 text-muted hover:text-danger">
                    <XIcon width={16} height={16} />
                  </button>
                </div>
                <dl className="divide-y divide-line">
                  {rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4 py-2">
                      <dt className="text-xs text-muted">{row.label}</dt>
                      <dd className="text-right text-sm text-ink">{row.render(p)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3">
                  <CtaCell p={p} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
