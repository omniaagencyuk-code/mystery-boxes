'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminDb } from '@/lib/admin/db';
import { str, strOrNull } from '@/lib/admin/form';
import type { PublishStatus } from '@/lib/supabase/types';

export async function saveReview(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  const status: PublishStatus = str(formData, 'status') === 'published' ? 'published' : 'draft';
  const existingPublishedAt = strOrNull(formData, 'published_at');

  const values = {
    operator_id: str(formData, 'operator_id'),
    market_id: str(formData, 'market_id'),
    body: strOrNull(formData, 'body'),
    verdict: strOrNull(formData, 'verdict'),
    author: strOrNull(formData, 'author'),
    status,
    published_at:
      status === 'published' ? existingPublishedAt ?? new Date().toISOString() : existingPublishedAt,
  };

  const { error } =
    id && id !== 'new'
      ? await db.from('reviews').update(values).eq('id', id)
      : await db.from('reviews').insert(values);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/reviews');
  redirect('/admin/reviews');
}

export async function deleteReview(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  if (id) {
    const { error } = await db.from('reviews').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  revalidatePath('/admin/reviews');
}
