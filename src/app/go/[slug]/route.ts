import { NextResponse } from 'next/server';

import { createPublicSupabase } from '@/lib/supabase/public';

// Cloaked affiliate redirect. Resolves an active link by slug, records the click
// via the SECURITY DEFINER function, and 302s to the real target. Kept out of
// the index by robots. Dynamic so every hit resolves the current target.
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicSupabase();

  const { data } = await supabase
    .from('affiliate_links')
    .select('target_url')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (!data) {
    // Send unknown or inactive links to the homepage rather than expose a 404.
    return NextResponse.redirect(new URL('/', request.url), { status: 302 });
  }

  // Record the click with its context (placement, CTA label, originating page)
  // and bump the counter. Best-effort; never block the redirect on it.
  const url = new URL(request.url);
  await supabase.rpc('record_affiliate_click', {
    link_slug: slug,
    placement: url.searchParams.get('p'),
    cta_label: url.searchParams.get('l'),
    page_path: url.searchParams.get('pg'),
  });

  return NextResponse.redirect(data.target_url, { status: 302 });
}
