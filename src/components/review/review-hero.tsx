import Image from 'next/image';

import { CardEyebrow } from '@/components/review/primitives';
import { ClockIcon, GlobeIcon, StarIcon, VerifiedIcon } from '@/components/review/icons';
import { formatReviewDate } from '@/lib/reviews/format';
import { formatScore, ratingDescriptor } from '@/lib/reviews/scoring';
import type { PlatformView, ReviewView } from '@/lib/reviews/types';

function PlatformLogoCard({ platform }: { platform: PlatformView }) {
  const logo = platform.logoUrl ?? platform.logoDarkUrl ?? platform.logoLightUrl;
  return (
    <div className="rv-nested flex h-full min-h-[150px] items-center justify-center overflow-hidden p-6">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary logo hosts, no next/image remote config
        <img
          src={logo}
          alt={`${platform.name} logo`}
          className="max-h-24 w-auto max-w-full object-contain"
        />
      ) : (
        <span className="text-3xl font-black tracking-tight text-[var(--rv-text)]">
          {platform.name}
        </span>
      )}
    </div>
  );
}

function VerifiedReviewBadge() {
  return (
    <span
      className="inline-flex items-center text-[var(--rv-verified)]"
      title="Verified review"
      aria-label="Verified review"
    >
      <VerifiedIcon width={22} height={22} />
    </span>
  );
}

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--rv-text-2)]">
      <span className="text-[var(--rv-muted)]">{icon}</span>
      {children}
    </span>
  );
}

/**
 * The three-part review hero: platform logo card, identity + meta, and an
 * optional platform hero image. Collapses to a single column on mobile.
 */
export function ReviewHero({
  platform,
  review,
  verified,
}: {
  platform: PlatformView;
  review: ReviewView;
  verified: boolean;
}) {
  const score = review.overallScore;
  const descriptor = review.scoreDescriptor ?? ratingDescriptor(score);
  const lastChecked = formatReviewDate(review.lastCheckedAt);

  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,300px)]">
      {/* Logo panel */}
      <PlatformLogoCard platform={platform} />

      {/* Identity */}
      <div className="flex flex-col justify-center gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[34px] font-extrabold leading-tight tracking-tight text-[var(--rv-text)] sm:text-[44px]">
            {platform.name} Review
          </h1>
          {verified && <VerifiedReviewBadge />}
        </div>

        {platform.summary && (
          <p className="max-w-2xl text-[var(--rv-text-2)]">{platform.summary}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
          {platform.availability && (
            <MetaItem icon={<GlobeIcon width={16} height={16} />}>
              {platform.availability}
            </MetaItem>
          )}
          {score != null && (
            <MetaItem icon={<StarIcon width={16} height={16} />}>
              <span className="font-semibold text-[var(--rv-text)]">
                {formatScore(score)} / 5
              </span>
              {descriptor && <span className="text-[var(--rv-gold)]"> {descriptor}</span>}
            </MetaItem>
          )}
          {lastChecked && (
            <MetaItem icon={<ClockIcon width={16} height={16} />}>
              <span className="text-[var(--rv-muted)]">Last checked</span> {lastChecked}
            </MetaItem>
          )}
        </div>
      </div>

      {/* Hero image */}
      {platform.heroImageUrl && (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl lg:aspect-auto">
          <Image
            src={platform.heroImageUrl}
            alt={`${platform.name} platform artwork`}
            fill
            sizes="(max-width: 1024px) 100vw, 300px"
            className="object-cover"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent to-[var(--rv-bg)]/40" />
        </div>
      )}
    </div>
  );
}

/** Standalone eyebrow export kept for potential reuse in related layouts. */
export { CardEyebrow };
