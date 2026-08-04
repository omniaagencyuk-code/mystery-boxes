import { NextResponse } from 'next/server';

import { createPublicSupabase } from '@/lib/supabase/public';

// Cloaked affiliate redirect. Resolves an active link by slug, records the click
// via the SECURITY DEFINER function, and 302s to the real target. Kept out of
// the index by robots. Dynamic so every hit resolves the current target.
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
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
    return NextResponse.redirect(new URL('/', _request.url), { status: 302 });
  }

  // Best-effort click count; never block the redirect on it.
  await supabase.rpc('increment_affiliate_click', { link_slug: slug });

  return NextResponse.redirect(data.target_url, { status: 302 });
}
