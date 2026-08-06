import { NextResponse, type NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/session';
import {
  GEO_HEADERS,
  GEO_OVERRIDE_COOKIE,
  GEO_OVERRIDE_PARAM,
  ROOT_MARKET,
  detectMarketChain,
  parseGeoOverride,
  rootMarketFromChain,
} from '@/lib/geo';

/**
 * Proxy (formerly the middleware file convention, renamed in Next 16).
 * Responsibilities, kept strictly separate:
 *
 *  - Admin auth gate: require a logged-in user for /admin (except the login page).
 *
 *  - Single-namespace ROUTING: the site is served at the root. Clean root paths
 *    are rewritten internally onto the /us route tree while the browser URL stays
 *    unprefixed. Legacy /uk/* URLs are permanently redirected (301) to their root
 *    equivalent, and explicit /us/* URLs are redirected (308) to the clean root,
 *    so there is a single canonical URL for every page. We NEVER redirect on IP.
 *
 *  - Geo DETECTION: read the visitor country/region and forward a light geo
 *    context to the app on request headers. There is no market switching and no
 *    hard geo block; availability is a per-record filter surfaced in the UI.
 */

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

  // The UK subdirectory has been removed. Permanently redirect legacy /uk or
  // /uk/* URLs to their root equivalent so old links and search results resolve.
  if (pathname === '/uk' || pathname.startsWith('/uk/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 301);
  }

  // Redirect any explicit /us or /us/* URL to its clean root equivalent so there
  // is a single canonical URL.
  if (pathname === '/us' || pathname.startsWith('/us/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }

  const { country, region } = readGeo(request);
  const chain = detectMarketChain(country, region);
  const detectedMarket = rootMarketFromChain(chain);
  const isGo = pathname === '/go' || pathname.startsWith('/go/');

  // Forward a light geo context to the app on request headers.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(GEO_HEADERS.country, country ?? '');
  requestHeaders.set(GEO_HEADERS.region, region ?? '');
  requestHeaders.set(GEO_HEADERS.detectedMarket, detectedMarket ?? '');
  requestHeaders.set(GEO_HEADERS.geoCandidates, chain.join(','));
  requestHeaders.set(GEO_HEADERS.pathMarket, ROOT_MARKET);
  requestHeaders.set(GEO_HEADERS.suggestSwitch, '');

  // Root app paths render the /us route tree internally while the browser keeps
  // the clean, unprefixed URL. /go (the affiliate tracker) passes through.
  if (!isGo) {
    const target = request.nextUrl.clone();
    target.pathname = pathname === '/' ? '/us' : `/us${pathname}`;
    return NextResponse.rewrite(target, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Run on pages only. Skip Next internals, static assets and files with an
  // extension so we do not add latency to asset requests.
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
