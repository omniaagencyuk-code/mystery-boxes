import Link from 'next/link';

import { getCurrentAdmin } from '@/lib/admin/auth';
import { createAdminSupabase } from '@/lib/supabase/admin';

// Admin pages read with the secret-key client so drafts and inactive rows are
// visible. We verify admin status first; the client bypasses RLS.
async function countOf(table: string): Promise<number> {
  const supabase = createAdminSupabase();
  const { count } = await supabase
    .from(table as 'operators')
    .select('*', { count: 'exact', head: true });
  return count ?? 0;
}

const CARDS: { table: string; label: string; href: string }[] = [
  { table: 'operators', label: 'Operators', href: '/admin/operators' },
  { table: 'reviews', label: 'Reviews', href: '/admin/reviews' },
  { table: 'categories', label: 'Categories', href: '/admin/categories' },
  { table: 'pages', label: 'Pages', href: '/admin/pages' },
  { table: 'posts', label: 'Posts', href: '/admin/posts' },
  { table: 'offers', label: 'Offers', href: '/admin/offers' },
  { table: 'affiliate_links', label: 'Affiliate links', href: '/admin/affiliate-links' },
  { table: 'media', label: 'Media', href: '/admin/media' },
];

export default async function AdminDashboard() {
  const admin = await getCurrentAdmin();
  if (!admin) return null; // Layout renders the not-authorised message.

  const counts = await Promise.all(CARDS.map((c) => countOf(c.table)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">Manage everything on the site from here.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card, i) => (
          <Link
            key={card.href}
            href={card.href}
            className="u-glass rounded-xl p-4 transition-colors hover:text-primary"
          >
            <div className="text-2xl font-bold text-ink">{counts[i]}</div>
            <div className="text-sm text-muted">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
