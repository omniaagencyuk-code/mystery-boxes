import { AffiliateCta } from '@/components/review/affiliate-cta';
import { CheckIcon, XIcon } from '@/components/review/icons';
import { CardEyebrow } from '@/components/review/primitives';
import type { CtaSources } from '@/lib/reviews/affiliate';
import type { PlatformView } from '@/lib/reviews/types';

function ProsCard({ pros }: { pros: string[] }) {
  return (
    <div className="rounded-2xl border border-[var(--rv-border-green)] bg-[var(--rv-verified)]/[0.06] p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--rv-verified)]">
        <CheckIcon width={16} height={16} /> Pros
      </div>
      <ul className="space-y-2.5">
        {pros.map((pro, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-[var(--rv-text)]">
            <span className="mt-0.5 shrink-0 text-[var(--rv-verified)]">
              <CheckIcon width={16} height={16} />
            </span>
            <span>{pro}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConsCard({ cons }: { cons: string[] }) {
  return (
    <div className="rounded-2xl border border-[var(--rv-error)]/40 bg-[var(--rv-error)]/[0.06] p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--rv-error)]">
        <XIcon width={16} height={16} /> Cons
      </div>
      <ul className="space-y-2.5">
        {cons.map((con, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-[var(--rv-text)]">
            <span className="mt-0.5 shrink-0 text-[var(--rv-error)]">
              <XIcon width={16} height={16} />
            </span>
            <span>{con}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VisitSiteCard({
  platform,
  sources,
  page,
}: {
  platform: PlatformView;
  sources: CtaSources;
  page: string;
}) {
  const cta = resolveHasCta(sources);
  return (
    <div className="rv-card flex flex-col p-5">
      <CardEyebrow>Visit {platform.name}</CardEyebrow>
      <p className="mt-3 text-sm text-[var(--rv-text-2)]">
        Click below to visit {platform.name} and see the current welcome offer.
      </p>
      <div className="mt-4">
        {cta ? (
          <AffiliateCta
            sources={sources}
            placement="pros_cons_cta"
            label={`Visit ${platform.name}`}
            page={page}
            variant="offer"
            showIcon
            className="w-full px-5 py-3 text-sm"
          >
            Visit {platform.name}
          </AffiliateCta>
        ) : (
          <p className="rv-nested p-3 text-sm text-[var(--rv-muted)]">
            No outbound link is configured for this platform yet.
          </p>
        )}
      </div>
      <p className="mt-3 text-xs text-[var(--rv-muted)]">
        Affiliate link. We may earn a commission at no extra cost to you.
      </p>
    </div>
  );
}

function resolveHasCta(sources: CtaSources): boolean {
  return Boolean(sources.affiliateSlug || sources.trackingUrl || sources.websiteUrl);
}

/**
 * Three-column row: pros, cons and a commercial visit-site card. Each card only
 * renders when it has content, and the row still reads well with one column
 * missing. Stacks vertically on mobile in the order pros, cons, then CTA.
 */
export function ProsConsCta({
  platform,
  sources,
  page,
}: {
  platform: PlatformView;
  sources: CtaSources;
  page: string;
}) {
  const hasPros = platform.pros.length > 0;
  const hasCons = platform.cons.length > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {hasPros && <ProsCard pros={platform.pros} />}
      {hasCons && <ConsCard cons={platform.cons} />}
      <VisitSiteCard platform={platform} sources={sources} page={page} />
    </div>
  );
}
