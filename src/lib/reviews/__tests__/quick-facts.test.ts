import { describe, expect, it } from 'vitest';

import { buildQuickFacts, type QuickFactsInput } from '@/lib/reviews/quick-facts';

const empty: QuickFactsInput = {
  operatorType: 'digital_unboxing',
  foundedYear: null,
  owner: null,
  minAge: null,
  availability: null,
  licenceAuthority: null,
  licenceNumber: null,
  buyback: null,
  kycRequired: null,
  shippingInfo: null,
  mobileApp: null,
};

describe('buildQuickFacts', () => {
  it('always includes the platform type, even when everything else is empty', () => {
    const facts = buildQuickFacts(empty);
    expect(facts).toEqual([{ label: 'Platform type', value: 'Digital unboxing' }]);
  });

  it('drops empty and whitespace-only fields', () => {
    const facts = buildQuickFacts({ ...empty, owner: '   ', availability: 'Worldwide' });
    const labels = facts.map((f) => f.label);
    expect(labels).not.toContain('Owner');
    expect(labels).toContain('Availability');
  });

  it('combines licence authority and number into one fact', () => {
    const facts = buildQuickFacts({ ...empty, licenceAuthority: 'MGA', licenceNumber: 'ABC123' });
    const licence = facts.find((f) => f.label === 'Licence');
    expect(licence?.value).toBe('MGA ABC123');
  });

  it('keeps the documented field order', () => {
    const facts = buildQuickFacts({
      ...empty,
      foundedYear: 2020,
      owner: 'Acme Ltd',
      availability: 'Worldwide',
      buyback: 'Up to 90%',
    });
    expect(facts.map((f) => f.label)).toEqual([
      'Founded',
      'Owner',
      'Availability',
      'Platform type',
      'Buyback',
    ]);
  });

  it('labels the physical retail type correctly', () => {
    const facts = buildQuickFacts({ ...empty, operatorType: 'physical_retail' });
    expect(facts[0].value).toBe('Physical retail');
  });
});
