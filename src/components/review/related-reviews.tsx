import Link from 'next/link';

import { SectionHeading, StarRating } from '@/components/review/primitives';
import { marketPath, type MarketCode } from '@/lib/geo';
import type { RelatedPlatformView } from '@/lib/reviews/types';

/**
 * "You might also like" cards for related platforms. Logo, name, rating stars,
 * an optional best-for label and a Read Review link. Server rendered with
 * crawlable internal links.
 */
export function RelatedReviews({
  related,
  market,
}: {
  related: RelatedPlatformView[];
  market: MarketCode;
}) {
  if (related.length === 0) return null;
  return (
    <div className="space-y-4">
      <SectionHeading>You might also like</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.slice(0, 3).map((item) => (
          <div key={item.slug} className="rv-card flex flex-col overflow-hidden">
            <div className="rv-nested flex h-28 items-center justify-center border-0 border-b border-[var(--rv-border)]">
              {item.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary logo hosts
                <img
                  src={item.logoUrl}
                  alt={`${item.name} logo`}
                  className="max-h-14 w-auto max-w-[70%] object-contain"
                />
              ) : (
                <span className="text-xl font-black text-[var(--rv-text)]">{item.name}</span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="font-bold text-[var(--rv-text)]">{item.name} Review</div>
              <StarRating score={item.rating} size={15} />
              {item.bestFor && (
                <p className="line-clamp-2 text-xs text-[var(--rv-muted)]">{item.bestFor}</p>
              )}
              <Link
                href={marketPath(market, `/reviews/${item.slug}`)}
                className="rv-btn-blue rv-focus mt-auto inline-flex items-center justify-center px-4 py-2 text-sm"
              >
                Read Review
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
