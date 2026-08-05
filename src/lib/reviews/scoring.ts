/**
 * Editorial score helpers for the review page. Scores are always author-set in
 * the CMS; nothing here invents a value. A null score yields null so the UI can
 * hide the element rather than show a fabricated number.
 */

/** Map a 0-5 score to its word descriptor, matching the visual reference. */
export function ratingDescriptor(score: number | null | undefined): string | null {
  if (score == null || Number.isNaN(score)) return null;
  if (score >= 4.5) return 'Excellent';
  if (score >= 4.0) return 'Very good';
  if (score >= 3.5) return 'Good';
  if (score >= 3.0) return 'Fair';
  if (score >= 2.0) return 'Average';
  return 'Poor';
}

/** Clamp a score into 0-5 and express it as a 0-100 fill percentage. */
export function scorePercent(score: number | null | undefined): number {
  if (score == null || Number.isNaN(score)) return 0;
  const clamped = Math.max(0, Math.min(5, score));
  return (clamped / 5) * 100;
}

/** Format a score for display, e.g. 4.6, dropping a trailing .0 -> 4. */
export function formatScore(score: number | null | undefined): string | null {
  if (score == null || Number.isNaN(score)) return null;
  const rounded = Math.round(score * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
