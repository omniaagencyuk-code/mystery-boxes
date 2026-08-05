import { describe, expect, it } from 'vitest';

import { guideToc, headingSlug, readMinutes } from '@/lib/guides/toc';

describe('headingSlug', () => {
  it('slugifies heading text', () => {
    expect(headingSlug('How the Odds Work')).toBe('how-the-odds-work');
    expect(headingSlug('  Is it legit?  ')).toBe('is-it-legit');
    expect(headingSlug('A/B & C')).toBe('a-b-c');
  });
});

describe('guideToc', () => {
  it('extracts h2 and h3 headings with matching ids', () => {
    const md = ['# Title', '', '## First section', 'text', '### Sub point', '## Second'].join('\n');
    expect(guideToc(md)).toEqual([
      { depth: 2, text: 'First section', id: 'first-section' },
      { depth: 3, text: 'Sub point', id: 'sub-point' },
      { depth: 2, text: 'Second', id: 'second' },
    ]);
  });

  it('ignores headings inside fenced code blocks', () => {
    const md = ['## Real', '```', '## Not a heading', '```', '## Also real'].join('\n');
    expect(guideToc(md).map((t) => t.text)).toEqual(['Real', 'Also real']);
  });

  it('returns an empty list for empty input', () => {
    expect(guideToc(null)).toEqual([]);
    expect(guideToc('')).toEqual([]);
  });
});

describe('readMinutes', () => {
  it('estimates read time at ~200 wpm with a floor of 1', () => {
    expect(readMinutes(null)).toBe(1);
    expect(readMinutes('one two three')).toBe(1);
    expect(readMinutes(Array.from({ length: 400 }, () => 'word').join(' '))).toBe(2);
  });
});
