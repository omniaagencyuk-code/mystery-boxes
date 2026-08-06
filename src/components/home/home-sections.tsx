import Link from 'next/link';

import { FaqAccordion } from '@/components/faq-accordion';
import { Newsletter } from '@/components/home/newsletter';
import { Markdown } from '@/components/markdown';
import { OutboundLink } from '@/components/outbound-link';
import { PlatformRankingCard } from '@/components/platform-ranking-card';
import { Rating } from '@/components/rating';
import { HomeArticle } from '@/components/home/home-article';
import type { GuideCard } from '@/lib/data/content';
import type { HomeArticleBlock, HomepageConfig } from '@/lib/data/homepage';
import { marketPath, type MarketCode } from '@/lib/geo';
import type { OperatorSummary } from '@/lib/models';
import type { HomepageSectionType, OfferRow } from '@/lib/supabase/types';

export interface HomeData {
  market: MarketCode;
  operators: OperatorSummary[];
  categories: { id: string; slug: string; name: string }[];
  offers: { operator: OperatorSummary; offer: OfferRow }[];
  offerTitleByOperator: Record<string, string>;
  guides: GuideCard[];
  latestReviewed: OperatorSummary[];
  featured: OperatorSummary[];
  article: HomeArticleBlock[];
}

function SectionHead({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-ink">{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-semibold text-accent hover:underline">
          {linkLabel ?? 'View all'}
        </Link>
      )}
    </div>
  );
}

function rankingGrid(operators: OperatorSummary[], data: HomeData, primaryCta: 'review' | 'visit') {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {operators.slice(0, 5).map((op, i) => (
        <PlatformRankingCard
          key={op.id}
          operator={op}
          rank={i + 1}
          market={data.market}
          offerTitle={data.offerTitleByOperator[op.id] ?? null}
          primaryCta={primaryCta}
        />
      ))}
    </div>
  );
}

function renderSection(type: HomepageSectionType, config: HomepageConfig, data: HomeData) {
  const { market } = data;
  switch (type) {
    case 'top_rated':
      if (data.operators.length === 0) return null;
      return (
        <section className="space-y-5">
          <SectionHead title="Top rated mystery box websites" href={marketPath(market, '/reviews')} />
          {rankingGrid(data.operators, data, 'review')}
        </section>
      );

    case 'featured_brands':
      if (data.featured.length === 0) return null;
      return (
        <section className="space-y-5">
          <SectionHead title="Featured brands" />
          {rankingGrid(data.featured, data, 'visit')}
        </section>
      );

    case 'latest_reviews':
      if (data.latestReviewed.length === 0) return null;
      return (
        <section className="space-y-5">
          <SectionHead title="Latest reviews" href={marketPath(market, '/reviews')} />
          {rankingGrid(data.latestReviewed, data, 'review')}
        </section>
      );

    case 'verified_offers': {
      const shown = data.offers.slice(0, 4);
      if (shown.length === 0) return null;
      return (
        <section className="space-y-5">
          <SectionHead title="Latest verified offers" href={marketPath(market, '/promo-codes')} linkLabel="View all offers" />
          <div className="grid gap-3">
            {shown.map(({ operator, offer }) => (
              <div key={offer.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface/60 p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="font-bold text-ink">{operator.name}</div>
                  <div className="text-sm text-success">{offer.title}</div>
                </div>
                <div className="flex items-center gap-2">
                  {offer.code && (
                    <code className="rounded border border-dashed border-primary/50 bg-elevated px-2 py-1 text-xs font-bold tracking-wider text-ink">
                      {offer.code}
                    </code>
                  )}
                  {operator.trackingUrl && (
                    <OutboundLink
                      href={operator.trackingUrl}
                      className="rounded-lg bg-success px-4 py-2 text-sm font-bold text-[#04120a] hover:brightness-105"
                    >
                      Claim
                    </OutboundLink>
                  )}
                  <Link href={marketPath(market, `/promo-codes/${operator.slug}`)} className="text-sm font-semibold text-accent hover:underline">
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case 'category_cards':
      if (data.categories.length === 0) return null;
      return (
        <section className="space-y-5">
          <SectionHead title="Browse by category" href={marketPath(market, '/categories')} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.categories.map((cat) => (
              <Link
                key={cat.id}
                href={marketPath(market, `/${cat.slug}`)}
                className="rounded-xl border border-line bg-surface/60 p-4 font-semibold text-ink transition-colors hover:border-primary/40 hover:text-primary"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      );

    case 'comparison': {
      const rows = data.operators.slice(0, 4);
      if (rows.length < 2) return null;
      return (
        <section className="space-y-5">
          <SectionHead title="Compare the top sites" href={marketPath(market, '/compare')} linkLabel="Compare all" />
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[420px] text-sm">
              <tbody>
                {rows.map((op, i) => (
                  <tr key={op.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-semibold text-ink">
                      {i + 1}. {op.name}
                    </td>
                    <td className="px-4 py-3"><Rating value={op.rating} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link href={marketPath(market, `/reviews/${op.slug}`)} className="text-sm font-semibold text-accent hover:underline">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );
    }

    case 'latest_guides': {
      const shown = data.guides.slice(0, 3);
      if (shown.length === 0) return null;
      return (
        <section className="space-y-5">
          <SectionHead title="Latest guides" href={marketPath(market, '/guides')} />
          <div className="grid gap-4 sm:grid-cols-3">
            {shown.map((g) => {
              const tail = g.slug.replace(/^guides\//, '');
              return (
                <Link
                  key={g.slug}
                  href={marketPath(market, `/guides/${tail}`)}
                  className="group rounded-2xl border border-line bg-surface/60 p-4 transition-colors hover:border-primary/40"
                >
                  {g.guide_category && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-accent">{g.guide_category}</span>
                  )}
                  <div className="mt-1 font-bold text-ink group-hover:text-primary">{g.title}</div>
                  {(g.summary ?? g.meta_description) && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{g.summary ?? g.meta_description}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      );
    }

    case 'best_sites_article':
      if (data.article.length === 0) return null;
      return (
        <section className="space-y-5">
          <HomeArticle blocks={data.article} />
        </section>
      );

    case 'how_we_rate':
      if (!config.settings.howWeRate) return null;
      return (
        <section className="space-y-4 rounded-2xl border border-line bg-surface/40 p-6">
          <h2 className="text-2xl font-bold text-ink">How we rate</h2>
          <Markdown>{config.settings.howWeRate}</Markdown>
        </section>
      );

    case 'trust':
      if (!config.settings.trustContent) return null;
      return (
        <section className="space-y-4 rounded-2xl border border-line bg-surface/40 p-6">
          <h2 className="text-2xl font-bold text-ink">Why trust us</h2>
          <Markdown>{config.settings.trustContent}</Markdown>
        </section>
      );

    case 'faq':
      if (config.faqs.length === 0) return null;
      return (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-ink">Frequently asked questions</h2>
          <FaqAccordion items={config.faqs} />
        </section>
      );

    case 'newsletter':
      return (
        <Newsletter
          heading={config.settings.newsletterHeading}
          body={config.settings.newsletterBody}
          market={market}
        />
      );

    case 'final_cta': {
      const s = config.settings;
      if (!s.finalCtaHeading && !s.finalCtaLabel) return null;
      return (
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-gradient-to-r from-primary/10 to-accent/5 p-8 text-center">
          {s.finalCtaHeading && <h2 className="text-2xl font-extrabold text-ink">{s.finalCtaHeading}</h2>}
          {s.finalCtaBody && <p className="max-w-xl text-muted">{s.finalCtaBody}</p>}
          {s.finalCtaLabel && s.finalCtaHref && (
            <Link href={s.finalCtaHref} className="u-btn-primary mt-1 rounded-lg px-6 py-3 text-sm font-bold">
              {s.finalCtaLabel}
            </Link>
          )}
        </section>
      );
    }

    default:
      return null;
  }
}

/** Renders the homepage's modular sections in the CMS-configured order. */
export function HomeSections({ config, data }: { config: HomepageConfig; data: HomeData }) {
  return (
    <>
      {config.sections.map((type) => {
        const node = renderSection(type, config, data);
        return node ? <div key={type}>{node}</div> : null;
      })}
    </>
  );
}
