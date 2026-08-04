import Link from 'next/link';

import { deleteAffiliateLink } from './actions';
import { DeleteButton, EmptyState, PageHeader } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function AffiliateLinksListPage() {
  const db = await adminPageClient();
  if (!db) return null;

  const { data: links } = await db
    .from('affiliate_links')
    .select('*')
    .order('label');

  return (
    <div>
      <PageHeader title="Affiliate links" action={{ href: '/admin/affiliate-links/new', label: 'New link' }} />
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Each link is reachable at <code>/go/&lt;slug&gt;</code>, which redirects to the target and
        counts the click. Use these in content instead of raw affiliate URLs.
      </p>
      {!links || links.length === 0 ? (
        <EmptyState>No affiliate links yet.</EmptyState>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700">
              <th className="py-2">Label</th>
              <th className="py-2">Go link</th>
              <th className="py-2">Clicks</th>
              <th className="py-2">Active</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2">{l.label}</td>
                <td className="py-2 text-gray-500">/go/{l.slug}</td>
                <td className="py-2">{l.clicks}</td>
                <td className="py-2">{l.active ? 'Yes' : 'No'}</td>
                <td className="py-2 text-right">
                  <span className="inline-flex gap-3">
                    <Link href={`/admin/affiliate-links/${l.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                      Edit
                    </Link>
                    <DeleteButton action={deleteAffiliateLink} id={l.id} />
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
