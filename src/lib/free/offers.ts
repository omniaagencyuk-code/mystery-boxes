// Pure, unit-testable logic for the /free offer list: availability labelling,
// filter matching, sorting and pagination. No IO here so it can be tested
// deterministically; the DB fetch lives in src/lib/data/free.ts.
import { availabilityLabel, availableIn } from '@/lib/availability';
import type { OfferFreshness } from '@/lib/reviews/offer-state';
import type { AvailabilityScope, OfferType, PrizeValueBand } from '@/lib/supabase/types';

export { availabilityLabel };

export type FreeSort = 'rating' | 'last_verified' | 'category' | 'offer_type' | 'platform';

export interface FreeOfferRow {
  operatorId: string;
  slug: string;
  platformName: string;
  logoUrl: string | null;
  rating: number | null;
  offerId: string | null;
  offerTitle: string | null;
  offerType: OfferType | null;
  promoCode: string | null;
  prizeValueBand: PrizeValueBand | null;
  categoryName: string | null;
  categorySlug: string | null;
  availabilityScope: AvailabilityScope;
  availabilityLabel: string;
  availableCountries: string[];
  excludedStates: string[];
  features: string[];
  lastVerifiedISO: string | null;
  freshness: OfferFreshness;
  reviewHref: string;
  cta: { href: string; tracked: boolean } | null;
}

export interface FreeFilters {
  category?: string | null;
  offerType?: OfferType | null;
  features?: string[];
  prize?: PrizeValueBand | null;
  minRating?: number | null;
  availability?: 'us' | 'uk' | 'both' | 'global' | null;
  sort?: FreeSort;
  page?: number;
  pageSize?: number;
}

/**
 * Last-verified state label for the table. Words, not colour alone. Returns
 * null when there is no live offer so callers can show a neutral state.
 */
export function verifiedLabel(
  freshness: OfferFreshness,
  lastVerifiedISO: string | null,
  now: Date,
): { text: string; verified: boolean } | null {
  if (freshness === 'stale') return { text: 'Stale', verified: false };
  if (freshness === 'expired') return { text: 'Expired', verified: false };
  if (freshness !== 'active') return null;
  if (!lastVerifiedISO) return { text: 'Verified', verified: true };
  const days = Math.floor((now.getTime() - Date.parse(lastVerifiedISO)) / 86400000);
  if (days <= 0) return { text: 'Verified Today', verified: true };
  if (days === 1) return { text: 'Verified Yesterday', verified: true };
  if (days <= 44) return { text: `Verified ${days} Days Ago`, verified: true };
  return { text: 'Verified', verified: true };
}

/** Whether a row is available for a chosen availability filter value. */
export function matchesAvailability(row: FreeOfferRow, value: FreeFilters['availability']): boolean {
  return availableIn(row.availabilityScope, row.availableCountries, value ?? null);
}

/** Feature filter: availability tokens map to the availability model, the rest
 * to the operator's structured feature tags. All selected features must match. */
export function matchesFeatures(row: FreeOfferRow, features: readonly string[] = []): boolean {
  for (const f of features) {
    if (f === 'us_available') {
      if (!matchesAvailability(row, 'us')) return false;
    } else if (f === 'uk_available') {
      if (!matchesAvailability(row, 'uk')) return false;
    } else if (f === 'both_available') {
      if (!matchesAvailability(row, 'both')) return false;
    } else if (!row.features.includes(f)) {
      return false;
    }
  }
  return true;
}

function matchesRow(row: FreeOfferRow, f: FreeFilters): boolean {
  if (f.category && row.categorySlug !== f.category) return false;
  if (f.offerType && row.offerType !== f.offerType) return false;
  if (f.prize && row.prizeValueBand !== f.prize) return false;
  if (f.minRating != null && (row.rating == null || row.rating < f.minRating)) return false;
  if (!matchesAvailability(row, f.availability)) return false;
  if (f.features && f.features.length > 0 && !matchesFeatures(row, f.features)) return false;
  return true;
}

function compare(a: FreeOfferRow, b: FreeOfferRow, sort: FreeSort): number {
  switch (sort) {
    case 'rating': {
      const av = a.rating ?? -1;
      const bv = b.rating ?? -1;
      return bv - av || a.platformName.localeCompare(b.platformName);
    }
    case 'last_verified': {
      const av = a.lastVerifiedISO ? Date.parse(a.lastVerifiedISO) : 0;
      const bv = b.lastVerifiedISO ? Date.parse(b.lastVerifiedISO) : 0;
      return bv - av || a.platformName.localeCompare(b.platformName);
    }
    case 'category':
      return (a.categoryName ?? '').localeCompare(b.categoryName ?? '') || a.platformName.localeCompare(b.platformName);
    case 'offer_type':
      return (a.offerType ?? '').localeCompare(b.offerType ?? '') || a.platformName.localeCompare(b.platformName);
    case 'platform':
      return a.platformName.localeCompare(b.platformName);
  }
}

export interface FreeOfferPage {
  rows: FreeOfferRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Filter, sort and paginate the offer pool. Pure. */
export function applyFreeFilters(rows: readonly FreeOfferRow[], filters: FreeFilters): FreeOfferPage {
  const sort = filters.sort ?? 'rating';
  const pageSize = Math.max(1, filters.pageSize ?? 10);
  const filtered = rows.filter((r) => matchesRow(r, filters)).sort((a, b) => compare(a, b, sort));
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, filters.page ?? 1), totalPages);
  const start = (page - 1) * pageSize;
  return { rows: filtered.slice(start, start + pageSize), total, page, pageSize, totalPages };
}
