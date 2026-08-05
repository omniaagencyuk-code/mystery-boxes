'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminDb } from '@/lib/admin/db';
import { slugify, str, strOrNull } from '@/lib/admin/form';
import type { PublishStatus } from '@/lib/supabase/types';

/** Resolve a media picker: a chosen media id's URL wins over a pasted URL. */
async function resolveMediaUrl(
  db: Awaited<ReturnType<typeof adminDb>>,
  formData: FormData,
  urlKey: string,
): Promise<string | null> {
  let url = strOrNull(formData, urlKey);
  const mediaId = strOrNull(formData, `${urlKey.replace(/_url$/, '')}_media_id`);
  if (mediaId) {
    const { data: media } = await db.from('media').select('url').eq('id', mediaId).maybeSingle();
    if (media?.url) url = media.url;
  }
  return url;
}

export async function savePage(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  const title = str(formData, 'title').trim();
  const status: PublishStatus = str(formData, 'status') === 'published' ? 'published' : 'draft';
  const existingPublishedAt = strOrNull(formData, 'published_at');
  const heroImageUrl = await resolveMediaUrl(db, formData, 'hero_image_url');

  const values = {
    title,
    slug: str(formData, 'slug').trim() || slugify(title),
    market_id: str(formData, 'market_id'),
    meta_description: strOrNull(formData, 'meta_description'),
    body: strOrNull(formData, 'body'),
    status,
    guide_category: strOrNull(formData, 'guide_category'),
    author: strOrNull(formData, 'author'),
    summary: strOrNull(formData, 'summary'),
    hero_image_url: heroImageUrl,
    // Stamp publish time the first time it goes live.
    published_at:
      status === 'published' ? existingPublishedAt ?? new Date().toISOString() : existingPublishedAt,
  };

  const { error } =
    id && id !== 'new'
      ? await db.from('pages').update(values).eq('id', id)
      : await db.from('pages').insert(values);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/pages');
  redirect('/admin/pages');
}

export async function deletePage(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  if (id) {
    const { error } = await db.from('pages').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  revalidatePath('/admin/pages');
}
