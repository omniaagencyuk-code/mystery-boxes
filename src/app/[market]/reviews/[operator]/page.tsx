import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { ReviewContentRenderer, type RenderContext } from '@/components/review/content-renderer';
import { ReviewFaq } from '@/components/review/faq';
import { ReviewFooterMeta } from '@/components/review/footer-meta';
import { MobileStickyOffer } from '@/components/review/mobile-sticky-offer';
import { PaymentMethodsPanel } from '@/components/review/payment-methods';
import { SectionHeading, ReviewSection } from '@/components/review/primitives';
import { ProsConsCta } from '@/components/review/pros-cons-cta';
import { RelatedReviews } from '@/components/review/related-reviews';
import { ReviewHero } from '@/components/review/review-hero';
import { ReviewSectionNav, type SectionNavItem } from '@/components/review/section-nav';
import { ReviewSummaryGrid } from '@/components/review/summary-grid';
import { WelcomeOfferBanner } from '@/components/review/welcome-offer-banner';
import { getReviewPageData } from '@/lib/data/review-page';
import { marketPath, isSupportedMarket, MARKET_LABELS, type MarketCode } from '@/lib/geo';
import { getRequestGeoContext } from '@/lib/request-context';
import type { CtaSources } from '@/lib/reviews/affiliate';
import { buildQuickFacts } from '@/lib/reviews/quick-facts';
import {
  absoluteUrl,
  faqJsonLd,
  marketAlternates,
  platformReviewJsonLd,
} from '@/lib/seo';

type Params = { market: string; operator: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { market, operator } = await params;
  if (!isSupportedMarket(market)) return {};
  const marketCode = market as MarketCode;

  // Metadata does not depend on the visitor; the page itself enforces geo-block.
  const data = await getReviewPageData(marketCode, operator, []);
  const alternates = marketAlternates(marketCode, `/reviews/${operator}`);
  if (!data) return { alternates };

  const { platform, review } = data;
  const title = review.seoTitle?.trim() || `${platform.name} Review`;
  const description =
    review.metaDescription?.trim() ||
    review.verdict ||
    platform.summary ||
    `Our independent review of ${platform.name}.`;
  const ogImage = review.ogImageUrl || platform.heroImageUrl || undefined;

  if (review.canonicalUrl) alternates.canonical = review.canonicalUrl;

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: 'article',
      url: (alternates.canonical as string) ?? absoluteUrl(marketPath(marketCode, `/reviews/${operator}`)),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
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
  const data = await getReviewPageData(marketCode, operator, geoChain);
  if (!data) notFound();

  const { platform, review, offer, payments, related, affiliateSlug } = data;
  const pagePath = marketPath(marketCode, `/reviews/${platform.slug}`);
  const canonicalPath = review.canonicalUrl ?? pagePath;

  const sources: CtaSources = {
    affiliateSlug,
    trackingUrl: platform.trackingUrl,
    websiteUrl: platform.websiteUrl,
  };

  const facts = buildQuickFacts({
    operatorType: platform.operatorType,
    foundedYear: platform.foundedYear,
    owner: platform.owner,
    minAge: platform.minAge,
    availability: platform.availability,
    licenceAuthority: platform.licenceAuthority,
    licenceNumber: platform.licenceNumber,
    buyback: platform.buyback,
    kycRequired: platform.kycRequired,
    shippingInfo: platform.shippingInfo,
    mobileApp: platform.mobileApp,
  });

  const hasPros = platform.pros.length > 0;
  const hasCons = platform.cons.length > 0;
  const hasEditorial = Boolean(review.body?.trim()) || review.blocks.length > 0;
  const hasPaymentBlock = review.blocks.some((b) => b.type === 'PAYMENT_PANEL');
  const showPaymentsSection = payments.length > 0 && !hasPaymentBlock;

  const navItems: SectionNavItem[] = [{ id: 'overview', label: 'Overview' }];
  if (hasPros || hasCons) navItems.push({ id: 'pros-cons', label: 'Pros & Cons' });
  if (hasEditorial) navItems.push({ id: 'review', label: 'Full Review' });
  if (showPaymentsSection) navItems.push({ id: 'payments', label: 'Payments' });
  if (review.faqs.length > 0) navItems.push({ id: 'faq', label: 'FAQ' });

  const renderContext: RenderContext = { platform, payments, sources, page: pagePath };
  const ctaLabel = offer?.state.usable ? offer.ctaLabel?.trim() || 'Claim Offer' : 'Visit Site';

  return (
    <div className="review-root relative left-1/2 w-screen -translate-x-1/2 -mt-8 min-h-screen md:-mt-12 -mb-8 md:-mb-12">
      <JsonLd
        data={platformReviewJsonLd({
          platformName: platform.name,
          canonicalPath,
          score: review.overallScore,
          headline: review.verdict,
          reviewBody: review.body,
          author: review.author,
          reviewer: review.reviewer,
          datePublished: review.publishedAt,
          dateModified: review.updatedAt,
        })}
      />
      {review.faqs.length > 0 && <JsonLd data={faqJsonLd(review.faqs)} />}

      <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mb-5">
          <Breadcrumbs
            items={[
              { name: MARKET_LABELS[marketCode], path: marketPath(marketCode) },
              { name: 'Reviews', path: marketPath(marketCode, '/reviews') },
              { name: `${platform.name} Review`, path: pagePath },
            ]}
          />
        </div>

        <div className="space-y-6">
          {/* Hero */}
          <ReviewHero platform={platform} review={review} verified={Boolean(review.lastCheckedAt)} />

          {/* Welcome offer */}
          <WelcomeOfferBanner platform={platform} offer={offer} sources={sources} page={pagePath} />

          {/* Sticky section nav */}
          <ReviewSectionNav items={navItems} />

          {/* Overview: summary grid */}
          <ReviewSection id="overview" className="pt-2">
            <ReviewSummaryGrid review={review} facts={facts} payments={payments} />
          </ReviewSection>

          {/* Pros, cons and commercial CTA */}
          {(hasPros || hasCons) && (
            <ReviewSection id="pros-cons">
              <ProsConsCta platform={platform} sources={sources} page={pagePath} />
            </ReviewSection>
          )}

          {/* Main editorial review */}
          {hasEditorial && (
            <ReviewSection id="review" className="pt-4">
              <div className="mb-6">
                <SectionHeading>{platform.name} Full Review</SectionHeading>
              </div>
              <ReviewContentRenderer
                leadMarkdown={review.body}
                blocks={review.blocks}
                context={renderContext}
              />
            </ReviewSection>
          )}

          {/* Standalone payments section (when not already a content block) */}
          {showPaymentsSection && (
            <ReviewSection id="payments" className="space-y-4 pt-4">
              <SectionHeading>Payments and withdrawals</SectionHeading>
              <PaymentMethodsPanel methods={payments} />
            </ReviewSection>
          )}

          {/* FAQ */}
          {review.faqs.length > 0 && (
            <ReviewSection id="faq" className="pt-4">
              <ReviewFaq items={review.faqs} />
            </ReviewSection>
          )}

          {/* Related reviews */}
          {related.length > 0 && (
            <section className="pt-4">
              <RelatedReviews related={related} market={marketCode} />
            </section>
          )}

          {/* Provenance and disclosures */}
          <ReviewFooterMeta review={review} market={marketCode} />
        </div>
      </div>

      {/* Mobile sticky offer */}
      <MobileStickyOffer
        sources={sources}
        ctaLabel={ctaLabel}
        platformName={platform.name}
        page={pagePath}
      />
    </div>
  );
}
