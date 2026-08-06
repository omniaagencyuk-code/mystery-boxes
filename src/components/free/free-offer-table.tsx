import Link from 'next/link';

import { Rating } from '@/components/rating';
import { CheckIcon } from '@/components/review/icons';
import { verifiedLabel, type FreeOfferPage, type FreeOfferRow, type FreeSort } from '@/lib/free/offers';

const SORTS: { key: FreeSort; label: string }[] = [
  { key: 'platform', label: 'Platform' },
  { key: 'offer_type', label: 'Offer Type' },
  { key: 'category', label: 'Category' },
  { key: 'rating', label: 'Rating' },
  { key: 'last_verified', label: 'Last Verified' },
];

const OFFER_TYPE_LABEL: Record<string, string> = {
  welcome_box: 'Welcome Box',
  daily_box: 'Daily Box',
  promo_code: 'Promo Code',
  no_deposit: 'No Deposit',
  referral: 'Referral',
  daily_reward: 'Daily Reward',
  free_pack: 'Free Pack',
};

type Params = Record<string, string | undefined>;

function buildHref(base: Params, overrides: Params): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...base, ...overrides })) {
    if (v) p.set(k, v);
  }
  const qs = p.toString();
  return qs ? `/free?${qs}#offers` : '/free#offers';
}

function VerifiedCell({ row, now }: { row: FreeOfferRow; now: Date }) {
  const v = verifiedLabel(row.freshness, row.lastVerifiedISO, now);
  if (!v) return <span className="text-[var(--rv-muted)]">No current offer</span>;
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${v.verified ? 'text-[var(--rv-verified)]' : 'text-[var(--rv-warn)]'}`}
    >
      {v.verified && <CheckIcon width={14} height={14} />}
      {v.text}
    </span>
  );
}

function ClaimCta({ row, fallback }: { row: FreeOfferRow; fallback: string }) {
  if (row.cta) {
    return (
      <a
        href={row.cta.href}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        data-placement="free_table"
        className="rv-focus inline-flex items-center justify-center rounded-lg rv-btn-offer px-3 py-1.5 text-sm font-semibold"
      >
        Claim Offer
      </a>
    );
  }
  if (fallback === 'hide') return null;
  if (fallback === 'view_alternatives') {
    return (
      <Link href="/free#offers" className="rv-focus text-sm font-semibold text-[var(--rv-blue)]">
        View Alternatives
      </Link>
    );
  }
  // visit_site or read_review both degrade to the internal review when there is
  // no outbound URL, so we never render a dead button.
  return (
    <Link href={row.reviewHref} className="rv-focus text-sm font-semibold text-[var(--rv-blue)]">
      Read Review
    </Link>
  );
}

function OfferTypeText({ row }: { row: FreeOfferRow }) {
  return <>{row.offerType ? OFFER_TYPE_LABEL[row.offerType] : 'Free offer'}</>;
}

/** The full offer table with sortable headers and pagination (desktop), and
 * offer cards on mobile. Server-rendered; sorting and paging are URL driven. */
export function FreeOfferTable({
  page,
  params,
  ctaFallback,
  emptyState,
  now,
}: {
  page: FreeOfferPage;
  params: Params;
  ctaFallback: string;
  emptyState: string;
  now: Date;
}) {
  const activeSort = (params.sort as FreeSort) || 'rating';

  if (page.total === 0) {
    return (
      <div className="rv-card p-8 text-center text-[var(--rv-text-2)]">{emptyState}</div>
    );
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--rv-border)] md:block">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--rv-border)] text-left text-xs uppercase tracking-wide text-[var(--rv-muted)]">
              <th scope="col" className="px-4 py-3 font-semibold">Platform</th>
              <th scope="col" className="px-4 py-3 font-semibold">Free Offer</th>
              {SORTS.filter((s) => s.key === 'offer_type' || s.key === 'category').map((s) => (
                <th key={s.key} scope="col" className="px-4 py-3 font-semibold">
                  <SortLink sort={s} activeSort={activeSort} params={params} />
                </th>
              ))}
              <th scope="col" className="px-4 py-3 font-semibold">
                <SortLink sort={{ key: 'rating', label: 'Rating' }} activeSort={activeSort} params={params} />
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">Available In</th>
              <th scope="col" className="px-4 py-3 font-semibold">
                <SortLink sort={{ key: 'last_verified', label: 'Last Verified' }} activeSort={activeSort} params={params} />
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">Review</th>
              <th scope="col" className="px-4 py-3 font-semibold">Claim</th>
            </tr>
          </thead>
          <tbody>
            {page.rows.map((row) => (
              <tr key={row.operatorId} className="border-b border-[var(--rv-border)] last:border-0">
                <td className="px-4 py-3 font-semibold text-[var(--rv-text)]">{row.platformName}</td>
                <td className="px-4 py-3 text-[var(--rv-text-2)]">{row.offerTitle ?? 'See site for current offer'}</td>
                <td className="px-4 py-3 text-[var(--rv-text-2)]"><OfferTypeText row={row} /></td>
                <td className="px-4 py-3 text-[var(--rv-text-2)]">{row.categoryName ?? '—'}</td>
                <td className="px-4 py-3"><Rating value={row.rating} showNumber /></td>
                <td className="px-4 py-3 text-[var(--rv-text-2)]">{row.availabilityLabel}</td>
                <td className="px-4 py-3"><VerifiedCell row={row} now={now} /></td>
                <td className="px-4 py-3">
                  <Link href={row.reviewHref} className="rv-focus font-semibold text-[var(--rv-blue)]">Read Review</Link>
                </td>
                <td className="px-4 py-3"><ClaimCta row={row} fallback={ctaFallback} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {page.rows.map((row) => (
          <li key={row.operatorId} className="rv-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--rv-text)]">{row.platformName}</p>
                <p className="mt-0.5 text-sm text-[var(--rv-text-2)]">{row.offerTitle ?? 'See site for current offer'}</p>
              </div>
              <Rating value={row.rating} showNumber />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div><dt className="text-[var(--rv-muted)]">Type</dt><dd className="text-[var(--rv-text-2)]"><OfferTypeText row={row} /></dd></div>
              <div><dt className="text-[var(--rv-muted)]">Category</dt><dd className="text-[var(--rv-text-2)]">{row.categoryName ?? '—'}</dd></div>
              <div><dt className="text-[var(--rv-muted)]">Available in</dt><dd className="text-[var(--rv-text-2)]">{row.availabilityLabel}</dd></div>
              <div><dt className="text-[var(--rv-muted)]">Status</dt><dd><VerifiedCell row={row} now={now} /></dd></div>
            </dl>
            <div className="mt-3 flex items-center gap-3">
              <ClaimCta row={row} fallback={ctaFallback} />
              <Link href={row.reviewHref} className="rv-focus text-sm font-semibold text-[var(--rv-blue)]">Read Review</Link>
            </div>
          </li>
        ))}
      </ul>

      {page.totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Offer pages">
          {Array.from({ length: page.totalPages }, (_, i) => i + 1).map((n) => {
            const active = n === page.page;
            return (
              <Link
                key={n}
                href={buildHref(params, { page: n === 1 ? undefined : String(n) })}
                aria-current={active ? 'page' : undefined}
                className={`rv-focus min-w-9 rounded-lg border px-3 py-1.5 text-center text-sm font-medium ${
                  active
                    ? 'border-[var(--rv-border-strong)] bg-[var(--rv-blue)]/15 text-[var(--rv-text)]'
                    : 'border-[var(--rv-border)] text-[var(--rv-text-2)]'
                }`}
              >
                {n}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function SortLink({
  sort,
  activeSort,
  params,
}: {
  sort: { key: FreeSort; label: string };
  activeSort: FreeSort;
  params: Params;
}) {
  const active = activeSort === sort.key;
  return (
    <Link
      href={buildHref(params, { sort: sort.key, page: undefined })}
      className="rv-focus inline-flex items-center gap-1 font-semibold hover:text-[var(--rv-text)]"
      aria-label={`Sort by ${sort.label}`}
    >
      {sort.label}
      <span aria-hidden className={active ? 'text-[var(--rv-blue)]' : 'text-[var(--rv-muted)]'}>
        {active ? '▾' : '↕'}
      </span>
    </Link>
  );
}
