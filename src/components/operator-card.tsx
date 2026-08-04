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
 *
 * `featured` marks the top pick (Editor's choice) in a comparison table.
 */
export type OperatorCardVariant = 'full' | 'compact' | 'table_row';

export interface OperatorCardProps {
  operator: OperatorSummary;
  market: MarketCode;
  variant: OperatorCardVariant;
  featured?: boolean;
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
        className="rounded-lg border border-line object-contain"
      />
    );
  }
  return (
    <div
      style={dimension}
      className="flex items-center justify-center rounded-lg border border-line bg-elevated text-sm font-semibold text-muted"
      aria-hidden
    >
      {operator.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function Cta({
  operator,
  variant = 'primary',
  className,
}: {
  operator: OperatorSummary;
  variant?: 'primary' | 'surface';
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold transition-all';
  if (!operator.trackingUrl) {
    return (
      <span
        className={`${base} cursor-not-allowed bg-elevated text-muted ${className ?? ''}`}
        title="Link coming soon"
      >
        Visit site
      </span>
    );
  }
  const style =
    variant === 'primary'
      ? 'u-btn-primary'
      : 'border border-line bg-raised text-ink hover:bg-elevated';
  return (
    <OutboundLink href={operator.trackingUrl} className={`${base} ${style} ${className ?? ''}`}>
      Visit site
    </OutboundLink>
  );
}

export function OperatorCard({ operator, market, variant, featured }: OperatorCardProps) {
  const href = reviewPath(market, operator.slug);

  if (variant === 'table_row') {
    return (
      <tr
        className={`u-glass-alt border-t border-line align-middle ${
          featured ? 'relative bg-primary/5' : ''
        }`}
      >
        <td className="py-5 pl-6 pr-3">
          {featured && (
            <span className="mb-2 inline-block rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-onprimary">
              Editor&apos;s choice
            </span>
          )}
          <div className="flex items-center gap-3">
            <Logo operator={operator} size={44} />
            <Link href={href} className="font-semibold text-ink hover:text-primary">
              {operator.name}
            </Link>
          </div>
        </td>
        <td className="px-3 py-5">
          <Rating value={operator.rating} />
        </td>
        <td className="px-3 py-5 text-sm text-muted">
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
        <td className="py-5 pl-3 pr-6 text-right">
          <Cta operator={operator} variant={featured ? 'primary' : 'surface'} />
        </td>
      </tr>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="u-glass flex items-center gap-3 rounded-xl p-3">
        <Logo operator={operator} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Link href={href} className="truncate font-semibold text-ink hover:text-primary">
              {operator.name}
            </Link>
            <Rating value={operator.rating} showNumber={false} />
          </div>
          <p className="truncate text-sm text-muted">{operator.summary ?? ''}</p>
          <div className="mt-1">
            <OperatorCompliance
              operatorType={operator.operatorType}
              market={market}
              licenceAuthority={operator.licenceAuthority}
              licenceNumber={operator.licenceNumber}
            />
          </div>
        </div>
        <Cta operator={operator} variant="surface" />
      </div>
    );
  }

  // full
  return (
    <article className="u-glass flex flex-col gap-4 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <Logo operator={operator} size={64} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href={href} className="text-lg font-bold text-ink hover:text-primary">
              {operator.name}
            </Link>
            <Rating value={operator.rating} />
          </div>
          {operator.summary && <p className="mt-1 text-sm text-muted">{operator.summary}</p>}
        </div>
      </div>

      {(operator.pros.length > 0 || operator.cons.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {operator.pros.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-success">What we like</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted">
                {operator.pros.map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </ul>
            </div>
          )}
          {operator.cons.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-danger">What to watch</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted">
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
          <Link href={href} className="text-sm font-semibold text-accent underline underline-offset-2 hover:no-underline">
            Read review
          </Link>
          <Cta operator={operator} />
        </div>
      </div>
    </article>
  );
}
