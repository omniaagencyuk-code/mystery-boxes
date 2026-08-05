'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminContext, adminContextWithRole } from '@/lib/admin/db';
import { logAudit } from '@/lib/admin/audit';
import { bool, slugify, str, strOrNull } from '@/lib/admin/form';

export async function saveAffiliateLink(formData: FormData) {
  const { db, admin } = await adminContext();
  const id = str(formData, 'id');
  const label = str(formData, 'label').trim();

  const values = {
    label,
    slug: str(formData, 'slug').trim() || slugify(label),
    target_url: str(formData, 'target_url').trim(),
    rel: str(formData, 'rel').trim() || 'sponsored nofollow',
    operator_id: strOrNull(formData, 'operator_id'),
    market_id: strOrNull(formData, 'market_id'),
    active: bool(formData, 'active'),
  };

  const { error } =
    id && id !== 'new'
      ? await db.from('affiliate_links').update(values).eq('id', id)
      : await db.from('affiliate_links').insert(values);
  if (error) throw new Error(error.message);

  await logAudit(db, admin, {
    action: id && id !== 'new' ? 'update' : 'create',
    entity: 'affiliate_link',
    entityId: id && id !== 'new' ? id : null,
    summary: label || null,
  });

  revalidatePath('/admin/affiliate-links');
  redirect('/admin/affiliate-links');
}

export async function deleteAffiliateLink(formData: FormData) {
  const { db, admin } = await adminContextWithRole(['admin']);
  const id = str(formData, 'id');
  if (id) {
    const { error } = await db.from('affiliate_links').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await logAudit(db, admin, { action: 'delete', entity: 'affiliate_link', entityId: id });
  }
  revalidatePath('/admin/affiliate-links');
}
