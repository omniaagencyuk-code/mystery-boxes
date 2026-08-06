'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface FreeFilterOption {
  value: string;
  label: string;
}

const OFFER_TYPES: FreeFilterOption[] = [
  { value: 'welcome_box', label: 'Welcome Box' },
  { value: 'daily_box', label: 'Daily Box' },
  { value: 'promo_code', label: 'Promo Code' },
  { value: 'no_deposit', label: 'No Deposit' },
  { value: 'referral', label: 'Referral' },
  { value: 'daily_reward', label: 'Daily Reward' },
  { value: 'free_pack', label: 'Free Pack' },
];

const PRIZE_BANDS: FreeFilterOption[] = [
  { value: 'under_20', label: 'Under $20' },
  { value: '20_plus', label: '$20+' },
  { value: '50_plus', label: '$50+' },
  { value: '100_plus', label: '$100+' },
  { value: 'premium', label: 'Premium' },
];

const RATINGS: FreeFilterOption[] = [
  { value: '4', label: '4+' },
  { value: '4.5', label: '4.5+' },
  { value: '5', label: '5' },
];

const AVAILABILITY: FreeFilterOption[] = [
  { value: 'us', label: 'US' },
  { value: 'uk', label: 'UK' },
  { value: 'both', label: 'US and UK' },
  { value: 'global', label: 'Global' },
];

const FEATURES: FreeFilterOption[] = [
  { value: 'us_available', label: 'US Available' },
  { value: 'uk_available', label: 'UK Available' },
  { value: 'both_available', label: 'Both Available' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'box_battles', label: 'Box Battles' },
  { value: 'buyback', label: 'Buyback' },
  { value: 'physical_shipping', label: 'Physical Shipping' },
  { value: 'crypto', label: 'Crypto Accepted' },
];

const selectCls =
  'rv-focus w-full rounded-lg border border-[var(--rv-border)] bg-[var(--rv-nested)] px-3 py-2 text-sm text-[var(--rv-text)]';
const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--rv-muted)]';

function Select({
  name,
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  name: string;
  label: string;
  allLabel: string;
  value: string;
  options: FreeFilterOption[];
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div>
      <label className={labelCls} htmlFor={`filter-${name}`}>
        {label}
      </label>
      <select
        id={`filter-${name}`}
        className={selectCls}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Accessible live filter panel for /free. Reads the current filters from the URL
 * and writes changes back to the URL, so the server re-renders filtered,
 * server-rendered results. Result count is announced via aria-live.
 */
export function FreeFilters({
  categories,
  resultCount,
}: {
  categories: FreeFilterOption[];
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = useMemo(() => {
    const features = (searchParams.get('features') ?? '').split(',').filter(Boolean);
    return {
      category: searchParams.get('category') ?? '',
      type: searchParams.get('type') ?? '',
      prize: searchParams.get('prize') ?? '',
      rating: searchParams.get('rating') ?? '',
      availability: searchParams.get('availability') ?? '',
      features,
    };
  }, [searchParams]);

  const push = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}#offers` : `${pathname}#offers`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setParam = useCallback(
    (name: string, value: string) =>
      push((p) => {
        if (value) p.set(name, value);
        else p.delete(name);
      }),
    [push],
  );

  const toggleFeature = useCallback(
    (value: string) =>
      push((p) => {
        const set = new Set((p.get('features') ?? '').split(',').filter(Boolean));
        if (set.has(value)) set.delete(value);
        else set.add(value);
        if (set.size) p.set('features', Array.from(set).join(','));
        else p.delete('features');
      }),
    [push],
  );

  const clearAll = useCallback(() => {
    const sort = searchParams.get('sort');
    const params = new URLSearchParams();
    if (sort) params.set('sort', sort);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}#offers` : `${pathname}#offers`, { scroll: false });
  }, [router, pathname, searchParams]);

  const hasFilters =
    current.category ||
    current.type ||
    current.prize ||
    current.rating ||
    current.availability ||
    current.features.length > 0;

  return (
    <div className="rv-card p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select name="category" label="Category" allLabel="All Categories" value={current.category} options={categories} onChange={setParam} />
        <Select name="type" label="Offer Type" allLabel="All Types" value={current.type} options={OFFER_TYPES} onChange={setParam} />
        <Select name="availability" label="Availability" allLabel="US, UK or Global" value={current.availability} options={AVAILABILITY} onChange={setParam} />
        <Select name="prize" label="Prize Value" allLabel="Any Value" value={current.prize} options={PRIZE_BANDS} onChange={setParam} />
        <Select name="rating" label="Rating" allLabel="Any Rating" value={current.rating} options={RATINGS} onChange={setParam} />
      </div>

      <fieldset className="mt-4">
        <legend className={labelCls}>Platform Features</legend>
        <div className="flex flex-wrap gap-2">
          {FEATURES.map((f) => {
            const active = current.features.includes(f.value);
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={active}
                onClick={() => toggleFeature(f.value)}
                className={`rv-focus rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'border-[var(--rv-border-strong)] bg-[var(--rv-blue)]/15 text-[var(--rv-text)]'
                    : 'border-[var(--rv-border)] text-[var(--rv-text-2)]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--rv-text-2)]" role="status" aria-live="polite">
          Showing <span className="font-bold text-[var(--rv-text)]">{resultCount}</span>{' '}
          {resultCount === 1 ? 'offer' : 'offers'}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="rv-focus rounded-lg border border-[var(--rv-border)] px-3 py-1.5 text-sm font-medium text-[var(--rv-text-2)]"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
