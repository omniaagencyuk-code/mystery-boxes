/**
 * Renders an operator rating out of five as fractional stars plus the number.
 * Ratings are never fabricated, so a null rating shows "Not yet rated" rather
 * than inventing a value. No review counts are shown because we do not hold them.
 */
export function Rating({
  value,
  showNumber = true,
  className,
}: {
  value: number | null;
  showNumber?: boolean;
  className?: string;
}) {
  if (value == null) {
    return (
      <span className={`text-xs text-muted ${className ?? ''}`}>Not yet rated</span>
    );
  }

  const clamped = Math.max(1, Math.min(5, value));
  const pct = (clamped / 5) * 100;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className ?? ''}`}
      aria-label={`Rated ${clamped.toFixed(1)} out of 5`}
    >
      <span className="relative inline-block align-middle leading-none tracking-[0.1em]" aria-hidden>
        <span className="text-muted/40">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden whitespace-nowrap text-star"
          style={{ width: `${pct}%` }}
        >
          ★★★★★
        </span>
      </span>
      {showNumber && <span className="text-sm font-semibold text-ink">{clamped.toFixed(1)}</span>}
    </span>
  );
}
