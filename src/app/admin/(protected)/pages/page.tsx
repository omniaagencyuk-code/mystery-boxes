import Link from 'next/link';

import { deletePage } from './actions';
import { DeleteButton, EmptyState, PageHeader, StatusBadge } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function PagesListPage() {
  const db = await adminPageClient();
  if (!db) return null;

  const [{ data: pages }, { data: markets }] = await Promise.all([
    db.from('pages').select('*').order('updated_at', { ascending: false }),
    db.from('markets').select('id, code'),
  ]);
  const marketCode = new Map((markets ?? []).map((m) => [m.id, m.code]));

  return (
    <div>
      <PageHeader title="Pages" action={{ href: '/admin/pages/new', label: 'New page' }} />
      {!pages || pages.length === 0 ? (
        <EmptyState>No pages yet.</EmptyState>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2">Title</th>
              <th className="py-2">Slug</th>
              <th className="py-2">Market</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-b border-line">
                <td className="py-2">{p.title}</td>
                <td className="py-2 text-muted">{p.slug}</td>
                <td className="py-2">{marketCode.get(p.market_id)}</td>
                <td className="py-2">
                  <StatusBadge status={p.status} />
                </td>
                <td className="py-2 text-right">
                  <span className="inline-flex gap-3">
                    <Link href={`/admin/pages/${p.id}`} className="text-primary hover:underline">
                      Edit
                    </Link>
                    <DeleteButton action={deletePage} id={p.id} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
