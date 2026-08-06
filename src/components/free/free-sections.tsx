import Image from 'next/image';
import Link from 'next/link';

import { CheckIcon, ClockIcon, GiftIcon, GlobeIcon, ShieldIcon } from '@/components/review/icons';
import { Pill, SectionHeading, StarRating } from '@/components/review/primitives';
import type {
  FreeCategoryCard,
  FreeFeaturedCard,
  FreePageSettings,
  FreeStat,
  FreeTrustItem,
} from '@/lib/data/free';
import { verifiedLabel } from '@/lib/free/offers';
import type { FreeBodyBlockRow } from '@/lib/supabase/types';

/* ------------------------------- Hero -------------------------------- */
export function FreeHero({ settings, stats }: { settings: FreePageSettings; stats: FreeStat[] }) {
  return (
    <section className="rv-panel overflow-hidden p-6 sm:p-8 lg:p-10" id="top">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div>
          <h1 className="text-[34px] font-extrabold leading-tight text-[var(--rv-text)] sm:text-[46px]">
            {settings.h1}
          </h1>
          <p className="mt-3 max-w-xl text-[var(--rv-text-2)]">{settings.heroIntro}</p>

          {stats.length > 0 && (
            <dl className="mt-6 flex flex-wrap gap-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs uppercase tracking-wide text-[var(--rv-muted)]">{s.label}</dt>
                  <dd className="text-2xl font-black text-[var(--rv-text)]">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={settings.ctaPrimaryHref}
              className="rv-focus inline-flex items-center gap-2 rounded-xl rv-btn-offer px-5 py-3 text-sm font-bold"
            >
              <GiftIcon width={18} height={18} />
              {settings.ctaPrimaryLabel}
            </Link>
            <Link
              href={settings.ctaSecondaryHref}
              className="rv-focus inline-flex items-center rounded-xl border border-[var(--rv-border)] px-5 py-3 text-sm font-semibold text-[var(--rv-text)]"
            >
              {settings.ctaSecondaryLabel}
            </Link>
          </div>
        </div>

        {settings.heroImageUrl && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[var(--rv-border)]">
            <Image src={settings.heroImageUrl} alt="" fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}

/* --------------------------- Featured offers -------------------------- */
export function FreeFeatured({ featured, now }: { featured: FreeFeaturedCard[]; now: Date }) {
  if (featured.length === 0) return null;
  return (
    <section aria-labelledby="featured-heading">
      <SectionHeading>
        <span id="featured-heading">Editor&apos;s Picks</span>
      </SectionHeading>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map(({ row, badge }) => {
          const v = verifiedLabel(row.freshness, row.lastVerifiedISO, now);
          return (
            <div key={row.operatorId} className="rv-card flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--rv-text)]">{row.platformName}</span>
                {badge && <Pill variant="gold">{badge}</Pill>}
              </div>
              {row.offerTitle && <p className="text-sm text-[var(--rv-text-2)]">{row.offerTitle}</p>}
              <StarRating score={row.rating ?? 0} size={14} />
              <p className="text-xs text-[var(--rv-muted)]">
                {row.availabilityLabel}
                {v ? ` · ${v.text}` : ''}
              </p>
              <div className="mt-auto flex items-center gap-3 pt-1">
                {row.cta ? (
                  <a
                    href={row.cta.href}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    data-placement="free_featured"
                    className="rv-focus inline-flex items-center justify-center rounded-lg rv-btn-offer px-3 py-1.5 text-sm font-semibold"
                  >
                    Claim Offer
                  </a>
                ) : null}
                <Link href={row.reviewHref} className="rv-focus text-sm font-semibold text-[var(--rv-blue)]">
                  Read Review
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------- Category cards --------------------------- */
export function FreeCategoryCards({ cards }: { cards: FreeCategoryCard[] }) {
  if (cards.length === 0) return null;
  return (
    <section aria-labelledby="category-heading">
      <SectionHeading>
        <span id="category-heading">Browse Free Boxes by Category</span>
      </SectionHeading>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rv-focus group rv-card flex flex-col gap-2 p-4 transition hover:border-[var(--rv-border-strong)]"
          >
            {c.imageUrl ? (
              <span className="relative block aspect-[16/10] overflow-hidden rounded-lg">
                <Image src={c.imageUrl} alt="" fill sizes="240px" className="object-cover" />
              </span>
            ) : (
              <span className="flex aspect-[16/10] items-center justify-center rounded-lg bg-[var(--rv-nested)] text-[var(--rv-blue)]">
                <GiftIcon width={28} height={28} />
              </span>
            )}
            <span className="font-semibold text-[var(--rv-text)] group-hover:text-[var(--rv-blue)]">{c.label}</span>
            <span className="text-xs text-[var(--rv-muted)]">{c.count} {c.count === 1 ? 'offer' : 'offers'}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- SEO body ------------------------------- */
export function FreeBody({ blocks }: { blocks: FreeBodyBlockRow[] }) {
  if (blocks.length === 0) return null;
  return (
    <section id="how-it-works" className="rv-card p-6 sm:p-8">
      <div className="space-y-4">
        {blocks.map((b) => (
          <FreeBlock key={b.id} block={b} />
        ))}
      </div>
    </section>
  );
}

function FreeBlock({ block }: { block: FreeBodyBlockRow }) {
  switch (block.block_type) {
    case 'H2':
      return <h2 className="text-2xl font-extrabold text-[var(--rv-text)]">{block.heading}</h2>;
    case 'H3':
      return <h3 className="text-lg font-bold text-[var(--rv-text)]">{block.heading}</h3>;
    case 'PARAGRAPH':
      return <p className="text-[var(--rv-text-2)]">{block.body}</p>;
    case 'LIST':
      return (
        <ul className="list-disc space-y-1 pl-5 text-[var(--rv-text-2)]">
          {(block.body ?? '').split('\n').filter(Boolean).map((line, i) => (
            <li key={i}>{line.replace(/^[-*]\s*/, '')}</li>
          ))}
        </ul>
      );
    case 'IMAGE':
      return block.media_url ? (
        <span className="relative block aspect-[16/9] overflow-hidden rounded-xl border border-[var(--rv-border)]">
          <Image src={block.media_url} alt={block.heading ?? ''} fill sizes="(max-width: 768px) 100vw, 760px" className="object-cover" />
        </span>
      ) : null;
    case 'CALLOUT':
      return (
        <div className="rv-nested border-l-2 border-[var(--rv-border-strong)] p-4 text-[var(--rv-text-2)]">
          {block.heading && <p className="font-semibold text-[var(--rv-text)]">{block.heading}</p>}
          {block.body && <p className="mt-1">{block.body}</p>}
        </div>
      );
    case 'DATA_TABLE': {
      const rows = Array.isArray(block.config?.rows) ? (block.config.rows as string[][]) : [];
      if (rows.length === 0) return null;
      return (
        <div className="overflow-x-auto rounded-xl border border-[var(--rv-border)]">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-[var(--rv-border)] last:border-0">
                  {r.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-[var(--rv-text-2)]">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'INTERNAL_LINK':
    case 'CTA':
    case 'RELATED_GUIDE':
    case 'RELATED_REVIEW':
      return block.href ? (
        <Link href={block.href} className="rv-focus inline-flex font-semibold text-[var(--rv-blue)]">
          {block.heading ?? block.body ?? 'Read more'}
        </Link>
      ) : null;
    default:
      return null;
  }
}

/* ---------------------------- Trust strip ----------------------------- */
const TRUST_ICON = {
  check: CheckIcon,
  shield: ShieldIcon,
  lock: ShieldIcon,
  globe: GlobeIcon,
  clock: ClockIcon,
} as const;

export function FreeTrust({ items }: { items: FreeTrustItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="rv-panel p-6" aria-label="Why trust us">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((t) => {
          const Icon = (t.icon && TRUST_ICON[t.icon as keyof typeof TRUST_ICON]) || CheckIcon;
          return (
            <li key={t.label} className="flex items-start gap-3">
              <span className="mt-0.5 text-[var(--rv-verified)]"><Icon width={20} height={20} /></span>
              <span>
                <span className="block font-semibold text-[var(--rv-text)]">{t.label}</span>
                {t.detail && <span className="block text-sm text-[var(--rv-text-2)]">{t.detail}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
