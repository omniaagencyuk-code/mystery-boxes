/**
 * Renders an operator rating out of five, to one decimal. Ratings are never
 * fabricated, so a null rating renders a neutral "not yet rated" note instead of
 * inventing a number.
 */
export function Rating({
  value,
  className,
}: {
  value: number | null;
  className?: string;
}) {
  if (value == null) {
    return (
      <span className={`text-xs text-gray-500 dark:text-gray-400 ${className ?? ''}`}>
        Not yet rated
      </span>
    );
  }

  const clamped = Math.max(1, Math.min(5, value));
  return (
    <span
      className={`inline-flex items-baseline gap-1 ${className ?? ''}`}
      aria-label={`Rated ${clamped.toFixed(1)} out of 5`}
    >
      <span className="font-semibold">{clamped.toFixed(1)}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">out of 5</span>
    </span>
  );
}
