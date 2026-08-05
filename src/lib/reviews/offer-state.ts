import type { OfferRow } from '@/lib/supabase/types';

/**
 * Freshness of a welcome offer, used to decide how the offer bar presents.
 *
 *  - `none`     no usable offer, show the neutral fallback and no promo code
 *  - `active`   verified recently (or never given a check date), show normally
 *  - `stale`    still live but not verified within the freshness window, show
 *               with a softer "always confirm on site" note
 *  - `expired`  past its expiry or switched off, treated as `none` by callers
 *  - `upcoming` starts in the future, treated as `none` by callers
 */
export type OfferFreshness = 'none' | 'active' | 'stale' | 'expired' | 'upcoming';

/** Offers not re-verified within this many days are shown as `stale`. */
export const OFFER_STALE_DAYS = 45;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface OfferState {
  freshness: OfferFreshness;
  /** True when the offer should drive a live CTA and may show a promo code. */
  usable: boolean;
  /** ISO string of the last verification, when known. */
  lastCheckedISO: string | null;
}

/**
 * Derive the presentation state for an offer at a given instant. Pure and
 * time-injected so it is deterministic and unit testable. An absent offer, an
 * inactive one, an expired one or one that has not started yet are never
 * `usable`, so no stale promo code is ever surfaced.
 */
export function offerState(offer: OfferRow | null | undefined, now: Date): OfferState {
  if (!offer || !offer.active) {
    return { freshness: 'none', usable: false, lastCheckedISO: null };
  }

  const nowMs = now.getTime();

  if (offer.starts_at && new Date(offer.starts_at).getTime() > nowMs) {
    return { freshness: 'upcoming', usable: false, lastCheckedISO: offer.last_verified_at ?? null };
  }

  if (offer.expires_at && new Date(offer.expires_at).getTime() < nowMs) {
    return { freshness: 'expired', usable: false, lastCheckedISO: offer.last_verified_at ?? null };
  }

  if (offer.last_verified_at) {
    const ageDays = (nowMs - new Date(offer.last_verified_at).getTime()) / DAY_MS;
    if (ageDays > OFFER_STALE_DAYS) {
      return { freshness: 'stale', usable: true, lastCheckedISO: offer.last_verified_at };
    }
  }

  return { freshness: 'active', usable: true, lastCheckedISO: offer.last_verified_at ?? null };
}
