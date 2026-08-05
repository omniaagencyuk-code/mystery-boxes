'use client';

import { useEffect, useState } from 'react';

import { XIcon } from '@/components/review/icons';
import { resolveCta, type CtaSources } from '@/lib/reviews/affiliate';

/**
 * Dismissible sticky offer bar for mobile, revealed after the reader scrolls
 * past the main offer. Renders only on small screens and only when a usable
 * outbound URL exists. Uses the same tracked CTA resolution as the rest of the
 * page.
 */
export function MobileStickyOffer({
  sources,
  ctaLabel,
  platformName,
  page,
}: {
  sources: CtaSources;
  ctaLabel: string;
  platformName: string;
  page: string;
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const target = resolveCta(sources, { placement: 'mobile_sticky', label: ctaLabel, page });
  if (!target || dismissed || !visible) return null;

  return (
    <div className="review-root fixed inset-x-0 bottom-0 z-40 border-t border-[var(--rv-border)] bg-[var(--rv-bg-2)]/95 p-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-[var(--rv-text)]">{platformName}</div>
          <div className="truncate text-xs text-[var(--rv-muted)]">Welcome offer available</div>
        </div>
        <a
          href={target.href}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          data-placement="mobile_sticky"
          className="rv-btn-offer rv-focus inline-flex shrink-0 items-center justify-center px-5 py-2.5 text-sm"
        >
          {ctaLabel}
        </a>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss offer"
          className="rv-focus shrink-0 rounded-md p-1.5 text-[var(--rv-muted)] hover:text-[var(--rv-text)]"
        >
          <XIcon width={18} height={18} />
        </button>
      </div>
    </div>
  );
}
