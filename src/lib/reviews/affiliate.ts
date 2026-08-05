/**
 * Resolve where an affiliate CTA should point and whether the click is tracked.
 *
 * Preference order:
 *  1. A mapped affiliate link slug, routed through the safe /go tracker so the
 *     click is recorded with its placement, label and page.
 *  2. The operator's raw tracking URL.
 *  3. The operator's standard website URL.
 *
 * Returns null when the operator has no usable outbound URL, so callers can hide
 * the CTA rather than render a dead link.
 */
export interface CtaContext {
  placement: string;
  label: string;
  page: string;
}

export interface CtaTarget {
  href: string;
  /** True only for the tracked /go route; raw URLs are untracked. */
  tracked: boolean;
}

export interface CtaSources {
  affiliateSlug: string | null;
  trackingUrl: string | null;
  websiteUrl: string | null;
}

export function resolveCta(sources: CtaSources, ctx: CtaContext): CtaTarget | null {
  if (sources.affiliateSlug) {
    const qs = new URLSearchParams({
      p: ctx.placement,
      l: ctx.label,
      pg: ctx.page,
    });
    return { href: `/go/${encodeURIComponent(sources.affiliateSlug)}?${qs.toString()}`, tracked: true };
  }
  if (sources.trackingUrl) return { href: sources.trackingUrl, tracked: false };
  if (sources.websiteUrl) return { href: sources.websiteUrl, tracked: false };
  return null;
}
