import 'server-only';

import type { adminDb } from '@/lib/admin/db';
import type { AdminRow } from '@/lib/supabase/types';

type AdminClient = Awaited<ReturnType<typeof adminDb>>;

export interface AuditEntry {
  action: 'create' | 'update' | 'delete';
  entity: string;
  entityId?: string | null;
  summary?: string | null;
}

/**
 * Append an entry to the audit log. Best-effort: a logging failure must never
 * break the underlying admin action, so errors are swallowed.
 */
export async function logAudit(db: AdminClient, admin: AdminRow, entry: AuditEntry): Promise<void> {
  try {
    await db.from('audit_log').insert({
      admin_id: admin.id,
      admin_email: admin.email,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entityId ?? null,
      summary: entry.summary ?? null,
    });
  } catch {
    // Never block the action on an audit write.
  }
}
