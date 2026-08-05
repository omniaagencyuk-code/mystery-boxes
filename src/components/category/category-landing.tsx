import Image from 'next/image';
import Link from 'next/link';

import { FaqAccordion } from '@/components/faq-accordion';
import { Markdown } from '@/components/markdown';
import { PlatformRankingCard } from '@/components/platform-ranking-card';
import { CheckIcon, ShieldIcon } from '@/components/review/icons';
import { marketPath, type MarketCode } from '@/lib/geo';
import type { CategoryPageData } from '@/lib/data/category-page';

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted">
      <span className="text-success">
        <CheckIcon width={15} height={15} />
      </span>
      {children}
    </span>
  );
}

/**
 * Full category landing template, driven entirely by the category record and its
 * real operators, offers, shortcuts, brands and FAQs. Sections render only when
 * they have content, so a sparse category still looks intentional. The category
 * accent colour is used sparingly for hero lighting.
 */
export function CategoryLanding({
  data,
  market,
}: {
  data: CategoryPageData;
  market: MarketCode;
}) {
  const { category, operators, offerTitleByOperator, verifiedOfferCount, shortcuts, brands, faqs } = data;
  // Hex so an alpha suffix can be appended for the hero glow.
  const accent = category.accent_color?.trim() || '#8157ff';
  const heading = category.h1 || `Best ${category.name}`;
  const topRated = operators.slice(0, 5);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="grid items-center gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            {heading}
          </h1>
          {(category.description || category.intro) && (
            <p className="max-w-xl text-lg text-muted">{category.description}</p>
          )}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <div className="text-2xl font-extrabold text-ink">{operators.length}</div>
              <div className="text-xs text-muted">Sites reviewed</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-ink">{verifiedOfferCount}</div>
              <div className="text-xs text-muted">Verified offers</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <TrustItem>Independent reviews</TrustItem>
            <TrustItem>Verified offers</TrustItem>
          </div>
        </div>

        {category.hero_image_url && (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line">
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{ background: `radial-gradient(600px 300px at 70% 0%, ${accent}22, transparent)` }}
            />
            <Image
              src={category.hero_image_url}
              alt={`${category.name} artwork`}
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
              priority
            />
          </div>
        )}
      </section>

      {/* Shortcut chips */}
      {shortcuts.length > 0 && (
        <nav aria-label="Category shortcuts" className="flex flex-wrap gap-2">
          {shortcuts.map((chip, i) => {
            const cls =
              'rounded-full border border-line bg-surface/60 px-4 py-1.5 text-sm text-muted hover:border-primary/40 hover:text-ink';
            return chip.target ? (
              <Link key={i} href={chip.target} className={cls}>
                {chip.label}
              </Link>
            ) : (
              <span key={i} className={cls}>
                {chip.label}
              </span>
            );
          })}
        </nav>
      )}

      {/* Top rated */}
      {topRated.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ink">Top rated {category.name}</h2>
            <Link href={marketPath(market, '/reviews')} className="text-sm font-semibold text-accent hover:underline">
              View all sites
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {topRated.map((op, i) => (
              <PlatformRankingCard
                key={op.id}
                operator={op}
                rank={i + 1}
                market={market}
                offerTitle={offerTitleByOperator[op.id] ?? null}
                primaryCta="visit"
              />
            ))}
          </div>
        </section>
      )}

      {/* Editorial intro + brands sidebar */}
      {(category.intro || brands.length > 0) && (
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            {category.intro ? (
              <Markdown>{category.intro}</Markdown>
            ) : (
              <p className="text-muted">More about {category.name} coming soon.</p>
            )}
          </div>
          {brands.length > 0 && (
            <aside className="h-fit rounded-2xl border border-line bg-surface/60 p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted">Popular brands</div>
              <ul className="mt-3 space-y-2">
                {brands.map((brand, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-ink">
                    <span style={{ color: accent }}>
                      <ShieldIcon width={16} height={16} />
                    </span>
                    {brand}
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-ink">Frequently asked questions</h2>
          <FaqAccordion items={faqs} />
        </section>
      )}

      {/* How we rank */}
      <section className="rounded-2xl border border-line bg-surface/40 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">How we rank {category.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              We compare these sites on trust and safety, prize quality, payouts, offers, payments,
              shipping and user experience, so you can choose with confidence.
            </p>
          </div>
          <Link
            href={marketPath(market, '/compare')}
            className="shrink-0 rounded-lg border border-line px-5 py-2.5 text-center text-sm font-bold text-ink hover:bg-elevated"
          >
            Compare sites
          </Link>
        </div>
      </section>
    </div>
  );
}
