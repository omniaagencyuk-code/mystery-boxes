import Link from 'next/link';

import { deleteCategory } from './actions';
import { DeleteButton, EmptyState, PageHeader } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function CategoriesListPage() {
  const db = await adminPageClient();
  if (!db) return null;

  const [{ data: categories }, { data: markets }] = await Promise.all([
    db.from('categories').select('*').order('name'),
    db.from('markets').select('id, code'),
  ]);
  const marketCode = new Map((markets ?? []).map((m) => [m.id, m.code]));

  return (
    <div>
      <PageHeader title="Categories" action={{ href: '/admin/categories/new', label: 'New category' }} />
      {!categories || categories.length === 0 ? (
        <EmptyState>No categories yet.</EmptyState>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700">
              <th className="py-2">Name</th>
              <th className="py-2">Slug</th>
              <th className="py-2">Market</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2">{cat.name}</td>
                <td className="py-2 text-gray-500">{cat.slug}</td>
                <td className="py-2">{cat.market_id ? marketCode.get(cat.market_id) : 'All'}</td>
                <td className="py-2 text-right">
                  <span className="inline-flex gap-3">
                    <Link href={`/admin/categories/${cat.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                      Edit
                    </Link>
                    <DeleteButton action={deleteCategory} id={cat.id} />
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
