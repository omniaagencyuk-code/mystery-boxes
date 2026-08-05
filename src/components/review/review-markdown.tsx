import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Markdown renderer themed for the dark-navy review palette. Like the site-wide
 * Markdown component it escapes raw HTML (no dangerouslySetInnerHTML), so author
 * content cannot inject scripts. Used for the main review body and rich-text
 * blocks.
 */
export function ReviewMarkdown({ children }: { children: string }) {
  return (
    <div className="space-y-4 text-[16px] leading-relaxed text-[var(--rv-text-2)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="mt-8 mb-3 text-2xl font-extrabold text-[var(--rv-text)]">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-2 text-xl font-bold text-[var(--rv-text)]">{children}</h3>
          ),
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-1.5 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1.5 pl-6">{children}</ol>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-[var(--rv-blue)] underline underline-offset-2 hover:no-underline"
              {...(href && !href.startsWith('/')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--rv-text)]">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="rv-nested border-l-2 border-l-[var(--rv-blue)] p-4 italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-[var(--rv-border)] px-3 py-2 text-left font-bold text-[var(--rv-text)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[var(--rv-border)] px-3 py-2">{children}</td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
