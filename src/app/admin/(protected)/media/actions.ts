'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminDb } from '@/lib/admin/db';
import { str, strOrNull } from '@/lib/admin/form';

const BUCKET = 'media';

export async function uploadMedia(formData: FormData) {
  const db = await adminDb();
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    redirect('/admin/media');
  }

  const dot = file.name.lastIndexOf('.');
  const ext = dot >= 0 ? file.name.slice(dot) : '';
  const path = `${crypto.randomUUID()}${ext}`;

  const { error: uploadError } = await db.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { data: pub } = db.storage.from(BUCKET).getPublicUrl(path);

  const { error } = await db.from('media').insert({
    bucket: BUCKET,
    path,
    url: pub.publicUrl,
    title: strOrNull(formData, 'title') ?? file.name,
    alt: strOrNull(formData, 'alt'),
    mime_type: file.type || null,
    size_bytes: file.size,
  });
  if (error) throw new Error(error.message);

  revalidatePath('/admin/media');
  redirect('/admin/media');
}

export async function updateMedia(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  const { error } = await db
    .from('media')
    .update({ title: strOrNull(formData, 'title'), alt: strOrNull(formData, 'alt') })
    .eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/media');
  redirect('/admin/media');
}

export async function deleteMedia(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  if (!id) return;

  const { data: row } = await db.from('media').select('bucket, path').eq('id', id).maybeSingle();
  if (row) {
    await db.storage.from(row.bucket).remove([row.path]);
    const { error } = await db.from('media').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  revalidatePath('/admin/media');
}
