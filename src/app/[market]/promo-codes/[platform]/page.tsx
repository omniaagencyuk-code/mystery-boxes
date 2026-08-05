import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { CopyCode } from '@/components/promo/copy-code';
import { OutboundLink } from '@/components/outbound-link';
import { CheckIcon, ClockIcon } from '@/components/review/icons';
import { getActiveOffers, getMarketPromoOffers } from '@/lib/data/content';
import { getOperatorForReview } from '@/lib/data/operators';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { formatReviewDate } from '@/lib/reviews/format';
import { offerState } from '@/lib/reviews/offer-state';
import { getRequestGeoContext } from '@/lib/request-context';
import { marketAlternates } from '@/lib/seo';

type Params = { market: string; platform: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { market, platform } = await params;
  if (!isSupportedMarket(market)) return {};
  const marketCode = market as MarketCode;
  const alternates = marketAlternates(marketCode, `/promo-codes/${platform}`);

  const found = await getOperatorForReview(marketCode, platform, []);
  if (!found) return { alternates };

  return {
    title: `${found.operator.name} promo code and welcome offer`,
    description: `The current ${found.operator.name} welcome offer, promo code, eligibility and terms for the ${MARKET_LABELS[marketCode]}.`,
    alternates,
  };
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>
  );
}

export default async function PromoDetailPage({ params }: { params: Promise<Params> }) {
  const { market, platform } = await params;
  if (!isSupportedMarket(market)) notFound();
  const marketCode = market as MarketCode;

  const { geoChain } = await getRequestGeoContext();
  const found = await getOperatorForReview(marketCode, platform, geoChain);
  if (!found) notFound();
  const { operator: op, id } = found;

  const [offers, promo] = await Promise.all([
    getActiveOffers(id),
    getMarketPromoOffers(marketCode, geoChain),
  ]);
  const now = new Date();
  const primary = offers
    .map((offer) => ({ offer, state: offerState(offer, now) }))
    .find(({ state }) => state.usable);

  const alternatives = promo.filter(({ operator }) => operator.slug !== op.slug).slice(0, 3);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
          { name: 'Promo codes', path: marketPath(marketCode, '/promo-codes') },
          { name: op.name, path: marketPath(marketCode, `/promo-codes/${op.slug}`) },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main */}
        <div className="space-y-6">
          <header className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-line bg-elevated">
              {op.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary logo hosts
                <img src={op.logoUrl} alt={`${op.name} logo`} className="max-h-11 w-auto max-w-[80%] object-contain" />
              ) : (
                <span className="text-sm font-bold text-ink">{op.name}</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {op.name} promo code
              </h1>
              {primary ? (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm">
                  {primary.state.freshness === 'stale' ? (
                    <span className="inline-flex items-center gap-1 text-warning">
                      <ClockIcon width={14} height={14} /> Confirm on site
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-success">
                      <CheckIcon width={14} height={14} /> Active offer
                    </span>
                  )}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted">No current offer</p>
              )}
            </div>
          </header>

          {primary ? (
            <>
              <div className="rounded-2xl border border-success/40 bg-success/[0.06] p-6">
                <h2 className="text-xl font-extrabold text-ink">{primary.offer.title}</h2>
                {primary.offer.description && (
                  <p className="mt-1 text-muted">{primary.offer.description}</p>
                )}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {primary.offer.code ? (
                    <CopyCode code={primary.offer.code} className="sm:w-56" />
                  ) : (
                    <span className="rounded-lg border border-line bg-elevated px-3 py-2 text-center text-sm text-muted sm:w-56">
                      No code required
                    </span>
                  )}
                  {op.trackingUrl && (
                    <OutboundLink
                      href={op.trackingUrl}
                      className="rounded-lg bg-success px-6 py-2.5 text-center text-sm font-bold text-[#04120a] transition-[filter] hover:brightness-105"
                    >
                      Claim offer
                    </OutboundLink>
                  )}
                </div>
              </div>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink">How to claim</h2>
                <ol className="list-decimal space-y-1.5 pl-5 text-muted">
                  <li>Click through to {op.name} using the claim button.</li>
                  <li>
                    {primary.offer.code
                      ? `Enter the code ${primary.offer.code} when you sign up or at checkout.`
                      : 'The offer applies automatically, so there is no code to enter.'}
                  </li>
                  <li>Complete sign up and meet the eligibility terms to receive the offer.</li>
                </ol>
              </section>
            </>
          ) : (
            <div className="rounded-2xl border border-line bg-surface/60 p-6">
              <p className="text-muted">
                {op.name} does not have a verified offer with us right now. Check the site directly
                for the latest welcome offer.
              </p>
              {op.trackingUrl && (
                <OutboundLink
                  href={op.trackingUrl}
                  className="u-btn-primary mt-4 inline-flex rounded-lg px-5 py-2.5 text-sm font-bold"
                >
                  Visit {op.name}
                </OutboundLink>
              )}
            </div>
          )}

          <p className="text-sm text-muted">
            Affiliate disclosure. Links to {op.name} may be affiliate links, so we may earn a
            commission at no extra cost to you.{' '}
            <Link href={marketPath(marketCode, '/about')} className="text-accent hover:underline">
              Report an outdated offer
            </Link>
            .
          </p>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {primary && (
            <div className="rounded-2xl border border-line bg-surface/60 p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted">Offer details</div>
              <dl className="mt-1">
                {primary.offer.eligibility && <Fact label="Eligibility">{primary.offer.eligibility}</Fact>}
                {primary.offer.terms && <Fact label="Restrictions">{primary.offer.terms}</Fact>}
                {primary.offer.expires_at && (
                  <Fact label="Expires">{formatReviewDate(primary.offer.expires_at)}</Fact>
                )}
                {formatReviewDate(primary.state.lastCheckedISO) && (
                  <Fact label="Last verified">{formatReviewDate(primary.state.lastCheckedISO)}</Fact>
                )}
                {primary.offer.terms_url && (
                  <Fact label="Full terms">
                    <a
                      href={primary.offer.terms_url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Read the terms
                    </a>
                  </Fact>
                )}
              </dl>
              <Link
                href={marketPath(marketCode, `/reviews/${op.slug}`)}
                className="mt-4 inline-flex text-sm font-semibold text-accent hover:underline"
              >
                Read our {op.name} review
              </Link>
            </div>
          )}

          {alternatives.length > 0 && (
            <div className="rounded-2xl border border-line bg-surface/60 p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted">
                Other offers
              </div>
              <ul className="mt-3 space-y-3">
                {alternatives.map(({ operator, offer }) => (
                  <li key={offer.id}>
                    <Link
                      href={marketPath(marketCode, `/promo-codes/${operator.slug}`)}
                      className="block rounded-lg border border-line bg-elevated p-3 transition-colors hover:border-primary/40"
                    >
                      <span className="font-semibold text-ink">{operator.name}</span>
                      <span className="mt-0.5 block text-sm text-muted">{offer.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
