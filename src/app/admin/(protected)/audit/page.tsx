import { EmptyState, PageHeader } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function AuditLogPage() {
  const db = await adminPageClient();
  if (!db) return null;

  const { data: rows } = await db
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <PageHeader title="Audit log" />
      {!rows || rows.length === 0 ? (
        <EmptyState>No audit entries yet.</EmptyState>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2">When</th>
              <th className="py-2">Who</th>
              <th className="py-2">Action</th>
              <th className="py-2">Entity</th>
              <th className="py-2">Summary</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line align-top">
                <td className="py-2 whitespace-nowrap text-muted">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="py-2">{r.admin_email ?? '—'}</td>
                <td className="py-2">
                  <span className="inline-flex rounded bg-elevated px-2 py-0.5 text-xs text-muted">
                    {r.action}
                  </span>
                </td>
                <td className="py-2 text-muted">
                  {r.entity}
                  {r.entity_id ? ` · ${r.entity_id}` : ''}
                </td>
                <td className="py-2">{r.summary ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
