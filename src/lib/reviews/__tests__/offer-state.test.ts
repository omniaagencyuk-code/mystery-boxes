import { describe, expect, it } from 'vitest';

import { offerState, OFFER_STALE_DAYS } from '@/lib/reviews/offer-state';
import type { OfferRow } from '@/lib/supabase/types';

const NOW = new Date('2026-06-01T00:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(NOW.getTime() + n * 86400000).toISOString();

function offer(overrides: Partial<OfferRow> = {}): OfferRow {
  return {
    id: 'o1',
    operator_id: 'op1',
    title: 'Welcome offer',
    code: null,
    description: null,
    terms: null,
    starts_at: null,
    expires_at: null,
    active: true,
    cta_label: null,
    exclusive: false,
    eligibility: null,
    terms_url: null,
    last_verified_at: null,
    ...overrides,
  };
}

describe('offerState', () => {
  it('returns none for a missing offer', () => {
    expect(offerState(null, NOW)).toEqual({ freshness: 'none', usable: false, lastCheckedISO: null });
  });

  it('returns none for an inactive offer', () => {
    expect(offerState(offer({ active: false }), NOW).freshness).toBe('none');
  });

  it('is active and usable with no dates', () => {
    const s = offerState(offer(), NOW);
    expect(s.freshness).toBe('active');
    expect(s.usable).toBe(true);
  });

  it('is expired and not usable past expiry', () => {
    const s = offerState(offer({ expires_at: daysAgo(1) }), NOW);
    expect(s.freshness).toBe('expired');
    expect(s.usable).toBe(false);
  });

  it('is upcoming and not usable before start', () => {
    const s = offerState(offer({ starts_at: daysAhead(2) }), NOW);
    expect(s.freshness).toBe('upcoming');
    expect(s.usable).toBe(false);
  });

  it('is stale but still usable when verified long ago', () => {
    const s = offerState(offer({ last_verified_at: daysAgo(OFFER_STALE_DAYS + 5) }), NOW);
    expect(s.freshness).toBe('stale');
    expect(s.usable).toBe(true);
    expect(s.lastCheckedISO).not.toBeNull();
  });

  it('is active when verified recently', () => {
    const s = offerState(offer({ last_verified_at: daysAgo(3) }), NOW);
    expect(s.freshness).toBe('active');
    expect(s.usable).toBe(true);
  });

  it('treats expiry as decisive even when recently verified', () => {
    const s = offerState(offer({ last_verified_at: daysAgo(1), expires_at: daysAgo(1) }), NOW);
    expect(s.freshness).toBe('expired');
    expect(s.usable).toBe(false);
  });
});
