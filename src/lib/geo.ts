// Geo detection primitives shared by middleware and the data layer.
//
// Two distinct behaviours are built on top of this module. Do not conflate them:
//   1. Soft market suggestion: a dismissable banner if the visitor's detected
//      market differs from the market section they are viewing. Never a redirect.
//   2. Hard geo block: operators flagged requires_geo_block for the visitor's
//      detected market must not be served at all (404) and must be excluded from
//      every listing.

/** Top level markets that have a URL section (/uk, /us). */
export const SUPPORTED_MARKETS = ['uk', 'us'] as const;
export type MarketCode = (typeof SUPPORTED_MARKETS)[number];

export function isSupportedMarket(value: string): value is MarketCode {
  return (SUPPORTED_MARKETS as readonly string[]).includes(value);
}

/** Human labels for the market chooser and the soft-switch banner. */
export const MARKET_LABELS: Record<MarketCode, string> = {
  uk: 'United Kingdom',
  us: 'United States',
};

// Request headers middleware sets for the app to read. Prefixed x-mb- so they
// are easy to spot and cannot collide with platform headers.
export const GEO_HEADERS = {
  country: 'x-mb-country',
  region: 'x-mb-region',
  /** Root market detected from IP: 'uk', 'us', or '' when unknown. */
  detectedMarket: 'x-mb-detected-market',
  /** Detected market chain, most specific first, e.g. 'us-wa,us'. */
  geoCandidates: 'x-mb-geo-candidates',
  /** Market section of the current URL: 'uk', 'us', or '' outside a market. */
  pathMarket: 'x-mb-path-market',
  /** Set to a market code when we should offer to switch the visitor. */
  suggestSwitch: 'x-mb-suggest-switch',
} as const;

/** Cookie the visitor sets by dismissing the soft-switch banner. */
export const BANNER_DISMISS_COOKIE = 'mb_market_banner_dismissed';

/** Dev-only cookie/param to simulate a country, e.g. US or US-WA. */
export const GEO_OVERRIDE_COOKIE = 'mb_geo';
export const GEO_OVERRIDE_PARAM = 'geo';

/**
 * Map an ISO country (and optional region) to the detected market chain, most
 * specific first. The chain is generic: a US visitor in region WA becomes
 * ['us-wa', 'us'] with no per-state code, so new sub-region exclusions need only
 * data (a market row plus an operator_markets row), never a code change here.
 *
 * Codes that do not exist in the database are harmless: no operator_markets row
 * references them, so they never match a geo block.
 */
export function detectMarketChain(
  country: string | null | undefined,
  region?: string | null,
): MarketCode[] | string[] {
  if (!country) return [];
  const c = country.toUpperCase();

  if (c === 'GB') return ['uk'];

  if (c === 'US') {
    const r = region?.trim();
    return r ? [`us-${r.toLowerCase()}`, 'us'] : ['us'];
  }

  return [];
}

/** The root market (with a URL section) for a detected chain, or null. */
export function rootMarketFromChain(chain: readonly string[]): MarketCode | null {
  for (let i = chain.length - 1; i >= 0; i -= 1) {
    if (isSupportedMarket(chain[i])) return chain[i] as MarketCode;
  }
  return null;
}

/** Parse a dev override value like 'US' or 'US-WA' into { country, region }. */
export function parseGeoOverride(value: string | null | undefined): {
  country: string | null;
  region: string | null;
} {
  if (!value) return { country: null, region: null };
  const [country, region] = value.split('-');
  return { country: country || null, region: region || null };
}
