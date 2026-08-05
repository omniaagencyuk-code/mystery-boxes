import { ReviewMarkdown } from '@/components/review/review-markdown';
import { ShieldIcon, CheckIcon } from '@/components/review/icons';

export interface SafetyItem {
  title: string;
  note?: string | null;
}

/**
 * Trust and legitimacy panel. Items are author-entered in the CMS so the page
 * never asserts a safety claim the editor did not make.
 */
export function SafetyPanel({
  items,
  heading,
}: {
  items: SafetyItem[];
  heading?: string | null;
}) {
  if (items.length === 0) return null;
  return (
    <div className="rv-panel p-5">
      {heading && (
        <div className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--rv-verified)]">
          {heading}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-[var(--rv-verified)]">
              <ShieldIcon width={20} height={20} />
            </span>
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-[var(--rv-text)]">
                <CheckIcon width={14} height={14} /> {item.title}
              </div>
              {item.note && <p className="mt-0.5 text-sm text-[var(--rv-text-2)]">{item.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Shipping and prize-claims panel. Prefers the block's own rich text, otherwise
 * falls back to the operator's stored shipping information.
 */
export function ShippingPanel({
  heading = 'Shipping and prize claims',
  body,
  fallback,
}: {
  heading?: string | null;
  body?: string | null;
  fallback?: string | null;
}) {
  const content = body?.trim() || fallback?.trim();
  if (!content) return null;
  return (
    <div className="rv-panel p-5">
      {heading && (
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--rv-blue)]">
          {heading}
        </div>
      )}
      <ReviewMarkdown>{content}</ReviewMarkdown>
    </div>
  );
}
