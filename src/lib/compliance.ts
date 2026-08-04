import type { MarketCode } from '@/lib/geo';
import type { OperatorTypeSlug } from '@/lib/supabase/types';

/**
 * Which compliance elements an operator requires, decided ONLY by operator_type
 * (and market for the UK-specific GamStop reference). This is the single source
 * of truth so that no global layout can apply gambling messaging to a physical
 * retail operator.
 *
 *   digital_unboxing = pay to open on screen with a randomised result. Gambling
 *                      compliance furniture applies.
 *   physical_retail  = real goods posted to the customer. Affiliate disclosure
 *                      only, never gambling furniture.
 */
export interface ComplianceFurniture {
  /** #ad affiliate disclosure. Applies to every operator, this is an affiliate site. */
  affiliateDisclosure: boolean;
  /** 18+ marker. */
  ageRestriction: boolean;
  /** BeGambleAware reference with link. */
  beGambleAware: boolean;
  /** GamStop reference. UK pages only. */
  gamStop: boolean;
  /** Show licence authority and number when present. */
  licence: boolean;
}

export function complianceFor(
  operatorType: OperatorTypeSlug,
  market: MarketCode,
): ComplianceFurniture {
  if (operatorType === 'digital_unboxing') {
    return {
      affiliateDisclosure: true,
      ageRestriction: true,
      beGambleAware: true,
      // GamStop is a UK self-exclusion scheme, so it is UK pages only.
      gamStop: market === 'uk',
      licence: true,
      // NOTE for US digital pages: BeGambleAware and GamStop are UK bodies.
      // GamStop is already suppressed outside the UK above. BeGambleAware is
      // still shown per the spec's literal list. A US-specific responsible
      // gambling resource is deliberately NOT invented here. Confirm the US
      // responsible gambling reference before launching US digital operators.
    };
  }

  // physical_retail: affiliate disclosure only.
  return {
    affiliateDisclosure: true,
    ageRestriction: false,
    beGambleAware: false,
    gamStop: false,
    licence: false,
  };
}

/** Public responsible-gambling resources referenced by the compliance furniture. */
export const RESPONSIBLE_GAMBLING_LINKS = {
  beGambleAware: 'https://www.begambleaware.org',
  gamStop: 'https://www.gamstop.co.uk',
} as const;
