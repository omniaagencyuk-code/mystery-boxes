'use client';

import { useEffect, useRef, useState } from 'react';

export interface SectionNavItem {
  id: string;
  label: string;
}

/**
 * Sticky section navigation with scroll spy. Desktop: sticky under the header
 * with a clear active state and smooth scroll. Mobile: horizontally scrollable
 * with large tap targets. Honours prefers-reduced-motion for the scroll jump.
 */
export function ReviewSectionNav({ items }: { items: SectionNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '');
  // While true, scroll-spy updates are ignored so a clicked tab stays active
  // through the smooth scroll. A boolean ref + timer keeps the handler pure.
  const clickLock = useRef(false);

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (clickLock.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Bias the active line toward the upper third of the viewport.
      { rootMargin: '-120px 0px -65% 0px', threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    setActive(id);
    clickLock.current = true;
    window.setTimeout(() => {
      clickLock.current = false;
    }, 700);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    // Update the hash without a second jump.
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav
      aria-label="Review sections"
      className="sticky top-0 z-30 -mx-4 border-y border-[var(--rv-border)] bg-[var(--rv-bg-2)]/92 backdrop-blur sm:mx-0 sm:rounded-xl sm:border"
    >
      <ul className="flex gap-1 overflow-x-auto px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                onClick={(e) => onClick(e, item.id)}
                aria-current={isActive ? 'true' : undefined}
                className={`rv-focus inline-block whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[var(--rv-nested)] text-[var(--rv-blue)]'
                    : 'text-[var(--rv-text-2)] hover:text-[var(--rv-text)]'
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
