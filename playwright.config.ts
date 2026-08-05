import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright end-to-end config.
 *
 * These tests run against a RUNNING deployment, not a build step: point them at
 * a Vercel preview or a local `next start` with the Supabase env vars set:
 *
 *   PLAYWRIGHT_BASE_URL=https://<preview>.vercel.app npm run test:e2e
 *
 * The app renders from Supabase, so it needs a reachable database to serve pages
 * — that is why this is separate from the unit tests (`npm test`).
 *
 * Chromium is provided by the environment (PLAYWRIGHT_BROWSERS_PATH). Set
 * PLAYWRIGHT_EXECUTABLE_PATH to override the browser binary if needed.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: { executablePath } },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], launchOptions: { executablePath } },
    },
  ],
});
