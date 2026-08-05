import { AffiliateCta } from '@/components/review/affiliate-cta';
import { GiftIcon, ClockIcon } from '@/components/review/icons';
import { Pill } from '@/components/review/primitives';
import type { CtaSources } from '@/lib/reviews/affiliate';
import { formatReviewDate } from '@/lib/reviews/format';
import type { OfferView, PlatformView } from '@/lib/reviews/types';

/**
 * Welcome offer bar shown directly below the hero. Presents a verified offer with
 * a green CTA, or a neutral "visit site" fallback when no usable offer exists.
 * Never invents a promo code and never shows a code for a stale or expired offer.
 */
export function WelcomeOfferBanner({
  platform,
  offer,
  sources,
  page,
}: {
  platform: PlatformView;
  offer: OfferView | null;
  sources: CtaSources;
  page: string;
}) {
  const usable = offer?.state.usable ?? false;
  const stale = offer?.state.freshness === 'stale';
  const lastChecked = formatReviewDate(offer?.state.lastCheckedISO ?? null);
  const ctaLabel = usable ? offer?.ctaLabel?.trim() || 'Claim Offer' : 'Visit Site';

  const title = usable ? offer!.title : `Visit ${platform.name}`;
  const subtitle = usable
    ? offer!.eligibility ?? offer!.description ?? null
    : 'Check the current welcome offer directly on site.';

  return (
    <div className="rv-panel border-[var(--rv-border-green)] bg-gradient-to-r from-[var(--rv-offer)]/[0.07] to-transparent p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 shrink-0 text-[var(--rv-verified)]">
            <GiftIcon width={30} height={30} />
          </span>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--rv-verified)]">
                Welcome offer
              </span>
              {usable && offer!.exclusive && <Pill variant="green">Exclusive</Pill>}
              {stale && <Pill variant="gold">Confirm on site</Pill>}
            </div>

            <h2 className="text-xl font-extrabold text-[var(--rv-text)] sm:text-2xl">{title}</h2>

            {subtitle && <p className="text-sm text-[var(--rv-text-2)]">{subtitle}</p>}

            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              {usable && offer!.code && (
                <span className="inline-flex items-center gap-2 text-sm text-[var(--rv-text-2)]">
                  Code
                  <code className="rounded-md border border-dashed border-[var(--rv-border-strong)] bg-[var(--rv-nested)] px-2 py-0.5 font-bold tracking-wider text-[var(--rv-text)]">
                    {offer!.code}
                  </code>
                </span>
              )}
              {usable && !offer!.code && (
                <span className="text-sm text-[var(--rv-muted)]">
                  No code required. Applied automatically.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 lg:items-end">
          <AffiliateCta
            sources={sources}
            placement="welcome_offer"
            label={ctaLabel}
            page={page}
            variant="offer"
            className="px-8 py-3.5 text-base"
          >
            {ctaLabel}
          </AffiliateCta>
          {lastChecked && (
            <span className="inline-flex items-center justify-center gap-1.5 text-xs text-[var(--rv-muted)] lg:justify-end">
              <ClockIcon width={13} height={13} /> Last checked {lastChecked}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
