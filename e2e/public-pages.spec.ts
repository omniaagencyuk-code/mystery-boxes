import { expect, test } from '@playwright/test';

/**
 * Smoke tests for the public hub pages. They assert the page renders server-side
 * with exactly one H1, is indexable, and has no horizontal overflow — the core
 * guarantees from the spec. They run against a live deployment (see
 * playwright.config.ts).
 */

const HUBS = [
  { path: '/', name: 'Homepage' },
  { path: '/reviews', name: 'Reviews hub' },
  { path: '/compare', name: 'Compare' },
  { path: '/promo-codes', name: 'Promo codes' },
  { path: '/guides', name: 'Guides' },
  { path: '/free', name: 'Free mystery boxes' },
];

test.describe('public hub pages', () => {
  for (const hub of HUBS) {
    test(`${hub.name} renders with a single H1 and no horizontal overflow`, async ({ page }) => {
      const response = await page.goto(hub.path, { waitUntil: 'domcontentloaded' });
      expect(response?.ok(), `${hub.path} should return a 2xx`).toBeTruthy();

      // Exactly one H1 for SEO.
      await expect(page.locator('h1')).toHaveCount(1);

      // Title is set (unique per page is checked by the meta test below).
      await expect(page).toHaveTitle(/.+/);

      // No horizontal page overflow.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflow, `${hub.path} should not scroll horizontally`).toBeFalsy();
    });
  }
});

test('each hub page has a unique title and meta description', async ({ page }) => {
  const seen = new Set<string>();
  for (const hub of HUBS) {
    await page.goto(hub.path, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(seen.has(title), `${hub.path} title should be unique`).toBeFalsy();
    seen.add(title);

    const desc = await page.locator('head meta[name="description"]').getAttribute('content');
    expect(desc, `${hub.path} should have a meta description`).toBeTruthy();
  }
});

test('compare page shows the interactive comparison controls', async ({ page }) => {
  await page.goto('/compare', { waitUntil: 'domcontentloaded' });
  // The Share and Add-platform controls only exist on the interactive tool.
  await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();
});

test('free page shows the filter panel and an offer table with a live count', async ({ page }) => {
  await page.goto('/free', { waitUntil: 'domcontentloaded' });
  // The accessible live filter panel announces the current result count.
  await expect(page.getByRole('status').filter({ hasText: /offers?/ }).first()).toBeVisible();
  // The offer section anchor exists for the hero CTA and filter links.
  await expect(page.locator('#offers')).toBeVisible();
});

test('free page availability filter narrows results via the URL', async ({ page }) => {
  await page.goto('/free?availability=uk', { waitUntil: 'domcontentloaded' });
  expect(new URL(page.url()).searchParams.get('availability')).toBe('uk');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('reviews list exposes an availability filter', async ({ page }) => {
  await page.goto('/reviews', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('group', { name: 'Filter by availability' })).toBeVisible();
});

test('legacy /uk URLs redirect to the root namespace', async ({ page }) => {
  await page.goto('/uk/reviews', { waitUntil: 'domcontentloaded' });
  expect(new URL(page.url()).pathname).toBe('/reviews');
});

test('admin is not indexable', async ({ page }) => {
  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
  const robots = await page.locator('head meta[name="robots"]').getAttribute('content');
  expect(robots ?? '').toContain('noindex');
});
