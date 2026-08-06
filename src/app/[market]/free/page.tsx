import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { FaqAccordion } from '@/components/faq-accordion';
import { FreeFilters, type FreeFilterOption } from '@/components/free/free-filters';
import { FreeOfferTable } from '@/components/free/free-offer-table';
import {
  FreeBody,
  FreeCategoryCards,
  FreeFeatured,
  FreeHero,
  FreeTrust,
} from '@/components/free/free-sections';
import { Newsletter } from '@/components/home/newsletter';
import { JsonLd } from '@/components/json-ld';
import { SectionHeading } from '@/components/review/primitives';
import { getFreePageConfig, getFreeOfferPool } from '@/lib/data/free';
import { applyFreeFilters, type FreeFilters as FreeFilterValues, type FreeSort } from '@/lib/free/offers';
import { absoluteUrl, faqJsonLd } from '@/lib/seo';
import type { OfferType, PrizeValueBand } from '@/lib/supabase/types';

type SearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

const SORTS = new Set<FreeSort>(['rating', 'last_verified', 'category', 'offer_type', 'platform']);
const OFFER_TYPES = new Set<OfferType>([
  'welcome_box', 'daily_box', 'promo_code', 'no_deposit', 'referral', 'daily_reward', 'free_pack',
]);
const PRIZE_BANDS = new Set<PrizeValueBand>(['under_20', '20_plus', '50_plus', '100_plus', 'premium']);
const AVAILABILITY = new Set(['us', 'uk', 'both', 'global']);

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getFreePageConfig();
  const noindex = settings.indexStatus === 'noindex' || !settings.published;
  return {
    title: settings.seoTitle || `${settings.h1} | Mystery Boxes`,
    description: settings.metaDescription || settings.heroIntro,
    alternates: { canonical: settings.canonicalUrl || absoluteUrl('/free') },
    openGraph: settings.ogImageUrl ? { images: [settings.ogImageUrl] } : undefined,
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function FreePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const [config, pool] = await Promise.all([getFreePageConfig(), getFreeOfferPool()]);
  const { settings } = config;

  if (!settings.published) notFound();

  const now = new Date();

  // Parse and validate filters from the URL (ignore anything unrecognised).
  const rawSort = one(sp.sort);
  const rawType = one(sp.type);
  const rawPrize = one(sp.prize);
  const rawAvail = one(sp.availability);
  const rawRating = one(sp.rating);
  const features = (one(sp.features) ?? '').split(',').filter(Boolean);
  const filters: FreeFilterValues = {
    category: one(sp.category) ?? null,
    offerType: rawType && OFFER_TYPES.has(rawType as OfferType) ? (rawType as OfferType) : null,
    prize: rawPrize && PRIZE_BANDS.has(rawPrize as PrizeValueBand) ? (rawPrize as PrizeValueBand) : null,
    minRating: rawRating ? Number(rawRating) || null : null,
    availability: rawAvail && AVAILABILITY.has(rawAvail) ? (rawAvail as FreeFilterValues['availability']) : null,
    features,
    sort: rawSort && SORTS.has(rawSort as FreeSort) ? (rawSort as FreeSort) : (settings.tableDefaultSort as FreeSort),
    page: Number(one(sp.page)) || 1,
    pageSize: settings.tablePageSize,
  };

  const offerPage = applyFreeFilters(pool, filters);

  // Category filter options: only categories that actually have offers.
  const catMap = new Map<string, string>();
  for (const r of pool) {
    if (r.categorySlug && r.categoryName && r.offerId) catMap.set(r.categorySlug, r.categoryName);
  }
  const categoryOptions: FreeFilterOption[] = Array.from(catMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Preserve params for table sort/pagination links.
  const linkParams: Record<string, string | undefined> = {
    category: filters.category ?? undefined,
    type: filters.offerType ?? undefined,
    prize: filters.prize ?? undefined,
    rating: rawRating || undefined,
    availability: filters.availability ?? undefined,
    features: features.length ? features.join(',') : undefined,
    sort: filters.sort,
  };

  const renderSection = (type: string) => {
    switch (type) {
      case 'HERO':
        return <FreeHero key={type} settings={settings} stats={config.stats} />;
      case 'FILTERS':
        return <FreeFilters key={type} categories={categoryOptions} resultCount={offerPage.total} />;
      case 'FEATURED_OFFERS':
        return <FreeFeatured key={type} featured={config.featured} now={now} />;
      case 'OFFER_TABLE':
        return (
          <section key={type} id="offers" aria-labelledby="offers-heading" className="scroll-mt-24">
            <SectionHeading>
              <span id="offers-heading">Free Offers</span>
            </SectionHeading>
            <div className="mt-4">
              <FreeOfferTable
                page={offerPage}
                params={linkParams}
                ctaFallback={settings.tableCtaFallback}
                emptyState={settings.tableEmptyState}
                now={now}
              />
            </div>
          </section>
        );
      case 'CATEGORY_CARDS':
        return <FreeCategoryCards key={type} cards={config.categoryCards} />;
      case 'BODY_CONTENT':
        return <FreeBody key={type} blocks={config.bodyBlocks} />;
      case 'FAQ':
        return config.faqs.length > 0 ? (
          <section key={type} aria-labelledby="faq-heading">
            <SectionHeading>
              <span id="faq-heading">Frequently Asked Questions</span>
            </SectionHeading>
            <div className="mt-4">
              <FaqAccordion items={config.faqs} />
            </div>
          </section>
        ) : null;
      case 'NEWSLETTER':
        return (
          <Newsletter
            key={type}
            heading={settings.newsletterHeading}
            body={settings.newsletterBody}
            market=""
            placeholder={settings.newsletterPlaceholder}
            buttonLabel={settings.newsletterButton}
            privacyNote={settings.newsletterPrivacy}
          />
        );
      case 'TRUST_STRIP':
        return <FreeTrust key={type} items={config.trustItems} />;
      default:
        return null;
    }
  };

  return (
    <div className="review-root relative left-1/2 -mt-8 -mb-8 min-h-screen w-screen -translate-x-1/2 md:-mt-12 md:-mb-12">
      <JsonLd data={faqJsonLd(config.faqs.map((f) => ({ question: f.question, answer: f.answer })))} />
      <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Free Mystery Boxes', path: '/free' }]} />
        <div className="mt-4 space-y-10">{config.sections.map(renderSection)}</div>
      </div>
    </div>
  );
}
