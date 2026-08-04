import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { OperatorCompliance } from '@/components/compliance';
import { JsonLd } from '@/components/json-ld';
import { OutboundLink } from '@/components/outbound-link';
import { Rating } from '@/components/rating';
import { getActiveOffers, getPublishedReview } from '@/lib/data/content';
import { getOperatorForReview } from '@/lib/data/operators';
import { isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
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

  const canonicalPath = `/${marketCode}/reviews/${op.slug}`;

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
          { name: MARKET_LABELS[marketCode], path: `/${marketCode}` },
          { name: 'Reviews', path: `/${marketCode}` },
          { name: op.name, path: canonicalPath },
        ]}
      />

      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">{op.name} review</h1>
          <Rating value={op.rating} />
        </div>
        {op.summary && <p className="text-gray-600 dark:text-gray-300">{op.summary}</p>}
        <OperatorCompliance
          operatorType={op.operatorType}
          market={marketCode}
          licenceAuthority={op.licenceAuthority}
          licenceNumber={op.licenceNumber}
          density="block"
        />
        {op.trackingUrl && (
          <OutboundLink
            href={op.trackingUrl}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Visit {op.name}
          </OutboundLink>
        )}
      </header>

      {(op.pros.length > 0 || op.cons.length > 0) && (
        <section className="grid gap-6 sm:grid-cols-2">
          {op.pros.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                What we like
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-600 dark:text-gray-300">
                {op.pros.map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </ul>
            </div>
          )}
          {op.cons.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-rose-700 dark:text-rose-400">
                What to watch
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-600 dark:text-gray-300">
                {op.cons.map((con, i) => (
                  <li key={i}>{con}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {offers.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Current offers</h2>
          <ul className="space-y-3">
            {offers.map((offer) => (
              <li
                key={offer.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{offer.title}</span>
                  {offer.code && (
                    <code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                      {offer.code}
                    </code>
                  )}
                </div>
                {offer.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {offer.description}
                  </p>
                )}
                {offer.terms && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{offer.terms}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {review?.body && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Our review</h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-200">
            {review.body.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {review.verdict && (
            <p className="border-l-4 border-emerald-500 pl-3 font-medium">{review.verdict}</p>
          )}
          {review.author && (
            <p className="text-sm text-gray-500 dark:text-gray-400">By {review.author}</p>
          )}
        </section>
      )}
    </div>
  );
}
