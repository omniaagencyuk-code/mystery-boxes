'use client';

import { useId, useState, type ReactNode } from 'react';

export interface AdminTab {
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * Accessible tab strip for a single admin form. All panels stay mounted (hidden
 * via the `hidden` attribute) so every field still submits with one Save, and
 * Repeater state is preserved across tab switches.
 */
export function AdminTabs({ tabs }: { tabs: AdminTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const base = useId();

  return (
    <div>
      <div role="tablist" aria-label="Free page editor" className="mb-5 flex flex-wrap gap-1 border-b border-line">
        {tabs.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${t.id}`}
              onClick={() => setActive(t.id)}
              className={`-mb-px rounded-t-md border-b-2 px-4 py-2 text-sm font-medium ${
                selected
                  ? 'border-primary text-ink'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={t.id !== active}
          className="space-y-4"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
