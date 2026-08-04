import Link from 'next/link';

import { deleteOperator } from './actions';
import { DeleteButton, EmptyState, PageHeader } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function OperatorsListPage() {
  const db = await adminPageClient();
  if (!db) return null;

  const [{ data: operators }, { data: types }] = await Promise.all([
    db.from('operators').select('*').order('name'),
    db.from('operator_types').select('id, name'),
  ]);
  const typeName = new Map((types ?? []).map((t) => [t.id, t.name]));

  return (
    <div>
      <PageHeader title="Operators" action={{ href: '/admin/operators/new', label: 'New operator' }} />
      {!operators || operators.length === 0 ? (
        <EmptyState>No operators yet.</EmptyState>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700">
              <th className="py-2">Name</th>
              <th className="py-2">Type</th>
              <th className="py-2">Rating</th>
              <th className="py-2">Active</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((o) => (
              <tr key={o.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2">{o.name}</td>
                <td className="py-2 text-gray-500">{typeName.get(o.operator_type_id)}</td>
                <td className="py-2">{o.rating ?? '—'}</td>
                <td className="py-2">{o.active ? 'Yes' : 'No'}</td>
                <td className="py-2 text-right">
                  <span className="inline-flex gap-3">
                    <Link href={`/admin/operators/${o.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                      Edit
                    </Link>
                    <DeleteButton action={deleteOperator} id={o.id} />
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
