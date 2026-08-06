// Shared availability logic used by the /free page and every platform list.
// Availability is a per-record property (no US/UK URL split), surfaced as a
// filter whose values are 'us' | 'uk' | 'both' | 'global'.
import type { AvailabilityScope } from '@/lib/supabase/types';

export type AvailabilityFilterValue = 'us' | 'uk' | 'both' | 'global';

/** Human-readable availability text. Words, never a flag alone. */
export function availabilityLabel(scope: AvailabilityScope, countries: readonly string[] = []): string {
  switch (scope) {
    case 'us':
      return 'US';
    case 'uk':
      return 'UK';
    case 'both':
      return 'US and UK';
    case 'global':
      return 'Global';
    case 'selected':
      return countries.length ? countries.join(', ') : 'Selected countries';
  }
}

/** Whether a record with this scope is available for a chosen filter value. */
export function availableIn(
  scope: AvailabilityScope,
  countries: readonly string[],
  value: AvailabilityFilterValue | null | undefined,
): boolean {
  if (!value) return true;
  const inUs = scope === 'us' || scope === 'both' || scope === 'global' || (scope === 'selected' && countries.includes('US'));
  const inUk =
    scope === 'uk' || scope === 'both' || scope === 'global' || (scope === 'selected' && (countries.includes('GB') || countries.includes('UK')));
  switch (value) {
    case 'us':
      return inUs;
    case 'uk':
      return inUk;
    case 'both':
      return inUs && inUk;
    case 'global':
      return scope === 'global';
  }
}

export const AVAILABILITY_FILTER_OPTIONS: { value: AvailabilityFilterValue; label: string }[] = [
  { value: 'us', label: 'US' },
  { value: 'uk', label: 'UK' },
  { value: 'both', label: 'US and UK' },
  { value: 'global', label: 'Global' },
];
