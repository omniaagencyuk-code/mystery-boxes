import Link from 'next/link';

import { marketPath, type MarketCode } from '@/lib/geo';
import { formatReviewDate } from '@/lib/reviews/format';
import type { ReviewView } from '@/lib/reviews/types';

/**
 * Review provenance footer: who wrote and checked it, when it was last updated
 * and checked, plus the affiliate disclosure and policy links. Everything shown
 * is real CMS data; missing fields are hidden.
 */
export function ReviewFooterMeta({
  review,
  market,
}: {
  review: ReviewView;
  market: MarketCode;
}) {
  const updated = formatReviewDate(review.updatedAt);
  const checked = formatReviewDate(review.lastCheckedAt);

  const metaBits: string[] = [];
  if (updated) metaBits.push(`Last updated ${updated}`);
  if (checked) metaBits.push(`Last checked ${checked}`);
  if (review.author) metaBits.push(`Author ${review.author}`);
  if (review.reviewer) metaBits.push(`Reviewed by ${review.reviewer}`);

  return (
    <footer className="mt-4 border-t border-[var(--rv-border)] pt-6 text-sm text-[var(--rv-muted)]">
      <p className="text-[var(--rv-text-2)]">
        Affiliate disclosure. Some links on this page are affiliate links. If you sign up through
        them we may earn a commission at no extra cost to you. This never affects our scores or what
        we write.
      </p>

      {metaBits.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1">
          {metaBits.map((bit, i) => (
            <span key={i}>
              {bit}
              {i < metaBits.length - 1 && <span className="ml-2 text-[var(--rv-border)]">|</span>}
            </span>
          ))}
        </p>
      )}

      <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <Link href={marketPath(market, '/about')} className="hover:text-[var(--rv-text-2)]">
          About us
        </Link>
        <Link href={marketPath(market, '/about')} className="hover:text-[var(--rv-text-2)]">
          Editorial policy
        </Link>
        <Link href={marketPath(market, '/terms')} className="hover:text-[var(--rv-text-2)]">
          Terms
        </Link>
        <Link href={marketPath(market, '/responsible-gambling')} className="hover:text-[var(--rv-text-2)]">
          Play responsibly
        </Link>
      </nav>
    </footer>
  );
}
