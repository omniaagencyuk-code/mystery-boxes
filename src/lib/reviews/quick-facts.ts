import type { OperatorTypeSlug } from '@/lib/supabase/types';

export interface QuickFact {
  label: string;
  value: string;
}

export interface QuickFactsInput {
  operatorType: OperatorTypeSlug;
  foundedYear: number | null;
  owner: string | null;
  minAge: string | null;
  availability: string | null;
  licenceAuthority: string | null;
  licenceNumber: string | null;
  buyback: string | null;
  kycRequired: string | null;
  shippingInfo: string | null;
  mobileApp: string | null;
}

const OPERATOR_TYPE_LABEL: Record<OperatorTypeSlug, string> = {
  digital_unboxing: 'Digital unboxing',
  physical_retail: 'Physical retail',
  skin_case: 'Skin case opening',
};

function clean(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

/**
 * Build the ordered quick-facts list, dropping any field the CMS has left
 * empty so the card never shows a blank row. Pure and unit testable.
 */
export function buildQuickFacts(input: QuickFactsInput): QuickFact[] {
  const facts: QuickFact[] = [];
  const push = (label: string, value: string | null) => {
    if (value) facts.push({ label, value });
  };

  push('Founded', input.foundedYear ? String(input.foundedYear) : null);
  push('Owner', clean(input.owner));
  push('Minimum age', clean(input.minAge));
  push('Availability', clean(input.availability));
  push('Platform type', OPERATOR_TYPE_LABEL[input.operatorType]);

  const authority = clean(input.licenceAuthority);
  const number = clean(input.licenceNumber);
  if (authority || number) {
    push('Licence', [authority, number].filter(Boolean).join(' '));
  }

  push('Buyback', clean(input.buyback));
  push('KYC required', clean(input.kycRequired));
  push('Shipping', clean(input.shippingInfo));
  push('Mobile app', clean(input.mobileApp));

  return facts;
}
