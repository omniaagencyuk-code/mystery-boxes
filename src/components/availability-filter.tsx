'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { AVAILABILITY_FILTER_OPTIONS } from '@/lib/availability';

/**
 * Reusable availability filter for platform lists and tables. Writes the chosen
 * value to the URL (?availability=us|uk|both|global) so the server re-renders a
 * filtered, server-rendered list. Includes an "All" option and announces the
 * result count for assistive tech.
 */
export function AvailabilityFilter({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('availability') ?? '';

  const select = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set('availability', value);
      else params.delete('availability');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const options = [{ value: '', label: 'All regions' }, ...AVAILABILITY_FILTER_OPTIONS];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted">Availability</span>
      <div role="group" aria-label="Filter by availability" className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = current === o.value;
          return (
            <button
              key={o.value || 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => select(o.value)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                active ? 'border-primary bg-primary/15 text-ink' : 'border-line text-muted hover:text-ink'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <span className="ml-auto text-sm text-muted" role="status" aria-live="polite">
        {resultCount} {resultCount === 1 ? 'platform' : 'platforms'}
      </span>
    </div>
  );
}
