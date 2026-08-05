import { ChevronDownIcon } from '@/components/review/icons';

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Site-wide FAQ accordion on native details/summary: keyboard accessible and
 * works without client JavaScript. Uses the shared theme tokens.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2.5">
      {items.map((faq, i) => (
        <details key={i} className="group overflow-hidden rounded-xl border border-line bg-surface/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {faq.question}
            <ChevronDownIcon
              width={18}
              height={18}
              className="shrink-0 text-muted transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="border-t border-line px-4 py-3.5 text-sm leading-relaxed text-muted">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
