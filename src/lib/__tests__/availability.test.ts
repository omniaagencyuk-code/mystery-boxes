import { describe, expect, it } from 'vitest';

import { availabilityLabel, availableIn } from '@/lib/availability';

describe('availabilityLabel', () => {
  it('renders words, never a flag alone', () => {
    expect(availabilityLabel('us')).toBe('US');
    expect(availabilityLabel('uk')).toBe('UK');
    expect(availabilityLabel('both')).toBe('US and UK');
    expect(availabilityLabel('global')).toBe('Global');
    expect(availabilityLabel('selected', ['US', 'CA'])).toBe('US, CA');
    expect(availabilityLabel('selected', [])).toBe('Selected countries');
  });
});

describe('availableIn', () => {
  it('null filter matches everything', () => {
    expect(availableIn('uk', [], null)).toBe(true);
  });
  it('US filter includes us/both/global and selected US, excludes uk-only', () => {
    expect(availableIn('us', [], 'us')).toBe(true);
    expect(availableIn('both', [], 'us')).toBe(true);
    expect(availableIn('global', [], 'us')).toBe(true);
    expect(availableIn('selected', ['US'], 'us')).toBe(true);
    expect(availableIn('uk', [], 'us')).toBe(false);
    expect(availableIn('selected', ['GB'], 'us')).toBe(false);
  });
  it('UK filter includes uk/both/global and selected GB/UK', () => {
    expect(availableIn('uk', [], 'uk')).toBe(true);
    expect(availableIn('selected', ['GB'], 'uk')).toBe(true);
    expect(availableIn('selected', ['UK'], 'uk')).toBe(true);
    expect(availableIn('us', [], 'uk')).toBe(false);
  });
  it('both requires US and UK; global matches only global', () => {
    expect(availableIn('both', [], 'both')).toBe(true);
    expect(availableIn('global', [], 'both')).toBe(true);
    expect(availableIn('us', [], 'both')).toBe(false);
    expect(availableIn('global', [], 'global')).toBe(true);
    expect(availableIn('both', [], 'global')).toBe(false);
  });
});
