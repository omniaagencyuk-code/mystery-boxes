import Image from 'next/image';
import Link from 'next/link';

import { OutboundLink } from '@/components/outbound-link';
import { Rating } from '@/components/rating';
import { CheckIcon, XIcon } from '@/components/review/icons';
import type { HomeArticleBlock, HomeArticlePlatform } from '@/lib/data/homepage';

function CardButtons({ platform }: { platform: HomeArticlePlatform }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      {platform.cta && (
        <OutboundLink href={platform.cta.href} data-placement="home_article" className="u-btn-primary rounded-lg px-4 py-2 text-sm font-bold">
          Visit Site
        </OutboundLink>
      )}
      <Link href={platform.reviewHref} className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-elevated">
        Read Review
      </Link>
    </div>
  );
}

function PlatformLogo({ platform, size }: { platform: HomeArticlePlatform; size: number }) {
  if (!platform.logoUrl) return null;
  return (
    <span
      className="relative flex-none overflow-hidden rounded-lg border border-line bg-elevated"
      style={{ width: size, height: size }}
    >
      <Image src={platform.logoUrl} alt={`${platform.name} logo`} fill sizes={`${size}px`} className="object-contain p-1" loading="lazy" />
    </span>
  );
}

function CompactCard({ platform, badge, body }: { platform: HomeArticlePlatform; badge: string | null; body: string | null }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface/60 p-4 sm:flex-row sm:items-center">
      <PlatformLogo platform={platform} size={48} />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={platform.reviewHref} className="font-bold text-ink hover:text-primary">{platform.name}</Link>
          {badge && <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{badge}</span>}
          <Rating value={platform.rating} showNumber />
        </div>
        {(body || platform.summary) && <p className="mt-1 text-sm text-muted">{body || platform.summary}</p>}
      </div>
      <div className="flex flex-none flex-wrap gap-2">
        {platform.cta && (
          <OutboundLink href={platform.cta.href} data-placement="home_article" className="u-btn-primary rounded-lg px-4 py-2 text-sm font-bold">
            Visit Site
          </OutboundLink>
        )}
        <Link href={platform.reviewHref} className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-elevated">
          Review
        </Link>
      </div>
    </div>
  );
}

function FeaturedCard({ platform, badge, body }: { platform: HomeArticlePlatform; badge: string | null; body: string | null }) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <PlatformLogo platform={platform} size={56} />
          <div>
            {badge && <span className="mb-1 inline-block rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{badge}</span>}
            <Link href={platform.reviewHref} className="block text-xl font-bold text-ink hover:text-primary">{platform.name}</Link>
          </div>
        </div>
        <Rating value={platform.rating} showNumber />
      </div>
      {(body || platform.summary) && <p className="mt-3 text-muted">{body || platform.summary}</p>}
      {platform.offerTitle && <p className="mt-2 text-sm font-semibold text-success">{platform.offerTitle}</p>}
      {platform.pros.length > 0 && (
        <ul className="mt-3 space-y-1">
          {platform.pros.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted">
              <span className="mt-0.5 text-success"><CheckIcon width={14} height={14} /></span>
              {p}
            </li>
          ))}
        </ul>
      )}
      <CardButtons platform={platform} />
    </div>
  );
}

function ProsCons({ body }: { body: string | null }) {
  const lines = (body ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const pros = lines.filter((l) => l.startsWith('+')).map((l) => l.slice(1).trim());
  const cons = lines.filter((l) => l.startsWith('-')).map((l) => l.slice(1).trim());
  if (pros.length === 0 && cons.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {pros.length > 0 && (
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <h3 className="text-sm font-bold text-success">Pros</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {pros.map((p, i) => (
              <li key={i} className="flex items-start gap-2"><span className="mt-0.5 text-success"><CheckIcon width={14} height={14} /></span>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {cons.length > 0 && (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
          <h3 className="text-sm font-bold text-danger">Cons</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {cons.map((c, i) => (
              <li key={i} className="flex items-start gap-2"><span className="mt-0.5 text-danger"><XIcon width={14} height={14} /></span>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DataTable({ body }: { body: string | null }) {
  const rows = (body ?? '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.split('|').map((c) => c.trim()));
  if (rows.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {r.map((cell, j) => (
                <td key={j} className={`px-3 py-2 ${i === 0 ? 'font-semibold text-ink' : 'text-muted'}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Renders the editable homepage body: headings, paragraphs, lists, images,
 * tables, info/warning boxes, pros/cons, buttons and platform cards (compact or
 * featured) that pull live from the shared operator record.
 */
export function HomeArticle({ blocks }: { blocks: HomeArticleBlock[] }) {
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-5">
      {blocks.map((b) => {
        switch (b.type) {
          case 'H2':
            return <h2 key={b.id} className="pt-4 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{b.heading}</h2>;
          case 'H3':
            return <h3 key={b.id} className="pt-2 text-lg font-bold text-ink">{b.heading}</h3>;
          case 'PARAGRAPH':
            return <p key={b.id} className="text-muted">{b.body}</p>;
          case 'LIST':
            return (
              <ul key={b.id} className="list-disc space-y-1 pl-5 text-muted">
                {(b.body ?? '').split('\n').filter(Boolean).map((line, i) => <li key={i}>{line.replace(/^[-*+]\s*/, '')}</li>)}
              </ul>
            );
          case 'IMAGE':
            return b.mediaUrl ? (
              <span key={b.id} className="relative block aspect-[16/9] overflow-hidden rounded-xl border border-line">
                <Image src={b.mediaUrl} alt={b.heading ?? ''} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" loading="lazy" />
              </span>
            ) : null;
          case 'TABLE':
            return <DataTable key={b.id} body={b.body} />;
          case 'CALLOUT':
          case 'INFO_BOX':
            return (
              <div key={b.id} className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-muted">
                {b.heading && <p className="font-semibold text-ink">{b.heading}</p>}
                {b.body && <p className="mt-1">{b.body}</p>}
              </div>
            );
          case 'WARNING_BOX':
            return (
              <div key={b.id} className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-muted">
                {b.heading && <p className="font-semibold text-ink">{b.heading}</p>}
                {b.body && <p className="mt-1">{b.body}</p>}
              </div>
            );
          case 'PROS_CONS':
            return <ProsCons key={b.id} body={b.body} />;
          case 'BUTTON':
            return b.href ? (
              <div key={b.id}>
                <Link href={b.href} className="u-btn-primary inline-flex rounded-lg px-5 py-2.5 text-sm font-bold">{b.heading ?? b.body ?? 'Learn more'}</Link>
              </div>
            ) : null;
          case 'INTERNAL_LINK':
            return b.href ? (
              <p key={b.id}><Link href={b.href} className="font-semibold text-accent hover:underline">{b.heading ?? b.body ?? 'Read more'}</Link></p>
            ) : null;
          case 'PLATFORM_CARD':
            if (!b.platform) return null;
            return b.cardStyle === 'featured' ? (
              <FeaturedCard key={b.id} platform={b.platform} badge={b.badge} body={b.body} />
            ) : (
              <CompactCard key={b.id} platform={b.platform} badge={b.badge} body={b.body} />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
