import type { Metadata } from 'next';
import Link from 'next/link';

import { absoluteUrl } from '@/lib/seo';
import { MARKET_LABELS, SUPPORTED_MARKETS } from '@/lib/geo';

// Static market chooser. We deliberately do NOT redirect based on IP: most
// crawlers originate in the US, and a hard redirect would stop the UK section
// being indexed. Visitors pick a region; the soft-switch banner on market pages
// nudges anyone who looks to be in the other market.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Choose your region',
  description: 'Pick your region to see mystery box operators available to you.',
  alternates: {
    canonical: absoluteUrl('/'),
    languages: {
      'en-GB': absoluteUrl('/uk'),
      'en-US': absoluteUrl('/us'),
      'x-default': absoluteUrl('/'),
    },
  },
};

export default function MarketChooser() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center gap-10 px-6 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Mystery-Boxes.com
        </h1>
        <p className="text-lg text-muted">
          Choose your region to see the operators available to you.
        </p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        {SUPPORTED_MARKETS.map((market) => (
          <Link
            key={market}
            href={`/${market}`}
            className="u-glass rounded-xl p-8 text-lg font-bold text-ink transition-all hover:text-primary"
          >
            {MARKET_LABELS[market]}
          </Link>
        ))}
      </div>
    </main>
  );
}
