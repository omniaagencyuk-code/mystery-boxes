import Link from 'next/link';

import { deleteReview } from './actions';
import { DeleteButton, EmptyState, PageHeader, StatusBadge } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function ReviewsListPage() {
  const db = await adminPageClient();
  if (!db) return null;

  const [{ data: reviews }, { data: operators }, { data: markets }] = await Promise.all([
    db.from('reviews').select('*').order('updated_at', { ascending: false }),
    db.from('operators').select('id, name'),
    db.from('markets').select('id, code'),
  ]);
  const operatorName = new Map((operators ?? []).map((o) => [o.id, o.name]));
  const marketCode = new Map((markets ?? []).map((m) => [m.id, m.code]));

  return (
    <div>
      <PageHeader title="Reviews" action={{ href: '/admin/reviews/new', label: 'New review' }} />
      {!reviews || reviews.length === 0 ? (
        <EmptyState>No reviews yet.</EmptyState>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700">
              <th className="py-2">Operator</th>
              <th className="py-2">Market</th>
              <th className="py-2">Verdict</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2">{operatorName.get(r.operator_id) ?? '—'}</td>
                <td className="py-2">{marketCode.get(r.market_id)}</td>
                <td className="py-2 text-gray-500">{r.verdict ?? ''}</td>
                <td className="py-2">
                  <StatusBadge status={r.status} />
                </td>
                <td className="py-2 text-right">
                  <span className="inline-flex gap-3">
                    <Link href={`/admin/reviews/${r.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                      Edit
                    </Link>
                    <DeleteButton action={deleteReview} id={r.id} />
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
