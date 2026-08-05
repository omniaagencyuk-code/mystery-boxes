import { PaymentMethodChips } from '@/components/review/payment-methods';
import { CardEyebrow, Pill, RatingBar, StarRating } from '@/components/review/primitives';
import { formatScore, ratingDescriptor } from '@/lib/reviews/scoring';
import type { QuickFact } from '@/lib/reviews/quick-facts';
import type { PaymentMethodView, ReviewView } from '@/lib/reviews/types';

function BottomLineCard({ review }: { review: ReviewView }) {
  const descriptor = review.scoreDescriptor ?? ratingDescriptor(review.overallScore);
  const recommended = descriptor === 'Excellent' || descriptor === 'Very good';

  return (
    <div className="rv-card flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <CardEyebrow>The bottom line</CardEyebrow>
        {recommended && <Pill variant="green">Recommended</Pill>}
      </div>

      {review.verdict ? (
        <p className="text-sm leading-relaxed text-[var(--rv-text-2)]">{review.verdict}</p>
      ) : (
        <p className="text-sm text-[var(--rv-muted)]">Our verdict is in the full review below.</p>
      )}

      {(review.bestForTitle || review.bestForDescription) && (
        <div className="rv-nested mt-auto border-[var(--rv-border-gold)] p-4">
          <div className="text-sm font-bold text-[var(--rv-gold)]">
            {review.bestForTitle ?? 'Best for'}
          </div>
          {review.bestForDescription && (
            <p className="mt-1 text-sm text-[var(--rv-text-2)]">{review.bestForDescription}</p>
          )}
        </div>
      )}
    </div>
  );
}

function OverallRatingCard({ review }: { review: ReviewView }) {
  const score = review.overallScore;
  const descriptor = review.scoreDescriptor ?? ratingDescriptor(score);

  return (
    <div className="rv-card p-5">
      <CardEyebrow>Our ratings</CardEyebrow>

      <div className="mt-4 grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
        <div className="text-center sm:text-left">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-[var(--rv-gold)]">
              {formatScore(score) ?? '--'}
            </span>
            <span className="text-lg text-[var(--rv-muted)]">/5</span>
          </div>
          {descriptor && (
            <div className="mt-1 font-bold text-[var(--rv-text)]">{descriptor}</div>
          )}
          <div className="mt-2">
            <StarRating score={score} size={18} />
          </div>
          <div className="mt-2 text-xs text-[var(--rv-muted)]">
            {review.ratings.length > 0
              ? `Based on ${review.ratings.length} key ${review.ratings.length === 1 ? 'factor' : 'factors'}`
              : 'Our editorial score'}
          </div>
        </div>

        {review.ratings.length > 0 && (
          <div className="space-y-2.5">
            {review.ratings.map((r, i) => (
              <RatingBar key={`${r.label}-${i}`} label={r.label} score={r.score} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickFactsCard({
  facts,
  payments,
}: {
  facts: QuickFact[];
  payments: PaymentMethodView[];
}) {
  if (facts.length === 0 && payments.length === 0) return null;
  return (
    <div className="rv-card p-5">
      <CardEyebrow>Quick facts</CardEyebrow>
      <dl className="mt-4 space-y-3">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-xs text-[var(--rv-muted)]">{fact.label}</dt>
            <dd className="text-sm font-medium text-[var(--rv-text)]">{fact.value}</dd>
          </div>
        ))}
        {payments.length > 0 && (
          <div>
            <dt className="mb-1.5 text-xs text-[var(--rv-muted)]">Payment methods</dt>
            <dd>
              <PaymentMethodChips methods={payments} limit={6} />
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

/**
 * Three-column review summary: bottom line, overall rating with category
 * breakdown, and quick facts. Stacks to one column on mobile in the order
 * bottom line, rating, quick facts.
 */
export function ReviewSummaryGrid({
  review,
  facts,
  payments,
}: {
  review: ReviewView;
  facts: QuickFact[];
  payments: PaymentMethodView[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <BottomLineCard review={review} />
      <OverallRatingCard review={review} />
      <QuickFactsCard facts={facts} payments={payments} />
    </div>
  );
}
