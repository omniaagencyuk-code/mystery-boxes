import type { ReactNode } from 'react';

import { ExternalLinkIcon } from '@/components/review/icons';
import { resolveCta, type CtaSources } from '@/lib/reviews/affiliate';

/**
 * The single affiliate CTA used everywhere on the review page. It resolves the
 * best available target (tracked /go link, else raw tracking URL, else website)
 * and always renders a compliant outbound anchor: new tab, rel sponsored nofollow
 * noopener. Returns null when there is no usable URL so callers show a neutral
 * state rather than a dead button.
 */
export function AffiliateCta({
  sources,
  placement,
  label,
  page,
  variant = 'offer',
  className,
  showIcon = false,
  children,
}: {
  sources: CtaSources;
  placement: string;
  /** CTA label recorded for click analytics. */
  label: string;
  /** Originating page path recorded for analytics. */
  page: string;
  variant?: 'offer' | 'blue' | 'plain';
  className?: string;
  showIcon?: boolean;
  children: ReactNode;
}) {
  const target = resolveCta(sources, { placement, label, page });
  if (!target) return null;

  const variantClass =
    variant === 'offer'
      ? 'rv-btn-offer'
      : variant === 'blue'
        ? 'rv-btn-blue'
        : '';

  return (
    <a
      href={target.href}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      data-placement={placement}
      className={`rv-focus inline-flex items-center justify-center gap-2 ${variantClass} ${className ?? ''}`}
    >
      {children}
      {showIcon && <ExternalLinkIcon width={16} height={16} />}
    </a>
  );
}
