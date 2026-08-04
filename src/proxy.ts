import { NextResponse, type NextRequest } from 'next/server';

import { isOperatorGeoBlockedViaRest } from '@/lib/data/geo-block';
import { updateSession } from '@/lib/supabase/session';
import {
  BANNER_DISMISS_COOKIE,
  GEO_HEADERS,
  GEO_OVERRIDE_COOKIE,
  GEO_OVERRIDE_PARAM,
  detectMarketChain,
  isSupportedMarket,
  parseGeoOverride,
  rootMarketFromChain,
} from '@/lib/geo';

/**
 * Proxy (formerly the middleware file convention, renamed in Next 16).
 * Responsibilities, kept strictly separate:
 *
 *  - Geo DETECTION: read the visitor country/region from Vercel headers and pass
 *    a market context to the app via request headers. We NEVER hard-redirect on
 *    IP. Most search crawlers originate in the US, and a redirect would stop the
 *    UK section being indexed.
 *
 *  - Soft market SUGGESTION: if the detected market differs from the market the
 *    visitor is viewing, and they have not dismissed the banner, signal the app
 *    to show a dismissable switch banner.
 *
 *  - Hard geo BLOCK: for a review page whose operator requires_geo_block for the
 *    visitor's detected market, return a 404 (not a 403, so the page does not
 *    advertise its own existence). This is a fast early guard; the review page
 *    re-checks authoritatively against the database. Crawlers are never blocked
 *    wholesale, only by the same per-market rule as everyone else.
 */

const REVIEW_PATH = /^\/(uk|us)\/reviews\/([^/]+)\/?$/;

function readGeo(request: NextRequest): { country: string | null; region: string | null } {
  // Production: Vercel geolocation headers (request.geo was removed in Next 16).
  const country = request.headers.get('x-vercel-ip-country');
  const region = request.headers.get('x-vercel-ip-country-region');
  if (country) return { country, region };

  // Development / preview: allow ?geo=US-WA or an mb_geo cookie to simulate.
  if (process.env.NODE_ENV !== 'production') {
    const override =
      request.nextUrl.searchParams.get(GEO_OVERRIDE_PARAM) ??
      request.cookies.get(GEO_OVERRIDE_COOKIE)?.value ??
      null;
    if (override) return parseGeoOverride(override);
  }

  return { country: null, region: null };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin area: refresh the auth session and require a logged-in user. The admin
  // layout additionally verifies the user is on the admins allowlist. The login
  // page is the one admin path reachable without a session.
  if (pathname.startsWith('/admin')) {
    const { response, userId } = await updateSession(request);
    const isLogin = pathname === '/admin/login';
    if (!userId && !isLogin) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userId && isLogin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return response;
  }

  const { country, region } = readGeo(request);
  const chain = detectMarketChain(country, region);
  const detectedMarket = rootMarketFromChain(chain);

  const pathSegment = pathname.split('/')[1] ?? '';
  const pathMarket = isSupportedMarket(pathSegment) ? pathSegment : null;

  // Hard geo block: 404 a blocked review page before it renders.
  const reviewMatch = pathname.match(REVIEW_PATH);
  if (reviewMatch) {
    const operatorSlug = decodeURIComponent(reviewMatch[2]);
    if (await isOperatorGeoBlockedViaRest(operatorSlug, chain)) {
      // Rewrite to a path with no route so Next serves not-found with a 404
      // status. A 404 (not 403) keeps the operator's existence private.
      return NextResponse.rewrite(new URL('/__mb_geo_blocked', request.url));
    }
  }

  // Soft suggestion: offer to switch when the detected market differs from the
  // one being viewed and the banner has not been dismissed.
  const dismissed = request.cookies.get(BANNER_DISMISS_COOKIE)?.value === '1';
  const suggestSwitch =
    !dismissed && detectedMarket && pathMarket && detectedMarket !== pathMarket
      ? detectedMarket
      : null;

  // Forward the geo context to the app on request headers.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(GEO_HEADERS.country, country ?? '');
  requestHeaders.set(GEO_HEADERS.region, region ?? '');
  requestHeaders.set(GEO_HEADERS.detectedMarket, detectedMarket ?? '');
  requestHeaders.set(GEO_HEADERS.geoCandidates, chain.join(','));
  requestHeaders.set(GEO_HEADERS.pathMarket, pathMarket ?? '');
  requestHeaders.set(GEO_HEADERS.suggestSwitch, suggestSwitch ?? '');

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Run on pages only. Skip Next internals, static assets and files with an
  // extension so we do not add latency to asset requests.
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
