import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Markdown } from '@/components/markdown';
import { JsonLd } from '@/components/json-ld';
import { OutboundLink } from '@/components/outbound-link';
import { ReviewBonusBanner } from '@/components/review-bonus-banner';
import { getActiveOffers, getPublishedReview } from '@/lib/data/content';
import { getOperatorForReview } from '@/lib/data/operators';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { getRequestGeoContext } from '@/lib/request-context';
import { marketAlternates, operatorReviewJsonLd } from '@/lib/seo';

type Params = { market: string; operator: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { market, operator } = await params;
  if (!isSupportedMarket(market)) return {};

  // Empty geo chain: metadata does not depend on the visitor. The page itself
  // enforces the geo block and 404s when needed.
  const found = await getOperatorForReview(market, operator, []);
  const alternates = marketAlternates(market, `/reviews/${operator}`);
  if (!found) return { alternates };

  const review = await getPublishedReview(found.id, found.marketId);
  const description =
    review?.verdict || found.operator.summary || `Our review of ${found.operator.name}.`;

  return {
    title: `${found.operator.name} review`,
    description,
    alternates,
  };
}

export default async function OperatorReviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { market, operator } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const { geoChain } = await getRequestGeoContext();
  const found = await getOperatorForReview(marketCode, operator, geoChain);
  if (!found) notFound();

  const { operator: op, id, marketId } = found;
  const [review, offers] = await Promise.all([
    getPublishedReview(id, marketId),
    getActiveOffers(id),
  ]);

  const primaryOffer = offers[0] ?? null;
  const extraOffers = offers.slice(1);
  const canonicalPath = marketPath(marketCode, `/reviews/${op.slug}`);
  const intro = op.summary ?? null;

  return (
    <div className="space-y-8">
      <JsonLd
        data={operatorReviewJsonLd({
          operatorName: op.name,
          canonicalPath,
          rating: op.rating,
          reviewBody: review?.body ?? null,
          verdict: review?.verdict ?? null,
          author: review?.author ?? null,
          datePublished: review?.published_at ?? null,
        })}
      />

      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
          { name: 'Reviews', path: marketPath(marketCode) },
          { name: op.name, path: canonicalPath },
        ]}
      />

      {/* 1. Page title */}
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {op.name} review
      </h1>

      {/* 2. Welcome offer banner (clickable CTA) */}
      <ReviewBonusBanner operator={op} market={marketCode} offer={primaryOffer} />

      {/* 3. Intro */}
      {intro && (
        <section className="max-w-3xl">
          <p className="text-lg leading-relaxed text-muted">{intro}</p>
        </section>
      )}

      {/* 4. Pros and cons */}
      {(op.pros.length > 0 || op.cons.length > 0) && (
        <section className="grid gap-4 sm:grid-cols-2">
          {op.pros.length > 0 && (
            <div className="rounded-xl border border-success/25 bg-success/5 p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-success">
                <span aria-hidden>+</span> What we like
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-ink/90">
                {op.pros.map((pro, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 text-success" aria-hidden>
                      ✓
                    </span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {op.cons.length > 0 && (
            <div className="rounded-xl border border-danger/25 bg-danger/5 p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-danger">
                <span aria-hidden>−</span> What to watch
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-ink/90">
                {op.cons.map((con, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 text-danger" aria-hidden>
                      ✕
                    </span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 5. Review body */}
      {review?.body && (
        <section className="space-y-3">
          <Markdown>{review.body}</Markdown>
          {review.verdict && (
            <p className="border-l-4 border-primary pl-3 font-semibold text-ink">{review.verdict}</p>
          )}
          {review.author && <p className="text-sm text-muted">By {review.author}</p>}
        </section>
      )}

      {/* 6. Any additional offers beyond the banner */}
      {extraOffers.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-ink">More offers</h2>
          <ul className="space-y-3">
            {extraOffers.map((offer) => (
              <li key={offer.id} className="u-glass rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink">{offer.title}</span>
                  {offer.code && (
                    <code className="rounded bg-elevated px-2 py-1 text-xs text-ink">
                      {offer.code}
                    </code>
                  )}
                </div>
                {offer.description && <p className="mt-1 text-sm text-muted">{offer.description}</p>}
                {offer.terms && <p className="mt-2 text-xs text-muted">{offer.terms}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 7. Closing CTA */}
      {op.trackingUrl && (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface/50 p-5">
          <p className="font-semibold text-ink">Ready to try {op.name}?</p>
          <OutboundLink
            href={op.trackingUrl}
            className="u-btn-primary inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-bold"
          >
            {primaryOffer ? 'Get offer' : `Visit ${op.name}`}
          </OutboundLink>
        </section>
      )}
    </div>
  );
}
