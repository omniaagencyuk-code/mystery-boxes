'use client';

import { useState } from 'react';

/**
 * Copy-to-clipboard button for a promo code. Shows brief "Copied" feedback and
 * is keyboard operable. Falls back silently if the clipboard API is unavailable.
 */
export function CopyCode({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked; leave the code visible for manual copy.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Code copied' : `Copy code ${code}`}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-primary/50 bg-elevated px-3 py-2 text-sm font-bold tracking-wider text-ink transition-colors hover:border-primary ${className ?? ''}`}
    >
      <span className="font-mono">{code}</span>
      <span className={`text-xs font-semibold ${copied ? 'text-success' : 'text-accent'}`}>
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  );
}
