'use client';

import { useRef, useState, type ReactNode } from 'react';

import { Markdown } from '@/components/markdown';

export interface EditorMediaItem {
  url: string;
  title: string;
}

type Selection = { start: number; end: number; text: string };

function ToolbarButton({
  onClick,
  title,
  children,
  active = false,
}: {
  onClick: () => void;
  title: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm font-semibold text-ink hover:bg-elevated ${
        active ? 'bg-elevated' : ''
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-line" />;
}

/**
 * A WordPress-style editor for the markdown body fields (reviews, pages, posts,
 * guides). It renders a hidden-free, name-bound <textarea> so the existing
 * server actions keep reading `body` unchanged, and it stores plain markdown.
 * A Preview tab renders exactly what the public site shows, using the same
 * Markdown component.
 */
export function MarkdownEditor({
  name,
  id,
  defaultValue = '',
  rows = 16,
  media = [],
}: {
  name: string;
  id?: string;
  defaultValue?: string;
  rows?: number;
  media?: EditorMediaItem[];
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [panel, setPanel] = useState<null | 'link' | 'image'>(null);
  const [linkText, setLinkText] = useState('');

  function getSelection(): Selection {
    const el = ref.current;
    if (!el) return { start: value.length, end: value.length, text: '' };
    const start = el.selectionStart;
    const end = el.selectionEnd;
    return { start, end, text: value.slice(start, end) };
  }

  // Replace the current selection with `replacement` and place the caret so
  // that the characters between caretStart and caretEnd (relative to the
  // replacement) end up selected.
  function replaceSelection(replacement: string, caretStart?: number, caretEnd?: number) {
    const el = ref.current;
    const sel = getSelection();
    const next = value.slice(0, sel.start) + replacement + value.slice(sel.end);
    setValue(next);
    setPanel(null);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const cs = sel.start + (caretStart ?? replacement.length);
      const ce = sel.start + (caretEnd ?? caretStart ?? replacement.length);
      el.setSelectionRange(cs, ce);
    });
  }

  function wrap(marker: string, placeholder: string) {
    const sel = getSelection();
    const inner = sel.text || placeholder;
    const replacement = `${marker}${inner}${marker}`;
    replaceSelection(replacement, marker.length, marker.length + inner.length);
  }

  // Apply a prefix to the start of each selected line (headings, quotes, lists).
  function prefixLines(makePrefix: (index: number) => string) {
    const el = ref.current;
    const sel = getSelection();
    // Expand selection to whole lines.
    const lineStart = value.lastIndexOf('\n', sel.start - 1) + 1;
    let lineEnd = value.indexOf('\n', sel.end);
    if (lineEnd === -1) lineEnd = value.length;
    const block = value.slice(lineStart, lineEnd) || '';
    const lines = block.split('\n');
    const rebuilt = lines.map((line, i) => `${makePrefix(i)}${line}`).join('\n');
    const next = value.slice(0, lineStart) + rebuilt + value.slice(lineEnd);
    setValue(next);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(lineStart, lineStart + rebuilt.length);
    });
  }

  function insertBlock(text: string) {
    const sel = getSelection();
    const before = value.slice(0, sel.start);
    const lead = before.length === 0 ? '' : before.endsWith('\n') ? '\n' : '\n\n';
    replaceSelection(`${lead}${text}\n\n`);
  }

  function insertHeading(level: 2 | 3) {
    const hashes = '#'.repeat(level) + ' ';
    prefixLines(() => hashes);
  }

  const tableTemplate =
    '| Column | Column |\n| --- | --- |\n| Cell | Cell |\n| Cell | Cell |';

  return (
    <div className="rounded-md border border-line bg-elevated">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-line px-2 pt-2">
        <button
          type="button"
          onClick={() => setTab('write')}
          className={`rounded-t px-3 py-1.5 text-sm font-semibold ${
            tab === 'write' ? 'bg-surface text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={`rounded-t px-3 py-1.5 text-sm font-semibold ${
            tab === 'preview' ? 'bg-surface text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          Preview
        </button>
      </div>

      {tab === 'write' && (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 border-b border-line p-1.5">
            <ToolbarButton title="Heading 2" onClick={() => insertHeading(2)}>
              H2
            </ToolbarButton>
            <ToolbarButton title="Heading 3" onClick={() => insertHeading(3)}>
              H3
            </ToolbarButton>
            <Divider />
            <ToolbarButton title="Bold" onClick={() => wrap('**', 'bold text')}>
              <span className="font-bold">B</span>
            </ToolbarButton>
            <ToolbarButton title="Italic" onClick={() => wrap('_', 'italic text')}>
              <span className="italic">I</span>
            </ToolbarButton>
            <ToolbarButton title="Inline code" onClick={() => wrap('`', 'code')}>
              <span className="font-mono">{'<>'}</span>
            </ToolbarButton>
            <Divider />
            <ToolbarButton
              title="Bulleted list"
              onClick={() => prefixLines(() => '- ')}
            >
              {'• List'}
            </ToolbarButton>
            <ToolbarButton
              title="Numbered list"
              onClick={() => prefixLines((i) => `${i + 1}. `)}
            >
              1. List
            </ToolbarButton>
            <ToolbarButton title="Quote" onClick={() => prefixLines(() => '> ')}>
              {'“ ”'}
            </ToolbarButton>
            <Divider />
            <ToolbarButton
              title="Insert link"
              onClick={() => {
                if (panel === 'link') {
                  setPanel(null);
                } else {
                  setLinkText(getSelection().text);
                  setPanel('link');
                }
              }}
              active={panel === 'link'}
            >
              Link
            </ToolbarButton>
            <ToolbarButton
              title="Insert image"
              onClick={() => setPanel(panel === 'image' ? null : 'image')}
              active={panel === 'image'}
            >
              Image
            </ToolbarButton>
            <ToolbarButton title="Insert table" onClick={() => insertBlock(tableTemplate)}>
              Table
            </ToolbarButton>
          </div>

          {panel === 'link' && (
            <LinkPanel
              defaultText={linkText}
              onCancel={() => setPanel(null)}
              onInsert={(text, url) => {
                const label = text || url;
                replaceSelection(`[${label}](${url})`);
              }}
            />
          )}

          {panel === 'image' && (
            <ImagePanel
              media={media}
              onCancel={() => setPanel(null)}
              onInsert={(alt, url) => replaceSelection(`![${alt}](${url})`)}
            />
          )}

          <textarea
            ref={ref}
            id={id}
            name={name}
            rows={rows}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full resize-y bg-surface px-3 py-2 font-mono text-sm text-ink outline-none"
          />
        </>
      )}

      {tab === 'preview' && (
        <>
          {/* Keep the value in the form even while previewing. */}
          <textarea name={name} value={value} readOnly hidden />
          <div className="min-h-40 px-4 py-3">
            {value.trim() ? (
              <Markdown>{value}</Markdown>
            ) : (
              <p className="text-sm text-muted">Nothing to preview yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function LinkPanel({
  defaultText,
  onInsert,
  onCancel,
}: {
  defaultText: string;
  onInsert: (text: string, url: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(defaultText);
  const [url, setUrl] = useState('');
  const field = 'w-full rounded border border-line bg-surface px-2 py-1.5 text-sm text-ink';
  return (
    <div className="grid gap-2 border-b border-line bg-surface/60 p-3 sm:grid-cols-[1fr_1fr_auto]">
      <div>
        <label className="mb-1 block text-xs text-muted">Link text</label>
        <input className={field} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">
          URL (use /reviews/... or /free for internal links)
        </label>
        <input
          className={field}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/reviews/example or https://..."
        />
      </div>
      <div className="flex items-end gap-2">
        <button
          type="button"
          disabled={!url}
          onClick={() => onInsert(text, url)}
          className="u-btn-primary rounded px-3 py-1.5 text-sm font-bold disabled:opacity-50"
        >
          Insert
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-ink">
          Cancel
        </button>
      </div>
    </div>
  );
}

function ImagePanel({
  media,
  onInsert,
  onCancel,
}: {
  media: EditorMediaItem[];
  onInsert: (alt: string, url: string) => void;
  onCancel: () => void;
}) {
  const [alt, setAlt] = useState('');
  const [url, setUrl] = useState('');
  const field = 'w-full rounded border border-line bg-surface px-2 py-1.5 text-sm text-ink';
  return (
    <div className="space-y-2 border-b border-line bg-surface/60 p-3">
      {media.length > 0 && (
        <div>
          <label className="mb-1 block text-xs text-muted">Pick from media library</label>
          <select
            className={field}
            value={url}
            onChange={(e) => {
              const picked = media.find((m) => m.url === e.target.value);
              setUrl(e.target.value);
              if (picked && !alt) setAlt(picked.title);
            }}
          >
            <option value="">Select an image</option>
            {media.map((m) => (
              <option key={m.url} value={m.url}>
                {m.title || m.url}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label className="mb-1 block text-xs text-muted">Image URL</label>
          <input
            className={field}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Alt text</label>
          <input className={field} value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            disabled={!url}
            onClick={() => onInsert(alt, url)}
            className="u-btn-primary rounded px-3 py-1.5 text-sm font-bold disabled:opacity-50"
          >
            Insert
          </button>
          <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-ink">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
