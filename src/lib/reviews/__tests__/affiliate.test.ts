import { describe, expect, it } from 'vitest';

import { resolveCta } from '@/lib/reviews/affiliate';

const ctx = { placement: 'welcome_offer', label: 'Claim Offer', page: '/reviews/acme' };

describe('resolveCta', () => {
  it('prefers a tracked /go link and encodes the context', () => {
    const target = resolveCta(
      { affiliateSlug: 'acme-us', trackingUrl: 'https://track', websiteUrl: 'https://acme' },
      ctx,
    );
    expect(target?.tracked).toBe(true);
    expect(target?.href).toContain('/go/acme-us?');
    expect(target?.href).toContain('p=welcome_offer');
    expect(target?.href).toContain('l=Claim+Offer');
    expect(target?.href).toContain('pg=%2Freviews%2Facme');
  });

  it('falls back to the raw tracking URL when there is no slug', () => {
    const target = resolveCta(
      { affiliateSlug: null, trackingUrl: 'https://track.example', websiteUrl: 'https://acme' },
      ctx,
    );
    expect(target).toEqual({ href: 'https://track.example', tracked: false });
  });

  it('falls back to the website URL last', () => {
    const target = resolveCta(
      { affiliateSlug: null, trackingUrl: null, websiteUrl: 'https://acme.example' },
      ctx,
    );
    expect(target).toEqual({ href: 'https://acme.example', tracked: false });
  });

  it('returns null when there is no usable URL', () => {
    expect(resolveCta({ affiliateSlug: null, trackingUrl: null, websiteUrl: null }, ctx)).toBeNull();
  });
});
