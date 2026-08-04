import type { MarketCode } from '@/lib/geo';
import {
  complianceFor,
  RESPONSIBLE_GAMBLING_LINKS,
  type ComplianceFurniture,
} from '@/lib/compliance';
import type { OperatorTypeSlug } from '@/lib/supabase/types';

interface ComplianceProps {
  operatorType: OperatorTypeSlug;
  market: MarketCode;
  licenceAuthority?: string | null;
  licenceNumber?: string | null;
  /** inline = condensed for cards, block = fuller for review and content pages. */
  density?: 'inline' | 'block';
}

/**
 * Renders compliance furniture for a single operator. The set of elements is
 * decided by complianceFor(), which keys off operator_type. A physical retail
 * operator only ever gets the affiliate disclosure here.
 */
export function OperatorCompliance({
  operatorType,
  market,
  licenceAuthority,
  licenceNumber,
  density = 'inline',
}: ComplianceProps) {
  const furniture: ComplianceFurniture = complianceFor(operatorType, market);
  const showLicence = furniture.licence && Boolean(licenceAuthority || licenceNumber);

  const wrap =
    density === 'block'
      ? 'flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-600 dark:text-gray-300'
      : 'flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400';

  const chip =
    'inline-flex items-center rounded border border-gray-300 px-1.5 py-0.5 dark:border-gray-600';

  return (
    <div className={wrap} aria-label="Compliance information">
      {/* #ad disclosure applies to every operator on this affiliate site. */}
      <span className={chip} title="This is an affiliate advertisement">
        #ad
      </span>

      {furniture.ageRestriction && (
        <span className={chip} title="Over eighteens only">
          18+
        </span>
      )}

      {showLicence && (
        <span className={chip}>
          {[licenceAuthority, licenceNumber].filter(Boolean).join(' ')}
        </span>
      )}

      {furniture.beGambleAware && (
        <a
          href={RESPONSIBLE_GAMBLING_LINKS.beGambleAware}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:no-underline"
        >
          BeGambleAware
        </a>
      )}

      {furniture.gamStop && (
        <a
          href={RESPONSIBLE_GAMBLING_LINKS.gamStop}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:no-underline"
        >
          GamStop
        </a>
      )}
    </div>
  );
}
