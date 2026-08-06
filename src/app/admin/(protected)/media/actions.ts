'use server';

import { randomUUID } from 'node:crypto';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminContext, adminContextWithRole } from '@/lib/admin/db';
import { logAudit } from '@/lib/admin/audit';
import { str, strOrNull } from '@/lib/admin/form';

const BUCKET = 'media';

// Allowlist of accepted image types mapped to a safe, fixed extension. SVG is
// intentionally excluded because it can carry scripts. The extension comes from
// this map, never from the uploaded filename, so a crafted filename cannot
// influence the stored object key.
const ALLOWED_TYPES = new Map<string, string>([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/avif', 'avif'],
]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function uploadError(message: string): never {
  redirect(`/admin/media?error=${encodeURIComponent(message)}`);
}

export async function uploadMedia(formData: FormData) {
  const { db, admin } = await adminContext();
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    uploadError('Choose a file to upload.');
  }

  if (file.size > MAX_BYTES) {
    uploadError('File is too large. The maximum is 5 MB.');
  }

  const ext = ALLOWED_TYPES.get(file.type);
  if (!ext) {
    uploadError('Unsupported file type. Upload a PNG, JPEG, WebP, GIF or AVIF image.');
  }

  const path = `${randomUUID()}.${ext}`;

  const { error: storageError } = await db.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (storageError) {
    // The most common cause is the storage bucket not existing yet, so point the
    // admin at the one-time setup rather than showing a raw driver message.
    const hint = /bucket|not found|does not exist/i.test(storageError.message)
      ? ' The media storage bucket may be missing. Run supabase/storage-setup.sql once in the Supabase SQL editor.'
      : '';
    uploadError(`Upload failed: ${storageError.message}.${hint}`);
  }

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
  if (error) {
    // Roll back the stored object so a failed record does not orphan a file.
    await db.storage.from(BUCKET).remove([path]);
    uploadError(`Could not save the media record: ${error.message}`);
  }

  await logAudit(db, admin, {
    action: 'create',
    entity: 'media',
    entityId: null,
    summary: strOrNull(formData, 'title') ?? file.name,
  });

  revalidatePath('/admin/media');
  redirect('/admin/media');
}

export async function updateMedia(formData: FormData) {
  const { db, admin } = await adminContext();
  const id = str(formData, 'id');
  const { error } = await db
    .from('media')
    .update({ title: strOrNull(formData, 'title'), alt: strOrNull(formData, 'alt') })
    .eq('id', id);
  if (error) throw new Error(error.message);

  await logAudit(db, admin, {
    action: 'update',
    entity: 'media',
    entityId: id,
    summary: strOrNull(formData, 'title'),
  });

  revalidatePath('/admin/media');
  redirect('/admin/media');
}

export async function deleteMedia(formData: FormData) {
  const { db, admin } = await adminContextWithRole(['admin']);
  const id = str(formData, 'id');
  if (!id) return;

  const { data: row } = await db.from('media').select('bucket, path').eq('id', id).maybeSingle();
  if (row) {
    await db.storage.from(row.bucket).remove([row.path]);
    const { error } = await db.from('media').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await logAudit(db, admin, { action: 'delete', entity: 'media', entityId: id });
  }
  revalidatePath('/admin/media');
}
