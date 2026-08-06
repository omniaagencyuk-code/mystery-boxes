import Image from 'next/image';
import Link from 'next/link';

import { OutboundLink } from '@/components/outbound-link';
import { Rating } from '@/components/rating';
import type { HomeArticleBlock, HomeArticlePlatform } from '@/lib/data/homepage';

function PlatformCard({ platform, badge, body }: { platform: HomeArticlePlatform; badge: string | null; body: string | null }) {
  return (
    <article className="rounded-2xl border border-line bg-surface/60 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {platform.logoUrl ? (
            <span className="relative h-12 w-12 flex-none overflow-hidden rounded-lg border border-line bg-elevated">
              <Image src={platform.logoUrl} alt={`${platform.name} logo`} fill sizes="48px" className="object-contain p-1" />
            </span>
          ) : null}
          <div>
            {badge && (
              <span className="mb-1 inline-block rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {badge}
              </span>
            )}
            <Link href={platform.reviewHref} className="block text-lg font-bold text-ink hover:text-primary">
              {platform.name}
            </Link>
          </div>
        </div>
        <Rating value={platform.rating} showNumber />
      </div>

      {body && <p className="mt-3 text-muted">{body}</p>}
      <p className="mt-2 text-xs text-muted">
        Available in <span className="font-medium text-ink">{platform.availabilityLabel}</span>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {platform.cta && (
          <OutboundLink
            href={platform.cta.href}
            data-placement="home_article"
            className="u-btn-primary rounded-lg px-5 py-2.5 text-sm font-bold"
          >
            Sign up
          </OutboundLink>
        )}
        <Link
          href={platform.reviewHref}
          className="rounded-lg border border-line px-5 py-2.5 text-sm font-bold text-ink hover:bg-elevated"
        >
          Read review
        </Link>
      </div>
    </article>
  );
}

/**
 * Renders the homepage article: editorial headings and paragraphs interleaved
 * with platform cards. Each card links to the operator's review and, when a
 * tracked affiliate link exists, a compliant "Sign up" outbound CTA.
 */
export function HomeArticle({ blocks }: { blocks: HomeArticleBlock[] }) {
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-5">
      {blocks.map((b) => {
        switch (b.type) {
          case 'H2':
            return (
              <h2 key={b.id} className="pt-4 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                {b.heading}
              </h2>
            );
          case 'H3':
            return (
              <h3 key={b.id} className="pt-2 text-lg font-bold text-ink">
                {b.heading}
              </h3>
            );
          case 'PARAGRAPH':
            return (
              <p key={b.id} className="max-w-3xl text-muted">
                {b.body}
              </p>
            );
          case 'CALLOUT':
            return (
              <div key={b.id} className="rounded-xl border border-line border-l-4 border-l-primary bg-surface/60 p-4 text-muted">
                {b.heading && <p className="font-semibold text-ink">{b.heading}</p>}
                {b.body && <p className="mt-1">{b.body}</p>}
              </div>
            );
          case 'PLATFORM_CARD':
            return b.platform ? (
              <PlatformCard key={b.id} platform={b.platform} badge={b.badge} body={b.body} />
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
}
