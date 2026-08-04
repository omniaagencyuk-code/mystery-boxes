'use client';

import { useState } from 'react';

import {
  BANNER_DISMISS_COOKIE,
  marketBasePath,
  MARKET_LABELS,
  type MarketCode,
} from '@/lib/geo';

/**
 * Soft market suggestion. Shown when the visitor's detected market differs from
 * the one they are viewing. It offers to switch, it never redirects. Dismissal
 * is stored in a cookie that the proxy reads so the banner stays hidden.
 *
 * The switch target is computed on the client by swapping the leading market
 * segment of the current path, so switching keeps the visitor on the equivalent
 * page (for example /uk/reviews/x becomes /us/reviews/x).
 */
export function MarketSwitchBanner({
  currentMarket,
  suggestMarket,
}: {
  currentMarket: MarketCode;
  suggestMarket: MarketCode;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  function dismiss() {
    // One year, site-wide.
    document.cookie = `${BANNER_DISMISS_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setDismissed(true);
  }

  function targetHref() {
    if (typeof window === 'undefined') return marketBasePath(suggestMarket) || '/';
    const { pathname, search } = window.location;

    // Strip the current market's prefix to get the sub-path, then re-apply the
    // suggested market's prefix. The root market has no prefix.
    const curBase = marketBasePath(currentMarket);
    let sub =
      curBase && (pathname === curBase || pathname.startsWith(`${curBase}/`))
        ? pathname.slice(curBase.length)
        : curBase
          ? ''
          : pathname;
    if (sub === '/') sub = '';

    const target = `${marketBasePath(suggestMarket)}${sub}` || '/';
    return `${target}${search}`;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-sm">
        <span>
          It looks like you are in the {MARKET_LABELS[suggestMarket]}. Would you
          like to see that region instead?
        </span>
        <div className="flex items-center gap-3">
          <a
            href={targetHref()}
            className="rounded-md bg-amber-600 px-3 py-1 font-medium text-white hover:bg-amber-500"
          >
            Switch to {MARKET_LABELS[suggestMarket]}
          </a>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md px-2 py-1 font-medium underline underline-offset-2 hover:no-underline"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
