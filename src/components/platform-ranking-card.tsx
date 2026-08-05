import Link from 'next/link';

import { OutboundLink } from '@/components/outbound-link';
import { Rating } from '@/components/rating';
import { marketPath, type MarketCode } from '@/lib/geo';
import type { OperatorSummary } from '@/lib/models';
import { ratingDescriptor } from '@/lib/reviews/scoring';

function RankBadge({ rank }: { rank: number }) {
  // Gold, silver, bronze for the podium; a neutral blue chip after that. The
  // number is always shown, so rank is never conveyed by colour alone.
  const palette =
    rank === 1
      ? 'bg-star/20 text-star border-star/40'
      : rank === 2
        ? 'bg-muted/20 text-ink border-line'
        : rank === 3
          ? 'bg-warning/20 text-warning border-warning/40'
          : 'bg-primary/15 text-accent border-line';
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold ${palette}`}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}

function CardLogo({ operator }: { operator: OperatorSummary }) {
  if (operator.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary logo hosts
      <img
        src={operator.logoUrl}
        alt={`${operator.name} logo`}
        className="h-10 w-auto max-w-[70%] object-contain"
      />
    );
  }
  return <span className="text-xl font-black tracking-tight text-ink">{operator.name}</span>;
}

/**
 * The premium ranking card used on the homepage and category pages. Shows rank,
 * logo, editorial score with descriptor, an optional verified offer line, and
 * the configured CTAs. Everything is real operator data; a null rating shows
 * "Not yet rated" rather than a number.
 */
export function PlatformRankingCard({
  operator,
  rank,
  market,
  offerTitle,
  badge,
  primaryCta = 'review',
  showCompare = false,
}: {
  operator: OperatorSummary;
  rank: number;
  market: MarketCode;
  offerTitle?: string | null;
  badge?: string | null;
  /** 'visit' leads with a green Visit Site CTA; 'review' leads with View Review. */
  primaryCta?: 'review' | 'visit';
  showCompare?: boolean;
}) {
  const descriptor = ratingDescriptor(operator.rating);
  const reviewHref = marketPath(market, `/reviews/${operator.slug}`);

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface/60 p-4 transition-colors hover:border-primary/40">
      <div className="mb-3 flex items-center justify-between gap-2">
        <RankBadge rank={rank} />
        {badge && (
          <span className="rounded-md border border-star/40 bg-star/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-star">
            {badge}
          </span>
        )}
      </div>

      <div className="flex min-h-14 items-center justify-center">
        <CardLogo operator={operator} />
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <Rating value={operator.rating} />
        {descriptor && <span className="text-sm font-medium text-star">{descriptor}</span>}
      </div>

      <div className="mt-2 min-h-5 text-center text-sm text-muted">
        {offerTitle ? <span className="text-success">{offerTitle}</span> : null}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {primaryCta === 'visit' && operator.trackingUrl ? (
          <>
            <OutboundLink
              href={operator.trackingUrl}
              className="u-btn-primary rounded-lg px-4 py-2 text-center text-sm font-bold"
            >
              Visit Site
            </OutboundLink>
            <Link
              href={reviewHref}
              className="text-center text-sm font-semibold text-muted hover:text-ink"
            >
              Read Review
            </Link>
          </>
        ) : (
          <>
            <Link
              href={reviewHref}
              className="rounded-lg border border-line px-4 py-2 text-center text-sm font-bold text-ink hover:bg-elevated"
            >
              View Review
            </Link>
            {showCompare && (
              <Link
                href={marketPath(market, '/compare')}
                className="text-center text-sm font-semibold text-muted hover:text-ink"
              >
                Compare
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
