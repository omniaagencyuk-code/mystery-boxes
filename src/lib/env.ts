// Centralised, typed access to environment variables with clear error messages.
//
// NEXT_PUBLIC_* values are inlined at build time and are safe in the browser.
// The Supabase secret key is intentionally NOT exposed here; it is read only
// inside the server-only admin client so it can never leak into a client bundle.

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

/** Public Supabase config. Safe to reference from client or server code. */
export const supabaseUrl = () =>
  required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);

export const supabasePublishableKey = () =>
  required(
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

/**
 * Public site URL, used for canonical links, sitemap and hreflang. Falls back to
 * localhost during development so builds do not fail before it is configured.
 */
export const siteUrl = (): string => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return raw.replace(/\/$/, '');
};
