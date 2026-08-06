import type { MarketCode } from '@/lib/geo';
import type { OperatorTypeSlug } from '@/lib/supabase/types';

/**
 * A responsible-gambling resource shown for digital unboxing operators. Which
 * resources apply is market-configurable below.
 */
export interface ResponsibleGamblingResource {
  label: string;
  href: string;
}

/**
 * Responsible-gambling resources per market, shown for digital_unboxing
 * operators only. This is the single place to add or change them: when the
 * correct US reference is confirmed, add it here and nothing else changes.
 *
 * We deliberately invent nothing. BeGambleAware and GamStop are UK bodies, so
 * they live under `uk`. The `us` list is intentionally empty until a real US
 * responsible-gambling reference is confirmed.
 */
export const RESPONSIBLE_GAMBLING_RESOURCES: Record<MarketCode, ResponsibleGamblingResource[]> = {
  uk: [
    { label: 'BeGambleAware', href: 'https://www.begambleaware.org' },
    { label: 'GamStop', href: 'https://www.gamstop.co.uk' },
  ],
  // TODO confirm the US responsible-gambling reference, then add it here. Left
  // empty on purpose so nothing is fabricated for the US market.
  us: [],
};

/**
 * Which compliance elements an operator requires, decided ONLY by operator_type
 * (and market, for which responsible-gambling resources apply). This is the
 * single source of truth so that no global layout can apply gambling messaging
 * to a physical retail operator.
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
  /** Show licence authority and number when present. */
  licence: boolean;
  /** Responsible-gambling resources to link, resolved for the market. */
  responsibleGambling: ResponsibleGamblingResource[];
}

export function complianceFor(
  operatorType: OperatorTypeSlug,
  market: MarketCode,
): ComplianceFurniture {
  // Digital unboxing and skin case opening are both pay-to-open randomised
  // mechanics, so both carry the full gambling compliance furniture. Skin cases
  // sit even closer to wagering (tradeable items with a live secondary market),
  // so they get the same 18+, licence and responsible-gambling treatment.
  if (operatorType === 'digital_unboxing' || operatorType === 'skin_case') {
    return {
      affiliateDisclosure: true,
      ageRestriction: true,
      licence: true,
      responsibleGambling: RESPONSIBLE_GAMBLING_RESOURCES[market] ?? [],
    };
  }

  // physical_retail: affiliate disclosure only.
  return {
    affiliateDisclosure: true,
    ageRestriction: false,
    licence: false,
    responsibleGambling: [],
  };
}
