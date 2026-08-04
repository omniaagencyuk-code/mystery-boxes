'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminDb } from '@/lib/admin/db';
import { bool, str, strOrNull, timestampOrNull } from '@/lib/admin/form';

export async function saveOffer(formData: FormData) {
  const db = await adminDb();
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

  revalidatePath('/admin/offers');
  redirect('/admin/offers');
}

export async function deleteOffer(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  if (id) {
    const { error } = await db.from('offers').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  revalidatePath('/admin/offers');
}
