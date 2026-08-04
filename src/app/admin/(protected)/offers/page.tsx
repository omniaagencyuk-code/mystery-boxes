import Link from 'next/link';

import { deleteOffer } from './actions';
import { DeleteButton, EmptyState, PageHeader } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function OffersListPage() {
  const db = await adminPageClient();
  if (!db) return null;

  const [{ data: offers }, { data: operators }] = await Promise.all([
    db.from('offers').select('*').order('title'),
    db.from('operators').select('id, name'),
  ]);
  const operatorName = new Map((operators ?? []).map((o) => [o.id, o.name]));

  return (
    <div>
      <PageHeader title="Offers" action={{ href: '/admin/offers/new', label: 'New offer' }} />
      {!offers || offers.length === 0 ? (
        <EmptyState>No offers yet.</EmptyState>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700">
              <th className="py-2">Title</th>
              <th className="py-2">Operator</th>
              <th className="py-2">Code</th>
              <th className="py-2">Active</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2">{o.title}</td>
                <td className="py-2">{operatorName.get(o.operator_id) ?? '—'}</td>
                <td className="py-2 text-gray-500">{o.code ?? ''}</td>
                <td className="py-2">{o.active ? 'Yes' : 'No'}</td>
                <td className="py-2 text-right">
                  <span className="inline-flex gap-3">
                    <Link href={`/admin/offers/${o.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                      Edit
                    </Link>
                    <DeleteButton action={deleteOffer} id={o.id} />
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
