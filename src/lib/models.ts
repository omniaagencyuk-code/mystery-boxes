import type { MarketCode } from '@/lib/geo';
import type { OperatorTypeSlug } from '@/lib/supabase/types';

/**
 * View model for an operator as consumed by the card component and pages. It is
 * assembled from the operators row joined to its operator_type. Keeping a single
 * shape here means components never touch raw database rows.
 */
export interface OperatorSummary {
  /** Database id, used for category and relation lookups. */
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  rating: number | null;
  summary: string | null;
  pros: string[];
  cons: string[];
  trackingUrl: string | null;
  operatorType: OperatorTypeSlug;
  licenceAuthority: string | null;
  licenceNumber: string | null;
}

/** Build the canonical review URL for an operator within a market. */
export function reviewPath(market: MarketCode, slug: string): string {
  return `/${market}/reviews/${slug}`;
}
