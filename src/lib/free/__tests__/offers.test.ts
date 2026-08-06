import { describe, expect, it } from 'vitest';

import {
  applyFreeFilters,
  availabilityLabel,
  matchesAvailability,
  matchesFeatures,
  verifiedLabel,
  type FreeOfferRow,
} from '@/lib/free/offers';

const NOW = new Date('2026-06-01T00:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86400000).toISOString();

function row(overrides: Partial<FreeOfferRow> = {}): FreeOfferRow {
  return {
    operatorId: overrides.operatorId ?? 'op',
    slug: overrides.slug ?? 'op',
    platformName: overrides.platformName ?? 'Platform',
    logoUrl: null,
    rating: 4,
    offerId: 'of',
    offerTitle: 'Free box',
    offerType: null,
    promoCode: null,
    prizeValueBand: null,
    categoryName: 'CS2 Skin Cases',
    categorySlug: 'cs2',
    availabilityScope: 'global',
    availabilityLabel: 'Global',
    availableCountries: [],
    excludedStates: [],
    features: [],
    lastVerifiedISO: daysAgo(1),
    freshness: 'active',
    reviewHref: '/reviews/op',
    cta: { href: '/go/op', tracked: true },
    ...overrides,
  };
}

describe('availabilityLabel', () => {
  it('maps scopes to words, never flags alone', () => {
    expect(availabilityLabel('us')).toBe('US');
    expect(availabilityLabel('uk')).toBe('UK');
    expect(availabilityLabel('both')).toBe('US and UK');
    expect(availabilityLabel('global')).toBe('Global');
    expect(availabilityLabel('selected', ['US', 'CA'])).toBe('US, CA');
    expect(availabilityLabel('selected', [])).toBe('Selected countries');
  });
});

describe('matchesAvailability', () => {
  it('US filter includes us, both and global; excludes uk-only', () => {
    expect(matchesAvailability(row({ availabilityScope: 'us' }), 'us')).toBe(true);
    expect(matchesAvailability(row({ availabilityScope: 'both' }), 'us')).toBe(true);
    expect(matchesAvailability(row({ availabilityScope: 'global' }), 'us')).toBe(true);
    expect(matchesAvailability(row({ availabilityScope: 'uk' }), 'us')).toBe(false);
  });
  it('UK filter includes uk, both, global and selected GB', () => {
    expect(matchesAvailability(row({ availabilityScope: 'uk' }), 'uk')).toBe(true);
    expect(matchesAvailability(row({ availabilityScope: 'us' }), 'uk')).toBe(false);
    expect(matchesAvailability(row({ availabilityScope: 'selected', availableCountries: ['GB'] }), 'uk')).toBe(true);
  });
  it('both requires US and UK; global-only matches global filter', () => {
    expect(matchesAvailability(row({ availabilityScope: 'both' }), 'both')).toBe(true);
    expect(matchesAvailability(row({ availabilityScope: 'us' }), 'both')).toBe(false);
    expect(matchesAvailability(row({ availabilityScope: 'global' }), 'global')).toBe(true);
    expect(matchesAvailability(row({ availabilityScope: 'both' }), 'global')).toBe(false);
  });
  it('no filter matches everything', () => {
    expect(matchesAvailability(row({ availabilityScope: 'uk' }), null)).toBe(true);
  });
});

describe('matchesFeatures', () => {
  it('availability tokens map to the availability model', () => {
    expect(matchesFeatures(row({ availabilityScope: 'us' }), ['us_available'])).toBe(true);
    expect(matchesFeatures(row({ availabilityScope: 'uk' }), ['us_available'])).toBe(false);
  });
  it('structured feature tags must all be present', () => {
    expect(matchesFeatures(row({ features: ['buyback', 'crypto'] }), ['buyback'])).toBe(true);
    expect(matchesFeatures(row({ features: ['buyback'] }), ['buyback', 'crypto'])).toBe(false);
  });
});

describe('verifiedLabel', () => {
  it('labels recency and non-verified states in words', () => {
    expect(verifiedLabel('active', daysAgo(0), NOW)).toEqual({ text: 'Verified Today', verified: true });
    expect(verifiedLabel('active', daysAgo(1), NOW)).toEqual({ text: 'Verified Yesterday', verified: true });
    expect(verifiedLabel('active', daysAgo(2), NOW)).toEqual({ text: 'Verified 2 Days Ago', verified: true });
    expect(verifiedLabel('stale', daysAgo(90), NOW)).toEqual({ text: 'Stale', verified: false });
    expect(verifiedLabel('expired', null, NOW)).toEqual({ text: 'Expired', verified: false });
    expect(verifiedLabel('none', null, NOW)).toBeNull();
  });
});

describe('applyFreeFilters', () => {
  const rows = [
    row({ operatorId: 'a', platformName: 'Alpha', rating: 4.8, availabilityScope: 'us', categorySlug: 'cs2', offerType: 'welcome_box', lastVerifiedISO: daysAgo(1) }),
    row({ operatorId: 'b', platformName: 'Bravo', rating: 4.2, availabilityScope: 'uk', categorySlug: 'rust', offerType: 'daily_box', lastVerifiedISO: daysAgo(10) }),
    row({ operatorId: 'c', platformName: 'Charlie', rating: null, availabilityScope: 'both', categorySlug: 'cs2', offerType: null, lastVerifiedISO: daysAgo(2) }),
  ];

  it('filters by availability', () => {
    expect(applyFreeFilters(rows, { availability: 'uk' }).total).toBe(2); // bravo(uk) + charlie(both)
  });
  it('filters by category and offer type', () => {
    expect(applyFreeFilters(rows, { category: 'cs2' }).total).toBe(2);
    expect(applyFreeFilters(rows, { offerType: 'welcome_box' }).total).toBe(1);
  });
  it('filters by min rating, treating null rating as excluded', () => {
    const r = applyFreeFilters(rows, { minRating: 4.5 });
    expect(r.rows.map((x) => x.operatorId)).toEqual(['a']);
  });
  it('sorts by rating desc with nulls last by default', () => {
    const r = applyFreeFilters(rows, {});
    expect(r.rows.map((x) => x.operatorId)).toEqual(['a', 'b', 'c']);
  });
  it('sorts by platform name and last_verified', () => {
    expect(applyFreeFilters(rows, { sort: 'platform' }).rows.map((x) => x.platformName)).toEqual(['Alpha', 'Bravo', 'Charlie']);
    expect(applyFreeFilters(rows, { sort: 'last_verified' }).rows[0].operatorId).toBe('a');
  });
  it('paginates', () => {
    const p1 = applyFreeFilters(rows, { pageSize: 2, page: 1 });
    expect(p1.rows).toHaveLength(2);
    expect(p1.totalPages).toBe(2);
    const p2 = applyFreeFilters(rows, { pageSize: 2, page: 2 });
    expect(p2.rows).toHaveLength(1);
    expect(p2.page).toBe(2);
  });
  it('clamps out-of-range page to the last page', () => {
    expect(applyFreeFilters(rows, { pageSize: 2, page: 99 }).page).toBe(2);
  });
});
