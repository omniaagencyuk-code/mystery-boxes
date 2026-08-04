import { OperatorCompliance } from '@/components/compliance';
import { OutboundLink } from '@/components/outbound-link';
import { Rating } from '@/components/rating';
import type { MarketCode } from '@/lib/geo';
import type { OperatorSummary } from '@/lib/models';
import type { OfferRow } from '@/lib/supabase/types';

/**
 * The top-of-page welcome offer banner shown on every operator review, so all
 * reviews share the same layout. It leads with the operator's headline offer (or
 * a plain visit prompt when there is no offer) and a single tracked CTA. Offer
 * text is only ever the operator's real offer data, never invented.
 */
export function ReviewBonusBanner({
  operator: op,
  market,
  offer,
}: {
  operator: OperatorSummary;
  market: MarketCode;
  offer: OfferRow | null;
}) {
  const headline = offer?.title ?? `Visit ${op.name}`;
  const cta = offer ? 'Get offer' : `Visit ${op.name}`;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-primary/15 via-surface to-accent/10 p-5 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative grid items-center gap-5 sm:grid-cols-[auto_1fr_auto]">
        {/* Logo */}
        {op.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={op.logoUrl}
            alt={`${op.name} logo`}
            className="h-16 w-16 rounded-xl border border-line bg-surface object-contain p-1 sm:h-20 sm:w-20"
          />
        ) : (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-xl border border-line bg-elevated text-lg font-bold text-muted sm:h-20 sm:w-20"
            aria-hidden
          >
            {op.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* Offer text */}
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {offer ? 'Welcome offer' : 'Our pick'}
          </span>
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
            {headline}
          </h2>
          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <Rating value={op.rating} />
            {offer?.code && (
              <span className="text-xs text-muted">
                Code{' '}
                <code className="rounded bg-elevated px-2 py-0.5 text-xs font-semibold text-ink">
                  {offer.code}
                </code>
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        {op.trackingUrl && (
          <div className="sm:text-right">
            <OutboundLink
              href={op.trackingUrl}
              className="u-btn-primary inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-bold sm:w-auto"
            >
              {cta}
            </OutboundLink>
          </div>
        )}
      </div>

      {/* Terms + compliance footer */}
      <div className="relative mt-4 space-y-2 border-t border-line/70 pt-3">
        {offer?.terms && <p className="text-xs text-muted">{offer.terms}</p>}
        <OperatorCompliance
          operatorType={op.operatorType}
          market={market}
          licenceAuthority={op.licenceAuthority}
          licenceNumber={op.licenceNumber}
          density="inline"
        />
      </div>
    </section>
  );
}
