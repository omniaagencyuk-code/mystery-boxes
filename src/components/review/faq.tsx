import { ChevronDownIcon } from '@/components/review/icons';
import { SectionHeading } from '@/components/review/primitives';
import type { ReviewFaqItem } from '@/lib/reviews/types';

/**
 * FAQ accordion built on native details/summary, so it is keyboard accessible
 * and works without client JavaScript. The chevron rotates via the open state.
 */
export function ReviewFaq({ items }: { items: ReviewFaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-4">
      <SectionHeading>Frequently asked questions</SectionHeading>
      <div className="space-y-2.5">
        {items.map((faq, i) => (
          <details key={i} className="rv-card group overflow-hidden">
            <summary className="rv-focus flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-semibold text-[var(--rv-text)] [&::-webkit-details-marker]:hidden">
              {faq.question}
              <ChevronDownIcon
                width={18}
                height={18}
                className="shrink-0 text-[var(--rv-muted)] transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="border-t border-[var(--rv-border)] px-4 py-3.5 text-sm leading-relaxed text-[var(--rv-text-2)]">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
