'use client';

import { useState } from 'react';

const WIDTHS = [
  { id: 'desktop', label: 'Desktop', width: '100%' },
  { id: 'tablet', label: 'Tablet', width: '768px' },
  { id: 'mobile', label: 'Mobile', width: '390px' },
] as const;

/** Live preview of /free at desktop / tablet / mobile widths. */
export function FreePreview() {
  const [width, setWidth] = useState<string>('100%');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {WIDTHS.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setWidth(w.width)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              width === w.width ? 'border-primary text-ink' : 'border-line text-muted hover:text-ink'
            }`}
          >
            {w.label}
          </button>
        ))}
        <a
          href="/free"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-sm font-semibold text-primary hover:underline"
        >
          Open in new tab
        </a>
      </div>
      <p className="text-xs text-muted">Save your changes first to see them reflected in the preview.</p>
      <div className="overflow-hidden rounded-lg border border-line bg-elevated">
        <iframe
          title="Free page preview"
          src="/free"
          style={{ width, height: '720px' }}
          className="mx-auto block border-0"
        />
      </div>
    </div>
  );
}
