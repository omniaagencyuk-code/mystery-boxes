import { headers } from 'next/headers';

import { GEO_HEADERS, isSupportedMarket, type MarketCode } from '@/lib/geo';

/**
 * Per-request geo context, derived from the headers middleware set. Server
 * Components read this to make market-aware and geo-block decisions. Reading
 * headers makes a route dynamic, which is intended: geo-block depends on the
 * visitor, so these pages must be server rendered per request.
 */
export interface RequestGeoContext {
  country: string | null;
  /** Root market detected from IP, or null when unknown. */
  detectedMarket: MarketCode | null;
  /** Detected market chain, most specific first, e.g. ['us-wa', 'us']. */
  geoChain: string[];
  /** Market section of the current URL, or null outside a market. */
  pathMarket: MarketCode | null;
  /** Market to offer switching to, or null when no suggestion applies. */
  suggestSwitch: MarketCode | null;
}

export async function getRequestGeoContext(): Promise<RequestGeoContext> {
  const h = await headers();

  const detected = h.get(GEO_HEADERS.detectedMarket) ?? '';
  const path = h.get(GEO_HEADERS.pathMarket) ?? '';
  const suggest = h.get(GEO_HEADERS.suggestSwitch) ?? '';
  const candidates = h.get(GEO_HEADERS.geoCandidates) ?? '';

  return {
    country: h.get(GEO_HEADERS.country) || null,
    detectedMarket: isSupportedMarket(detected) ? detected : null,
    geoChain: candidates ? candidates.split(',').filter(Boolean) : [],
    pathMarket: isSupportedMarket(path) ? path : null,
    suggestSwitch: isSupportedMarket(suggest) ? suggest : null,
  };
}
