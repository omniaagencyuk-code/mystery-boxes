'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminContext, adminContextWithRole } from '@/lib/admin/db';
import { logAudit } from '@/lib/admin/audit';
import { bool, str, strOrNull, timestampOrNull } from '@/lib/admin/form';

export async function saveOffer(formData: FormData) {
  const { db, admin } = await adminContext();
  const id = str(formData, 'id');

  const values = {
    operator_id: str(formData, 'operator_id'),
    title: str(formData, 'title').trim(),
    code: strOrNull(formData, 'code'),
    description: strOrNull(formData, 'description'),
    terms: strOrNull(formData, 'terms'),
    starts_at: timestampOrNull(formData, 'starts_at'),
    expires_at: timestampOrNull(formData, 'expires_at'),
    active: bool(formData, 'active'),
  };

  const { error } =
    id && id !== 'new'
      ? await db.from('offers').update(values).eq('id', id)
      : await db.from('offers').insert(values);
  if (error) throw new Error(error.message);

  await logAudit(db, admin, {
    action: id && id !== 'new' ? 'update' : 'create',
    entity: 'offer',
    entityId: id && id !== 'new' ? id : null,
    summary: values.title || null,
  });

  revalidatePath('/admin/offers');
  redirect('/admin/offers');
}

export async function deleteOffer(formData: FormData) {
  const { db, admin } = await adminContextWithRole(['admin']);
  const id = str(formData, 'id');
  if (id) {
    const { error } = await db.from('offers').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await logAudit(db, admin, { action: 'delete', entity: 'offer', entityId: id });
  }
  revalidatePath('/admin/offers');
}
