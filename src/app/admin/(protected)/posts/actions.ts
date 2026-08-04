'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminDb } from '@/lib/admin/db';
import { slugify, str, strOrNull } from '@/lib/admin/form';
import type { PublishStatus } from '@/lib/supabase/types';

export async function savePost(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  const title = str(formData, 'title').trim();
  const status: PublishStatus = str(formData, 'status') === 'published' ? 'published' : 'draft';
  const existingPublishedAt = strOrNull(formData, 'published_at');

  const values = {
    title,
    slug: str(formData, 'slug').trim() || slugify(title),
    market_id: str(formData, 'market_id'),
    excerpt: strOrNull(formData, 'excerpt'),
    body: strOrNull(formData, 'body'),
    meta_description: strOrNull(formData, 'meta_description'),
    author: strOrNull(formData, 'author'),
    cover_media_id: strOrNull(formData, 'cover_media_id'),
    status,
    published_at:
      status === 'published' ? existingPublishedAt ?? new Date().toISOString() : existingPublishedAt,
  };

  const { error } =
    id && id !== 'new'
      ? await db.from('posts').update(values).eq('id', id)
      : await db.from('posts').insert(values);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/posts');
  redirect('/admin/posts');
}

export async function deletePost(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  if (id) {
    const { error } = await db.from('posts').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  revalidatePath('/admin/posts');
}
