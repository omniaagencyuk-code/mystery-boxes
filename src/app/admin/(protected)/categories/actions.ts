'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminDb } from '@/lib/admin/db';
import { slugify, str, strOrNull } from '@/lib/admin/form';

export async function saveCategory(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  const name = str(formData, 'name').trim();
  const slug = str(formData, 'slug').trim() || slugify(name);
  const marketRaw = str(formData, 'market_id').trim();

  const values = {
    name,
    slug,
    description: strOrNull(formData, 'description'),
    market_id: marketRaw || null, // empty means all markets
  };

  const { error } =
    id && id !== 'new'
      ? await db.from('categories').update(values).eq('id', id)
      : await db.from('categories').insert(values);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}

export async function deleteCategory(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  if (id) {
    const { error } = await db.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  revalidatePath('/admin/categories');
}
