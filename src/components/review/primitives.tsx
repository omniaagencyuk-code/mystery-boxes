import type { ReactNode } from 'react';

import { StarIcon } from '@/components/review/icons';
import { formatScore, scorePercent } from '@/lib/reviews/scoring';

/**
 * Gold star rating out of five with a fractional fill. Accessible: the visual
 * stars are hidden and a text label carries the value for assistive tech.
 */
export function StarRating({
  score,
  size = 18,
  className,
}: {
  score: number | null;
  size?: number;
  className?: string;
}) {
  if (score == null) {
    return <span className="text-sm text-[var(--rv-muted)]">Not yet rated</span>;
  }
  const pct = scorePercent(score);
  return (
    <span
      className={`inline-flex items-center ${className ?? ''}`}
      role="img"
      aria-label={`Rated ${formatScore(score)} out of 5`}
    >
      <span className="relative inline-flex" aria-hidden style={{ gap: 2 }}>
        <span className="flex text-[var(--rv-border)]" style={{ gap: 2 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <StarIcon key={i} width={size} height={size} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex overflow-hidden text-[var(--rv-gold)]"
          style={{ width: `${pct}%`, gap: 2 }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <StarIcon key={i} width={size} height={size} style={{ minWidth: size }} />
          ))}
        </span>
      </span>
    </span>
  );
}

/**
 * Compact labelled score bar for a rating category. Exposes the numeric value
 * as text so it is never conveyed by colour alone.
 */
export function RatingBar({ label, score }: { label: string; score: number }) {
  const pct = scorePercent(score);
  return (
    <div className="flex items-center gap-3">
      <span className="min-w-0 flex-1 truncate text-sm text-[var(--rv-text-2)]">{label}</span>
      <span
        className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-[var(--rv-nested)] sm:w-28"
        role="img"
        aria-label={`${label}: ${formatScore(score)} out of 5`}
      >
        <span
          className="block h-full rounded-full bg-[var(--rv-gold)]"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="w-7 shrink-0 text-right text-sm font-semibold text-[var(--rv-text)]">
        {formatScore(score)}
      </span>
    </div>
  );
}

/** Small uppercase section eyebrow used inside cards. */
export function CardEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-wider text-[var(--rv-muted)]">
      {children}
    </div>
  );
}

/** Rounded pill/badge. Variant sets the accent. */
export function Pill({
  children,
  variant = 'neutral',
}: {
  children: ReactNode;
  variant?: 'neutral' | 'green' | 'gold' | 'purple' | 'blue';
}) {
  const styles: Record<string, string> = {
    neutral: 'border-[var(--rv-border)] text-[var(--rv-text-2)]',
    green: 'border-[var(--rv-border-green)] text-[var(--rv-verified)]',
    gold: 'border-[var(--rv-border-gold)] text-[var(--rv-gold)]',
    purple: 'border-[var(--rv-border-purple)] text-[var(--rv-purple)]',
    blue: 'border-[var(--rv-border-strong)] text-[var(--rv-blue)]',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

/** Anchor target + section wrapper for the sticky nav to scroll to. */
export function ReviewSection({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    // scroll-mt keeps the heading clear of the sticky header + section nav.
    <section id={id} className={`scroll-mt-32 ${className ?? ''}`}>
      {children}
    </section>
  );
}

/** Consistent H2 for editorial sections. */
export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-2xl font-extrabold tracking-tight text-[var(--rv-text)] sm:text-[28px]">
      {children}
    </h2>
  );
}
