/** Slugify heading text into an id/anchor. Shared by the renderer and the TOC. */
export function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface TocItem {
  depth: 2 | 3;
  text: string;
  id: string;
}

/**
 * Extract a table of contents from markdown: level-2 and level-3 headings, in
 * document order, with slug ids that match the rendered heading ids. Fenced code
 * blocks are ignored so a `## ` inside code is not treated as a heading.
 */
export function guideToc(markdown: string | null | undefined): TocItem[] {
  if (!markdown) return [];
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      const text = m[2].trim();
      items.push({ depth: m[1].length as 2 | 3, text, id: headingSlug(text) });
    }
  }
  return items;
}

/** Estimated read time in minutes from a body, at ~200 words per minute. */
export function readMinutes(body: string | null | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
