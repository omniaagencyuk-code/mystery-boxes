import Link from 'next/link';

import { OperatorCompliance } from '@/components/compliance';
import { OutboundLink } from '@/components/outbound-link';
import { Rating } from '@/components/rating';
import type { MarketCode } from '@/lib/geo';
import { reviewPath, type OperatorSummary } from '@/lib/models';

/**
 * Reusable operator card, shortcode-style: one component, a typed schema and a
 * variant discriminator. Every variant renders the correct compliance furniture
 * for the operator's type via OperatorCompliance, so a physical retail operator
 * never shows gambling messaging and a digital unboxing operator always does.
 *
 * Variants:
 *   full      logo, rating, summary, pros and cons, CTA
 *   compact   logo, rating, one line, CTA
 *   table_row a <tr> for comparison tables (render inside a <table><tbody>)
 */
export type OperatorCardVariant = 'full' | 'compact' | 'table_row';

export interface OperatorCardProps {
  operator: OperatorSummary;
  market: MarketCode;
  variant: OperatorCardVariant;
}

function Logo({ operator, size }: { operator: OperatorSummary; size: number }) {
  const dimension = { width: size, height: size };
  if (operator.logoUrl) {
    // Plain img avoids next/image remote-host config for arbitrary logo hosts.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={operator.logoUrl}
        alt={`${operator.name} logo`}
        style={dimension}
        className="rounded object-contain"
      />
    );
  }
  return (
    <div
      style={dimension}
      className="flex items-center justify-center rounded bg-gray-100 text-sm font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400"
      aria-hidden
    >
      {operator.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function Cta({ operator, className }: { operator: OperatorSummary; className?: string }) {
  const base =
    'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors';
  if (!operator.trackingUrl) {
    return (
      <span
        className={`${base} cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 ${className ?? ''}`}
        title="Link coming soon"
      >
        Visit site
      </span>
    );
  }
  return (
    <OutboundLink
      href={operator.trackingUrl}
      className={`${base} bg-emerald-600 text-white hover:bg-emerald-500 ${className ?? ''}`}
    >
      Visit site
    </OutboundLink>
  );
}

export function OperatorCard({ operator, market, variant }: OperatorCardProps) {
  const href = reviewPath(market, operator.slug);

  if (variant === 'table_row') {
    return (
      <tr className="border-b border-gray-200 align-top dark:border-gray-700">
        <td className="py-3 pr-3">
          <div className="flex items-center gap-3">
            <Logo operator={operator} size={40} />
            <Link href={href} className="font-medium hover:underline">
              {operator.name}
            </Link>
          </div>
        </td>
        <td className="px-3 py-3">
          <Rating value={operator.rating} />
        </td>
        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
          {operator.summary ?? ''}
          <div className="mt-2">
            <OperatorCompliance
              operatorType={operator.operatorType}
              market={market}
              licenceAuthority={operator.licenceAuthority}
              licenceNumber={operator.licenceNumber}
            />
          </div>
        </td>
        <td className="py-3 pl-3 text-right">
          <Cta operator={operator} />
        </td>
      </tr>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <Logo operator={operator} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Link href={href} className="truncate font-medium hover:underline">
              {operator.name}
            </Link>
            <Rating value={operator.rating} />
          </div>
          <p className="truncate text-sm text-gray-600 dark:text-gray-300">
            {operator.summary ?? ''}
          </p>
          <div className="mt-1">
            <OperatorCompliance
              operatorType={operator.operatorType}
              market={market}
              licenceAuthority={operator.licenceAuthority}
              licenceNumber={operator.licenceNumber}
            />
          </div>
        </div>
        <Cta operator={operator} />
      </div>
    );
  }

  // full
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-gray-200 p-5 dark:border-gray-700">
      <div className="flex items-start gap-4">
        <Logo operator={operator} size={64} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href={href} className="text-lg font-semibold hover:underline">
              {operator.name}
            </Link>
            <Rating value={operator.rating} />
          </div>
          {operator.summary && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{operator.summary}</p>
          )}
        </div>
      </div>

      {(operator.pros.length > 0 || operator.cons.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {operator.pros.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                What we like
              </h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-300">
                {operator.pros.map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </ul>
            </div>
          )}
          {operator.cons.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                What to watch
              </h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-300">
                {operator.cons.map((con, i) => (
                  <li key={i}>{con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <OperatorCompliance
          operatorType={operator.operatorType}
          market={market}
          licenceAuthority={operator.licenceAuthority}
          licenceNumber={operator.licenceNumber}
          density="block"
        />
        <div className="flex items-center gap-3">
          <Link href={href} className="text-sm font-medium underline underline-offset-2 hover:no-underline">
            Read review
          </Link>
          <Cta operator={operator} />
        </div>
      </div>
    </article>
  );
}
