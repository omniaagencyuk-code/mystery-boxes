import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { headingSlug } from '@/lib/guides/toc';

/** Plain-text of a heading's children, for a stable anchor id. */
function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return nodeText((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return '';
}

/**
 * Renders CMS markdown (guides, pages, posts, reviews) with themed elements.
 * react-markdown does not use dangerouslySetInnerHTML and escapes raw HTML by
 * default, so author content cannot inject scripts.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-4 text-ink/90">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 id={headingSlug(nodeText(children))} className="mt-8 mb-3 scroll-mt-24 text-2xl font-bold text-ink">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 id={headingSlug(nodeText(children))} className="mt-6 mb-2 scroll-mt-24 text-xl font-semibold text-ink">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-6">{children}</ol>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-accent underline underline-offset-2 hover:no-underline"
              {...(href && !href.startsWith('/')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 text-muted">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-line px-3 py-2 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => <td className="border-b border-line px-3 py-2">{children}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
