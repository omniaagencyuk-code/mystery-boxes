import Link from 'next/link';

import { deletePost } from './actions';
import { DeleteButton, EmptyState, PageHeader, StatusBadge } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function PostsListPage() {
  const db = await adminPageClient();
  if (!db) return null;

  const [{ data: posts }, { data: markets }] = await Promise.all([
    db.from('posts').select('*').order('updated_at', { ascending: false }),
    db.from('markets').select('id, code'),
  ]);
  const marketCode = new Map((markets ?? []).map((m) => [m.id, m.code]));

  return (
    <div>
      <PageHeader title="Posts" action={{ href: '/admin/posts/new', label: 'New post' }} />
      {!posts || posts.length === 0 ? (
        <EmptyState>No posts yet.</EmptyState>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700">
              <th className="py-2">Title</th>
              <th className="py-2">Slug</th>
              <th className="py-2">Market</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2">{p.title}</td>
                <td className="py-2 text-gray-500">{p.slug}</td>
                <td className="py-2">{marketCode.get(p.market_id)}</td>
                <td className="py-2">
                  <StatusBadge status={p.status} />
                </td>
                <td className="py-2 text-right">
                  <span className="inline-flex gap-3">
                    <Link href={`/admin/posts/${p.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                      Edit
                    </Link>
                    <DeleteButton action={deletePost} id={p.id} />
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
