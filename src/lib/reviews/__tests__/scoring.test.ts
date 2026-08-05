import { describe, expect, it } from 'vitest';

import { formatScore, ratingDescriptor, scorePercent } from '@/lib/reviews/scoring';

describe('ratingDescriptor', () => {
  it('maps score bands to words', () => {
    expect(ratingDescriptor(4.8)).toBe('Excellent');
    expect(ratingDescriptor(4.5)).toBe('Excellent');
    expect(ratingDescriptor(4.2)).toBe('Very good');
    expect(ratingDescriptor(3.6)).toBe('Good');
    expect(ratingDescriptor(3.0)).toBe('Fair');
    expect(ratingDescriptor(2.4)).toBe('Average');
    expect(ratingDescriptor(1.2)).toBe('Poor');
  });

  it('returns null for a missing score', () => {
    expect(ratingDescriptor(null)).toBeNull();
    expect(ratingDescriptor(undefined)).toBeNull();
    expect(ratingDescriptor(Number.NaN)).toBeNull();
  });
});

describe('scorePercent', () => {
  it('expresses a 0-5 score as a percentage', () => {
    expect(scorePercent(5)).toBe(100);
    expect(scorePercent(2.5)).toBe(50);
    expect(scorePercent(0)).toBe(0);
  });

  it('clamps out-of-range values', () => {
    expect(scorePercent(9)).toBe(100);
    expect(scorePercent(-3)).toBe(0);
    expect(scorePercent(null)).toBe(0);
  });
});

describe('formatScore', () => {
  it('drops a trailing .0 but keeps real decimals', () => {
    expect(formatScore(4)).toBe('4');
    expect(formatScore(4.0)).toBe('4');
    expect(formatScore(4.6)).toBe('4.6');
    expect(formatScore(4.25)).toBe('4.3');
  });

  it('returns null for a missing score', () => {
    expect(formatScore(null)).toBeNull();
  });
});
